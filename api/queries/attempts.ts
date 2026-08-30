import { and, desc, eq, inArray, sql } from "drizzle-orm";
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
      id: schema.problemAttempts.id,
      kind: schema.problemAttempts.kind,
      title: schema.problemAttempts.title,
      content: schema.problemAttempts.content,
      authorName: schema.problemAttempts.authorName,
      newBand: schema.problemAttempts.newBand,
      formalStatus: schema.problemAttempts.formalStatus,
      createdAt: schema.problemAttempts.createdAt,
      registeredName: schema.users.name,
      voteCount: sql<number>`count(${schema.problemAttemptVotes.id})`,
    })
    .from(schema.problemAttempts)
    .leftJoin(schema.users, eq(schema.problemAttempts.userId, schema.users.id))
    .leftJoin(
      schema.problemAttemptVotes,
      eq(schema.problemAttempts.id, schema.problemAttemptVotes.attemptId),
    )
    .where(
      and(
        eq(schema.problemAttempts.status, "approved"),
        eq(schema.problemAttempts.problemId, problemId),
      ),
    )
    .groupBy(schema.problemAttempts.id, schema.users.id)
    .orderBy(desc(sql`count(${schema.problemAttemptVotes.id})`), desc(schema.problemAttempts.createdAt));
  // 匿名投稿用自报 authorName，登录投稿回退到注册名，并去掉内部 join 字段
  return rows.map(({ registeredName, voteCount, ...r }) => ({
    ...r,
    authorName: r.authorName ?? registeredName,
    votes: Number(voteCount),
  }));
}

/**
 * 切换某候选的投票：已投则取消，未投则投出。返回切换后的票数与是否处于已投态。
 * 唯一约束 (attemptId, userId) 兜底并发重复票；计数与投票记录在同一事务里保证一致。
 */
export async function toggleVote(attemptId: number, userId: number) {
  const db = getDb();
  return db.transaction(async (tx) => {
    const existing = await tx
      .select()
      .from(schema.problemAttemptVotes)
      .where(
        and(
          eq(schema.problemAttemptVotes.attemptId, attemptId),
          eq(schema.problemAttemptVotes.userId, userId),
        ),
      )
      .limit(1);

    const updateVotes = (delta: number) =>
      tx
        .update(schema.problemAttempts)
        .set({ votes: sql`${schema.problemAttempts.votes} + ${delta}` })
        .where(eq(schema.problemAttempts.id, attemptId));

    let voted: boolean;
    if (existing.length) {
      await tx
        .delete(schema.problemAttemptVotes)
        .where(eq(schema.problemAttemptVotes.id, existing[0].id));
      await updateVotes(-1);
      voted = false;
    } else {
      await tx.insert(schema.problemAttemptVotes).values({ attemptId, userId });
      await updateVotes(1);
      voted = true;
    }

    const [row] = await tx
      .select({ votes: schema.problemAttempts.votes })
      .from(schema.problemAttempts)
      .where(eq(schema.problemAttempts.id, attemptId));
    return { votes: Number(row?.votes ?? 0), voted };
  });
}

/** 跨题聚合的已通过验证收窄（方向：公共成果），供首页/周报展示"谁收窄了哪个问题"。 */
export async function listLatestVerifications(limit = 12) {
  const rows = await getDb()
    .select({
      id: schema.problemAttempts.id,
      problemId: schema.problemAttempts.problemId,
      title: schema.problemAttempts.title,
      authorName: schema.problemAttempts.authorName,
      registeredName: schema.users.name,
      newBand: schema.problemAttempts.newBand,
      createdAt: schema.problemAttempts.createdAt,
    })
    .from(schema.problemAttempts)
    .leftJoin(schema.users, eq(schema.problemAttempts.userId, schema.users.id))
    .where(
      and(
        eq(schema.problemAttempts.kind, "verification"),
        eq(schema.problemAttempts.status, "approved"),
      ),
    )
    .orderBy(desc(schema.problemAttempts.createdAt))
    .limit(limit);
  return rows.map(({ registeredName, ...r }) => ({
    ...r,
    authorName: r.authorName ?? registeredName,
  }));
}

/**
 * 双桥声明的公共变更 feed：已通过的带证收窄（S 侧，kind='verification'）与
 * 形式化补证（M 侧，kind='formal'），供下游 agent/prover 流水线增量同步。
 * 对应 spec docs/superpowers/specs/2026-08-30-dual-bridge-design.md §6 同步节：
 * feed 从「覆盖 narrow 收窄」扩展为「覆盖 narrow + formal 补证」。
 */
export async function listLatestClaimEvents(limit = 20) {
  const rows = await getDb()
    .select({
      id: schema.problemAttempts.id,
      problemId: schema.problemAttempts.problemId,
      kind: schema.problemAttempts.kind,
      title: schema.problemAttempts.title,
      authorName: schema.problemAttempts.authorName,
      registeredName: schema.users.name,
      newBand: schema.problemAttempts.newBand,
      formalStatus: schema.problemAttempts.formalStatus,
      createdAt: schema.problemAttempts.createdAt,
    })
    .from(schema.problemAttempts)
    .leftJoin(schema.users, eq(schema.problemAttempts.userId, schema.users.id))
    .where(
      and(
        inArray(schema.problemAttempts.kind, ["verification", "formal"]),
        eq(schema.problemAttempts.status, "approved"),
      ),
    )
    .orderBy(desc(schema.problemAttempts.createdAt))
    .limit(limit);
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
