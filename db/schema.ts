import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ── SQLite (Cloudflare D1) 方言 ──────────────────────────────────────
// 原 schema 为 PostgreSQL（pg-core + bigint + serial + pgEnum）。为部署到
// Cloudflare Pages 原生 D1 存储，全部改写成 sqlite-core：
//   - serial / bigint → integer
//   - timestamp → integer (unix 秒, mode: "timestamp")
//   - pgEnum → text + 运行时校验（drizzle sqlite 用 .$type 约束）

const roleEnum = ["user", "admin"] as const;
const submissionStatusEnum = ["pending", "approved", "rejected"] as const;
const attemptKindEnum = [
  "progress",
  "solution",
  "revision",
  "verification",
  "formal",
] as const;
const formalStatusEnum = ["provable", "conjectured", "refuted"] as const;
const attemptStatusEnum = ["pending", "approved", "rejected"] as const;

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  unionId: text("unionId", { length: 255 }),
  name: text("name", { length: 255 }),
  email: text("email", { length: 320 }),
  avatar: text("avatar"),
  role: text("role", { enum: roleEnum }).default("user").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: integer("lastSignInAt", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Community-submitted problem proposals.
 * The full proposal payload is stored as JSON text (fields mirror the
 * catalog's Problem shape); moderation state lives in `status`.
 */
export const submissions = sqliteTable("submissions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  // 匿名社区：userId 仅在向下兼容存量登录投稿时保留，新投稿走 visitorId + authorName。
  userId: integer("userId").references(() => users.id),
  visitorId: text("visitorId", { length: 64 }),
  authorName: text("authorName", { length: 128 }),
  title: text("title", { length: 500 }).notNull(),
  titleZh: text("titleZh", { length: 500 }).notNull(),
  domain: text("domain", { length: 64 }).notNull(),
  payload: text("payload").notNull(),
  status: text("status", { enum: submissionStatusEnum })
    .default("pending")
    .notNull(),
  reviewerNote: text("reviewerNote"),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = typeof submissions.$inferInsert;

/**
 * Admin-recorded status/revision entries attached to a catalog problem.
 * `problemId` mirrors the static catalog id (mp-001, me-014, …); the note
 * usually records a new progress item, a status change, or a refinement.
 */
export const problemUpdates = sqliteTable("problem_updates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  problemId: text("problemId", { length: 32 }).notNull(),
  // 独立管理入口（Bearer 令牌）直写；不再关联登录用户，userId 保留仅向下兼容。
  userId: integer("userId").references(() => users.id),
  date: text("date", { length: 16 }).notNull(),
  note: text("note").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

export type ProblemUpdateRecord = typeof problemUpdates.$inferSelect;
export type InsertProblemUpdate = typeof problemUpdates.$inferInsert;

/**
 * Community-submitted candidates for advancing an EXISTING catalog problem:
 * a proposed progress note, a solution sketch, or a status suggestion. Unlike
 * `problem_updates` (admin-written), these enter as pending and need review.
 * Approved ones surface on the problem detail page as community progress.
 *
 * Deliberately low-friction: submission requires no login. `authorName` is
 * self-declared so anonymous visitors can still get credit; `userId` is set
 * only when the submitter happens to be signed in.
 *
 * kind='formal' 是双桥写路径（POST /api/v1/claims/:id/formal）与 tRPC 共用
 * 的形式化补证声明：声称该题 formal_view.status 应迁移到 formalStatus。
 */
export const problemAttempts = sqliteTable("problem_attempts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  problemId: text("problemId", { length: 32 }).notNull(),
  userId: integer("userId").references(() => users.id),
  // 伪匿名访客 ID（新投稿填充）；userId 仅在向下兼容存量登录投稿时保留。
  visitorId: text("visitorId", { length: 64 }),
  authorName: text("authorName", { length: 128 }),
  kind: text("kind", { enum: attemptKindEnum }).default("progress").notNull(),
  title: text("title", { length: 300 }).notNull(),
  content: text("content").notNull(),
  /**
   * 思路与反思（可选）：投稿人自述怎么想到的、卡在哪、为什么失败。
   * 与 content（论证本体）分离，把尝试账本变成可读的研究日志——
   * 失败的负结果与成功的收窄同样沉淀为内容深度。审批通过后在详情页
   * 候选卡片中独立成块展示。
   */
  narrative: text("narrative"),
  /**
   * 验证-收窄飞轮（kind='verification' 时填写）：投稿人声称把该题带证区间
   * 收窄到的值（如 "[1.52, 1.56]"）。审批通过后出现在详情页"验证账本"，
   * 是社区让目录变紧的载体。其余 kind 为 null。
   */
  newBand: text("newBand", { length: 80 }),
  /**
   * 形式化补证（kind='formal' 时填写）：投稿人声称该题 formal_view.status
   * 应迁移到的值（证成 provable / 反例 refuted / 回到 conjectured）。审批
   * 通过后随 feed.json 的 formal 事件暴露给下游；其余 kind 为 null。
   */
  formalStatus: text("formalStatus", { enum: formalStatusEnum }),
  /**
   * 方法标签（可选，≤80 字符）：投稿人自报所用技术族，如 "interval-arithmetic"、
   * "multiscale-analysis"。障碍图（api/obstacle-graph.ts）用它把已通过的声明
   * 沿跨题障碍链扩散成「方法 → 可解锁问题」的反向路由。刻意用自由文本而非
   * 枚举：方法集合无法预先封闭，拼写规范留给审稿与惯例。
   */
  method: text("method", { length: 80 }),
  status: text("status", { enum: attemptStatusEnum })
    .default("pending")
    .notNull(),
  reviewerNote: text("reviewerNote"),
  votes: integer("votes").notNull().default(0),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull()
    .$onUpdate(() => new Date()),
});

export type ProblemAttempt = typeof problemAttempts.$inferSelect;
export type InsertProblemAttempt = typeof problemAttempts.$inferInsert;

/**
 * 自建评论区（不依赖 GitHub Discussions/Giscus）：每个目录问题下的匿名评论。
 * 设计取向与「判定账本」刻意不同——评论即发即见（无审稿门槛），防滥用靠
 * 访客+IP 限流与人机验证（writeAllowed）；这正是要避免「声明卡在待审」的体验。
 * visitorId 保留用于限流/事后处置，不对外暴露。
 */
export const problemComments = sqliteTable("problem_comments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  problemId: text("problemId", { length: 32 }).notNull(),
  visitorId: text("visitorId", { length: 64 }),
  // 自报署名，可选；留空则显示匿名。
  authorName: text("authorName", { length: 128 }),
  content: text("content").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

export type ProblemComment = typeof problemComments.$inferSelect;
export type InsertProblemComment = typeof problemComments.$inferInsert;

/**
 * 社区红旗：匿名访客对目录问题的可信度质疑（陈述有误 / 已被人解决 / 来源误植 /
 * 评级失真 / 其他）。与评论同模型——即发即见（无审稿门槛），公开可见本身就是
 * 治理信号：任何读者都能看到「有人对此题的可信度提出质疑」，也都能复核。
 * 防滥用靠 writeAllowed（访客+IP 双限流 + 可选 Turnstile）。
 * visitorId 保留用于限流/事后处置，不对外暴露。
 */
const flagTypeEnum = ["statement", "solved", "attribution", "rating", "other"] as const;

export const problemFlags = sqliteTable("problem_flags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  problemId: text("problemId", { length: 32 }).notNull(),
  visitorId: text("visitorId", { length: 64 }),
  // 自报署名，可选；留空则匿名。
  authorName: text("authorName", { length: 128 }),
  // 红旗类型（固定枚举，见 FLAG_TYPES）。
  flagType: text("flagType", { enum: flagTypeEnum }).notNull(),
  // 质疑内容（为什么该题可信度存疑 / 已解决来源等）。
  content: text("content").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

export type ProblemFlag = typeof problemFlags.$inferSelect;
export type InsertProblemFlag = typeof problemFlags.$inferInsert;

/**
 * 投票记录：一个访客对某个已通过候选最多投一票。
 * 匿名社区无登录，按 visitorId 计一人一票（同设备清洗 cookie 可规避，属匿名模型
 * 固有局限）；存量登录投票保留 userId。两个身份各有一组唯一约束兜底并发重复票。
 */
export const problemAttemptVotes = sqliteTable(
  "problem_attempt_votes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    attemptId: integer("attemptId").notNull().references(() => problemAttempts.id),
    userId: integer("userId").references(() => users.id),
    visitorId: text("visitorId", { length: 64 }),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
  },
  (t) => [
    uniqueIndex("problem_attempt_votes_visitor_uidx")
      .on(t.attemptId, t.visitorId)
      .where(sql`${t.visitorId} is not null`),
  ],
);
