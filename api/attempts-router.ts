import { z } from "zod";
import { FORMAL_STATUSES, PROBLEM_ID_RE } from "@contracts/constants";
import { adminQuery, authedQuery, createRouter, publicQuery } from "./middleware";
import {
  insertAttempt,
  listApprovedAttempts,
  listAttemptsByUser,
  listBitsIndex,
  listLatestVerifications,
  listPendingAttempts,
  reviewAttempt,
  toggleVote,
} from "./queries/attempts";

const attemptSchema = z
  .object({
    problemId: z.string().regex(PROBLEM_ID_RE),
    kind: z.enum(["progress", "solution", "revision", "verification", "formal"]),
    title: z.string().min(4).max(300),
    content: z.string().min(20).max(5000),
    // 匿名投稿可自报署名；留空则匿名（登录态也接受，userId 会自动带上）
    authorName: z.string().trim().min(1).max(128).optional(),
    // 验证-收窄：kind='verification' 时必须给出收窄后的带证区间
    newBand: z.string().trim().min(1).max(80).optional(),
    // 形式化补证：kind='formal' 时必须给出目标 formal 状态
    formalStatus: z.enum(FORMAL_STATUSES).optional(),
    // 方法标签（可选）：自报技术族，供障碍图做方法→问题路由
    method: z.string().trim().min(1).max(80).optional(),
    // 思路与反思（可选）：怎么想到的、卡在哪、为什么失败——把账本变成研究日志
    narrative: z.string().trim().min(10).max(3000).optional(),
  })
  .refine((v) => v.kind !== "verification" || !!v.newBand, {
    message: "verification requires newBand",
    path: ["newBand"],
  })
  .refine((v) => v.kind !== "formal" || !!v.formalStatus, {
    message: "formal requires formalStatus",
    path: ["formalStatus"],
  });

export const attemptsRouter = createRouter({
  /** 任何人向已有问题提交进展/解答候选，无需登录 */
  submit: publicQuery
    .input(attemptSchema)
    .mutation(async ({ ctx, input }) => {
      const { problemId, kind, title, content, authorName, newBand, formalStatus, method, narrative } = input;
      await insertAttempt({
        problemId,
        kind,
        title,
        content,
        authorName,
        newBand,
        formalStatus,
        method,
        narrative,
        // 登录态才关联用户；匿名提交该字段为 null
        userId: ctx.user ? ctx.user.id : undefined,
      });
      return { ok: true };
    }),

  /** 某问题详情页展示的已通过候选 */
  approved: publicQuery
    .input(z.object({ problemId: z.string().regex(PROBLEM_ID_RE) }))
    .query(async ({ input }) => listApprovedAttempts(input.problemId)),

  /** 跨题最近的已验证收窄（公共成果），首页展示"谁收窄了哪个问题" */
  recentVerifications: publicQuery
    .input(z.object({ limit: z.number().int().min(1).max(50).optional() }))
    .query(async ({ input }) => listLatestVerifications(input.limit ?? 12)),

  /** 全库逐题累计 bits 索引：图谱节点编码 / 索引徽标 / 监测摘要的前置呈现 */
  bitsIndex: publicQuery.query(async () => listBitsIndex()),

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
