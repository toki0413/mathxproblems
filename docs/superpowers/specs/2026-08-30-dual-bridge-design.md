# 双桥协议(Dual-Bridge Protocol)设计 spec

*日期:2026-08-30 · 状态:待评审 · 前置:产品调研 `product-research-dual-bridge`(2026-08-30,历史会话结论)*

## 1. 命题

AI4Math 与 AI4S 存在割裂:

- **AI4Math**(Lean/mathlib、证明助手、形式化基准)的通货是"形式化证明证书"——精准、机器可验、绝对正确,但没有真实世界内容。
- **AI4S**(材料/化学/生物 AI 发现、仿真代理、生成模型)的通货是"预测误差界 + 可复现协议"——内容真实有用,但很少能给出气密的、机器可验的带。

**本 spec 断言:** 割裂的调和方式不是去建更聪明的证明引擎,也不是去建更聪明的审稿器,而是**在两者之间放一层"声明双视图"协议**:同一个声明,对 AI4Math 端暴露 `formal_view`(形式化规范形 + 判定 + 状态),对 AI4S 端暴露 `banded_view`(三层残余带证),并显式声明两者关系 `bridge`。网站从"问题库"演进为"可信声明注册层"。

## 2. 目标与非目标

### 目标
1. 定义并序列化"双桥":`formal_view` + `banded_view` + `bridge`。
2. 通过现有稳定契约栈(`/api/v1/*`,ETag + 版本)把声明暴露为机器可消费 JSON。
3. `formal_view` 设计成**可引用外部形式化工件**(Lean 文件 / benchmark entry),不造站内 Lean 引擎。
4. 第一版做薄、可落地(读侧契约 + 双桥视图);写路径(C,A 的演进)留接口但默认闭门。

### 非目标(本题不做)
- 不接真 Lean/自动形式化/证明循环引擎。
- 不做 AI 审稿/证据链评分器(SoundnessBench/SCIREVIEW 类)。
- 不做 zkML/计算完整性证明。
- `formal_view` 的状态(`provable/conjectured/refuted`)由人/agent 填写或引用外部工件,不经站内验证。

## 3. 抽象模型

`Claim(声明)` 是原子单元。它只有一份事实来源,对两端各暴露一个自洽视图,由 `bridge` 声明两者关系:

- **formal_view(AI4Math 端)**:把声明渲染成可形式化的规范形语句 + 判定 + 形式化状态(provable/conjectured/refuted)。消费方式是"证明/证伪"。
- **banded_view(AI4S 端)**:把同一声明渲染成经验现实侧 + 三层残余带证(R_model + R_param + R_num,total_band, certified_band)。消费方式是"在什么带内成立"。
- **bridge**:两端声明的**语义连接**——最典型是 *"formal 定理 T 恰是 banded 声明 C 的 ε→0 理想化"*。桥承载这条映射:M 侧"证 T ⇒ C 的结构被锚定";S 侧"C 在带内成立 ⇒ T 的理想化边界被照亮"。

