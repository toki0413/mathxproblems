import { drizzle } from "drizzle-orm/d1";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type { D1Database } from "@cloudflare/workers-types";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

// D1 binding 由 Worker 运行时注入（api/boot.ts 的中间件在首请求时挂载）。
// 本地无 D1 环境（纯前端 dev）时保持 undefined，调用方各自兜底降级。
let instance: DrizzleD1Database<typeof fullSchema> | undefined;

export function setDb(db: D1Database): void {
  instance = drizzle(db, { schema: fullSchema });
}

export function getDb(): DrizzleD1Database<typeof fullSchema> {
  if (!instance) {
    throw new Error("D1 database is not bound; setDb() must be called first");
  }
  return instance;
}
