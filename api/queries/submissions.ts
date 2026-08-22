import { desc, eq, getTableColumns, innerJoin } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertSubmission } from "@db/schema";
import { getDb } from "./connection";

export async function createSubmission(data: InsertSubmission) {
  await getDb().insert(schema.submissions).values(data);
}

export async function listSubmissionsByUser(userId: number) {
  return getDb()
    .select()
    .from(schema.submissions)
    .where(eq(schema.submissions.userId, userId))
    .orderBy(desc(schema.submissions.createdAt));
}

export async function listPendingSubmissions() {
  return getDb()
    .select()
    .from(schema.submissions)
    .where(eq(schema.submissions.status, "pending"))
    .orderBy(desc(schema.submissions.createdAt));
}

export async function listApprovedSubmissions() {
  return getDb()
    .select({
      ...getTableColumns(schema.submissions),
      authorName: schema.users.name,
    })
    .from(schema.submissions)
    .innerJoin(schema.users, eq(schema.submissions.userId, schema.users.id))
    .where(eq(schema.submissions.status, "approved"))
    .orderBy(desc(schema.submissions.createdAt));
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
