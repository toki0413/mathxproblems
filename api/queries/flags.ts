// 社区红旗的查询层：即发即见（无审稿门槛），按问题拉取。
// 防滥用（限流/人机验证）在 flags-router 的 writeAllowed 层做，这里只读写。
import { asc, eq } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertProblemFlag } from "@db/schema";
import { getDb } from "./connection";

/** 某问题的全部红旗，按时间正序。 */
export async function listFlags(problemId: string) {
  return getDb()
    .select({
      id: schema.problemFlags.id,
      problemId: schema.problemFlags.problemId,
      authorName: schema.problemFlags.authorName,
      flagType: schema.problemFlags.flagType,
      content: schema.problemFlags.content,
      createdAt: schema.problemFlags.createdAt,
    })
    .from(schema.problemFlags)
    .where(eq(schema.problemFlags.problemId, problemId))
    .orderBy(asc(schema.problemFlags.createdAt), asc(schema.problemFlags.id));
}

export async function insertFlag(data: InsertProblemFlag) {
  await getDb().insert(schema.problemFlags).values(data);
}
