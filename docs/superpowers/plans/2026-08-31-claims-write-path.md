# 双桥写路径（方案 C 第一版）落地记录

- 日期：2026-08-31
- 依据：`docs/superpowers/specs/2026-08-30-dual-bridge-design.md` §6
- 分支：`feat/claims-write-v2`

## 目标

给外部 agent / 证明流水线一个不碰 tRPC 会话的薄 HTTP 门面，把「收窄（S 侧）」与
「形式化补证（M 侧）」两类声明写进审稿账本，审批通过后经 `feed.json` 对下游同步。
第一版按 spec 要求「端点可注册但默认关闭」。

## 决策

1. **narrow 复用 `kind='verification'`**。带证收窄与现有验证-收窄飞轮是同一类
   事件（都携 `newBand`），单开枚举只会让账本与 feed 各裂一份；差异只在来源
   （HTTP 门面 vs 详情页表单），不构成新 kind。
2. **formal 新开 `kind='formal'` + `formalStatus` 列**。形式化状态迁移
   （provable/conjectured/refuted）是正交于收窄的声明类型，目录侧已有
   `formal_view.status` 三值枚举（`FORMAL_STATUSES`）可对齐；枚举与新列同值，
   审稿语义（pending → approved 才进 feed）沿用现有闭环。
3. **门控先于一切校验**。闭门时对两个端点一律返回 501 `app_error`，不区分
   id 是否在目录中——关闭状态不应泄露目录内容差异。放开后校验顺序为
   id 格式（`PROBLEM_ID_RE`）→ id 存在性（目录缓存）→ body（zod）。
4. **成功返回 202 + `queued: 'pending_review'`**。写入即进入审稿队列，不直接
   成为目录事实；这与 tRPC `attempts.submit` 语义一致，明确告知调用方声明
   尚未生效。
5. **依赖注入便于测试**。`createClaimsWriteApp(deps)` 注入
   `enabled / catalogHas / insert`，生产装配（`registerClaimsWriteRoutes`）接
   真目录与真库，测试全注入假实现，不触库。
6. **feed.json 从 narrow 扩展为 narrow+formal**。`listLatestClaimEvents(20)`
   取已通过的 verification/formal 事件，携带 `newBand`/`formalStatus`，下游
   增量同步一份 feed 即可覆盖两类声明。

## 触碰面

- `db/schema.ts`：`problem_attempts.kind` 加 `'formal'`，新增 `formalStatus` 枚举列
- `contracts/constants.ts`：`FORMAL_STATUSES`（zod 与目录枚举门禁共用此源）
- `contracts/errors.ts`：`Errors.notImplemented`（501）
- `api/claims-write.ts`（新）：写路径门面
- `api/boot.ts`：挂载门面（在 tRPC 兜底之前），feed.json 换用 `listLatestClaimEvents`
- `api/lib/env.ts`、`.env.example`：`CLAIMS_WRITE_ENABLED`（默认关）
- `api/attempts-router.ts`：tRPC submit 同步接受 `kind='formal'` + `formalStatus`
- `api/queries/attempts.ts`：新增 `listLatestClaimEvents`，approved 列表带 `formalStatus`
- `src/i18n.tsx`：formal kind 的双语标签
- `api/claims-write.test.ts`（新）：门控 / 校验 / 账本映射 7 例
- `vitest.config.ts`：`@db` 别名（测试直引 schema 类型）

## 验证

干净环境（`npm ci`）下：

- `npm run check`（tsc -b）通过
- `npm run check:problems` 通过
- `npm test`（vitest）7/7 通过
- `npm run build` 通过
- 运行时冒烟（dummy env 起服务）：`/api/problems.json` 200（114 题、带 ETag）；
  `feed.json` 200；两个 claims 端点闭门返回 501 `app_error`

## 顺带修复的存量问题（main 上即存在）

`npm run check` 在 main 基线上有 10 个错误（此前因本地无 node_modules 从未被
执行过，见旧版 tech-spec 的 constraint 注记），本分支一并修复：

- `api/kimi/auth.ts`：`createOAuthInitHandler` 重复导出（TS2323）
- `api/middleware.ts`：引用了不存在的 `ErrorMessages.insufficientRole`
- `api/queries/submissions.ts` / `updates.ts`：从 drizzle-orm 导入了不存在的
  独立 `innerJoin`（join 是查询构建器方法，不是顶层导出）
- `src/pages/StatsPage.tsx`：把函数当 map 索引
- `src/pages/HomePage.tsx`：tRPC `useQuery(undefined)`
- `src/data/problems.ts`：`engineering_value` 双引号串内嵌未转义 ASCII 引号
  （解析错误），及 113 处 `proposed_year` 数字字面量与接口声明 `string` 不符
  （同时导致 contracts 正则解析丢年份）——该文件约 450KB，超出本次交付的
  写入通道体量上限，修复以等价脚本形式附在 PR 描述中，需维护者本地执行后
  push（两条确定性变换，已在本分支其余修复之上验证全绿）

## 后续

- 观察门面闭门期的 501 命中量，决定何时置 `CLAIMS_WRITE_ENABLED=1`
- 放开后考虑给门面加调用方标识（API key / agent 自报名），便于审稿溯源
- 修复工作流方案（CI 就地修复 problems.ts）因 OAuth token 缺 `workflow`
  scope 未能推送；若日后补授权，可按 PR 描述中的 workflow 草稿恢复该路径
