// 应用侧 Mathlib 入口：mathlib↔工程问题 的双向映射 + 结构化失败记录。
//
// 双向映射的两个方向：
//   A 工具→问题（供给侧）：mathlib 的某个工具族能支撑哪些工程判定（certifies）。
//   B 问题→工具（需求侧）：某道题需要但 mathlib 尚缺 / 尚不充分的工具（missing/partial）。
// 载体：Problem.tool_links（本题↔工具的 m:n 链接）。
//
// 结构化失败记录：把 Problem.obstacles（人读散文）升级出机读版本
// Problem.failure_records = { method, mechanism, layer, partial, implication }，
// 供 AI agent 按"失败机制类型学"复用同族工具。

/** 失败机制类型学：已知方法为什么卡住。 */
export type FailureMechanism =
  | 'combinatorial' // 组合/量级爆炸：候选结构随尺度指数增长，枚举不可行
  | 'missing_bound' // 缺先验界：论证所需的必要上界尚不存在
  | 'nonconvex' // 非凸/不可判定：目标非凸或判定问题困难，无通用停机保证
  | 'unbounded_residual' // 残差不可控：模型/数值残差给不出显式可复核上界
  | 'parameter_sensitive' // 参数/测量敏感：输入不确定度传播被放大

/** 障碍发生的阻塞层。 */
export type FailureLayer = 'model' | 'param' | 'num' | 'formal'

/** 一条结构化失败记录（机读版障碍）。 */
export interface FailureRecord {
  /** 尝试过的已知方法（来自 obstacles/progress 中的真实记载，不凭空发明）。 */
  method: string
  /** 该方法的失败机制。 */
  mechanism: FailureMechanism
  /** 卡在哪个阻塞层。 */
  layer?: FailureLayer
  /** 已知的部分结果（已有文献证明了什么）。 */
  partial?: string
  /** 对 AI 智能体/形式化的启示：这条路标指向哪里。 */
  implication?: string
}

/** 工具↔问题 链接的角色。 */
export type ToolRole = 'available' | 'partial' | 'missing'

/** Problem.tool_links 中的一项：本题与某形式工具的关系。 */
export interface ToolLink {
  tool_id: string
  role: ToolRole
}

/** 形式工具注册表条目（mathlib 工具族）。 */
export interface FormalTool {
  id: string
  name: string
  /** mathlib 中的相关区域/声明族（描述级，非精确模块路径）。 */
  area: string
  /** 工具族分类。 */
  category: string
  /** 能支撑什么工程判定。 */
  blurb: string
  url: string
}

/** mathlib4 文档首页（工具条目的通用出处；不虚构精确模块链接）。 */
export const MATHLIB_DOCS_URL = 'https://leanprover-community.github.io/mathlib4_docs/'

export const MATHLIB_TOOLS: FormalTool[] = [
  {
    id: 'spectral-operator',
    name: 'Spectral & operator theory',
    area: 'spectral theory of self-adjoint operators, spectral gaps, resolvent bounds',
    category: 'analysis',
    blurb: 'Certifies spectral gaps, localization and resolvent bounds for quantum / thermal engineering judgements.',
    url: MATHLIB_DOCS_URL,
  },
  {
    id: 'measure-ergodic',
    name: 'Measure & ergodic theory',
    area: 'measure theory, ergodic theorems, mixing',
    category: 'analysis',
    blurb: 'Certifies mixing rates, ergodicity and invariant-measure bounds for turbulent and transport models.',
    url: MATHLIB_DOCS_URL,
  },
  {
    id: 'analysis-asymptotics',
    name: 'Analysis & asymptotics',
    area: 'real analysis, limits, asymptotics, inequalities',
    category: 'analysis',
    blurb: 'Certifies convergence rates, asymptotic exponents and norm bounds for stability / mixing judgements.',
    url: MATHLIB_DOCS_URL,
  },
  {
    id: 'topology',
    name: 'Topology & continuity',
    area: 'topological spaces, continuity, compactness, fixed points',
    category: 'analysis',
    blurb: 'Certifies existence / fixed-point and compactness arguments in reaction-network and control settings.',
    url: MATHLIB_DOCS_URL,
  },
  {
    id: 'lattice-order',
    name: 'Lattice & monotone operator theory',
    area: 'orders, lattices, Tarski fixed points, monotone operators',
    category: 'algebra',
    blurb: 'Certifies monotone / order-theoretic arguments for reaction networks and consensus dynamics.',
    url: MATHLIB_DOCS_URL,
  },
  {
    id: 'convex-optimization',
    name: 'Convex optimization & SDP',
    area: 'convexity, cones, semidefinite programming, SOS',
    category: 'optimization',
    blurb: 'Certifies feasibility / optimality bounds for SOS–SDP relaxations in G-closure and global optimization.',
    url: MATHLIB_DOCS_URL,
  },
  {
    id: 'interval-numerics',
    name: 'Interval arithmetic & certified numerics',
    area: 'interval arithmetic, certified root finding, interval maps',
    category: 'numerics',
    blurb: 'Certifies rigorous numerical bounds — the R_num residual layer — for residual bands and thresholds.',
    url: MATHLIB_DOCS_URL,
  },
  {
    id: 'combinatorics-graph',
    name: 'Combinatorics & graph theory',
    area: 'graph theory, combinatorics, extremal combinatorics',
    category: 'algebra',
    blurb: 'Certifies graph-theoretic classifications: benzenoid spectra, selection amplifiers, consensus graphs.',
    url: MATHLIB_DOCS_URL,
  },
  {
    id: 'polynomial-real',
    name: 'Real algebraic geometry',
    area: 'real polynomials, nonnegativity, quantifier elimination, real-closed fields',
    category: 'optimization',
    blurb: 'Certifies real-solvability / nonnegativity judgements — Smale-17 style decision problems.',
    url: MATHLIB_DOCS_URL,
  },
  {
    id: 'stochastic-processes',
    name: 'Probability & stochastic processes',
    area: 'martingales, Markov chains, contact / epidemic processes, large deviations',
    category: 'analysis',
    blurb: 'Certifies extinction times, fixation probabilities and quasi-stationary bounds in epidemic / evolutionary models.',
    url: MATHLIB_DOCS_URL,
  },
  {
    id: 'dynamical-systems',
    name: 'ODE/PDE & dynamical systems',
    area: 'differential equations, stability, Lyapunov theory',
    category: 'analysis',
    blurb: 'Certifies global stability, persistence and convergence rates for reaction and consensus dynamics.',
    url: MATHLIB_DOCS_URL,
  },
  {
    id: 'algebra',
    name: 'Algebra & algebraic structures',
    area: 'groups, rings, modules, fields, exact algebra',
    category: 'algebra',
    blurb: 'Backs exact algebraic identities and structural arguments in chemistry and physics models.',
    url: MATHLIB_DOCS_URL,
  },
]

export const MECHANISM_LABEL: Record<FailureMechanism, string> = {
  combinatorial: 'Combinatorial / scaling blow-up',
  missing_bound: 'Missing a-priori bound',
  nonconvex: 'Non-convex / undecidable',
  unbounded_residual: 'Uncontrollable residual',
  parameter_sensitive: 'Parameter / measurement sensitive',
}

export const TOOL_ROLE_LABEL: Record<ToolRole, string> = {
  available: 'Available',
  partial: 'Partial',
  missing: 'Missing',
}

export const toolById = (id: string): FormalTool | undefined => MATHLIB_TOOLS.find((t) => t.id === id)
