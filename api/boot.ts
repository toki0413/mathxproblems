import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { ensureVisitorId } from "./visitor";
import { buildCatalog, buildBenchmark, buildTools, buildImpact, snapshotVersion } from "./catalog.json";
import { buildLaws } from "./laws.json";
import { buildObstaclesPayload } from "./obstacle-graph";
import { listLatestClaimEvents, listMethodEvents } from "./queries/attempts";
import { registerClaimsWriteRoutes } from "./claims-write";
import { JUDGEMENT_CONTRACT_VERSION } from "@contracts/judgement";

export const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

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
    // 契约 v0.1：所有机器快照声明它们满足的判定契约版本，供消费方做版本协商。
    "X-Contract-Version": JUDGEMENT_CONTRACT_VERSION,
  });
};

// ── RSS 2.0 feed ────────────────────────────────────────────────────────────
// 从静态目录确定性生成「最新收录」feed，供读者订阅问题库的新增条目。
// 与 problems.json 同一数据源，避免手维护 feed 内容与目录脱节。
const SITE_URL = "https://mathx-bridge.pages.dev";
const escapeXml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
/** YYYY-MM-DD → RFC-822 时间（RSS pubDate 格式）。 */
const toRfc822 = (ymd: string) => {
  const [y, m, d] = ymd.split("-").map(Number);
  const date = new Date(Date.UTC(y || 1970, (m || 1) - 1, d || 1));
  return date.toUTCString();
};
export function buildFeedXml(catalog: ReturnType<typeof buildCatalog>) {
  const items = [...catalog]
    .sort((a, b) => (b.date_added ?? "").localeCompare(a.date_added ?? ""))
    .slice(0, 20)
    .map((p) => {
      const url = `${SITE_URL}/problems/${p.id}`;
      const title = `[${p.id}] ${p.title}`;
      const desc = `${p.domain} · ${p.status} · ${p.provenance ?? "AI-drafted"}`;
      return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${toRfc822(p.date_added ?? "")}</pubDate>
      <description>${escapeXml(desc)}</description>
    </item>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>MathX Problems — New entries</title>
    <link>${SITE_URL}/</link>
    <description>New open problems added to the MathX Problems catalog.</description>
    <language>en</language>
    <atom:link href="${SITE_URL}/api/v1/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
}
app.get("/api/v1/feed.xml", (c) =>
  c.newResponse(buildFeedXml(buildCatalog()), 200, {
    "Content-Type": "application/rss+xml; charset=utf-8",
  }),
);
app.get("/api/v1/problems.json", (c) => jsonReply(JSON.stringify(buildCatalog()), c));
app.get("/api/v1/benchmark.json", (c) => jsonReply(JSON.stringify(buildBenchmark()), c));
// 形式工具注册表：mathlib 工具族 ↔ 工程判定的供给侧索引，供 agent 解析 tool_links。
app.get("/api/v1/tools.json", (c) => jsonReply(JSON.stringify(buildTools()), c));
// 经验定律边界图谱：工程经验定律的失效域与形式化缺口（运动的需求清单）。
app.get("/api/v1/laws.json", (c) => jsonReply(JSON.stringify(buildLaws()), c));
// 影响域实证链：每个影响域挂接的真实 arXiv 文献证据（可核验锚点，B5）。
app.get("/api/v1/impact.json", (c) => jsonReply(JSON.stringify(buildImpact()), c));
// 变更 feed：最近被评审通过的声明事件——带证收窄（S 侧，kind='verification'）
// 与形式化补证（M 侧，kind='formal'），供下游消费方做增量同步。
// verification 事件附 bits（相对题内上一条已通过的收窄的信息量增益）。
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
// 障碍路由层：跨题「已知障碍」相似链 + 方法解锁（方法→还能松哪些题的绑）。
// 图从静态目录确定性构建；方法事件来自审稿账本，无数据库时 unlocks 为空。
app.get("/api/v1/obstacles.json", async (c) => {
  let events: { problemId: string; method: string | null }[] = [];
  try {
    events = await listMethodEvents();
  } catch {
    events = [];
  }
  return jsonReply(JSON.stringify(buildObstaclesPayload(buildCatalog(), events)), c);
});
// 双桥写路径薄门面（方案 C）：POST /api/v1/claims/:id/narrow|formal。
// 默认闭门（501），CLAIMS_WRITE_ENABLED=1 放开后写入审稿账本。
registerClaimsWriteRoutes(app);
app.use("/api/trpc/*", async (c) => {
  // 匿名社区的第一道门槛：首次访问签发 httpOnly 访客 cookie 并盖戳到请求，
  // 供 tRPC 上下文确定性复用同一次签发的 visitorId（一人一票 / 限流 / 写归属）。
  const resHeaders = new Headers();
  const visitorId = ensureVisitorId(c.req.raw.headers, resHeaders);
  (c.req.raw as Request & { __visitorId?: string }).__visitorId = visitorId;

  const res = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });

  const setCookie = resHeaders.get("set-cookie");
  if (!setCookie) return res;
  // tRPC 的 fetchRequestHandler 不会把上下文里的 set-cookie 回写响应，这里显式合并。
  const combined = new Headers(res.headers);
  combined.append("set-cookie", setCookie);
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: combined,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;
