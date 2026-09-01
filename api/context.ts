import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { readVisitorId, ensureVisitorId } from "./visitor";

export type TrpcContext = {
  req: Request;
  /** 伪匿名访客 ID：由 Hono 中间层在第一个请求时签发进 httpOnly cookie，之后所有请求复用。 */
  visitorId: string;
  /** 是否持有独立管理入口的令牌（adminQuery 设置）。 */
  admin: boolean;
};

// 由 boot.ts 的 Hono 中间层把本次请求签发的访客 ID 盖戳到 Request 上，
// 使 tRPC 上下文的 visitorId 与最终写入浏览器 cookie 的 ID 保持一致（确定性、无竞态）。
const HAVE_VISITOR = "__visitorId";

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const stamped = (opts.req as Request & { [HAVE_VISITOR]?: string })[HAVE_VISITOR];
  const visitorId =
    stamped ??
    readVisitorId(opts.req.headers) ??
    ensureVisitorId(opts.req.headers, new Headers());
  return { req: opts.req, visitorId, admin: false };
}