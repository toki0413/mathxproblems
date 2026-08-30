import "dotenv/config";

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
