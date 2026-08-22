import { desc, eq, getTableColumns, innerJoin } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertProblemAttempt } from "@db/schema";
import { getDb } from "./connection";

export async function insertAttempt(data: InsertProblemAttempt) {
  await getDb().insert(schema.problemAttempts).values(data);
}

/** 社区在详情页可看到的本问题已通过候选（含作者名），按时间倒序 */
export async function listApprovedAttempts(problemId: string) {
  return getDb()
    .select({
      ...getTableColumns(schema.problemAttempts),
      authorName: schema.users.name,
    })
    .from(schema.problemAttempts)
    .innerJoin(schema.users, eq(schema.problemAttempts.userId, schema.users.id))
    .where(
      and(
        eq(schema.problemAttempts.status, "approved"),
        eq(schema.problemAttempts.problemId, problemId),
      ),
    )
    .orderBy(desc(schema.problemAttempts.createdAt));
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