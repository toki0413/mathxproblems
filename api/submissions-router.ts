import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { DOMAIN_IDS } from "@contracts/constants";
import { adminQuery, createRouter, publicQuery } from "./middleware";
import { writeAllowed } from "./visitor";
import {
  createSubmission,
  listApprovedSubmissions,
  listPendingSubmissions,
  reviewSubmission,
} from "./queries/submissions";

const proposalSchema = z.object({
  title: z.string().min(4).max(500),
  titleZh: z.string().max(500).optional(),
  domain: z.enum(DOMAIN_IDS),
  subdomain: z.string().max(120).default(""),
  statement: z.string().min(20),
  origin: z.string().min(20),
  obstacles: z.array(z.string().min(1)).min(1),
  impactDomains: z.array(z.string().min(1)).max(6).default([]),
  engineeringValue: z.string().max(4000).default(""),
  references: z.array(z.string().min(1)).max(12).default([]),
  note: z.string().max(2000).default(""),
  // 匿名投稿可自报署名；留空则匿名
  authorName: z.string().trim().min(1).max(128).optional(),
  // 人机验证令牌（配了 TURNSTILE_SECRET 后必填）
  captchaToken: z.string().min(1).max(2048).optional(),
});

export const submissionsRouter = createRouter({
  /** 任何人投新问题，无需登录；以伪匿名访客身份写入 */
  submit: publicQuery
    .input(proposalSchema)
    .mutation(async ({ ctx, input }) => {
      if (!(await writeAllowed(ctx.req.headers, ctx.visitorId, input.captchaToken))) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Slow down or captcha required" });
      }
      const { title, domain, authorName, ...rest } = input;
      await createSubmission({
        title,
        titleZh: input.titleZh ?? "",
        domain,
        authorName,
        visitorId: ctx.visitorId,
        payload: JSON.stringify(rest),
      });
      return { ok: true };
    }),

  approved: publicQuery.query(async () => {
    return listApprovedSubmissions();
  }),

  /** 供审核页生成入库片段用：已通过投稿的完整 payload */
  approvedAdmin: adminQuery.query(async () => {
    return listApprovedSubmissions();
  }),

  pending: adminQuery.query(async () => {
    return listPendingSubmissions();
  }),

  review: adminQuery
    .input(
      z.object({
        id: z.number().int().positive(),
        status: z.enum(["approved", "rejected"]),
        reviewerNote: z.string().max(2000).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      await reviewSubmission(input.id, input.status, input.reviewerNote);
      return { ok: true };
    }),
});