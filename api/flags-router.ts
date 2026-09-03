// 社区红旗 tRPC 路由：匿名访客对目录问题的可信度质疑，即发即见。
// 防滥用复用统一的写治理（writeAllowed：访客+IP 双限流 + 可选 Turnstile）。
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { PROBLEM_ID_RE } from "@contracts/constants";
import { createRouter, publicQuery } from "./middleware";
import { writeAllowed } from "./visitor";
import { insertFlag, listFlags } from "./queries/flags";

/** 红旗类型（与 db/schema 的 flagTypeEnum 同序；z.enum 需字符串字面量元组）。 */
export const FLAG_TYPES = ["statement", "solved", "attribution", "rating", "other"] as const;

const flagSchema = z.object({
  problemId: z.string().regex(PROBLEM_ID_RE),
  flagType: z.enum(FLAG_TYPES),
  content: z.string().trim().min(1).max(2000),
  // 自报署名，可选；留空则匿名
  authorName: z.string().trim().min(1).max(128).optional(),
  // 人机验证令牌（配了 TURNSTILE_SECRET 后必填）
  captchaToken: z.string().min(1).max(2048).optional(),
});

export const flagsRouter = createRouter({
  /** 某问题的红旗列表（即发即见，公开可复核） */
  list: publicQuery
    .input(z.object({ problemId: z.string().regex(PROBLEM_ID_RE) }))
    .query(async ({ input }) => listFlags(input.problemId)),

  /** 匿名提交红旗；限流命中返回 429 */
  submit: publicQuery
    .input(flagSchema)
    .mutation(async ({ ctx, input }) => {
      if (!(await writeAllowed(ctx.req.headers, ctx.visitorId, input.captchaToken))) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Slow down or captcha required",
        });
      }
      await insertFlag({
        problemId: input.problemId,
        flagType: input.flagType,
        authorName: input.authorName,
        content: input.content,
        visitorId: ctx.visitorId,
      });
      return { ok: true };
    }),
});
