import { and, asc, desc, eq, inArray, isNotNull, sql } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertProblemAttempt } from "@db/schema";
import { bandBits } from "@contracts/band";
import { getDb } from "./connection";

export async function insertAttempt(data: InsertProblemAttempt) {
  await getDb().insert(schema.problemAttempts).values(data);
}

/**
 * 为一组事件按「题内已通过验证收窄链」计算信息量增益（比特）。
 * 规则：同题按时间升序走链，每条 verification 相对上一条的 newBand 计
 * -log2(新宽/旧宽)；链首无可比基线（目录 certificate.certified_band 是
 * 描述性文字，不可解析），记 null。非 verification 事件一律 null。
 */
async function attachBandBits<
  T extends { id: number; problemId: string; kind: string; newBand: string | null },
>(rows: T[]): Promise<(T & { bits: number | null })[]> {
  const problemIds = [
    ...new Set(
      rows.filter((r) => r.kind === "verification" && r.newBand).map((r) => r.problemId),
    ),
  ];
  if (!problemIds.length) return rows.map((r) => ({ ...r, bits: null }));
  const chain = await getDb()
    .select({
      id: schema.problemAttempts.id,
      problemId: schema.problemAttempts.problemId,
      newBand: schema.problemAttempts.newBand,
    })
    .from(schema.problemAttempts)
    .where(
      and(
        eq(schema.problemAttempts.kind, "verification"),
        eq(schema.problemAttempts.status, "approved"),
        inArray(schema.problemAttempts.problemId, problemIds),
      ),
    )
    .orderBy(asc(schema.problemAttempts.createdAt), asc(schema.problemAttempts.id));
  const bitsById = new Map<number, number | null>();
  const lastBand = new Map<string, string>();
  for (const row of chain) {
    const prev = lastBand.get(row.problemId) ?? null;
    bitsById.set(row.id, row.newBand ? bandBits(prev, row.newBand) : null);
    if (row.newBand) lastBand.set(row.problemId, row.newBand);
  }
  return rows.map((r) => ({
    ...r,
    bits: r.kind === "verification" ? (bitsById.get(r.id) ?? null) : null,
  }));
}

/** 社区在详情页可看到的本问题已通过候选。匿名投稿用自报 authorName，登录用户回退到注册名 */
export async function listApprovedAttempts(problemId: string) {
  const rows = await getDb()
    .select({
      id: schema.problemAttempts.id,
      problemId: schema.problemAttempts.problemId,
      kind: schema.problemAttempts.kind,
      title: schema.problemAttempts.title,
      content: schema.problemAttempts.content,
      narrative: schema.problemAttempts.narrative,
      authorName: schema.problemAttempts.authorName,
      newBand: schema.problemAttempts.newBand,
      formalStatus: schema.problemAttempts.formalStatus,
      createdAt: schema.problemAttempts.createdAt,
      registeredName: schema.users.name,
      // 相关子查询统计票数；Postgres 对 GROUP BY 外的非聚合列做严格检查，
      // 用子查询替代 join+group by 计数，避免把全部输出列塞进 GROUP BY。
      voteCount: sql<number>`(
        select count(*) from ${schema.problemAttemptVotes}
        where ${schema.problemAttemptVotes.attemptId} = ${schema.problemAttempts.id}
      )`,
    })
    .from(schema.problemAttempts)
    .leftJoin(schema.users, eq(schema.problemAttempts.userId, schema.users.id))
    .where(
      and(
        eq(schema.problemAttempts.status, "approved"),
        eq(schema.problemAttempts.problemId, problemId),
      ),
    )
    .orderBy(
      desc(
        sql`(
          select count(*) from ${schema.problemAttemptVotes}
          where ${schema.problemAttemptVotes.attemptId} = ${schema.problemAttempts.id}
        )`,
      ),
      desc(schema.problemAttempts.createdAt),
    );
  // 匿名投稿用自报 authorName，登录投稿回退到注册名，并去掉内部 join 字段。
  // 附加题内收窄链的 bits，供详情页「收窄历程」区间尺标注每次的信息量增益。
  const named = rows.map(({ registeredName, voteCount, ...r }) => ({
    ...r,
    authorName: r.authorName ?? registeredName,
    votes: Number(voteCount),
  }));
  return attachBandBits(named);
}

