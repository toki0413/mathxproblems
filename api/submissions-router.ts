import { z } from "zod";
import { DOMAIN_IDS } from "@contracts/constants";
import { adminQuery, authedQuery, createRouter, publicQuery } from "./middleware";
import {
  createSubmission,
  listApprovedSubmissions,
  listPendingSubmissions,
  listSubmissionsByUser,
  reviewSubmission,
} from "./queries/submissions";

const proposalSchema = z.object({
  title: z.string().min(4).max(500),
  titleZh: z.string().min(2).max(500),
  domain: z.enum(DOMAIN_IDS),
  subdomain: z.string().max(120).default(""),
  statement: z.string().min(20),
  origin: z.string().min(20),
  obstacles: z.array(z.string().min(1)).min(1),
  impactDomains: z.array(z.string().min(1)).max(6).default([]),
  engineeringValue: z.string().max(4000).default(""),
  references: z.array(z.string().min(1)).max(12).default([]),
  note: z.string().max(2000).default(""),
});

export const submissionsRouter = createRouter({
  submit: authedQuery
    .input(proposalSchema)
    .mutation(async ({ ctx, input }) => {
      const { title, titleZh, domain, ...rest } = input;
      await createSubmission({
        userId: ctx.user.id,
        title,
        titleZh,
        domain,
        payload: JSON.stringify(rest),
      });
      return { ok: true };
    }),

  mine: authedQuery.query(async ({ ctx }) => {
    return listSubmissionsByUser(ctx.user.id);
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
