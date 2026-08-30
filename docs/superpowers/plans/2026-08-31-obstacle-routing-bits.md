# 障碍路由层 + 收窄比特计量 落地记录

- 日期：2026-08-31
- 分支：`feat/obstacle-index-bits`（基于 `feat/claims-write-v2`，依赖其构建修复）
- 动机：目录每道题都记了 obstacles，但它们是死文字；收窄账本只记新带不记贡献量。
  本计划把两者各自翻转：障碍变成路由层，收窄变成可计量的信息流。

## 决策

1. **不做词表分类法，做文本相似图**。实测 210 条障碍的加粗头两两不复用，
   关键词规则分类覆盖率封顶约四成且规则脆弱。改为双语签名（英文内容词去停用词
   去 LaTeX ∪ 中文二元组）+ 跨题 Jaccard ≥ 0.1 连边：确定性、透明（规则全部在
   `api/obstacle-graph.ts` 一处）、随目录增长自动变密。阈值集中常量
   `OBSTACLE_LINK_THRESHOLD` 可调。建议层定位：宁缺毋滥。
2. **方法解锁沿图扩散一跳**。审稿账本新增可选 `method` 自由文本列（刻意非枚举：
   方法集合无法预先封闭）；已通过声明的 method 沿障碍链扩散，回答「这项技术
   还能松哪些题的绑」。这是 routing 的另一半：图是静态的，方法是账本喂出来的。
3. **比特 = -log2(新带宽/旧带宽)，题内成链**。基线是题内上一条已通过的
   verification 的 `newBand`，不引用目录——`certificate.certified_band` 是描述性
   文字不可解析。链首记 null（诚实缺失）。负比特不截断：带宽反扩是审稿该看见的
   审计信号。解析宁严毋宽（`contracts/band.ts` 只认 `[a, b]`/`(a, b)`）。
4. **契约只做加法**。`problems.json` 每题新增 `obstacles` 数组；feed 事件新增
   `bits`/`method`；新增 `/api/v1/obstacles.json`（链 + unlocks + 统计，带 ETag）。
   旧消费方不受影响。
5. **tRPC 与写门面同源接受 method**（`attempts.submit` 与 claims-write 两个
   schema 同改），不产生第二份事实来源。

## 触碰面

- `contracts/band.ts`（新）：parseBand / bandWidth / bandBits 纯函数，前后端同源
- `api/band.test.ts`（新）：解析与比特计量 7 例
- `api/catalog.json.ts`：块级多行数组解析 `blockArr`，catalog 输出加 `obstacles`
- `api/obstacle-graph.ts`（新）：签名 / 连边 / 方法解锁 / 载荷装配
- `api/obstacle-graph.test.ts`（新）：双语签名、连边、阈值、扩散 6 例
- `db/schema.ts`：`problem_attempts.method` 可选列（varchar 80）
- `api/attempts-router.ts`、`api/claims-write.ts`：接受 method
- `api/queries/attempts.ts`：`attachBandBits`（链式比特）、`listMethodEvents`，
  `listLatestVerifications`/`listLatestClaimEvents` 附 bits+method
- `api/boot.ts`：`/api/v1/obstacles.json`（DB 缺失时 unlocks 为空，不 500）

## 验证（干净环境 npm ci）

- `npm run check` ✅ / `npm run check:problems` ✅ / `npm test` 20/20 ✅ / `npm run build` ✅
- 运行时冒烟：`/api/v1/obstacles.json` 200——114 题 / 210 障碍 / 23 条跨题链，
  与离线 Python 复算逐条一致（确定性确认）；榜首链为 mc-001「Boundary behavior」↔
  mb-004「Boundary complexity grows with n」（J=0.172，CRNT 与流行病模型的同构障碍）
- `feed.json` 200；claims 端点闭门 501 行为不变

## 后续

- 详情页/首页 UI 消费 bits 与「可能共享障碍的问题」区块（本期只到 API 层）
- method 拼写规范化（审稿侧惯例或别名表）随使用量再看
- 阈值 0.1 是按当前 114 题调的；目录规模上去后重新校准
