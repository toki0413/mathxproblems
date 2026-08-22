import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
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
export const submissions = mysqlTable("submissions", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id),
  title: varchar("title", { length: 500 }).notNull(),
  titleZh: varchar("titleZh", { length: 500 }).notNull(),
  domain: varchar("domain", { length: 64 }).notNull(),
  payload: text("payload").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"])
    .default("pending")
    .notNull(),
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
export const problemUpdates = mysqlTable("problem_updates", {
  id: serial("id").primaryKey(),
  problemId: varchar("problemId", { length: 32 }).notNull(),
  userId: bigint("userId", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id),
  date: varchar("date", { length: 16 }).notNull(),
  note: text("note").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProblemUpdateRecord = typeof problemUpdates.$inferSelect;
export type InsertProblemUpdate = typeof problemUpdates.$inferInsert;

// TODO: Add your tables here. See docs/Database.md for schema examples and patterns.
//
// Example:
// export const posts = mysqlTable("posts", {
//   id: serial("id").primaryKey(),
//   title: varchar("title", { length: 255 }).notNull(),
//   content: text("content"),
//   createdAt: timestamp("created_at").notNull().defaultNow(),
// });
//
// Note: FK columns referencing a serial() PK must use:
//   bigint("columnName", { mode: "number", unsigned: true }).notNull()
