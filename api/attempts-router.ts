import { z } from "zod";
import { adminQuery, authedQuery, createRouter, publicQuery } from "./middleware";
import {
  insertAttempt,
  listApprovedAttempts,
  listAttemptsByUser,
  listPendingAttempts,
  reviewAttempt,
} from "./queries/attempts";

const attemptSchema = z.object({
  problemId: z.string().min(3).max(32),
  kind: z.enum(["progress", "solution", "revision"]),
  title: z.string().min(4).max(300),
  content: z.string().min(20).max(5000),
});

export const attemptsRouter = createRouter({
  /** 登录用户向已有问题提交进展/解答候选 */
  submit: authedQuery
    .input(attemptSchema)
    .mutation(async ({ ctx, input }) => {
      const { problemId, kind, title, content } = input;
      await insertAttempt({
        problemId,
        kind,
        title,
        content,
        userId: ctx.user.id,
      });
      return { ok: true };
    }),

  /** 某问题详情页展示的已通过候选 */
  approved: publicQuery
    .input(z.object({ problemId: z.string().min(3).max(32) }))
    .query(async ({ input }) => listApprovedAttempts(input.problemId)),

  mine: authedQuery.query(async ({ ctx }) => listAttemptsByUser(ctx.user.id)),

  pending: adminQuery.query(async () => listPendingAttempts()),

  review: adminQuery
    .input(
      z.object({
        id: z.number().int().positive(),
        status: z.enum(["approved", "rejected"]),
        reviewerNote: z.string().max(2000).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      await reviewAttempt(input.id, input.status, input.reviewerNote);
      return { ok: true };
    }),
});