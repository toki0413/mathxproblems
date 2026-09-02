// 自建评论区的查询层：评论即发即见（无审稿门槛），按问题拉取。
// 防滥用（限流/人机验证）在 comments-router 的 writeAllowed 层做，这里只读写。
import { asc, eq } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertProblemComment } from "@db/schema";
import { getDb } from "./connection";

/** 某问题的全部评论，按时间正序（从上到下即对话顺序）。 */
export async function listComments(problemId: string) {
  return getDb()
    .select({
      id: schema.problemComments.id,
      problemId: schema.problemComments.problemId,
      authorName: schema.problemComments.authorName,
      content: schema.problemComments.content,
      createdAt: schema.problemComments.createdAt,
    })
    .from(schema.problemComments)
    .where(eq(schema.problemComments.problemId, problemId))
    .orderBy(asc(schema.problemComments.createdAt), asc(schema.problemComments.id));
}

export async function insertComment(data: InsertProblemComment) {
  await getDb().insert(schema.problemComments).values(data);
}
