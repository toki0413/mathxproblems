// 双桥写路径（方案 C 第一版，spec: docs/superpowers/specs/2026-08-30-dual-bridge-design.md §6）：
// 给外部 agent / 证明流水线一个不碰 tRPC 的薄 HTTP 门面，把「收窄（S 侧）」与
// 「补证（M 侧）」声明写入 problem_attempts 审稿账本，审批通过后进 feed.json。
// 默认闭门：CLAIMS_WRITE_ENABLED 未置 "1"/"true" 时一律 501；放开后与前端
// tRPC attempts.submit 走同一账本与同一审稿闭环，不产生第二份事实来源。
// 端点已注册但保持关闭，即 spec 的「端点可注册但返回 501/Not Implemented」。
import { Hono } from "hono";
import type { Context } from "hono";
import type { StatusCode } from "hono/utils/http-status";
import { z } from "zod";
import { FORMAL_STATUSES, PROBLEM_ID_RE } from "@contracts/constants";
import { Errors, type AppError } from "@contracts/errors";
import type { InsertProblemAttempt } from "@db/schema";
import { buildCatalog } from "./catalog.json";
import { env } from "./lib/env";
import { insertAttempt } from "./queries/attempts";

/** 写路径依赖注入：默认实现走真目录 + 真库，测试注入假实现。 */
export interface ClaimsWriteDeps {
  enabled: boolean;
  catalogHas: (id: string) => boolean;
  insert: (data: InsertProblemAttempt) => Promise<void>;
}

// 与 tRPC attempts.submit 的 newBand/content/authorName 约束同源。
const narrowSchema = z.object({
  // 收窄后的带证区间，如 "[1.52, 1.56]"
  band: z.string().trim().min(1).max(80),
  note: z.string().min(20).max(5000),
  authorName: z.string().trim().min(1).max(128).optional(),
});

const formalSchema = z.object({
  // 声称 formal_view.status 应迁移到的值（证成 / 反例 / 回到猜想）
  status: z.enum(FORMAL_STATUSES),
  note: z.string().min(20).max(5000),
  // 溯源：证明 / 反例出处（Lean file、预印本、benchmark entry 链接等）
  via: z.string().trim().min(1).max(300).optional(),
  authorName: z.string().trim().min(1).max(128).optional(),
});

export function createClaimsWriteApp(deps: ClaimsWriteDeps) {
  const app = new Hono();

  const reply = (c: Context, err: AppError): Response =>
    c.newResponse(JSON.stringify(err), err.status as StatusCode, {
      "Content-Type": "application/json; charset=utf-8",
    });

  // 门控先于一切校验：闭门时端点只声明存在，不对目录内容差异做出区分性响应。
  app.use("*", async (c, next) => {
    if (!deps.enabled) {
      return reply(
        c,
        Errors.notImplemented(
          "claims write path is closed; set CLAIMS_WRITE_ENABLED=1 to open the review-mediated write facade",
        ),
      );
    }
    await next();
  });

  const resolveId = (c: Context): string | Response => {
    const id = c.req.param("id");
    if (!PROBLEM_ID_RE.test(id)) {
      return reply(c, Errors.badRequest(`invalid problem id: ${id}`));
    }
    if (!deps.catalogHas(id)) {
      return reply(c, Errors.notFound(`unknown problem id: ${id}`));
    }
    return id;
  };

  app.post("/:id/narrow", async (c) => {
    const id = resolveId(c);
    if (id instanceof Response) return id;
    const parsed = narrowSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) {
      return reply(
        c,
        Errors.badRequest(parsed.error.issues[0]?.message ?? "invalid body"),
      );
    }
    const { band, note, authorName } = parsed.data;
    try {
      await deps.insert({
        problemId: id,
        kind: "verification",
        title: `narrow → ${band}`,
        content: note,
        authorName,
        newBand: band,
      });
    } catch {
      return reply(c, Errors.internal("attempt ledger unavailable"));
    }
    return c.json({ ok: true, queued: "pending_review" }, 202);
  });

  app.post("/:id/formal", async (c) => {
    const id = resolveId(c);
    if (id instanceof Response) return id;
    const parsed = formalSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) {
      return reply(
        c,
        Errors.badRequest(parsed.error.issues[0]?.message ?? "invalid body"),
      );
    }
    const { status, note, via, authorName } = parsed.data;
    try {
      await deps.insert({
        problemId: id,
        kind: "formal",
        title: `formal → ${status}`,
        content: via ? `${note}\n\nvia: ${via}` : note,
        authorName,
        formalStatus: status,
      });
    } catch {
      return reply(c, Errors.internal("attempt ledger unavailable"));
    }
    return c.json({ ok: true, queued: "pending_review" }, 202);
  });

  return app;
}

// 目录 id 存在性检查：静态目录是唯一事实来源，缓存一次即可
// （目录随部署更新，进程生命周期内不变）。
let catalogIds: Set<string> | undefined;
const catalogHas = (id: string): boolean => {
  catalogIds ??= new Set(buildCatalog().map((p) => p.id));
  return catalogIds.has(id);
};

/** 把双桥写路径门面挂到主 app（/api/v1/claims/:id/narrow|formal）。 */
export function registerClaimsWriteRoutes(app: Hono): void {
  app.route(
    "/api/v1/claims",
    createClaimsWriteApp({
      enabled: env.claimsWriteEnabled,
      catalogHas,
      insert: insertAttempt,
    }),
  );
}
