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
  // 匿名投稿可自报署名；留空则匿名（登录态也接受，userId 会自动带上）
  authorName: z.string().trim().min(1).max(128).optional(),
});

export const attemptsRouter = createRouter({
  /** 任何人向已有问题提交进展/解答候选，无需登录 */
  submit: publicQuery
    .input(attemptSchema)
    .mutation(async ({ ctx, input }) => {
      const { problemId, kind, title, content, authorName } = input;
      await insertAttempt({
        problemId,
        kind,
        title,
        content,
        authorName,
        // 登录态才关联用户；匿名提交该字段为 null
        userId: ctx.user ? ctx.user.id : undefined,
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