# MathX Problems

> **数学 × 科学的开放问题目录**——把散落在自然科学与工程里的、可精确数学化陈述的开放问题，收进一张带判定形式、障碍记录与形式化进度的知识图谱，让 AI 智能体与证明者（prover）真正"接得上手"。

**在线站点**：https://mathx-bridge.pages.dev

MathX Problems 是面向"AI for math"的基础设施：过去两年 AI 在纯数学里取得的突破（多智能体协作证明、Lean 形式化验证、自动引理生成）几乎锁死在象牙塔；而物理、化学、生物与工程里涌现的大量可严格数学化陈述的问题——可积系统的收敛性、反应网络的持久性判定、流行病模型的精确阈值、多智能体一致性的收敛速率——却"无家可归"：纯数学平台觉得太应用，自然科学平台不做数学归档。

这个目录要做中间层。我们不收录 Yang–Mills 质量间隙（Clay 官网已做），也不收录"设计一个更好的电池"（不是数学问题）。我们收录的，是那些**圈内人知道、圈外人找不到、AI 可以试着解决**的子领域硬骨头——每道题都带：

- **判定形式**（`judgment`）：可被机器判定的独立句式与合格答案类型（证明证书 / 数值判据 / 反例构造）；
- **障碍记录**（`obstacles`）：已知的、挡住前进的具体障碍；
- **形式化潜力**（`formalization_potential`）与**溯源**（`proposer` / `via` / `proposed_year`）；
- **机器核验锚点**（Lean 可编译陈述 / 失败类型学 / 证书记录），结构性质核验，而非"已解决"标签。

四个领域：**数学物理 · 数学化学 · 数学生物 · 数学工程**。

---

## 核心能力

| 模块 | 说明 |
| --- | --- |
| **问题目录** | 121 道开放问题（core 114 / vetted 7），跨领域、可判定、可验证，收录口径对齐全局里程碑 |
| **双语切换** | 全站中英一键切换（~350 键 i18n），数据字段按语言渲染，杜绝混排 |
| **关系网络图** | 五类关系 `depends_on / implies / shares_tools / generalizes / analog_of`，对称边由数据侧自动派生，交互式图谱浏览 |
| **障碍路由层** | 从目录构建跨题"已知障碍"相似链 + 方法解锁（方法 → 还能松哪些题的绑），`/api/v1/obstacles.json` 暴露 |
| **Lean 形式化锚点** | 112 个陈述由 CI 用 Lean 4 工具链逐字编译 + 内联一致性守卫（L0 锚点），UI 文案与已验证内容零漂移 |
| **经验定律图谱** | 6 条经验定律（Michaelis–Menten、Monod、mixing-length、Fourier、Darcy、S–N/Miner）的边界/失效域/形式化缺口 |
| **工程反向需求清单** | 24 条需求，判定链锚定 41 道题 + 4 条定律，缺口驱动收题流水线 |
| **影响域证据链** | 30 个影响域注册表，18 篇 arXiv 论文逐篇人工核验（非生成），26 道题挂接 |
| **协议账本** | 只追加（append-only）、带证据哈希 + 参考核验器判定，可独立复核 |
| **机器可读 API** | 稳定、可版本化的 JSON 出口，带 ETag / X-Version / 契约版本，供 agent/证明流水线增量拉取 |
| **社区协作层** | 匿名投稿 → 审稿队列、评论、红旗、候选/投票、独立管理入口（Bearer 令牌） |
| **双桥写路径** | 带证收窄与形式化补证接口，默认闭门（501），显式开放后写入同一审稿账本，不产生第二份事实来源 |
| **周更核验** | GitHub Actions 检索 OpenAlex + arXiv"可能已解决"信号并更新 `public/monitor.json` |

---

## 机器可读 API

所有出口带 `ETag` / `X-Version`（`v1-<etag>`）/ `X-Contract-Version`，支持 `If-None-Match` 增量拉取：

