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

// 全站安全响应头（产业级验收项），对 API 与静态资源统一生效。
// CSP 需放行 'unsafe-inline' style：React 组件使用 style={{...}} 内联样式；
// 前端无外部 script/connect/字体依赖（arxiv/doi 仅为链接导航，不受 CSP 限制），
// 故其余指令收紧到 'self'。
const SECURITY_HEADERS: Record<string, string> = {
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

const withSecurityHeaders = (res: Response): Response => {
  const headers = new Headers(res.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(name, value);
  }
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
};

export default {
  async fetch(request: Request, env: CfEnv, _ctx: unknown): Promise<Response> {
    const url = new URL(request.url);
    let res: Response;
    if (url.pathname.startsWith("/api/")) {
      // 首次请求把 D1 binding 挂到查询层（幂等）。
      setDb(env.DB);
      res = await app.fetch(request, env, _ctx as never);
    } else {
      // 前端静态：交给 Pages ASSETS。SPA 路由由 index.html 兜底。
      res = await env.ASSETS.fetch(request);
    }
    return withSecurityHeaders(res);
  },
};
