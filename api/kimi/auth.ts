import type { Context } from "hono";
import { setCookie, getCookie } from "hono/cookie";
import * as jose from "jose";
import * as cookie from "cookie";
import { env } from "../lib/env";
import { getSessionCookieOptions } from "../lib/cookies";
import { Session, OAuthState } from "@contracts/constants";
import { Errors } from "@contracts/errors";
import { signSessionToken, verifySessionToken } from "./session";
import { users as kimiUsers } from "./platform";
import { findUserByUnionId, upsertUser } from "../queries/users";
import type { TokenResponse } from "./types";

async function exchangeAuthCode(
  code: string,
  redirectUri: string,
): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: env.appId,
    redirect_uri: redirectUri,
    client_secret: env.appSecret,
  });

  const resp = await fetch(`${env.kimiAuthUrl}/api/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Token exchange failed (${resp.status}): ${text}`);
  }

  return resp.json() as Promise<TokenResponse>;
}

const jwks = jose.createRemoteJWKSet(
  new URL(`${env.kimiAuthUrl}/api/.well-known/jwks.json`),
);

async function verifyAccessToken(
  accessToken: string,
): Promise<{ userId: string; clientId: string }> {
  const { payload } = await jose.jwtVerify(accessToken, jwks);
  const userId = payload.user_id as string;
  const clientId = payload.client_id as string;
  if (!userId) {
    throw new Error("user_id missing from access token");
  }
  return { userId, clientId };
}

export async function authenticateRequest(headers: Headers) {
  const cookies = cookie.parse(headers.get("cookie") || "");
  const token = cookies[Session.cookieName];
  if (!token) {
    console.warn("[auth] No session cookie found in request.");
    throw Errors.forbidden("Invalid authentication token.");
  }
  const claim = await verifySessionToken(token);
  if (!claim) {
    throw Errors.forbidden("Invalid authentication token.");
  }
  const user = await findUserByUnionId(claim.unionId);
  if (!user) {
    throw Errors.forbidden("User not found. Please re-login.");
  }
  return user;
}

// 平台的 base64url 编解码：Node 20+ 与 Cloudflare Workers 都有 btoa/atob，
// 避免依赖 node:buffer（Workers 打包时不引入 node polyfill）。
const toB64Url = (bin: string) =>
  btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64Url = (s: string) => {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  return atob(b64);
};

// 登录入口：签发一次性 CSRF state（随机 nonce，httpOnly cookie 存之），
// 前端拿到 state 再跳转 Kimi 授权。回调比对 state 与 cookie，确保是同一浏览器发起的流。
export function createOAuthInitHandler() {
  return async (c: Context) => {
    const nonce = toB64Url(crypto.getRandomValues(new Uint8Array(16)).join(","));
    const redirectUri = `${new URL(c.req.url).origin}/api/oauth/callback`;
    // state 同时携带 nonce 与回调地址；回调 decode 后用 nonce 校验、用地址换 token
    const state = toB64Url(`${nonce}|${redirectUri}`);

    const cookieOpts = getSessionCookieOptions(c.req.raw.headers);
    setCookie(c, OAuthState.cookieName, nonce, {
      ...cookieOpts,
      path: "/",
      maxAge: OAuthState.maxAgeMs / 1000,
    });

    return c.json({ state });
  };
}

export function createOAuthCallbackHandler() {
  return async (c: Context) => {
    const code = c.req.query("code");
    const state = c.req.query("state");
    const error = c.req.query("error");
    const errorDescription = c.req.query("error_description");

    if (error) {
      if (error === "access_denied") {
        return c.redirect("/", 302);
      }
      return c.json(
        { error, error_description: errorDescription },
        400,
      );
    }

    if (!code || !state) {
      return c.json({ error: "code and state are required" }, 400);
    }

    // CSRF 校验：state 必须携带我们签发的 nonce 且与 cookie 一致；不匹配即拒绝。
    // 一次性：校验通过后就清除 cookie，防止重放。
    const expected = getCookie(c, OAuthState.cookieName);
    let nonce = "";
    let redirectUri = "";
    try {
      const decoded = fromB64Url(state);
      const sep = decoded.indexOf("|");
      nonce = decoded.slice(0, sep);
      redirectUri = decoded.slice(sep + 1);
    } catch {
      // fall through to the mismatch branch below
    }
    if (!expected || !nonce || nonce !== expected || !redirectUri.startsWith("http")) {
      return c.json({ error: "state validation failed" }, 400);
    }
    const oauthCookieOpts = getSessionCookieOptions(c.req.raw.headers);
    setCookie(c, OAuthState.cookieName, "", {
      ...oauthCookieOpts,
      path: "/",
      maxAge: 0,
    });

    try {
      const tokenResp = await exchangeAuthCode(code, redirectUri);
      const { userId } = await verifyAccessToken(tokenResp.access_token);
      const userProfile = await kimiUsers.getProfile(tokenResp.access_token);
      if (!userProfile) {
        throw new Error("Failed to fetch user profile from Kimi Open");
      }

      await upsertUser({
        unionId: userId,
        name: userProfile.name,
        avatar: userProfile.avatar_url,
        lastSignInAt: new Date(),
      });

      const token = await signSessionToken({
        unionId: userId,
        clientId: env.appId,
      });

      const cookieOpts = getSessionCookieOptions(c.req.raw.headers);
      setCookie(c, Session.cookieName, token, {
        ...cookieOpts,
        maxAge: Session.maxAgeMs / 1000,
      });

      return c.redirect("/", 302);
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      return c.json({ error: "OAuth callback failed" }, 500);
    }
  };
}

export { exchangeAuthCode, verifyAccessToken };
