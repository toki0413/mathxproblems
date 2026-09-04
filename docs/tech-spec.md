# MathX 问题站 · 技术规范

> 本文件为事实性记录（onboard），仅陈述当前代码库已存在的内容，不含计划或构想。
> 后续维护改动应保持与本节 `convention` / `invariant` 一致。

## stack

- 语言/运行时：TypeScript（`strict`，`verbatimModuleSyntax`，`erasableSyntaxOnly`，见 `tsconfig.app.json`）、Node.js、React 19
- 前端构建：Vite + React + Tailwind CSS + shadcn/ui 组件（`src/components/ui/*`）
- 数据：无构建期数据库依赖实体；目录数据为静态 TS 数据 `src/data/problems.ts`；社区提交与更新写入 Cloudflare D1（SQLite，`drizzle-orm/sqlite-core`）
- 后端：Hono + tRPC v11（`@trpc/server`），Drizzle ORM + D1（`drizzle-orm/sqlite-core`），匿名社区（访客 cookie）+ 独立管理入口（Bearer 令牌）
- 环境：Docker、GitHub Actions（`vite.config.ts` 由 `api/lib/vite.ts` 注入 dev server）

## entry

- 前端：`src/main.tsx` → 挂载顺序 `BrowserRouter → TRPCProvider → LanguageProvider → App`（见 `src/App.tsx` 路由表）
- 服务端：`api/boot.ts`（Hono app；生产环境 `PORT` 默认 3000，若 `NODE_ENV=production` 则同时 `serveStaticFiles`）
- 数据源：`src/data/problems.ts`（121 题，静态目录，唯一事实来源，不含查库）

## contract

- 公共类型出口：`contracts/types.ts` 重组 `db/schema` 类型与 `contracts/errors.ts`
- 后端统一入口：`api/boot.ts`，tRPC 挂载于 `/api/trpc/*`，其余 `/api/*` 返回 404
- 双桥写路径门面：`api/claims-write.ts` 在 `/api/v1/claims/:id/narrow|formal` 注册审稿中介的写接口（spec `docs/superpowers/specs/2026-08-30-dual-bridge-design.md` §6 方案 C 第一版），默认闭门返回 501，置 `CLAIMS_WRITE_ENABLED=1` 放开；放开后与 tRPC `attempts.submit` 共用 `problem_attempts` 账本与审稿闭环，不产生第二份事实来源
- 障碍路由层：`api/obstacle-graph.ts` 启动时从目录 obstacles 构建跨题相似链（双语签名 + Jaccard），`/api/v1/obstacles.json` 暴露链与「方法→可解锁问题」unlocks；`feed.json` 的 verification 事件附 `bits`（题内链式信息量增益，定义在 `contracts/band.ts`）
- tRPC router：`api/router.ts` 聚合 `submissions / updates / attempts / comments / flags` 五个子 router；`AppRouter` 由 `typeof appRouter` 导出，供前端 `src/providers/trpc.tsx` 类型推导
- 中间件分层（`api/middleware.ts`）：`publicQuery` / `adminQuery`；`adminQuery` 校验 `Authorization: Bearer <ADMIN_TOKEN>`，失败抛 `FORBIDDEN`（匿名社区无登录，审核接口不对社区用户开放）
- 错误约定：`contracts/errors.ts` 的 `Errors.{badRequest,unauthorized,forbidden,notFound,internal,notImplemented}` 返回 `{tag:'app_error',status,message}`
- 审计常量：`contracts/constants.ts`（访客 cookie / 管理员 Bearer 方案、错误文案、`PROBLEM_ID_RE`、`FORMAL_STATUSES`）；前端里程碑常量在 `src/const.ts`（`GOAL_PROBLEMS=120`）
- 数据库表：`db/schema.ts` — `users`、`submissions`、`problem_updates`、`problem_attempts`（后三者外键指向 `users.id`，类型为 `integer`，SQLite/D1 方言）。`problem_updates` 为管理员直写；`problem_attempts` 为社区对已有问题提交的进展/解答候选（`kind` ∈ progress/solution/revision/verification/formal；`kind='formal'` 的形式化补证声明另携 `formalStatus` ∈ provable/conjectured/refuted；可选 `method` 自由文本标签供障碍图路由），静默待审、审核通过后在详情页「社区候选」区展示；已通过的 verification/formal 事件经 `feed.json` 暴露给下游 agent/prover 流水线

## convention

- 路径别名：`@/*`→`src/*`，`@contracts/*`→`contracts/*`，`@db/*`→`db/*`（`tsconfig.app.json`；`vitest.config.ts` 额外有 `@assets` 与 `@db`）
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

- 2026-08-31 起依赖齐备的干净环境（`npm ci`）下 `npm run check`、`npm run check:problems`、`npm test` 全部通过；`check-problems.mjs` 仍刻意用正则解析 `problems.ts`（见其 `ponytail:` 注释），暂无换真 import 的必要
- schema.ts 顶部有 TODO 与 `docs/Database.md` 示例引用占位，暂无 `docs/Database.md`