/**
 * 切换某候选的投票：已投则取消，未投则投出。返回切换后的票数与是否处于已投态。
 * 匿名社区按 visitorId 计一人一票；(attemptId, visitorId) 部分唯一索引兜底并发重复票。
 */
export async function toggleVote(attemptId: number, visitorId: string) {
  const db = getDb();
  return db.transaction(async (tx) => {
    const existing = await tx
      .select()
      .from(schema.problemAttemptVotes)
      .where(
        and(
          eq(schema.problemAttemptVotes.attemptId, attemptId),
          eq(schema.problemAttemptVotes.visitorId, visitorId),
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
      await tx
        .insert(schema.problemAttemptVotes)
        .values({ attemptId, visitorId });
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
      kind: schema.problemAttempts.kind,
      title: schema.problemAttempts.title,
      authorName: schema.problemAttempts.authorName,
      registeredName: schema.users.name,
      newBand: schema.problemAttempts.newBand,
      method: schema.problemAttempts.method,
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
  const withNames = rows.map(({ registeredName, ...r }) => ({
    ...r,
    authorName: r.authorName ?? registeredName,
  }));
  return attachBandBits(withNames);
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
      method: schema.problemAttempts.method,
      createdAt: schema.problemAttempts.createdAt,
    })
    .from(schema.problemAttempts)
    .leftJoin(schema.users, eq(schema.users.id, schema.problemAttempts.userId))
    .where(
      and(
        inArray(schema.problemAttempts.kind, ["verification", "formal"]),
        eq(schema.problemAttempts.status, "approved"),
      ),
    )
    .orderBy(desc(schema.problemAttempts.createdAt))
    .limit(limit);
  const withNames = rows.map(({ registeredName, ...r }) => ({
    ...r,
    authorName: r.authorName ?? registeredName,
  }));
  return attachBandBits(withNames);
}

/**
 * 全库逐题的信息量索引：重走每题「已通过验证收窄链」累计正向 bits。
 * 供图谱节点大小编码、索引行徽标、监测摘要等把 bits 前置到导航层的场景。
 * 负收窄不倒扣累计（它仍是信息，方向在详情页区间尺表达）；链首无基线不计。
 */
export async function listBitsIndex() {
  const chain = await getDb()
    .select({
      problemId: schema.problemAttempts.problemId,
      newBand: schema.problemAttempts.newBand,
      createdAt: schema.problemAttempts.createdAt,
    })
    .from(schema.problemAttempts)
    .where(
      and(
        eq(schema.problemAttempts.kind, "verification"),
        eq(schema.problemAttempts.status, "approved"),
      ),
    )
    .orderBy(asc(schema.problemAttempts.createdAt), asc(schema.problemAttempts.id));
  const byProblem = new Map<
    string,
    { bits: number; verifications: number; lastBand: string | null; lastAt: Date | null }
  >();
  for (const row of chain) {
    const e = byProblem.get(row.problemId) ?? {
      bits: 0,
      verifications: 0,
      lastBand: null,
      lastAt: null,
    };
    e.verifications += 1;
    if (row.newBand) {
      const b = bandBits(e.lastBand, row.newBand);
      if (b != null && b > 0) e.bits += b;
      e.lastBand = row.newBand;
    }
    e.lastAt = row.createdAt;
    byProblem.set(row.problemId, e);
  }
  return [...byProblem.entries()].map(([problemId, e]) => ({
    problemId,
    bits: Math.round(e.bits * 100) / 100,
    verifications: e.verifications,
    lastBand: e.lastBand,
    lastAt: e.lastAt,
  }));
}

/** 全部已通过声明里带方法标签的（problemId, method），供障碍图做方法解锁路由。 */
export async function listMethodEvents() {
  return getDb()
    .select({
      problemId: schema.problemAttempts.problemId,
      method: schema.problemAttempts.method,
    })
    .from(schema.problemAttempts)
    .where(
      and(
        inArray(schema.problemAttempts.kind, ["verification", "formal"]),
        eq(schema.problemAttempts.status, "approved"),
        isNotNull(schema.problemAttempts.method),
      ),
    );
}

export async function listPendingAttempts() {
  return getDb()
    .select()
    .from(schema.problemAttempts)
    .where(eq(schema.problemAttempts.status, "pending"))
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
