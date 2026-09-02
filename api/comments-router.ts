// 自建评论区 tRPC 路由：匿名访客即发即见，防滥用复用统一的写治理
// （writeAllowed：访客+IP 双限流 + 可选 Turnstile）。
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { PROBLEM_ID_RE } from "@contracts/constants";
import { createRouter, publicQuery } from "./middleware";
import { writeAllowed } from "./visitor";
import { insertComment, listComments } from "./queries/comments";

const commentSchema = z.object({
  problemId: z.string().regex(PROBLEM_ID_RE),
  content: z.string().trim().min(1).max(2000),
  // 自报署名，可选；留空则匿名
  authorName: z.string().trim().min(1).max(128).optional(),
  // 人机验证令牌（配了 TURNSTILE_SECRET 后必填）
  captchaToken: z.string().min(1).max(2048).optional(),
});

export const commentsRouter = createRouter({
  /** 某问题的评论列表（即发即见，无需审核） */
  list: publicQuery
    .input(z.object({ problemId: z.string().regex(PROBLEM_ID_RE) }))
    .query(async ({ input }) => listComments(input.problemId)),

  /** 匿名发布评论；限流命中返回 429 */
  submit: publicQuery
    .input(commentSchema)
    .mutation(async ({ ctx, input }) => {
      if (!(await writeAllowed(ctx.req.headers, ctx.visitorId, input.captchaToken))) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Slow down or captcha required",
        });
      }
      await insertComment({
        problemId: input.problemId,
        authorName: input.authorName,
        content: input.content,
        visitorId: ctx.visitorId,
      });
      return { ok: true };
    }),
});
