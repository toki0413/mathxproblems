import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { createOAuthCallbackHandler, createOAuthInitHandler } from "./kimi/auth";
import { Paths } from "@contracts/constants";
import { buildCatalog, buildBenchmark, snapshotVersion } from "./catalog.json";
import { listLatestClaimEvents } from "./queries/attempts";
import { registerClaimsWriteRoutes } from "./claims-write";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
app.get(Paths.oauthInit, createOAuthInitHandler());
app.get(Paths.oauthCallback, createOAuthCallbackHandler());

// 稳定、可版本化、可被下游机器消费的数据契约（ApiPage 的 JSON 也在此供给）。
// 响应带 ETag 与 X-Version 头，供 agent/证明流水线用 If-None-Match 做增量拉取。
const jsonReply = (body: string, c: import("hono").Context) => {
  const etag = snapshotVersion(body);
  const ifNoneMatch = c.req.raw.headers.get("if-none-match");
  if (ifNoneMatch === `"${etag}"`) return c.body(null, 304);
  return c.newResponse(body, 200, {
    "Content-Type": "application/json; charset=utf-8",
    ETag: `"${etag}"`,
    "X-Version": `v1-${etag}`,
  });
};
app.get("/api/v1/problems.json", (c) => jsonReply(JSON.stringify(buildCatalog()), c));
app.get("/api/v1/benchmark.json", (c) => jsonReply(JSON.stringify(buildBenchmark()), c));
// 变更 feed：最近被评审通过的声明事件——带证收窄（S 侧，kind='verification'）
// 与形式化补证（M 侧，kind='formal'），供下游消费方做增量同步。
// 无数据库时（如纯前端 dev）返回空列表，不因 DB 缺失而 500。
app.get("/api/v1/feed.json", async (c) => {
  let feed: unknown[] = [];
  try {
    feed = await listLatestClaimEvents(20);
  } catch {
    feed = [];
  }
  return jsonReply(JSON.stringify(feed), c);
});
// 双桥写路径薄门面（方案 C）：POST /api/v1/claims/:id/narrow|formal。
// 默认闭门（501），CLAIMS_WRITE_ENABLED=1 放开后写入审稿账本。
registerClaimsWriteRoutes(app);
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
