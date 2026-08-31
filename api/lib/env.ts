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
  appId: required("APP_ID"),
  appSecret: required("APP_SECRET"),
  // 会话签名密钥：优先独立配置，避免复用 OAuth client_secret；
  // 未配置时回退到 appSecret，保证存量部署不因新增变量而启动失败。
  sessionSecret: process.env.SESSION_SECRET ?? process.env.APP_SECRET ?? "",
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: required("DATABASE_URL"),
  kimiAuthUrl: required("KIMI_AUTH_URL"),
  kimiOpenUrl: required("KIMI_OPEN_URL"),
  ownerUnionId: process.env.OWNER_UNION_ID ?? "",
  // 双桥写路径（POST /api/v1/claims/:id/narrow|formal）默认闭门；
  // 显式置 "1"/"true" 才放开，放开后经审稿账本闭环
  // （spec: docs/superpowers/specs/2026-08-30-dual-bridge-design.md §6）。
  claimsWriteEnabled: ["1", "true"].includes(
    (process.env.CLAIMS_WRITE_ENABLED ?? "").toLowerCase(),
  ),
};
