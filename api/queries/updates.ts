import { desc, eq, getTableColumns, innerJoin } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertProblemUpdate } from "@db/schema";
import { getDb } from "./connection";

export async function insertProblemUpdate(data: InsertProblemUpdate) {
  await getDb().insert(schema.problemUpdates).values(data);
}

/** 有更新记录的问题 id 集合，供图上做「近期有进展」标记 */
export async function listUpdatedProblemIds() {
  const rows = await getDb()
    .select({ problemId: schema.problemUpdates.problemId })
    .from(schema.problemUpdates)
    .groupBy(schema.problemUpdates.problemId);
  return rows.map((r) => r.problemId);
}

export async function listProblemUpdates(problemId: string) {
  return getDb()
    .select({
      ...getTableColumns(schema.problemUpdates),
      authorName: schema.users.name,
    })
    .from(schema.problemUpdates)
    .innerJoin(schema.users, eq(schema.problemUpdates.userId, schema.users.id))
    .where(eq(schema.problemUpdates.problemId, problemId))
    .orderBy(desc(schema.problemUpdates.createdAt));
}