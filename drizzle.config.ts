import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// 站点存储已迁移到 Cloudflare D1 (SQLite)，不再需要外部 PostgreSQL 连接串。
// `db:generate` 生成 SQLite 方言迁移；迁移由 wrangler d1 migrations apply 应用到线上。
export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: "file:./d1-local.sqlite",
  },
});
