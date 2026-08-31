// env 只从 process.env 读取。本地/容器路径(server.ts, vite.config)负责加载 .env；
// Cloudflare Pages 运行时已把环境变量 populate 进 process.env(compat date>=2026-08-04
// 且 nodejs_compat 默认开启)，这里不再 import dotenv——Worker 里没有 .env 文件可读。
function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

export const env = {
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: required("DATABASE_URL"),
  // 独立管理入口令牌：`Authorization: Bearer <ADMIN_TOKEN>` 访问审核接口。
  // 未配置时管理接口一律 403，避免匿名社区裸奔出不受控的后台。
  adminToken: process.env.ADMIN_TOKEN ?? "",
  // Cloudflare Turnstile 人机验证密钥（可选）：未配置时跳过人机验证，
  // 配了之后写接口要求前端附带 captchaToken 且校验通过。
  turnstileSecret: process.env.TURNSTILE_SECRET ?? "",
  // 双桥写路径（POST /api/v1/claims/:id/narrow|formal）默认闭门；
  // 显式置 "1"/"true" 才放开，放开后经审稿账本闭环
  // （spec: docs/superpowers/specs/2026-08-30-dual-bridge-design.md §6）。
  claimsWriteEnabled: ["1", "true"].includes(
    (process.env.CLAIMS_WRITE_ENABLED ?? "").toLowerCase(),
  ),
};