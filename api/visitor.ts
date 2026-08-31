// 伪匿名访客身份层（匿名社区不用登录也能发言的核心）：
//   - 服务端签发随机 UUID 存进 httpOnly cookie，可关联同一设备多次发帖，
//     供限流 / 一人一票 / 内容追溯，但不暴露任何真实身份。
//   - 附带两颗治理螺母：按访客/按 IP 的内存限流，与 Cloudflare Turnstile
//     人机验证（配了 TURNSTILE_SECRET 才启用）。
import * as cookie from "cookie";
import { Visitor, AdminAuth } from "@contracts/constants";
import { env } from "./lib/env";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

function isLocalhost(headers: Headers): boolean {
  const host = headers.get("host") ?? "";
  return host.startsWith("localhost:") || host.startsWith("127.0.0.1:");
}

/** 读访客 cookie；无效/缺失返回 null。 */
export function readVisitorId(headers: Headers): string | null {
  const parsed = cookie.parse(headers.get("cookie") ?? "");
  const value = parsed[Visitor.cookieName];
  return value && UUID_RE.test(value) ? value : null;
}

/**
 * 保证本次请求带一个合法的访客 ID：已有则复用，没有则签发并写入响应 cookie。
 * 副作用（set-cookie 头）追加到 resHeaders，由调用方随响应一并回写。
 */
export function ensureVisitorId(headers: Headers, resHeaders: Headers): string {
  const existing = readVisitorId(headers);
  if (existing) return existing;
  const id = crypto.randomUUID();
  const localhost = isLocalhost(headers);
  resHeaders.append(
    "set-cookie",
    cookie.serialize(Visitor.cookieName, id, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: !localhost,
      maxAge: Math.floor(Visitor.maxAgeMs / 1000),
    }),
  );
  return id;
}

/** 解析客户端真实 IP：优先 Cloudflare 注入头，回退 X-Forwarded-For 首段。 */
export function clientIp(headers: Headers): string {
  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp) return cfIp;
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return "0.0.0.0";
}

/**
 * 内存限流（滑动计数窗）。注意：Workers 无跨孤立运行实例的可靠共享内存，
 * 此实现为单实例内的粗略护栏；生产要真正全局限流应改用 Cloudflare 自带的
 * Rate Limiting 规则或 Durable Object 计数。命中上限返回 false。
 */
const buckets = new Map<string, { count: number; ts: number }>();
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const cur = buckets.get(key);
  if (!cur || now - cur.ts > windowMs) {
    buckets.set(key, { count: 1, ts: now });
    return true;
  }
  if (cur.count >= limit) return false;
  cur.count += 1;
  return true;
}

/**
 * Cloudflare Turnstile 人机验证：配置了 TURNSTILE_SECRET 才启用；未配置直接放行。
 * 返回 false 拒绝此次写操作；remoteip 交给 Turnstile 做风控。
 */
export async function verifyTurnstile(
  token: string | undefined,
  headers: Headers,
): Promise<boolean> {
  if (!env.turnstileSecret) return true;
  if (!token) return false;
  const form = new URLSearchParams({
    secret: env.turnstileSecret,
    response: token,
  });
  form.set("remoteip", clientIp(headers));
  const resp = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form,
  });
  const json = (await resp.json().catch(() => null)) as { success?: boolean } | null;
  return json?.success === true;
}

/** 审核接口从请求头校验 Bearer 管理员令牌。 */
export function readAdminToken(headers: Headers): string {
  const value = headers.get(AdminAuth.header) ?? "";
  return value.startsWith(AdminAuth.scheme)
    ? value.slice(AdminAuth.scheme.length).trim()
    : "";
}

/**
 * 匿名写接口的统一治理开关：访客+IP 双限流 + 人机验证。
 * 配置了 TURNSTILE_SECRET 时要求 captchaToken 校验通过；返回 false 即拒绝本次写入。
 */
export async function writeAllowed(
  headers: Headers,
  visitorId: string,
  captchaToken?: string,
): Promise<boolean> {
  const ip = clientIp(headers);
  const ipOk = rateLimit(`write-ip:${ip}`, 30, 60_000);
  const visitorOk = rateLimit(`write-visitor:${visitorId}`, 10, 60_000);
  if (!ipOk || !visitorOk) return false;
  return verifyTurnstile(captchaToken, headers);
}