```
GET /api/v1/problems.json      目录快照
GET /api/v1/benchmark.json     判定基准
GET /api/v1/tools.json         形式工具注册表（mathlib 工具族 ↔ 工程判定）
GET /api/v1/laws.json          经验定律边界图谱
GET /api/v1/impact.json        影响域实证链（arXiv 证据锚点）
GET /api/v1/needs.json         工程反向需求清单
GET /api/v1/needs/coverage.json 需求侧聚合覆盖
GET /api/v1/ledger.json        协议账本导出
GET /api/v1/feed.json          变更 feed（带证收窄 + 形式化补证）
GET /api/v1/obstacles.json     障碍路由层
GET /api/v1/feed.xml           RSS 订阅
```

双桥写路径（默认闭门，置 `CLAIMS_WRITE_ENABLED=1` 放开）：

```
POST /api/v1/claims/:id/narrow   带证收窄（S 侧）
POST /api/v1/claims/:id/formal   形式化补证（M 侧）
```

---

## 技术栈

- **前端**：React 19 + TypeScript（strict）+ Vite + Tailwind CSS + shadcn/ui
- **后端**：Hono + tRPC v11 + Drizzle ORM，路由级懒加载 + vendor 按内容哈希长缓存
- **存储**：Cloudflare D1 (SQLite)，Drizzle migrations 管理
- **认证**：Kimi OAuth + jose 会话；独立管理入口走 Bearer 令牌
- **部署**：GitHub Actions（守卫 + lint/tsc + Lean 编译 + 构建）→ Cloudflare Pages（Advanced Mode，单入口 `_worker.ts`）
- **安全**：全站 CSP / HSTS / X-Frame-Options 等安全响应头由 Worker 统一注入；写路径默认闭门（安全默认）

完整技术基线见 [docs/tech-spec.md](docs/tech-spec.md)。

---

## 目录结构

```
api/        后端（boot/router/middleware/queries/claims-write/obstacle-graph）
contracts/  前后端共享常量、错误、判定契约与类型出口
db/         数据库 schema 与迁移
lean/       Lean 4 陈述与共享核验模块（CI 逐字编译）
src/        前端（pages/components/data/i18n/providers）
scripts/    独立校验守卫与线上核验（check-problems.mjs / verify.py 等）
docs/       技术基线、变更记录与设计文档
public/     静态产物（monitor.json）
```

---

## 常用命令

```
npm run dev             启动开发服务器（Hono 注入 Vite dev server）
npm run build           构建前端 + Cloudflare worker 入口
npm run check           tsc -b 类型检查
npm run check:problems  校验目录不变量（id 唯一/无悬空/judgment/关系对称性）
npm test                vitest 单元测试（api 目录）
npm run db:push         同步 Drizzle schema 到数据库
npm run lint            eslint（0 error 门禁）
```

---

## 数据与事实来源

问题目录**唯一事实来源**是 `src/data/problems.ts`（静态 TS），目录不变量由 `scripts/check-problems.mjs` 强制。社区提交与问题更新写入 D1 数据库，详情页将两者合并展示。每周由 `weekly-verification` 核验开放状态并提交 `public/monitor.json`。

**收录标准**（`scripts/lib/catalog-checks.mjs` 强制，替代人工把关）：

- 判定须为独立句式，附合格答案类型（证明证书 / 数值判据 / 反例构造），不含模板骨架；
- `verified_behavior` 问题须覆盖三层残差（模型近似 / 输入不确定度 / 数值），总带 ≤ 三者之和；`verified_truth` 可为 `provable`；
- 溯源完整（`proposer` / `via` / `proposed_year`），历史变更写入 `updates` 留痕；
- 产出可消费：`output` 标注应用传递强度，`verified_behavior` 须给出可直接消费的 `engineering_value`。

**审稿流程**：社区提交进详情页账本，审稿人核对生命周期（open/tightened/refuted/superseded）与三层残差；任何状态迁移写入 `updates` 留痕并经 `problem_attempts` 记录，审查通过后才并入目录事实来源。

**许可**：本仓库源码采用 MIT；问题与协议数据采用宽松许可（数据 CC0，可选署名 CC-BY），移除复用与合作门槛。
