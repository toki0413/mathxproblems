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
// direction 三种模式: 形式侧理想化带侧 / 带侧例示形式侧 / 两者互为边界(共生, PCM 式互证)
type Bridge = {
  link: string      // 如 'T 是 C 的 ε→0 理想化'; 也用于 PCM 式 '经验带 + 形式证互为边界'
  direction:
    | 'formal_idealizes_banded'   // formal T 是 banded C 的 ε→0 理想化
    | 'banded_instantiates_formal'// banded C 例示/锚定 formal T 的现实内容
    | 'mutual_boundary'           // 共生: 形式证与经验带互为边界(最贴近 PCM)
  band_as_fn_of_eps?: string   // 带随理想化参数收缩的关系(可选)
}

// 暴露方式(并入问题契约,不独立出口):
// 现有 Problem 之上新增两个可选字段 —— formal_view?: FormalView、bridge?: Bridge;
// banded_view 不新增存储,由 Problem.certificate 承担,随 problems.json 的 Problem 序列化输出。
// formal_view.status: verified_truth / verified_behavior 类声明均可填 provable;缺省 conjectured。
```

要点:
- 不新增独立 `Claim` 实体,而是**在现有 `Problem` 上叠加 `formal_view?` + `bridge?` 两个可选字段**(`banded_view` 由 `certificate` 承担),避免数据重复与迁移成本。
- 依赖库 `depends_on` 延续现有 `related_problems` 继承语义,双向标注(收紧/证伪)。
- **不独立出口双桥**;`formal_view`/`bridge` 作为 Problem 的可选字段随 `problems.json` 序列化,两端消费同一契约。

## 6. 接口规范

### 读(稳定契约,版本化 + ETag,沿用现有 `snapshotVersion`)
```
GET /api/v1/problems.json    → { version, generated, count, problems: Problem[] }  // 含新增 formal_view/bridge 可选字段
GET /api/v1/benchmark.json   → 现有; 若形式化潜能列为 high 则顺带暴露 formal_view
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
1. **A(本版)**:数据契约加 `formal_view?` + `bridge?` 字段 → 随 `problems.json` 序列化输出 → 详情页加"双桥视图"可视化(形式侧 vs 带侧并列)。写路径端点注册但默认关闭。
2. **C(演进)**:放开 `narrow`/`formal` 写端点,经审稿/账本/feed 闭环,允许消费方回写。

## 8. 战略:治理与采用(护城河)

### 8.1 定位:中立协议/注册层,而非私有工具
若 moat 是"内容更多",则高校/巨头进场即败——他们堆内容、算力、形式化工具的能力远强于我们。**能长期待住的护城河在协调层 + 信任层,不在内容层。** 把双桥定位为:AI4Math 与 AI4S 之间的**中立、机器可消费、版本化的声明注册层 + 变更记录源(system of record)**。中立协议的价值来自被多方共同依赖(参考 Wikidata / DNS),任何单一玩家没有独占动力,故持久。

### 8.2 信任即产品(可信度是差异点,不是负担)
AI 生成内容可信度存疑——这正是本项目的稀缺筹码。审稿、溯源(proposer/via/year)、反作弊门禁、独立判定句式、生命周期治理越做越严,越构成抄不走的资产。"AI 灌水"焦虑反过来是护城河的来源。
- 质量门槛随基础设施要求收紧:每条声明须可审计(来源 + 判定 + 校验方),生命周期迁移(open/tightened/refuted/superseded)须留痕于 `updates`/账本。

### 8.3 协议先于价值
先立可消费协议(双桥字段 + `problems.json` + feed),再谈内容规模。协议让它成为"他人必须接入的层",而非"可被替换的内容页"。首版即按稳定契约交付:版本 + ETag + 变更 feed + 语义规范。

### 8.4 开放中立治理(避免单维护者项目)
- **许可**:数据与协议采用宽松许可证(拟定:数据 CC0/CC-BY,源码 MIT),移除合作/复用门槛。
- **共建入口**:新增 `CONTRIBUTING`(收录标准、判定独立句式要求、审稿流程)与轻量治理文档(`GOVERNANCE`,维护者+审稿人角色划分、决策记录)。
- **中立**:声明生命周期与"收窄/补证"结果以公开账本与 feed 呈现,任何外部流水线可基于同源数据校验,不依附单一机构。

### 8.5 采用策略(锚定采用者)
1. 先跑通"声明→双桥视图→problems.json→feed"的可消费闭环(A)。
2. 争取**2 个锚定采用者**作为最低门槛:一条证明/形式化流水线 + 一个 AI4S 团队(如材料/仿真)**真的拉取 feed 做增量同步**。
3. 用"信任 + 结果记录"作为对外品牌:公开 lifecyle/账本/feed 即活跃度证明,替代"我们内容多"的宣传。

### 8.6 已知上限(诚实标注)
- 无治理组织的开放项目仍是单维护者项目,巨头可无视、可改名吸走贡献者。8.4 的治理文档是缓解,不是完整解。
- 采用经济证据为零(见产品调研 §4 风险);是否有人真的消费 feed 是未知。故本 spec 落地顺序仍**先 A(协议)、再 C(写路径)**,不抢生态位。

## 9. 测试与校验
- `scripts/check-problems.mjs`:新增对 `formal_view.status`、`bridge.direction` 枚举合法性、`formal_view.judgment` 存在的校验;对含 `formal_view` 的新问题保持现有"独立判定句式"反再生门禁。
- 目录契约测试沿用 `catalog-checks.test.mjs`;`problems.json` 的 snapshot/ETag 单测路径覆盖新增可选字段。
- 双桥视图轮询走现有 catalog build + ETag 校验。

## 10. 已决策
1. `bridge.direction` 采用三值: `formal_idealizes_banded` / `banded_instantiates_formal` / `mutual_boundary`(共生,PCM 式互证)。
2. **不独立** `dual-bridge.json`;`formal_view`/`bridge` 作为 Problem 可选字段并入 `problems.json`。
3. `formal.status` 允许 `verified_truth` / `verified_behavior` 类声明填 `provable`;缺省 `conjectured`。