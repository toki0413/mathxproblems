import { z } from "zod";
import { PROBLEM_ID_RE } from "@contracts/constants";
import { adminQuery, authedQuery, createRouter, publicQuery } from "./middleware";
import {
  insertAttempt,
  listApprovedAttempts,
  listAttemptsByUser,
  listPendingAttempts,
  reviewAttempt,
  toggleVote,
} from "./queries/attempts";

const attemptSchema = z
  .object({
    problemId: z.string().regex(PROBLEM_ID_RE),
    kind: z.enum(["progress", "solution", "revision", "verification"]),
    title: z.string().min(4).max(300),
    content: z.string().min(20).max(5000),
    // 匿名投稿可自报署名；留空则匿名（登录态也接受，userId 会自动带上）
    authorName: z.string().trim().min(1).max(128).optional(),
    // 验证-收窄：kind='verification' 时必须给出收窄后的带证区间
    newBand: z.string().trim().min(1).max(80).optional(),
  })
  .refine((v) => v.kind !== "verification" || !!v.newBand, {
    message: "verification requires newBand",
    path: ["newBand"],
  });

export const attemptsRouter = createRouter({
  /** 任何人向已有问题提交进展/解答候选，无需登录 */
  submit: publicQuery
    .input(attemptSchema)
    .mutation(async ({ ctx, input }) => {
      const { problemId, kind, title, content, authorName, newBand } = input;
      await insertAttempt({
        problemId,
        kind,
        title,
        content,
        authorName,
        newBand,
        // 登录态才关联用户；匿名提交该字段为 null
        userId: ctx.user ? ctx.user.id : undefined,
      });
      return { ok: true };
    }),

  /** 某问题详情页展示的已通过候选 */
  approved: publicQuery
    .input(z.object({ problemId: z.string().regex(PROBLEM_ID_RE) }))
    .query(async ({ input }) => listApprovedAttempts(input.problemId)),

  mine: authedQuery.query(async ({ ctx }) => listAttemptsByUser(ctx.user.id)),

  /** 登录用户对某个已通过候选投/撤一票（切换式），返回最新票数与已投态 */
  vote: authedQuery
    .input(z.object({ attemptId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) =>
      toggleVote(input.attemptId, ctx.user.id),
    ),

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