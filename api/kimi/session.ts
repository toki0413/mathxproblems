import * as jose from "jose";
import { env } from "../lib/env";
import { Session } from "@contracts/constants";
import type { SessionPayload } from "./types";

const JWT_ALG = "HS256";

// 会话过期与 Session.maxAgeMs 保持一致：cookie 与 JWT 用同一时长，
// 避免"cookie 还在、token 先失效"或反之的错位。调整时长时改 constants.ts 即可。
function expiryInMs(): number {
  return Session.maxAgeMs;
}

export async function signSessionToken(
  payload: SessionPayload,
): Promise<string> {
  // 用独立 sessionSecret 签名，与 OAuth client_secret 隔离
  const secret = new TextEncoder().encode(env.sessionSecret);
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime(Math.round(expiryInMs() / 1000) + "s")
    .sign(secret);
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  if (!token) {
    console.warn("[session] No token provided for verification.");
    return null;
  }
  try {
    const secret = new TextEncoder().encode(env.sessionSecret);
    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: [JWT_ALG],
    });
    const { unionId, clientId } = payload;
    if (!unionId || !clientId) {
      console.warn("[session] JWT payload missing required fields.");
      return null;
    }
    return { unionId, clientId } as SessionPayload;
  } catch (error) {
    console.warn("[session] JWT verification failed:", error);
    return null;
  }
}
