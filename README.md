# MathX 问题站

数学问题开放目录 + 社区协作站点：以「开放数学问题」为知识图谱核心（数学物理/化学/生物/工程四个领域），提供问题浏览、网络关系图、形式化进度、社区投稿与后台审核。

完整技术基线见 [docs/tech-spec.md](docs/tech-spec.md)。

## 技术栈

- 前端：React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- 后端：Hono + tRPC v11 + Drizzle ORM + Cloudflare D1 (SQLite)
- 认证：Kimi OAuth + jose 会话（独立管理入口走 Bearer 令牌）

## 目录结构

```
api/        后端（boot/router/middleware/kimi/queries）
contracts/  前后端共享常量、错误、类型出口
db/         数据库 schema 与迁移
src/        前端（pages/components/data/i18n/providers）
scripts/    独立校验脚本（check-problems.mjs）、线上核验（verify.py）
docs/       技术基线与变更记录
```

## 常用命令

```
npm run dev           启动开发服务器
npm run build         构建前端 + 服务端
npm run check         tsc -b 类型检查
npm run check:problems 校验问题目录不变量（id 唯一/无悬空/judgment/关系对称性）
npm test              vitest 单元测试（api 目录）
npm run db:push       同步 Drizzle schema 到数据库
```

## 数据说明

问题目录唯一事实来源是 `src/data/problems.ts`（静态 TS）。社区提交与问题更新写入数据库，详情页会将两者合并展示。目录不变量由 `scripts/check-problems.mjs` 强制，每周由 GitHub Actions（`weekly-verification`）核验开放状态并提交 `public/monitor.json`。

外部 agent / 证明流水线可经双桥写路径 `POST /api/v1/claims/:id/narrow`（带证收窄）与 `POST /api/v1/claims/:id/formal`（形式化补证）提交声明：默认闭门（501），置 `CLAIMS_WRITE_ENABLED=1` 后进入与前端投稿相同的 `problem_attempts` 审稿账本，审批通过后经 `feed.json` 对下游同步。

## 治理与贡献

**收录标准**（`scripts/lib/catalog-checks.mjs` 强制，替代人工把关）：
- 判定须为独立句式，附合格答案类型（证明证书 / 数值判据 / 反例构造），不含模板骨架。
- `verified_behavior` 问题须覆盖三层残差（`R_model` 模型近似 / `R_param` 输入不确定度 / `R_num` 数值），总带 ≤ 三者之和；`verified_truth` 可为 `provable`。
- 溯源完整（`proposer` / `via` / `proposed_year`），历史变更写入 `updates` 留痕。
- 产出可消费：`output` 标注应用传递强度，`verified_behavior` 须给出可直接消费的 `engineering_value`。
- 双桥可选字段受枚举门禁校验：`formal_view.status` ∈ provable/conjectured/refuted，`bridge.direction` ∈ formal_idealizes_banded/banded_instantiates_formal/mutual_boundary，`bridge.shared_residuals` 元素须为带侧已知残差层；`formal_view.status=refuted` 时 `lifecycle_status` 须落到 refuted/superseded。

**审稿流程**：社区提交进详情页账本，审稿人核对生命周期（open/tightened/refuted/superseded）与三层残差；任何状态迁移须写入 `updates` 留痕，并通过 `problem_attempts` 记录。审查通过后才并入目录事实来源。

**许可**：本仓库源码采用 MIT；问题与协议数据采用宽松许可（数据 CC0，可选署名 CC-BY），移除复用与合作门槛。
