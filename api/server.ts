// 本地/Docker 常驻入口：仅在直接运行本文件时监听端口。
// Vercel 不会导入这个模块（它走 api/index.ts），所以 serve 不会与 serverless 冲突。
import { serve } from "@hono/node-server";
import { app } from "./boot";
import { serveStaticFiles } from "./lib/vite";

serveStaticFiles(app);

const port = parseInt(process.env.PORT || "3000");
serve({ fetch: app.fetch, port }, () => {
  console.log(`Server running on http://localhost:${port}/`);
});