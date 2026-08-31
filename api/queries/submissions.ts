import { desc, eq, getTableColumns } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertSubmission } from "@db/schema";
import { getDb } from "./connection";

export async function createSubmission(data: InsertSubmission) {
  await getDb().insert(schema.submissions).values(data);
}

export async function listPendingSubmissions() {
  return getDb()
    .select()
    .from(schema.submissions)
    .where(eq(schema.submissions.status, "pending"))
    .orderBy(desc(schema.submissions.createdAt));
}

export async function listApprovedSubmissions() {
  const rows = await getDb()
    .select({
      ...getTableColumns(schema.submissions),
      registeredName: schema.users.name,
    })
    .from(schema.submissions)
    .leftJoin(schema.users, eq(schema.submissions.userId, schema.users.id))
    .where(eq(schema.submissions.status, "approved"))
    .orderBy(desc(schema.submissions.createdAt));
  // 匿名投稿用自报 authorName，存量登录投稿回退到注册名。
  return rows.map(({ registeredName, ...r }) => ({
    ...r,
    authorName: r.authorName ?? registeredName,
  }));
}

export async function reviewSubmission(
  id: number,
  status: "approved" | "rejected",
  reviewerNote?: string,
) {
  await getDb()
    .update(schema.submissions)
    .set({ status, reviewerNote: reviewerNote ?? null })
    .where(eq(schema.submissions.id, id));
}