**关键对位(来自产品调研):** 这是 [Proof-Carrying Materials (PCM)](https://arxiv.org/html/2603.12183v1)(材料 MLIP:对抗性证伪 + bootstrap 置信带 + Lean 4 形式认证)的**通用化**。PCM 证明抽象成立,但是单领域、一次性的科研管线;本协议把它抽成跨领域、版本化、可被两端消费的通用基础设施。`bridge` 字段的语义注释应显式引用这一对位。

## 4. 与现有代码的关系(加法,非改写)

现有 `Problem` 接口(`src/data/problems.ts`)已承载大量双桥所需的通货(`certificate` 三层残差、`judgment`、`output`、`lifecycle_status`、`formalization_notes`、`via/proposer/updates`、`related_problems`)。因此:

- `banded_view` **直接映射现有 `certificate`**(r_model/r_param/r_num → total_band → certified_band),不重造。
- `formal_view` 是**新增**字段,承接 `statement`/`formalization_notes`/`judgment` 的形式化面向 + 资源化潜能。
- `bridge` 是**新增**字段,承接 `related_problems.depends_on` 的继承语义(收紧/证伪双方向),并刻画二者语义连接。
- `domain/output/lifecycle_status/impact_domains/proposer/via/updates` 原样沿用。

## 5. 数据契约(schema)

```ts
type FormalStatus = 'provable' | 'conjectured' | 'refuted'

// formal_view —— AI4Math 端消费;承接 statement/formalization_notes/judgment 的形式化面向
type FormalView = {
  statement: string            // 规范形语句渲染(可被证明/证伪的形式)
  target: string               // 目标形式系统, 如 'Lean4/mathlib'; 或 'external' 指向外部工件
  artifact?: { label: string; url: string } // 引用外部形式化工件(如 Lean file / benchmark entry)
  judgment: string             // 合格答案类型: 证明证书 / 数值判据 / 反例构造
  status: FormalStatus         // provable | conjectured | refuted
  via?: string                 // 溯源: 证明/反例出处
}

// banded_view —— AI4S 端消费;直接映射现有 Certificate 三层残差
// (见 src/data/problems.ts 的 Certificate / ResidualLayer: 各层含 bound + derivation)
// banded_view 不新增存储,导出时从 Problem.certificate 投影而来。
type BandedView = {
  statement: string                                  // 经验/现实侧渲染
  residuals: { r_model; r_param; r_num }              // 各层 ResidualLayer(bound + derivation)
  total_band: string   // 预算: bandwidth ≤ R_model+R_param+R_num
  certified_band: string // 当前已证带 (optional)
}

// bridge —— 两端关系声明(对齐 PCM 语义)
type Bridge = {
  link: string      // 如 'T 是 C 的 ε→0 理想化'; 也用于 PCM 式 '经验带 + 形式证互为边界'
  direction: 'formal_idealizes_banded' | 'banded_instantiates_formal'
  band_as_fn_of_eps?: string   // 带随理想化参数收缩的关系(可选)
}

// 叠加在现有 Problem 之上的双桥视图;其余字段原样
// 此类型是"导出到 /api/v1/dual-bridge.json 时的投影视图",非存储实体。
// 存储侧只在现有 Problem 上新增两个可选字段: formal_view、bridge; banded_view 由 certificate 承担。
type DualBridgeView = {
  id: string
  domain: string
  output: 'verified_behavior' | 'verified_truth' | 'scaffolding'
  lifecycle_status: 'open' | 'tightened' | 'refuted' | 'superseded'
  formal: FormalView
  banded: BandedView
  bridge: Bridge
  impact_domains: string[]
  depends_on: string[]   // 继承链: 上游收紧⇒下游带收紧; 上游证伪⇒下游带失效
  proposer?: string; proposed_year?: number; via?: { label: string; url?: string }
  updates: { date: string; note: string }[]
}
```

要点:
- 不新增独立 `Claim` 实体,而是**在现有 `Problem` 上叠加 `formal_view` + `bridge` 两个可选字段**(`banded_view` 由 `certificate` 承担),避免数据重复与迁移成本。
- 依赖库 `depends_on` 延续现有 `related_problems` 继承语义,双向标注(收紧/证伪)。

## 6. 接口规范

### 读(稳定契约,版本化 + ETag,沿用现有 `snapshotVersion`)
```
GET /api/v1/problems.json         → { version, generated, count, problems: Problem[] }  // 含新增 formal_view/bridge
GET /api/v1/dual-bridge.json      → { version, count, claims: DualBridgeView[] }         // 仅双桥视图,供两端消费
GET /api/v1/benchmark.json        → 现有; 若输出形式化潜能列为 high 则顺带暴露 formal_view
```

### 写(C 演进,先留接口默认闭门;经审稿/attempts 机制)
```
POST /api/v1/claims/:id/narrow    → 收紧 certified_band(S 侧) → attempt(kind='narrow') → 进账本 + feed
POST /api/v1/claims/:id/formal    → 更新 formal.status(M 侧: 证/反例) → attempt(kind='formal') → 进 lifecycle + feed
```
写路径是现有 tRPC 审稿/attempts 的**薄 HTTP 门面**,便于外部 agent 不碰 tRPC 也能提交;前端仍走原 tRPC。**第一版:端点可注册但返回 `501/Not Implemented` 或按配置关闭**,只在写机制就绪后放开。

### 同步(已有,扩展覆盖)
```
GET /api/v1/feed.json  → 现覆盖 narrow 收窄;扩展覆盖 formal 补证
```

## 7. 边界与可落地顺序(方案 A 优先,C 留白)
1. **A(本版)**:数据契约加 `formal_view` + `bridge` 字段 → 导出进 `/api/v1/dual-bridge.json` → 详情页加"双桥视图"可视化(形式侧 vs 带侧并列)。写路径注册但关闭。
2. **C(演进)**:放开 `narrow`/`formal` 写端点,经审稿/账本/feed 闭环,允许消费方回写。

## 8. 测试与校验
- `scripts/check-problems.mjs`:新增对 `formal_view` 状态枚举、`bridge.link` 非空、`formal.judgment` 存在的校验;对含 `formal_view` 的新问题保持现有"独立判定句式"反再生门禁。
- 目录契约测试沿用 `catalog-checks.test.mjs`。
- 双桥视图 `dual-bridge.json` 走现有 snapshot/ETag 单测路径。

## 9. 待评审问题(留给 spec 评审)
- `bridge.direction` 两个枚举是否够,还是要加"互为"共生模式(如 PCM 的边界对偶)。
- `dual-bridge.json` 是否值得独立出口,还是并入 `problems.json` 的字段即可。
- `formal.status` 初始默认 `conjectured`,还是允许 `verified_truth` 类声明填 `provable`。