import { and, desc, eq, getTableColumns, leftJoin } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertProblemAttempt } from "@db/schema";
import { getDb } from "./connection";

export async function insertAttempt(data: InsertProblemAttempt) {
  await getDb().insert(schema.problemAttempts).values(data);
}

/** 社区在详情页可看到的本问题已通过候选。匿名投稿用自报 authorName，登录用户回退到注册名 */
export async function listApprovedAttempts(problemId: string) {
  const rows = await getDb()
    .select({
      ...getTableColumns(schema.problemAttempts),
      registeredName: schema.users.name,
    })
    .from(schema.problemAttempts)
    .leftJoin(schema.users, eq(schema.problemAttempts.userId, schema.users.id))
    .where(
      and(
        eq(schema.problemAttempts.status, "approved"),
        eq(schema.problemAttempts.problemId, problemId),
      ),
    )
    .orderBy(desc(schema.problemAttempts.createdAt));
  // 匿名投稿用自报 authorName，登录投稿回退到注册名，并去掉内部 join 字段
  return rows.map(({ registeredName, ...r }) => ({
    ...r,
    authorName: r.authorName ?? registeredName,
  }));
}

export async function listPendingAttempts() {
  return getDb()
    .select()
    .from(schema.problemAttempts)
    .where(eq(schema.problemAttempts.status, "pending"))
    .orderBy(desc(schema.problemAttempts.createdAt));
}

export async function listAttemptsByUser(userId: number) {
  return getDb()
    .select()
    .from(schema.problemAttempts)
    .where(eq(schema.problemAttempts.userId, userId))
    .orderBy(desc(schema.problemAttempts.createdAt));
}

export async function reviewAttempt(
  id: number,
  status: "approved" | "rejected",
  reviewerNote?: string,
) {
  await getDb()
    .update(schema.problemAttempts)
    .set({ status, reviewerNote: reviewerNote ?? null })
    .where(eq(schema.problemAttempts.id, id));
}