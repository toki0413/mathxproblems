# MathX 问题站 · 技术规范

> 本文件为事实性记录（onboard），仅陈述当前代码库已存在的内容，不含计划或构想。
> 后续维护改动应保持与本节 `convention` / `invariant` 一致。

## stack

- 语言/运行时：TypeScript（`strict`，`verbatimModuleSyntax`，`erasableSyntaxOnly`，见 `tsconfig.app.json`）、Node.js、React 19
- 前端构建：Vite + React + Tailwind CSS + shadcn/ui 组件（`src/components/ui/*`）
- 数据：无构建期数据库依赖实体；目录数据为静态 TS 数据 `src/data/problems.ts`；社区提交与更新写入 MySQL（Drizzle ORM）
- 后端：Hono + tRPC v11（`@trpc/server`），Drizzle ORM + `mysql2`，会话用 Kimi OAuth + `jose`
- 环境：Docker、GitHub Actions（`vite.config.ts` 由 `api/lib/vite.ts` 注入 dev server）

## entry

- 前端：`src/main.tsx` → 挂载顺序 `BrowserRouter → TRPCProvider → LanguageProvider → App`（见 `src/App.tsx` 路由表）
- 服务端：`api/boot.ts`（Hono app；生产环境 `PORT` 默认 3000，若 `NODE_ENV=production` 则同时 `serveStaticFiles`）
- 数据源：`src/data/problems.ts`（约 65 题，静态目录，唯一事实来源，不含查库）

## contract

- 公共类型出口：`contracts/types.ts` 重组 `db/schema` 类型与 `contracts/errors.ts`
- 后端统一入口：`api/boot.ts`，tRPC 挂载于 `/api/trpc/*`，其余 `/api/*` 返回 404
- tRPC router：`api/router.ts` 聚合 `auth / submissions / updates / attempts` 四个子 router；`AppRouter` 由 `typeof appRouter` 导出，供前端 `src/providers/trpc.tsx` 类型推导
- 中间件分层（`api/middleware.ts`）：`publicQuery` / `authedQuery` / `adminQuery`；`authedQuery` 抛 `UNAUTHORIZED`，`adminQuery` 抛 `FORBIDDEN`
- 错误约定：`contracts/errors.ts` 的 `Errors.{badRequest,unauthorized,forbidden,notFound,internal}` 返回 `{tag:'app_error',status,message}`
- 审计常量：`contracts/constants.ts`（会话 cookie 名、错误文案、OAuth 回调路径）；前端里程碑常量在 `src/const.ts`（`GOAL_PROBLEMS=120`）
- 数据库表：`db/schema.ts` — `users`、`submissions`、`problem_updates`、`problem_attempts`（后三者外键指向 `users.id`，类型为 `bigint(...unsigned)`）。`problem_updates` 为管理员直写；`problem_attempts` 为社区对已有问题提交的进展/解答候选，静默待审、审核通过后在详情页「社区候选」区展示

## convention

- 路径别名：`@/*`→`src/*`，`@contracts/*`→`contracts/*`，`@db/*`→`db/*`（`tsconfig.app.json`；`vitest.config.ts` 额外有 `@assets`）
- index 命名：默认导出改名为主组件（如 `export default function ReviewPage()`）
- i18n：所有 UI 文案集中在 `src/i18n.tsx`，经 `useI18n()` 的 `t()` 取双语；枚举态用 `enumLabel(lang, kind, value)`（`ENUM_LABELS` 集中式，勿在页面散落 `lang==='zh'` 三元）
- 关系数据：`src/data/problems.ts` 的 `related_problems` 关系五类 `depends_on / implies / shares_tools / generalizes / analog_of`；对称类型需用 `relatedOf()`/`impactOf()` 等辅助动态生成反向边
- 表单校验：tRPC input 用 `zod`（`z.object` + 正则），后端为信任边界必校验
- 命令：`npm run check`=`tsc -b`，`check:problems`=`node scripts/check-problems.mjs`，`test`=`vitest run`（`api/**/*.test.ts`）

## invariant

- 目录问题 `id` 全局唯一；`related_problems` 不得出现悬空引用（`scripts/check-problems.mjs` 强制）
- 每条 `related_problems.relation` ∈ 五类（`depends_on/implies/shares_tools/generalizes/analog_of`），且无自环、无重复同向边（`check-problems.mjs` 校验）
- 标签大小写/空白一致（`check-problems.mjs` 校验 tag variant）
- 每个问题必须含 `judgment`（机器可判定形式），计入 `check-problems.mjs`
- 对称关系（`shares_tools`、`analog_of`）在 UI 双向渲染（`ProblemDetailPage` / `ProblemGraph`）；数据侧刻意单向撰写，反向边由 `relatedOf()` 派生，因此不会在原始数据上要求双向
- 收录口径统一以 `GOAL_PROBLEMS` 为基准

## constraint

- 本机 `/ 数据目录` 无 `node_modules`，`tsc`/`vitest` 暂无法在本地干净执行；`check-problems.mjs` 刻意用正则解析 `problems.ts`（见其 `ponytail:` 注释），CI/依赖齐全后再换真 import
- schema.ts 顶部有 TODO 与 `docs/Database.md` 示例引用占位，暂无 `docs/Database.md`