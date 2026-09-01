// Cloudflare Pages Advanced Mode 单入口：
//   - 以 /api/* 开头的请求交给 Hono；
//   - 其余(前端静态、SPA 路由)回退到 Pages ASSETS。
import { app } from "./api/boot";
import { setDb } from "./api/queries/connection";
import type { D1Database } from "@cloudflare/workers-types";

type CfEnv = {
  ASSETS: { fetch: (req: Request) => Promise<Response> };
  // wrangler.toml 的 [[d1_databases]] 暴露的 SQLite 存储。
  DB: D1Database;
};

export default {
  async fetch(request: Request, env: CfEnv, _ctx: unknown): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      // 首次请求把 D1 binding 挂到查询层（幂等）。
      setDb(env.DB);
      return app.fetch(request, env, _ctx as never);
    }
    // 前端静态：交给 Pages ASSETS。SPA 路由由 index.html 兜底。
    return env.ASSETS.fetch(request);
  },
};
