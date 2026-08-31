// Cloudflare Pages Advanced Mode 单入口：
//   - 以 /api/* 开头的请求交给 Hono；
//   - 其余(前端静态、SPA 路由)回退到 Pages ASSETS。
import { app } from "./api/boot";

type CfEnv = { ASSETS: { fetch: (req: Request) => Promise<Response> } };

export default {
  async fetch(request: Request, env: CfEnv, _ctx: unknown): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      return app.fetch(request, {}, {} as never);
    }
    // 前端静态：交给 Pages ASSETS。SPA 路由由 index.html 兜底。
    return env.ASSETS.fetch(request);
  },
};