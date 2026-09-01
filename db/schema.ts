import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

const roleEnum = pgEnum("role", ["user", "admin"]);
const submissionStatusEnum = pgEnum("submission_status", [
  "pending",
  "approved",
  "rejected",
]);
const attemptKindEnum = pgEnum("attempt_kind", [
  "progress",
  "solution",
  "revision",
  "verification",
  "formal",
]);
const formalStatusEnum = pgEnum("formal_status", [
  "provable",
  "conjectured",
  "refuted",
]);
const attemptStatusEnum = pgEnum("attempt_status", [
  "pending",
  "approved",
  "rejected",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Community-submitted problem proposals.
 * The full proposal payload is stored as JSON text (fields mirror the
 * catalog's Problem shape); moderation state lives in `status`.
 */
export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  // 匿名社区：userId 仅在向下兼容存量登录投稿时保留，新投稿走 visitorId + authorName。
  userId: bigint("userId", { mode: "number" }).references(() => users.id),
  visitorId: varchar("visitorId", { length: 64 }),
  authorName: varchar("authorName", { length: 128 }),
  title: varchar("title", { length: 500 }).notNull(),
  titleZh: varchar("titleZh", { length: 500 }).notNull(),
  domain: varchar("domain", { length: 64 }).notNull(),
  payload: text("payload").notNull(),
  status: submissionStatusEnum("status").default("pending").notNull(),
  reviewerNote: text("reviewerNote"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
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
export const problemUpdates = pgTable("problem_updates", {
  id: serial("id").primaryKey(),
  problemId: varchar("problemId", { length: 32 }).notNull(),
  // 独立管理入口（Bearer 令牌）直写；不再关联登录用户，userId 保留仅向下兼容。
  userId: bigint("userId", { mode: "number" }).references(() => users.id),
  date: varchar("date", { length: 16 }).notNull(),
  note: text("note").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
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
export const problemAttempts = pgTable("problem_attempts", {
  id: serial("id").primaryKey(),
  problemId: varchar("problemId", { length: 32 }).notNull(),
  userId: bigint("userId", { mode: "number" }).references(() => users.id),
  // 伪匿名访客 ID（新投稿填充）；userId 仅在向下兼容存量登录投稿时保留。
  visitorId: varchar("visitorId", { length: 64 }),
  authorName: varchar("authorName", { length: 128 }),
  kind: attemptKindEnum("kind").default("progress").notNull(),
  title: varchar("title", { length: 300 }).notNull(),
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
  newBand: varchar("newBand", { length: 80 }),
  /**
   * 形式化补证（kind='formal' 时填写）：投稿人声称该题 formal_view.status
   * 应迁移到的值（证成 provable / 反例 refuted / 回到 conjectured）。审批
   * 通过后随 feed.json 的 formal 事件暴露给下游；其余 kind 为 null。
   */
  formalStatus: formalStatusEnum("formalStatus"),
  /**
   * 方法标签（可选，≤80 字符）：投稿人自报所用技术族，如 "interval-arithmetic"、
   * "multiscale-analysis"。障碍图（api/obstacle-graph.ts）用它把已通过的声明
   * 沿跨题障碍链扩散成「方法 → 可解锁问题」的反向路由。刻意用自由文本而非
   * 枚举：方法集合无法预先封闭，拼写规范留给审稿与惯例。
   */
  method: varchar("method", { length: 80 }),
  status: attemptStatusEnum("status").default("pending").notNull(),
  reviewerNote: text("reviewerNote"),
  votes: bigint("votes", { mode: "number" }).notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type ProblemAttempt = typeof problemAttempts.$inferSelect;
export type InsertProblemAttempt = typeof problemAttempts.$inferInsert;

/**
 * 投票记录：一个访客对某个已通过候选最多投一票。
 * 匿名社区无登录，按 visitorId 计一人一票（同设备清洗 cookie 可规避，属匿名模型
 * 固有局限）；存量登录投票保留 userId。两个身份各有一组唯一约束兜底并发重复票。
 */
export const problemAttemptVotes = pgTable(
  "problem_attempt_votes",
  {
    id: serial("id").primaryKey(),
    attemptId: bigint("attemptId", { mode: "number" })
      .notNull()
      .references(() => problemAttempts.id),
    userId: bigint("userId", { mode: "number" }).references(() => users.id),
    visitorId: varchar("visitorId", { length: 64 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("problem_attempt_votes_visitor_uidx")
      .on(t.attemptId, t.visitorId)
      .where(sql`${t.visitorId} is not null`),
  ],
);