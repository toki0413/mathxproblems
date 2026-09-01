import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ErrorMessages } from "@contracts/constants";
import { env } from "./lib/env";
import { readAdminToken } from "./visitor";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const createRouter = t.router;
export const publicQuery = t.procedure;

// 匿名社区模型：审核接口不对社区用户开放，改由独立管理入口的 Bearer 令牌把关。
const requireAdmin = t.middleware((opts) => {
  const { ctx, next } = opts;
  const token = readAdminToken(ctx.req.headers);
  if (!env.adminToken || token !== env.adminToken) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: ErrorMessages.insufficientPermissions,
    });
  }
  return next({ ctx: { ...ctx, admin: true } });
});

export const adminQuery = publicQuery.use(requireAdmin);