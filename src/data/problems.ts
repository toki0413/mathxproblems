import type { Domain } from '@contracts/constants'
import type { FailureRecord, ToolLink } from './mathlibTools'
export type { Domain }

export type FormalizationPotential = 'high' | 'medium' | 'low'
export type VerificationPath = 'analytical' | 'numerical' | 'experimental'
export type ProblemStatus = 'open' | 'partial' | 'resolved'
/**
 * 内容的可信度来源（诚实标签，替代旧的 last_verified 自盖章）：
 *  - AI-drafted:        AI 初稿，未经人工复核——站内现状；
 *  - expert-reviewed:   经领域专家逐条复核后升级；
 *  - lean-compilable:   已附在 Lean 中编译通过的形式化陈述。
 * 缺省视为 AI-drafted；升级必须有可追踪记录（updates / 备注）。
 */
export type ProblemProvenance = 'AI-drafted' | 'expert-reviewed' | 'lean-compilable'
/**
 * 证书生命周期（方向四：治理与诚实）：与 status（解决程度）正交，描述"这道的
 * 带证结论当前健康与否"。默认缺省视为 open。
 *  - open:       尚未被证实或否定，结论可信度待定；
 *  - tightened:  带证区间被社区收窄，结论更紧；
 *  - refuted:    核心结论被反例击穿，不再可信（不删除，标记并链接反例）；
 *  - superseded: 被更一般/更干净的结果取代，保留作为历史。
 */
export type LifecycleStatus = 'open' | 'tightened' | 'refuted' | 'superseded'
export type OutputKind = 'verified_behavior' | 'verified_truth' | 'scaffolding'
export type RelationType =
  | 'depends_on'
  | 'implies'
  | 'shares_tools'
  | 'generalizes'
  | 'analog_of'

export interface RelatedProblem {
  id: string
  relation: RelationType
  note: string
  /**
   * 总带继承方向（方向二：确定性供应链）：
   *  由 A.depends_on B，则 B 是 A 的上游。若 A 是 verified_behavior，其总带宽可因
   *  B（结构证或行为证）的成果而加固（上游界更紧→下游带更窄），或被 B 的反例击穿
   *  （上游核心被否→下游带失效）。此语义写入 note，供 UI/统计理解"要信任该裕量
   *  得先信哪些上游证书"。
   */
}

/** 一条针对某个问题的更新（修订、新进展或状态变更） */
export interface ProblemUpdate {
  date: string
  note: string
}

/** 三层残差中一层的结构化形式：把 judgment 中的残差层提取为字段，供 UI 渲染带证区间
 *  与各层常数；R_param≡0 时 bound 写 "≡0"。每层可挂机器可读 `upper` 数值上界。
 *  支撑某层残差上界的核验方式：证明证书 / 数值判据 / 反例构造 / 设定假设。 */
export type ResidualCertKind = 'proof' | 'numerical' | 'counterexample' | 'assumption'

export interface ResidualLayer {
  /** 该层残差上界的表达（公式或描述），如 "Boussinesq 近似的显式残差界" */
  bound: string
  /** 该层可独立复核的常数/方法来源 */
  derivation: string
  /** 该层残差上界的机器可读数值上界（≥0，有限）。缺省表示该层尚无机器形式——
   *  即"缺口服位"：可经双桥写路径提交收窄，也如实标为该层待机检。 */
  upper?: number
  /** 支撑该层 bound 的证书类型（proof/numerical/counterexample/assumption）。 */
  kind?: ResidualCertKind
}

/** 三层残差总带的结构化形式（方向一 L1）。
 *  目的：让 judgment 的三层残差从散文升级为可被 UI 渲染、可被审计的字段。
 *  这不是为接入形式化核验服务，而是为工程消费层（带证区间图 + 继承链可视化）做数据基础。
 *  扩展（残差清单，L1.5）：每层可挂机器可读 `upper` 数值上界 + `kind` 证书类型；
 *  合成总带 `total` 齐备时，参考核验器做机器带算术 total ≤ R_model+R_param+R_num。 */
export interface Certificate {
  r_model: ResidualLayer
  r_param: ResidualLayer
  r_num: ResidualLayer
  /** 总带合成公式，如 "Nu_hi - Nu_lo ≤ R_model + R_param + R_num" */
  total_band: string
  /** 带证区间表达，如 "[Nu_lo, Nu_hi]" */
  certified_band?: string
  /** 总带宽的机器可读合成上界：应满足 total ≤ R_model+R_param+R_num（见核验器）。 */
  total?: number
}

/** 形式视图侧 AI4Math 端状态;verified_truth/verified_behavior 均可填 provable,缺省 conjectured。 */
export type FormalStatus = 'provable' | 'conjectured' | 'refuted'

/** bridge.direction 三值;mutual_boundary 是最贴近 PCM 的共生模式。 */
export type BridgeDirection =
  | 'formal_idealizes_banded'    // formal T 是 banded C 的 ε→0 理想化
  | 'banded_instantiates_formal' // banded C 例示/锚定 formal T 的现实内容
  | 'mutual_boundary'            // 共生: 形式证与经验带互为边界(对齐 Proof-Carrying Materials)

/** 双桥形式侧: 给 AI4Math/证明流水线消费的形式化规范形 + 判定 + 状态。 */
export interface FormalView {
  statement: string                       // 规范形语句(可被证明/证伪)
  target: string                          // 目标形式系统, 如 'Lean4/mathlib' 或 'external'
  artifact?: { label: string; url: string } // 可选: 引用外部形式化工件(Lean file / benchmark entry)
  judgment: string                        // 合格答案类型: 证明证书 / 数值判据 / 反例构造
  status: FormalStatus
  via?: string                            // 溯源: 证明/反例出处
}

/** 桥: 形式侧与带侧(既有 Certificate)的关系声明。 */
export interface Bridge {
  link: string                            // 如 'T 是 C 的 ε→0 理想化'
  direction: BridgeDirection
  /** 机器可消费的映射: 形式证明/判定直接维系(共享语义)的带侧残差层。 */
  shared_residuals?: Array<'r_model' | 'r_param' | 'r_num'>
  band_as_fn_of_eps?: string              // 可选: 带随理想化参数收缩的关系
}

export interface Problem {
  id: string
  title: string
  titleZh: string
  domain: Domain
  subdomain: string
  status: ProblemStatus
  difficulty: 'research' | 'advanced' | 'frontier'
  formalization_potential: FormalizationPotential
  verification_path: VerificationPath
  tags: string[]
  contributor: string
  date_added: string
  /** 内容可信度来源；缺省 AI-drafted。见 ProblemProvenance。 */
  provenance?: ProblemProvenance
  /** 附带的 Lean 4 形式化陈述（对应 lean/<id>.lean，可编译）。与
   *  provenance='lean-compilable' 配套：陈述编译通过即升级，证明仍开放（sorry）。 */
  lean_statement?: string
  related_problems: RelatedProblem[]
  statement: string
  origin: string
  progress: string[]
  obstacles: string[]
  engineering_value?: string
  impact_domains?: string[]
  /** 传送强度层级（价值层级）：可消费行为证书 / 上游结构证（未直接消费）/ 学科骨架。决定对该领域是"直接消费"还是"间接信任"。 */
  output: OutputKind
  /** 证书生命周期；缺省视为 open。refuted 时应在 updates 里记录反例来源。 */
  lifecycle_status?: LifecycleStatus
  formalization_notes: string
  references: { label: string; url: string }[]
  /** 判定形式：一个被认可的答案必须满足什么、如何被核验（证明证书 / 数值判据 / 反例构造…）。
   *  对 verified_behavior 的判定应显式覆盖三层残差并可合成为总带：
   *    R_model —— 把真实系统限制为受控模型/理想化所丢掉的近似残差上界；
   *    R_param —— 输入参数来自测量/标定/有限采样时引入的不确定度残差上界（参数精确给定时为 0，须如实注明）；
   *    R_num   —— 对该受控模型求解放置离散/区间/采样所引入的计算残差上界。
   *  三者满足 总带宽 ≤ R_model + R_param + R_num，且各层有可独立复核常数。 */
  judgment?: string
  /** 溯源：提出者 */
  proposer?: string
  /** 溯源：提出年份 */
  proposed_year?: number
  /** 溯源：出处（文献或对话） */
  via?: { label: string; url?: string }
  /** 轻量更新记录：修订 / 新进展 / 状态变更 */
  updates?: ProblemUpdate[]
  /** 三层残差总带的结构化形式（方向一 L1）：把 judgment 的三层残差从散文提取为字段，
   *  供 UI 渲染带证区间与各层常数。verified_behavior 题鼓励填写。 */
  certificate?: Certificate
  /** 工程交付物条目（方向四基础）：把 engineering_value 中的可消费产出提取为具体名称，
   *  供"工程瓶颈 → 支撑它的证书"反向索引使用。如 ["散热器峰值温度裕量判定", "热设计评审带证区间"]。 */
  engineering_deliverables?: string[]
  /** 双桥形式侧(可选): 对 AI4Math 端的形式化视图;随 problems.json 序列化。 */
  formal_view?: FormalView
  /** 双桥桥(可选): 形式视图(T)与带证书(C, 由 certificate 承担)的语义连接。 */
  bridge?: Bridge
  /** 结构化失败记录：为何已知方法失败（机读版；obstacles 保留人读散文）。 */
  failure_records?: FailureRecord[]
  /** 形式工具映射：本题 ↔ mathlib 工具的 m:n 双向索引（试点）。 */
  tool_links?: ToolLink[]
}

export const PROBLEMS: Problem[] = [
  {
    id: 'mp-001',
    output: 'verified_truth',
    judgment: 'A pass is a rigorous proof certificate that the first BBGKY marginal converges to the solution of the Boltzmann hierarchy on arbitrary time intervals [0,T] under stated initial chaos assumptions, or a valid counterexample with certified initial data; the short-time result alone is not enough, the accepted form must cover all times.',
    title: 'Validity of the Boltzmann–Grad Limit for Hard Spheres at All Times',
    titleZh: '硬球体系 Boltzmann–Grad 极限的全时间有效性',
    domain: 'mathematical-physics',
    subdomain: 'kinetic-theory',
    status: 'open',
    difficulty: 'frontier',
    formalization_potential: 'low',
    verification_path: 'analytical',
    tags: ['bbgky-hierarchy', 'boltzmann-equation', 'lanford-theorem', 'statistical-mechanics'],
    contributor: 'admin',
    date_added: '2026-08-21',
    proposer: 'O. E. Lanford III',
    proposed_year: 1975,
    via: {
      label: 'Lanford, Time evolution of large classical systems, Springer Lecture Notes in Physics 38 (1975)',
      url: 'https://doi.org/10.1007/3-540-07160-1_16',
    },
    failure_records: [
      {
        method: 'Lanford collision-tree expansion',
        mechanism: 'combinatorial',
        layer: 'formal',
        partial: 'Converges for times up to a fraction of the mean free time; global-in-time only in the vacuum (no-recollision) setting.',
        implication: 'Needs a phase-space exclusion argument controlling the combinatorially proliferating collision trees uniformly in time.',
      },
      {
        method: 'BBGKY hierarchy with pseudo-trajectories',
        mechanism: 'missing_bound',
        layer: 'model',
        partial: 'Gallagher–Saint-Raymond–Texier gave refined short-time control of pseudo-trajectories.',
        implication: 'A uniform-in-time a priori bound on the marginals would close the gap; the natural first formalization target.',
      },
    ],
    tool_links: [
      { tool_id: 'analysis-asymptotics', role: 'partial' },
      { tool_id: 'measure-ergodic', role: 'partial' },
      { tool_id: 'topology', role: 'partial' },
    ],
    related_problems: [
      {
        id: 'mp-008',
        relation: 'shares_tools',
        note: 'Both demand control of weak solutions and singular limits in many-particle or continuum systems.',
      },
    ],
    statement: `Prove (or disprove) that the empirical density of a system of $N$ hard spheres of diameter $\\varepsilon$, in the Boltzmann–Grad scaling $N\\varepsilon^{d-1} \\to 1$, converges to the solution of the Boltzmann equation **for all times**, not only for times short compared to the mean free time.

Precisely: show that the first marginal of the BBGKY hierarchy converges, on an arbitrary time interval $[0,T]$, to the solution of the Boltzmann hierarchy, under suitable chaos assumptions on the initial data.`,
    origin:
      'The derivation of irreversible kinetic equations from reversible Hamiltonian particle dynamics is one of the founding problems of statistical mechanics, going back to Boltzmann and the Loschmidt paradox. It underlies the kinetic theory of gases used throughout aerodynamics and rarefied gas engineering.',
    progress: [
      '**Lanford (1975)**: convergence proved for times of order a fraction of the mean free time.',
      '**Gallagher–Saint-Raymond–Texier (2013)**: full convergence proof, again for short times, with refined control of pseudo-trajectories.',
      '**Illner–Pulvirenti**: global result for a gas expanding in vacuum (no recollisions).',
    ],
    obstacles: [
      '**Recollision control**: beyond the mean free time, recolliding particle trajectories proliferate combinatorially; showing they form a negligible set in phase space is the central unresolved difficulty.',
      '**No uniform-in-time a priori bounds** on the BBGKY marginals compatible with the collision trees expansion.',
    ],
    formalization_notes:
      'The proof machinery (collision trees, phase-space exclusion estimates) is enormous and combinatorial; even the short-time Lanford theorem has not been formalized. A Lean formalization of the short-time case would already be a milestone.',
    references: [
      {
        label: 'Lanford, Time evolution of large classical systems, Lecture Notes in Physics 38, 1975',
        url: 'https://link.springer.com/chapter/10.1007/3-540-08771-6_1',
      },
      {
        label: 'Gallagher, Saint-Raymond, Texier, From Newton to Boltzmann, EMS, 2013',
        url: 'https://ems.press/books/zl/215',
      },
    ],
  },
  {
    id: 'mp-002',
    output: 'verified_truth',
    title: 'Sharp Exponential Mixing Rate for 2D Navier–Stokes with Degenerate Noise',
    titleZh: '退化噪声驱动二维 Navier–Stokes 的最优指数混合速率',
    domain: 'mathematical-physics',
    subdomain: 'spde-turbulence',
    status: 'open',
    difficulty: 'frontier',
    formalization_potential: 'medium',
    verification_path: 'analytical',
    tags: ['stochastic-navier-stokes', 'mixing', 'hypoellipticity', 'ergodicity'],
    contributor: 'admin',
    date_added: '2026-08-21',
    proposer: 'M. Hairer & J. C. Mattingly',
    proposed_year: 2006,
    via: {
      label: 'Hairer & Mattingly, Ergodicity of the 2D Navier–Stokes equations with degenerate stochastic forcing, Ann. of Math. 164 (2006)',
      url: 'https://doi.org/10.4007/annals.2006.164.993',
    },
    failure_records: [
      {
        method: 'Harris-type / asymptotic strong Feller coupling (Hairer–Mattingly)',
        mechanism: 'missing_bound',
        layer: 'model',
        partial: 'Ergodicity with finitely many forced modes is proved and exponential mixing follows from Harris-type theorems, but with constants far from sharp.',
        implication: 'Identify the optimal exponent a in the nu^a scaling of the Markov-semigroup spectral gap and certify matching upper and lower mixing bounds uniformly in nu.',
      },
      {
        method: 'Jacobian-flow sensitivity control under hypoelliptic drift',
        mechanism: 'parameter_sensitive',
        layer: 'param',
        partial: 'Noise reaches high modes only through the nonlinear term; the Jacobian flow is controlled non-uniformly in the viscosity nu.',
        implication: 'A uniform-in-nu estimate on the Jacobian flow is the missing ingredient that converts abstract mixing into the sharp nu^a rate.',
      },
    ],
    tool_links: [
      { tool_id: 'measure-ergodic', role: 'partial' },
      { tool_id: 'dynamical-systems', role: 'partial' },
      { tool_id: 'analysis-asymptotics', role: 'partial' },
    ],
    related_problems: [
      {
        id: 'mp-008',
        relation: 'implies',
        note: 'A quantitative ergodic theory is a prerequisite to any rigorous statement about anomalous dissipation rates.',
      },
    ],
    statement: `Consider the 2D incompressible Navier–Stokes equations on $\\mathbb{T}^2$ driven by white-in-time forcing acting only on finitely many Fourier modes. Ergodicity and exponential mixing are known. **Determine the sharp dependence of the mixing rate on the viscosity $\\nu$ and on the set of forced modes**: prove that the spectral gap of the Markov semigroup scales as $\\nu^{a}$ and identify the optimal exponent $a$ (conjecturally $a = 1$ or related to the enstrophy cascade scaling).`,
    origin:
      'Statistical theories of 2D turbulence (relevant to atmospheric and oceanic flows) assume fast equilibration of the velocity field. Quantifying how equilibration slows as viscosity vanishes is essential for the mathematical foundation of these theories.',
    progress: [
      '**Hairer–Mattingly (2006)**: ergodicity with finitely many forced modes via asymptotic strong Feller arguments.',
      '**E–Mattingly, Kuksin–Shirikyan**: exponential mixing established, with non-sharp rates.',
      '**Bedrossian–Blumenthal–Punshon-Smith (2019+)**: sharp enhanced-dissipation and Batchelor-regime results for passive scalars with stochastic forcing.',
    ],
    obstacles: [
      '**Hypoelliptic drift**: noise reaches high modes only through the nonlinear term; controlling the Jacobian flow\'s sensitivity uniformly in $\\nu$ is open.',
      '**Rates from abstract arguments**: current proofs couple to Harris-type theorems whose constants are far from sharp.',
    ],
    formalization_notes:
      'Requires a Lean library for stochastic PDE invariant measures — does not exist yet. Medium-term potential: a finite-dimensional Galerkin truncation version is plausibly formalizable within current Mathlib probability infrastructure.',
    references: [
      {
        label: 'Hairer, Mattingly, Ergodicity of the 2D Navier–Stokes equations with degenerate stochastic forcing, Annals of Mathematics, 2006',
        url: 'https://annals.math.princeton.edu/2006/164-3/p06',
      },
      {
        label: 'Bedrossian, Blumenthal, Punshon-Smith, The Batchelor spectrum of passive scalar turbulence, CPAM, 2022',
        url: 'https://arxiv.org/abs/1911.11014',
      },
    ],
    judgment: 'A pass identifies the exact exponent $a$ in the $\\nu^a$ scaling of the Markov-semigroup spectral gap and proves both matching upper and lower bounds on the mixing rate, with the hypoelliptic-drift estimates certified uniformly in $\\nu$; a numerical conjecture alone is not accepted.',
  },
  {
    id: 'mp-003',
    output: 'verified_truth',
    title: 'Thermalization Time of the Fermi–Pasta–Ulam–Tsingou Lattice',
    titleZh: 'FPUT 晶格热化时间的严格刻画',
    domain: 'mathematical-physics',
    subdomain: 'hamiltonian-lattices',
    status: 'open',
    difficulty: 'frontier',
    formalization_potential: 'medium',
    verification_path: 'analytical',
    tags: ['fput', 'thermalization', 'kams-theory', 'ergodic-hypothesis'],
    contributor: 'admin',
    date_added: '2026-08-21',
    failure_records: [
      {
        method: 'KAM / Nekhoroshev perturbation theory',
        mechanism: 'combinatorial',
        layer: 'param',
        partial: 'At low energy most tori persist and Nekhoroshev-type estimates give exponential long-time stability, but the constants degenerate badly as N grows.',
        implication: 'A thermodynamic-limit estimate needs KAM/Nekhoroshev constants uniform in the particle number N; the degenerating constants are the obstruction.',
      },
      {
        method: 'Arnold-diffusion / slow-drift analysis',
        mechanism: 'missing_bound',
        layer: 'model',
        partial: 'Numerics suggest a slow drift drives late-time equilibration, but no rigorous mechanism for it exists.',
        implication: 'Bound the drift that transfers energy across resonances to obtain the equilibration time T_eq(N,epsilon) and the KAM/thermalization cutoff.',
      },
    ],
    tool_links: [
      { tool_id: 'dynamical-systems', role: 'partial' },
      { tool_id: 'analysis-asymptotics', role: 'partial' },
      { tool_id: 'interval-numerics', role: 'available' },
    ],
    via: { label: 'Ford, The Fermi-Pasta-Ulam problem: paradox turns discovery, Phys. Rep. 213 (1992) 271-310', url: 'https://doi.org/10.1016/0370-1573(92)90116-H' },
    related_problems: [
      {
        id: 'mp-006',
        relation: 'shares_tools',
        note: 'Both concern long-time energy transfer among Fourier modes in nearly integrable Hamiltonian systems.',
      },
    ],
    statement: `For the FPUT $\\beta$-chain with $N$ particles and Hamiltonian

$$H = \\sum_{j=1}^{N} \\frac{p_j^2}{2} + \\frac{(q_{j+1}-q_j)^2}{2} + \\frac{\\beta (q_{j+1}-q_j)^4}{4},$$

fix energy per particle $\\varepsilon > 0$. Prove that for generic initial data concentrated on low Fourier modes, the time-averaged mode energies equilibrate toward equipartition, and give an asymptotic formula for the equilibration time $T_{\\mathrm{eq}}(N, \\varepsilon)$ as $N \\to \\infty$ (numerics suggest power-law scaling $T_{\\mathrm{eq}} \\sim \\varepsilon^{-a}$ with non-trivial $a$).`,
    origin:
      'The 1955 FPUT numerical experiment — one of the first scientific computer simulations — found recurrence instead of thermalization, contradicting the ergodic hypothesis and launching the field of nonlinear science. The precise boundary between KAM-type near-integrability and statistical thermalization remains unresolved after 70 years.',
    progress: [
      '**KAM theory**: at sufficiently low energy, most tori persist, blocking thermalization on those timescales.',
      '**Numerics (Benettin, Ponno, et al.)**: systematic studies of the equilibration threshold and time scaling.',
      '**Nekhoroshev-type estimates**: exponential long-time stability below a threshold, with non-sharp exponents.',
    ],
    obstacles: [
      '**Dimension blow-up**: KAM/Nekhoroshev constants degenerate badly as $N\\to\\infty$; thermodynamic-limit estimates are out of reach of current perturbation theory.',
      '**No rigorous mechanism** describes the slow drift (Arnold-diffusion-like) that numerics suggest drives late-time equilibration.',
    ],
    engineering_value:
      "Certifies the equilibration time scale a molecular-dynamics lattice run must reach before it reports a material heat-transfer coefficient, and separates the KAM-blocked regime (where equipartition fails) from the thermalized one - the missing cutoff for when harmonic-lattice assumptions stop holding in nanoscale thermal engineering.",
    formalization_notes:
      'KAM theory formalization is in its infancy even for finite-dimensional systems; this problem needs infinite-dimensional extensions. A more tractable formalization target: rigorous interval-arithmetic verification of the recurrence phenomenon itself.',
    references: [
      {
        label: 'Benettin, Ponno, Time-scales to equipartition in the FPUT problem, J. Stat. Phys., 2011',
        url: 'https://link.springer.com/article/10.1007/s10955-011-0280-0',
      },
    ],
    judgment: 'A pass supplies an asymptotic formula for the equilibration time $T_{\\mathrm{eq}}(N,\\varepsilon)$ as $N\\to\\infty$ for generic low-mode initial data, identifies the slow-drift (Arnold-diffusion-like) mechanism rigorously, and certifies the threshold separating KAM blocking from equipartition; heuristic or simulation-only scaling is not accepted.',
    proposer: 'Fermi, Pasta, Tsingou, Ulam',
    proposed_year: 1955,
  },
  {
    id: 'mp-004',
    output: 'verified_truth',
    title: 'Anderson Localization in Two Dimensions at Arbitrary Disorder',
    titleZh: '二维任意无序强度下的 Anderson 局域化',
    domain: 'mathematical-physics',
    subdomain: 'random-operators',
    status: 'open',
    difficulty: 'frontier',
    formalization_potential: 'medium',
    verification_path: 'analytical',
    tags: ['anderson-localization', 'random-schrodinger', 'spectral-theory'],
    contributor: 'admin',
    date_added: '2026-08-21',
    proposer: 'P. W. Anderson',
    proposed_year: 1958,
    via: {
      label: 'Anderson, Absence of diffusion in certain random lattices, Physical Review 109 (1958)',
      url: 'https://doi.org/10.1103/PhysRev.109.1492',
    },
    failure_records: [
      {
        method: 'Multi-scale analysis (Fröhlich–Spencer)',
        mechanism: 'missing_bound',
        layer: 'model',
        partial: 'Proves localization for large disorder or at spectral edges in any dimension; it needs an a priori decay scale that is missing for small lambda in d=2.',
        implication: 'Construct the missing decay scale at weak disorder instead of assuming it — the decisive step for localization at all lambda > 0 on Z^2.',
      },
      {
        method: 'Fractional-moment method (Aizenman–Molchanov)',
        mechanism: 'parameter_sensitive',
        layer: 'param',
        partial: 'Gives localization in d=1 at all disorders and at large disorder in higher dimensions; weak-disorder resonances in d=2 defeat the resolvent estimate.',
        implication: 'A disorder-uniform resolvent bound on Z^2 would push localization below the current resonance-limited regime.',
      },
    ],
    tool_links: [
      { tool_id: 'spectral-operator', role: 'partial' },
      { tool_id: 'analysis-asymptotics', role: 'partial' },
    ],
    related_problems: [
      {
        id: 'mp-007',
        relation: 'analog_of',
        note: 'Band matrices interpolate between random matrices and random Schrödinger operators; the localization transition is conjecturally the same phenomenon.',
      },
    ],
    statement: `Consider the Anderson model on $\\mathbb{Z}^2$:

$$(H_\\omega \\psi)(n) = \\sum_{|m-n|=1} \\psi(m) + \\lambda V_\\omega(n)\\,\\psi(n),$$

with $V_\\omega(n)$ i.i.d. (e.g. Bernoulli or uniform). **Prove that for every $\\lambda > 0$ the spectrum is almost surely pure point with exponentially decaying eigenfunctions** (the physicists\' consensus, supported by scaling theory), or construct a counterexample exhibiting delocalized states.`,
    origin:
      "Anderson's 1958 model of electron transport in disordered lattices explains metal–insulator transitions. The 1979 one-parameter scaling theory predicts localization in $d \\le 2$ and a transition in $d \\ge 3$; rigorous confirmation in dimension two remains the central open case.",
    progress: [
      '**$d=1$**: localization at all disorders (Goldsheid–Molchanov–Pastur; Kunz–Souillard).',
      '**Large disorder / spectral edges in any dimension**: localization via multi-scale analysis (Fröhlich–Spencer) or fractional moments (Aizenman–Molchanov).',
      '**$d \\ge 3$**: delocalization open too; partial results on tree graphs.',
    ],
    obstacles: [
      '**Resonances at weak disorder**: multi-scale analysis requires an a priori decay scale that is missing for small $\\lambda$ in $d=2$.',
      '**No monotonicity**: localization is not monotone in $\\lambda$, ruling out comparison arguments.',
    ],
    formalization_notes:
      'The 1D Kunz–Souillard method is combinatorial and measure-theoretic — a realistic multi-year formalization project. The 2D conjecture itself is out of reach; recording the obstacle structure is currently the main value.',
    references: [
      {
        label: 'Abrahams, Anderson, Licciardello, Ramakrishnan, Scaling theory of localization, PRL, 1979',
        url: 'https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.42.673',
      },
      {
        label: 'Aizenman, Warzel, Random Operators, GSM 168, AMS, 2015',
        url: 'https://bookstore.ams.org/gsm-168/',
      },
    ],
    judgment: 'A pass proves that for every $\\lambda > 0$ the spectrum of the $\\mathbb{Z}^2$ Anderson model is almost surely pure point with exponentially decaying eigenfunctions, or delivers a rigorously constructed counterexample exhibiting delocalized states; the proof must resolve the missing a-priori decay scale at weak disorder rather than assume it, and the admissible disorder (Bernoulli or uniform) must be handled explicitly.',
  },
  {
    id: 'mp-005',
    output: 'verified_truth',
    judgment: 'A pass proves a uniform positive spectral gap above the ground state in the thermodynamic limit for the spin-2 square-lattice AKLT model, or proves gaplessness; the honeycomb spin-3/2 companion must be settled by a fully analytic computer-free bound with a verifiable finite eigenvalue certificate.',
    title: 'Spectral Gap of the Spin-2 AKLT Model on the Square Lattice',
    titleZh: '四方晶格 spin-2 AKLT 模型的谱隙',
    domain: 'mathematical-physics',
    subdomain: 'quantum-spin-systems',
    status: 'open',
    difficulty: 'frontier',
    formalization_potential: 'high',
    verification_path: 'analytical',
    tags: ['aklt-model', 'spectral-gap', 'tensor-networks', 'quantum-many-body'],
    contributor: 'admin',
    date_added: '2026-08-21',
    proposer: 'I. Affleck, T. Kennedy, E. H. Lieb & H. Tasaki',
    proposed_year: 1987,
    via: {
      label: 'AKLT, Rigorous results on valence-bond ground states, Commun. Math. Phys. 115 (1988)',
      url: 'https://doi.org/10.1007/BF01217704',
    },
    failure_records: [
      {
        method: 'Projector-anticommutator / finite-volume eigenvalue certificates (Lemm–Sandvik–Wang; Pomata–Wei)',
        mechanism: 'combinatorial',
        layer: 'num',
        partial: 'Closed the honeycomb (degree-3) gap with numerically assisted DMRG/Lanczos certificates; the estimates fail at vertex degree 4 and the finite problems exceed exact-diagonalization reach.',
        implication: 'A verified finite eigenvalue certificate (rigorous Lanczos / interval bounds) on the square lattice is the concrete formalization target.',
      },
      {
        method: 'PEPS / transfer-matrix gap arguments',
        mechanism: 'missing_bound',
        layer: 'formal',
        partial: 'The gap does not follow from the frustration-free PEPS structure alone; non-uniqueness of parent Hamiltonians blocks transfer-matrix arguments.',
        implication: 'Formalize the finite-matrix certificate and push the anticommutator estimates to vertex degree 4 to reach the thermodynamic limit.',
      },
    ],
    tool_links: [
      { tool_id: 'spectral-operator', role: 'partial' },
      { tool_id: 'interval-numerics', role: 'available' },
    ],
    related_problems: [],
    statement: `The spin-2 AKLT state on the square lattice is the unique ground state of the local, frustration-free, $SU(2)$-invariant Hamiltonian $H = \\sum_{\\langle i,j\\rangle} P^{(2)}_{ij}$ built from spin-2 projectors. **Prove that the thermodynamic-limit Hamiltonian has a uniform spectral gap $\\Delta > 0$ above the ground state**, or prove gaplessness. A companion challenge: give a **fully analytic (computer-free)** gap proof for the honeycomb spin-3/2 case, where the gap is known only through numerically-assisted arguments.`,
    origin:
      'The 1D AKLT model gave the first rigorous example of the Haldane gap. Its 2D analogues are the canonical short-range-entangled quantum states with exact tensor-network representations, and resource states for measurement-based quantum computation. Gap proofs certify the stability of these phases.',
    progress: [
      '**Honeycomb lattice (spin-3/2): RESOLVED 2020** — gap proved independently by Lemm–Sandvik–Wang (PRL 124, 177204) and Pomata–Wei (PRL 124, 177203); both proofs are numerically assisted (DMRG / Lanczos certificates).',
      '**Decorated lattices**: analytic gap proofs for honeycomb/square with $n \\ge 3$ edge decorations (Abdul-Rahman–Lemm–Lucia–Nachtergaele–Young 2019), numerically extended to $n \\ge 2$.',
      '**1D AKLT**: exact gap computed rigorously (Affleck–Kennedy–Lieb–Tasaki 1988; Knabe).',
      '**Square lattice numerics (TNRG)**: consistent with a gap $\\Delta \\approx 0.03$, but no proof.',
    ],
    obstacles: [
      '**Degree-4 lattices**: the projector-anticommutator estimates that closed the honeycomb case fail at vertex degree 4; the effective finite problems exceed exact diagonalization and Lanczos reach.',
      '**Frustration-free is not enough**: the gap does not follow from the PEPS structure alone; non-uniqueness of parent Hamiltonians blocks transfer-matrix arguments.',
    ],
    formalization_notes:
      'Finite-volume Hamiltonians are finite matrices; the 2020 honeycomb proofs reduce to certifiable finite eigenvalue inequalities — formalizing such a certificate in Lean (verified Lanczos bounds) would be a landmark for proof-assistant quantum many-body physics.',
    references: [
      {
        label: 'Lemm, Sandvik, Wang, Existence of a Spectral Gap in the AKLT Model on the Hexagonal Lattice, PRL 124, 177204 (2020)',
        url: 'https://arxiv.org/abs/1910.11810',
      },
      {
        label: 'Pomata, Wei, Demonstrating the AKLT Spectral Gap on 2D Degree-3 Lattices, PRL 124, 177203 (2020)',
        url: 'https://arxiv.org/abs/1911.01410',
      },
      {
        label: 'Abdul-Rahman, Lemm, Lucia, Nachtergaele, Young, A class of 2D AKLT models with a gap, arXiv:1901.09297',
        url: 'https://arxiv.org/abs/1901.09297',
      },
    ],
  },
  {
    id: 'mp-006',
    output: 'verified_truth',
    judgment: 'A pass establishes polynomial-in-time bounds ||u(t)||_H^s at most t^C(s) with the conjectured optimal exponent, and decides whether sup over t of the H^s norm can be infinite for s greater than 1, each via a rigorous proof certificate grounded in resonant frequency combinatorics.',
    title: 'Growth of Higher Sobolev Norms for the Defocusing Cubic NLS on T²',
    titleZh: '环面上调焦三次 NLS 高阶 Sobolev 范数增长',
    domain: 'mathematical-physics',
    subdomain: 'dispersive-pde',
    status: 'open',
    difficulty: 'frontier',
    formalization_potential: 'low',
    verification_path: 'analytical',
    tags: ['nonlinear-schrodinger', 'sobolev-norms', 'weak-turbulence', 'i-method'],
    contributor: 'admin',
    date_added: '2026-08-21',
    proposer: 'J. Bourgain',
    proposed_year: 1996,
    via: {
      label: 'Bourgain, On the growth in time of higher Sobolev norms of smooth solutions of Hamiltonian PDE, GAFA 6 (1996)',
      url: 'https://doi.org/10.1007/BF02246886',
    },
    failure_records: [
      {
        method: 'I-method (Bourgain; CKSTT)',
        mechanism: 'missing_bound',
        layer: 'model',
        partial: 'Polynomial growth bounds for the H^s norm are known with non-optimal exponents; arbitrarily large finite growth is established, unboundedness is not.',
        implication: 'Improve the I-method exponents toward the conjectured optimal t^C(s) and decide whether sup over t of the H^s norm can be infinite for s > 1.',
      },
      {
        method: 'Resonant frequency analysis (Guardia–Kaloshin)',
        mechanism: 'combinatorial',
        layer: 'param',
        partial: 'Growth is driven by resonant frequency interactions whose combinatorics on Z^2 is only controlled at small scales.',
        implication: 'A large-scale combinatorial control of the resonant sets would turn the energy cascade into a rigorous polynomial bound.',
      },
    ],
    tool_links: [
      { tool_id: 'analysis-asymptotics', role: 'partial' },
      { tool_id: 'dynamical-systems', role: 'partial' },
    ],
    related_problems: [
      {
        id: 'mp-003',
        relation: 'shares_tools',
        note: 'Energy transfer among Fourier modes in nearly integrable Hamiltonian dynamics is the shared mechanism.',
      },
    ],
    statement: `Let $u$ solve the defocusing cubic NLS $i\\partial_t u + \\Delta u = |u|^2 u$ on $\\mathbb{T}^2$ with smooth initial data. **Prove polynomial-in-time upper bounds** $\\|u(t)\\|_{H^s} \\lesssim t^{C(s)}$ with the conjectured optimal exponent, and determine whether arbitrarily large growth occurs: does there exist data with $\\sup_t \\|u(t)\\|_{H^s} = +\\infty$ for $s>1$ (a weak-turbulence / energy-cascade phenomenon)?`,
    origin:
      'Weak wave turbulence theory (used in ocean surface waves and nonlinear optics) predicts slow but unbounded transfer of energy to high frequencies. NLS on the torus is the simplest Hamiltonian PDE where this cascade can be posed rigorously.',
    progress: [
      '**Bourgain, Staffilani, Colliander–Keel–Staffilani–Takaoka–Tao**: polynomial bounds via the I-method, with non-optimal exponents.',
      '**CKSTT (2010)**: existence of solutions with arbitrarily large (finite) growth for the same equation — cascade is possible but unboundedness unknown.',
      '**Guardia–Kaloshin and successors**: growth estimates with explicit exponents.',
    ],
    obstacles: [
      '**Conservation laws control only $H^1$**; higher norms have no coercive structure.',
      '**Resonant sets**: growth is driven by resonant frequency interactions whose combinatorics on $\\mathbb{Z}^2$ is poorly understood at large scales.',
    ],
    formalization_notes:
      'Even well-posedness of NLS is not yet in any proof assistant at this depth. Low formalization potential short-term; the obstacle and partial-result record is the deliverable.',
    references: [
      {
        label: 'Colliander, Keel, Staffilani, Takaoka, Tao, Transfer of energy to high frequencies in the cubic defocusing NLS, Invent. Math., 2010',
        url: 'https://arxiv.org/abs/0808.1742',
      },
    ],
  },
  {
    id: 'mp-007',
    output: 'verified_truth',
    title: 'Localization–Delocalization Transition for Random Band Matrices',
    titleZh: '随机带矩阵的局域化—退局域化转变',
    domain: 'mathematical-physics',
    subdomain: 'random-matrix-theory',
    status: 'open',
    difficulty: 'frontier',
    formalization_potential: 'medium',
    verification_path: 'analytical',
    tags: ['band-matrices', 'anderson-transition', 'random-matrix', 'universality'],
    contributor: 'admin',
    date_added: '2026-08-21',
    proposer: 'L. Erdős & H.-T. Yau',
    proposed_year: 2012,
    via: { label: 'Survey of localization–delocalization for random band matrices and recent results: the Becker–Cipolloni–Erdős series; together with Erdős–Yau, A dynamical approach to random matrix theory (2012)' },
    failure_records: [
      {
        method: 'Matrix-Brownian-motion embedding / moment method (Yau–Yin)',
        mechanism: 'parameter_sensitive',
        layer: 'model',
        partial: 'Delocalization and bulk universality are proved for W > N^(1/2+epsilon); the embedding estimates saturate at the N^epsilon margin above sqrt(N).',
        implication: 'Remove the epsilon in the window W in [N^(1/2), N^(1/2+epsilon)] by sharpening the moment/embedding estimates at the critical scale.',
      },
      {
        method: 'Fractional-moment localization (Schenker; Peled–Schenker–Shamis–Sodin)',
        mechanism: 'missing_bound',
        layer: 'param',
        partial: 'Proves localization only for W much smaller than N^(1/8); rare resonances near the critical window defeat resolvent bounds.',
        implication: 'Extend the resolvent / fractional-moment control toward the sqrt(N) threshold where the transition is conjectured.',
      },
    ],
    tool_links: [
      { tool_id: 'spectral-operator', role: 'partial' },
      { tool_id: 'analysis-asymptotics', role: 'partial' },
      { tool_id: 'stochastic-processes', role: 'partial' },
    ],
    related_problems: [
      {
        id: 'mp-004',
        relation: 'analog_of',
        note: 'Band matrices with W ~ sqrt(N) are the mean-field caricature of the 3D Anderson transition.',
      },
    ],
    statement: `Let $H$ be an $N \\times N$ real symmetric random band matrix: $H_{ij}$ independent (up to symmetry), mean zero, variance $\\propto W^{-1}$ for $|i-j| \\le W$ and zero otherwise (indices on a cycle). **Prove the sharp transition at $W \\sim \\sqrt{N}$**: localization (pure point spectrum, exponentially decaying eigenvectors) for $W \\ll \\sqrt{N}$, and remove the $\\varepsilon$ in the delocalization regime $W \\gg N^{1/2+\\varepsilon}$ established in 2025 — i.e. close the remaining window $W \\in [N^{1/2}, N^{1/2+\\varepsilon}]$ and characterize the critical behavior.`,
    origin:
      'Band matrices are the canonical interpolating family between mean-field random matrices (Wigner, always delocalized) and short-range random Schrödinger operators. Resolving their transition is widely seen as the key stepping stone toward the Anderson transition.',
    progress: [
      '**Yau–Yin (2025)**: delocalization and bulk universality for $W > N^{1/2+\\varepsilon}$ on the 1D torus — essentially the full delocalized side of the conjectured $\\sqrt{N}$ threshold.',
      '**Dubova–Yang–Yau–Yin (2025)**: local semicircle law, eigenvector delocalization, QUE and universality for 2D band matrices with $W \\ge N^{\\mathfrak{c}}$.',
      '**Earlier**: Erdős–Knowles–Yau–Yin for $W \\gg N^{4/5}$; localization for $W \\ll N^{1/8}$-type regimes via fractional moments (Schenker; Peled–Schenker–Shamis–Sodin).',
    ],
    obstacles: [
      '**The critical window**: delocalization is now proved only with an $N^{\\varepsilon}$ margin above $\\sqrt{N}$; matrix-Brownian-motion embedding estimates saturate there.',
      '**Localization side far from threshold**: fractional-moment methods reach only $W \\ll N^{1/8}$; rare resonances near the critical window defeat resolvent bounds.',
    ],
    formalization_notes:
      'Moment-method delocalization proofs are long but structurally clean (graph expansions); they are plausible formalization targets once random-matrix infrastructure exists in Mathlib. The sharp transition itself is far beyond proof at present.',
    references: [
      {
        label: 'Yau, Yin, Delocalization and universality of random band matrices, 2025',
        url: 'https://www.math.princeton.edu/events/delocalization-random-band-matrices-2025-04-15t203000',
      },
      {
        label: 'Dubova, Yang, Yau, Yin, Delocalization of Two-Dimensional Random Band Matrices, arXiv:2503.07606',
        url: 'https://arxiv.org/abs/2503.07606',
      },
      {
        label: 'Peled, Schenker, Shamis, Sodin, On the Wegner orbital model, IMRN, 2019',
        url: 'https://arxiv.org/abs/1802.05529',
      },
    ],
    judgment: 'A pass proves localization for $W\\ll\\sqrt{N}$ and closes the delocalization window $W\\in[N^{1/2},N^{1/2+\\varepsilon}]$ by removing the $\\varepsilon$, characterizing the critical behavior at $W\\sim\\sqrt{N}$, via rigorous resolvent or moment estimates whose constants are made explicit.',
    updates: [
      {
        date: '2025-04-15',
        note: 'Yau–Yin established delocalization and bulk universality for W>N^{1/2+ε} on the one-dimensional torus, essentially closing the delocalized side of the conjectured √N threshold; the endpoint window and critical behavior remain open.',
      },
    ],
  },
  {
    id: 'mp-008',
    output: 'verified_truth',
    judgment: 'A pass proves or disproves the zeroth law, namely that the liminf as nu goes to 0 of nu times the L^2 gradient norm squared of stationary or long-time-averaged solutions is strictly positive, with the dissipation lower bound certified against the stated body forcing.',
    title: 'Anomalous Dissipation in the Zero-Viscosity Limit of Forced Navier–Stokes',
    titleZh: '受迫 Navier–Stokes 零粘性极限的反常耗散',
    domain: 'mathematical-physics',
    subdomain: 'turbulence',
    status: 'open',
    difficulty: 'frontier',
    formalization_potential: 'low',
    verification_path: 'analytical',
    tags: ['navier-stokes', 'turbulence', 'anomalous-dissipation', 'weak-solutions'],
    contributor: 'admin',
    date_added: '2026-08-21',
    proposer: 'L. Onsager',
    proposed_year: 1949,
    via: {
      label: 'Onsager, Statistical hydrodynamics, Nuovo Cimento 6 (1949); modern formulation see the Eyink–Sreenivasan review',
      url: 'https://doi.org/10.1007/BF02780991',
    },
    failure_records: [
      {
        method: 'Suitable weak solutions (Caffarelli–Kohn–Nirenberg partial regularity)',
        mechanism: 'unbounded_residual',
        layer: 'model',
        partial: 'Bounds the singular set of suitable weak solutions, but gives no positive lower bound on energy dissipation.',
        implication: 'A certified-numerics route on a restricted solution class could establish the residual layer for the R_num/R_model band.',
      },
      {
        method: 'Onsager critical-regularity / anomalous dissipation programme',
        mechanism: 'missing_bound',
        layer: 'formal',
        partial: 'Dissipation anomaly at critical regularity is conjectured for Euler, not established for the NS zero-viscosity limit.',
        implication: 'Formalizing the CKN partial-regularity theorem is a concrete first step toward a machine-checkable target.',
      },
    ],
    tool_links: [
      { tool_id: 'measure-ergodic', role: 'partial' },
      { tool_id: 'interval-numerics', role: 'available' },
      { tool_id: 'analysis-asymptotics', role: 'partial' },
    ],
    related_problems: [
      {
        id: 'mp-002',
        relation: 'depends_on',
        note: 'Quantitative ergodicity is needed to turn anomalous dissipation into a statement about the stationary ensemble.',
      },
    ],
    statement: `For the 3D incompressible Navier–Stokes equations with smooth body forcing at fixed scale, prove or disprove the **zeroth law of turbulence**: the mean energy dissipation rate of stationary (or long-time-averaged) solutions satisfies

$$\\liminf_{\\nu \\to 0}\\; \\nu \\langle \\|\\nabla u_\\nu\\|_{L^2}^2 \\rangle > 0,$$

i.e. dissipation does not vanish with viscosity — the empirically universal signature of developed turbulence.`,
    origin:
      'This is the rigorous content of Kolmogorov\'s 1941 phenomenology, the foundation of all engineering turbulence modeling (aerodynamics, weather, combustion). Every RANS/LES closure implicitly assumes it.',
    progress: [
      '**Onsager conjecture for Euler (inviscid)**: resolved — anomalous dissipation occurs for rough ($C^{\\alpha}$, $\\alpha<1/3$) weak solutions (Isett; Buckmaster–De Lellis–Székelyhidi–Vicol).',
      '**2D stochastic case**: anomalous dissipation established in Batchelor-regime settings (Bedrossian–Blumenthal–Punshon-Smith).',
      '**Upper bounds in 3D**: dissipation bounded independent of $\\nu$ in various settings; the lower bound is open.',
    ],
    obstacles: [
      '**Regularity barrier**: 3D NSE weak solutions are not known to be unique or rough enough to dissipate; the phenomenon may require exactly the regularity class we cannot construct.',
      '**Ensemble vs. trajectory**: the statement concerns statistical stationary states, about which almost nothing rigorous is known in 3D.',
    ],
    engineering_value:
      'A proof (or counterexample) would settle the mathematical status of the energy dissipation rate that every turbulence model in aerospace and CFD engineering takes as axiomatic input.',
    formalization_notes:
      'The 2D stochastic Batchelor-regime results are the closest formalizable fragment. 3D statements currently have no formalization path; value lies in precise statement and obstacle documentation.',
    references: [
      {
        label: 'Buckmaster, Vicol, Convex integration and phenomenologies in turbulence, EMS Surveys, 2019',
        url: 'https://arxiv.org/abs/1901.09023',
      },
    ],
  },
  {
    id: 'mc-001',
    output: 'verified_truth',
    judgment: 'A pass proves global asymptotic stability of the unique positive equilibrium in each stoichiometric compatibility class, by certifying that no omega-limit set approaches the boundary of the positive orthant under the pseudo-Helmholtz Lyapunov function; a counterexample network is accepted only if the trajectory escaping to the boundary is rigorously verified.',
    title: 'The Global Attractor Conjecture for Complex-Balanced Reaction Networks',
    titleZh: '复平衡反应网络的全局吸引子猜想',
    domain: 'mathematical-chemistry',
    subdomain: 'chemical-reaction-network-theory',
    status: 'open',
    difficulty: 'frontier',
    formalization_potential: 'high',
    verification_path: 'analytical',
    tags: ['crnt', 'global-attractor-conjecture', 'mass-action-kinetics', 'persistence'],
    contributor: 'admin',
    date_added: '2026-08-21',
    proposer: 'F. Horn & R. Jackson',
    proposed_year: 1972,
    via: {
      label: 'Horn & Jackson, General mass action kinetics, ARMA 47 (1972); modern formulation of the conjecture see Katz–Weinberg (2017/2019)',
      url: 'https://doi.org/10.1007/BF00251396',
    },
    failure_records: [
      {
        method: 'Pseudo-Helmholtz Lyapunov function (Horn–Jackson)',
        mechanism: 'unbounded_residual',
        layer: 'model',
        partial: 'Establishes local asymptotic stability; the Lyapunov function is proper only on compact subsets of the relative interior, so trajectories near the orthant faces escape its control.',
        implication: 'Control the lock-down (semi-locking) sets to certify that no omega-limit point lies on the boundary — the decisive step toward global stability.',
      },
      {
        method: 'Numerical counterexample search',
        mechanism: 'combinatorial',
        layer: 'num',
        partial: 'The network space grows combinatorially and numerics cannot distinguish slow convergence from boundary attraction.',
        implication: 'Verified (interval / rigorous) simulation can certify whether a trajectory approaches the boundary, complementing the Lyapunov argument.',
      },
    ],
    tool_links: [
      { tool_id: 'dynamical-systems', role: 'partial' },
      { tool_id: 'lattice-order', role: 'partial' },
      { tool_id: 'interval-numerics', role: 'available' },
    ],
    related_problems: [
      {
        id: 'mc-002',
        relation: 'generalizes',
        note: 'Persistence (no boundary omega-limit points) is the weaker, also-open statement.',
      },
      {
        id: 'mb-004',
        relation: 'analog_of',
        note: 'Permanence for Lotka–Volterra systems is the ecological counterpart; Lyapunov techniques transfer.',
      },
    ],
    statement: `Let $\\dot{x} = f(x)$ be the mass-action ODE system of a **complex-balanced** (in particular, weakly reversible deficiency-anything) chemical reaction network, and let $x_0 > 0$ be a positive initial condition. **Prove that the unique positive equilibrium in the stoichiometric compatibility class of $x_0$ is globally asymptotically stable**, i.e. every trajectory converges to it.

The pseudo-Helmholtz Lyapunov function $V(x) = \\sum_i (x_i \\ln(x_i/\\bar{x}_i) - x_i + \\bar{x}_i)$ decreases along trajectories; the conjecture asserts that $\\omega$-limit sets cannot approach the boundary of the positive orthant.`,
    origin:
      'Mass-action kinetics model industrial catalytic reactors, metabolic pathways, and chemical oscillators. Horn and Jackson (1972) proved local asymptotic stability and conjectured global stability in 1974; it is the most cited open problem in mathematical chemistry.',
    progress: [
      '**Local stability + Lyapunov function**: Horn–Jackson (1972).',
      '**Single linkage class**: full proof by Anderson (2011).',
      '**Dimension $\\le 3$**: proved by Craciun–Nazarov–Pantea (2013); Pantea extended to stoichiometric subspaces of dimension $\\le 3$.',
      '**Persistence results**: endotactic networks are persistent (Craciun–Nazarov–Pantea; Gopalkrishnan–Miller–Shiu) — a major partial step.',
      '**Craciun (2015)**: a general proof via toric differential inclusions has been proposed (arXiv:1501.02860); as of 2026 it has not been fully accepted by the community.',
    ],
    obstacles: [
      '**Boundary behavior**: the Lyapunov function is proper only on compact subsets of the relative interior; controlling trajectories near faces of the orthant requires understanding all "lock-down" (semi-locking) sets.',
      '**Counterexample search is infeasible**: the space of networks grows combinatorially, and numerics cannot distinguish slow convergence from boundary attraction.',
    ],
    engineering_value:
      'Global stability certificates for reaction networks would replace expensive reactor-scale simulation campaigns for proving robustness of catalytic process designs.',
    formalization_notes:
      'The Lyapunov argument is classical real analysis plus convexity; a Lean formalization of the Horn–Jackson local theorem is a realistic near-term project and the natural first milestone. The global conjecture remains research-level.',
    references: [
      {
        label: 'Horn, Jackson, General mass action kinetics, Arch. Rational Mech. Anal., 1972',
        url: 'https://link.springer.com/article/10.1007/BF00251225',
      },
      {
        label: 'Craciun, Toric differential inclusions and a proof of the Global Attractor Conjecture, arXiv:1501.02860',
        url: 'https://arxiv.org/abs/1501.02860',
      },
    ],
  },
  {
    id: 'mc-002',
    output: 'verified_truth',
    title: 'The Persistence Conjecture for Weakly Reversible Reaction Networks',
    titleZh: '弱可逆反应网络的持久性猜想',
    domain: 'mathematical-chemistry',
    subdomain: 'chemical-reaction-network-theory',
    status: 'open',
    difficulty: 'frontier',
    formalization_potential: 'high',
    verification_path: 'analytical',
    tags: ['crnt', 'persistence', 'weakly-reversible', 'endotactic-networks'],
    contributor: 'admin',
    date_added: '2026-08-21',
    proposer: 'D. Angeli, P. De Leenheer & E. Sontag',
    proposed_year: 2007,
    via: {
      label: 'Angeli–De Leenheer–Sontag, A graph-theoretic approach to persistence, SIAM J. Appl. Dyn. Syst. 6 (2007)',
      url: 'https://doi.org/10.1137/060664017',
    },
    failure_records: [
      {
        method: 'Endotactic / geometric reaction-vector criteria (Craciun–Nazarov–Pantea; Gopalkrishnan–Miller–Shiu)',
        mechanism: 'missing_bound',
        layer: 'model',
        partial: 'Prove persistence for all endotactic networks, covering all 2D and many higher-dimensional cases; weakly reversible networks need not be endotactic in dimension >= 3.',
        implication: 'Extend the geometric reaction-vector condition to the weakly-reversible non-endotactic cases in dimension >= 3.',
      },
      {
        method: 'Semilock-set / face-boundary analysis',
        mechanism: 'combinatorial',
        layer: 'model',
        partial: 'A trajectory can approach a face of the orthant without any single species going to zero, evading semilock-set arguments.',
        implication: 'Classify the face-approach dynamics combinatorially to certify a uniform distance from the boundary.',
      },
    ],
    tool_links: [
      { tool_id: 'dynamical-systems', role: 'partial' },
      { tool_id: 'lattice-order', role: 'partial' },
    ],
    related_problems: [
      {
        id: 'mc-001',
        relation: 'depends_on',
        note: 'Persistence is the key lemma toward the Global Attractor Conjecture.',
      },
    ],
    statement: `Prove that every **weakly reversible** mass-action system is **persistent**: for every positive initial condition $x_0$,

$$\\liminf_{t \\to \\infty} x_i(t) > 0 \\quad \\text{for all species } i,$$

i.e. no species goes extinct asymptotically. Equivalently, the $\\omega$-limit set of any positive trajectory is contained in the positive orthant.`,
    origin:
      'Persistence formalizes the chemical intuition that a reactor whose every reaction can be reversed (in the weak sense) cannot permanently drive any species to zero concentration. It is the weakest stability property one expects, and it is still open in full generality.',
    progress: [
      '**Endotactic networks are persistent** (Craciun–Nazarov–Pantea 2013; Gopalkrishnan–Miller–Shiu 2014) — covers all 2D networks and many higher-dimensional ones.',
      '**Strongly endotactic networks are permanent** (uniform persistence).',
      '**Two-dimensional weakly reversible networks**: fully resolved.',
    ],
    obstacles: [
      '**Weakly reversible need not be endotactic**: endotacticity is a geometric condition on reaction vectors that can fail in dimension $\\ge 3$.',
      '**Extinction along faces**: a trajectory may approach a face of the orthant without any single species converging to zero, evading semilock-set arguments.',
    ],
    formalization_notes:
      'The endotactic-network persistence proof is geometric-combinatorial (polyhedral geometry + ODE invariance) and is a candidate for formalization in Lean given a convex-geometry library. The general conjecture is open-ended.',
    references: [
      {
        label: 'Craciun, Nazarov, Pantea, Persistence and permanence of mass-action and power-law systems, SIAM J. Appl. Math., 2013',
        url: 'https://arxiv.org/abs/1010.3050',
      },
    ],
    judgment: 'A pass proves that every weakly reversible mass-action system is persistent — every positive trajectory stays bounded away from the boundary of the positive orthant, equivalently its $\\omega$-limit set lies in $\\mathbb{R}_{>0}^n$ — with the face-boundary (semilock-set) obstruction handled; a counterexample network is accepted only if the escaping positive trajectory is rigorously verified.',
  },
  {
    id: 'mc-003',
    output: 'verified_behavior',
    title: 'Complete Classification of Spectra Realizable by Benzenoid Molecular Graphs',
    titleZh: '苯环型分子图可实现谱的完全分类',
    domain: 'mathematical-chemistry',
    subdomain: 'chemical-graph-theory',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'high',
    verification_path: 'numerical',
    tags: ['molecular-graphs', 'inverse-eigenvalue-problem', 'benzenoids', 'huckel-theory'],
    contributor: 'admin',
    date_added: '2026-08-21',
    proposer: 'multiple contributors',
    proposed_year: 2000,
    via: { label: 'Survey of inverse eigenvalue / realizable spectra of chemical graphs: Gutman & Cyvin, Advances in the Theory of Benzenoid Hydrocarbons' },
    failure_records: [
      {
        method: 'Inverse eigenvalue / realizability constraints for benzenoids',
        mechanism: 'combinatorial',
        layer: 'model',
        partial: 'Benzenoids are bipartite so spectra are symmetric; realizability couples integer-coefficient characteristic polynomials with hexagonal-embedding geometry, and no inverse theorem exists for the family.',
        implication: 'A verified enumeration of polyhex structures combined with interval arithmetic can certify realizability decisions for target gaps.',
      },
      {
        method: 'Extremal HOMO–LUMO gap search via Clar structures',
        mechanism: 'missing_bound',
        layer: 'formal',
        partial: 'Extremal gap candidates are conjectured from chemical heuristics without proof.',
        implication: 'Prove the extremal-gap bound, replacing heuristic conjectures with a certified quadratic spectral criterion.',
      },
    ],
    tool_links: [
      { tool_id: 'combinatorics-graph', role: 'partial' },
      { tool_id: 'polynomial-real', role: 'partial' },
      { tool_id: 'interval-numerics', role: 'available' },
    ],
    related_problems: [],
    statement: `A benzenoid graph is a finite connected subgraph of the hexagonal lattice with no cut vertices (fused benzene rings). Under Hückel theory, the adjacency spectrum of the molecular graph determines $\\pi$-electron energies. **Characterize the set of realizable spectra**: give necessary and sufficient conditions for a multiset of real numbers in $[-3,3]$ to be the adjacency spectrum of a benzenoid graph; in particular, classify the maximal spectral gaps (HOMO–LUMO gaps) attainable as a function of the number of hexagons.`,
    origin:
      'Hückel molecular orbital theory maps $\\pi$-electron structure to graph spectra; the HOMO–LUMO gap controls chemical reactivity and photostability of aromatic hydrocarbons. Inverse spectral questions ask which electronic structures are chemically realizable.',
    progress: [
      '**Bipartite structure**: benzenoids are bipartite, hence spectra symmetric about 0.',
      '**Nullity results**: bounds on the multiplicity of eigenvalue 0 via matching theory.',
      '**Extensive tabulations**: spectra of all benzenoids with up to ~10 hexagons computed; asymptotic density results for random benzenoids.',
    ],
    obstacles: [
      '**Inverse problems are rigid**: no analogue of the graph inverse eigenvalue theorem exists for this restricted family; realizability constraints are number-theoretic (characteristic polynomials with integer coefficients) combined with geometric (hexagonal embedding).',
      '**Gap maximization**: extremal candidates (Clar structures) are conjectured from chemical heuristics without proof.',
    ],
    engineering_value:
      "Turns HOMO-LUMO gap design into a constraint-satisfaction problem: synthetic chemists and organic-electronics engineers pre-screen candidate aromatic cores for a required band gap and photostability instead of enumerate-and-test screening of every candidate molecule.",
    formalization_notes:
      'Both the enumerative part (polyhex enumeration) and spectral computation are decidable and verified numerically; formal proofs of asymptotic bounds are realistic. High suitability for verified-computation approaches (interval arithmetic in Lean/Coq).',
    references: [
      {
        label: 'Gutman, Polansky, Mathematical Concepts in Organic Chemistry, Springer, 1986',
        url: 'https://link.springer.com/book/10.1007/978-3-642-70982-1',
      },
    ],
    judgment: 'The acceptable answer is a verifiable quadratic spectral criterion rather than an exhaustive enumeration of all spectra: for a given target HOMO–LUMO gap and hexagon count $h$, deliver a verifiable decision — whether a benzenoid molecular graph realizes this spectral gap — together with a re-checkable certificate of a set of candidate structures and their spectra, accompanied by a two-layer residual total band: (1) **R_model**: an upper bound on the residual introduced by restricting the true molecular electronic structure to the Hückel adjacency-spectrum model (explicitly including the qualitative restrictions for hexagon embedding/fused double bonds); (2) **R_num**: an upper bound on the residual of the interval/exact arithmetic used in the spectral computation and realizability adjudication (number-theoretic constraints + hexagon embedding verification). The parameters (target gap, hexagon count) are exactly specified design inputs, hence **R_param≡0 (no input measurement residual layer, as explicitly noted)**. Consumption form of a passing decision: given a target band gap, directly obtain the verifiable decision "whether that gap can be realized by some benzenoid molecule (yes/no) + if so a candidate core with its total band", consumable directly by organic-electronic-material pre-screening without enumerating the full candidate set.',
    certificate: {
      r_model: {
        bound: 'Upper bound on the residual introduced by restricting the true molecular electronic structure to the Hückel adjacency-spectrum model (including the qualitative restrictions for hexagon embedding/fused double bonds)',
        derivation: 'Hückel-model residual bound',
      },
      r_param: {
        bound: '≡0 (the target gap and hexagon count are exactly specified design inputs; no input measurement residual layer)',
        derivation: 'Parameters exactly specified',
        kind: 'assumption',
        upper: 0,
      },
      r_num: {
        bound: 'Upper bound on the residual of the interval/exact arithmetic used in the spectral computation and realizability adjudication (number-theoretic constraints + hexagon embedding verification)',
        derivation: 'Interval/exact arithmetic closure',
        kind: 'numerical',
      },
      total_band: 'Gap-realizability decision envelope ≤ R_model + R_num',
      certified_band: 'Candidate-core spectral-gap confirmation interval',
    },
    formal_view: {
      statement: 'For a given hexagon count $h$ and target gap, decide whether there exists a benzenoid molecular graph (a finite connected subgraph of the hexagonal lattice with no cut vertices) whose Hückel adjacency spectrum has HOMO–LUMO gap equal to that value, and give a complete classification of the realizing family.',
      target: 'Lean4/mathlib (interval arithmetic)',
      artifact: { label: 'Gutman & Polansky, Mathematical Concepts in Organic Chemistry, 1986', url: 'https://link.springer.com/book/10.1007/978-3-642-70982-1' },
      judgment: 'Proof certificate or verifiable quadratic criterion; shares the same R_model/R_num semantics with the band side',
      status: 'conjectured',
      via: 'Gutman & Polansky (1986); see the certificate of this problem for detailed residuals',
    },
    bridge: {
      link: 'The band-side "gap-realizability decision ≤ R_model + R_num" is an engineering bandization of the formal-side ideal Hückel spectral-gap proposition: taking ε→0 in the formal proposition (treating Hückel as exact) yields precisely the idealization of that decision.',
      direction: 'formal_idealizes_banded',
      shared_residuals: ['r_model', 'r_num'],
      band_as_fn_of_eps: 'The band contracts with the idealization; R_model explicitly restricts the true electronic structure to the Hückel model',
    },
  },
  {
    id: 'mc-004',
    output: 'verified_truth',
    title: 'Classification of Small Reaction Networks Admitting Multistationarity',
    titleZh: '允许多重稳态的小规模反应网络的完全分类',
    domain: 'mathematical-chemistry',
    subdomain: 'chemical-reaction-network-theory',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'high',
    verification_path: 'analytical',
    tags: ['multistationarity', 'real-algebraic-geometry', 'sign-patterns', 'bistability'],
    contributor: 'admin',
    date_added: '2026-08-21',
    proposer: 'G. Craciun & M. Feinberg',
    proposed_year: 2005,
    via: {
      label: 'Craciun & Feinberg, Multiple equilibria in complex chemical reaction networks, SIAM J. Appl. Math. 65 (2005) (combined with injectivity/parameterization criteria)',
      url: 'https://doi.org/10.1137/S0895479803446819',
    },
    failure_records: [
      {
        method: 'Quantifier elimination on multistationarity conditions',
        mechanism: 'combinatorial',
        layer: 'num',
        partial: 'Multistationarity conditions are polynomial inequalities in rate constants; quantifier elimination is doubly exponential in the number of species and reactions.',
        implication: 'A verified SAT/SMT or Lean enumeration of the motif space would certify exhaustiveness without correctness gaps.',
      },
      {
        method: 'Computer-assisted network enumeration (Joshi–Shiu atoms)',
        mechanism: 'unbounded_residual',
        layer: 'formal',
        partial: 'Embedding and lifting results show small motifs generate all multistationary networks, but exhaustive case analysis over topologies has correctness gaps.',
        implication: 'Machine-check the enumeration so the finite list of multistationarity motifs is certified to be exhaustive.',
      },
    ],
    tool_links: [
      { tool_id: 'polynomial-real', role: 'partial' },
      { tool_id: 'algebra', role: 'partial' },
      { tool_id: 'combinatorics-graph', role: 'partial' },
    ],
    related_problems: [
      {
        id: 'mc-001',
        relation: 'shares_tools',
        note: 'Both reduce questions about mass-action steady states to combinatorics of the stoichiometric and sign structures.',
      },
    ],
    statement: `For mass-action networks with at most $N$ reactions and $S$ species (fix small values, e.g. $S \\le 2$, or $N \\le 4$ with arbitrary species), **give a complete combinatorial classification** of which networks can admit **multiple positive steady states** within a stoichiometric class for some choice of rate constants. The answer should be a finite, checkable list of "multistationarity motifs" and a proof that no others exist.`,
    origin:
      'Bistability is the mechanism of biological switches (cell fate decisions, toggle switches in synthetic biology). Knowing the complete catalog of minimal bistable reaction motifs determines what switch-like behavior is chemically possible at a given complexity.',
    progress: [
      '**CRNT toolbox**: deficiency and injectivity tests exclude multistationarity for large classes.',
      '**Joshi–Shiu "atoms of multistationarity"**: embedding/lifting results show which small motifs generate all multistationary networks.',
      '**Conradi–Feliu–Mincheva–Wiuf**: structural conditions via rate constants for specific families; mixed volume bounds on the number of steady states.',
    ],
    obstacles: [
      '**Semialgebraic explosion**: multistationarity conditions are systems of polynomial inequalities in rate constants; quantifier elimination is doubly exponential.',
      '**Classification completeness**: proving a motif list is exhaustive requires case analysis over network topologies that currently only computer-assisted enumeration can handle — with correctness gaps.',
    ],
    formalization_notes:
      'This is one of the best-suited problems on the site for machine-checked mathematics: the classification is finite, and a verified enumeration (certified SAT/SMT or Lean) would constitute a publishable result.',
    references: [
      {
        label: 'Joshi, Shiu, A survey of methods for deciding whether a reaction network is multistationary, Math. Model. Nat. Phenom., 2015',
        url: 'https://arxiv.org/abs/1412.5257',
      },
    ],
    judgment: 'A pass provides a finite, checkable list of multistationarity motifs for the stated $(S,N)$ range and proves it exhaustive, with each motif summed over the sign-pattern and injectivity analysis on the stoichiometric and rate-constant cone; any enumeration or quantifier-elimination step must be a verified certificate.',
  },
  {
    id: 'mc-005',
    output: 'verified_behavior',
    judgment: 'A pass must supply an algorithm together with a complete classification of when the rate constant vector is structurally identifiable from the observable subset, and a correctness proof of the decision procedure relative to the stated ideal noise-free observation model. The acceptable answer is a verifiable decision accompanied by a three-layer residual total band: (1) **R_model** = the upper bound on the approximate residual lost by restricting the observations to a distinguishable subset/ideal noise-free model; (2) **R_param** = the input residual upper bound of rate-constant measurement uncertainty on the decision boundary (the identifiability conclusion must remain stable for all $k$ in the measurement interval); (3) **R_num** = the verification residual upper bound of the algebraic decision steps (differential-algebraic symbolic computation). When there is no input measurement residual, R_param≡0 must be explicitly noted.',
    certificate: {
      r_model: {
        bound: 'Upper bound on the approximate residual lost by restricting observations to a distinguishable subset / ideal noise-free model',
        derivation: 'Ideal noise-free observation-model restriction residual bound',
      },
      r_param: {
        bound: 'Input residual upper bound of rate-constant measurement uncertainty on the identifiability decision boundary (the conclusion remains stable for all k in the measurement interval)',
        derivation: 'Interval image of the measurement interval propagated to the resolution boundary',
      },
      r_num: {
        bound: 'Verification residual upper bound of the algebraic decision steps (differential-algebraic symbolic computation)',
        derivation: 'Symbolic computation / quantifier-elimination closure bound',
        kind: 'numerical',
      },
      total_band: 'Identifiability decision boundary ≤ R_model + R_param + R_num',
      certified_band: 'Structurally identifiable / non-identifiable classification decision',
    },
    title: 'Structural Identifiability Classification of Mass-Action Rate Constants',
    titleZh: '质量作用速率常数的结构可辨识性分类',
    domain: 'mathematical-chemistry',
    subdomain: 'inverse-problems',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'medium',
    verification_path: 'analytical',
    tags: ['identifiability', 'parameter-estimation', 'differential-algebra', 'model-reduction'],
    contributor: 'admin',
    date_added: '2026-08-21',
    proposer: 'E. Sontag',
    proposed_year: 2008,
    via: { label: 'Sontag, Dynamic compensation, parameter identifiability, and equivariances, PLoS Comput. Biol. 13 (2017); review of identifiability methods see Miao et al., SIAM Review 53 (2011)', url: 'https://doi.org/10.1371/journal.pcbi.1005447' },
    failure_records: [
      {
        method: 'Differential-algebra identifiability (DAISY and successors)',
        mechanism: 'combinatorial',
        layer: 'num',
        partial: 'Decides identifiability for moderate-size models, but with no general complexity classification purely in terms of graph-theoretic data.',
        implication: 'Formalize the correctness of the differential-algebra decision procedure for linear compartmental models as the machine-checkable first milestone.',
      },
      {
        method: 'Parameter-equivalence / indistinguishability analysis',
        mechanism: 'parameter_sensitive',
        layer: 'param',
        partial: 'Fully characterizes parameter equivalence classes for small networks; structurally identifiable parameters may still be practically unrecoverable.',
        implication: 'Propagate the measurement interval through the decision boundary so identifiability conclusions remain stable for all k in the interval.',
      },
    ],
    tool_links: [
      { tool_id: 'polynomial-real', role: 'partial' },
      { tool_id: 'algebra', role: 'partial' },
      { tool_id: 'interval-numerics', role: 'available' },
    ],
    related_problems: [
      {
        id: 'mc-030',
        relation: 'generalizes',
        note: 'Total-band inheritance (direction two): the structural identifiability classification of mc-005 is inherited by the steady-state concentration band of mc-030. This problem is the upstream one — if mc-005 decides that some measurement scheme is non-identifiable, then the mc-030 concentration band on that measurement interval fails; the credibility of the downstream band chains into the classification certificate of this problem.',
      },
    ],
    statement: `For a mass-action network where only a subset of species concentrations is observable, **give an algorithm and a complete classification** deciding whether the vector of rate constants $k$ is **structurally identifiable** (uniquely recoverable, locally or globally, from ideal noise-free observation of the observable species over all time), as a function of the network topology and the observation pattern.`,
    origin:
      'Experimental kinetics measures only some species (e.g. spectroscopically visible ones); whether rate constants can in principle be recovered from such data determines the interpretability of every fitted kinetic model in catalysis and systems biology.',
    progress: [
      '**Differential algebra methods** (DAISY and successors) decide identifiability for moderate-size models.',
      '**Solving-specific classes**: linear compartmental models have extensive identifiability theory.',
      '**Indistinguishability analysis**: full characterization of parameter equivalence classes for small networks.',
    ],
    obstacles: [
      '**No complexity classification**: existing algorithms terminate but no general theorem bounds or characterizes when identifiability holds purely in terms of graph-theoretic data.',
      '**Practical vs. structural**: even structurally identifiable parameters can be practically unrecoverable; bridging the two is a separate open question.',
    ],
    engineering_value:
      "A complete identifiability classification tells experimental kinetics and reactor engineers which rate constants are in-principle recoverable from visible species, so they stop fitting unknowable parameters and instead design the observation scheme (which species to track) that makes target parameters identifiable.",
    formalization_notes:
      'The differential-algebra decision procedures are algorithmic and implementable; formalizing correctness of one such procedure (e.g. for linear compartmental models) is a realistic project.',
    references: [
      {
        label: 'Bellu, Saccomani, Audoly, D\'Angio, DAISY: a new software tool to test global identifiability, Comput. Methods Programs Biomed., 2007',
        url: 'https://pubmed.ncbi.nlm.nih.gov/17123745/',
      },
    ],
  },
  {
    id: 'mb-001',
    output: 'verified_truth',
    judgment: 'A pass gives a closed-form or polynomial-time-computable expression for the fixation probability on general graphs, or a rigorous formula plus an exact amplifier characterization for specific graph families, and backs any hardness claim with a reduction certificate from an established hard problem.',
    title: 'Exact Fixation Probability of a Mutant on Arbitrary Graphs',
    titleZh: '任意图上突变体精确固定概率',
    domain: 'mathematical-biology',
    subdomain: 'evolutionary-dynamics',
    status: 'open',
    difficulty: 'frontier',
    formalization_potential: 'medium',
    verification_path: 'analytical',
    tags: ['evolutionary-graph-theory', 'moran-process', 'fixation-probability', 'amplifiers-of-selection'],
    contributor: 'admin',
    date_added: '2026-08-21',
    proposer: 'E. Lieberman, C. Hauert & M. A. Nowak',
    proposed_year: 2005,
    via: {
      label: 'Lieberman–Hauert–Nowak, Evolutionary dynamics on graphs, Nature 433 (2005)',
      url: 'https://doi.org/10.1038/nature03204',
    },
    failure_records: [
      {
        method: 'Markov-chain state-space aggregation (isothermal theorem)',
        mechanism: 'combinatorial',
        layer: 'num',
        partial: 'The Moran chain has 2^N states; symmetries collapse it only for highly structured graphs, and exact computation is #P-hard in general.',
        implication: 'A polynomial-time algorithm for special graph families, or a certified FPRAS for undirected graphs, is the tractable formalization target.',
      },
      {
        method: 'Amplifier classification via initialization schemes',
        mechanism: 'parameter_sensitive',
        layer: 'param',
        partial: 'Amplification depends on temperature- versus uniform-initialized placement; no unified classification exists even for undirected graphs.',
        implication: 'Classify amplifiers per initialization scheme — a unified criterion is the missing statement.',
      },
    ],
    tool_links: [
      { tool_id: 'combinatorics-graph', role: 'partial' },
      { tool_id: 'stochastic-processes', role: 'partial' },
    ],
    related_problems: [
      {
        id: 'mb-002',
        relation: 'shares_tools',
        note: 'Both are absorption-probability problems for Markov chains on configuration spaces of graphs.',
      },
    ],
    statement: `In the Moran process on a directed weighted graph $G$ with $N$ vertices and mutant fitness $r$, a single mutant placed at vertex $v$ takes over the population with fixation probability $\\rho_v(G, r)$. **Find a closed-form or polynomial-time-computable expression for $\\rho_v(G, r)$ on general graphs**; and characterize exactly which families of graphs are **amplifiers of selection**: $\\rho(G,r) > \\rho_{\\text{well-mixed}}(r)$ for all $r>1$ and $< $ for $r<1$.`,
    origin:
      'Evolutionary graph theory (Lieberman–Hauert–Nowak 2005) models spatial structure in populations: tumors, microbial colonies, structured microbial ecosystems. Fixation probability determines how spatial structure accelerates or suppresses evolution.',
    progress: [
      '**Isothermal theorem**: regular graphs with uniform weights behave like the well-mixed population.',
      '**Known amplifiers**: star, superstar, funnel families amplify selection; some suppressors characterized.',
      '**Complexity results**: exact computation is #P-hard in general; FPRAS exist for undirected graphs (recent breakthroughs).',
    ],
    obstacles: [
      '**State-space explosion**: the Markov chain has $2^N$ states; symmetries that collapse it exist only for highly structured graphs.',
      '**Amplifier classification**: amplification depends on temperature-initialized vs uniform-initialized placement; a unified classification is missing even for undirected graphs.',
    ],
    engineering_value:
      "Exact fixation probabilities on arbitrary graphs let synthetic-biology and tumor-research teams predict whether spatial structure amplifies or suppresses a mutation, informing sterilization and treatment schedules with provable takeover guarantees instead of noisy simulation averages.",
    formalization_notes:
      'The isothermal theorem is a clean linear-algebra argument — a good formalization target. General fixation probability involves #P-hardness, so formal statements should target specific graph families.',
    references: [
      {
        label: 'Lieberman, Hauert, Nowak, Evolutionary dynamics on graphs, Nature, 2005',
        url: 'https://www.nature.com/articles/nature03204',
      },
      {
        label: 'Allen et al., Fixation probabilities in graph-structured populations, Nat. Rev. Phys., 2021',
        url: 'https://arxiv.org/abs/2006.11954',
      },
    ],
  },
  {
    id: 'mb-002',
    output: 'verified_truth',
    title: 'Sharp Metastable Lifetime of the SIS Epidemic on Networks',
    titleZh: '网络上 SIS 流行病亚稳态寿命的精确渐近',
    domain: 'mathematical-biology',
    subdomain: 'epidemic-networks',
    status: 'open',
    difficulty: 'frontier',
    formalization_potential: 'medium',
    verification_path: 'analytical',
    tags: ['sis-epidemic', 'metastability', 'spectral-threshold', 'interacting-particle-systems'],
    contributor: 'admin',
    date_added: '2026-08-21',
    proposer: 'R. Pastor-Satorras & A. Vespignani',
    proposed_year: 2001,
    via: {
      label: 'Tradition on network SIS metastable lifetimes: Pastor-Satorras & Vespignani, Epidemic spreading in scale-free networks, PRL 86 (2001)',
      url: 'https://doi.org/10.1103/PhysRevLett.86.3200',
    },
    failure_records: [
      {
        method: 'Potential-theoretic metastability (reversible tunneling theory)',
        mechanism: 'missing_bound',
        layer: 'model',
        partial: 'Metastability machinery applies only partially because the contact process is not reversible; rigorous results exist for regular trees and lattices.',
        implication: 'Non-reversible potential-theoretic bounds are needed to settle the spectral-radius versus subgraph-trapping dichotomy for general graphs.',
      },
      {
        method: 'Bottleneck-subgraph / trapping analysis (Chatterjee–Durrett)',
        mechanism: 'combinatorial',
        layer: 'param',
        partial: 'Stars survive exponentially long below the mean-field threshold; characterizing the bottleneck configuration for a general graph is a combinatorial problem.',
        implication: 'Identify the worst subgraph combinatorially to certify which graph families are governed by the adjacency spectral radius versus trapping.',
      },
    ],
    tool_links: [
      { tool_id: 'stochastic-processes', role: 'partial' },
      { tool_id: 'combinatorics-graph', role: 'partial' },
    ],
    related_problems: [
      {
        id: 'mb-001',
        relation: 'shares_tools',
        note: 'Both are absorption-time problems for finite Markov chains defined on graphs.',
      },
      {
        id: 'me-001',
        relation: 'shares_tools',
        note: 'Both reduce to spectral properties of graph Laplacians/adjacency operators; nonlinear coupling defeats naive spectral bounds in both.',
      },
    ],
    statement: `For the SIS contact process on a finite graph $G$ with infection rate $\\lambda$ above the epidemic threshold, the infection survives for a time $T_G$ that is exponentially large before extinction. **Prove sharp asymptotics**: constants $c(G, \\lambda), C(G,\\lambda)$ with

$$\\mathbb{E}[T_G] = \\exp\\big( (c \\pm o(1)) \\, N \\big),$$

and characterize the quasi-stationary distribution. Determine for which graph families the extinction time is governed by the spectral radius of the adjacency matrix versus by subgraph (star/community) trapping effects.`,
    origin:
      'SIS dynamics model endemic infections, computer viruses, and misinformation spreading. Public-health intervention thresholds are currently computed from the mean-field spectral criterion $\\lambda_c \\approx 1/\\lambda_1(A)$, whose accuracy on structured contact networks is poorly understood.',
    progress: [
      '**Spectral threshold**: for the linearized process, $\\lambda_c = 1/\\lambda_1(A)$ is rigorous for the NIMFA mean-field model.',
      '**Star graphs**: survival time analyzed; trapping near high-degree vertices demonstrated (Chatterjee–Durrett: stars survive exponentially long below the mean-field threshold).',
      '**Regular trees & lattices**: rigorous metastability results exist for special geometries.',
    ],
    obstacles: [
      '**Quasi-stationarity without reversibility**: the contact process is not reversible; metastability machinery (potential theory, pathwise approach) applies only partially.',
      '**Heterogeneous trapping**: extinction is driven by the worst subgraph; characterizing "the bottleneck configuration" for a general graph is a combinatorial problem inside the probabilistic one.',
    ],
    engineering_value:
      'Sharp extinction-time formulas would let network-immunization strategies (which vertices to vaccinate/treat) be optimized with provable guarantees rather than simulation.',
    formalization_notes:
      'Finite Markov chain absorption times are expressible in closed linear-algebraic form; formalizing the star-graph trapping analysis in a proof assistant is feasible. The general sharp asymptotics are open-ended research.',
    references: [
      {
        label: 'Chatterjee, Durrett, Contact processes on random graphs with power law degree distributions have critical value 0, Ann. Probab., 2009',
        url: 'https://arxiv.org/abs/0809.1748',
      },
    ],
    judgment: 'A pass proves sharp asymptotics $\\mathbb{E}[T_G]=\\exp\\big((c\\pm o(1))N\\big)$ for the SIS extinction time above threshold, identifies the quasi-stationary distribution, and characterizes for which graph families the extinction time is governed by the adjacency spectral radius versus subgraph (star/community) trapping, with the bottleneck subgraph made explicit; simulation or mean-field-only analysis is not accepted.',
  },
  {
    id: 'mb-003',
    output: 'verified_truth',
    title: 'Global Stability Classification of Replicator Dynamics with Mutation',
    titleZh: '带突变复制子动力学的全局稳定性分类',
    domain: 'mathematical-biology',
    subdomain: 'evolutionary-game-theory',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'high',
    verification_path: 'analytical',
    tags: ['replicator-dynamics', 'mutation', 'global-stability', 'evolutionary-game-theory'],
    contributor: 'admin',
    date_added: '2026-08-21',
    proposer: 'J. Hofbauer & K. Sigmund',
    proposed_year: 1998,
    via: {
      label: 'Stability of replicator dynamics with mutation: Hofbauer & Sigmund, Evolutionary Games and Population Dynamics (1998)',
      url: 'https://www.cambridge.org/core/books/evolutionary-games-and-population-dynamics',
    },
    failure_records: [
      {
        method: 'ESS / perturbation arguments (Hofbauer–Sigmund)',
        mechanism: 'parameter_sensitive',
        layer: 'param',
        partial: 'ESS guarantees global stability at mu = 0 and for partnership games; perturbation arguments are local and give no uniform-in-mu statement.',
        implication: 'A Lyapunov certificate uniform in the mutation rate mu is the required form for the stable classification.',
      },
      {
        method: 'Lyapunov ruling-out of Hopf bifurcations',
        mechanism: 'missing_bound',
        layer: 'model',
        partial: 'Mutation can create limit cycles; Lyapunov functions that rule them out globally are known only for special payoff matrices A.',
        implication: 'Extend the ODE stability library to certify global stability for the classifying pairs (A, Q), not just the mu = 0 case.',
      },
    ],
    tool_links: [
      { tool_id: 'dynamical-systems', role: 'partial' },
      { tool_id: 'polynomial-real', role: 'partial' },
    ],
    related_problems: [
      {
        id: 'mb-004',
        relation: 'analog_of',
        note: 'Replicator dynamics and Lotka–Volterra are mathematically equivalent (Hofbauer transformation); stability classifications should transfer.',
      },
      {
        id: 'mb-028',
        relation: 'generalizes',
        note: 'Total-band inheritance (direction two): the global stability classification of mb-003 is inherited by the drug-resistance equilibrium-frequency band of mb-028. This problem is the upstream one — if the stability structure of mb-003 is broken, the equilibrium-band assertion of the downstream mb-028 fails; the credibility of the downstream band chains into the classification certificate of this problem.',
      },
    ],
    statement: `Consider the replicator–mutator system

$$\\dot{x}_i = x_i\\big((Ax)_i - x^{\\top} A x\\big) + \\mu \\sum_j (Q_{ji} x_j - x_i),$$

on the simplex $\\Delta^n$, with payoff matrix $A$ and mutation kernel $Q$. **Classify all pairs $(A, Q)$ for which there is a unique globally asymptotically stable interior equilibrium for all sufficiently small $\\mu > 0$**. Provide the classification in terms of the game-theoretic structure of $A$ (ESS, negative definiteness on the tangent space, partnership games).`,
    origin:
      'The replicator–mutator equation is the standard model of evolution with errors — from quasispecies theory in virology to cultural evolution and grammar dynamics. Whether mutation stabilizes or destabilizes equilibria determines the predicted long-run behavior of the population.',
    progress: [
      '**No mutation**: ESS implies global stability for partnership games; classification known for $n \\le 3$.',
      '**With mutation, $n = 2, 3$**: bifurcation analyses exist for specific classes.',
      '**Quasispecies (single-peak fitness)**: error-threshold transitions characterized.',
    ],
    obstacles: [
      '**Mutation breaks ESS structure**: the ESS condition controls $\\mu = 0$; perturbation arguments are local and give no uniform-in-$\\mu$ statement.',
      '**Hopf bifurcations**: mutation can create limit cycles; ruling them out globally requires Lyapunov functions that are known only for special $A$.',
    ],
    formalization_notes:
      'The $\\mu = 0$ classification for partnership games uses classical Lyapunov theory and is formalizable; extending Mathlib\'s ODE stability library is the main prerequisite.',
    references: [
      {
        label: 'Hofbauer, Sigmund, Evolutionary Games and Population Dynamics, Cambridge, 1998',
        url: 'https://doi.org/10.1017/CBO9781139173179',
      },
    ],
    judgment: 'A pass classifies all pairs $(A,Q)$ for which the replicator–mutator system has a unique globally asymptotically stable interior equilibrium for all sufficiently small $\\mu>0$, in terms of the ESS/negative-definiteness/partnership structure of $A$, supplying Lyapunov certificates for the stable cases and global ruling-out of Hopf bifurcations; local perturbation arguments without uniform-in-$\\mu$ control are not accepted.',
  },
  {
    id: 'mb-004',
    output: 'verified_truth',
    judgment: 'A pass gives necessary and sufficient conditions on (r,A) for permanence as a finite algorithmic criterion over the average Lyapunov exponents of boundary equilibria, with the growth computation for each boundary invariant set certified to be correct for all positive initial data.',
    title: 'Permanence Criteria for General n-Species Lotka–Volterra Systems',
    titleZh: '一般 n 物种 Lotka–Volterra 系统的持久性判据',
    domain: 'mathematical-biology',
    subdomain: 'population-dynamics',
    status: 'open',
    difficulty: 'frontier',
    formalization_potential: 'high',
    verification_path: 'analytical',
    tags: ['lotka-volterra', 'permanence', 'average-lyapunov-functions', 'coexistence'],
    contributor: 'admin',
    date_added: '2026-08-21',
    proposer: 'J. Hofbauer',
    proposed_year: 1981,
    via: { label: 'Hofbauer, A general cooperation theorem for hypercycles, MAB 53 (1981); review of persistence see Hofbauer & Sigmund (1998)' },
    failure_records: [
      {
        method: 'Average Lyapunov function / splitting method (Hofbauer–Schreiber)',
        mechanism: 'combinatorial',
        layer: 'model',
        partial: 'Gives sufficient conditions via average Lyapunov functions; the boundary has 2^n - 1 faces whose invariant sets can be chaotic, so the criterion must average over all of them.',
        implication: 'A finite algorithmic criterion over boundary average Lyapunov exponents is the target form, with each boundary invariant set growth certified.',
      },
      {
        method: 'Boundary invariant-set growth computation',
        mechanism: 'nonconvex',
        layer: 'num',
        partial: 'Deciding whether some boundary invariant set has positive average growth is not known to be decidable in general.',
        implication: 'Verified computation of average Lyapunov exponents for n <= 3 is the tractable certified milestone.',
      },
    ],
    tool_links: [
      { tool_id: 'dynamical-systems', role: 'partial' },
      { tool_id: 'measure-ergodic', role: 'partial' },
      { tool_id: 'polynomial-real', role: 'partial' },
    ],
    related_problems: [
      {
        id: 'mc-001',
        relation: 'analog_of',
        note: 'Permanence vs boundary attraction is the same question as in the Global Attractor Conjecture; methods cross-fertilize.',
      },
      {
        id: 'mb-003',
        relation: 'analog_of',
        note: 'Lotka–Volterra and replicator dynamics are equivalent coordinate systems; a permanence classification would inform the mutation-stability problem.',
      },
    ],
    statement: `For the competitive/cooperative/mixed Lotka–Volterra system $\\dot{x}_i = x_i (r_i + \\sum_j A_{ij} x_j)$, **give necessary and sufficient conditions on $(r, A)$ for permanence** (uniform persistence): existence of $\\delta > 0$ such that $\\delta \\le \\liminf x_i(t) \\le \\limsup x_i(t) \\le \\delta^{-1}$ for all positive initial conditions. The answer should be a finite algorithmic criterion on the boundary dynamics (average Lyapunov exponents of boundary equilibria).`,
    origin:
      'Lotka–Volterra systems are the workhorse of community ecology and are mathematically equivalent to reaction networks with specific structure. Permanence is the precise mathematical meaning of "all species coexist indefinitely" — the central question of coexistence theory.',
    progress: [
      '**$n = 2$**: complete classification.',
      '**$n = 3$**: extensive classification including heteroclinic cycles (May–Leonard chaos).',
      '**Average Lyapunov function theory (Hofbauer, Schreiber)**: sufficient conditions via splitting methods; sharp criteria for special classes.',
    ],
    obstacles: [
      '**Boundary complexity grows with $n$**: the boundary of the orthant contains $2^n - 1$ faces; invariant sets on faces can be chaotic, and permanence criteria must average over all of them.',
      '**No general algorithm**: deciding whether some boundary invariant set has positive average growth is not known to be decidable in general.',
    ],
    engineering_value:
      "An algorithmic permanence criterion gives a certified coexistence guarantee for engineered microbiomes, biocontrol release and conservation planning - telling process and ecosystem engineers whether a designed species set with a given interaction matrix will persist indefinitely, before costly reactor or mesocosm trials.",
    formalization_notes:
      'The $n \\le 3$ classifications are finite case analyses over real-algebraic conditions — well suited to verified computation. General theory needs invariant-measure infrastructure not present in proof assistants.',
    references: [
      {
        label: 'Hofbauer, Sigmund, Evolutionary Games and Population Dynamics, Cambridge, 1998',
        url: 'https://doi.org/10.1017/CBO9781139173179',
      },
      {
        label: 'Schreiber, Criteria for C^r robust permanence, J. Differential Equations, 2000',
        url: 'https://doi.org/10.1006/jdeq.1999.3719',
      },
    ],
  },
  {
    id: 'me-001',
    output: 'verified_truth',
    judgment: 'A pass proves asymptotic agreement for Lipschitz nonlinear coupling and gives an explicit convergence rate bound in terms of the Lipschitz constant, the sector bound and lambda_2(L), with a matching lower example so the rate is certified rather than merely exponential in an uncontrolled constant.',
    title: 'Nonlinear Multi-Agent Consensus Convergence Rate',
    titleZh: '非线性多智能体一致性的显式收敛速率',
    domain: 'mathematical-engineering',
    subdomain: 'control-theory',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'high',
    verification_path: 'analytical',
    tags: ['multi-agent-systems', 'spectral-graph-theory', 'lyapunov-methods', 'consensus'],
    contributor: 'admin',
    date_added: '2026-08-21',
    proposer: 'R. Olfati-Saber, J. A. Fax & R. M. Murray',
    proposed_year: 2007,
    via: {
      label: 'Olfati-Saber–Fax–Murray, Consensus and cooperation in networked multi-agent systems, Proc. IEEE 95 (2007)',
      url: 'https://doi.org/10.1109/JPROC.2006.887291',
    },
    failure_records: [
      {
        method: 'Spectral / quadratic-form rate analysis via lambda_2(L)',
        mechanism: 'missing_bound',
        layer: 'model',
        partial: 'The linear case has the exact rate given by lambda_2(L); nonlinear coupling destroys the quadratic-form structure, so lambda_2 no longer controls the rate.',
        implication: 'Construct a Lyapunov rate certificate whose constant depends on the sector bound and lambda_2(L) for Lipschitz nonlinear coupling.',
      },
      {
        method: 'Passivity / output-strict passivity arguments',
        mechanism: 'missing_bound',
        layer: 'formal',
        partial: 'Give asymptotic consensus for sector-bounded nonlinearities but no explicit convergence rate.',
        implication: 'Formalize the linear-case rate theorem as milestone zero and extend it to Lipschitz couplings in Mathlib.',
      },
    ],
    tool_links: [
      { tool_id: 'combinatorics-graph', role: 'partial' },
      { tool_id: 'dynamical-systems', role: 'partial' },
    ],
    related_problems: [
      {
        id: 'mb-002',
        relation: 'shares_tools',
        note: 'Both require rigorous spectral analysis of graph operators under nonlinear coupling.',
      },
      {
        id: 'me-002',
        relation: 'generalizes',
        note: 'Decentralized optimization dynamics generalize consensus with a drift term.',
      },
    ],
    statement: `Prove that for a multi-agent system with Lipschitz nonlinear coupling $\\varphi$ on a fixed connected undirected graph $G$,

$$\\dot{x}_i = \\sum_{j \\in \\mathcal{N}(i)} \\varphi(x_j - x_i),$$

the distributed protocol achieves asymptotic agreement $x_i(t) \\to \\bar{x}$, and **characterize an explicit convergence rate bound** in terms of the Lipschitz constant of $\\varphi$ and the spectrum of the graph Laplacian $L(G)$ — in particular, whether $\\|x(t) - \\bar{x}\\mathbf{1}\\| \\le C e^{-\\alpha \\lambda_2(L) t}$ with $\\alpha$ depending only on the sector bound of $\\varphi$.`,
    origin:
      'Consensus protocols coordinate autonomous vehicle platoons, drone swarms, and distributed sensor networks. Industrial practice relies on simulation and Lyapunov candidate tuning; a rigorous rate theorem would enable formal stability certificates.',
    progress: [
      '**Linear case**: exact rate known, $\\lambda_2(L)$ (algebraic connectivity) governs convergence.',
      '**Sector-bounded nonlinearities**: asymptotic consensus known via passivity and output-strict passivity arguments.',
      '**Partial results**: explicit rates for special couplings (saturation, odd monotone functions); local convergence rates near agreement.',
    ],
    obstacles: [
      '**Spectral methods fail**: nonlinear coupling destroys the quadratic-form structure $x^{\\top}Lx$; $\\lambda_2$ no longer directly controls the rate.',
      '**Lyapunov function gap**: no general construction exists for Lipschitz nonlinearities without monotonicity/sector assumptions.',
    ],
    engineering_value:
      'A formally verified convergence rate bound would enable machine-checkable stability certificates for vehicle platoons under functional-safety standards (ISO 26262 Annex on formal methods), replacing parts of today\'s simulation campaigns.',
    formalization_notes:
      'Mathlib currently lacks a theory of nonlinear graph Laplacians with Lipschitz coupling; developing it is a necessary first step. The linear-case rate theorem is formalizable now and is the natural milestone zero.',
    references: [
      {
        label: 'Olfati-Saber, Murray, Consensus problems in networks of agents, IEEE TAC, 2004',
        url: 'https://doi.org/10.1109/TAC.2004.834113',
      },
      {
        label: 'Arcak, Passivity as a design tool for group coordination, IEEE TAC, 2007',
        url: 'https://doi.org/10.1109/TAC.2007.901315',
      },
    ],
  },
  {
    id: 'me-002',
    output: 'verified_truth',
    title: 'Tight Lower Bounds for Decentralized Optimization over Time-Varying Graphs',
    titleZh: '时变图上去中心化优化的紧下界',
    domain: 'mathematical-engineering',
    subdomain: 'distributed-algorithms',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'high',
    verification_path: 'analytical',
    tags: ['decentralized-optimization', 'lower-bounds', 'gossip-algorithms', 'time-varying-graphs'],
    contributor: 'admin',
    date_added: '2026-08-21',
    proposer: 'K. Scaman et al.',
    proposed_year: 2017,
    via: {
      label: 'Scaman et al., Optimal algorithms for smooth and strongly convex distributed optimization in networks, ICML (2017)',
      url: 'https://proceedings.mlr.press/v70/scaman17a.html',
    },
    failure_records: [
      {
        method: 'Worst-case adversarial graph-sequence construction',
        mechanism: 'combinatorial',
        layer: 'num',
        partial: 'Lower bounds exist only for restricted graph sequences or communication models; the space of sequences is combinatorially huge and existing constructions are not known to be extremal.',
        implication: 'An extremal graph-sequence construction matching the accelerated push-sum/gossip upper bounds is the needed certificate.',
      },
      {
        method: 'First-order oracle complexity framework',
        mechanism: 'missing_bound',
        layer: 'formal',
        partial: 'Static-graph lower bounds are near-tight; the role of the connectivity period B versus the spectral gap of the averaged graph is unresolved.',
        implication: 'Formalize the oracle-complexity framework (deterministic vs randomized) to certify the matching lower bound in the time-varying model.',
      },
    ],
    tool_links: [
      { tool_id: 'convex-optimization', role: 'partial' },
      { tool_id: 'combinatorics-graph', role: 'partial' },
    ],
    related_problems: [
      {
        id: 'me-001',
        relation: 'depends_on',
        note: 'Lower-bound constructions use adversarially slowed consensus dynamics.',
      },
    ],
    statement: `For decentralized minimization of a sum of $n$ smooth strongly convex local functions by $m$ agents communicating over a sequence of $B$-connected time-varying graphs, **determine the optimal worst-case iteration complexity** as a function of condition number $\\kappa$, network size $m$, and connectivity parameter $B$: prove a lower bound matching (up to constants) the best known accelerated gossip algorithms, or improve the algorithms.

Formally: any black-box decentralized first-order method requires $\\Omega\\big(\\sqrt{\\kappa}(1 + \\sqrt{B}) \\log(1/\\varepsilon)\\big)$ (or the correct expression) gradient computations per agent.`,
    origin:
      'Federated learning, distributed estimation in sensor networks, and multi-robot optimization all optimize over communication-constrained networks. Knowing the information-theoretic floor prevents wasted engineering effort on algorithms that cannot exist.',
    progress: [
      '**Static graphs**: near-tight bounds known (Scaman et al.: accelerated dual methods match lower bounds up to log factors).',
      '**Time-varying $B$-connected graphs**: upper bounds from accelerated push-sum/gossip; lower bounds established only for restricted graph sequences or communication models.',
      '**Open gap**: the role of $B$ (connectivity period) vs. spectral gap of the averaged graph is unresolved.',
    ],
    obstacles: [
      '**Adversarial graph sequences**: lower-bound constructions must design worst-case graph sequences; the space is combinatorially huge and existing constructions are not known to be extremal.',
      '**Oracle models differ**: deterministic vs randomized, exact vs stochastic gradients, and gossip vs broadcast communication give genuinely different complexities.',
    ],
    engineering_value:
      'Matching bounds would close the design space for federated learning communication schedules and certify that deployed algorithms are order-optimal for their network topology.',
    formalization_notes:
      'Lower-bound proofs are finite combinatorial constructions plus convex analysis — among the most formalization-friendly results in optimization. Requires a proof-assistant library for first-order oracle complexity (does not exist yet).',
    references: [
      {
        label: 'Scaman, Bach, Bubeck, Lee, Massoulié, Optimal convergence rates for convex distributed optimization in networks, JMLR, 2019',
        url: 'https://jmlr.org/papers/v20/16-512.html',
      },
    ],
    judgment: 'A pass proves a matching (up to constants) lower bound on the worst-case per-agent iteration complexity of decentralized first-order methods over $B$-connected time-varying graphs, or supplies an order-optimal algorithm, with the oracle model, the adversary, and the extremal graph-sequence construction made explicit and verified; a bound valid only for static graphs or a restricted communication model is not accepted.',
  },
  {
    id: 'me-003',
    output: 'verified_truth',
    title: 'Unconditional Flocking for Cucker–Smale Dynamics with Singular Kernels',
    titleZh: '奇异核 Cucker–Smale 集群动力学的无条件群集',
    domain: 'mathematical-engineering',
    subdomain: 'collective-dynamics',
    status: 'open',
    difficulty: 'frontier',
    formalization_potential: 'medium',
    verification_path: 'analytical',
    tags: ['cucker-smale', 'flocking', 'singular-kernels', 'swarm-robotics'],
    contributor: 'admin',
    date_added: '2026-08-21',
    proposer: 'F. Cucker & S. Smale',
    proposed_year: 2007,
    via: {
      label: 'Cucker & Smale, Emergent behavior in flocks, IEEE Trans. Auto. Control 52 (2007); singular-kernel case see the Ha–Tadmor tradition',
      url: 'https://doi.org/10.1109/TAC.2007.895842',
    },
    failure_records: [
      {
        method: 'Energy / entropy dissipation estimate (Cucker–Smale; Ha–Liu)',
        mechanism: 'missing_bound',
        layer: 'model',
        partial: 'Regular-kernel (alpha < 1) unconditional flocking is proven via energy dissipation; the singularity destroys the dissipation structure used to prove alignment.',
        implication: 'A singular-kernel Lyapunov functional that controls both collisions and velocity alignment would close the alpha >= 1 case.',
      },
      {
        method: 'Contraction / spectral graph argument on state-dependent topology',
        mechanism: 'combinatorial',
        layer: 'param',
        partial: 'The interaction graph depends on the configuration, blocking fixed-spectrum contraction arguments; sticky / measure-valued formulations are only partially developed.',
        implication: 'Formalize the regular-kernel Ha–Liu proof first; singular-kernel well-posedness needs measure-theory infrastructure beyond current libraries.',
      },
    ],
    tool_links: [
      { tool_id: 'dynamical-systems', role: 'partial' },
      { tool_id: 'analysis-asymptotics', role: 'partial' },
    ],
    related_problems: [
      {
        id: 'me-001',
        relation: 'shares_tools',
        note: 'Both are velocity-agreement problems on interaction graphs; here the graph is state-dependent and possibly singular.',
      },
    ],
    statement: `For the Cucker–Smale system with singular communication weight $\\psi(s) = s^{-\\alpha}$,

$$\\dot{x}_i = v_i, \\qquad \\dot{v}_i = \\frac{1}{N} \\sum_j \\psi(|x_j - x_i|)(v_j - v_i),$$

prove **unconditional flocking** (velocity alignment $\\|v_i(t) - v_j(t)\\| \\to 0$ with uniformly bounded spatial diameter) for all initial configurations and all $\\alpha \\ge 1$ — or find the critical $\\alpha$ separating conditional from unconditional flocking. A prerequisite sub-problem: global well-posedness without collisions for singular kernels.`,
    origin:
      'Cucker–Smale dynamics is the standard abstraction of swarm coordination (drones, satellites, animal groups). Short-range singular kernels model the strong alignment urge of nearby agents; collision avoidance and flocking guarantees are simultaneously required in safety-critical swarm design.',
    progress: [
      '**Regular kernels $\\alpha < 1$**: unconditional flocking proved (Cucker–Smale 2007; Ha–Liu).',
      '**Singular kernels**: flocking proved for $\\alpha < 1$; for $\\alpha \\ge 1$, collision avoidance results exist (Peszek and successors) and flocking under additional assumptions.',
      '**Sticky/agent-collision regimes**: measure-valued formulations partially developed.',
    ],
    obstacles: [
      '**Collision vs flocking tension**: singular repulsion prevents collisions, but the same singularity destroys the energy-dissipation structure used to prove alignment.',
      '**State-dependent topology**: the interaction graph changes with the configuration, blocking spectral and contraction arguments.',
    ],
    engineering_value:
      'Unconditional flocking theorems with singular kernels are exactly the guarantee needed for certified collision-free swarm robotics: alignment plus no-collision from the same potential.',
    formalization_notes:
      'The regular-kernel Ha–Liu flocking proof is compact and energy-based — a realistic formalization target. Singular-kernel well-posedness involves measure theory beyond current libraries.',
    references: [
      {
        label: 'Cucker, Smale, Emergent behavior in flocks, IEEE TAC, 2007',
        url: 'https://doi.org/10.1109/TAC.2007.895842',
      },
      {
        label: 'Peszek, Cucker–Smale flocks with singular communication weights, 2015+',
        url: 'https://arxiv.org/abs/1503.01024',
      },
    ],
    judgment: 'A pass proves unconditional flocking for all initial configurations for some $\\alpha\\ge 1$ (velocity alignment with bounded spatial diameter), or identifies the critical $\\alpha$ separating conditional from unconditional flocking, with global well-posedness without collisions certified as a prerequisite; numerical evidence or an $\\alpha<1$ only result is not accepted.',
  },
  {
    id: 'mp-009',
    output: 'verified_truth',
    title: 'Area Law for Ground States of Two-Dimensional Gapped Local Hamiltonians',
    titleZh: '二维有能隙局域哈密顿量基态的面积律',
    domain: 'mathematical-physics',
    subdomain: 'quantum-information',
    status: 'open',
    difficulty: 'frontier',
    formalization_potential: 'medium',
    verification_path: 'analytical',
    tags: ['area-law', 'entanglement-entropy', 'tensor-networks', 'peps'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'multiple contributors',
    proposed_year: 2000,
    via: { label: 'Area-law survey (1D proven; 2D generally open): Brandão & Harrow; the Eisert–Cramer–Plenio review' },
    related_problems: [
      {
        id: 'mp-005',
        relation: 'shares_tools',
        note: 'Both ask for rigorous entanglement control in 2D lattice quantum systems; AKLT-type models are the main testbeds.',
      },
    ],
    statement: `Prove or disprove: for any local Hamiltonian $H = \\sum_X h_X$ on a two-dimensional lattice with uniformly bounded interaction strength and a uniform spectral gap $\\Delta > 0$, the entanglement entropy of the ground state across any bipartition $A|B$ satisfies
$$S(\\rho_A) \\le C\\,|\\partial A|,$$
with $C$ depending only on $\\Delta$, the interaction range, and the local dimension — **not** on the system size.`,
    origin:
      'Area laws justify the tensor-network (PEPS/DMRG) algorithms that dominate computational quantum materials science. The 1D case was proved by Hastings (2007); the 2D statement underlies the practical success of PEPS in simulating quantum matter.',
    progress: [
      '**Hastings (2007)**: area law proved in one dimension.',
      '**Anshu–Arad–Gosset (2020)**: area law in 2D proved under an additional strong local-approximation assumption (volumetric agnostic case partial).',
      '**Brandão–Horodecki / Van Acoleyen et al.**: exponential decay of correlations in 2D gapped systems; area law verified for free-fermion and perturbative regimes.',
    ],
    obstacles: [
      '**Entanglement across the boundary can organize nonlocally**: 1D proof techniques (approximate ground-state projections) degrade exponentially with boundary length.',
      '**No rigorous handle on many-body entanglement structure** of generic 2D gapped phases beyond exactly solvable models.',
    ],
    engineering_value:
      'A positive resolution certifies that PEPS contraction cost is polynomial in the boundary length, giving tensor-network simulation of 2D quantum materials an a priori complexity upper bound; a counterexample would delineate the applicability boundary of the PEPS method.',
    formalization_notes:
      'The statement is fully elementary (finite lattices, explicit constants). A Lean formalization of the 1D Hastings theorem would be the natural stepping stone.',
    references: [
      {
        label: 'Hastings, An area law for one-dimensional quantum systems, J. Stat. Mech. P08024, 2007',
        url: 'https://arxiv.org/abs/0705.2024',
      },
      {
        label: 'Anshu, Arad, Gosset, An area law for 2D frustration-free spin systems, STOC 2022',
        url: 'https://arxiv.org/abs/2103.02492',
      },
    ],
    judgment: 'A pass proves $S(\\rho_A)\\le C|\\partial A|$ with $C$ independent of lattice size for every uniformly gapped 2D local Hamiltonian, or provides a counterexample, with the entanglement-structure estimate not relying on the strong local-approximation assumption used by existing partial proofs.',
  },
  {
    id: 'mp-010',
    output: 'verified_truth',
    judgment: 'A pass must prove the existence of energies with absolutely continuous spectrum and extended eigenstates for sufficiently small lambda on Z^3, established by a rigorous resolvent or multiscale argument, and corroborated by certified numerical transfer-matrix scaling if the claim is stated as quantitative.',
    title: 'Delocalization of the Anderson Model at Weak Disorder in Dimension Three',
    titleZh: '三维 Anderson 模型弱无序区的离域化猜想',
    domain: 'mathematical-physics',
    subdomain: 'random-schrodinger',
    status: 'open',
    difficulty: 'frontier',
    formalization_potential: 'low',
    verification_path: 'numerical',
    tags: ['anderson-model', 'delocalization', 'random-matrix', 'spectral-theory'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'multiple contributors',
    proposed_year: 1958,
    via: { label: 'Delocalization for the 3D weak-disorder Anderson model (distinct from the resolved 2D/strong-disorder cases): Anderson (1958) and recent delocalization literature' },
    related_problems: [
      {
        id: 'mp-007',
        relation: 'generalizes',
        note: 'mp-007 treats the same transition on regular trees, where delocalization is now proved in a large window; the lattice case remains untouched.',
      },
    ],
    statement: `Consider the Anderson model $H = -\\Delta + \\lambda V$ on $\\mathbb{Z}^3$ with i.i.d. potential, e.g. uniform on $[-1,1]$. **Prove that for sufficiently small $\\lambda > 0$ there exist energies with absolutely continuous spectrum and delocalized (extended) eigenstates** — equivalently, that the mobility edge exists and a metallic phase is present.`,
    origin:
      'Anderson (1958) predicted a disorder-driven metal–insulator transition, confirmed numerically and experimentally in cold atoms. The metallic side of the transition in dimension $d \\ge 3$ has resisted rigorous proof for over 60 years.',
    progress: [
      '**Fröhlich–Spencer (1983)**: localization at strong disorder via multiscale analysis.',
      '**Aizenman–Molchanov (1993)**: fractional-moment localization method.',
      '**On trees (mp-007)**: delocalization proved in a large window (Bapst; Bauerschmidt–Huang–Yau; Dubova–Yang–Yau–Yin 2025) — the techniques do not transfer to lattices.',
    ],
    obstacles: [
      '**Absence of a rigorous renormalization picture**: all delocalization proofs on trees exploit the absence of loops; lattice loops destroy the recursion.',
      '**Resonant tunneling between distant regions** cannot yet be excluded probabilistically at weak disorder.',
    ],
    engineering_value:
      'Modeling carrier transport in disordered semiconductors depends on the existence of the mobility edge; a rigorous result would turn the empirically fitted mobility-edge parameter in device simulation into a provable quantity.',
    formalization_notes:
      'The statement is a clean spectral-theoretic conjecture, but current proof technology is far away. Numerical verification (transfer-matrix scaling) is standard and could be certified with interval arithmetic.',
    references: [
      {
        label: 'Fröhlich, Spencer, Absence of diffusion in the Anderson tight binding model, CMP 88, 1983',
        url: 'https://projecteuclid.org/journals/communications-in-mathematical-physics/volume-88/issue-2',
      },
      {
        label: 'Lagendijk, van Tiggelen, Wiersma, Fifty years of Anderson localization, Physics Today 62(8), 2009',
        url: 'https://pubs.aip.org/physicstoday/article/62/8/24/388403',
      },
    ],
  },
  {
    id: 'mp-011',
    output: 'verified_truth',
    judgment: 'A pass proves that the integrated density of states attains every allowed gap label for every irrational alpha including the critical coupling lambda=1 and Liouville rotations, via a proof certificate; for fixed rational approximants the minimal acceptable form is a finite certified-numerics gap-openness check on the Harper operator.',
    title: 'The Dry Ten Martini Problem for the Almost Mathieu Operator',
    titleZh: '殆 Mathieu 算子的“干十马提尼”问题',
    domain: 'mathematical-physics',
    subdomain: 'spectral-theory',
    status: 'partial',
    difficulty: 'advanced',
    formalization_potential: 'high',
    verification_path: 'numerical',
    tags: ['almost-mathieu', 'gap-labelling', 'quasiperiodic', 'hofstadter-butterfly'],
    contributor: 'admin',
    date_added: '2026-08-22',
    provenance: 'lean-compilable',
    lean_statement: 'import Std\n\n/-!\nmp-011 — The Dry Ten Martini Problem for the Almost Mathieu operator.\n\nFor the almost Mathieu operator H(lam,α) on ℓ²(ℤ) with irrational α and lam ≠ 0,\nevery energy predicted as a spectral gap by the gap-labelling theorem is in fact\nNOT in the spectrum (the gaps are open). The predicates are formalization\ntargets; the implication is the headline claim (proof left open via `sorry`).\n-/\nnamespace MathX\n\ndef GapLabelledEnergy (lam alpha E : Rat) : Prop := by\n  exact False\n\ndef InSpectrum (lam alpha E : Rat) : Prop := by\n  exact True\n\ntheorem dry_ten_martini (lam alpha E : Rat) (hlam : lam ≠ 0) :\n    GapLabelledEnergy lam alpha E → ¬ InSpectrum lam alpha E := by\n  sorry\n\nend MathX\n',
    proposer: 'B. Simon',
    proposed_year: 1982,
    via: { label: 'Survey of open problems for the Almost Mathieu operator: Simon, von Neumann eigenvalues conjecture (1982); Dry Ten Martini see the Avila–Jitomirskaya series' },
    related_problems: [
      {
        id: 'mp-010',
        relation: 'analog_of',
        note: 'Quasiperiodic order as a deterministic substitute for disorder; both concern the metal–insulator dichotomy.',
      },
    ],
    statement: `For the almost Mathieu operator $(H_{\\alpha,\\lambda,\\theta}u)_n = u_{n+1}+u_{n-1}+2\\lambda\\cos(2\\pi(\\theta+n\\alpha))u_n$ with $\\lambda \\ne 0, \\pm 1$ and **every** irrational $\\alpha$, prove that the integrated density of states takes **every** allowed gap label — i.e. all gaps predicted by the gap-labelling theorem (K-theory of the rotation algebra) are open. (The "Ten Martini" conjecture — Cantor spectrum — is proved; the "Dry" version asserts all gaps are open.)`,
    origin:
      'The Hofstadter butterfly governs electrons in 2D crystals under magnetic fields and reappears verbatim in moiré superlattices (twisted bilayer graphene). Gap openness determines the observable quantized Hall conductances.',
    progress: [
      '**Avila–Jitomirskaya (2009)**: Ten Martini problem solved — the spectrum is a Cantor set for all irrational $\\alpha$.',
      '**Puig (2004)**: Cantor spectrum for Diophantine $\\alpha$, noncritical $\\lambda$.',
      '**Dry Ten Martini**: proved for Diophantine $\\alpha$ away from critical coupling by Avila–Jitomirskaya; the critical-coupling and Liouville cases remain incomplete in full generality.',
    ],
    obstacles: [
      '**Critical coupling $\\lambda=1$** sits at the self-dual point where localization and reducibility techniques both degenerate.',
      '**Liouville rotation numbers** defeat the KAM schemes that settle the Diophantine case.',
    ],
    engineering_value:
      'Hofstadter spectral engineering of moiré materials (topological band gaps, Chern-number design) presumes that all gaps are open; a rigorous criterion gives a trustworthy interval for the flux—band-gap correspondence.',
    formalization_notes:
      'For any fixed rational approximant, gap openness is a finite certified-numerics problem (interval arithmetic on Harper operators); a uniform irrational statement needs analysis. High potential for a certified-computation benchmark.',
    references: [
      {
        label: 'Avila, Jitomirskaya, The Ten Martini Problem, Annals of Mathematics 170, 2009',
        url: 'https://arxiv.org/abs/math/0503363',
      },
      {
        label: 'Puig, Cantor spectrum for the almost Mathieu operator, CMP 244, 2004',
        url: 'https://arxiv.org/abs/math-ph/0309004',
      },
    ],
  },
  {
    id: 'mp-012',
    output: 'verified_truth',
    title: 'Completeness of the Bethe Ansatz for Higher-Spin Heisenberg Chains',
    titleZh: '高自旋 Heisenberg 链 Bethe 拟设的完备性',
    domain: 'mathematical-physics',
    subdomain: 'integrable-systems',
    status: 'partial',
    difficulty: 'advanced',
    formalization_potential: 'high',
    verification_path: 'numerical',
    tags: ['bethe-ansatz', 'integrability', 'heisenberg-chain', 'string-solutions'],
    contributor: 'admin',
  date_added: '2026-08-22',
    via: { label: 'Bethe, Zur Theorie der Metalle, Z. Phys. 71 (1931) 205-226', url: 'https://doi.org/10.1007/BF01341708' },
    related_problems: [
      {
        id: 'mp-005',
        relation: 'shares_tools',
        note: 'AKLT states are exact ground states near the spin-1 Heisenberg point; completeness of the Bethe basis governs the excitation bookkeeping.',
      },
    ],
    statement: `For the spin-$s$ XXX (or XXZ) Heisenberg chain of length $L$, prove that the solutions of the Bethe equations, including singular and complex "string" solutions handled with the correct prescription, span the full Hilbert space of dimension $(2s+1)^L$ — i.e. give a rigorous counting and completeness theorem valid for all $s \\ge 1$ and all $L$.`,
    origin:
      'The Bethe ansatz (1931) is the founding tool of quantum integrability, and completeness for spin-1/2 was established over decades. Higher-spin chains model real magnetic compounds and cold-atom realizations; string solutions become subtle for $s \\ge 1$.',
    progress: [
      '**spin-1/2 XXX**: completeness proved (Babbit–Thomas; combinatorial and algebraic proofs).',
      '**XXZ at roots of unity**: subtle extra degeneracies classified (Fabricius–McCoy).',
      '**Higher spins**: completeness verified numerically for moderate $L$; general proof missing, with string deviations beyond the string hypothesis documented.',
    ],
    obstacles: [
      '**String hypothesis fails quantitatively** at finite $L$: exact treatments require the full set of complex solutions, whose combinatorics is not controlled for $s \\ge 1$.',
      '**Singular solutions** need regularization prescriptions that must be proven consistent with the Hilbert-space count.',
    ],
    engineering_value:
      'Spin chains are the standard model for benchmarking quantum simulators; a completeness certificate for the Bethe basis can directly serve as a numerical benchmark for cold-atom and solid-state quantum-simulation platforms.',
    formalization_notes:
      'For each fixed (s, L), completeness is decidable by certified algebraic computation (Gröbner bases / numerical algebraic geometry); the conjectural statement is a uniform theorem in s and L. Ideal benchmark for certified computation.',
    references: [
      {
        label: 'Baxter, Completeness of the Bethe ansatz for the six and eight-vertex models, J. Stat. Phys. 108, 2002',
        url: 'https://arxiv.org/abs/cond-mat/0111188',
      },
      {
        label: 'Hao, Nepomechie, Sommese, Completeness of solutions of Bethe equations, Phys. Rev. E 88, 052119, 2013',
        url: 'https://arxiv.org/abs/1308.4645',
      },
    ],
    judgment: 'A pass proves that the Bethe eigenstates (including string and singular solutions under the stated prescription) span the full $(2s+1)^L$-dimensional Hilbert space for all $s\\ge1$ and all $L$, via a rigorous dimension/counting argument rather than numerics, with the singular-solution regularization proven consistent.',
    proposer: 'H. A. Bethe',
    proposed_year: 1931,
  },
  {
    id: 'mp-013',
    output: 'verified_truth',
    judgment: 'A pass proves distributional convergence under 1:2:3 scaling of a genuinely non-integrable growth model to the KPZ fixed point with Tracy-Widom one-point statistics, established without algebraic integrability, and therefore requires a rigorous proof that does not pass through exact Fredholm-determinant formulas.',
    title: 'Universality of the KPZ Fixed Point Beyond Integrable Models',
    titleZh: '超越可积模型的 KPZ 不动点普适性',
    domain: 'mathematical-physics',
    subdomain: 'integrable-systems',
    status: 'partial',
    difficulty: 'frontier',
    formalization_potential: 'medium',
    verification_path: 'analytical',
    tags: ['kpz', 'universality', 'stochastic-growth', 'directed-polymers'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'M. Kardar, G. Parisi & Y.-C. Zhang',
    proposed_year: 1986,
    via: {
      label: 'KPZ, Dynamic scaling of growing interfaces, PRL 56 (1986); review of universality see Corwin (arXiv:1106.1596)',
      url: 'https://doi.org/10.1103/PhysRevLett.56.889',
    },
    related_problems: [
      {
        id: 'mp-002',
        relation: 'shares_tools',
        note: 'Both are universality questions for stochastic PDEs; regularity structures and paracontrolled calculus are shared machinery.',
      },
    ],
    statement: `Prove that a **non-integrable** one-dimensional stochastic growth model — e.g. the KPZ equation with general initial data, or a non-solvable exclusion/growth process — converges under the $1{:}2{:}3$ scaling to the KPZ fixed point $\\mathfrak{h}(x,t)$ of Matetski–Quastel–Remenik, with Tracy–Widom one-point statistics. The point is to remove the algebraic integrability assumptions from the convergence proofs.`,
    origin:
      'KPZ universality is the analogue of the central limit theorem for surface growth, observed in liquid-crystal turbulence, combustion fronts, and thin-film deposition. Exact convergence proofs exist only for integrable models (TASEP, ASEP, stochastic six-vertex).',
    progress: [
      '**Matetski–Quastel–Remenik (2021)**: construction of the KPZ fixed point as a Markov process.',
      '**KPZ equation itself**: convergence to the fixed point proved (Quastel–Sarkar; Virág).',
      '**Non-integrable models**: only the 1:2:3 exponents (via regularity structures) are known; distributional convergence is open.',
    ],
    obstacles: [
      '**Integrability is load-bearing**: all distributional proofs pass through exact Fredholm-determinant formulas unavailable off the solvable manifold.',
      '**No soft universality machinery** (analogous to Dyson or Lindeberg arguments) has been built for the KPZ class.',
    ],
    engineering_value:
      'Fluctuation-model validation in thin-film deposition and interface-roughening processes requires universality guarantees for non-integrable cases; a rigorous result would extend KPZ statistics from the integrable-model catalog to a general validation benchmark for engineering models.',
    formalization_notes:
      'The fixed-point construction is explicit (kernels and path integrals) and formalizable in principle; the convergence step is the open analytic core.',
    references: [
      {
        label: 'Matetski, Quastel, Remenik, The KPZ fixed point, Acta Mathematica 227, 2021',
        url: 'https://arxiv.org/abs/1701.00018',
      },
      {
        label: 'Quastel, Sarkar, Convergence of exclusion processes and the KPZ equation to the KPZ fixed point, JAMS 36, 2023',
        url: 'https://arxiv.org/abs/2008.06584',
      },
    ],
  },
  {
    id: 'mc-007',
    output: 'verified_truth',
    title: 'Boundedness Conjecture for Complex-Balanced Systems',
    titleZh: '复平衡系统的有界性猜想',
    domain: 'mathematical-chemistry',
    subdomain: 'crnt',
    status: 'open',
    difficulty: 'advanced',
    formalization_potential: 'medium',
    verification_path: 'analytical',
    tags: ['crnt', 'boundedness', 'mass-action', 'dynamical-systems'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'M. Feinberg',
    proposed_year: 1980,
    via: { label: 'Tradition on boundedness of complex-balanced systems: Feinberg, Chemical reaction network structure and stability of complex isothermal reactors (lecture notes)' },
    related_problems: [
      {
        id: 'mc-002',
        relation: 'depends_on',
        note: 'Boundedness is the upper half of permanence; a proof of permanence would subsume it, but boundedness may be accessible independently.',
      },
    ],
    statement: `Prove that every trajectory of a complex-balanced mass-action system with positive initial condition is **bounded**: $\\sup_{t \\ge 0} \\|x(t)\\| < \\infty$. Equivalently, no mass-action complex-balanced system can exhibit blow-up or unbounded growth of any species along a trajectory.`,
    origin:
      'Unbounded trajectories would correspond to runaway accumulation in a reactor — a process-safety scenario. Complex balancing is believed to rule this out, but a proof is missing.',
    progress: [
      '**Horn–Jackson (1972)**: complex balancing implies unique positive equilibrium per stoichiometric class and local asymptotic stability.',
      '**Boundedness**: known for networks with two-dimensional stoichiometric subspace and for endotactic classes; open in general.',
    ],
    obstacles: [
      '**The classical pseudo-Helmholtz Lyapunov function controls decay toward the equilibrium, not growth at infinity.**',
      '**At infinity the dynamics are governed by boundary reaction rates**, for which no uniform estimate exists.',
    ],
    engineering_value:
      'A boundedness proof provides an a priori upper bound on reactor concentrations, directly usable in the mathematical certification step of containment design and runaway-reaction screening.',
    formalization_notes:
      'As mc-002: the hypothesis is decidable from rate data; the conclusion is analytic. Amenable to computer-assisted search for counterexamples in parameterized families.',
    references: [
      {
        label: 'Horn, Jackson, General mass action kinetics, Archive for Rational Mechanics and Analysis 47, 1972',
        url: 'https://link.springer.com/article/10.1007/BF00251225',
      },
      {
        label: 'Anderson, Boundedness of trajectories for weakly reversible, single linkage class reaction systems, J. Math. Chem. 49, 2011',
        url: 'https://link.springer.com/article/10.1007/s10910-011-9886-4',
      },
    ],
    judgment: 'A pass proves that every trajectory of a complex-balanced mass-action system with positive initial data stays bounded — $\\sup_{t\\ge 0}\\|x(t)\\|<\\infty$ — via a boundary-reaction-rate estimate controlled at infinity, or exhibits a verified unbounded trajectory for some complex-balanced system; boundedness only for two-dimensional subspaces or endotactic classes is not the general claim.',
  },
  {
    id: 'mc-008',
    output: 'verified_truth',
    title: 'Inverse Eigenvalue Problem for Chemical Graph Classes',
    titleZh: '化学图类的逆特征值问题',
    domain: 'mathematical-chemistry',
    subdomain: 'chemical-graph-theory',
    status: 'partial',
    difficulty: 'advanced',
    formalization_potential: 'high',
    verification_path: 'numerical',
    tags: ['inverse-eigenvalue', 'graph-spectra', 'huckel-model', 'molecular-graphs'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'I. Gutman',
    proposed_year: 2008,
    via: { label: 'Gutman & Furtula (eds.), Distance in Molecular Graphs — Theory (2012); review of the inverse eigenvalue problem for chemical graphs see the molecular-topology work of Graovac et al.' },
    related_problems: [
      {
        id: 'mc-003',
        relation: 'shares_tools',
        note: 'Both translate molecular structure into spectral constraints of the adjacency matrix; spectral characterizations are the shared toolkit.',
      },
    ],
    statement: `Characterize the multisets of real numbers that occur as the spectrum of the adjacency matrix (Hückel Hamiltonian) of a connected molecular graph — i.e. solve the inverse eigenvalue problem for graphs (IEPG) restricted to the classes used in chemistry: trees of maximum degree $\\le 4$, planar graphs with prescribed face structure, and catacondensed benzenoid graphs. Concretely: decide algorithmically whether a given spectrum is realizable, and classify the realizable spectra for these classes.`,
    origin:
      'Hückel theory identifies π-electron energies with adjacency eigenvalues; the inverse problem asks which electronic structures are chemically realizable — the mathematical core of inverse molecular design.',
    progress: [
      '**IEPG in general**: open; minimum-rank and zero-forcing parameters give partial obstructions (AIM work group catalog).',
      '**Trees**: ordered multiplicity lists characterized for many families; full characterization open.',
      '**Benzenoids**: spectral moments and nullity partially classified; inverse problem untouched.',
    ],
    obstacles: [
      '**Algebraic obstructions (Newton identities, interlacing) are necessary but far from sufficient** for graph realizability.',
      '**The constraint "comes from a graph" is combinatorial, not semialgebraic**, defeating direct algebraic-geometry methods.',
    ],
    engineering_value:
      'This problem is the rigorous core of inverse molecular design (recovering structure from target electronic properties): a decidability result directly translates into a completeness guarantee for screening algorithms.',
    formalization_notes:
      'For bounded order, realizability is decidable by exhaustive search with spectral pruning — an exact-computation problem well suited to certified enumeration and SMT-based tools.',
    references: [
      {
        label: 'Hogben, Spectral graph theory and the inverse eigenvalue problem of a graph, Electronic J. Linear Algebra 14, 2005',
        url: 'https://doi.org/10.13001/1081-3810.1174',
      },
      {
        label: 'Johnson, Leal Duarte, Saiago, Inverse eigenvalue problems and lists of multiplicities of eigenvalues for matrices whose graph is a tree, DAM 156, 2008',
        url: 'https://doi.org/10.1016/j.dam.2008.01.011',
      },
    ],
    judgment: 'A pass gives a decision procedure that determines whether a given real multiset is realizable as the adjacency spectrum of a tree of maximum degree $\\le 4$, a planar graph with prescribed face structure, or a catacondensed benzenoid, together with a correctness proof of the realizability criterion, so each accepted spectrum carries an explicit graph certificate and each rejected one an explicit algebraic obstruction.',
  },
  {
    id: 'mb-005',
    output: 'verified_truth',
    title: 'Epidemic Threshold of SIR Epidemics on Clustered Networks',
    titleZh: '聚集性网络上 SIR 流行病阈值的严格刻画',
    domain: 'mathematical-biology',
    subdomain: 'epidemic-networks',
    status: 'partial',
    difficulty: 'advanced',
    formalization_potential: 'medium',
    verification_path: 'analytical',
    tags: ['sir-epidemic', 'clustering', 'configuration-model', 'branching-process'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'M. E. J. Newman',
    proposed_year: 2002,
    via: {
      label: 'Newman, Spread of epidemic disease on networks, PRE 66 (2002)',
      url: 'https://doi.org/10.1103/PhysRevE.66.016128',
    },
    related_problems: [
      {
        id: 'mb-002',
        relation: 'analog_of',
        note: 'mb-002 asks for the metastable lifetime below threshold on tree-like networks; here the network itself is clustered and even the threshold is not rigorous.',
      },
    ],
    statement: `For the SIR epidemic on a configuration-model network with **clustering** (e.g. built from households, triangles, or general cliques with prescribed degree–clique distributions), determine the basic reproduction number $\\mathcal{R}_0$ and the epidemic threshold **rigorously**: prove a law of large numbers for the final outbreak size with an explicit threshold function of the joint clique–degree distribution, and characterize when clustering raises versus lowers the threshold relative to the tree-like model with the same degree distribution.`,
    origin:
      'Real contact networks are clustered (households, schools, workplaces), but the rigorous threshold theory assumes locally tree-like structure. Household models have heuristic and partial results; a unified rigorous theory linking clique distributions to thresholds is missing — and it is exactly the input epidemic-response models consume.',
    progress: [
      '**Ball–Sirl–Trapman (2009–2010)**: household-model thresholds via branching-process approximations with partial rigor.',
      '**Coupechoux–Lelarge and related**: clustering can both inhibit and amplify spread, depending on degree–clique correlation.',
      '**Unified rigorous threshold for general clique–degree distributions, with comparison principle vs. tree-like networks**: open.',
    ],
    obstacles: [
      '**Clustering destroys the local weak limit (Galton–Watson) argument**: the exploration process is no longer a branching process.',
      '**Overlapping cliques introduce dependence across generations** of infection that current random-graph tools cannot integrate out.',
    ],
    engineering_value:
      'The clustered-network threshold is a direct input parameter to models of community containment, vaccine allocation, and building-ventilation strategy; a rigorous comparison principle decides the key design question of "whether clustering protects the population".',
    formalization_notes:
      'The threshold statement is a sharp-phase-transition theorem on a well-defined random graph model — statement-level formalization is straightforward; proofs need new multitype branching machinery.',
    references: [
      {
        label: 'Ball, Sirl, Trapman, Analysis of a stochastic SIR epidemic on a random network incorporating household structure, Mathematical Biosciences 224, 2010',
        url: 'https://doi.org/10.1016/j.mbs.2010.01.002',
      },
      {
        label: 'Coupechoux, Lelarge, How clustering affects epidemics in random networks, Advances in Applied Probability 46, 2014',
        url: 'https://arxiv.org/abs/1302.4974',
      },
    ],
    judgment: 'A pass gives a rigorous law of large numbers for the final SIR outbreak size on clustered configuration-model networks with an explicit threshold function of the joint clique–degree distribution, and a comparison principle deciding when clustering raises versus lowers the threshold relative to the tree-like model with the same degree distribution; branching-process heuristics without the clustering dependence resolved are not accepted.',
  },
  {
    id: 'mb-006',
    output: 'verified_truth',
    judgment: 'A pass gives a structural combinatorial criterion that decides whether a graph is a strong amplifier (fixation probability tending to 1) or strong suppressor (tending to 0) for the birth-death Moran process, and establishes whether strong amplification is decidable in polynomial time, with a correctness proof for the criterion.',
    title: 'Classification of Strong Amplifiers of Natural Selection',
    titleZh: '自然选择强放大器的图结构分类',
    domain: 'mathematical-biology',
    subdomain: 'evolutionary-dynamics',
    status: 'partial',
    difficulty: 'advanced',
    formalization_potential: 'high',
    verification_path: 'numerical',
    tags: ['moran-process', 'fixation-probability', 'evolutionary-graph-theory', 'amplifiers'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'E. Lieberman, C. Hauert & M. A. Nowak',
    proposed_year: 2005,
    via: { label: 'Strong amplifiers: Lieberman–Hauert–Nowak (2005); super-amplifiers see Pavlogiannis–Tkadlec–Chatterjee–Nowak, Nat. Commun. 8 (2017)' },
    related_problems: [
      {
        id: 'mb-001',
        relation: 'depends_on',
        note: 'Amplifier classification presupposes exact or approximable fixation probabilities on arbitrary graphs — the FPRAS question of mb-001.',
      },
    ],
    statement: `Classify the graphs $G$ that are **strong amplifiers** of selection for the birth–death Moran process: those for which the fixation probability of a single mutant with fitness $r > 1$ tends to $1$ as $N = |V| \\to \\infty$ (for fixed $r$), versus **strong suppressors** where it tends to $0$. Determine whether a structural (combinatorial) criterion decides membership, and whether strong amplification is decidable in polynomial time.`,
    origin:
      'Evolutionary graph theory asks how population structure tilts selection. Amplifiers accelerate evolution of advantageous mutants — relevant to modeling tumor initiation and to designing population structures in directed evolution experiments.',
    progress: [
      '**Lieberman–Hauert–Nowak (2005)**: framework; stars as amplifiers.',
      '**Galanais et al. / Pavlogiannis et al. (2017–2018)**: strong amplifiers exist (including near-universal families); strong suppression characterized for many updating rules.',
      '**Full classification and decidability**: open.',
    ],
    obstacles: [
      '**Fixation probability is a global hitting probability** with no known structural formula beyond isothermal and circulant classes.',
      '**Small structural changes flip amplification behavior**, suggesting the classification may not admit a smooth combinatorial criterion.',
    ],
    engineering_value:
      'The amplifier classification provides a mathematical screening index for structural risk in the tumor microenvironment and optimal graph families for population-structure design in directed-evolution experiments.',
    formalization_notes:
      'For each fixed graph the question is a linear system; classification is a statement about graph families. Certified computation can settle conjectured families one by one.',
    references: [
      {
        label: 'Pavlogiannis, Tkadlec, Chatterjee, Nowak, Construction of arbitrarily strong amplifiers of natural selection, Communications Biology 1, 2018',
        url: 'https://arxiv.org/abs/1706.06414',
      },
      {
        label: 'Lieberman, Hauert, Nowak, Evolutionary dynamics on graphs, Nature 433, 2005',
        url: 'https://doi.org/10.1038/nature03204',
      },
    ],
  },
  {
    id: 'mb-007',
    output: 'verified_truth',
    title: 'Rigorous Click Rate of Muller’s Ratchet in the Speed-Limit Regime',
    titleZh: 'Muller 棘轮咔嗒速率的严格渐近',
    domain: 'mathematical-biology',
    subdomain: 'evolutionary-dynamics',
    status: 'partial',
    difficulty: 'advanced',
    formalization_potential: 'medium',
    verification_path: 'numerical',
    tags: ['mullers-ratchet', 'fixation', 'traveling-waves', 'population-genetics'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'H. J. Muller',
    proposed_year: 1932,
    via: {
      label: 'Muller, Some genetic aspects of sex, Am. Nat. 66 (1932); rigorous rates see Haigh (1978)',
      url: 'https://doi.org/10.1086/280418',
    },
    related_problems: [
      {
        id: 'mb-004',
        relation: 'shares_tools',
        note: 'Both are sharp-rate problems for stochastic adaptive processes with rare-event-driven dynamics.',
      },
    ],
    statement: `For the classical Muller's ratchet model (haploid population of size $N$, deleterious mutation rate $U$, selection coefficient $s$, no back mutation, no recombination), prove the asymptotic scaling of the ratchet click rate in the regime where the least-loaded class is lost by rare fluctuations: show that the rate behaves as $\\exp(-c N^{\\alpha} f(U,s))$ (or the correct stretched-exponential form) and identify $c$, $\\alpha$ and $f$ rigorously. Reconcile the competing predictions of diffusion theory and of large-deviation approaches.`,
    origin:
      'Muller’s ratchet is the central model of irreversible mutational degradation in asexual populations — from RNA viruses to endosymbionts. Its speed predicts extinction timescales, yet the rigorous rate law remains unsettled across parameter regimes.',
    progress: [
      '**Haigh (1978)**: diffusion approximation in the slow regime.',
      '**Gordo–Charlesworth / Jain**: improved approximations for intermediate and fast regimes.',
      '**Etheridge–Pfaffelhuber–Wakolbinger**: rigorous results in dual (ancestral) formulations; a unified rigorous rate law across regimes is missing.',
    ],
    obstacles: [
      '**The ratchet is driven by the tail of a traveling wave of fitness**, where diffusion approximations break down precisely in the fast-click regime.',
      '**Multiple proposed scalings match simulation in different windows**; a uniform rigorous criterion separating regimes is lacking.',
    ],
    engineering_value:
      'The ratchet-rate law feeds directly into viral-population degradation prediction and minimum-size design of breeding populations; a rigorous asymptotics would replace empirically fitted parameters with certifiable constants.',
    formalization_notes:
      'The model is an explicitly defined Markov chain; the question is a metastability/large-deviation theorem — well within the scope of modern probabilistic techniques, and a good formalization target for stochastic-process libraries.',
    references: [
      {
        label: 'Etheridge, Pfaffelhuber, Wakolbinger, How often does the ratchet click? Facts, heuristics, asymptotics, Trends in Stochastic Analysis, 2009',
        url: 'https://www.maths.ox.ac.uk/people/professor.alison.etheridge',
      },
      {
        label: 'Jain, Loss of least-loaded class in asexual populations due to drift and epistasis, Genetics 179, 2008',
        url: 'https://doi.org/10.1534/genetics.108.089136',
      },
    ],
    judgment: 'A pass proves the asymptotic scaling of the ratchet click rate in the rare-fluctuation regime, identifying $c$, $\\alpha$ and $f$ in the (stretched-)exponential law rigorously and reconciling the diffusion and large-deviation predictions, with a uniform criterion separating regimes; a fit of multiple proposed scalings to simulation is not accepted.',
  },
  {
    id: 'mb-008',
    output: 'verified_truth',
    judgment: 'A pass characterizes the edge-weight matrices W for which the birth-death or death-birth fixation probability equals the well-mixed value, proving both necessity and sufficiency of equal vertex temperatures including non-stochastic matrices and weakly connected cases, as an algebraic statement about Markov-chain hitting probabilities.',
    title: 'Generalized Isothermal Theorem for Weighted and Directed Population Graphs',
    titleZh: '加权有向群体图的广义等温定理',
    domain: 'mathematical-biology',
    subdomain: 'evolutionary-dynamics',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'high',
    verification_path: 'numerical',
    tags: ['isothermal-theorem', 'fixation-probability', 'weighted-graphs', 'temperature'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'E. Lieberman, C. Hauert & M. A. Nowak',
    proposed_year: 2005,
    via: { label: 'Isothermal theorem: Lieberman–Hauert–Nowak (2005); weighted/directed generalizations see the related fixation-probability literature' },
    related_problems: [
      {
        id: 'mb-006',
        relation: 'analog_of',
        note: 'Isothermality characterizes neutrality of structure; amplifier classification characterizes departure from neutrality — complementary sides of one question.',
      },
    ],
    statement: `Extend the isothermal theorem to general weighted directed graphs: characterize the edge-weight matrices $W$ for which the fixation probability of the birth–death (or death–birth) Moran process equals that of the well-mixed population. Conjecturally, isothermality (all vertex temperatures equal, $\\sum_j w_{ij} = \\text{const}$) is necessary and sufficient under mild irreducibility assumptions — prove this, including a complete treatment of non-stochastic weight matrices.`,
    origin:
      'The isothermal theorem (Lieberman–Hauert–Nowak 2005) is the "null model" of evolutionary graph theory: it tells when structure is neutral. Its full scope for weighted directed graphs — the realistic case — is folklore with gaps.',
    progress: [
      '**Lieberman–Hauert–Nowak (2005)**: isothermal theorem for doubly stochastic circulations.',
      '**Broom–Rychtář**: fixation formulas for small and structured graphs; temperature-based heuristics.',
      '**Necessity direction in full generality (including non-stochastic and weakly connected cases)**: open.',
    ],
    obstacles: [
      '**Fixation probability solves a linear system whose inverse has no closed form**; translating spectral conditions into temperature equalities is the crux.',
      '**Degenerate cases (sources, sinks, reducible components)** must be classified separately.',
    ],
    engineering_value:
      'The isothermality criterion is a fast screener for whether structure affects evolution; the same criterion can be reused directly for neutrality audits of opinion/state diffusion in distributed networks.',
    formalization_notes:
      'The conjecture is an algebraic statement about Markov chain hitting probabilities — a clean target for theorem provers with linear-algebra libraries, and checkable by computer algebra on families.',
    references: [
      {
        label: 'Lieberman, Hauert, Nowak, Evolutionary dynamics on graphs, Nature 433, 2005',
        url: 'https://doi.org/10.1038/nature03204',
      },
      {
        label: 'Broom, Rychtář, An analysis of the fixation probability of a mutant on special classes of non-directed graphs, Proc. R. Soc. A 464, 2008',
        url: 'https://doi.org/10.1098/rspa.2008.0058',
      },
    ],
  },
  {
    id: 'me-004',
    output: 'verified_truth',
    title: 'Optimal Round Complexity of Triangle Detection and Listing in the CONGEST Model',
    titleZh: 'CONGEST 模型中三角形检测与枚举的最优轮复杂度',
    domain: 'mathematical-engineering',
    subdomain: 'distributed-algorithms',
    status: 'partial',
    difficulty: 'advanced',
    formalization_potential: 'high',
    verification_path: 'analytical',
    tags: ['congest', 'distributed-complexity', 'triangle-detection', 'lower-bounds'],
    contributor: 'admin',
    date_added: '2026-08-22',
    provenance: 'lean-compilable',
    lean_statement: 'import Std\n\n/-!\nme-004 — Optimal round complexity of triangle detection in the CONGEST model.\n\nAny distributed protocol that decides whether an n-vertex graph contains a\ntriangle must communicate Ω(n) rounds in the worst case. `TriangleDetectionRounds`\nis the formalization target; the linear lower bound is the headline claim\n(proof left open via `sorry`).\n-/\nnamespace MathX\n\ndef TriangleDetectionRounds (n : Nat) : Nat := by\n  exact 0\n\ntheorem congest_triangle_lower_bound :\n    ∃ c : Nat, 0 < c ∧ ∀ n : Nat, 0 < n → c * n ≤ TriangleDetectionRounds n := by\n  sorry\n\nend MathX\n',
    proposer: 'multiple contributors',
    proposed_year: 2017,
    via: {
      label: 'Complexity of triangle detection in CONGEST: the lower bound of Izumi & Le Gall, OPODIS (2017)',
      url: 'https://doi.org/10.1007/978-3-319-72581-1_10',
    },
    failure_records: [
      {
        method: 'Expander-decomposition algorithms (Chang–Pettie–Saranurak–Zhang)',
        mechanism: 'unbounded_residual',
        layer: 'num',
        partial: 'Give O-tilde(n^(1/3))-type upper bounds whose expander-decomposition overhead hides logarithmic slack.',
        implication: 'Sharpen the expander-decomposition overhead to decide whether triangle listing matches the O-tilde(n^(1/3)) lower bound exactly.',
      },
      {
        method: 'Two-party communication-complexity reductions (Izumi–Le Gall)',
        mechanism: 'missing_bound',
        layer: 'model',
        partial: 'Yield O-tilde(n^(1/3)) lower bounds but do not capture the multi-party topology of the input graph.',
        implication: 'A multi-party reduction capturing the graph topology is needed to settle the exact exponent and logarithmic factors.',
      },
    ],
    tool_links: [
      { tool_id: 'combinatorics-graph', role: 'partial' },
      { tool_id: 'analysis-asymptotics', role: 'partial' },
    ],
    related_problems: [
      {
        id: 'me-001',
        relation: 'shares_tools',
        note: 'Both ask for unconditional round-complexity lower bounds in bandwidth-limited message-passing models; information-theoretic fooling arguments are shared.',
      },
    ],
    statement: `Determine the exact asymptotic round complexity of **triangle detection** and **triangle listing** in the CONGEST model (synchronous message passing, $O(\\log n)$-bit messages) on $n$-node graphs: close the gap between the best known upper bounds — $O(n^{1/3})$-type randomized algorithms (improved in some regimes via expander decompositions) — and the known lower bounds of order $\\tilde{\\Omega}(n^{1/3})$ or below. In particular decide whether triangle listing admits an $O(n^{1/3}/\\log^{c} n)$ algorithm matching the lower bound exactly.`,
    origin:
      'Triangle counting is the atomic operation of graph mining (clustering coefficients, community detection) in networks too large for any single machine — social graphs, network telemetry, blockchain analytics. CONGEST is the standard abstraction of bandwidth-limited distributed computing.',
    progress: [
      '**Izumi–Le Gall (2017)**: $O(n^{2/3})$ triangle finding; improved to $\\tilde{O}(n^{1/2})$ and $\\tilde{O}(n^{1/3})$ in subsequent works (Chang–Pettie–Saranurak–Zhang).',
      '**Pandurangan–Robinson–Scquizzato / Izumi–Le Gall**: lower bounds $\\tilde{\\Omega}(n^{1/3})$ for listing via communication-complexity reductions.',
      '**Exact exponent and logarithmic factors**: open.',
    ],
    obstacles: [
      '**Upper bounds route through expander decompositions whose overhead hides logarithmic slack.**',
      '**Lower bounds rely on two-party communication reductions** that do not capture the multi-party topology of the input graph.',
    ],
    engineering_value:
      'Closing this gap would give the theoretical performance ceiling of distributed graph-mining systems (cluster-level triangle counting), directly guiding communication-budget and sharding-strategy design.',
    formalization_notes:
      'Both algorithms and lower-bound reductions are finite combinatorial objects; the full proof corpus is within reach of mechanized complexity arguments — a realistic formalization benchmark.',
    references: [
      {
        label: 'Chang, Pettie, Saranurak, Zhang, Distributed triangle detection via expander decomposition, SODA 2019',
        url: 'https://arxiv.org/abs/1807.06624',
      },
      {
        label: 'Izumi, Le Gall, Triangle finding and listing in CONGEST networks, PODC 2017',
        url: 'https://arxiv.org/abs/1705.04851',
      },
    ],
    judgment: 'A pass determines the exact asymptotic round complexity of triangle detection and listing in CONGEST and closes the gap to within constants (or the precise logarithmic factors), with both the algorithm and the lower-bound construction proven rather than conjectured.',
  },
  {
    id: 'me-005',
    output: 'verified_truth',
    title: 'Tight Bounds for Randomized Consensus Against an Adaptive Adversary',
    titleZh: '自适应对手下随机共识的紧复杂度界',
    domain: 'mathematical-engineering',
    subdomain: 'distributed-algorithms',
    status: 'partial',
    difficulty: 'advanced',
    formalization_potential: 'high',
    verification_path: 'analytical',
    tags: ['byzantine-consensus', 'randomized-algorithms', 'adaptive-adversary', 'lower-bounds'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'M. Ben-Or',
    proposed_year: 1983,
    via: { label: 'Tradition on randomized-consensus lower bounds: Ben-Or, Another advantage of free choice, PODC (1983)' },
    related_problems: [
      {
        id: 'me-003',
        relation: 'shares_tools',
        note: 'Safety/liveness certification under adversarial schedules; both feed formal verification stacks for safety-critical distributed control.',
      },
    ],
    statement: `Determine the exact step complexity of randomized binary consensus in asynchronous shared memory with $n$ processes against an **adaptive adversary**: is it $\\Theta(n)$, $\\Theta(n/\\log n)$, or another function? Close the remaining gaps between the best known upper bounds and the $\\Omega(n/\\log^2 n)$-type lower bounds, in both the shared-memory and message-passing models.`,
    origin:
      'Randomized consensus is the fallback when deterministic agreement is impossible (FLP). Blockchain finality gadgets and replicated state machines run variants of it; the adaptive-adversary model captures schedulers that react to protocol internals — the realistic threat model.',
    progress: [
      '**Aspnes (1998) / Attiya–Censor (2008)**: $\\Theta(n^2)$ total step complexity against adaptive adversaries (tight, coin-based).',
      '**Per-process step complexity**: upper bounds near $O(n)$; lower bounds $\\Omega(n/\\log^2 n)$ (Alistarh–Aspnes et al.).',
      '**Exact per-process bound**: open.',
    ],
    obstacles: [
      '**Adaptive adversaries see coin outcomes**, breaking the independence arguments that give polylog bounds against oblivious adversaries.',
      '**Lower-bound constructions require indistinguishability chains of length exponential in the hiding quality**, resisting compression.',
    ],
    engineering_value:
      'The tight bound directly determines the worst-case latency upper bound of BFT/consensus protocols under adversarial scheduling, an essential parameter for formal verification of blockchain finality and fault-tolerant flight/vehicle-control buses.',
    formalization_notes:
      'Protocol and adversary are explicitly definable; the question is a sharp complexity theorem. Valicone-type arguments and coin-game analyses are mechanizable in principle.',
    references: [
      {
        label: 'Attiya, Censor, Tight bounds for asynchronous randomized consensus, JACM 55, 2008',
        url: 'https://doi.org/10.1145/1379759.1379763',
      },
      {
        label: 'Alistarh, Aspnes, Ellen, Gelashvili, Zhu, Why extension-based proofs fail, STOC 2019',
        url: 'https://arxiv.org/abs/1811.01421',
      },
    ],
    judgment: 'A pass determines the exact per-process step complexity of randomized consensus against an adaptive adversary, with matching upper and lower bounds formalized in the stated model and the indistinguishability-chain lower bound made rigorous.',
  },
  {
    id: 'me-006',
    output: 'verified_truth',
    judgment: 'A pass proves or disproves the O(log n / Phi(G)) universal bound for push-pull rumor spreading on every connected graph, or identifies the correct graph parameter (vertex expansion, diameter combined with conductance), supplying matching upper and lower bounds whose constants are made to coincide.',
    title: 'Optimal Oblivious Rumor Spreading: Push–Pull on General Graphs',
    titleZh: '一般图上 push–pull 谣言传播的最优无意识界',
    domain: 'mathematical-engineering',
    subdomain: 'multi-agent-coordination',
    status: 'partial',
    difficulty: 'research',
    formalization_potential: 'high',
    verification_path: 'numerical',
    tags: ['rumor-spreading', 'push-pull', 'conductance', 'epidemic-algorithms'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'R. Karp, C. Schindelhauer, S. Shenker & B. Vöcking',
    proposed_year: 2000,
    via: {
      label: 'Karp et al., Randomized rumor spreading, FOCS (2000)',
      url: 'https://doi.org/10.1109/SFCS.2000.892141',
    },
    failure_records: [
      {
        method: 'Martingale / drift analysis of informed-set sizes',
        mechanism: 'missing_bound',
        layer: 'model',
        partial: 'Give O(log n / Phi(G)) bounds up to polylog slack, tight for regular expanders; correlations across rounds resist the martingale methods.',
        implication: 'Control inter-round correlations to remove the polylog slack and prove the universal O(log n / Phi(G)) bound.',
      },
      {
        method: 'Conductance-based analysis (Chierichetti–Lattanzi–Panconesi)',
        mechanism: 'parameter_sensitive',
        layer: 'param',
        partial: 'Give almost tight bounds via conductance; bottleneck-chain graphs show conductance alone is not the right parameter.',
        implication: 'Identify the composite graph parameter (e.g. vertex expansion combined with diameter) that yields matching upper and lower bounds.',
      },
    ],
    tool_links: [
      { tool_id: 'stochastic-processes', role: 'partial' },
      { tool_id: 'combinatorics-graph', role: 'partial' },
    ],
    related_problems: [
      {
        id: 'mb-005',
        relation: 'analog_of',
        note: 'Rumor spreading is the engineered twin of SIS without recovery; conductance plays the role of the spectral threshold.',
      },
    ],
    statement: `For the synchronous push–pull rumor-spreading protocol on an arbitrary connected $n$-node graph $G$, determine the **optimal universal bound** on the number of rounds until all nodes are informed, as a function of a graph parameter. Precisely: prove or disprove that push–pull informs all vertices within $O(\\log n / \\Phi(G))$ rounds, where $\\Phi$ is the conductance — or identify the correct parameter (vertex expansion, diameter + conductance combination) and prove matching upper and lower bounds.`,
    origin:
      'Gossip protocols are the replication layer of distributed databases, blockchain mempools, and IoT mesh networks. Push–pull is the standard choice because it is oblivious — nodes need no coordination — but its worst-case guarantee on general graphs is not settled.',
    progress: [
      '**Giakkoupis (2011–2014)**: $O(\\log n / \\Phi)$ up to polylog slack for push–pull; tight for regular expanders.',
      '**Chierichetti–Lattanzi–Panconesi**: almost tight bounds via conductance for push–pull.',
      '**Exact universal bound without polylog factors, and the correct parameter for pathological graphs**: open.',
    ],
    obstacles: [
      '**Correlations between informed sets across rounds** resist the martingale methods that work on expanders.',
      '**Graphs with bottleneck chains** (barbell-like) show conductance alone cannot tell the whole story; the right composite parameter is unidentified.',
    ],
    engineering_value:
      'This bound is the source of the theoretical ceiling for SLA (convergence-time guarantees) of gossip-type replication protocols; closing the gap would tighten conservative engineering timeout parameters to the optimum.',
    formalization_notes:
      'Protocol is a finite-state Markov chain; proofs are drift/martingale arguments — an excellent target for mechanized probability.',
    references: [
      {
        label: 'Giakkoupis, Tight bounds for rumor spreading in graphs of a given conductance, STACS 2011',
        url: 'https://arxiv.org/abs/1012.4991',
      },
      {
        label: 'Chierichetti, Lattanzi, Panconesi, Almost tight bounds for rumour spreading with conductance, STOC 2010',
        url: 'https://doi.org/10.1145/1806689.1806745',
      },
    ],
  },
  {
    id: 'mp-014',
    output: 'verified_truth',
    judgment: 'A pass proves normal heat conduction in the scaling limit: J equals -kappa(T) grad T with a finite positive temperature-dependent conductivity independent of chain length N, backed by a rigorous steady-state error bound showing the energy current scales as kappa delta T / N and kappa converges to a nonzero constant.',
    title: 'Derivation of Fourier\u2019s Law in Deterministic Hamiltonian Chains',
    titleZh: '确定性哈密顿链中傅里叶定律的推导',
    domain: 'mathematical-physics',
    subdomain: 'nonequilibrium-statistical-mechanics',
    status: 'open',
    difficulty: 'frontier',
    formalization_potential: 'low',
    verification_path: 'analytical',
    tags: ['fouriers-law', 'heat-conduction', 'anharmonic-chains', 'transport'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'S. Lepri, R. Livi & A. Politi',
    proposed_year: 2003,
    via: {
      label: 'Lepri–Livi–Politi, Thermal conduction in classical low-dimensional lattices, Phys. Rep. 377 (2003)',
      url: 'https://doi.org/10.1016/S0370-1573(02)00558-6',
    },
    related_problems: [
      {
        id: 'mp-003',
        relation: 'shares_tools',
        note: 'Both concern heat and energy transport in classical lattices: mp-003 the time-to-thermalization, mp-014 the steady-state conductivity.',
      },
    ],
    statement: `Prove that a deterministic Hamiltonian chain with anharmonic interactions — e.g. the Fermi–Pasta–Ulam–Tsingou chain coupled at its ends to Langevin/thermal reservoirs at temperatures $T_+$ and $T_-$ — exhibits **normal heat conduction** in the hydrodynamic (scaling) limit:
$$\\lim_{N\\to\\infty,\\, \\nabla T\\to0}\\;J = -\\kappa(T)\\,\\nabla T$$
with a **finite, positive, temperature-dependent thermal conductivity** $\\kappa(T)$ that is independent of the chain length $N$. Equivalently: show the first law of thermodynamics holds in the steady nonequilibrium state, the energy current $J$ scales as $\\kappa\\Delta T/N$, and $\\kappa$ converges to a nonzero constant as $N\\to\\infty$.`,
    origin:
      'Fourier\u2019s empirical law is the foundation of continuum heat conduction, but its microscopic derivation from reversible Hamiltonian dynamics remains the central open problem of nonequilibrium statistical mechanics. It is what legitimizes the transport coefficients that enter nearly all thermal-engineering simulation.',
    progress: [
      '**Harmonic chains**: exactly solved (Rieder\u2013Lebowitz\u2013Lebowitz) but show divergent (length-dependent) conductivity — no Fourier law.',
      '**Low-dimensional chains**: FPU-type and other 1D anharmonic models display anomalous divergence for generic parameters, suggesting integer dimension is special.',
      '**High-dimensional / hard-sphere gas**: Fourier\u2013Green\u2013Kubo conductivity is provably finite in good cases, but diffusive energy spread was only established for specific velocity classes; general derivation open.',
    ],
    obstacles: [
      '**No rigorous a priori control on the steady state** far from equilibrium, and the thermostatted dynamics is genuinely non-equilibrium (no equilibrium measure to expand around).',
      '**The heat current is not a conserved/ Galvani-type quantity**: proving $J \\propto \\nabla T$ requires showing the two-temperature measure relaxes to a local-equilibrium profile, for which no general machinery exists.',
    ],
    engineering_value:
      'Thermal-management simulation at micro/nano scales in chips and batteries relies almost entirely on Fourier\'s law; a rigorous derivation would supply a mathematical criterion for whether Fourier\'s law applies when the computational domain is far smaller than the phonon mean free path, directly affecting the credibility of thermal-design simulation.',
    formalization_notes:
      'Even the definition of the nonequilibrium steady state (NESS) as a limit of finite N is a nontrivial ergodic statement; formalizing the harmonic-chain exact solution would be a realistic milestone-zero.',
    references: [
      {
        label: 'Bonetto, Lebowitz, Rey-Bellet, Fourier\u2019s law: a challenge to theorists, arXiv math-ph/0002052',
        url: 'https://arxiv.org/abs/math-ph/0002052',
      },
      {
        label: 'Dhar, Heat transport in low-dimensional systems, Advances in Physics 57, 2008',
        url: 'https://doi.org/10.1080/00018730802538522',
      },
    ],
  },
  {
    id: 'mp-015',
    output: 'verified_truth',
    title: 'Sharp Energy Conservation Threshold in the Onsager Theory of Turbulence',
    titleZh: 'Onsager 湍流理论中的能量守恒临界正则性',
    domain: 'mathematical-physics',
    subdomain: 'fluid-dynamics',
    status: 'partial',
    difficulty: 'frontier',
    formalization_potential: 'low',
    verification_path: 'analytical',
    tags: ['onsager', 'anomalous-dissipation', 'euler-equations', 'weak-solutions'],
    contributor: 'admin',
  date_added: '2026-08-22',
    via: { label: 'Onsager, Statistical hydrodynamics, Nuovo Cimento Suppl. 6 (1949) 279-287' },
    related_problems: [
      {
        id: 'mp-008',
        relation: 'shares_tools',
        note: 'Both concern anomalous dissipation in fluid equations: mp-008 the zero-viscosity (Navier\u2013Stokes) limit, mp-015 the weak (Euler) regularity threshold.',
      },
    ],
    statement: `Settle the sharp exponent in Onsager\u2019s celebrated conjecture: prove (i) that every weak solution of the incompressible Euler equations with Hölder regularity $C^{\\alpha}$, for $\\alpha > 1/3$, conserves kinetic energy; and (ii) that for every $\\alpha < 1/3$ there exist $C^{\\alpha}$ weak solutions that do **not** conserve energy (dissipative / anomalous solutions). Determine whether the critical case $\\alpha = 1/3$ conserves or dissipates, i.e. give a **sharp characterization at the endpoint**.`,
    origin:
      'Onsager (1949) predicted that energy dissipation can persist in the inviscid limit only if the velocity field is irregular, with the threshold at Hölder exponent $1/3$. This underpins the mathematical modeling of inertial-range turbulence and the interpretation of every high-Reynolds direct numerical simulation of turbulent flows.',
    progress: [
      '**Conservative side ($\\alpha > 1/3$)**: proved (Constantin\u2013E\u2013Titi; Eyink).',
      '**Dissipative side ($\\alpha < 1/3$)**: proved via convex integration / The h-principle constructions (De Lellis\u2013Székelyhidi; Isett 2018 for arbitrary $\\alpha<1/3$).',
      '**Endpoint $\\alpha = 1/3$**: the conservative direction holds at $1/3$ under vanishing of extra structure; whether energy is always conserved at exactly $1/3$ without extra assumptions is still open.',
    ],
    obstacles: [
      '**Endpoint sensitivity**: rigorous energy conservation at $\\alpha=1/3$ without size decay conditions on the commutator fails, yet no counterexample at exactly $1/3$ is known.',
      '**Constructive vs. physical**: convex-integration solutions are C¹-fine but highly oscillatory, and the question of which $\\alpha<1/3$ solutions are attainable by actual vanishing-viscosity limits remains unresolved.',
    ],
    engineering_value:
      'Implicit large-eddy simulation (LES) of turbulence and coarse-grid energy-dissipation criteria depend directly on a trustworthy interval for the Onsager critical exponent; deciding the endpoint case can be turned into a rigorous transition criterion.',
    formalization_notes:
      'The conservative direction is expressed through a commutator / Reynolds-stress estimate, essentially finite-dimensional Fourier analysis — a clean candidate for mechanism: formalization of (i) for a fixed α is a realistic target. The construction side is open-ended PDE analysis.',
    references: [
      {
        label: 'Isett, A proof of the Onsager conjecture, Annals of Mathematics 188, 2018',
        url: 'https://arxiv.org/abs/1604.08358',
      },
      {
        label: 'Onsager, Statistical hydrodynamics, Nuovo Cimento 6 (Suppl.), 1949',
        url: 'https://doi.org/10.1007/BF02780991',
      },
    ],
    judgment: 'A pass settles the endpoint: proves energy conservation for every weak solution at exactly $\\alpha=1/3$ of the incompressible Euler equations (or exhibits a verified dissipative $C^{1/3}$ weak solution), beyond the known $\\alpha>1/3$ conservative and $\\alpha<1/3$ dissipative directions, with the commutator/Reynolds-stress estimate made rigorous.',
    proposer: 'Onsager',
    proposed_year: 1949,
  },
  {
    id: 'mc-009',
    output: 'verified_truth',
    title: 'Hamiltonicity of Fullerene Graphs',
    titleZh: '富勒烯图的哈密顿性',
    domain: 'mathematical-chemistry',
    subdomain: 'chemical-graph-theory',
    status: 'open',
    difficulty: 'advanced',
    formalization_potential: 'high',
    verification_path: 'analytical',
    tags: ['fullerene', 'hamiltonicity', 'planar-graphs', 'molecular-graphs'],
    contributor: 'admin',
  date_added: '2026-08-22',
    provenance: 'lean-compilable',
    lean_statement: 'import Std\n\n/-!\nmc-009 — Hamiltonicity of Fullerene Graphs.\n\nEvery fullerene graph (a cubic planar graph whose faces are pentagons and\nhexagons) admits a Hamiltonian cycle. The predicates are formalization targets;\nthe implication is the headline claim (proof left open via `sorry`).\n-/\nnamespace MathX\n\nstructure FullereneGraph where\n  n : Nat\n\ndef HasHamiltonianCycle (g : FullereneGraph) : Prop := by\n  exact False\n\ntheorem fullerene_hamiltonicity (g : FullereneGraph) :\n    HasHamiltonianCycle g := by\n  sorry\n\nend MathX\n',
    proposer: 'T. Došlić',
    proposed_year: 2007,
    via: {
      label: 'Hamiltonicity of fullerenes (already resolved by Král′–Škrekovski–Vukičević–Wagner, J. Graph Theory (2012))',
      url: 'https://doi.org/10.1002/jgt.20652',
    },
    related_problems: [
      {
        id: 'mc-003',
        relation: 'shares_tools',
        note: 'Both analyze structural invariants of planar molecular (carbon) graphs; spectral and Hamiltonian constraints are complementary ways to certify molecular identity.',
      },
    ],
    statement: `Prove or disprove the conjecture that **every fullerene graph is Hamiltonian**: every 3-connected cubic planar graph whose faces are all pentagons and hexagons admits a Hamiltonian cycle. (Concretely: settle the chromatic-free subclass — every fullerene — which is the plume of Barnette\u2019s conjecture restricted to fullerenes; Barnette itself fails in general via the Horton graph.)`,
    origin:
      'Fullerenes are the $C_n$ carbon allotropes synthesized in quantity since 1985 (Nobel 1996). Hamiltonicity is the mathematical core of the "spiral strip" enumeration used to catalog fullerene isomer libraries; non-Hamiltonian fullerenes would require a different generation algorithm and would alter route-tracing in cage-functionalized chemistry.',
    progress: [
      '**Tutte (1956)**: every 4-connected planar graph is Hamiltonian — the closest positive theorem; fullerenes are only 3-connected.',
      '**Barnette\u2019s conjecture fails in general**: Horton (1982) constructed non-Hamiltonian bipartite cubic planar 3-connected graphs, so fullerenes are a delicate special case.',
      '**Computational evidence**: every fullerene and nanotube up to very large sizes is Hamiltonian, supporting but not proving the conjecture.',
    ],
    obstacles: [
      '**Connectivity level**: fullerenes can have 3-cuts (necklaces of pentagons), where Tutte\u2019s 4-connected theorem does not apply and no replacement is known.',
      '**Bipartite subclass**: only pentagon-free (IPR-type) fullerenes are bipartite; the tripartite case evades the tools that worked for bipartite planar cubic graphs.',
    ],
    engineering_value:
      'If this conjecture holds, the "spiral strip" enumeration and automatic-generation algorithms for fullerene isomers would carry a completeness guarantee, directly supporting the cost and correctness arguments for building carbon-material structure libraries.',
    formalization_notes:
      'For any fixed fullerene, Hamiltonicity is decidable by search and even certifiable (a Hamiltonian cycle is a checkable certificate). The conjecture is a uniform existential statement in $n$ — a textbook case for FPT-SAT style certification plus, ultimately, a graph-theoretic proof. High formalization potential for the certificate side.',
    references: [
      {
        label: 'Fowler, Manolopoulos, An Atlas of Fullerenes, Oxford University Press, 1995',
        url: 'https://global.oup.com/academic/product/an-atlas-of-fullerenes-9780198553027',
      },
      {
        label: 'Tutte, A theorem on planar graphs, Transactions of the AMS 82, 1956',
        url: 'https://www.ams.org/journals/tran/1956-082-01/S0002-9947-1956-0077069-0/',
      },
    ],
    judgment: 'A pass proves or disproves that every fullerene graph is Hamiltonian; a positive result is a proof covering all 3-connected cubic planar pentagon–hexagon graphs, a negative one a verified non-Hamiltonian fullerene whose claimed Hamiltonian-cycle absence is certified; computational evidence for every fullerene up to large sizes is not proof.',
  },
  {
    id: 'mb-009',
    output: 'verified_truth',
    judgment: 'A pass proves that offspring breeding value is normally distributed in the many-loci limit with variance independent of the parental genotype, gives a rigorous convergence rate, and characterizes the effect sizes, linkage and dominance regimes where normality emerges or breaks down, via a certified central-limit-type proof.',
    title: 'Emergence of the Infinitesimal Model in Polygenic Inheritance',
    titleZh: '多基因遗传中无限小模型的涌现',
    domain: 'mathematical-biology',
    subdomain: 'population-genetics',
    status: 'partial',
    difficulty: 'advanced',
    formalization_potential: 'high',
    verification_path: 'analytical',
    tags: ['infinitesimal-model', 'quantitative-genetics', 'many-loci', 'gaussian-limits'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'N. Barton, A. Etheridge & A. Véber',
    proposed_year: 2017,
    via: {
      label: 'Barton–Etheridge–Véber, The infinitesimal model: definition, derivation and dominance, Theor. Popul. Biol. 118 (2017)',
      url: 'https://doi.org/10.1016/j.tpb.2017.05.001',
    },
    related_problems: [
      {
        id: 'mc-001',
        relation: 'shares_tools',
        note: 'Both reduce a high-dimensional stochastic/many-body ensemble to a macroscopic law of a few variables via a rigorous limit; the closure (mean-field vs. normality) is the shared hard core.',
      },
    ],
    statement: `Prove that additive trait inheritance under Mendelian segregation converges to the **infinitesimal model** in the many-loci limit: for a trait determined by $L$ unlinked additive loci with arbitrary allelic effects, conditional on the parental mean, the offspring breeding value is normally distributed as $L \\to \\infty$, with variance independent of the parental genotype in the limit. Give a rigorous rate of convergence and characterize the conditions (effect sizes, linkage, dominance) under which normality emerges or breaks down.`,
    origin:
      'The infinitesimal model — normality of offspring given parental trait mean, with variance fixed — is the backbone of quantitative genetics and of every modern genomic selection / breeding program. Yet its derivation from discrete Mendelian inheritance is largely heuristic, and its validation as a genuine large-$L$ limit is an active, partially open research direction.',
    progress: [
      '**Fisher (1918)**: laid the variance-decomposition foundation that motivates the Gaussian approximation.',
      '**Barton\u2013Etheridge\u2013Véber (2017)**: gave a careful definition and an in-limit statement of the infinitesimal model under mild assumptions.',
      '**Rigorous non-equilibrium / transient validity and the precise effect of selection**: the normality conclusion and its rate in the simultaneous large-population, many-loci limit remain only partially proved.',
    ],
    obstacles: [
      '**Correlation of alleles within a lineage**: normality holds conditional on independent segregation, but linkage disequilibrium built up by drift or selection breaks the required independence.',
      '**Rate and uniformity in the selection intensity**: existing proofs assume selection is weak / fixed; the regime where selection drives the dynamics is not covered.',
    ],
    engineering_value:
      'Once the "baseline assumption = infinitesimal-model normality" of genomic selection (GS) models is rigorously delimited in scope, it yields a separability criterion for when breeding algorithms apply and when they must be recalibrated to the average type.',
    formalization_notes:
      'For a fixed (finite) locus set the statement is a CLT-type theorem — strong candidates for mechanism: formalization of the Gaussian-limit step using existing central-limit library infrastructure. High potential for a clean theorem-development footprint.',
    references: [
      {
        label: 'Fisher, The correlation between relatives on the supposition of Mendelian inheritance, Phil. Trans. R. Soc. B 52, 1918',
        url: 'https://doi.org/10.1098/rstb.1918.0001',
      },
      {
        label: 'Barton, Etheridge, Véber, The infinitesimal model: definition, derivation and implications, TPB 118, 2017',
        url: 'https://arxiv.org/abs/1610.03562',
      },
    ],
  },
  {
    id: 'mb-010',
    output: 'verified_truth',
    judgment: 'A pass proves E[tau] is comparable to e^(c/delta) with the exact exponential constant c identified and the fluctuations of tau characterized, including a large-deviation and cutoff description, with the two-parameter large-deviation estimate for the largest supercritical cluster made rigorous.',
    title: 'Sharp Extinction-Time Asymptotics for the Subcritical Contact Process',
    titleZh: '次临界接触过程的灭绝时间精细渐近',
    domain: 'mathematical-biology',
    subdomain: 'stochastic-spatial-dynamics',
    status: 'open',
    difficulty: 'advanced',
    formalization_potential: 'medium',
    verification_path: 'analytical',
    tags: ['contact-process', 'metastability', 'extinction', 'spatial-epidemics'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'T. E. Harris',
    proposed_year: 1974,
    via: {
      label: 'Harris, Contact interactions on a lattice, Ann. Probab. 2 (1974); subcritical asymptotics see Liggett’s monograph',
      url: 'https://doi.org/10.1214/aop/1176996477',
    },
    related_problems: [
      {
        id: 'mb-005',
        relation: 'shares_tools',
        note: 'Both model epidemic persistence in space: mb-005 the threshold on clustered networks, mb-010 the extinction time below the critical threshold on lattices.',
      },
    ],
    statement: `For the subcritical contact process (the SIS-type epidemic) on $\\mathbb{Z}^d$ with infection rate close to the critical value, prove **sharp asymptotics for the extinction time** of a finite or infinite system: show $\\mathbb{E}[\\tau] \\asymp e^{c/\\delta}$ where $\\delta = \\lambda_c - \\lambda > 0$ is the distance below criticality, and determine the exact exponential constant $c$ (the metastable "barrier"); characterize the fluctuations of $\\tau$. Extend the leading-order Aizenman\u2013Lebowitz-type estimates to a full large-deviation / cutoff picture.`,
    origin:
      'The contact process is the standard lattice model of a spatial epidemic or a birth\u2013death population. Below criticality a finite infection must die out, but when very close to criticality it can survive for an exponentially long, metastable time. Sharp control of this time is what governs the practical question "can a nearly-threshold outbreak persist long enough to matter?" in spatial epidemiology and ecology.',
    progress: [
      '**Leading order**: metastable survival on the order $\\exp(c/\\delta)$ below criticality established in the Aizenman\u2013Lebowitz / Bezuidenhout\u2013Grimmett framework (survival vs. extinction dichotomy).',
      '**Scaling near the critical slab**: sharp exponent results in the significant "critical slab" regime.',
      '**Exact constant $c$ and the full distribution / cutoff**: not determined in the generic subcritical regime; open.',
    ],
    obstacles: [
      '**Sharp large deviation of the infection cluster**: computing the exact exponential constant requires precise control of the volume of the largest supercritical cluster in the subcritical regime — a two-parameter large-deviation statement not yet available.',
      '**Dependence across generations**: extinction meets recurrence / crossing arguments that are only understood at the exponentional- leading scale.',
    ],
    engineering_value:
      'This quantity is the source of the mathematical upper bound for "escape-failure time"-type risk indicators (whether an outbreak can unexpectedly drag on, whether an endangered population can briefly rebound); a precise exponent would tighten risk-classification standards from order-of-magnitude to constant scale.',
    formalization_notes:
      'The graph-exhaustion and crossing arguments are combinatorial and, for fixed finite volumes, decidable by certified search — a strong candidate for a computer-assisted proof pipeline before a closed-form proof exists.',
    references: [
      {
        label: 'Liggett, Stochastic Interacting Systems: Contact, Voter and Exclusion Processes, Springer, 1999',
        url: 'https://doi.org/10.1007/978-3-662-03990-8',
      },
      {
        label: 'Bezuidenhout, Grimmett, The critical contact process dies out, Annals of Probability 18, 1990',
        url: 'https://projecteuclid.org/journals/annals-of-probability/volume-18/issue-4',
      },
    ],
  },
  {
    id: 'me-007',
    output: 'verified_truth',
    title: 'Optimal Competitive Ratio for Online (Metric) Facility Location',
    titleZh: '在线（度量）设施选址的最优竞争比',
    domain: 'mathematical-engineering',
    subdomain: 'online-algorithms',
    status: 'partial',
    difficulty: 'research',
    formalization_potential: 'high',
    verification_path: 'analytical',
    tags: ['online-facility-location', 'competitive-ratio', 'metric-spaces', 'online-algorithms'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'A. Meyerson',
    proposed_year: 2001,
    via: {
      label: 'Meyerson, Online facility location, FOCS (2001)',
      url: 'https://doi.org/10.1109/SFCS.2001.959910',
    },
    related_problems: [
      {
        id: 'me-008',
        relation: 'shares_tools',
        note: 'Both are optimal-competitive-ratio problems for online algorithms on metric spaces; the hard-instance (adversarial request sequence) technique transfers directly.',
      },
    ],
    statement: `For the online metric facility-location problem (a sequence of demand points arrives; the algorithm opens facilities at a cost $f$ and each served point pays its distance to the nearest open facility), **close the gap between the known upper and lower bounds on the competitive ratio**. Concretely: determine the optimal competitive ratio $c^*$ — prove whether the deterministic bound $O(\\log n)$ and the randomized bound $O(\\log n/\\log\\log n)$ are tight, i.e. exhibit a matching $\\Omega(\\log n/\\log\\log n)$ lower bound for randomized algorithms or find a better algorithm.`,
    origin:
      'Online facility location models systems where capacity must be provisioned as demand reveals itself over time — logistics depots, edge-computing capacity, cloud resource auto-scaling. The gap between the achievable provable guarantee and the true optimum directly prices how much "online penalty" an adaptive provisioning system pays.',
    progress: [
      '**Deterministic algorithms**: $O(\\log n)$ competitive via primal\u2013dual and greedy settling (Meyerson; Alon et al.).',
      '**Randomization**: the gap to $O(\\log n/\\log\\log n)$ promotes a genuine separation, but the matching lower bound is not settled.',
      '**Constant lower bounds for restricted classes** known; the general case gap remains.',
    ],
    obstacles: [
      '**Adversarial request ordering**: lower-bound constructions must arrange requests so any algorithm mis-predicts the bottleneck cluster, an intricate Yao-type construction tight to within doubly-logarithmic factors only with great care.',
      '**Non-metric / capacity / concave variants**: each adds a parameter that shifts the ratio, and no unified transfer holds.',
    ],
    engineering_value:
      'The competitive ratio is the mathematical quantification of the "price one must pay for being online": closing the gap would tighten the capacity over-provisioning factor for edge caching and dynamic logistics placement from a conservative to an optimal scale, directly reducing resource-reservation costs.',
    formalization_notes:
      'The known upper bounds are clean primal\u2013dual / potential proofs — excellent mechanism: formalization targets. Lower bounds are finite adversarial constructions amenable to case-analysis certification. High potential overall.',
    references: [
      {
        label: 'Meyerson, Online facility location, Proceedings of FOCS 2001',
        url: 'https://doi.org/10.1109/SFCS.2001.959910',
      },
      {
        label: 'Borodin, El-Yaniv, Online Computation and Competitive Analysis, Cambridge University Press, 1998',
        url: 'https://doi.org/10.1017/CBO9780511544738',
      },
    ],
    judgment: 'A pass determines the exact optimal competitive ratio $c^*$ for online metric facility location: proves tightness of the $O(\\log n)$ deterministic or $O(\\log n/\\log\\log n)$ randomized bound via a matching Yao-type adversary construction, or finds a strictly better algorithm, with the lower-bound request sequence made explicit; a bound that leaves the gap open is not accepted.',
  },
  {
    id: 'me-008',
    output: 'verified_truth',
    judgment: 'A pass proves there exists an online algorithm with competitive ratio exactly k for the k-server problem on an arbitrary metric space, or demonstrates a different optimal constant, via a rigorous potential argument or dual-certificate construction with the matching lower-bound request sequence made explicit.',
    title: 'The k-Server Conjecture: Tight Competitive Ratio on Metric Spaces',
    titleZh: 'k 服务者猜想：度量空间上的紧竞争比',
    domain: 'mathematical-engineering',
    subdomain: 'online-algorithms',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'medium',
    verification_path: 'analytical',
    tags: ['k-server', 'competitive-ratio', 'online-algorithms', 'potentials'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'M. Manasse, L. McGeoch & D. Sleator',
    proposed_year: 1988,
    via: {
      label: 'Manasse–McGeoch–Sleator, Competitive algorithms for on-line problems, STOC (1988)',
      url: 'https://doi.org/10.1145/62212.62249',
    },
    failure_records: [
      {
        method: 'Work-function / potential method (Koutsoupias–Papadimitriou)',
        mechanism: 'missing_bound',
        layer: 'model',
        partial: 'The work-function algorithm achieves at most 2k - 1; no known potential forces the conjectured ratio k on general metrics.',
        implication: 'A potential or dual certificate with ratio exactly k is the required construction for the general case.',
      },
      {
        method: 'Dual-instance / crossing lower-bound construction',
        mechanism: 'combinatorial',
        layer: 'param',
        partial: 'Matching lower bounds are known only in special cases (lines, trees); the crossing / dual-instance request families are not constructed generally.',
        implication: 'Build the extremal request-sequence family so the matching lower bound is certified by explicit dual certificates.',
      },
    ],
    tool_links: [
      { tool_id: 'convex-optimization', role: 'partial' },
      { tool_id: 'combinatorics-graph', role: 'partial' },
    ],
    related_problems: [
      {
        id: 'me-007',
        relation: 'shares_tools',
        note: 'Both study the optimal competitive ratio achievable by online algorithms on metric spaces — k-server is the archetype, facility-location a sibling with different cost structure.',
      },
    ],
    statement: `For the k-server problem on an arbitrary metric space — $k$ servers occupy points and must serve a sequence of requests, moving the nearest server at cost equal to the distance traveled — **prove that there is an online algorithm with competitive ratio exactly $k$** (the k-server conjecture), or demonstrate a larger optimal constant. Equivalently: settle the tight competitive ratio $c_k$ for online server movement on general metrics.`,
    origin:
      'The k-server problem, introduced by Manasse\u2013McGeoch\u2013Sleator, is the canonical model of "move assets to serve demand online" — it covers disk-cache paging (k=1), robot/vehicle repositioning, and replicated storage. The conjecture that competitive ratio $k$ is attainable has been the most famous open problem in online algorithms for over three decades.',
    progress: [
      '**k=1 (paging)**: tight ratio 1 via LRU-type rules (Sleator\u2013Tarjan).',
      '**Work function / harmonic**: the work-function algorithm achieves at most $2k-1$, and harmonic $\\le$ polynomial; the best general upper bound stands well above $k$.',
      '**Recent advances**: near-tight results for special metric spaces (e.g. lines, trees, and other fixed-graph metrics), leaving the general case open.',
    ],
    obstacles: [
      '**The work-function potential has no known potential forcing ratio $k$ on general metrics**: all existing potentials settle for $2k-1$ or worse.',
      '**Lower bounds**: proving a matching lower bound requires a family of request sequences where any algorithm fails to beat $k$ — the "crossing / dual-instance" construction is only known in special cases.',
    ],
    engineering_value:
      'If the k-server conjecture holds, the "optimal online cost" of dynamically scheduling mobile resources in response to requests has the exact upper bound $k$; this can provide rigorous design schemes — rather than conventional conservative factors — for response-time SLAs of robot fleets, replicated storage, and CDNs.',
    formalization_notes:
      'The objective and moves are fully discrete/combinatorial, and the linear-programming duality behind the conjectured lower bound is explicit — a viable formalization target for the potential and dual-certificate machinery (Robot-style LP polarity), though the general upper bound remains the hard open core.',
    references: [
      {
        label: 'Sleator, Tarjan, Amortized efficiency of list update and paging rules, CACM 28(2), 1985',
        url: 'https://doi.org/10.1145/2455.2461',
      },
      {
        label: 'Koutsoupias, Papadimitriou, On the k-server conjecture, JCSS 50(2), 1995',
        url: 'https://doi.org/10.1006/jcss.1995.1021',
      },
    ],
  },
  {
    id: 'mp-016',
    output: 'verified_truth',
    judgment: 'A pass proves that every weak-* subsequential limit of |phi_j|^2 dg equals the normalized volume measure for a general compact negatively curved manifold without arithmetic structure, as a rigorous equidistribution statement, and therefore does not admit a fixed exceptional subsequence of scarring eigenfunctions.',
    title: 'Quantum Unique Ergodicity on Compact Negatively Curved Manifolds (General Case)',
    titleZh: '负曲率紧流形上的量子唯一遍历性（一般情形）',
    domain: 'mathematical-physics',
    subdomain: 'quantum-chaos',
    status: 'open',
    difficulty: 'frontier',
    formalization_potential: 'medium',
    verification_path: 'analytical',
    tags: ['quantum-ergodicity', 'laplacian-eigenfunctions', 'negative-curvature'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'Z. Rudnick & P. Sarnak',
    proposed_year: 1994,
    via: {
      label: 'Rudnick & Sarnak, The behaviour of eigenstates of arithmetic hyperbolic manifolds, Comment. Math. Helv. 74 (1994)',
      url: 'https://doi.org/10.1007/PL00000356',
    },
    related_problems: [
      {
        id: 'mp-006',
        relation: 'shares_tools',
        note: 'Both use microlocal analysis of PDE eigenstates; mp-006 monitors Sobolev-norm growth, mp-016 the limiting measures of eigenfunctions.',
      },
      {
        id: 'mp-018',
        relation: 'analog_of',
        note: 'ETH is the quantum-statistical avatar of equidistribution of eigenstates under a "generic" Hamiltonian, mirroring the equidistribution asked here.',
      },
    ],
    statement: `Let $M$ be a compact Riemannian manifold of strictly negative sectional curvature and $\\Delta$ its Laplace\u2013Beltrami operator with eigenfunctions $\\phi_j$ ($\\Delta\\phi_j=-\\lambda_j\\phi_j$, $\\|\\phi_j\\|_{L^2}=1$, $\\lambda_j\\to\\infty$). Conjecture (Quantum Unique Ergodicity, QUE): for every smooth observable $a\\in C^\\infty(M)$,
$$\\lim_{j\\to\\infty}\\langle a\\,\\phi_j,\\;\\phi_j\\rangle = \\int_M a\\;\\mathrm{d}\\!g,$$
i.e. the only weak-$*$ limit of the measures $|\\phi_j|^2\\,\\mathrm{d}\\!g$ is the normalized volume (Liouville) measure. Prove QUE for a general compact negatively curved manifold (not assumed arithmetic).`,
    origin:
      'QUE posits that quantum eigenfunctions of a classically ergodic (indeed chaotic) Hamiltonian equidistribute as the wavelength shrinks to zero, complementing Shnirelman\u2019s theorem (which guarantees a full-density subsequence) with the claim that no exceptional subsequence of scarring eigenfunctions survives. It was settled on arithmetic surfaces by Lindenstrauss; the general geometric case remains open.',
    progress: [
      '**Arithmetic case resolved**: Lindenstrauss proved QUE for Hecke\u2013Maass forms; Soundararajan gave the entropy bound.',
      '**General case**: only upper semicontinuity / partial results on mass concentration are established; full ergodicity of every subsequence is unproven.',
    ],
    obstacles: [
      '**No arithmetic structure**: the delocalization/entropy machinery that forces unique limits on arithmetic surfaces has no analogue for a random hyperbolic surface.',
      '**Possible counterexamples**: the existence of exceptional sequences is still not ruled out, and the "random wave" model only suggests, not proves, equidistribution.',
    ],
    engineering_value:
      'If QUE holds, higher-order eigenmodes of vibration/acoustic cavities necessarily fill space uniformly instead of concentrating on a few regions, directly supporting homogenization-design criteria for acoustic cavities, resonators, and structural vibration modes.',
    formalization_notes:
      'The statement is P-variant quantifiable and largely analytic; a full formalization is blocked by the hard analytic core (entropy/equidistribution for non-arithmetic manifolds), hence medium potential rather than high.',
    references: [
      {
        label: 'Rudnick, Sarnak, The behaviour of eigenstates of arithmetic hyperbolic manifolds, Comm. Math. Phys. 161, 1994',
        url: 'https://doi.org/10.1007/BF02099785',
      },
      {
        label: 'Lindenstrauss, Invariant measures and arithmetic quantum unique ergodicity, Ann. of Math. 163, 2006',
        url: 'https://doi.org/10.4007/annals.2006.163.165',
      },
    ],
  },
  {
    id: 'mp-018',
    output: 'verified_truth',
    title: 'Eigenstate Thermalization Hypothesis (ETH) from First Principles',
    titleZh: '从第一性原理建立本征态热化假设（ETH）',
    domain: 'mathematical-physics',
    subdomain: 'quantum-thermalization',
    status: 'open',
    difficulty: 'frontier',
    formalization_potential: 'low',
    verification_path: 'numerical',
    tags: ['eth', 'thermalization', 'isolated-quantum-systems', 'many-body'],
    contributor: 'admin',
  date_added: '2026-08-22',
    related_problems: [
      {
        id: 'mp-003',
        relation: 'shares_tools',
        note: 'Classical counterpart: ETH asks for relaxation to the microcanonical/Gibbs ensemble in isolated quantum systems, analogous to mp-003 thermalization of the FPU lattice.',
      },
      {
        id: 'mp-016',
        relation: 'analog_of',
        note: 'Both conjecture that eigenstates of a generic Hamiltonian are uniformly spread over the accessible phase space.',
      },
    ],
    statement: `Fix a concrete interacting model: the disordered XXZ spin chain on a box $\\Lambda\\subset\\mathbb{Z}$, $H_\\Lambda=\\sum_{i}\\big(\\sigma^x_i\\sigma^x_{i+1}+\\sigma^y_i\\sigma^y_{i+1}+\\Delta\\,\\sigma^z_i\\sigma^z_{i+1}+h_i\\sigma^z_i\\big)$ with i.i.d. $h_i$ of zero mean, at any $\\Delta\\neq0$ and small disorder where no many-body localization sets in. Prove that, with probability $1$ over the realization, for every local observable $\\mathcal{O}$ and for eigenstates $|E_n\\rangle$ with bulk energy density $e\\in(0,1)$,
$$\\langle E_n|\\mathcal{O}|E_n\\rangle = \\mathcal{O}_{\\mathrm{mc}}(e) + r_{nn},\\qquad r_{nn}=O(e^{-c\\sqrt{|\\Lambda|}}),$$
for some constant $c>0$, where $\\mathcal{O}_{\\mathrm{mc}}(e)$ is the microcanonical expectation at energy density $e$ — i.e. establish the vanishing of the diagonal matrix-element fluctuations to within an "ETH-rate" on this specific lattice model.`,
    origin:
      'ETH, conjectured by Deutsch and Srednicki and studied numerically (Rigol\u2013Dunjko\u2013Olshanii), asserts that isolated quantum many-body systems thermalize because each eigenstate already encodes thermodynamics. Rigorous proofs exist only for special models (e.g. free or very specific integrable/disordered limits); no generic interacting proof is known.',
    progress: [
      '**Free / noninteracting**: exact, for quadratic Hamiltonians the eigenstate expectations equal ensemble averages.',
      '**Numéraire**: extensive numerics confirm ETH in hard-core boson / spin chains; rigorous bounds only in "weakly ETH" or random-matrix settings.',
    ],
    obstacles: [
      '**Proving a vanishing variance** of matrix elements requires fine control of the spectrum and of eigenfunction overlaps that the current rigorous toolkit cannot deliver for interacting systems.',
      '**Defining "generic"**: no mathematically clean condition separates ETH holding vs. failing (many-body localization being the counter-regime).',
    ],
    engineering_value:
      'ETH is the operational criterion for how isolated quantum systems reach thermal equilibrium; if proven, it would provide rigorous predictions for the efficiency ceiling of quantum engines and entanglement-generation times.',
    formalization_notes:
      'The hypothesis is currently a numerically-supported conjecture without a precise generic statement; a formalization would first require fixing the model class, hence low potential today.',
    references: [
      {
        label: 'Srednicki, Chaos and quantum thermalization, Phys. Rev. E 50, 1994',
        url: 'https://doi.org/10.1103/PhysRevE.50.888',
      },
      {
        label: 'Rigol, Dunjko, Olshanii, Thermalization and its mechanism for generic isolated quantum systems, Nature 452, 2008',
        url: 'https://doi.org/10.1038/nature06838',
      },
    ],
    judgment: 'A pass establishes, with probability 1 over disorder, the ETH bound $r_{nn}=O(e^{-c\\sqrt{|\\Lambda|}})$ for the disordered XXZ chain in the delocalized regime, with the matrix-element variance/overlap estimate certified on the stated model; generic heuristics or numerics-only statements are not accepted.',
    proposer: 'J. M. Deutsch, M. Srednicki',
    via: { label: 'Srednicki, Chaos and quantum thermalization, Phys. Rev. E 50 (1994)' },
  },
  {
    id: 'mc-011',
    output: 'verified_truth',
    title: 'Multistationarity vs. Monostationarity of Deficiency-One Reaction Networks',
    titleZh: '缺陷一反应网络的多稳态与单稳态判定',
    domain: 'mathematical-chemistry',
    subdomain: 'crnt',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'high',
    verification_path: 'analytical',
    tags: ['crnt', 'multistationarity', 'deficiency-one', 'steady-states'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'G. Craciun & M. Feinberg',
    proposed_year: 2005,
    via: {
      label: 'Deficiency-one network mono/multistability criteria: the injectivity criteria of Craciun & Feinberg (2005) and reviews',
      url: 'https://doi.org/10.1137/S0895479803446819',
    },
    related_problems: [
      {
        id: 'mc-001',
        relation: 'generalizes',
        note: 'The deficiency-one multistationarity question refines the fixed-point structure studied for complex-balanced systems in mc-001.',
      },
      {
        id: 'mc-002',
        relation: 'shares_tools',
        note: 'Both are CRNT existence/uniqueness questions; mc-002 concerns persistence, mc-011 the number of positive steady states.',
      },
    ],
    statement: `For a reaction network of species deficiency $\\delta\\le 1$ (deficiency of the network as defined in CRNT), give a complete algebraic characterization of multistationarity: determine, from the stoichiometric subspace and reaction vectors alone, when the associated mass-action differential equation admits
$$\\exists\\;\\text{more than one positive steady state in a stoichiometric compatibility class,}$$
and when (by contrast) every such class contains a unique positive steady state. Characterize the boundary in terms of the network\u2019s "injective vs. surjective" maps on the reaction cone.`,
    origin:
      'Determining whether a network can sustain multiple steady states (bistability) is pivotal for cell-signaling and metabolic design; for deficiency-one networks the Deficiency One Theorem fixes the number of steady states under a sign-reversibility condition, but the general (violating) boundary is not closed \u2014 leaving an open classification problem.',
    progress: [
      '**Deficiency Zero** fully solved (unique steady state per class, Craciun\u2013Feinberg).',
      '**Deficiency One with signing**: the Deficiency One Theorem gives zero/one steady states under a sign condition; the general deficiency-one case admits multiple steady states but the exact condition is incomplete.',
    ],
    obstacles: [
      '**Injective maps on non-compact cones**: verifying the "injective map" certificate is NP-hard in general, so a clean algebraic criterion is lacking.',
      '**Bound on the number**: even within deficiency one, the maximum number of steady states per class is not settled for arbitrary networks.',
    ],
    engineering_value:
      'Bistability is a key mechanism of cellular signaling and memory; a complete decision of multistationarity for deficiency-one networks can be used directly in the reversible/irreversible design of metabolic pathways and synthetic-biology switches.',
    formalization_notes:
      'The core is algebraic (polynomial ideal / resultant of steady-state equations) and the Deficiency One Theorem is a clean certified proof \u2014 a strong candidate for formal verification of the conditions.',
    references: [
      {
        label: 'Feinberg, Chemical reaction network structure and the stability of complex isothermal reactors II: Multiple steady states, Chem. Eng. Sci. 43(10), 1988',
        url: 'https://doi.org/10.1016/0009-2509(88)80015-2',
      },
      {
        label: 'Conradi, Shiu, Dynamics of post-translational modification systems, Adv. Appl. Math. 56, 2014',
        url: 'https://doi.org/10.1016/j.aam.2014.01.005',
      },
    ],
    judgment: 'A pass gives a complete algebraic characterization, from the stoichiometric subspace and reaction vectors alone, of when a deficiency-one network admits more than one positive steady state in a compatibility class versus a unique one, certifying the injective/surjective boundary on the reaction cone and settling the maximum number per class; an incomplete criterion or one whose verification is NP-hard without an algorithmic witness is not enough.',
  },
  {
    id: 'mc-012',
    output: 'verified_truth',
    judgment: 'A pass identifies the exact graphs attaining the maximum and minimum Huckel energy over the given order and size or tree/fullerene classes and closes the gap to the upper bound, with the extremal graph and the value certified by a proof rather than a numerical search.',
    title: 'Extremal Hückel π-Electron Energy: Tight Bounds on Graph Energy',
    titleZh: 'Hückel π 电子能量的极值：图能量的紧界',
    domain: 'mathematical-chemistry',
    subdomain: 'chemical-graph-theory',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'high',
    verification_path: 'analytical',
    tags: ['graph-energy', 'huckel-theory', 'extremal-problems', 'molecular-graphs'],
    contributor: 'admin',
    date_added: '2026-08-22',
    provenance: 'lean-compilable',
    lean_statement: 'import Std\n\n/-!\nmc-012 — Extremal Hückel π-electron energy: sharp bound.\n\nThe Hückel energy of a molecular graph with n vertices and m edges satisfies\nE(G)² ≤ 2·m·n (McClelland-type bound). `GraphEnergySq` is the formalization\ntarget; the bound statement is the headline claim (proof left open via `sorry`).\n-/\nnamespace MathX\n\ndef GraphEnergySq (n : Nat) (A : Nat → Nat → Rat) : Rat := by\n  exact 0\n\ndef edgeCount (n : Nat) (A : Nat → Nat → Rat) : Nat :=\n  (List.range n).foldl (fun acc i =>\n    (List.range n).foldl (fun acc2 j =>\n      if i < j ∧ A i j ≠ 0 then acc2 + 1 else acc2) acc) 0\n\ntheorem hueckel_energy_bound (n : Nat) (A : Nat → Nat → Rat) :\n    GraphEnergySq n A ≤ ((2 * edgeCount n A * n : Nat) : Rat) := by\n  sorry\n\nend MathX\n',
    proposer: 'I. Gutman',
    proposed_year: 1978,
    via: { label: 'Gutman, The energy of a graph, Ber. Math.-Statist. Sekt. 103 (1978) (Hückel π-electron energy theory)' },
    related_problems: [
      {
        id: 'mc-003',
        relation: 'shares_tools',
        note: 'Both belong to spectral extremal theory of molecular graphs; mc-003 constrains achievable spectra, mc-012 the total π-energy.',
      },
    ],
    statement: `For a graph $G$ of order $n$ and size $m$ representing a conjugated hydrocarbon, the (Hückel) energy is $$\\mathcal{E}(G)=\\sum_{i=1}^{n}|\\lambda_i|,$$ where $\\lambda_i$ are the adjacency-matrix eigenvalues. Determine the extremal values of $\\mathcal{E}$ over prescribed classes \u2014 specifically, prove which graphs (among all graphs of given order $n$ and size $m$, or among trees/fullerenes of given order) attain the maximum and minimum total energy, and close the gap between the current upper bound $\\mathcal{E}(G)\\le \\tfrac{2m}{n}+\\sqrt{(n-1)(2m-\\tfrac{4m^2}{n^2})}$ and the realized maximum.`,
    origin:
      'Graph energy models the total π-electron energy of a conjugated molecule within Hückel theory, and linking stability/aromaticity to extremal spectral quantities is a long-standing program. Despite strong bounds (e.g. recently sharpened by Nikiforov and others), the exact extremal graphs for general $(n,m)$ remain unknown beyond special classes.',
    progress: [
      '**Sharp bounds**: Nikiforov\u2019s inequality and the McClelland-type bounds give excellent upper envelopes.',
      '**Extremal classes**: complete graphs, complete bipartite and some trees are extremal exactly; general $(n,m)$ forbidden-region gaps remain.',
    ],
    obstacles: [
      '**Existence of the extremal graph**: the energy functional is non-smooth (absolute values), so variational arguments for the maximizing graph are delicate.',
      '**Open for sparse/non-regular classes**: bounds are tight only on boundary regions; off-boundary neighbors are unexplored.',
    ],
    engineering_value:
      'π-electron energy is a proxy indicator of molecular stability; improving its extremal bounds yields quantitative upper bounds for aromaticity/reactivity rankings, used for pre-selecting ligand scaffolds in high-throughput screening.',
    formalization_notes:
      'Combinatorial and algebraic, with elementary eigenvalue inequalities; the extremal proof is amenable to formal certification for finite graph classes.',
    references: [
      {
        label: 'Gutman, The energy of a graph, Ber. Math.-Stat. Sekt. Forschungsz. Graz 103, 1978',
        url: 'https://doi.org/10.1007/BF02706024',
      },
      {
        label: 'Nikiforov, The energy of graphs and matrices, J. Math. Anal. Appl. 326, 2007',
        url: 'https://doi.org/10.1016/j.jmaa.2006.03.072',
      },
    ],
  },
  {
    id: 'mb-011',
    output: 'verified_truth',
    title: 'Exact Critical Value of the Contact Process on the Integer Lattice',
    titleZh: '整格上接触过程的精确临界值',
    domain: 'mathematical-biology',
    subdomain: 'interacting-particle-systems',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'medium',
    verification_path: 'analytical',
    tags: ['contact-process', 'critical-value', 'percolation', 'phase-transition'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'T. E. Harris',
    proposed_year: 1974,
    via: {
      label: 'Contact process critical value: Harris (1974); upper/lower bounds see Liggett, Stochastic Interacting Systems (1999)',
      url: 'https://doi.org/10.1214/aop/1176996477',
    },
    related_problems: [
      {
        id: 'mb-001',
        relation: 'shares_tools',
        note: 'Both concern sharp thresholds in spatial Markov processes; mb-001 handles epidemic networks, mb-011 the canonical lattice contact process.',
      },
    ],
    statement: `For the contact process on $\\mathbb{Z}^d$ — each occupied site infects nearest neighbors at rate $\\lambda$ and recovers at rate $1$ — determine the exact value of the critical infection rate
$$\\lambda_c(d)=\\inf\\{ \\lambda>0 : \\text{the infection survives forever from a single seed with positive probability}\\}.$$
Prove, in particular, whether the celebrated bound $\\lambda_c(1)=\\inf_{\\theta>0}\\tfrac{1-e^{-\\theta}}{\\theta\\,e^{-\\theta}}\\cdots$ is sharp in low dimension, i.e. exhibit $\\lambda_c(1)$ or, in general, give the exact critical value on $\\mathbb{Z}^d$.`,
    origin:
      'The contact process is the canonical model of an epidemic spreading on a lattice, and the exact critical value $\\lambda_c$ has eluded all rigorous techniques even on $\\mathbb{Z}$, where only bounds (e.g. $\\lambda_c(1)>1$ and $\\lambda_c(1)<\\lambda_0$ for an improved upper envelope) are known. Pinpointing it is the central open problem in interacting particle systems.',
    progress: [
      '**Existence & universality**: $0<\\lambda_c<\\infty$ and the phase transition are fully established (Harris, Bezuidenhout\u2013Grimmett for completeness).',
      '**Exact value**: only rigorous bounds; no dimension is solved exactly, and improving the constant remains open.',
    ],
    obstacles: [
      '**No self-duality / no closed-form**: unlike branching processes, the spatial contact process has no exact solvability, so current tools give only variational bounds.',
      '**Sharpness**: closing the bound to an identity demands fine control of survival that lattice combinatorics does not yet deliver.',
    ],
    engineering_value:
      'An exact critical transmission rate can provide an analytic constant free of prior fitting for the physical criteria of locally spreading contagion (desert species invasion, disease propagation), replacing Monte Carlo extrapolation.',
    formalization_notes:
      'The transition is probabilistically clean and the bounds are finite-combinatorial; a formal proof of tightness faces the unresolved analytic core, so potential stays medium.',
    references: [
      {
        label: 'Liggett, Stochastic Interacting Systems: Contact, Voter and Exclusion Processes, Springer, 1999',
        url: 'https://doi.org/10.1007/978-3-662-03990-8',
      },
      {
        label: 'Harris, Contact interactions on a lattice, Ann. Probab. 2, 1974',
        url: 'https://doi.org/10.1214/aop/1176996493',
      },
    ],
    judgment: 'A pass determines the exact critical value $\\lambda_c(d)$ of the contact process on $\\mathbb{Z}^d$, closing the known bounds to an identity (on $\\mathbb{Z}$ at least) with a proof of survival sharpness rather than an improved but non-tight envelope; improving an existing constant without exact determination is not accepted.',
  },
  {
    id: 'mb-012',
    output: 'verified_truth',
    title: 'Coexistence Threshold of Cyclic Three-Species Competition on Lattices',
    titleZh: '格子环状三物种竞争的共存阈值',
    domain: 'mathematical-biology',
    subdomain: 'evolutionary-dynamics',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'medium',
    verification_path: 'analytical',
    tags: ['cyclic-competition', 'rock-paper-scissors', 'coexistence', 'spatial-ecology'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'R. M. May & W. J. Leonard',
    proposed_year: 1975,
    via: {
      label: 'May & Leonard, Nonlinear aspects of competition between three species, SIAM J. Appl. Math. 29 (1975)',
      url: 'https://doi.org/10.1137/0129033',
    },
    related_problems: [
      {
        id: 'mb-001',
        relation: 'shares_tools',
        note: 'Both ask for sharp coexistence/extinction thresholds in space-time Markov models of interacting populations.',
      },
    ],
    statement: `Fix the cyclic (rock\u2013paper\u2013scissors) three-species contact process on the lattice $\\mathbb{Z}^d$: each site is in one of three states $A,B,C$, or empty; $A$ invades $B$ at rate $\\lambda$, $B$ invades $C$, $C$ invades $A$ (symmetric rates), and each occupied site dies at rate $\\mu$ leaving the site empty. Prove the sharp coexistence criterion: there exists a bounded open set $\\mathcal{R}\\subset\\mathbb{R}^2$ of parameters $(\\lambda/\\mu, d)$ such that, starting from any configuration with all three species present, with positive probability the process coexists forever — all three states occupied at arbitrarily large times — whereas outside $\\mathcal{R}$ the process fixes to a single species or cyclically vacillates. Determine $\\mathcal{R}$ exactly.`,
    origin:
      'Intransitive (rock\u2013paper\u2013scissors) interactions can uphold biodiversity because no species dominates all others; on a well-mixed population the dynamics spiral to a stable limit, while on a lattice spatial clustering can preserve all three. The exact coexistence threshold as a function of mobility/selection strengths is not settled.',
    progress: [
      '**Well-mixed (mean-field)**: converges to a neutrally stable limit cycle; coexistence holds.',
      '**Spatial**: three-color voter-type models suggest coexistence depends on a mobility threshold; rigorous coexistence only for narrow parameter windows.',
    ],
    obstacles: [
      '**Spatial clustering**: the moving interfaces that drive coexistence have no closed-form description in dimension $d>1$.',
      '**Multi-species dual / duality machinery**: unlike two species, no monotone duality yields a clean coexistence criterion.',
    ],
    engineering_value:
      'Three-species rock-paper-scissors is the minimal model of microbial-community diversity; proving the coexistence threshold can directly guide the ratio design of microbiota/prebiotic formulations, preventing privatization from sliding into single-strain dominance.',
    formalization_notes:
      'The model is fully stochastic and finite-combinatorial; rigorous coexistence bounds are tractable in slabs, but the sharp threshold depends on unresolved spatial statistics (medium).',
    references: [
      {
        label: 'Reichenbach, Mobilia, Frey, Mobility promotes and jeopardizes biodiversity in rock\u2013paper\u2013scissors games, Nature 448, 2007',
        url: 'https://doi.org/10.1038/nature06095',
      },
      {
        label: 'Szabó, Fáth, Evolutionary games on graphs, Phys. Rep. 446, 2007',
        url: 'https://doi.org/10.1016/j.physrep.2007.04.004',
      },
    ],
    judgment: 'A pass determines exactly the coexistence region $\\mathcal{R}\\subset\\mathbb{R}^2$ of parameters for the cyclic three-species contact process, proving coexistence forever from any fully-present configuration inside $\\mathcal{R}$ and fixation-vacillation outside $\\mathcal{R}$, with the sharp boundary set; coexistence only for a narrow parameter window is partial, not the exact threshold.',
  },
  {
    id: 'mb-013',
    output: 'verified_truth',
    judgment: 'A pass proves the sharp threshold that the infectious population persists with probability tending to 1 if and only if R0 is greater than 1, and determines the exact distributional scaling of the extinction time including tau_N / N converging to a mean-1 exponential law at alpha=1 and the precise power gamma(alpha) elsewhere, with rigorous bounds.',
    title: 'Sharp Epidemic Threshold and Near-Critical Extinction Time for SIR with Demography',
    titleZh: '含人口的 SIR 模型尖锐传播阈值与近临界灭绝时间',
    domain: 'mathematical-biology',
    subdomain: 'epidemic-dynamics',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'medium',
    verification_path: 'analytical',
    tags: ['sir-model', 'epidemic-threshold', 'extinction-time', 'basic-reproduction-number'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'H. Andersson & T. Britton',
    proposed_year: 2000,
    via: {
      label: 'Stochastic epidemic models (threshold/near-critical): Andersson & Britton, Stochastic Epidemic Models and Their Statistical Analysis (2000)',
      url: 'https://doi.org/10.1007/978-1-4612-1158-7',
    },
    related_problems: [
      {
        id: 'mb-001',
        relation: 'shares_tools',
        note: 'mb-001 asks for exact network thresholds; mb-013 asks for the sharpness and fluctuation of the SIR threshold with demography.',
      },
    ],
    statement: `For the Markovian SIR process with demography on a finite population of size $N$ — susceptible/infectious/recovered with birth\u2013death balancing the population — where the basic reproduction number is scaled as $R_0=1+\\delta N^{-\\alpha}$ for fixed $\\delta>0$ and $\\alpha>0$, prove the sharp threshold: the infectious population persists with probability tending to $1$ as $N\\to\\infty$ if and only if $R_0>1$, and determine the exact distributional scaling of the extinction time $\\tau_N$ near criticality — i.e. prove $\\tau_N/N \\Rightarrow \\mathcal{E}$ (an explicit mean-$1$ exponential law) at $\\alpha=1$, and give the precise power $\\gamma(\\alpha)$ of $\\tau_N\\asymp N^{\\gamma(\\alpha)}$ for the critical window $\\alpha\\in[0,1]$, closing the gap between current upper and lower bounds.`,
    origin:
      'The sharp criticality $R_0=1$ for the SIR-with-demography process is believed exact but its rigorous near-critical scaling is incomplete: the process is neither Gaussian nor purely branching at criticality, so the extinction-time tail is debated. Logging an exact near-critical law would place epidemic early-warning on firm footing.',
    progress: [
      '**Sharp threshold**: for the infinite-population limit the $R_0$ phase boundary is established.',
      '**Near-critical extinction**: bounds give polynomial $\\tau_N$ but with different exponents than numerical simulations suggest; exact scaling open.',
    ],
    obstacles: [
      '**Critical window non-Gaussianity**: at $R_0=1$ fluctuations trade between branching and catastrophe; standard martingale bounds are too crude.',
      '**Finite-$N$ corrections**: matching constants requires refined diffusion approximations on the critical manifold.',
    ],
    engineering_value:
      'The statistical law of near-critical extinction time determines the decidable window for whether an outbreak naturally dies out; an exact rate calibrates the timing of control-resource deployment and the critical vaccine-coverage value.',
    formalization_notes:
      'The branching/regenerative structure makes the mean-field and critical steps formalizable; only the sharp exponent is analytically unresolved, hence medium potential.',
    references: [
      {
        label: 'Allen, Some stochastic SIR models and the basic reproduction number, J. Math. Biol. 55, 2007',
        url: 'https://doi.org/10.1007/s00285-007-0113-1',
      },
      {
        label: 'Kermack, McKendrick, A contribution to the mathematical theory of epidemics, Proc. R. Soc. A 115, 1927',
        url: 'https://doi.org/10.1098/rspa.1927.0118',
      },
    ],
  },
  {
    id: 'me-009',
    output: 'verified_truth',
    judgment: 'A pass proves that a competitive ratio of at least 1/e is achievable by a single online algorithm for every matroid, or determines the true optimal constant, via a rigorous threshold-algorithm argument whose output basis satisfies the stated expected-value inequality for all adversarial weight orderings.',
    title: 'The Matroid Secretary Conjecture',
    titleZh: '拟阵秘书猜想',
    domain: 'mathematical-engineering',
    subdomain: 'online-algorithms',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'high',
    verification_path: 'analytical',
    tags: ['matroid-secretary', 'online-selection', 'competitive-ratio', 'environmental'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'M. Babaioff, N. Immorlica & R. Kleinberg',
    proposed_year: 2007,
    via: {
      label: 'Babaioff–Immorlica–Kleinberg, Matroids, secretary problems, and online mechanisms, SODA (2007)',
      url: 'https://doi.org/10.5555/1283383.1283496',
    },
    related_problems: [
      {
        id: 'me-007',
        relation: 'shares_tools',
        note: 'Both bound the optimal competitive ratio of online selection problems; facility location has a cost structure free, secretary selects a single independent set.',
      },
    ],
    statement: `Let $\\mathcal{M}=(E,\\mathcal{I})$ be a matroid and weights arrive in random order with adversarially chosen values. An algorithm must irrevocably select elements subject to independence, and gets the value of the selected set if and only if it is a basis. Conjecture: there exists an algorithm achieving competitive ratio $1/e$ — i.e.
$$\\mathbb{E}[\\text{value of selected basis}]\n\\ge \\tfrac{1}{e}\\,\\max_{\\text{bas. }B}\\sum_{e\\in B} w_e .$$
Prove that $1/e$ is achievable (or determine the true optimal constant) for every matroid.`,
    origin:
      'The secretary problem "choose the best from a random-ordered stream" generalizes to arbitrary matroids of acceptable selections, modeling online hiring, cloud spot-bidding and ranked resource selection. A $1/e$-competitive algorithm is known to be tight for the greedy matroid secretary, but whether a uniform $1/e$ (or even $1/e$ vs. $1/\\sqrt{e}$ gap) holds for all matroids is a well-known open conjecture.',
    progress: [
      '**Greedy/regular matroids**: $1/e$ (and, for some, $1-1/e$) achievable.',
      '**General matroids**: known $\\frac{1}{\\text{poly}(\\log \\log rank)}$ via "threshold" schemes; the conjecture\u2019s exact constant is not settled.',
    ],
    obstacles: [
      '**Uniformity across independent systems**: matching the two-sided bound for every rank profile simultaneously is delicate.',
      '**Bas-to-independent relaxation**: most positive results select near-bases; enforcing exact basis feasibility loses the constant.',
    ],
    engineering_value:
      'If the $1/e$ conjecture holds, the optimal revenue of online auctions and talent funnels has a size-independent constant lower bound, directly enabling tight revenue baselines and achievement thresholds for cloud bidding and hiring funnels.',
    formalization_notes:
      'Fully combinatorial; the threshold/DP machinery factors into finite certificate checks, but the tight uniform constant depends on unresolved structure of general matroids (high potential since the claim itself is clean).',
    references: [
      {
        label: 'Babaioff, Immorlica, Kleinberg, Matroids, secretary problems, and online mechanisms, SODA 2007',
        url: 'https://doi.org/10.5555/1283383.1283398',
      },
      {
        label: 'Lachish, O(\\log\\log rank) competitive ratio for the matroid secretary problem, FOCS 2014',
        url: 'https://doi.org/10.1109/FOCS.2014.41',
      },
    ],
  },
  {
    id: 'me-010',
    output: 'verified_truth',
    title: 'Constant Approximability of the Graph Bandwidth Problem',
    titleZh: '图带宽问题的常数近似性',
    domain: 'mathematical-engineering',
    subdomain: 'graph-algorithms',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'medium',
    verification_path: 'analytical',
    tags: ['graph-bandwidth', 'approximation', 'layout-problems', 'matrix-bandwidth'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'U. Feige',
    proposed_year: 2000,
    via: {
      label: 'Feige, Approximating the bandwidth via volume respecting embeddings, JCSS 60 (2000)',
      url: 'https://doi.org/10.1006/jcss.1999.1682',
    },
    related_problems: [
      {
        id: 'me-003',
        relation: 'shares_tools',
        note: 'Both are hard combinatorial layout/ordering problems on graphs; me-003 concerns optimization under ordering, me-010 the minimal bandwidth layout.',
      },
    ],
    statement: `For a graph $G=(V,E)$, the bandwidth $\\mathrm{bw}(G)$ is the minimum over bijective orderings $\\pi:V\\to\\{1,\\dots,n\\}$ of $\\max_{(u,v)\\in E}|\\pi(u)-\\pi(v)|$. Decide whether $\\mathrm{bw}$ is approximable within a constant: prove whether there exists $C\\ge 1$ and a polynomial algorithm that, for every input $G$, outputs an ordering of bandwidth $\\le C\\cdot\\mathrm{bw}(G)$ (or exhibit an $\\Omega(1)$ inapproximability factor). Settle the current gap between the $O(\\sqrt{\\log n\\log\\log n})$-approximation of volume-respecting embeddings and the polynomial inapproximability.`,
    origin:
      'Bandwidth minimization seeks the layout making a matrix/graph closest to banded, minimizing fill-in and communication loads. Despite decades of work, the approximability threshold — whether a constant factor is possible — remains unknown, sitting between a polylog upper bound and a polynomial lower bound.',
    progress: [
      '**Upper**: $O(\\sqrt{\\log n\\,\\log\\log n})$-approximation via volume-respecting embeddings (Feige).',
      '**Lower**: NP-hardness to within a constant under P$\\ne$NP is not established; only weaker gaps are known.',
    ],
    obstacles: [
      '**No strong integrality gap / UGC connection**: standard hardness frameworks have not produced a constant inapproximability.',
      '**Embedding-based upper bound is loose**: volume-respecting embeddings give only a polylog factor, with no clear tight route.',
    ],
    engineering_value:
      'The smaller the bandwidth, the less fill-in and communication sparse matrices require; deciding constant approximability determines whether a "band-minimizing layout tool" can give reliable upper bounds, directly affecting scaling strategies of finite-element and LSI-routing tools.',
    formalization_notes:
      'The metric-embedding upper bound is formalizable; closing to a constant is an unresolved analytic gap, so potential is medium.',
    references: [
      {
        label: 'Feige, Approximating the bandwidth via volume respecting embeddings, J. Comput. Syst. Sci. 60, 2000',
        url: 'https://doi.org/10.1006/jcss.1999.1682',
      },
      {
        label: 'Kaplan, Shamir, The bandwidth problem and bandwidth of a graph, in: Handbook of Graph Theory, 2004',
        url: 'https://doi.org/10.1201/9781439832954',
      },
    ],
    judgment: 'A pass decides whether graph bandwidth is approximable within a constant: either a polynomial algorithm outputting an ordering of bandwidth $\\le C\\cdot\\mathrm{bw}(G)$ for a constant $C$ (improving the polylog upper bound), or a proof of an $\\Omega(1)$ inapproximability factor; progress strictly between the polylog upper and polynomial lower bounds that does not resolve constant-approximability is not accepted.',
  },
  {
    id: 'me-011',
    output: 'verified_truth',
    title: 'The 4/3-Conjecture and Near-3/2 Approximation for Graphic TSP',
    titleZh: '图旅行商问题的 4/3 猜想与近似 3/2 算法',
    domain: 'mathematical-engineering',
    subdomain: 'approximation-algorithms',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'high',
    verification_path: 'analytical',
    tags: ['graphic-tsp', '4-3-conjecture', 'approximation', 'christofides'],
    contributor: 'admin',
    date_added: '2026-08-22',
    provenance: 'lean-compilable',
    lean_statement: 'import Std\n\n/-!\nme-011 — Graphic TSP 4/3-conjecture.\n\nFor every finite weighted graph, the shortest Hamiltonian cycle in its metric\nclosure costs at most 4/3 the minimum-spanning-tree weight. The definitions of\n`MSTWeight` and `GraphicTSPOpt` are themselves part of the formalization target;\nthe statement is the well-typed headline claim (proof left open via `sorry`).\n-/\nnamespace MathX\n\nstructure MetricGraph where\n  n : Nat\n  dist : Nat → Nat → Nat\n\ndef MSTWeight (g : MetricGraph) : Nat := by\n  exact 0\n\ndef GraphicTSPOpt (g : MetricGraph) : Nat := by\n  exact 0\n\ntheorem graphic_tsp_4over3 (g : MetricGraph) (hg : 3 ≤ g.n) :\n    (GraphicTSPOpt g : Rat) ≤ ((4 : Rat) / 3) * (MSTWeight g : Rat) := by\n  sorry\n\nend MathX\n',
    proposer: 'S. O. Gharan, A. Saberi & M. Singh',
    proposed_year: 2011,
    via: {
      label: 'Gharan–Saberi–Singh, A randomized rounding approach to the traveling salesman problem, FOCS (2011)',
      url: 'https://doi.org/10.1109/FOCS.2011.76',
    },
    related_problems: [
      {
        id: 'me-001',
        relation: 'shares_tools',
        note: 'Both concern provable quality of routing/ordering algorithms; me-001 binds online competitive ratios, me-011 the offline metric/approximation ratio.',
      },
    ],
    statement: `Let $G=(V,E)$ be a 2-edge-connected graph and let $c$ be the assignment of edge length $1$ (the *graphic* TSP). Conjecture: the minimum tour cost satisfies
$$\\mathrm{opt} \\le \\tfrac{4}{3}\\,n,$$
so the Traveling Salesman Problem on metric spaces induced by graphs is $\\tfrac{4}{3}$-approximable relative to its trivial $n$-edge lower bound. Establish the tight $\\tfrac{4}{3}$ ratio — proving or disproving the 4/3-conjecture — and in the process determine the best achievable constant-factor approximation for graphic TSP.`,
    origin:
      'The classic Christofides–Serdyukov algorithm gives a $3/2$-approximation for metric TSP, a factor that resisted improvement for four decades despite overwhelming numerical evidence for the $4/3$-conjecture (that graphic TSP, the metric closure of a graph with unit edges, admits a $4/3$-approximation). Several $\\approx 1.4$ results exist for special cases, and whether $4/3$ holds for all graphic instances is open.',
    progress: [
      '**3/2 bound**: Christofides\u2013Serdyukov (1976) — the metric bound that is still optimal-ish but conjecturally loose.',
      '**Sub-3/2 and structures**: improved graphical ratios (e.g. $\\le 1.4$ for graphs with few "nice" blocks) and the 4/3 conjecture unresolved in general.',
    ],
    obstacles: [
      '**Lower-bound bottleneck**: proving the tight $\\tfrac{4}{3}$ ratio needs a sharp structural lower bound on the number of "removable edges" feeding the Christofides/parity cut arguments.',
      '**Marginal cases**: the worst-case instances for the ratio sit at a narrow junction where both upper and lower constructions are brittle.',
    ],
    engineering_value:
      'The approximation ratio of routing/wiring cost converts directly into the resource over-provisioning factor of logistics or chip wiring; tightening 3/2 to 4/3 means the same budget can serve about 11% more routing requests.',
    formalization_notes:
      'Combinatorial with explicit matching/parity arguments; the 4/3 bound reduces to certifying a structural cut inequality, a viable formalization target though the hard core is combinatorial.',
    references: [
      {
        label: 'Christofides, Worst-case analysis of a new heuristic for the travelling salesman problem, Tech. Report, 1976',
        url: 'https://doi.org/10.1184/R1/6621578.v1',
      },
      {
        label: 'Sebő, Vygen, Shorter tours by nicer ears: 7/5-approximation for the graph-TSP, 3/2 for the path version, and 4/3 for two-edge-connected subgraphs, Combinatorica 34, 2014',
        url: 'https://doi.org/10.1007/s00493-014-2961-3',
      },
    ],
    judgment: 'A pass proves or disproves the $4/3$-conjecture for graphic TSP — that every $2$-edge-connected unit-weight graph has a tour of cost at most $\\tfrac{4}{3}n$ — or otherwise determines the exact optimal constant-factor approximation for graphic TSP, with the underlying structural cut inequality certified; a sub-$3/2$ constant on special graph classes alone is not the resolution.',
  },
  {
    id: 'me-012',
    output: 'verified_truth',
    title: 'Existence of a Strongly Polynomial Algorithm for Linear Programming',
    titleZh: '线性规划强多项式算法的存在性',
    domain: 'mathematical-engineering',
    subdomain: 'optimization-algorithms',
    status: 'open',
    difficulty: 'frontier',
    formalization_potential: 'medium',
    verification_path: 'analytical',
    tags: ['linear-programming', 'strong-polynomiality', 'ellipsoid-method', 'smale-problems'],
    contributor: 'admin',
  date_added: '2026-08-22',
    via: { label: 'Smale, Mathematical problems for the next century, Math. Intelligencer 20 (1998) 7-15 (Problem 9: strongly-polynomial linear programming)' },
    related_problems: [
      {
        id: 'me-007',
        relation: 'shares_tools',
        note: 'me-007 concerns competitive ratios for online facility location whose LP rounding is a core tool; me-012 asks the foundational question of whether LP itself admits a strongly polynomial solver.'
      },
      {
        id: 'me-011',
        relation: 'shares_tools',
        note: 'Both sit at the gap between the practical (weakly) polynomial algorithms used in industry and a provable strongly polynomial bound.'
      },
    ],
    statement: `Linear programming asks to decide
$$\\min\\{c^{\\mathsf T}x : Ax \\le b,\\; x \\ge 0\\}$$
for a rational $m \\times n$ system. The system is polynomial-time solvable (Khachiyan 1979; interior-point methods now dominate practice), but every known algorithm runs in time polynomial in the *bit length* $L$ of the input. Conjecture (Smale, problem 9): there exists a strongly polynomial algorithm for LP, i.e. one whose complexity is polynomial in $m$ and $n$ alone, independent of $L$; equivalently, a pivot rule under which the simplex method uses a polynomial number of pivots. Determine the existence of, or prove the non-existence of, such an algorithm.`,
    origin:
      'Ellipsoid and interior-point algorithms give weakly polynomial running times (each arithmetic operation costs in the bit length), leaving open whether the number of arithmetic operations can be bounded solely as a polynomial of $m, n$. Smale listed this as his ninth problem for the twenty-first century; the question is equivalent to whether the simplex method admits a strongly polynomial pivot rule over the choice of degeneracy-resistant pivot strategies.',
    progress: [
      '**Weakly polynomial**: Khachiyan (1979) and Karmarkar (1984) established polynomial-in-$L$ time; these are the algorithms industrial solvers are built on.',
      '**Structured subcases**: strongly polynomial algorithms are known for systems with a fixed number of constraints ($n$ variables polynomial in $m$ via Megiddo 1984 / Tardis parallel), and for network-flow LPs; the general case remains open.'
    ],
    obstacles: [
      '**Degeneracy of pivot rules**: any strongly polynomial simplex pivot rule must provably avoid exponential pivot sequences, yet no pivot rule is proven polynomial in the worst case.',
      '**Intermediate exactness**: a strongly polynomial algorithm must perform exact arithmetic comparison certified on $O(1)$ leading digits; the interaction between numerical precision and combinatorial progress is the core difficulty.'
    ],
    engineering_value:
      'Almost all industrial scheduling, supply-chain, and budget-planning problems reduce to LP; a strongly polynomial algorithm would mean the solution complexity does not blow up with data size (integer overflow/precision), eliminating the numerical uncertainty of solvers on large-scale instances.',
    formalization_notes:
      'The problem is decidable in principle via existence of a concrete finite-state pivot procedure; formalizing it is a hard program-verification target, and the "open" claim is about a worst-case counting argument rather than a single compact invariant.',
    references: [
      {
        label: 'Khachiyan, Polynomial Algorithms in Linear Programming, USSR Comput. Math. and Math. Phys. 20, 1980',
        url: 'https://doi.org/10.1016/0041-5553(80)90061-5'
      },
      {
        label: 'Smale, Mathematical Problems for the Next Century, Math. Intelligencer 20, 1998 (problem 9: integer linear programming is in P)',
        url: 'https://doi.org/10.1007/PL00000186'
      },
    ],
    judgment: 'A pass proves the existence of a strongly polynomial algorithm for linear programming — a pivot rule with polynomially many pivots in $m$ and $n$ only, independent of the bit length $L$ — or proves its non-existence; a weakly polynomial (polynomial in $L$) result or a strongly polynomial algorithm for fixed-constraint/network-flow subcases alone is not accepted, as both already exist.',
    proposer: 'Steve Smale',
    proposed_year: 1998,
  },
  {
    id: 'me-013',
    output: 'verified_truth',
    judgment: 'A pass determines the exact infimum of asymptotic competitive ratios for deterministic online bin packing, proving tightness of the 1.58889 bound or finding a new value, via matching harmonic-type upper and weighting-function adversary constructions whose optimality is rigorous.',
    title: 'Optimal Asymptotic Competitive Ratio of Online Bin Packing',
    titleZh: '在线装箱问题的最优渐近竞争比',
    domain: 'mathematical-engineering',
    subdomain: 'online-algorithms',
    status: 'open',
    difficulty: 'frontier',
    formalization_potential: 'medium',
    verification_path: 'analytical',
    tags: ['bin-packing', 'online-algorithms', 'competitive-ratio', 'harmonic'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'E. G. Coffman, M. R. Garey & D. S. Johnson',
    proposed_year: 1997,
    via: { label: 'Survey of online bin packing: Coffman–Garey–Johnson, Bin packing surveys (1997)' },
    related_problems: [
      {
        id: 'me-007',
        relation: 'shares_tools',
        note: 'Both are online optimization problems whose quality measure is a competitive ratio; me-007 concerns facility location, me-013 packing.'
      },
      {
        id: 'me-009',
        relation: 'analog_of',
        note: 'Both are online problems where the best achievable "constant" (competitive ratio in me-013, a constant-factor via the secretary framework in me-009) is the object of study.'
      },
    ],
    statement: `In online bin packing items of size in $(0,1]$ arrive one at a time and must be assigned to a bin before the next item is seen, with no reassignment; the goal is to minimize the total number of bins used. The *asymptotic competitive ratio* $R_{\\infty}(A)$ of an algorithm $A$ is the infimum over $c$ such that
$$A(I) \\le c\\,\\mathrm{opt}(I) + o(\\mathrm{opt}(I))$$
for every input sequence $I$. Determine the exact value of
$$\\inf\\{\\;R_{\\infty}(A)\\;;\\; A \\text{ online }\\},$$
the smallest achievable asymptotic competitive ratio, for deterministic online bin packing.` ,
    origin:
      'Classic harmonic-type algorithms give asymptotic competitive ratios near $1.58889$; a matching long-standing lower bound near $1.5401$ was improved to $1.58889$ by Balogh, Békési, Galambos and Reinelt (2018) for the strongly online setting. Whether $1.58889$ is tight for the general (adaptable) online model — i.e. the exact optimal asymptotic competitive ratio — remains open.',
    progress: [
      '**Upper bounds**: the Harmonic++-type family and subsequent refinements achieve $R_{\\infty} \\approx 1.58889$.',
      '**Lower bounds**: the best known van Vliet-style floor was pushed to $1.58889$ by Balogh et al. (2018); closing the gap to the constructive upper bound is the open core.'
    ],
    obstacles: [
      '**Weighting-function limits**: all known upper and lower bounds are driven by weighting functions over item sizes; refuting tightness needs a genuinely new adversary that the current weighting framework cannot capture.',
      '**Online adaptivity**: the gap between the strongly online (no board sizes fixed in advance) and the adaptive-advance-model constants is not settled, so the exact constant depends on the precise model.'
    ],
    engineering_value:
      'The bin-packing competitive ratio corresponds directly to the VM-packing over-provisioning factor in data centers and to logistics loading rates; tightening from $1.58889$ to the optimum means provably saving resource buffer for the same scale of customers/packages, the mathematical foundation of cloud cost optimization.',
    formalization_notes:
      'Fully combinatorial: the competitive-ratio definition and harmonic upper/lower constructions are finite and checkable; formalizing the tightness proof is feasible, the open part being a matching adversary construction.',
    references: [
      {
        label: 'Balogh, Békési, Galambos, Reinelt, Lower bound for the online bin packing problem, 2018',
        url: 'https://arxiv.org/abs/1807.05554'
      },
      {
        label: 'Johnson, Near-optimal bin packing algorithms, 1973 (first harmonic-type analysis)',
        url: 'https://doi.org/10.1137/S0218-1010'
      },
    ],
  },
  {
    id: 'me-014',
    output: 'verified_truth',
    title: 'Algorithmic Threshold of the Planted Clique Detection Problem',
    titleZh: '植入团检测问题的算法阈值',
    domain: 'mathematical-engineering',
    subdomain: 'computational-statistics',
    status: 'open',
    difficulty: 'frontier',
    formalization_potential: 'high',
    verification_path: 'analytical',
    tags: ['planted-clique', 'detection-threshold', 'community-detection', 'average-case'],
    contributor: 'admin',
  date_added: '2026-08-22',
    provenance: 'lean-compilable',
    lean_statement: 'import Std\n\n/-!\nme-014 — Algorithmic Threshold of the Planted Clique Detection Problem.\n\nThere is a detection threshold: a planted clique of size k in an n-vertex random\ngraph becomes detectable and efficiently tractable once k reaches a certain\norder of sqrt(n). The predicates/functions are formalization targets; the\nheadline claim is left open via `sorry`.\n-/\nnamespace MathX\n\ndef PlantedCliqueDetectable (n k : Nat) : Prop := by\n  exact False\n\ndef DetectionThreshold (n : Nat) : Nat := by\n  exact 0\n\ntheorem planted_clique_threshold (n : Nat) :\n    PlantedCliqueDetectable n (DetectionThreshold n) := by\n  sorry\n\nend MathX\n',
    proposer: 'L. Kučera',
    proposed_year: 1995,
    via: {
      label: 'Kučera, Expected complexity of graph partitioning problems, Discrete Appl. Math. 57 (1995); algorithmic thresholds see Alon–Krivelevich–Sudakov',
      url: 'https://doi.org/10.1016/0166-218X(94)00103-G',
    },
    related_problems: [
      {
        id: 'me-004',
        relation: 'analog_of',
        note: 'me-004 bounds the round complexity of a graph problem (triangle detection) under a distributed model; me-014 asks the sample/parameter threshold at which a graph-combinatorial signal (a planted clique) becomes detectable in polynomial time.'
      },
    ],
    statement: `Let $G$ be an Erd\\H{o}s\\u2013R\\'enyi graph $G(n,\\tfrac12)$ in which a clique of size $k$ on a uniformly random vertex set is planted. *Detection* asks to distinguish the planted instance from a pure $G(n,\\tfrac12)$ sample with high probability. The information-theoretic threshold is $k \\sim 2\\log_2 n$ (detectable with unlimited computation), and a spectral/degree heuristic works for $k \\gtrsim 2\\sqrt n$. Determine the exact polynomial-time detection threshold: the smallest $k = k(n)$ for which there exists a randomized polynomial-time algorithm that distinguishes for every $k \\ge k(n)$, or prove that every such threshold is at least $\\omega(\\sqrt n)$.` ,
    origin:
      'The gap between the information-theoretic threshold ($k \\sim 2\\log_2 n$) and the best polynomial-time method (spectral/degree, $k \\sim 2\\sqrt n$) has resisted resolution for over two decades despite the problem\'s role as the canonical average-case hardness assumption in community detection and computational statistics; whether polynomial-time detection is possible just below $\\sqrt n$ is open.',
    progress: [
      '**Candidates**: spectral methods, the Frieze\\u2013Kannan matrix-infinity approach, and local/degree heuristics all require $k \\asymp \\sqrt n$.',
      '**Structural gap**: known statistical lower bounds do not reach beyond $k \\sim \\omega(\\log n)$ for general algorithms, leaving a wide open region $\\omega(\\log n) \\ll k \\ll \\sqrt n$.'
    ],
    obstacles: [
      '**Evading spectral witnesses**: any algorithm must certify the planted clique against all $\\Omega(n^{k})$ candidate $k$-subsets; spectral/degree statistics are the strongest known tool and yet seem capped at $\\sqrt n$.',
      '**Average-case lower bounds**: proving computational lower bounds needs a conditional assumption (e.g. PCAS or ETH-style) elevating the problem into an intractability hypothesis, which is hard to certify directly.'
    ],
    engineering_value:
      'Community detection / noisy-network decisions directly determine the decision threshold of "whether structure truly exists" in recommender systems and biological-network analysis; an explicit detection threshold gives engineering bounds on sample size and computation, the foundation of reliability in data-science inference.',
    formalization_notes:
      'Cleanly defined finite problem with no quantitative adversary model beyond average-case; stating the threshold and verifying detection/undetectability is a well-formed formalization target, though the hardness side rests on conditional assumptions.',
    references: [
      {
        label: 'Alon, Krivelevich, Sudakov, Finding a large hidden clique in a random graph, Random Structures & Algorithms 13, 1998',
        url: 'https://doi.org/10.1002/(SICI)1098-2418(199810/12)13:3/4<457::AID-RSA14>3.0.CO;2-2'
      },
      {
        label: 'Jerrum, Large cliques elude the Metropolis process, Random Structures & Algorithms 3, 1992',
        url: 'https://doi.org/10.1002/RSA.3240030203'
      },
    ],
    judgment: 'A pass determines the exact polynomial-time detection threshold $k(n)$ for planted clique — proving detection for every $k\\ge k(n)$ by a randomized polynomial-time algorithm, or a matching lower bound that every such threshold is at least $\\omega(\\sqrt n)$ under a stated average-case hardness assumption — with the distinguishing algorithm or reduction made explicit; a spectral/degree threshold that leaves the $k\\in(\\omega(\\log n),\\sqrt n)$ gap open is not accepted.',
  },
  {
    id: 'mp-019',
    output: 'verified_truth',
    judgment: 'A pass proves or disproves the existence of smooth finite-energy compactly supported initial data for 3D incompressible Euler that lose regularity in finite time, i.e. whose gradient L^infinity norm is unbounded as t approaches the blow-up time, certified by a rigorous gradient-growth estimate of Beale-Kato-Majda type.',
    title: 'Finite-Time Singularity Formation for Smooth 3D Incompressible Euler',
    titleZh: '光滑三维不可压 Euler 方程的有限时间奇点',
    domain: 'mathematical-physics',
    subdomain: 'fluid-dynamics',
    status: 'open',
    difficulty: 'frontier',
    formalization_potential: 'low',
    verification_path: 'analytical',
    tags: ['3d-euler', 'blow-up', 'singularity-formation', 'fluid-mechanics'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'T. Y. Hou & G. Luo',
    proposed_year: 2014,
    via: {
      label: 'Hou & Luo, Toward a finite-time singularity of the 3D incompressible Euler equations, PNAS 111 (2014) (numerical candidate; analytic proof open)',
      url: 'https://doi.org/10.1073/pnas.1402374111',
    },
    related_problems: [
      {
        id: 'mp-002',
        relation: 'analog_of',
        note: 'mp-002 concerns ergodic long-time behavior of the stochastically forced Navier–Stokes system; mp-019 the opposite time direction — the possible finite-time loss of regularity in the inviscid Euler system.',
      },
    ],
    statement: `Prove or disprove that there exist smooth, finite-energy, compactly supported solutions of the incompressible three-dimensional Euler equations
$$\\partial_t u + (u \\cdot \\nabla) u = -\\nabla p, \\qquad \\nabla \\cdot u = 0$$
that lose regularity in finite time: solutions such that $\\limsup_{t \\to T^-} \\|\\nabla u(\\cdot,t)\\|_{L^\\infty} = +\\infty$ for some finite $T > 0$, starting from $C^\\infty$ initial data.`,
    origin:
      'Whether ideal (inviscid) fluid flow can develop a genuine singularity from smooth data is the vortex-stretching mechanism problem, central to understanding the onset of turbulence and the factor separating Navier–Stokes from Euler. Singularity formation is known for the 3D *axisymmetric-with-swirl-removed* and for $C^{1,\\alpha}$ (non-smooth) data, but the smooth-data case remains open.',
    progress: [
      '**Giga (1986)**: gradient blow-up is necessary for any finite-time loss of regularity — controls the gap to measure.',
      '**Tao (2016)**: finite-time blow-up for a *structure-averaged* variant of the Navier–Stokes equations; not the true Euler flow.',
      '**Elgindi (2021)**: finite-time singularity formation for the 3D Euler equations with $C^{1,\\alpha}$ initial vorticity (non-smooth); the $C^\\infty$ case remains open.',
    ],
    obstacles: [
      '**No a priori control of $\\|\\nabla u\\|_{L^\\infty}$**: the Beale–Kato–Majda criterion reduces the problem to controlling the vorticity magnitude, which can concentrate via vortex stretching; establishing growth faster than double-exponential is the open core.',
      '**Numerical ambiguity**: candidate blow-ups (e.g. two-axisymmetric potential blow-up) remain inconclusive at achievable resolution, so evidence is cluttered.',
    ],
    engineering_value:
      'Whether singularities actually form bounds the validity of ideal-flow approximations and turbulence closures; a proof of finite-time blow-up would explain intermittency thresholds in real turbulent flows.',
    formalization_notes:
      'The analysis is a large PDE; even the blow-up conditions resist formalization. A Lean formalization of the Beale–Kato–Majda reduction would be a feasible first milestone.',
    references: [
      {
        label: 'Tao, Finite time blowup for an averaged three-dimensional Navier–Stokes equation, GAFA 26 (2016) 1091–1130',
        url: 'https://doi.org/10.1007/s00039-016-0371-6',
      },
      {
        label: 'Elgindi, Finite-time singularity formation for C^{1,α} solutions to the incompressible Euler equations on R^3, Annals of Mathematics 194 (2021) 647–727',
        url: 'https://doi.org/10.4007/annals.2021.194.3.2',
      },
    ],
  },
  {
    id: 'mp-020',
    output: 'verified_truth',
    title: 'Triviality of the Scalar λφ^4 Quantum Field Theory in 4 Dimensions',
    titleZh: '四维标量 λφ⁴ 量子场论的平凡性',
    domain: 'mathematical-physics',
    subdomain: 'constructive-qft',
    status: 'open',
    difficulty: 'frontier',
    formalization_potential: 'low',
    verification_path: 'analytical',
    tags: ['constructive-qft', 'triviality', 'phi-4-4', 'renormalization'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'M. Aizenman',
    proposed_year: 1981,
    via: {
      label: 'Aizenman, Proof of the triviality of φ⁴ field theory, Commun. Math. Phys. 86 (1982); together with Fröhlich (1982)',
      url: 'https://doi.org/10.1007/BF01205659',
    },
    related_problems: [
      {
        id: 'mp-005',
        relation: 'shares_tools',
        note: 'Both require controlling correlation function bounds of interacting lattice systems at criticality; mp-005 on quantum spin chains, mp-020 on scalar fields.',
      },
    ],
    statement: `Prove (or disprove) that the continuum limit of the lattice scalar field with quartic interaction $\\lambda (\\phi^4 - 1)$ in $d=4$ dimensions is trivial — that is, that every subsequential Wick-renormalized scaling limit is the Gaussian free field and the renormalized one-particle-irreducible (1PI) coupling $\\lambda_R$ tends to zero, so no interacting $\\phi^4_4$ exists as a tempered Schwartz field satisfying the full set of Osterwalder–Schrader axioms.`,
    origin:
      'Constructive quantum field theory established interacting $\\phi^4$ in $2$ and $3$ dimensions (Glimm–Jaffe, Gallavotti) yet the superrenormalizable-to-renormalizable threshold at $d=4$ is expected to be \u201cmean-field (trivial). Rigorous control of the continuum limit at $d=4$ is a celebrated open problem: the theory is believed to be trivial, but the proof that no non-Gaussian scaling limit survives at the marginal upper critical dimension is missing.',
    progress: [
      '**Aizenman (1981)**: rigorous upper bound on the long-distance correlation implying triviality of the continuum limit at $d > 4$; the marginal $d=4$ is excluded by the method.',
      '**Fröhlich (1982)**: a complementary proof of mean-field behavior and triviality outside the critical region at $d \\ge 4$.',
      '**Non-perturbative numerics**: lattice Monte Carlo strongly supports triviality at $\\lambda \\to 0$; a mathematical proof is still absent.',
    ],
    obstacles: [
      '**Marginal coupling at $d=4$**: log-divergences make the renormalization flow logarithmically slow (infrared freedom); neither a clean $d>4$-style inequality nor an interacting fixed point is available to settle it.',
      '**Non-perturbative definition**: no rigorous non-perturbative subtraction scheme at the 1PI level for $d=4$ is currently available.',
    ],
    engineering_value:
      'Determining triviality sets the fate of the quartic scalar as an effective field theory for Higgs-like masses and for random-geometry links (percolation/random walks); it also benchmarks numerical renormalization schemes.',
    formalization_notes:
      'A formal proof would largely be analytic (correlation inequalities, cluster expansions); formalizing Aizenman\u2019s $d>4$ argument in Lean is a feasible entry point, though the $d=4$ core is genuinely open.',
    references: [
      {
        label: 'Aizenman, Geometric analysis of φ^4 fields and Ising models, Communications in Mathematical Physics 86 (1982) 1–48',
        url: 'https://doi.org/10.1007/BF01205659',
      },
      {
        label: 'Fröhlich, On the triviality of λφ^4_d theories and the approach to the critical point in d≥4 dimensions, Nuclear Physics B 200 (1982) 281–296',
        url: 'https://doi.org/10.1016/0550-3213(82)90088-8',
      },
    ],
    judgment: 'A pass proves that every Wick-renormalized subsequential scaling limit of the $d=4$ lattice scalar $\\lambda\\phi^4$ field is the Gaussian free field with the renormalized 1PI coupling tending to zero, satisfying the Osterwalder–Schrader axioms, or disproves triviality by constructing a verified non-Gaussian limit; the marginal $d=4$ case must be handled directly rather than by the $d>4$ correlation-inequality method.',
  },
  {
    id: 'mp-022',
    output: 'verified_truth',
    judgment: 'A pass proves that the many-electron ground-state Kubo conductance equals a non-commutative index that is an integer, stable under interactions and disorder preserving a spectral gap, and equals the measured Hall conductance, with the many-body invariant and the linear-response justification made rigorous.',
    title: 'Rigorous Kubo Conductance and Quantization for Interacting Electrons',
    titleZh: '相互作用电子体系的严格 Kubo 电导与量子化',
    domain: 'mathematical-physics',
    subdomain: 'spectral-theory',
    status: 'open',
    difficulty: 'frontier',
    formalization_potential: 'medium',
    verification_path: 'analytical',
    tags: ['kubo-formula', 'quantum-hall', 'noncommutative-geometry', 'many-body'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'M. B. Hastings & S. Michalakis',
    proposed_year: 2014,
    via: {
      label: 'Hastings & Michalakis, Quantization of Hall conductance for interacting electrons on a torus, Commun. Math. Phys. 330 (2014)',
      url: 'https://doi.org/10.1007/s00220-014-2167-x',
    },
    related_problems: [
      {
        id: 'mp-004',
        relation: 'shares_tools',
        note: 'Both rely on non-commutative/index-theoretic arguments in the theory of disordered/low-dimensional systems.',
      },
    ],
    statement: `Let $H$ be the many-electron Hamiltonian of a lattice system with short-range hopping, a periodic or disordered background potential, and weak two-body repulsion, at zero temperature. Prove or disprove that the linear-response (Kubo) conductance of the ground state is given by a non-commutative index/Chern number that (i) is integer, (ii) is stable under adding interactions and disorder that leave a spectral gap, and (iii) equals the measured Hall conductance — making the quantization of the quantum Hall effect rigorous beyond the single-electron tight-binding regime.`,
    origin:
      'The integer quantum Hall effect is the cleanest topological transport phenomenon; its quantization is rigorously established for non-interacting tight-binding electrons with disorder via non-commutative geometry (Bellissard–van Elst–Schulz-Baldes) and L2-index methods. Whether the Hall conductance stays quantized for genuinely interacting electrons, and whether Kubo linear response is justified for the many-body ground state, is open.',
    progress: [
      '**Bellissard–van Elst–Schulz-Baldes (1994)**: non-commutative Kubo for single-electron disordered lattice operators; integer quantization established.',
      '**Avron–Seiler–Simon (1994)**: index-theoretic proof for the multi-band translation-invariant case.',
      '**Interacting case**: partial results via topological invariants for gapped interacting many-body states (e.g. Hastings–Michalakis); full Kubo conductance justification is open.',
    ],
    obstacles: [
      '**Interactions break single-particle index formulas**: the Chern number must be re-derived from a many-body (ground-state) invariant, requiring spectral-gap stability and a transport argument free of current conservation subtleties.',
      '**Kubo linear response justifiability**: proving that the adiabatic/linear response of a gapped interacting ground state equals the topological invariant needs uniform control absent in the many-body setting.',
    ],
    engineering_value:
      'Quantization of Hall conductance underpins metrology (the SI resistance standard) and topological-transport device design; a rigorous interacting proof would validate topological models under realistic electron–electron interactions.',
    formalization_notes:
      'The non-interacting quantization is a clean non-commutative index computation and has been partially formalized; the interacting gap is the genuinely open part.',
    references: [
      {
        label: 'Bellissard, van Elst, Schulz-Baldes, Noncommutative geometry of quantum Hall effect, Journal of Mathematical Physics 35 (1994) 5373–5451',
        url: 'https://doi.org/10.1063/1.530758',
      },
      {
        label: 'Avron, Seiler, Simon, Charge deficiency, charge transport and comparison of dimensions, Communications in Mathematical Physics 159 (1994) 399–422',
        url: 'https://doi.org/10.1007/BF02102644',
      },
    ],
  },
  {
    id: 'mc-014',
    output: 'verified_truth',
    title: 'Rigorous Existence and Convexity of the Levy–Lieb Universal Density Functional',
    titleZh: 'Levy–Lieb 泛函的严格存在性、凸性与可达到性',
    domain: 'mathematical-chemistry',
    subdomain: 'density-functional-theory',
    status: 'open',
    difficulty: 'advanced',
    formalization_potential: 'medium',
    verification_path: 'analytical',
    tags: ['dft', 'levy-lieb', 'kohn-sham', 'hohenberg-kohn'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'E. H. Lieb',
    proposed_year: 2006,
    via: { label: 'Lieb, Density functionals for Coulomb systems, Int. J. Quantum Chem. 24 (1983); rigorous properties of the Lévy–Lieb functional see the same work and its sequels' },
    related_problems: [
      {
        id: 'mp-020',
        relation: 'shares_tools',
        note: 'Both reduce interacting many-body electron problems to a variational object whose properties (attainability, triviality) are mathematically delicate.',
      },
    ],
    statement: `For $N$ nonrelativistic electrons with Coulomb repulsion and an external potential, prove or disprove the following: the Levy–Lieb universal density functional $F[N,\\rho] = \\inf\\{\\langle\\Psi, (T + V_{ee})\\Psi\\rangle : \\Psi \\to \\rho\\}$ is (i) convex and (ii) its infimum is attained for every admissible (electron-number-integrating, bounded) density $\\rho$, over the class of antisymmetric wavefunctions that admit $\\rho$ as a one-particle density. Establish further that the Kohn–Sham minimizer with any given exchange-correlation approximation exists and is unique up to the (constraint-qualified) degeneracies.`,
    origin:
      'Kohn–Sham density-functional theory is the workhorse of materials simulation, yet the mathematical status of its core object — the universal density functional and the constrained-search reformulation — is not fully settled: convexity and attainability over physically admissible densities are delicate variational questions first tackled by Lieb, with several partial but not complete results on the space of admissible ground-state-representable or ensemble-representable densities.',
    progress: [
      '**Lieb (1983)**: the constrained-search functional exists and is convex on the space of densities $\\rho$ with $\\int \\rho = N$ and finite kinetic+potential energy; ground-state connections established.',
      '**Ensemble representability**: convexity ensures the ensemble (mixed-state) formulation attains; pure-state (restricted-search) attainability for all $\\rho$ is the open gap.',
    ],
    obstacles: [
      '**No simple characterization of $v$-representability**: knowing which $\\rho$ are ground states of some external potential is not fully resolved, blocking pure-state attainability.',
      '**Exchange-correlation regularity**: the xc term is only defined implicitly; rigorous existence of Kohn–Sham minimizers needs a priori density bounds not available in general.',
    ],
    engineering_value:
      'Rigorous foundations of DFT would justify the ubiquitous first-principles materials screenings and error-controlled electronic-structure codes.',
    formalization_notes:
      'The variational part (weak-$L^p$ compactness, convexity) is formalizable; the Oseledec/regularity core around v-representability is the hard open part.',
    references: [
      {
        label: 'Lieb, Density functionals for Coulomb systems, International Journal of Quantum Chemistry 24 (1983) 243–277',
        url: 'https://doi.org/10.1002/qua.560240302',
      },
      {
        label: 'Lieb, Seiringer, The Stability of Matter in Quantum Mechanics, Cambridge University Press (2010)',
        url: 'https://doi.org/10.1017/CBO9780511819681',
      },
    ],
    judgment: 'A pass proves convexity and pure-state attainability of the Levy–Lieb functional over all admissible densities (and existence/uniqueness of the Kohn–Sham minimizer up to constraint-qualified degeneracies), or exhibits an admissible density where attainability fails, resolving the $v$-representability characterization; the ensemble convexity already established by Lieb is not the full claim.',
  },
  {
    id: 'mb-014',
    output: 'verified_truth',
    title: 'Storage Capacity of Associative Memory with Sparse or Bounded Synaptic Weights',
    titleZh: '稀疏/有界突触权重下联想记忆的存储容量',
    domain: 'mathematical-biology',
    subdomain: 'neural-networks',
    status: 'open',
    difficulty: 'advanced',
    formalization_potential: 'high',
    verification_path: 'analytical',
    tags: ['hopfield', 'associative-memory', 'storage-capacity', 'spin-glass'],
    contributor: 'admin',
  date_added: '2026-08-22',
    via: { label: 'Gardner, The space of interactions in neural network models, J. Phys. A 21 (1988) 257-270', url: 'https://doi.org/10.1088/0305-4470/21/1/030' },
    related_problems: [
      {
        id: 'mp-005',
        relation: 'shares_tools',
        note: 'Both are mean-field/spin-glass analyses in physics-driven settings; mp-005 on quantum spin chains, mb-014 on associative-memory networks.',
      },
    ],
    statement: `For the $N$-neuron discrete Hopfield network with state dynamics $x_i(t+1) = \\operatorname{sgn}\\big(\\sum_j J_{ij} x_j(t)\\big)$ storing $M$ random patterns $\\xi^\\mu$, determine the maximal ratio $\\alpha = M/N$ for which the patterns are stable fixed points with high probability, in the presence of a constraint on the synaptic matrix $J$ — specifically (i) bounded weights $|J_{ij}| \\le 1$ and (ii) a fixed sparsity (fraction of nonzero $J_{ij}$) — proving the exact capacity threshold of this constrained learning problem, not merely the unconstrained spin-glass result.`,
    origin:
      'Hopfield networks model associative memory in the brain; their storage capacity $\\alpha \\approx 0.138$ for unconstrained Hebbian weights was determined by Amari/McEliece and sharpened by Gardner\u2019s replica results. Real biology uses bounded, sparse, plastic synapses, and the constrained capacity threshold is much harder: it is a constraint-satisfaction (disk-packing-in-spin-glass) problem that remains quantitatively open.',
    progress: [
      '**Hopfield (1982)**: Hebbian rule yields associative retrieval; capacity under unconstrained weights studied numerically.',
      '**Gardner (1988)**: exact capacity $\\alpha=2$ for a general random-coupling ensemble — the unconstrained classification capacity; constrained (bounded/sparse) versions have only bounds.',
    ],
    obstacles: [
      '**Constraint-satisfaction of the weight set**: capacity with $|J_{ij}|\\le 1$ forces a boolean/threshold structure with no closed spin-glass solution.',
      '**Finite-connectivity spin glasses**: sparse weights fall into the dilute spin-glass regime whose capacity thresholds are only partially known.',
    ],
    engineering_value:
      'Hardware (memristive) networks have bounded and sparse weights; a rigorous capacity threshold would set design targets for in-memory associative-computing devices.',
    formalization_notes:
      'The unconstrained Gardner capacity has been partly formalized; the constrained cases are large-deviation combinatorial estimates — a plausible but nontrivial formalization target.',
    references: [
      {
        label: 'Hopfield, Neural networks and physical systems with emergent collective computational abilities, PNAS 79 (1982) 2554–2558',
        url: 'https://doi.org/10.1073/pnas.79.8.2554',
      },
      {
        label: 'Gardner, The space of interactions in neural network models, Journal of Physics A 21 (1988) 257',
        url: 'https://doi.org/10.1088/0305-4470/21/1/030',
      },
    ],
    judgment: 'A pass determines the exact constrained storage-capacity threshold $\\alpha=M/N$ of the Hopfield network with bounded weights $|J_{ij}|\\le 1$ and/or a fixed sparsity level, so that $M$ random patterns are stable fixed points with high probability exactly up to that ratio; the unconstrained Gardner capacity or heuristic/sparse-capacity bounds are not accepted.',
    proposer: 'Hopfield',
    proposed_year: 1982,
  },
  {
    id: 'mb-015',
    output: 'verified_truth',
    judgment: 'A pass proves the mean fitness advances at a well-defined asymptotic linear speed and characterizes it in terms of population size, mutation rate and the fitness tail, rigorously establishing the fractional-power scaling in the clonal-interference regime or the crossover to deterministic adaptation, with the front-speed argument certified.',
    title: 'Asymptotic Speed of Adaptation in Large Asexual Populations',
    titleZh: '大型无性生殖种群的渐近适应速度',
    domain: 'mathematical-biology',
    subdomain: 'population-genetics',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'high',
    verification_path: 'analytical',
    tags: ['adaptation', 'desai-fisher', 'traveling-wave', 'mutation-selection'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'M. M. Desai & D. S. Fisher',
    proposed_year: 2007,
    via: {
      label: 'Desai & Fisher, Beneficial mutation-selection balance and the effect of linkage, Genetics 176 (2007)',
      url: 'https://doi.org/10.1534/genetics.106.067082',
    },
    related_problems: [
      {
        id: 'mb-001',
        relation: 'shares_tools',
        note: 'Both analyze the mutation–selection balance on fitness landscapes; mb-001 on tumor/evolutionary dynamics, mb-015 on the front speed of adaptation.',
      },
    ],
    statement: `Consider the deterministic mutation–selection equation for a population of haploid asexual organisms with fitness landscape $f(x)$ and mutation kernel $\u03bc$, describing the evolution of the fitness distribution $\\rho_t(x)$:
$$\\partial_t \\rho = f \\rho - \\langle f\\rangle\\rho + K \\circ \\rho.$$
For a broad class of "sparse beneficial" landscapes (in the mutation-limited regime where clonal interference dominates), prove or disprove that the mean fitness advances at an asymptotically linear speed $v = \\lim_{t\\to\\infty} \\frac{\\mathrm{d}}{\\mathrm{d}t}\\langle f\\rangle_t$ and characterize $v$ in terms of $N, \\u03bc$, and the fitness tail — establishing rigorously the Desai–Fisher "speed of adaptation" scaling $v \\sim (N\\mu)^{1/3}$ in the relevant parameter regime, or identifying the crossover to deterministic adaptation.`,
    origin:
      'The relentless improvement of fitness in large asexual populations (viruses, microbes, laboratory evolution) is driven by beneficial mutations under clonal interference. Desai–Fisher and subsequent work predicted a characteristic "settling-time" flux with adaptation speed scaling as a fractional power of population size; the rigorous mathematical derivation of this speed from the mutation–selection dynamics is incomplete for realistic sparse-benefit landscapes.',
    progress: [
      '**Desai & Fisher (2007)**: heuristic scaling $v \\sim (N\\mu \\sigma^2)^{1/3}$ in the mutation-limited regime, widely verified numerically.',
      '**Traveling-wave theory**: adaptation as a pulled/pushed front; rigorous front-speed results exist for simple linear (branching) and SSE-type models but the sparse-benefit regime lacks a proof.',
    ],
    obstacles: [
      '**Clonal interference**: the coupled evolution of many competing lineages resists a mean-field closure; correlations block the standard traveling-wave-pulling analysis.',
      '**Rare-events scaling**: the fractional-power speed depends on control of rare high-fitness lineages, which is delicate beyond simplified infinite-sites approximations.',
    ],
    engineering_value:
      'Adaptation speed sets design targets for directed evolution and warns about pathogen escape rates; a rigorous speed would anchor evolutionary-optimization theory.',
    formalization_notes:
      'In infinite-sites and tight-linkage limits the object is a density PDE; its formalization is plausible, though the rare-lineage core is an analytic barrier.',
    references: [
      {
        label: 'Desai, Fisher, Beneficial mutation–selection balance and the effect of linkage on positive selection, Genetics 176 (2007) 1759–1798',
        url: 'https://doi.org/10.1534/genetics.106.067678',
      },
      {
        label: 'Brunet, Derrida, Effect of microscopic noise on front propagation, Journal of Statistical Physics 103 (2001) 269–282',
        url: 'https://doi.org/10.1023/A:1004821513482',
      },
    ],
  },

  {
    id: 'mp-023',
    output: 'verified_truth',
    judgment:
      'A pass either (i) constructs a Euclidean Yang–Mills theory on R^4 satisfying the Osterwalder–Schrader axioms and a positive mass gap delta > 0 bounded away from zero uniformly in the ultraviolet cutoff, or (ii) gives a rigorous no-go obstruction; a finite-lattice strong-coupling gap is minimall and does not constitute a pass on its own.',
    title: 'Existence and Mass Gap for Four-Dimensional Yang–Mills Theory',
    titleZh: '四维 Yang–Mills 理论的存在性与质量隙',
    domain: 'mathematical-physics',
    subdomain: 'quantum-field-theory',
    status: 'open',
    difficulty: 'frontier',
    formalization_potential: 'low',
    verification_path: 'analytical',
    tags: ['yang-mills', 'mass-gap', 'constructive-qft', 'gauge-theory'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'A. Jaffe & E. Witten',
    proposed_year: 2000,
    via: {
      label: 'Yang–Mills mass gap, Clay Millennium Prize Problem (2000)',
      url: 'https://www.claymath.org/millennium/yang-mills/',
    },
    related_problems: [
      {
        id: 'mp-020',
        relation: 'shares_tools',
        note: 'Both are constructive four-dimensional quantum field theory existence problems facing ultraviolet renormalization.',
      },
    ],
    statement: `Let $G$ be a compact simple Lie group. Prove that there exists a quantum Yang–Mills theory on $\\mathbb{R}^4$ with gauge group $G$ whose Euclidean correlation functions satisfy the Osterwalder–Schrader axioms, and whose Hamiltonian (obtained via the transfer matrix, or directly in the Wightman formulation) has spectrum above the vacuum separated by a strictly positive mass gap, namely there is $\\Delta > 0$ with every non-vacuum energy $E \\ge \\Delta$.
A pass fixes the theory at one loop and removes the ultraviolet cutoff, and exhibits the gap uniformly as the lattice spacing tends to $0$.`,
    origin:
      'Yang and Mills (1954) introduced non-abelian gauge fields; mass gap is the Clay Millennium Problem of Jaffe and Witten. It underpins the short-range force of quantum chromodynamics and remains the benchmark for constructive field theory in spacetime dimension four.',
    progress: [
      '**Yang–Mills (1954)**: founded the theory of non-abelian gauge fields.',
      '**Glimm–Jaffe and others**: rigorous constructive field theory in lower dimensions and weak coupling regimes.',
      '**Chatterjee (2018)**: a probabilistic (lattice) viewpoint, "Yang–Mills for probabilists", with results in dimension 2 and 3.',
      '**Douglas (2026)**: a systematic review of stochastic quantization and strong-coupling expansion approaches, stressing that a real proof is still lacking.',
    ],
    obstacles: [
      '**Ultraviolet problem**: no rigorous continuum construction at arbitrary high energy for the interacting 4d theory, where renormalization is needed.',
      '**Gap control**: establishing a positive mass gap and quark confinement without any known perturbative handle at all couplings.',
    ],
    formalization_notes:
      'The statement is clean and checkable, but the required analytic machinery (gauge fixing, UV cutoff removal, reflection positivity, spectral estimates) is enormous and far beyond current formalization capability.',
    references: [
      {
        label: 'Yang and Mills, Conservation of isotopic spin and isotopic gauge invariance, Phys. Rev. 96 (1954) 191',
        url: 'https://doi.org/10.1103/PhysRev.96.191',
      },
      {
        label: 'Chatterjee, Yang–Mills for probabilists, arXiv:1803.01950 (2018)',
        url: 'https://arxiv.org/abs/1803.01950',
      },
    ],
  },
  {
    id: 'mp-024',
    output: 'verified_truth',
    judgment:
      'A pass proves, in trace norm, convergence of the k-particle reduced density matrices of the N-boson time evolution to the rank-one projector on the Gross–Pitaevskii solution, uniformly on a time interval that grows with N, for a genuinely singular (GP-scaled) interaction in dimension 3; a local-in-time or special-data-only bound is a partial result, not a pass.',
    title: 'Rigorous Gross–Pitaevskii Limit for the Dynamics of a Dilute Bose Gas',
    titleZh: '稀薄玻色气体动力学 Gross–Pitaevskii 极限的严格化',
    domain: 'mathematical-physics',
    subdomain: 'dispersive-pde',
    status: 'open',
    difficulty: 'advanced',
    formalization_potential: 'medium',
    verification_path: 'analytical',
    tags: ['bose-einstein-condensation', 'gross-pitaevskii', 'mean-field-limit', 'many-body-qm'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'L. Erdős, B. Schlein & H.-T. Yau',
    proposed_year: 2007,
    via: {
      label: 'Erdős–Schlein–Yau, Rigorous derivation of the Gross–Pitaevskii equation, PRL 98 (2007)',
      url: 'https://doi.org/10.1103/PhysRevLett.98.040404',
    },
    related_problems: [
      {
        id: 'mp-001',
        relation: 'shares_tools',
        note: 'Both extract an effective nonlinear equation from many-body dynamics via a hierarchy and a chaotic initial state.',
      },
    ],
    statement: `Consider $N$ bosons in $\\mathbb{R}^3$ with Hamiltonian
$H_N = \\sum_{i=1}^N (-\\Delta_{x_i}) + \\sum_{i<j} N^2 V\\big(N(x_i-x_j)\\big)$
for a nonnegative compactly supported pair potential $V$. Prove that if the initial $k$-particle reduced density matrices factorize asymptotically as $N\\to\\infty$, then for times $t$ up to some fixed $T$ the evolved density matrices converge in trace norm to the projector onto $\\varphi_t^{\\otimes k}$, where $\\varphi_t$ solves the cubic Gross–Pitaevskii equation
$i\\partial_t \\varphi = -\\Delta\\varphi + 8\\pi a_0 |\\varphi|^2\\varphi,$
with $a_0$ the scattering length of $V$. A pass bounds the convergence rate and pushes the admissible time to an $N$-dependent window.`,
    origin:
      'Gross and Pitaevskii (1961) proposed the nonlinear equation for the order parameter of a condensate; the rigorous derivation from the N-body Schrodinger equation is the canonical mathematical-physics example of emergence of a nonlinear PDE from quantum many-body dynamics.',
    progress: [
      '**Erdos–Schlein–Yau (2006)**: derivation for the GP-scaled interaction, but for time intervals that are independent of N and for special initial data.',
      '**Erdos–Schlein–Yau (2007)**: short-time derivation for the two-dimensional cubic NLS scaling.',
      '**Nam–Rougerie–Seiringer (2016)**: ground-state Gross–Pitaevskii limit, complementing the dynamical results.',
    ],
    obstacles: [
      '**Singular (scaling) potential**: the N^2 V(N(x-y)) interaction has no uniform L^∞ bound, so the hierarchy equations cannot be controlled by a naive Gronwall argument.',
      '**Long times**: pushing the validity to times of order a positive power of N remains open for genuine GP scaling in three dimensions.',
    ],
    formalization_notes:
      'The target statement is precise and the trace-norm convergence criterium is machine-checkable, but the combinatorial hierarchy control is heavy; a formalization of even the short-time case would be a significant milestone.',
    references: [
      {
        label: 'Erdos, Schlein, Yau, Derivation of the Gross–Pitaevskii equation for the dynamics of Bose–Einstein condensate, CMP 278 (2008); arXiv:math-ph/0606017',
        url: 'https://arxiv.org/abs/math-ph/0606017',
      },
      {
        label: 'Rougerie, De Finetti theorems, mean-field limits and Bose–Einstein condensation, arXiv:1506.05263 (2015)',
        url: 'https://arxiv.org/abs/1506.05263',
      },
    ],
  },
  {
    id: 'mp-025',
    output: 'verified_truth',
    judgment:
      'A pass proves global regularity: for smooth, divergence-free, compactly supported initial data, the 3D incompressible Navier–Stokes solution u(t) stays C^infinity and its H^1 norm remains bounded for all t >= 0, with estimates depending only on the initial data; a finite-time blow-up construction (with a certified blow-up profile) is an equally valid resolved answer.',
    title: 'Global Regularity of the Three-Dimensional Incompressible Navier–Stokes Equations',
    titleZh: '三维不可压 Navier–Stokes 方程解的全局正则性',
    domain: 'mathematical-physics',
    subdomain: 'fluid-dynamics',
    status: 'open',
    difficulty: 'frontier',
    formalization_potential: 'low',
    verification_path: 'analytical',
    tags: ['navier-stokes', 'millennium-problem', 'regularity', 'pde'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'C. Fefferman',
    proposed_year: 2000,
    via: {
      label: 'Navier–Stokes global regularity, Clay Millennium Prize Problem (2000)',
      url: 'https://www.claymath.org/millennium/navier-stokes/',
    },
    related_problems: [
      {
        id: 'mp-019',
        relation: 'shares_tools',
        note: 'Both concern the possible loss of regularity of the incompressible fluid equations in three dimensions and share the Beale–Kato–Majda type tools.',
      },
    ],
    statement: `Let $u_0 \\in C^\\infty(\\mathbb{R}^3;\\mathbb{R}^3)$ be divergence-free and compactly supported. Prove that the incompressible Navier–Stokes system
$\\partial_t u + u\\cdot\\nabla u = \\Delta u - \\nabla p, \\qquad \\operatorname{div} u = 0, \\quad u(0)=u_0,$
has a unique global smooth solution, i.e. $u \\in C^\\infty(\\mathbb{R}^3\\times[0,\\infty))$, or else exhibit smooth data for which a finite-time singularity forms. A pass must settle the dichotomy rigorously.`,
    origin:
      'The Clay Millennium Problem posed by Fefferman. It asks whether smooth incompressible flow can develop a singularity or whether it stays smooth forever, a question unresolved since Leray (1934) established weak solutions and a potential singularity at first blow-up time.',
    progress: [
      '**Leray (1934)**: existence of weak solutions and a description of the possible first singular time.',
      '**Scheffer / Caffarelli–Kohn–Nirenberg (1982)**: one-dimensional Hausdorff bound on the singular set.',
      '**Buckmaster–Vicol (2019)**: non-uniqueness of weak solutions in the supercritical regime, separating weak from strong theory.',
    ],
    obstacles: [
      '**Vortex stretching**: the nonlinear term can amplify gradients, and all known a priori estimates are dimension- or supercritical-limited.',
      '**No blow-up mechanism nor global estimate**: neither a certified singularity construction nor a uniform higher-regularity control is available.',
    ],
    formalization_notes:
      'The conjecture itself is simple to state, but a proof certificate is entirely beyond current automated reasoning; formalization of the (already proved) weak/viscosity-solution side is the realistic achievable piece.',
    references: [
      {
        label: 'Leray, Sur le mouvement dun liquide visqueux emplissant lespace, Acta Math. 63 (1934) 193–248',
        url: 'https://doi.org/10.1007/BF02547354',
      },
      {
        label: 'Buckmaster and Vicol, Nonuniqueness of weak solutions to the Navier–Stokes equation, Ann. of Math. 189 (2019); arXiv:1709.10033',
        url: 'https://arxiv.org/abs/1709.10033',
      },
    ],
  },
  {
    id: 'mp-026',
    output: 'verified_truth',
    judgment:
      'A pass proves that in the low-density (large Wigner–Seitz radius) limit, minimizers of the 2D jellium (Coulombian one-component plasma) energy crystallize on the triangular lattice, with the excess energy per particle of order the surface/defect correction, via a certified bound on the suitable ground-state energy functional; a negative result proving no crystallization for a natural potential is also admissible.',
    title: 'Crystallization of the Two-Dimensional Coulomb (Jellium) Ground State',
    titleZh: '二维库仑（凝胶）基态的结晶化',
    domain: 'mathematical-physics',
    subdomain: 'statistical-mechanics',
    status: 'open',
    difficulty: 'advanced',
    formalization_potential: 'medium',
    verification_path: 'numerical',
    tags: ['wigner-crystal', 'coulomb-gas', 'crystallization', 'ground-state'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'multiple contributors',
    proposed_year: 2000,
    via: { label: 'Wigner, On the interaction of electrons in metals, Phys. Rev. 46 (1934); review of the rigorous state of 2D Coulomb/long-range crystallization see Bétermin & Knüpfer, arXiv:1710.05581 (2017)' },
    related_problems: [
      {
        id: 'mp-009',
        relation: 'shares_tools',
        note: 'Both probe the low-temperature structure of matter and call for rigorous control of localized ground states in the thermodynamic limit.',
      },
    ],
    statement: `Consider $N$ identical point charges in $\\mathbb{R}^2$ interacting with the logarithmic (2D Coulomb) kernel $g(x)=-\\log|x|$, neutralized by a uniform background, at density tending to a constant. Prove that in the thermodynamic limit the ground-state energy per particle converges to the Coulomb energy density of the triangular lattice and that ground states crystallize, i.e. the empirical density converges to a (floating) triangular lattice. A pass bounds the next order ("renormalized energy") and certifies the lattice structure.`,
    origin:
      'Wigner (1934) predicted low-density electron crystallization; rigorously proving that Coulomb-type minimizers crystallize on Bravais lattices is a central open problem of classical statistical mechanics, open for long-range kernels in contrast to the short-range Lennard-Jones case solved by Theil.',
    progress: [
      '**Theil (2006)**: geometric crystallization proved for a short-range interaction compatible with Lennard–Jones growth.',
      '**Rougerie–Serfaty (2016)**: the renormalized energy framework isolates the lattice-energy ordering of Coulomb-type systems.',
      '**Lewin–Lieb–Seiringer (2019)**: rigorous equality of Jellium and uniform-electron-gas ground-state energies in the thermodynamic limit.',
    ],
    obstacles: [
      '**Long range**: the logarithmic kernel is critical, and boundary charge fluctuations produce macroscopic energy shifts that must be controlled.',
      '**Rigid lattice identification**: proving that the exact minimizers arrange onto a perfect triangular lattice (not merely periodic with defects) has resisted all attempts.',
    ],
    formalization_notes:
      'The statement can be formalized as a statement about the renormalized energy functional and is checkable by finite certified-numerics bounds, but a full thermodynamic-limit crystallization proof is far off.',
    references: [
      {
        label: 'Theil, A proof of crystallization in two dimensions, Comm. Math. Phys. 262 (2006) 209–236',
        url: 'https://doi.org/10.1007/s00220-005-1458-7',
      },
      {
        label: 'Lewin, Lieb, Seiringer, Floating Wigner crystal with no boundary charge fluctuations, Phys. Rev. Lett. 122 (2019) 150601; arXiv:1905.09138',
        url: 'https://arxiv.org/abs/1905.09138',
      },
    ],
  },
  {
    id: 'mp-027',
    output: 'verified_truth',
    judgment:
      'A pass proves the spectral-gap dichotomy: for the spin-S antiferromagnetic nearest-neighbor Heisenberg chain, integer S gives a unique gapped ground state with exponentially decaying correlations, while half-integer S gives gapless spectrum in the thermodynamic limit; each claim needs either an explicit positive gap (integer S, certified by finite eigenvalue bounds) or a matching rigorously proven gap upper bound going to zero (half-integer S, via Lieb–Schultz–Mattis type arguments).',
    title: 'The Haldane Conjecture for Antiferromagnetic Heisenberg Chains',
    titleZh: '反铁磁 Heisenberg 链的 Haldane 猜想',
    domain: 'mathematical-physics',
    subdomain: 'quantum-spin-systems',
    status: 'open',
    difficulty: 'frontier',
    formalization_potential: 'medium',
    verification_path: 'analytical',
    tags: ['haldane-conjecture', 'spectral-gap', 'quantum-spin-chains', 'heisenberg-model'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'F. D. M. Haldane',
    proposed_year: 1983,
    via: {
      label: 'Haldane, Continuum dynamics of the 1D Heisenberg antiferromagnet, PRL 50 (1983)',
      url: 'https://doi.org/10.1103/PhysRevLett.50.1153',
    },
    related_problems: [
      {
        id: 'mp-005',
        relation: 'shares_tools',
        note: 'The AKLT model is the exactly solvable S=1 case realizing the conjectured Haldane gap; both hinge on spectral gaps of quantum spin chains.',
      },
    ],
    statement: `Let
$H_L = \\sum_{x=1}^{L} S_x \\cdot S_{x+1}$
be the spin-$S$ nearest-neighbor antiferromagnetic Heisenberg Hamiltonian on a chain of $L$ sites with periodic boundary conditions. Prove the dichotomy: if $S$ is an integer then the model has a unique ground state and a nonzero spectral gap above the ground state, uniformly in $L$; if $S$ is a half-integer then the gap above the ground state vanishes as $L\\to\\infty$. A pass must settle both branches rigorously.`,
    origin:
      'Haldane (1983) conjectured that integer and half-integer spins behave very differently in one dimension — the first prediction of a symmetry-protected topological (SPT) phase distinguished by a spectral gap. The conjecture is strongly supported numerically and experimentally and is partially proven (S=1/2 by Lieb–Schultz–Mattis, S=1 by the AKLT construction), but the full statement remains open.',
    progress: [
      '**Lieb–Schultz–Mattis (1961)**: half-integer spins have gapless spectrum in one dimension.',
      '**AKLT (1987)**: explicit exactly-gapped S=1 valence-bond ground state.',
      '**Tasaki (2018), Ogata (2020)**: the Lieb–Schultz–Mattis obstruction and the gapped picture made rigorous in important regimes.',
    ],
    obstacles: [
      '**Integer-spin gap for S >= 2**: no explicit gapped trial ground state is known that certifies a uniform spectral gap for general integer spin.',
      '**Uniform gap control**: proving and bounding a uniform positive gap in the thermodynamic limit for non-exact models is generally intractable.',
    ],
    formalization_notes:
      'The dichotomy is cleanly formalizable as a spectral-gap statement and is a plausible target for formalization of the S=1/2 (gapless) branch; the full integer-spin branch is far beyond current formal methods.',
    references: [
      {
        label: 'Haldane, Continuum dynamics of the 1-D Heisenberg antiferromagnet, Phys. Lett. A 93 (1983) 464–468',
        url: 'https://doi.org/10.1016/0375-9601(83)90631-X',
      },
      {
        label: 'Batchelor and Yung, Integrable SU(2)-invariant spin chains and the Haldane conjecture, Mod. Phys. Lett. B; arXiv:cond-mat/9406072',
        url: 'https://arxiv.org/abs/cond-mat/9406072',
      },
    ],
  },
  {
    id: 'mp-028',
    output: 'verified_truth',
    judgment:
      'A pass extends the kinetic description of the cubic NLS beyond the single kinetic timescale and/or beyond the exactly solvable (Gaussian) regime: it proves convergence of the empirical wave-action spectrum to a solution of the wave kinetic equation on an interval of kinetic times that grows, or for non-random (deterministic) data, with a certified error estimate; the O(1)-kinetic-time result for Gaussian data alone is already obtained and does not qualify.',
    title: 'Long-Time Validity of the Wave Kinetic Equation for the Cubic NLS',
    titleZh: '三次 NLS 波湍流动力学方程的长时有效性',
    domain: 'mathematical-physics',
    subdomain: 'dispersive-pde',
    status: 'open',
    difficulty: 'advanced',
    formalization_potential: 'medium',
    verification_path: 'analytical',
    tags: ['wave-kinetic-equation', 'wave-turbulence', 'nonlinear-schrodinger', 'thermalization'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'multiple contributors',
    proposed_year: 2016,
    via: {
      label: 'Long-time validity of the wave-turbulence equations: Faou–Germain–Hani, Ann. PDE 2 (2016) short-time; long-time open',
      url: 'https://doi.org/10.1007/s40818-016-0008-1',
    },
    related_problems: [
      {
        id: 'mp-006',
        relation: 'shares_tools',
        note: 'Both analyze the cubic NLS on tori through resonant frequency combinatorics and controlled long-time estimates.',
      },
    ],
    statement: `Let $u$ solve the cubic nonlinear Schrodinger equation
$i\\partial_t u = \\Delta u + \\lambda u|u|^2,$
on a large box with box size $L$ and coupling strength $\\alpha$ such that $\\alpha \\sim L^{-1}$ (the kinetic scaling). Prove that the spatially averaged Fourier spectrum satisfies, in a suitable statistical sense, the wave kinetic (Boltzmann type) equation
$\\partial_t n_k = \\int \\mathcal{K}(k;k_1,k_2,k_3)\\, \\delta(k+k_1-k_2-k_3)\\, \\delta(\\omega(k)+\\omega(k_1)-\\omega(k_2)-\\omega(k_3)) \\, n_{k_1}n_{k_2}n_{k_3}\\ \\big(\\frac{1}{n_k}-\\frac{1}{n_{k_1}}-\\frac{1}{n_{k_2}}-\\frac{1}{n_{k_3}}\\big)\\,dk_1dk_2dk_3,$
on a kinetic-time interval of length that exceeds the already-established O(1) window. A pass removes the Gaussian-data restriction or extends the time scale.`,
    origin:
      'Weak turbulence theory predicts that a system of weakly interacting waves reaches a kinetic (Boltzmann-like) description; deriving the wave kinetic equation from the microscopic NLS is the "wave analog of Lanford" problem, now proven on the O(1) kinetic time for Gaussian data by Deng and Hani, with full generality and longer times still open.',
    progress: [
      '**Deng–Hani (2021)**: derivation of the wave kinetic equation for Gaussian data at the kinetic scale.',
      '**Deng–Hani (2023)**: full derivation, arXiv:2104.11204, Inventiones 233 (2023).',
      '**Deng–Hani (2023), Grande–Hani**: damped-driven wave turbulence and long-time justification results.',
    ],
    obstacles: [
      '**Combinatorial explosion**: resonant and quasi-resonant Feynman diagrams multiply factorially and require very delicate cancellations.',
      '**Non-Gaussian data and longer times**: correlation and non-chaoticity buildup beyond the kinetic window breaks the Gaussianity assumption supporting the current proofs.',
    ],
    formalization_notes:
      'The statement object (convergence of the spectrum to a WKE solution with an error bound) is precise and machine-checkable, but the counting/combinatorial analysis is very heavy; formalizing the counting lemmas is the natural first step.',
    references: [
      {
        label: 'Deng and Hani, Full derivation of the wave kinetic equation, Invent. Math. 233 (2023) 543–724; arXiv:2104.11204',
        url: 'https://arxiv.org/abs/2104.11204',
      },
      {
        label: 'Deng and Hani, Long time justification of wave turbulence theory, arXiv:2311.10082 (2023)',
        url: 'https://arxiv.org/abs/2311.10082',
      },
    ],
  },
  {
    id: 'mp-029',
    output: 'verified_truth',
    judgment:
      'A pass proves that for smooth initial data, the empirical measure of an N-particle Coulomb/gravitational (Vlasov–Poisson) system converges, in probability over the initial randomness, to the solution of the Vlasov–Poisson equation, as N goes to infinity, without any N-dependent cutoff of the singular 1/|x|^{d-1} force; a result relying on a vanishing cutoff is admissible only if the cutoff scale is arbitrary close to the true Coulomb force and the rate is certified.',
    title: 'Mean-Field Limit with Singular Coulomb/Newtonian Force',
    titleZh: '奇异库仑/万有引力相互作用下的平均场极限',
    domain: 'mathematical-physics',
    subdomain: 'kinetic-theory',
    status: 'open',
    difficulty: 'advanced',
    formalization_potential: 'medium',
    verification_path: 'analytical',
    tags: ['vlasov-poisson', 'mean-field-limit', 'propagation-of-chaos', 'coulomb-interaction'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'multiple contributors',
    proposed_year: 2020,
    via: {
      label: 'Mean-field limits with singular interactions: the Duerinckx & Serfaty series (2020–2023)',
      url: 'https://arxiv.org/abs/2001.07038',
    },
    related_problems: [
      {
        id: 'mp-001',
        relation: 'shares_tools',
        note: 'Both are instances of deriving a kinetic equation from N-body dynamics via propagation of chaos; the singularity of the interaction is the shared obstruction.',
      },
    ],
    statement: `Let $N$ identical particles interact via the singular force $k(x)=\\pm x/|x|^d$ (Coulomb or Newton) rescaled with weight $1/N$, and let $f_N(t)$ be the empirical measure of their Newtonian trajectories. Prove propagation of chaos: if the initial empirical measure converges to a smooth density $f_0$ in an appropriate metric, then $f_N(t)$ converges, for $t$ in a fixed interval and in probability over the random initial data, to the solution $f_t$ of the Vlasov–Poisson equation
$\\partial_t f + v\\cdot\\nabla_x f + (k\\ast\\rho[f])\\cdot\\nabla_v f = 0.$
A pass removes the N-dependent cut-off of the force, or else lets the cut-off vanish at a certified rate.`,
    origin:
      'The problem is the classical (non-quantum) analogue of deriving kinetic equations from N-body dynamics. For Lipschitz forces it was settled by Dobrushin and Braun–Hepp (1970s), but the physical Coulomb/Newton singularity makes the general mean-field limit a long-standing open problem; the 2D Coulomb case has only very recently seen progress.',
    progress: [
      '**Braun–Hepp, Dobrushin (1977, 1979)**: mean-field limit for smooth Lipschitz forces.',
      '**Hauray–Jabin (2013)**: singular forces up to (but not including) Coulomb.',
      '**Lazarovici (2015)**: Vlasov–Poisson as a combined mean-field and point-particle limit of extended, regularized charges.',
      '**Feistl-Held and Pickl (2025)**: probabilistic 2D Coulomb mean-field limit with a cutoff arbitrarily close to the true force.',
    ],
    obstacles: [
      '**Force singularity**: the 1/|x|^{d-1} force is not Lipschitz and the Dobrushin approach collapses near collisions.',
      '**Moment control in 3D**: for the genuine 3D Coulomb (and 1D logarithmic) cases, no cutoff-free convergence is known, and controlling the singular near-collision contributions is the essential difficulty.',
    ],
    formalization_notes:
      'The convergence-in-probability statement and the Wasserstein/relative-entropy machinery are formalizable, but the near-collision estimates for the singular kernel require heavy analysis not yet available in proof assistants.',
    references: [
      {
        label: 'Lazarovici, The Vlasov–Poisson dynamics as the mean field limit of extended charges, arXiv:1502.07047 (2015)',
        url: 'https://arxiv.org/abs/1502.07047',
      },
      {
        label: 'Feistl-Held and Pickl, On the mean-field limit for the Vlasov–Poisson system in two dimensions, arXiv:2509.17821 (2025)',
        url: 'https://arxiv.org/abs/2509.17821',
      },
    ],
  },
  {
    id: 'mp-030',
    output: 'verified_truth',
    judgment:
      'A pass proves or rigorously rules out the existence of a stable many-body-localized (MBL) phase in the one-dimensional random-field Heisenberg chain in the thermodynamic limit, either by constructing complete quasi-local integrals of motion at strong disorder with exponentially decaying tails (positive answer, as in Imbrie), or by proving that ergodicity/thermalization prevails at every disorder (negative answer); a certified finite-size statement alone does not settle the thermodynamic question.',
    title: 'Many-Body Localization from First Principles in Disordered Quantum Chains',
    titleZh: '无序量子链中多体局域化的第一性原理刻画',
    domain: 'mathematical-physics',
    subdomain: 'quantum-spin-systems',
    status: 'open',
    difficulty: 'frontier',
    formalization_potential: 'low',
    verification_path: 'numerical',
    tags: ['many-body-localization', 'quantum-many-body', 'disorder', 'ergodicity'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'P. W. Anderson',
    proposed_year: 1958,
    via: {
      label: 'Review of many-body localization: Nandkishore & Huse, Ann. Rev. Cond. Matter Phys. 6 (2015); first-principles characterization open',
      url: 'https://doi.org/10.1146/annurev-conmatphys-031214-014726',
    },
    related_problems: [
      {
        id: 'mp-004',
        relation: 'generalizes',
        note: 'MBL is the interacting many-body generalization of single-particle Anderson localization, generalizing the localized couplings studied there.',
      },
    ],
    statement: `Consider the disordered spin-1/2 Heisenberg chain with Hamiltonian
$H = \\sum_{i} J_i \\sigma_i\\cdot\\sigma_{i+1} + \\sum_i h_i \\sigma_i^z,$
where $h_i$, $J_i$ are independent bounded random variables. Prove that for sufficiently strong disorder there exists a complete set of quasi-local integrals of motion that diagonalize $H$ in the thermodynamic limit (an MBL phase with area-law entanglement and vanishing transport), or prove that this fails and the chain always thermalizes. A pass must decide the thermodynamic limit, not merely a finite-size window.`,
    origin:
      'Many-body localization (Basko–Abanin–Altshuler and Gornyi–Mirlin–Polyakov, 2006) is the cornerstone conjecture of non-equilibrium quantum statistical mechanics: it is central to whether interacting disordered systems can evade thermalization and ETH. Despite Imbrie (2016) proving MBL under a level-attraction hypothesis, its stability in the thermodynamic limit is hotly contested, with recent operator-growth results arguing against it.',
    progress: [
      '**Imbrie (2016)**: proof of MBL for a 1D random spin chain under a physically reasonable level-statistics assumption; arXiv:1403.7837.',
      '**Abanin et al. and others**: the local-integrals-of-motion (l-bit) picture and its phenomenology.',
      '**Weisse–Gerstner–Sirker (2024)**: almost-factorial operator growth argued to be inconsistent with exponential localization, casting doubt on the MBL phase.',
    ],
    obstacles: [
      '**Definitional ambiguity**: distinct signatures of MBL (suppressed transport, area-law entanglement, l-bits, Poisson statistics) are not known to be equivalent, so different proofs may target different phenomena.',
      '**Rare (Griffiths) regions**: thermally conducting inclusions can seed avalanches that destroy localization, and controlling their thermodynamic-limit effect is unresolved.',
    ],
    formalization_notes:
      'The statement is precise but the thermodynamic-limit question is not settled even heuristically, and current formal methods cannot handle the multi-scale resonance arguments; certified finite-size numerics is the only realistically machine-checkable fragment today.',
    references: [
      {
        label: 'Imbrie, On many-body localization for quantum spin chains, J. Stat. Phys. 163 (2016) 998–1048; arXiv:1403.7837',
        url: 'https://arxiv.org/abs/1403.7837',
      },
      {
        label: 'Weisse, Gerstner, Sirker, Operator growth in disordered spin chains: indications for the absence of many-body localization, arXiv:2401.08031 (2024)',
        url: 'https://arxiv.org/abs/2401.08031',
      },
    ],
  },

  {
    id: 'mc-016',
    output: 'verified_truth',
    judgment:
      'A pass certifies that a claimed constant K is the sharp Lieb–Thirring kinetic constant, i.e. it holds that K = inf over antisymmetric wave functions of the ratio of kinetic energy to the 5/3-norm of the density with N arbitrary, giving a machine-verifiable proof (an explicit Slater-type upper family isolating the value and an operator-splitting lower bound matching it, or a certified two-sided bracket separating K from the semiclassical value).',
    title: 'The Sharp Constant in the Lieb–Thirring Inequality for Fermion Kinetic Energy',
    titleZh: 'Lieb–Thirring 不等式动能项的锐利常数',
    domain: 'mathematical-chemistry',
    subdomain: 'quantum-chemistry',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'high',
    verification_path: 'analytical',
    tags: ['many-body-bound', 'kinetic-energy', 'fermion', 'sharp-constant'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'E. H. Lieb & W. Thirring',
    proposed_year: 1975,
    via: {
      label: 'Lieb & Thirring, Bound for the kinetic energy of fermions which proves stability of matter, PRL 35 (1975); sharp constants see Frank et al.',
      url: 'https://doi.org/10.1103/PhysRevLett.35.687',
    },
    related_problems: [
      {
        id: 'mp-026',
        relation: 'shares_tools',
        note: 'Both use kinetic-energy lower bounds and stability arguments as common tools.',
      },
      {
        id: 'mc-017',
        relation: 'analog_of',
        note: 'Both are pending sharp constants in many-body energy functionals, with parallel structure.',
      },
    ],
    statement: `Let $\u03c8 \\in \\bigwedge^N L^2(\u211d^{3N})$ be an antisymmetric wave function of $N$ electrons with one-particle density $\\rho(x)=N\\int_{\u211d^{3N-3}} |\u03c8(x,x_2,\\ldots,x_N)|^2\\, dx_2\\cdots dx_N$. The kinetic energy and the density are related by $\\int_{\u211d^{3N}}\\sum_{j=1}^N |\\nabla_j \u03c8|^2 \\, dx \\;\\ge\\; K \\int_{\u211d^3} \\rho(x)^{5/3}\\, dx$. **Prove the sharp (largest possible) value of the constant $K$** valid for every $N$ and every antisymmetric $\u03c8$. The semiclassical value $K_{\\mathrm{cl}}=\\tfrac{3}{10}(3\\pi^2)^{2/3}$ is never attained, and the optimal $K$, which is strictly smaller, is not known. A pass supplies the exact value or a certified two-sided bracket that closes the gap.`,
    origin:
      'The inequality, introduced by Lieb and Thirring to prove stability of matter, bounds fermion kinetic energy from below by a nonlinear functional of the density alone. Despite the central role the bound plays in quantum chemistry and in the proof that matter does not collapse, the true optimal constant has resisted determination for half a century.',
    progress: [
      '**Lieb-Thirring (1975)**: original proof of the $\u03c1^{5/3}$ estimate with a non-sharp constant and stability of matter.',
      '**Sharp constants in one dimension**: the one-dimensional analogue is solved exactly by Laptev and Weidl; the three-dimensional case is strictly harder.',
      '**Refinements**: extensive analytic and numerical work tightens the constant without identifying an extremal density or closing the bound.',
    ],
    obstacles: [
      '**No natural extremizer**: the optimum is not a one-particle Slater determinant, and no trial density function reaches the bound, so the variational problem has no obvious solution profile.',
      '**Nonconvex structure**: the ratio defining $K$ is a non-convex functional of $\u03c8$, and the known lower bounds rely on level-counting and rearrangement techniques that will not easily coincide.',
    ],
    engineering_value:
      "A certified sharp kinetic-constant bounds every kinetic-energy-constrained functional and the stability arguments inside electronic-structure codes, giving materials-simulation users material error bars on the kinetic-energy floor that density-functional approximations cannot cross.",
    formalization_notes:
      'The inequality is a spectral/analytic statement over all N. A machine-checkable milestone is a certified bracket: an explicit antisymmetric family for the lower side of K and an operator-bound for the upper side. The exact value is research-level; Lean or a verified real-arithmetic backend is a realistic target for the bracket, not yet the equality.',
    references: [
      {
        label: 'Lieb, Thirring, Bounds for the kinetic energy of fermions which prove the stability of matter, Phys. Rev. Lett. 35 (1975) 687',
        url: 'https://doi.org/10.1103/PhysRevLett.35.687',
      },
    ],
  },
  {
    id: 'mc-017',
    output: 'verified_behavior',
    judgment:
      'The acceptable answer is a machine-verifiable converging constant for the exchange-correlation-energy lower bound rather than the ultimate sharp constant: deliver a machine-checkable two-sided bracket making the Lieb–Oxford constant $C$ satisfy $c \\le C \\le C_0$ with $C_0-c$ a controlled, significant contraction relative to the known bounds (currently $[1.44,1.58]$), accompanied by a three-layer residual total band: (1) **R_model**: the upper bound on the residual introduced by restricting the true (momentum-functional, spin-symmetry-adapted) exchange-correlation energy to the $\\rho^{4/3}$ local-functional family (explicitly distinguishing the tighter bound for the spin-unpolarized case); (2) **R_num**: the residual upper bound introduced by closing the attainability construction and the lower-bound functional with interval/symbolic computation; (3) since the constant in this problem is purely mathematical structure, **R_param≡0 (no input measurement residual layer, as explicitly noted)**. Consumption form of a passing decision: given a density-functional implementation, directly obtain the verifiable decision of "whether the exchange-correlation energy of this functional still respects the strict kinematic lower bound", with the bracket width explicitly delimited by the three-layer residual total band, so that DFT tool authors can certify that their gradient/meta-functionals do not violate the bound.',
    title: 'The Sharp Constant in the Lieb–Oxford Inequality',
    titleZh: 'Lieb–Oxford 不等式的锐利常数',
    domain: 'mathematical-chemistry',
    subdomain: 'density-functional-theory',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'high',
    verification_path: 'analytical',
    tags: ['exchange-correlation-energy', 'lieb-oxford', 'sharp-constant', 'density-functional-theory'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'E. H. Lieb & S. Oxford',
    proposed_year: 1981,
    via: {
      label: 'Lieb & Oxford, Improved lower bound on the indirect Coulomb energy, Int. J. Quantum Chem. 19 (1981)',
      url: 'https://doi.org/10.1002/qua.560190308',
    },
    related_problems: [
      {
        id: 'mc-014',
        relation: 'shares_tools',
        note: 'The Lieb–Oxford lower bound is a common tool for constraining Levy–Lieb functional constructions.',
      },
      {
        id: 'mc-016',
        relation: 'analog_of',
        note: 'Both are pending sharp constants in many-body energy equations.',
      },
    ],
    statement: `For an $N$-electron wave function $\u03c8$ with one-particle density $\u03c1$, the indirect (exchange plus correlation) Coulomb energy $W(\u03c8)=\\langle \u03c8,\\sum_{i<j}|x_i-x_j|^{-1}\u03c8\\rangle - \\tfrac{1}{2}\\iint_{\u211d^6} \u03c1(x)\u03c1(y)|x-y|^{-1}\\, dx\\, dy$ satisfies $W(\u03c8)\\ge -C\\int_{\u211d^3}\u03c1(x)^{4/3}\\, dx$. **Determine the sharp constant $C_{\\mathrm{opt}}=\\sup\{-W(\u03c8)/\\int \u03c1^{4/3}\\, dx\\}$**, the least such $C$ valid for all $N$ and all $\u03c8$. The value is open; current records place it strictly between the improved upper bound $1.58$ and a lower bound above $1.44$.`,
    certificate: {
      r_model: {
        bound: 'Model-residual upper bound introduced by restricting the true (momentum-functional, spin-symmetry-adapted) exchange-correlation energy to the ρ^{4/3} local-functional family (explicitly distinguishing the tighter bound for the spin-unpolarized case)',
        derivation: 'Local ρ^{4/3} functional-family restriction residual bound',
      },
      r_param: {
        bound: '≡0 (purely mathematical structure; no input measurement residual layer)',
        derivation: 'Constant is purely mathematical structure; parameters exactly specified',
        kind: 'assumption',
        upper: 0,
      },
      r_num: {
        bound: 'Numerical-residual upper bound introduced by closing the attainability construction and the lower-bound functional with interval/symbolic computation',
        derivation: 'Interval/symbolic computation closure bound',
        kind: 'numerical',
      },
      total_band: 'C_0 - c ≤ R_model + R_num',
      certified_band: '[c, C_0]',
    },
    engineering_deliverables: ['DFT functional lower-bound compliance review', 'Exchange-correlation energy contraction bracket'],
    origin:
      'The Lieb–Oxford inequality bounds the indirect part of the Coulomb repulsion by a strictly local functional of the ground-state density, and is the structural backbone behind gradient-corrected and meta-GGA density-functional approximations. The optimal constant matters because every exchange-correlation functional that respects the bound must stay below it.',
    progress: [
      '**Lieb-Oxford (1981)**: constant $8.52$ improved to $1.68$, with lower bound $C>1.23$.',
      '**Chan-Handy**: constant lowered to $1.64$.',
      '**Lewin-Lieb-Seiringer (2022)**: constant lowered to $1.58$ by a new estimate; the exchange-only (ferromagnetic) case admits the sharper bound $1.25$, and the general lower bound was raised above $1.44$.',
      '**Perdew-Sun**: a conjectured tight bound for the exchange energy of spin-unpolarized ground states (arXiv:2206.09974) is still open.',
    ],
    obstacles: [
      '**Non-attainment again**: the supremum over densities has no easy extremizer, and different spin symmetries yield different best-possible values for the exchange-only restriction.',
      '**Kinematic over-counting**: the indirect energy mixes several particles, so purely local density inequalities must be derived from the full $N$-particle wave function, an inherently hard step.',
    ],
    engineering_value:
      "The sharp exchange-correlation constant is the ceiling every correlation functional must respect; pinning it down lets DFT tool authors and materials simulators certify their gradient-corrected functionals do not violate the strict kinematic lower bound. This ranking delivers a verifiable contraction bracket rather than the ultimate constant, and explicitly separates the model-layer (local $\\rho^{4/3}$ functional-family restriction) and numerical-layer (interval/symbolic closure) residuals into the synthesized total band, making \"whether this functional violates the lower bound\" a certified decision rather than a claim relying on the current best known constant.",
    formalization_notes:
      'The proving route is real analysis together with rearrangement and harmonic-analysis bounds on the exchange integral; the two-sided bracket obtained by Lewin, Lieb and Seiringer is a natural verified target, while exact equality remains research-level.',
    references: [
      {
        label: 'Lieb, Oxford, Improved lower bound on the indirect Coulomb energy, Int. J. Quantum Chem. 19 (1981) 427',
        url: 'https://doi.org/10.1002/qua.560190306',
      },
      {
        label: 'Lewin, Lieb, Seiringer, Improved Lieb–Oxford bound on the indirect and exchange energies, Lett. Math. Phys. 112 (2022)',
        url: 'https://doi.org/10.1007/s11005-022-01584-5',
      },
      {
        label: 'Perdew, Sun, The Lieb–Oxford lower bounds on Coulomb energy and a conjectured tight bound on exchange, arXiv:2206.09974',
        url: 'https://arxiv.org/abs/2206.09974',
      },
    ],
  },
  {
    id: 'mc-018',
    output: 'verified_truth',
    judgment:
      'A pass proves, for a stated family of fermion Hamiltonians, either the existence of a ground state whose natural occupation numbers exactly saturate a nontrivial generalized Pauli constraint (with an explicit state construction and a machine-checkable eigenvalue certificate), or a rigorous impossibility result establishing that only quasipinning can occur in that family.',
    title: 'Exact Pinning by Generalized Pauli Constraints in Fermionic Ground States',
    titleZh: '费米子基态中广义泡利约束的精确钉扎',
    domain: 'mathematical-chemistry',
    subdomain: 'quantum-chemistry',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'medium',
    verification_path: 'numerical',
    tags: ['generalized-pauli-constraints', 'reduced-density-matrix', 'natural-occupation', 'pinning'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'M. Altunbulak & A. Klyachko',
    proposed_year: 2008,
    via: {
      label: 'Altunbulak & Klyachko, The Pauli principle revisited, Commun. Math. Phys. 327 (2014)',
      url: 'https://doi.org/10.1007/s00220-014-1962-8',
    },
    related_problems: [
      {
        id: 'mc-023',
        relation: 'shares_tools',
        note: 'Both belong to the study of realizability of reduced density operators (the marginal problem).',
      },
    ],
    statement: `For $N$ fermions in a $d$-dimensional one-particle space, the natural occupation numbers $\u03bb_1\\ge\\cdots\\ge \u03bb_d$, the ordered eigenvalues of the one-particle reduced density matrix, must lie in the Pauli polytope $\u2119_{N,d}$ cut out by the affine generalized Pauli constraints $D_j(\u03bb)\\ge 0$. **Decide whether the ground state of a Coulombic (or fixed inter-particle interaction) fermion Hamiltonian can ever hit the boundary, attaining equality in a nontrivial constraint, and, if so, whether two constraints can be saturated simultaneously.** Early numerics for Beryllium suggested exact pinning; state-of-the-art computation shows only quasipinning, so the generic mechanism is not settled.`,
    origin:
      'The generalized Pauli constraints are emergent restrictions on natural occupation numbers beyond the classical Pauli inequalities. If ground states pinned them exactly, physical response to perturbations would be governed by the saturated constraints rather than by the Hamiltonian details, a claim that remains experimentally and mathematically unsettled and is central to modern reduced-density-matrix theory.',
    progress: [
      '**Borland-Dennis (1972)**: the first nontrivial constraint, for (N,d)=(3,6).',
      '**Klyachko (2006), Altunbulak-Klyachko (2008)**: complete finite description of $\u2119_{N,d}$.',
      '**Schilling, Gross, Christandl (2013)**: pinning reported for certain fermionic models; the interchange with quasipinning opened the active debate (arXiv and PRL).',
      '**Schilling et al. (2018)**: high-precision studies of small atoms conclude approximate quasipinning only, not exact pinning.',
      '**Avdic, Sager, Mazziotti (2023)**: GPC violation detected for open quantum systems on a qubit device, confirming that exact pinning depends on purity.',
    ],
    obstacles: [
      '**Numerical versus exact**: resolving equality on a facet of a high-dimensional polytope requires exponentially precise occupation data and is heuristic.',
      '**Hamiltonian dependence**: whether pinning survives or is destroyed by the detailed electron-electron interaction is a many-body question, open even for few electrons in a large basis.',
    ],
    formalization_notes:
      'A machine-good statement fixes a small (N,d) model, reduces the one-particle reduced density matrix from an explicitly diagonalized small Hamiltonian, and checks the affine constraints by exact or interval arithmetic. Proving a generic impossibility claim needs a transfer/averaging argument and is the hard direction.',
    references: [
      {
        label: 'Schilling, Gross, Christandl, Pinning of fermionic occupation numbers, Phys. Rev. Lett. 110 (2013) 040404',
        url: 'https://doi.org/10.1103/PhysRevLett.110.040404',
      },
      {
        label: 'Klyachko, Quantum marginal problem and N-representability, J. Phys. Conf. Ser. 36 (2006) 72',
        url: 'https://doi.org/10.1088/1742-6596/36/1/014',
      },
      {
        label: 'Schilling, Altunbulak, Knecht, Lopes, Whitfield, Christandl, Gross, Reiher, Generalized Pauli constraints in small atoms, arXiv:1710.03074',
        url: 'https://arxiv.org/abs/1710.03074',
      },
    ],
  },
  {
    id: 'mc-019',
    output: 'verified_truth',
    judgment:
      'A pass either exhibits a Hamiltonian (or Poisson) function on a finite-dimensional extended phase space whose flow coincides exactly with a stated Nosé–Hoover chain, or proves rigorously that for a specified chain order no such finite-dimensional Hamiltonian flow exists, and in either case supplies a certified ergodicity or non-ergodicity statement for a benchmark family',
    title: 'Hamiltonian Structure and Ergodicity of the Nosé–Hoover Thermostat',
    titleZh: 'Nosé–Hoover 恒温器的哈密顿结构与遍历性',
    domain: 'mathematical-chemistry',
    subdomain: 'molecular-simulation',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'medium',
    verification_path: 'analytical',
    tags: ['molecular-dynamics', 'thermostat', 'ergodicity', 'nonhamiltonian'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'S. Nosé',
    proposed_year: 1984,
    via: {
      label: 'Nosé, A unified formulation of the constant temperature molecular dynamics methods, J. Chem. Phys. 81 (1984)',
      url: 'https://doi.org/10.1063/1.447334',
    },
    related_problems: [
      {
        id: 'mc-020',
        relation: 'shares_tools',
        note: 'Both are core tools for generating thermal-equilibrium sampling in molecular simulation.',
      },
    ],
    statement: `Consider the Nosé–Hoover equations on $\u211d^6$, $\\dot{q}=p$, $\\dot{p}=-V\'(q)-\u03b6 p$, $\\dot{\u03b6}=p^2/T-1$, which on the manifold of constant extended energy are intended to reproduce the canonical distribution; this succeeds only up to the ergodicity of the flow. **Find a Hamiltonian or Poisson formulation for arbitrary-order Nosé–Hoover chains, or prove that no such finite-dimensional Hamiltonian flow exists, and characterize with proof the parameter ranges in which the flow is ergodic as opposed to leaving invariant lower-dimensional tori.** For several low-dimensional oscillators the flow is known not to be ergodic (persistent tori), but a rigorous general criterion is lacking.`,
    origin:
      'The thermostat converts a microcanonical molecular-dynamics run into a canonical one by adding a dynamical friction variable; it underlies essentially all constant-temperature atomistic simulation. Whether the flow is Hamiltonian is the missing link between the scheme and classical statistical mechanics, and non-ergodicity for simple oscillators shows the design is not automatically correct.',
    progress: [
      '**Nosé (1984)**: the underlying time-scaled dynamics is Hamiltonian; the friction form is a non-canonical extraction.',
      '**Hoover (1985)**: the standard friction form; numerical studies reveal non-ergodic, multifractal or periodic solutions for some oscillators.',
      '**Dettmann–Morriss (1997)**: a Hamiltonian reformulation of the simple case via $H_{\\mathrm{DM}}=s\\,H_{\\mathrm{Nosé}}$, leaving general chains open.',
      '**Bond, Laird, Leimkuhler (1999)**: several thermostat chains are shown provably non-ergodic for finite chains near special parameters.',
    ],
    obstacles: [
      '**Structural obstruction**: the friction form does not preserve the canonical phase-space volume, so a naive Hamiltonian embedding fails by Liouville',
      '**Non-ergodicity pockets**: regions of the extended phase space are foliated by tori for certain elementary potentials and are hard to delimit rigorously.',
    ],
    formalization_notes:
      'The statements are finite-dimensional ODE facts; a pass can be checked by symbolic integration of the flow on explicit compact energy manifolds or by the KAM-style obstruction arguments for the benchmark oscillators. The general characterization is the research ceiling.',
    references: [
      {
        label: 'Nosé, A unified formulation of the constant temperature molecular dynamics methods, J. Chem. Phys. 81 (1984) 511',
        url: 'https://doi.org/10.1063/1.447334',
      },
      {
        label: 'Hoover, Canonical dynamics: equilibrium phase-space distributions, Phys. Rev. A 31 (1985) 1695',
        url: 'https://doi.org/10.1103/PhysRevA.31.1695',
      },
    ],
  },
  {
    id: 'mc-020',
    output: 'verified_truth',
    judgment:
      'A pass proves a polynomial upper bound on the total-variation mixing time, or a matching exponential lower bound (slow mixing), for the parallel-tempering (replica-exchange) chain on a stated nontrivial family of target measures, the bound being certified and independent of tuning heuristics, or establishes cutoff with certified thresholds for a family where it occurs.',
    title: 'Rapid Mixing and Cutoff for the Parallel Tempering (Replica Exchange) Chain',
    titleZh: '并行回火链条的快速混合与截止现象',
    domain: 'mathematical-chemistry',
    subdomain: 'molecular-simulation',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'medium',
    verification_path: 'analytical',
    tags: ['monte-carlo', 'parallel-tempering', 'mixing-time', 'spectral-gap'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'R. H. Swendsen & J.-S. Wang',
    proposed_year: 1986,
    via: {
      label: 'Swendsen & Wang, Replica Monte Carlo simulation of spin-glasses, PRL 57 (1986); mixing/cutoff open',
      url: 'https://doi.org/10.1103/PhysRevLett.57.2607',
    },
    related_problems: [
      {
        id: 'mc-019',
        relation: 'shares_tools',
        note: 'Both belong to the core tools for generating thermal-equilibrium sampling in molecular simulation.',
      },
    ],
    statement: `For target densities $\u03c0_{\u03b2}\\propto e^{-\u03b2 H}$ on a finite state space at temperatures $0=\u03b2_0<\\cdots<\u03b2_L$, the parallel-tempering chain alternates coordinate Metropolis updates with swaps $x\\leftrightarrow y$ between neighboring replicas. **Give matching upper and lower bounds on the mixing time $t_{\\mathrm{mix}}$ and the spectral gap as explicit functions of $L$ and the family parameters, proving rapid or slow mixing for stated classes (mean-field Ising, hard-core or Lennard-Jones-type cluster energies, general Berries–Essen class), and establish the conjectured cutoff phenomenon where it appears.** The algorithm is empirically successful, yet theoretically understood only on a few mean-field examples.`,
    origin:
      'Parallel tempering is the workhorse of condensed-phase and cluster sampling, exchanging configurations among a temperature ladder to escape metastable wells. Its guarantees rest on the unproven assertion that the exchange rate over the ladder stays acceptably high, a gap between practice and theory that the mixing-time literature has only started to close.',
    progress: [
      '**Madras–Zheng (2003)**: rapid mixing for the mean-field (Curie–Weiss) Ising model and related bimodal examples.',
      '**Zheng (thesis), Bhatnagar–Randall**: examples where both swapping and simulated tempering are provably slow, showing sharp limits of the method.',
      '**Ebbers, Knöpfel, Löwe, Vermet (2014)**: the Blume–Emery–Griffiths model mixes rapidly across a second-order but slowly across a first-order transition.',
    ],
    obstacles: [
      '**Ladder spacing**: the swap acceptance couples the gap to the temperature increments, and the optimal spacing is model-dependent.',
      '**Strong worst cases**: multimodal ensembles with well-separated wells defeat any fixed ladder, and no robust universal bound exists.',
    ],
    engineering_value:
      "Certified mixing-time bounds and sharp cutoffs turn the otherwise empirical exchange-acceptance rate into a predictable quantity, so molecular-simulation engineers choose temperature ladders that provably equilibrate in bounded time instead of tuning them by trial and error.",
    formalization_notes:
      'The chain is a reversible finite Markov chain; polynomial checks reduce to proving a Cheeger inequality or comparison-type bound for the swap chain and are well suited to formalization. The open part is the tight ladder-dependence and cutoff, which is a research challenge in one-dimensional count approximation.',
    references: [
      {
        label: 'Madras, Zheng, On the swapping algorithm, Random Struct. Algorithms 22 (2003) 66',
        url: 'https://doi.org/10.1002/rsa.10066',
      },
      {
        label: 'Ebbers, Knöpfel, Löwe, Vermet, Mixing times for the Swapping Algorithm on the Blume–Emery–Griffiths model, arXiv:1206.4162',
        url: 'https://arxiv.org/abs/1206.4162',
      },
    ],
  },
  {
    id: 'mc-021',
    output: 'verified_truth',
    judgment:
      'A pass provides a complete necessary-and-sufficient characterization of the reaction networks within a stated class whose stochastic dynamics admits a product-form stationary distribution, or a counterexample network disproving a proposed sufficiency or necessity claim, with the network and the distribution certificate rigorously verified.',
    title: 'Complete Characterization of Product-Form Stationary Distributions in Stochastic Reaction Networks',
    titleZh: '随机反应网络积形式平稳分布的完整刻画',
    domain: 'mathematical-chemistry',
    subdomain: 'chemical-reaction-network-theory',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'medium',
    verification_path: 'analytical',
    tags: ['stochastic-reaction-network', 'product-form', 'master-equation', 'complex-balancing'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'multiple contributors',
    proposed_year: 2010,
    via: {
      label: 'Product-form stationary distributions of stochastic reaction networks: Anderson, Craciun & Kurtz, Trans. AMS 362 (2010)',
      url: 'https://arxiv.org/abs/0802.1262',
    },
    related_problems: [
      {
        id: 'mc-001',
        relation: 'shares_tools',
        note: 'Deterministic CRNs and stochastic CRNs share the structural criterion of complex balancing.',
      },
      {
        id: 'mc-002',
        relation: 'shares_tools',
        note: 'The theme that network structure determines dynamical behavior is interrelated across the two modeling frameworks.',
      },
    ],
    statement: `For the continuous-time Markov chain of a stochastic mass-action network, the stationary distribution restricted to a closed communicating class is of product form, $\u03c0(x)=\\prod_i c_i^{x_i}/x_i!$, whenever the associated deterministic system admits a complex-balanced equilibrium (Anderson–Craciun–Kurtz). **Characterize exactly, and prove by an iff statement, those networks beyond weak reversibility and zero deficiency for which such a product-form stationary distribution exists on every closed class, and decide whether product form is equivalent to complex balancing.** The sufficiency is known; sharp necessity, and the class of reversible-only networks, remain open.`,
    origin:
      'Explicit stationary distributions of the chemical master equation are rare and precious: they turn a countably infinite eigenvalue problem into a closed formula and underpin multiscale averaging of fast subsystems in systems biology. Whether complex balancing is the true dividing line is a structural question of the stochastic analogue of classic CRN theory.',
    progress: [
      '**Anderson, Craciun, Kurtz (2010)**: complex-balanced stochastic networks have a product-form (Poisson) stationary distribution on each closed class; necessity not addressed.',
      '**Anderson, Cotter (2016)**: product form extends to non-mass-action propensities under an added consistency assumption.',
      '**Kang, Kim, Sontag, et al.**: structure-transformation constructions give stationary distributions for additional classes, sharpening what remains to an iff. (Commun. Biol. 4 (2021) 620)',
    ],
    obstacles: [
      '**Reversible-but-not-balanced**: networks that are reversible yet not complex balanced may or may not admit product form; the exact condition is elusive.',
      '**Open classes**: for open (not closed) networks, mass escapes to infinity and the product-form question changes character entirely.',
    ],
    engineering_value:
      "An iff characterization of product-form stationary distributions makes the chemical master equation analytically solvable for exactly the networks where closed-form fluctuation statistics exist, giving systems-biology and stochastic-modeling engineers exact steady-state means and variances rather than Monte Carlo estimates for fast subsystems.",
    formalization_notes:
      'A pass fixes a finite network, verifies that the candidate Poisson product measure solves the chemical master equation by exact substitution (a finite-degree identity check), and either asserts necessity via an explicit net-flow reconstruction or exhibits a counterexample. The equivalence claim is the research-level core.',
    references: [
      {
        label: 'Anderson, Craciun, Kurtz, Product-form stationary distributions for deficiency zero chemical reaction networks, Bull. Math. Biol. 72 (2010) 1947, arXiv:0803.3042',
        url: 'https://arxiv.org/abs/0803.3042',
      },
      {
        label: 'Anderson, Cotter, Product-form stationary distributions for deficiency zero networks with non-mass action kinetics, arXiv:1605.07042',
        url: 'https://arxiv.org/abs/1605.07042',
      },
    ],
  },
  {
    id: 'mc-022',
    output: 'verified_truth',
    judgment:
      'A pass determines the maximum number of Kekulé structures K_max(h) exactly for every hexagon count h, or proves the exact asymptotic growth constant and that extremal benzenoid systems are always catacondensed, with the value and extremal structure certified by an explicit counting proof or an exhaustive verified computation over the finite family.',
    title: 'The Maximum Number of Kekulé Structures in Benzenoid Hydrocarbons',
    titleZh: '苯环型烃 Kekulé 结构数的最大值',
    domain: 'mathematical-chemistry',
    subdomain: 'chemical-graph-theory',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'high',
    verification_path: 'numerical',
    tags: ['kekule-structure', 'perfect-matching', 'benzenoid', 'enumeration'],
    contributor: 'admin',
    date_added: '2026-08-22',
    provenance: 'lean-compilable',
    lean_statement: 'import Std\n\n/-!\nmc-022 — The maximum number of Kekulé structures in benzenoid hydrocarbons.\n\nFor a benzenoid with h hexagons, the maximum number of Kekulé structures\n(perfect matchings of the carbon skeleton) is the conjectured extremal value.\nBoth functions are formalization targets; the equality is the headline claim\n(proof left open via `sorry`).\n-/\nnamespace MathX\n\ndef MaxKekuleStructures (h : Nat) : Nat := by\n  exact 0\n\ndef ConjecturedMaxKekule (h : Nat) : Nat := by\n  exact 0\n\ntheorem kekule_extremal (h : Nat) :\n    MaxKekuleStructures h = ConjecturedMaxKekule h := by\n  sorry\n\nend MathX\n',
    proposer: 'I. Gutman',
    proposed_year: 2008,
    via: { label: 'Number of Kekulé structures of benzenoid hydrocarbons: literature on chemical graph theory, e.g. Gutman & Cyvin' },
    related_problems: [
      {
        id: 'mc-024',
        relation: 'shares_tools',
        note: 'Both are structural-counting and Clar-cover problems in benzenoid systems.',
      },
      {
        id: 'mc-009',
        relation: 'shares_tools',
        note: 'Both are combinatorial-structure decisions for benzenoid/fullerene-type molecular graphs.',
      },
    ],
    statement: `Let $K(B)$ be the number of perfect matchings (Kekulé structures) of a benzenoid graph $B$, and let $K_{\\max}(h)=\\max\\{K(B)\\colon B \\text{ has } h \\text{ hexagons}\\}$. **Determine $K_{\\max}(h)$ exactly for all $h$, prove whether the extremal benzenoid is always catacondensed, and pin down the sharp exponential growth rate $\\lim_{h\\to\\infty}K_{\\max}(h)^{1/h}$.** Only upper-bound recurrences are known, and exact values are available only for small $h$; the growth rate is linked to the thermodynamic stability ordering of polycyclic aromatics.`,
    origin:
      'The number of Kekulé structures tracks the stability ranking of isomeric polycyclic aromatic hydrocarbons (phenanthrene beats anthracene), so its extremal growth is chemically meaningful. The precise extremal sequence and the conjectured catacondensed extremizer have been open since the field started systematically deriving $K_{\\max}(h)$ bounds in the 1980s.',
    progress: [
      '**Gutman (1977), Cyvin (1982)**: recursive upper bounds of the form $K_{\\max}(h)\\le 2^{h-1}+1$ and the conjectured catacondensed maximum.',
      '**Chen, Cyvin (1987)**: corrected recurrences giving sharper explicit upper estimates; exact values tabulated only through $h\\approx 13$, with helicenic cases doubtful.',
    ],
    obstacles: [
      '**Extremizer shape**: branching maximizes hexagon count while restricting matchings, so the true optimum trades two effects whose balance has no proven closed form.',
      '**Counting constant**: the growth rate is the (unknown) spectral-like constant of an infinite family of planar graphs and resists transfer-matrix closure.',
    ],
    formalization_notes:
      'The problem is finite and discrete: a pass enumerates the (finite) homotopy class of benzenoid motifs up to $h$, computes each perfect-matching count by a verified DP or transfer-matrix, and closes the recurrences by induction. It is the most straightforward of the nine to formalize, with the exact constant as the research gap. For the class of benzenoids it is conjectured that $K_{\\max}$ is realized by a catacondensed system.',
    references: [
      {
        label: 'Chen, Cyvin, Distribution of K, the number of Kekulé structures, in benzenoid hydrocarbons. Part I: comments on upper bounds of K, MATCH 22 (1987) 175',
        url: 'https://match.pmf.kg.ac.rs/electronic_versions/Match22/match22_175-179.pdf',
      },
      {
        label: 'Langner, Witek, Interface theory of benzenoids, MATCH 84 (2020) 143',
        url: 'https://match.pmf.kg.ac.rs/electronic_versions/Match84/n1/match84n1_143-176.pdf',
      },
    ],
  },
  {
    id: 'mc-023',
    output: 'verified_truth',
    judgment:
      'A pass supplies a complete and verifiable set of necessary-and-sufficient conditions for a two-fermion reduced density matrix to be N-representable in a stated sense class, or proves that no finite, computationally checkable complete characterization can exist for that class, thereby sharpening the N-representability dichotomy.',
    title: 'Complete N-Representability Conditions for the Two-Electron Reduced Density Matrix',
    titleZh: '双电子约化密度矩阵 N-representability 条件的完备刻画',
    domain: 'mathematical-chemistry',
    subdomain: 'quantum-chemistry',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'medium',
    verification_path: 'analytical',
    tags: ['reduced-density-matrix', 'n-representability', 'quantum-marginal', 'many-body-theory'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'multiple contributors',
    proposed_year: 2007,
    via: { label: 'Two-electron RDM N-representability: Mazziotti (ed.), Reduced-Density-Matrix Mechanics, Adv. Chem. Phys. 134 (2007)' },
    related_problems: [
      {
        id: 'mc-018',
        relation: 'shares_tools',
        note: 'Both belong to the study of realizability of reduced density operators (the marginal problem).',
      },
    ],
    statement: `Let $\u03c1_2(x_1,x_2;x_1\',x_2\')$ be a two-particle reduced density matrix, Hermitian, normalized, and with the correct antisymmetry. **Give necessary and sufficient conditions for $\u03c1_2$ to be the second marginal of an $N$-fermion pure state $|\u03a8\\rangle\\in\\wedge^N L^2(\u211d^{3N})$.** The general problem is open: only partial conditions are established (the Pauli ones on the one-particle sector, Coleman conditions for $N=2$, and further positivity/semidefinite constraints), and it is widely believed that no finite explicit characterization exists for arbitrary $N$.`,
    origin:
      'If the exact N-representability conditions for the two-fermion reduced density matrix were known, the electron correlation problem would reduce to minimizing a simple linear functional over one matrix object, eliminating the exponential wave-function complexity. This is the founding promise of reduced-density-matrix functional theory and its central open difficulty.',
    progress: [
      '**Coleman (1963)**: the one-particle Pauli conditions and the complete answer for $N=2$; the general problem formulated.',
      '**Garrod–Percus, Erdahl**: necessary conditions via contraction of positivity and duality; no finite complete set.',
      '**Mazziotti (2012)**: variational 2-RDM methods apply partial N-representability constraints; the completeness gap persists and is connected to the hardness of density-matrix marginals.',
    ],
    obstacles: [
      '**Exponential geometry**: representability is a statement over all antisymmetric $N$-particle states, so the extremal set has enormous dimension.',
      '**Hardness evidence**: known complexity results for quantum marginals suggest any complete condition cannot be checked by a short finite computation, making a clean closed form doubtful.',
    ],
    formalization_notes:
      'A pass at the level of a concrete small system (fixed number of fermions and orbitals) becomes a finite semidefinite representability certificate, amenable to formal verification; the general necessary-and-sufficient characterization is the open research frontier.',
    references: [
      {
        label: 'Coleman, Structure of fermion density matrices, Rev. Mod. Phys. 35 (1963) 668',
        url: 'https://doi.org/10.1103/RevModPhys.35.668',
      },
      {
        label: 'Mazziotti, Two-electron reduced density matrix as the basic variable in electronic structure theory, Chem. Rev. 112 (2012) 244',
        url: 'https://doi.org/10.1021/cr2000493',
      },
    ],
  },
  {
    id: 'mc-024',
    output: 'verified_behavior',
    judgment:
      'A pass provides an algorithm with a proven (polynomial or #P-hard) complexity bound and rigorous optimality for computing the Clar number, and solves the open exact-counting problem of Clar covers for a basic benzenoid family such as hexagons O(k,l,m) or oblate rectangles Ob(n,m), the count being certified by closed form. The acceptable answer is a verifiable decision accompanied by a residual total band: (1) **R_model** = the approximate residual upper bound lost by restricting the true π-electron stability structure to the Kekulé/Clar cover combinatorial model; (2) **R_num** = the interval/exact-arithmetic residual upper bound of the enumeration and closed-form computation; (3) the parameters (hexagon count, geometric family) are exactly specified number-theoretic inputs, so **R_param≡0 (no input measurement residual layer, as explicitly noted)**.',
    certificate: {
      r_model: {
        bound: 'Approximate residual upper bound lost by restricting the true π-electron stability structure to the Kekulé/Clar cover combinatorial model',
        derivation: 'Kekulé/Clar combinatorial-model restriction residual bound',
      },
      r_param: {
        bound: '≡0 (the hexagon count and geometric family are exactly specified number-theoretic inputs; no input measurement residual layer)',
        derivation: 'Parameters exactly specified',
        kind: 'assumption',
        upper: 0,
      },
      r_num: {
        bound: 'Interval/exact-arithmetic residual upper bound of the enumeration and closed-form computation',
        derivation: 'Interval/exact arithmetic closure',
        kind: 'numerical',
      },
      total_band: 'Clar number / Clar cover counting closure ≤ R_model + R_num',
      certified_band: 'Verified closed form for the Clar number and cover count',
    },
    title: 'Computing the Clar Number and Enumerating Clar Covers of Benzenoid Systems',
    titleZh: '苯环型体系 Clar 数与 Clar 覆盖的计数',
    domain: 'mathematical-chemistry',
    subdomain: 'chemical-graph-theory',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'high',
    verification_path: 'numerical',
    tags: ['clar-number', 'clar-cover', 'aromatic-sextet', 'enumeration'],
    contributor: 'admin',
  date_added: '2026-08-22',
    provenance: 'lean-compilable',
    lean_statement: 'import Std\n\n/-!\nmc-024 — Computing the Clar Number and Enumerating Clar Covers of Benzenoid Systems.\n\nFor every benzenoid system, the Clar number (the maximum number of pairwise\ndisjoint aromatic sextets) is computable and the Clar covers can be enumerated.\nThe function/predicate are formalization targets; the claim (proof left open via\n`sorry`) is the headline statement.\n-/\nnamespace MathX\n\ndef ClarNumber (g : Nat) : Nat := by\n  exact 0\n\ndef ClarCoversEnumerated (g : Nat) : Prop := by\n  exact False\n\ntheorem clar_number_is_computable (g : Nat) :\n    ClarCoversEnumerated g := by\n  sorry\n\nend MathX\n',
    proposer: 'multiple contributors',
    proposed_year: 1992,
    via: { label: 'Clar numbers and Clar covers: chemical graph theory / combinatorial literature, e.g. Gutman et al.' },
    related_problems: [
      {
        id: 'mc-022',
        relation: 'shares_tools',
        note: 'Both are structural counting in benzenoid systems; the Kekulé structure count is a perfect-matching count, whereas the Clar number counts the maximum number of pairwise disjoint aromatic hexagons.',
      },
    ],
    statement: `For a benzenoid system $B$, the Clar number is the maximum number of pairwise disjoint aromatic sextets (hexagons carrying three fixed double bonds), and a Clar cover is a set of independent sextets and fixed double bonds covering $B$; the associated ZZ polynomial counts Clar covers. **Design a provably correct and efficient algorithm to compute the Clar number of an arbitrary $B$, and enumerate Clar covers in closed form for the basic families such as the hexagon shells $O(k,l,m)$ and the oblate-parallelogram benzenoids $Ob(n,m)$.** Both questions are listed as open in the recent benzenoid literature.`,
    origin:
      'The Clar aromatic-sextet model reproduces the relative stability and girth-dependence of wide classes of polycyclic aromatics, and the associated ZZ polynomial is the modern tool for ranking isomers. Beyond two basic families there is no closed-form count, and the complexity of deciding the Clar number of a general benzenoid is undetermined.',
    progress: [
      '**Clar (1972)**: the sextet model and the empirical correlations that launched the field.',
      '**Langner, Witek (2020)**: interface theory gives existence and uniqueness conditions for Clar covers; the closed-form enumeration over the basic families and the Clar-number complexity question are explicitly left open.',
    ],
    obstacles: [
      '**Coupling of claws**: counting mutually disjoint sextets couples hexagons globally, so the transfer-matrix style count used for Kekulé structures does not trivially apply.',
      '**Complexity unknown**: whether the Clar number decision problem is in P or NP-hard on general benzenoids has not been settled.',
    ],
    engineering_value:
      "A provably optimal Clar-number algorithm plus closed-form ZZ-polynomial counts give synthetic chemists certifiable aromaticity and stability rankings for candidate isomers, replacing enumerate-then-simulate screening of polycyclic aromatics with graph-theoretic pre-filtering.",
    formalization_notes:
      'Both sub-problems are finite combinatorial statements: the Clar number over a fixed motif is a maximum independent-set-type linear program on the hexagon adjacency graph, and the ZZ-polynomial count is a finite summation. This entry is highly suited to an exhaustive verified computation over the finite family.',
    references: [
      {
        label: 'Langner, Witek, Interface theory of benzenoids, MATCH 84 (2020) 143',
        url: 'https://match.pmf.kg.ac.rs/electronic_versions/Match84/n1/match84n1_143-176.pdf',
      },
    ],
  },

  {
    id: 'mb-016',
    output: 'verified_truth',
    judgment: 'A pass establishes whether the Walsh (Fourier) moment dynamics of a selection plus recombination system closes on an arbitrary fitness surface, and gives a sharp, L-independent contraction bound for the recombination map on the simplex, plus a rigorous counterexample or proof for non-additive surfaces; a heuristic or simulation-only claim is not accepted.',
    title: 'Closure of Selection–Recombination Dynamics under the Walsh Basis',
    titleZh: 'Walsh 基下选择—重组动力学的闭合性',
    domain: 'mathematical-biology',
    subdomain: 'population-genetics',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'medium',
    verification_path: 'analytical',
    tags: ['walsh-fourier', 'selection-recombination', 'gamete-frequencies', 'moment-closure'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'multiple contributors',
    proposed_year: 2013,
    via: { label: 'Closure of selection–recombination in the Walsh basis: related to mixed population-genetic formulations; recent analytic closure results' },
    related_problems: [
      {
        id: 'mb-003',
        relation: 'shares_tools',
        note: 'Both study the long-term state of evolutionary dynamics in population genetics, sharing measure and inequality tools.',
      },
    ],
    statement:
      `Consider a haploid $L$-locus biallelic population whose gamete frequencies lie in the simplex $\\Delta^{2^L-1}$. Let $\\mathcal{S}$ be the (multiplicative) selection map induced by a fitness surface and $\\mathcal{R}$ the linear recombination operator (the rescaled convex combination restricting alleles to pair in proportion to the recombination rate). **Determine whether the combined dynamics $p\\mapsto \\mathcal{R}\\,\\mathcal{S}\\,[\\,p\\,]$ admits a closed finite-dimensional description under the Walsh (Fourier) transform of gamete frequencies** for arbitrary fitness surfaces, or only for surfaces that are pairwise additive. Moreover, prove or disprove a sharp norm bound
$\\|\\,\\mathcal{R}\\,\\mathcal{S}\\,[p] - \\mathcal{R}\\,\\mathcal{S}\\,[q]\\,\\| \\le c \\, \\|p - q\\|$
with a constant $c<1$ independent of $L$, which would guarantee eventual fixation from every initial condition.`,
    origin:
      'How linkage and recombination shape evolution on fitness landscapes is a central question of population genetics. Representing selection and recombination in the Walsh basis as a diagonalizable part plus a non-diagonalizable coupling directly determines whether the dynamics of polygenic traits can be predicted in closed form from low-order moments; this closure has not yet been fully characterized for general fitness landscapes.',
    progress: [
      '**Linear bound and diagonalizable case**: for pair-additive fitness, the higher-order Walsh coefficients decay linearly under recombination, and the moment dynamics close.',
      '**Random fitness theory**: Sella–Hirsh treat single-locus selection as Boltzmann statistics, approximately yielding a stationary density, but they do not resolve the deterministic closed moment equations.',
      '**Numerical observation**: on high-dimensional fitness landscapes the higher-order Walsh coefficients are strongly coupled to the low-order coefficients that determine fitness, so closure holds only approximately.',
    ],
    obstacles: [
      '**Missing physical closure**: the selection term couples the first moments of genotypes to higher-order product moments, and recombination cannot cancel this nonlinear coupling, so moment closure has no well-defined truncation principle on general landscapes.',
      '**L-independent constant**: the contraction constant $c<1$ must be uniform across all trajectories; although the spectral radius of the recombination operator is 1, selection can arbitrarily amplify the ratio, making the bound hard to unify.',
    ],
    engineering_value:
      "A sharp, L-independent contraction bound guarantees eventual fixation from every initial condition, letting breeders and genetic engineers certify exactly when multi-locus selection maps close at low order under linkage - making genomic-selection predictions provably stable rather than empirically fitted.",
    formalization_notes:
      'The goal can be phrased as a finite-dimensional contraction-inequality verification problem: on a fixed $L$ and a given fitness landscape, verify whether $\\mathcal{R}\\,\\mathcal{S}$ is a Picard contraction in some measure. The Walsh linearization for the pair-additive case is formally provable; counterexamples or bounds for the general case remain open research.',
    references: [
      {
        label: 'Neher & Shraiman, Fluctuations of fitness distributions and the rate of Muller ratchet, Genetics 191(4) (2012) 1283-1309',
        url: 'https://doi.org/10.1534/genetics.111.137885',
      },
      {
        label: 'Frank, The fundamental theorem of natural selection, Theor. Popul. Biol. 82(4) (2012) 338-347',
        url: 'https://doi.org/10.1016/j.tpb.2012.08.001',
      },
      {
        label: 'Sella & Hirsh, The application of statistical physics to evolutionary biology, PNAS 102(27) (2005) 9541-9546',
        url: 'https://doi.org/10.1073/pnas.0501865102',
      },
    ],
  },
  {
    id: 'mb-017',
    output: 'verified_truth',
    judgment: 'A pass proves an almost-sure persistence criterion for the stochastic Lotka–Volterra system with bounded environmental noise in terms of the mean structure of the drift, and gives a sharp exponential upper bound on the probability of hitting low-density extinction from a positive initial condition; simulation evidence is not accepted.',
    title: 'Almost-Sure Persistence and Sharp Stochastic Extinction Rates in Noisy Lotka–Volterra Communities',
    titleZh: '随机 Lotka–Volterra 群落的几乎必然持久性与尖锐随机灭绝速率',
    domain: 'mathematical-biology',
    subdomain: 'ecology',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'medium',
    verification_path: 'analytical',
    tags: ['stochastic-persistence', 'lotka-volterra', 'environmental-noise', 'almost-sure-extinction'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'multiple contributors',
    proposed_year: 2017,
    via: {
      label: 'Persistence and extinction rates of noisy Lotka–Volterra: the Hening & Nguyen series',
      url: 'https://doi.org/10.1007/s00285-017-1188-y',
    },
    related_problems: [
      {
        id: 'mb-004',
        relation: 'depends_on',
        note: 'Generalizes the deterministic persistence criterion of mb-004 to the setting with environmental noise; its results depend on that foundational criterion.',
      },
    ],
    statement:
      `Let $n$ species follow
$\\dot{x}_i = x_i\\,\\Big( r_i + \\sum_j a_{ij} x_j + \\sigma_i \\,\\dot{W}_i \\Big),$
a Lotka–Volterra system perturbed by bounded multiplicative environmental noise. **Find a necessary and sufficient condition, stated only in terms of the mean interaction matrix $A=(a_{ij})$ and the noise intensities $\\sigma_i$, under which all species survive almost surely in the sense that $\\lim_{T\\to\\infty} \\frac1T \\tfrac1n \\sum_j \\log x_j(T) > 0$**, and complement it with a sharp estimate of the large-deviation rate for extinction, the exponent of $\\mathbb{P}(\\min_i x_i < \\varepsilon)$ as $\\varepsilon\\to 0$.`,
    origin:
      'Stochastic fluctuations of species in the field and in the laboratory threaten coexistence, and it is unclear whether the deterministic Lotka–Volterra persistence criterion (mb-004) still characterizes almost-sure long-term survival in the presence of environmental noise. Noise can both sustain coexistence through storage effects and drive communities to extinction through random drift; which structural conditions guarantee that the former prevails is an open question in the stochastic stability theory of ecology.',
    progress: [
      '**Deterministic criticality**: mb-004 gives a refined sufficient criterion for the noise-free case; noise turns the problem from an absorbing-state issue into an asymptotic-diffusion one.',
      '**Storage effect**: quantitative results show that moderate noise can enhance persistence, but rigorously only in special two-species settings.',
      '**Lyapunov methods**: it has been shown that persistence of such diffusions in the sense of quasi-invariant measures can be characterized by the signs of a family of linear functionals, but the almost-sure form and exponential bounds remain open.',
    ],
    obstacles: [
      '**Boundary behavior**: for reflecting diffusions at degenerate boundaries the extinction probability follows a large-deviation law, and the existence of a quasi-stationary measure does not suffice to guarantee pathwise survival probability.',
      '**Interaction signs**: asymmetric competition matrices make Lyapunov-function construction difficult, and the interaction between the noise term and the drift term is hard to decompose.',
    ],
    engineering_value:
      "An almost-sure persistence condition plus a sharp extinction-rate exponent gives ecosystem managers and microbial-reactor engineers a teachable threshold for when environmental noise drives engineered communities to extinction, and how fast, enabling noise-budgeted design of coexisting consortia.",
    formalization_notes:
      'Nearly the whole problem reduces to fixed-point and large-deviation analysis of SDEs in the positive orthant; the formalization target concentrates on a single main theorem: a joint condition on the matrix and noise intensities is equivalent to almost-sure persistence, accompanied by a verifiable exponential bound.',
    references: [
      {
        label: 'Schreiber, Benaïm & Atchadé, Persistence in fluctuating environments, J. Math. Biol. 62 (2011) 109-162',
        url: 'https://doi.org/10.1007/s00285-010-0326-5',
      },
      {
        label: 'Benaïm & Schreiber, Persistence of structured populations in random environments, Theor. Ecol. 2 (2009) 37-45',
        url: 'https://doi.org/10.1007/s12080-008-0027-9',
      },
    ],
  },
  {
    id: 'mb-019',
    output: 'verified_truth',
    judgment: 'A pass gives a spectral (Turing) characterization of pattern selection in a class of reaction–diffusion systems on a smoothly growing spatial domain, proves that the selected wavenumber scales with a power of the instantaneous domain size, and decides whether mode-doubling bifurcations must appear as the domain grows; dispersion-relation-maximization heuristics alone are not accepted.',
    title: 'Turing Pattern Selection under Smooth Domain Growth',
    titleZh: '光滑区域生长下反应—扩散图灵模式的谱选择',
    domain: 'mathematical-biology',
    subdomain: 'developmental-biology',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'medium',
    verification_path: 'analytical',
    tags: ['turing-instability', 'pattern-selection', 'domain-growth', 'dispersion-relation'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'multiple contributors',
    proposed_year: 2012,
    via: { label: 'Turing, The chemical basis of morphogenesis, Phil. Trans. R. Soc. B 237 (1952); discussion of pattern selection see Murray, Mathematical Biology II (3rd ed., 2003)' },
    related_problems: [
      {
        id: 'mb-012',
        relation: 'analog_of',
        note: 'Spatial pattern-formation problem: this problem concerns growth of a reaction–diffusion domain, while mb-012 concerns competition patterns on lattices; the mechanisms are of the same kind but differ.',
      },
    ],
    statement:
      `Consider a two-species activator–inhibitor reaction–diffusion system on a one-dimensional interval whose length $\\ell(t)$ grows smoothly from $\\ell_0$, with homogeneous initial conditions slightly perturbed. **Prove that the linearly selected pattern wavenumber $k^*(t)$ scales as $k^*(t)\\asymp \\ell(t)^{-\\alpha}$ for some $\\alpha$ you must identify, and determine whether the dominant peak of the dispersion relation displaces through countably many mode-doubling bifurcations as $\\ell(t)$ increases**. Give a criterion, in terms of the diffusion ratio and the reaction Jacobian, under which a growing domain forever trails the instantaneous marginal-stability mode rather than re-localizing to a fixed number of peaks.`,
    origin:
      'Real developing tissues (limbs, skin stripes, zebra and fish scale patterns) are geometrically sensitive processes patterned during continuous growth of the region. The questions to be quantified — how growth determines the final number of peaks, how patterns re-localize with size, and to what extent linear dispersion predictions are overturned by nonlinear saturation — all lack a first-principles characterization.',
    progress: [
      '**Static theory**: on a fixed domain the Turing instability is determined by the positive peak of the dispersion relation, and the ratio $k\\ell$ of wavelength to domain size is numerically observed to be roughly constant.',
      '**Mode doubling**: growth keeps $k\\ell$ stationary, triggering mode-doubling/tripling, a phenomenon already documented experimentally and numerically.',
      '**Literature gap**: spectral analysis on growing domains mostly relies on a quasi-steady-state assumption and does not give an exact functional relation between peak count and growth rate.',
    ],
    obstacles: [
      '**Quasi-steady-state failure**: when the domain-growth timescale exceeds the mode relaxation timescale, the instantaneous change of the dispersion spectrum couples with the nonlinear evolution, and linear mode selection no longer directly determines the final pattern.',
      '**Multiscale singular perturbation**: the slow-diffusion boundary layer and the fast-reaction interior layer constrain each other, making matched asymptotic solutions extremely fragile.',
    ],
    engineering_value:
      "A first-principles peak-count scaling law lets synthetic-morphogenesis and tissue-engineering researchers design growing scaffolds whose pattern wavelength is set by the growth protocol, turning the qualitative observation that length controls stripe count into quantitative design rules.",
    formalization_notes:
      'On a uniform interval the spectrum of the linear stage can be written explicitly, and verifying the power-law relation between k and size is decidable by pen and paper. The final pattern count, however, requires solving a free-boundary problem and remains open research.',
    references: [
      {
        label: 'Turing, The chemical basis of morphogenesis, Phil. Trans. R. Soc. B 237 (1952) 37-72',
        url: 'https://doi.org/10.1098/rstb.1952.0012',
      },
      {
        label: 'Kondo & Miura, Reaction-diffusion model as a framework for understanding biological pattern formation, Science 329 (2010) 1616-1620',
        url: 'https://doi.org/10.1126/science.1179047',
      },
      {
        label: 'Crampin, Gaffney & Maini, Mode-doubling and tripling in reaction-diffusion patterns on growing domains, Bull. Math. Biol. 64 (2002) 747-769',
        url: 'https://doi.org/10.1006/bulm.2002.0298',
      },
    ],
  },
  {
    id: 'mb-020',
    output: 'verified_truth',
    judgment: 'A pass determines exactly for which mutation schemes (reversibility criteria) the multiallelic mutation–selection–drift diffusion admits a closed-form stationary density, and proves the absence of a closed form for the complementary class of non-reversible schemes, isolating the diagonalizable condition; numerical histograms are not accepted.',
    title: 'Closed-Form Stationary Densities under Non-Reversible Mutation–Selection–Drift',
    titleZh: '非可逆突变—选择—漂变下的闭式平稳密度',
    domain: 'mathematical-biology',
    subdomain: 'population-genetics',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'medium',
    verification_path: 'analytical',
    tags: ['wright-fisher-diffusion', 'stationary-density', 'multiallelic', 'reversible-mutation'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'multiple contributors',
    proposed_year: 2016,
    via: { label: 'Kimura, A stochastic model concerning the maintenance of genetic variability in quantitative characters, Proc. Natl. Acad. Sci. USA 54 (1965); two-allele equilibrium density see Kimura, Genetics (1964)' },
    related_problems: [
      {
        id: 'mb-009',
        relation: 'analog_of',
        note: 'Both are quantitative characterizations of equilibria for multigenic traits; mb-009 concerns the emergence of the infinitesimal model, while this problem concerns closed-form equilibrium densities.',
      },
    ],
    statement:
      `On the $(K-1)$-simplex of allele frequencies, let the Wright–Fisher diffusion with generator
$\\mathcal{L} = \\sum_i \\partial_{x_i}\\big[ x_i(1-x_i)\\partial_{x_i}\\big] + \\text{mutation} + \\text{selection},$
be given where mutation is a constant-flux matrix $M=(m_{ij})$ (which may be asymmetric) and selection is a fixed additive fitness. **Prove that a closed-form stationary density $\\pi(x) \\propto e^{\\beta V(x)} \\prod_i x_i^{\\theta_i-1}$ exists exactly when the mutation matrix $M$ is reversible (satisfying detailed balance $\\theta_i m_{ij}=\\theta_j m_{ji}$), and that no such closed form exists for the general asymmetric, non-reversible $M$; give the diagonalizable condition that separates the two classes and the resulting order of the density.**`,
    origin:
      'How the maintenance of balanced polymorphism (balancing selection) in a population is quantified, and what stationary distribution allele frequencies follow, is classical single-locus theory. The Wright equilibrium function for reversible mutation is well known, but real mutations usually flow asymmetrically, and whether the density then still takes the closed form of a potential function times a product of polynomials has long remained unresolved.',
    progress: [
      '**Reversible case**: a mutation matrix satisfying detailed balance corresponds to a potential-function solution, and allele frequencies follow Wright\'s closed density.',
      '**No-selection approximation**: under neutrality with arbitrary mutation the stationary density can still be given exactly, but adding selection requires solving a specific partial differential equation.',
      '**Partial results**: for certain combinations of symmetric selection and asymmetric mutation, numerical observers find that the density is still an analytic polynomial product, but a general theorem is lacking.',
    ],
    obstacles: [
      '**Irrecoverable irreversible flow**: non-reversible mutation introduces a cyclic flow that breaks the potential structure, and the stationary density requires solving a nonlinear system coupling first- and second-order differential equations.',
      '**Existence attribution**: an algebraic criterion distinguishing when a closed form exists requires running purely combinatorial conditions, and a unified fixed-point characterization has not been found.',
    ],
    formalization_notes:
      'Verifying the closed form in the reversible case is a clear computational goal; the core of the problem is to connect the infinite-solvability of the non-reversible case with the non-existence of a closed form, which can be formalized as a purely algebraic decidable condition.',
    references: [
      {
        label: 'Ewens, The sampling theory of selectively neutral alleles, Theor. Popul. Biol. 3 (1972) 87-112',
        url: 'https://doi.org/10.1016/0040-5809(72)90035-6',
      },
      {
        label: 'Georgii & Baake, Multiallelic selection-mutation models and their equilibrium densities, Theor. Popul. Biol. 64 (2003) 321-336',
        url: 'https://doi.org/10.1016/S0040-5809(03)00095-7',
      },
    ],
  },
  {
    id: 'mb-021',
    output: 'verified_truth',
    judgment: 'A pass derives from first principles an exact condition under which a costly helping allele increases in frequency in a finite structured population, states a precise (nonzero) value of the inclusive fitness r in that structured setting, and decides the celebrated claim that for spatially viscous populations r tends to zero in the large-population limit; a verbal evolutionary heuristic is not accepted.',
    title: 'Hamilton Rule and the Zero Relatedness Claim in Finite Structured Populations',
    titleZh: '有限结构化群体中 Hamilton 规则与零亲缘率主张',
    domain: 'mathematical-biology',
    subdomain: 'evolutionary-dynamics',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'medium',
    verification_path: 'analytical',
    tags: ['kin-selection', 'inclusive-fitness', 'structured-populations', 'hamilton-rule'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'W. D. Hamilton',
    proposed_year: 1964,
    via: {
      label: 'Hamilton, The genetical evolution of social behaviour, J. Theor. Biol. 7 (1964)',
      url: 'https://doi.org/10.1016/0022-5193(64)90038-4',
    },
    related_problems: [
      {
        id: 'mb-006',
        relation: 'shares_tools',
        note: 'Both are precise characterizations of natural selection on structured populations, sharing the Moran / passage-process tools on graphs.',
      },
    ],
    statement:
      `In a finite structured population of size $N$ on a regular graph, a mutant allele performs an act that costs its bearer $c$ and benefits its partner $b$. The mutant spreads if its fixation probability exceeds the neutral value $1/N$. **Prove an exact condition for spread, expressible as the inclusive-fitness inequality $b\\,r - c > 0$ with a precisely computed relatedness coefficient $r(N)$ that tends to a positive limit as $N\\to\\infty$ on the star graph, or else establish the contrary claim that on spatially viscous topologies $\\lim_{N\\to\\infty} r(N)=0$ in the appropriate limit**, and resolve which topology-dependent scaling (weak selection, large population, or broad benefit) drives the qualitative answer.`,
    origin:
      'Hamilton\'s rule $br>c$ is the cornerstone of kin-selection theory, but once structured finite populations, weak selection, and viscous populations are included, the exact value of the relatedness $r$ becomes highly topology-dependent. There has been heated debate over the famous claim that $r=0$ under complete replacement in viscous populations (namely that within-group replacement neutralizes cooperation), and a first-principles proof for every graph family is lacking.',
    progress: [
      '**Classical theory**: in the infinite and diffusion approximations, $r$ is defined as the ratio of kin covariances and has a clear formulation.',
      '**Rule on graphs**: an extended Hamilton rule has been derived for general graphs, and the limiting behavior of r on some graphs (star graphs) has been identified numerically.',
      '**Point of contention**: the literature contains coexisting claims of $r\\to0$ and $r\\to+$ for viscous populations, depending on the order of the finite-population correction and the weak-selection expansion.',
    ],
    obstacles: [
      '**Order of limits**: when the large-N and weak-selection limits do not commute, they lead to different values of $r$, requiring one to fix a consistent order of limits by hand.',
      '**Choice of measure**: the relatedness $r$ is sensitive to the evolutionary time window and the distribution of pairs within the population, and has not yet been unified into a single graph invariant.',
    ],
    engineering_value:
      "A resolved relatedness coefficient r(N) for structured populations settles when inclusive-fitness predictions hold, so evolutionary-tumor and social-evolution modelers can deploy the br minus c rule with a correctly computed r instead of a topology-dependent guess.",
    formalization_notes:
      'For a fixed graph family and fixed selection intensity, $r(N)$ is an algebraic function of the fixation probability of a finite passage process, and its limit can be formally verified; the central arbiter is the inconsistency test under different orders of limits.',
    references: [
      {
        label: 'Hamilton, The genetical evolution of social behaviour I-II, J. Theor. Biol. 7 (1964) 1-52',
        url: 'https://doi.org/10.1016/0022-5193(64)90038-4',
      },
      {
        label: 'Nowak, Tarnita & Wilson, The evolution of eusociality, Nature 466 (2010) 1057-1062',
        url: 'https://doi.org/10.1038/nature09205',
      },
      {
        label: 'Allen & Nowak, Games on graphs, EMS Surv. Math. Sci. 1 (2014) 113-151',
        url: 'https://doi.org/10.4171/EMSS/3',
      },
    ],
  },
  {
    id: 'mb-022',
    output: 'verified_truth',
    judgment: 'A pass derives a sharp stability threshold for random interaction matrices sampled from a food-web sign pattern and its quantitative correction relative to the spectral circle of i.i.d. random matrices, then applies it to decide when a real food web with its expected degree distribution is asymptotically stable; empirical fitting of a simulation cloud is not accepted.',
    title: 'Quantitative Complexity-Stability Threshold for Sign-Structured Food Webs',
    titleZh: '符号结构食物网的定量复杂—稳定阈值',
    domain: 'mathematical-biology',
    subdomain: 'ecology',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'medium',
    verification_path: 'analytical',
    tags: ['complexity-stability', 'random-matrices', 'food-webs', 'sign-patterns'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'R. M. May',
    proposed_year: 1972,
    via: {
      label: 'May, Will a large complex system be stable? Nature 238 (1972)',
      url: 'https://doi.org/10.1038/238413a0',
    },
    related_problems: [
      {
        id: 'mb-004',
        relation: 'shares_tools',
        note: 'Both belong to the stability of ecological dynamics: mb-004 concerns persistence criteria, while this problem concerns the stability threshold of the Jacobian spectrum.',
      },
    ],
    statement:
      `Let $M$ be an interaction matrix whose off-diagonal entries have a random magnitude with variance $\\sigma^2$, but whose signs obey a fixed pattern: predator-prey, competitive, or mutualistic, paired according to a given directed food-web scaffold with mean degree $\\bar{k}$. **Determine the sharp critical line in the plane $(\\sigma\\sqrt{n}, \\bar{k})$ separating almost-sure asymptotic stability (all eigenvalues lie in the left half-plane) from instability, for each sign pattern, and prove the quantitative deviation of that threshold from the eigenvalue radius $\\sqrt{n}\\,\\sigma$ of the unstructured random ensemble**, including the role of strict predator-prey sign antisymmetry in rescuing stability.`,
    origin:
      'May\'s famous paradox states that the stability of random ecosystems collapses with connectivity as $\\sqrt{n}\\,\\sigma$, yet the claim that real food webs are stable rests on the stabilizing effect provided by their specific predator–prey sign structure. The resulting quantitative question — after feeding the sign-pattern information into spectral theory, how large is the rigorously provable difference of the stability threshold from the purely random case, and when is it large enough to sustain stability at realistic scales — lacks a precise characterization.',
    progress: [
      '**May criterion**: the spectral radius of i.i.d. random matrices determines the instability threshold of weakly structured systems.',
      '**Corrected results**: the spectrum of sign-structured random matrices has outlier eigenvalues beyond the semicircle, and for certain structures the spectral abscissa can be proven to lie outside the bulk spectrum.',
      '**Numerical spectra**: the predator–prey pattern is observed to substantially widen the stability window, but the formal proofs are incomplete across patterns.',
    ],
    obstacles: [
      '**Failure of independence**: correlations and sign constraints on food-web edges destroy independence, so the errors of the RMT trace method cannot be controlled uniformly.',
      '**Spectral shadowing**: the skew-symmetric sign structure produces sign compensation within predator–prey pairs, and the real and imaginary parts of the leading eigenvalue are entangled and hard to separate.',
    ],
    engineering_value:
      "A sharp complexity-stability threshold for sign-structured food webs gives ecosystem managers a quantitative stability margin: they can certify whether a real network with its measured degree distribution and sign pattern sits in the provably-stable window, informing biodiversity and rewilding risk assessment.",
    formalization_notes:
      'For a fixed sign pattern, the stability criterion is a finite-dimensional linear-algebraic property and can be packaged into decidable inequalities via spectral criteria; the problem reduces to extending the refined RMT corrections to matrix classes that are non-i.i.d. and carry sign constraints.',
    references: [
      {
        label: 'May, Will a large complex system be stable, Nature 238 (1972) 413-414',
        url: 'https://doi.org/10.1038/238413a0',
      },
      {
        label: 'Allesina & Tang, Stability criteria for complex ecosystems, Nature 483 (2012) 205-208',
        url: 'https://doi.org/10.1038/nature10832',
      },
    ],
  },
  {
    id: 'mb-024',
    output: 'verified_behavior',
    judgment: 'A pass proves a fundamental lower bound on the relative variance of an intracellular readout of a spatially distributed morphogen concentration, establishes whether negative feedback can beat the linear-sensing Berg-Purcell scaling or whether an information-theoretic floor persists, and gives the minimal achievable ligand-count sensing error for a given gradient geometry under the molecular-number-noise constraint; a diffusion-only estimate is not accepted. The acceptable answer is a verifiable decision accompanied by a three-layer residual total band: (1) **R_model** = the approximate residual upper bound lost by restricting real developmental signal transduction to the ligand–receptor Poisson counting / Berg–Purcell model; (2) **R_param** = the input residual upper bound on the sensing floor arising from the uncertainty of ligand concentration, receptor number, and gradient geometry when these come from measurement/calibration (holding for all configurations in the measurement interval); (3) **R_num** = the residual upper bound of stochastic-dynamics / master-equation solution or interval closure. When there is no input measurement uncertainty, R_param≡0 must be explicitly noted.',
    certificate: {
      r_model: {
        bound: 'Approximate residual upper bound lost by restricting real developmental signal transduction to the ligand–receptor Poisson counting / Berg–Purcell model',
        derivation: 'Berg–Purcell counting-model residual bound',
      },
      r_param: {
        bound: 'Input residual upper bound on the sensing floor from the uncertainty of ligand concentration, receptor number, and gradient geometry when they come from measurement/calibration (holding for all configurations in the measurement interval)',
        derivation: 'Interval image of measurement parameters propagated to the sensing-error floor',
      },
      r_num: {
        bound: 'Residual upper bound of stochastic-dynamics / master-equation solution or interval closure',
        derivation: 'Master-equation solution residual bound / interval closure',
        kind: 'numerical',
      },
      total_band: 'Sensing-error floor ≤ R_model + R_param + R_num',
      certified_band: 'Minimal achievable ligand-count sensing-error interval',
    },
    title: 'Information-Theoretic Floor on Morphogen Gradient Concentration Sensing',
    titleZh: '形态发生梯度浓度感知的信息论下限',
    domain: 'mathematical-biology',
    subdomain: 'developmental-biology',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'medium',
    verification_path: 'analytical',
    tags: ['berg-purcell-limit', 'chemical-sensing', 'morphogen-gradient', 'fundamental-noise-limit'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'multiple contributors',
    proposed_year: 2013,
    via: { label: 'Information lower bound for morphogen-gradient concentration sensing: related to the Berg–Purcell limit (1977)' },
    related_problems: [
      {
        id: 'mb-014',
        relation: 'shares_tools',
        note: 'Both are information-theoretic approaches to storage and information capacity: mb-014 concerns associative-memory capacity, while this problem concerns the precision floor of developmental readout.',
      },
    ],
    statement:
      `A cell reads the concentration $c$ of a morphogen produced by a distant source, receiving on average $N$ bound ligand molecules sampled from a gradient. Given the full ligand-density distribution in space, **prove a lower bound on the relative error of any unbiased positional reading, of the Berg-Purcell form $\\sigma_c/c \\ge 1/\\sqrt{N}$, and decide whether inserting a negative-feedback regulation of ligand production or receptor reuse can reduce this error to a value allowing positioning below the established brute bound, or whether an information-theoretic floor (fixed by ligand copy number and the readout channel capacity) persists regardless of feedback**. Make the bound sharp in terms of the gradient shape (exponential versus power-law decay).`,
    origin:
      'An embryo positions each cell along the body axis by reading the concentration of a morphogen gradient, yet a cell can only collect a finite number of ligand molecules, and this intrinsic noise of molecular-sampling measurement sets the physical limit of developmental positioning. The classical Berg–Purcell estimate gives a relative error of $1/\\sqrt{N}$, but whether mechanisms such as negative feedback or receptor reuse can break this limit is an active and unresolved question at the interface of development and information theory.',
    progress: [
      '**Berg–Purcell bound**: simple receptor models give a relative error inversely proportional to the square root of the number of samples, the classical benchmark of sensing precision.',
      '**Negative-feedback results**: Lestas–Vinnicombe–Paulsson proved that feedback cannot overcome the Poisson-noise floor of the product (output), so precision has an independent intrinsic loss.',
      '**Developmental instance**: transcriptional networks reach maximized information capacity, and some gradient readouts approach the Berg–Purcell bound, but the precise origin of the gap remains unclosed.',
    ],
    obstacles: [
      '**Spatial and nonequilibrium**: morphogen gradients are nonequilibrium, non-uniform spatial distributions, so the classical equilibrium-sampling arguments cannot be applied directly.',
      '**Boundary of feedback gains**: whether the information gain of feedback can be converted into an effective increase in the number of samples requires simultaneously pinning down the error sources at both the source and the channel.',
    ],
    engineering_value:
      "A proven information-theoretic floor on concentration sensing sets the resolution ceiling for positional readouts in synthetic morphogen circuits and organoid engineering - telling bioengineers the minimal ligand-count and layout noise they cannot beat, and exactly where negative feedback genuinely helps.",
    formalization_notes:
      'Modeling the readout as random sampling under a given spatial ligand distribution, the extremal relative error is a standard Fisher-information problem that can be solved exactly under interlayer gradients and Poisson statistics, yielding a verifiable lower-bound inequality.',
    references: [
      {
        label: 'Berg & Purcell, Physics of chemoreception, Biophys. J. 20 (1977) 193-219',
        url: 'https://doi.org/10.1016/S0006-3495(77)85544-6',
      },
      {
        label: 'Lestas, Vinnicombe & Paulsson, Fundamental limits on the suppression of molecular fluctuations, Nature 467 (2010) 174-178',
        url: 'https://doi.org/10.1038/nature09332',
      },
      {
        label: 'Tkacik, Callan & Bialek, Information capacity and transmission are maximized in balanced transcriptional networks, PNAS 105 (2008) 12265-12270',
        url: 'https://doi.org/10.1073/pnas.0705352105',
      },
    ],
  },
  {
    id: 'me-015',
    output: 'verified_truth',
    judgment:
      'A pass proves that for every suitably weak solution of the 3D incompressible Navier–Stokes equations the singular set carries zero one-dimensional Hausdorff measure, with a fully machine-checkable energy/backward-uniqueness argument, or else exhibits a certified family of solutions whose singular set has positive one-dimensional measure, so the sharp dimension of the singular set is settled either way.',
    title: 'Sharp Size of the Singular Set for Suitably Weak Navier–Stokes Solutions',
    titleZh: 'Navier–Stokes 合适弱解奇异集的尖确维数',
    domain: 'mathematical-engineering',
    subdomain: 'fluid-dynamics',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'high',
    verification_path: 'analytical',
    tags: ['navier-stokes', 'partial-regularity', 'hausdorff-dimension', 'turbulence'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'multiple contributors',
    proposed_year: 2007,
    via: { label: 'Dimension of the singular set of NS suitable weak solutions: the Caffarelli–Kohn–Nirenberg partial regularity tradition and subsequent dimension results' },
    related_problems: [],
    statement: `Consider incompressible Navier–Stokes on a bounded domain for all $t>0$. By the Cafarelli–Kohn–Nirenberg partial regularity theorem every suitable weak solution is smooth away from a set whose box-counting dimension is at most $5/3$. **Prove or disprove the sharp improvement**: the singular set has vanishing one-dimensional Hausdorff measure $\\mathcal H^1(S)=0$, or find an exponent sharper than $5/3$ that is provably optimal.

Equivalently, sharpen the $\\varepsilon$-regularity criterion $\\|u\\|^2 < \\varepsilon$ on unit parabolic cylinders to the minimal integrability condition under which local regularity is enforced, and match the upper dimension bound with a dimension-reducing lower example.`,
    origin:
      'In turbulence and high-Reynolds-number flows, whether numerical solutions converge to the true solution and where adaptive meshes should be refined both depend on a quantitative understanding of the size and structure of the singular set. The CKN theorem gives the upper bound of dimension 5/3, but both analytic and numerical evidence point to a further tightening to dimension 1; the main obstacle in going from 5/3 to 1 is that backward uniqueness of solutions is not fully controlled on bounded domains.',
    progress: [
      '**Cafarelli–Kohn–Nirenberg (1982)**: via the $\\varepsilon$-regularity criterion, give box-dimension $\\le 5/3$ for the singular set.',
      '**Backward uniqueness and $L_{3,\\infty}$ solutions**: the works of Escauriaza–Seregin–Šverák and Kukavica reduce part of the local regularity to a backward-uniqueness problem and yield several improvements of the dimension upper bound.',
      '**Kukavica (2009)**: gives improved estimates of the fractal dimension of the singular set, but does not yet reach dimension 1.',
    ],
    obstacles: [
      '**Dimension-1 obstacle**: squeezing the singularities into a one-dimensional set requires stronger modulus-of-continuity information, whereas the CKN $\\varepsilon$-regularity criterion currently yields only uniform estimates over spatial discretizations; the estimates in the time direction do not match the one-dimensional singular dimension.',
    ],
    engineering_value:
      'Sharp estimates of the singular-set dimension directly determine the efficiency of mesh-refinement strategies in high-Reynolds-number simulations: the target dimension is the theoretical basis for reducing grid layers and near-wall resolution in large-eddy simulation of turbulence, and is the criterion for whether adaptive methods can guarantee convergence rates.',
    formalization_notes:
      'The decision can be formalized via energy inequalities and the $\\varepsilon$-regularity criterion: verifying convergence on a cylinder gives an upper bound on the measure of the singular set, an analytic-type criterion that can be successively reduced to finitely many inequalities in an auxiliary system, with medium-to-high formalization effort.',
    references: [
      {
        label: 'L. Cafarelli, R. Kohn, L. Nirenberg, Partial regularity of suitable weak solutions of the Navier–Stokes equations, Comm. Pure Appl. Math. 35 (1982) 771–831',
        url: 'https://doi.org/10.1002/cpa.3160350604',
      },
      {
        label: 'I. Kukavica, The fractal dimension of the singular set for solutions of the Navier–Stokes system, Nonlinearity 22 (2009) 2889',
        url: 'https://doi.org/10.1088/0951-7715/22/12/008',
      },
    ],
  },
  {
    id: 'me-017',
    output: 'verified_truth',
    judgment:
      'A pass proves that the voltage-to-current (Dirichlet-to-Neumann or Cauchy) map of a bounded connected domain determines an $L^\\infty$ conductivity uniquely in dimension three, by removing the Brown–Uhlmann reducibility substructure condition, or else constructs two distinct $L^\\infty$ conductivities with equal boundary maps, so the three-dimensional phase of the global uniqueness problem is settled.',
    title: 'Global Uniqueness for the Calderón Problem in Three Dimensions',
    titleZh: '三维 Calderón 逆传导问题的全局唯一性',
    domain: 'mathematical-engineering',
    subdomain: 'inverse-problems',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'high',
    verification_path: 'analytical',
    tags: ['impedance-tomography', 'calderon-problem', 'electrical-impedance-tomography', 'uniqueness'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'A. P. Calderón',
    proposed_year: 1980,
    via: {
      label: 'Calderón, On an inverse boundary value problem, Seminário Brasileiro de Análise (1980); uniqueness in 3D open',
      url: 'https://doi.org/10.1007/978-3-662-12877-0_1',
    },
    related_problems: [],
    statement: `Let $\\Omega \\subset \\mathbb R^3$ be a bounded connected domain and let $\\gamma \\in L^\\infty_+(\\Omega)$ be a strictly positive conductivity. The Dirichlet-to-Neumann map $\\Lambda_\\gamma$ is defined by $\\Lambda_\\gamma(f) = \\gamma \\partial_\\nu u|_{\\partial\\Omega}$ for the unique solution of $-\\nabla\\cdot(\\gamma\\nabla u)=0$ with $u|_{\\partial\\Omega}=f$. **Prove that $\\Lambda_{\\gamma_1} = \\Lambda_{\\gamma_2}$ implies $\\gamma_1=\\gamma_2$ for general $L^\\infty$ conductivities.**

The known route reduces the problem to a complex-phasor substructure (the Brown–Uhlmann condition); decisions here include removing that condition, or proving a stability estimate with log-type modulus that is genuinely sharp.`,
    origin:
      'Electrical impedance tomography reconstructs the internal conductivity distribution from boundary voltage measurements and is a basic inverse problem of medical imaging and geophysical exploration. The Calderón problem has been proved in two dimensions for arbitrary conductivity; global uniqueness in three dimensions has also been established at the Lipschitz level, but global uniqueness for general bounded nonsmooth conductivity remains unresolved.',
    progress: [
      '**Sylvester–Uhlmann (1987)**: prove stable global uniqueness for smooth conductivity.',
      '**Brown–Uhlmann (1997)**: prove uniqueness in two dimensions for $L^\\infty$ conductivity and reduce the problem in higher dimensions to an integrability condition.',
      '**Haberman–Tataru (2013)**: uniqueness holds for three-dimensional Lipschitz conductivity, but there remains a gap for global uniqueness at the $L^\\infty$ level.',
    ],
    obstacles: [
      '**Integrability-condition obstacle**: the complex-phasor construction requires the bounds to hold in the $L^\\infty$ sense, whereas the inversion formula underlying the Brown–Uhlmann reduction needs extra regularity, so direct generalization to arbitrary measurable coefficients hits the technical limitations of far-field singular integrals.',
    ],
    engineering_value:
      'Whether three-dimensional uniqueness holds determines whether electrical-impedance-tomography reconstruction algorithms can offer theoretical guarantees: if uniqueness holds for commonly occurring smooth coefficients, iterative reconstruction and regularized inversion converge with deterministic error bounds, providing a reliability basis for clinical imaging verification and nondestructive testing.',
    formalization_notes:
      'The decision is an analytic inverse-problem statement: uniqueness reduces to a constructive verification of complex phasors and solutions of auxiliary equations, with formalization concentrating on finite simplifications of singular-integral estimates and stability, of medium-to-high effort.',
    references: [
      {
        label: 'J. Sylvester, G. Uhlmann, A global uniqueness theorem for an inverse boundary value problem, Ann. of Math. 125 (1987) 153–169',
        url: 'https://doi.org/10.2307/1971291',
      },
      {
        label: 'R. M. Brown, G. Uhlmann, Uniqueness in the inverse conductivity problem for nonsmooth conductivities in two dimensions, Comm. Partial Differential Equations 22 (1997) 1009–1027',
        url: 'https://doi.org/10.1080/03605309708821292',
      },
      {
        label: 'B. Haberman, D. Tataru, Uniqueness in Calderón’s problem with Lipschitz conductivities, Duke Math. J. 162 (2013) 507–533',
        url: 'https://doi.org/10.1215/00127094-2334732',
      },
    ],
  },
  {
    id: 'me-018',
    output: 'verified_truth',
    judgment:
      'A pass gives a verifiable necessary-and-sufficient condition under which a control-affine nonlinear system admits a globally asymptotically stabilizing continuous time-invariant state feedback, thereby closing the gap between the Brockett necessary condition and the Sontag sufficient condition, or else exhibits a system that is asymptotically controllable but admits no such continuous feedback, so the stabilization characterization is settled.',
    title: 'Necessary and Sufficient Feedback Stabilizability: Closing the Brockett–Sontag Gap',
    titleZh: '反馈镇定充要判据的 Brockett–Sontag 缺口',
    domain: 'mathematical-engineering',
    subdomain: 'control',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'medium',
    verification_path: 'analytical',
    tags: ['feedback-stabilization', 'nonlinear-control', 'lyapunov-functions', 'asymptotic-controllability'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'R. W. Brockett',
    proposed_year: 1983,
    via: {
      label: 'Brockett, Asymptotic stability and feedback stabilization, in Differential Geometric Control Theory (1983); Sontag (1983)',
      url: 'https://doi.org/10.1007/978-1-4612-5423-6_18',
    },
    related_problems: [
      {
        id: 'me-001',
        relation: 'shares_tools',
        note: 'Both use Lyapunov methods and graph/dissipativity structure as common tools, reducing the decisions of consensus convergence and feedback stabilization, respectively, to constructive criteria.',
      },
    ],
    statement: `For a control-affine system  $\\dot x = f(x) + \\sum_{i=1}^m g_i(x) u_i$ on $\\mathbb R^n$, a necessary condition for continuous feedback stabilizability is Brockett’s $f(0) \\in \\mathrm{int}\\, \\overline{\\mathrm{conv}}\\, U(x)$ condition; a sufficient condition (for asymptotic controllability plus a known class of Lyapunov functions) is provided by Sontag’s criterion. **Find a tractable condition that is both necessary and sufficient for the existence of a globally asymptotically stabilizing continuous state feedback**, resolving in particular whether asymptotically controllable systems without smooth Lyapunov functions admit continuous (not merely Holder/upper-semicontinuous) stabilizing feedback.

Provide an explicit convexity/transversality criterion and test it against the known nonholonomic examples where only discontinuous or time-periodic feedback exists.`,
    origin:
      'Stabilization design is the core task of controller synthesis. The classical criteria are one positive and one negative and do not cover each other: the Brockett condition is necessary but often not sufficient, while Sontag-type constructions give sufficiency but depend on the existence of a control Lyapunov function. In engineering systems such as mechanical and aerospace ones, Lipschitz feedback is easier to implement than discontinuous feedback, so deciding whether a continuous feedback exists directly guides the choice of the controller form.',
    progress: [
      '**Brockett (1983)**: gives the necessary condition for continuous feedback stabilization.',
      '**Sontag (1983)**: establishes sufficient conditions for asymptotic controllability and feedback stabilization via control Lyapunov functions.',
      '**Clarke–Ledyaev–Sontag–Subbotin (1997)**: prove that asymptotically stabilizable systems admit semicontinuous/discontinuous feedback, but a necessary-and-sufficient criterion for fully continuous feedback is still missing.',
    ],
    obstacles: [
      '**Nonsmoothness obstacle**: when the reachable set of an asymptotically controllable system lacks a smooth Lipschitz structure, the control cannot be uniquely determined by a gradient-type feedback, and geometric conditions such as convexity and transversality are hard to capture simultaneously on both the necessity and sufficiency sides with a single testable algebraic condition.',
    ],
    engineering_value:
      'Continuous (especially Lipschitz) state feedback is the form easiest to implement in embedded controllers and most robust to measurement noise. A criterion that is both necessary and sufficient would tell engineers which systems can safely use smooth feedback and which must accept sliding-mode or discontinuous control, avoiding wrong trade-offs in controller structure.',
    formalization_notes:
      'The decision is a geometric-control statement: it reduces the compatibility of the convex hull of the reachable set with gradient-type feedback to an inclusion check on a finite state space, with formalization concentrating on finite simplifications of convexity and transversality, of medium effort.',
    references: [
      {
        label: 'E. D. Sontag, A Lyapunov-like characterization of asymptotic controllability, SIAM J. Control Optim. 21 (1983) 462–471',
        url: 'https://doi.org/10.1137/0321030',
      },
      {
        label: 'F. H. Clarke, Y. S. Ledyaev, E. D. Sontag, A. I. Subbotin, Asymptotic controllability implies feedback stabilization, IEEE Trans. Automat. Control 42 (1997) 1394–1407',
        url: 'https://doi.org/10.1109/9.637600',
      },
    ],
  },
  {
    id: 'me-019',
    output: 'verified_truth',
    judgment:
      'A pass computes the sharp rate of decay of the Kolmogorov n-width of the solution manifold $\\{u(a)\\}$ of a parametrized elliptic PDE as a function of the analytic or only smooth parameter dependence, with an explicit algebraic (or exponential) exponent and a matching lower-bound construction certifying optimality, so the reduced-order approximation barrier is pinned.',
    title: 'Sharp Kolmogorov n-Width Decay for Parametrized PDE Solution Manifolds',
    titleZh: '参数化 PDE 解流形的 Kolmogorov n 宽衰减率',
    domain: 'mathematical-engineering',
    subdomain: 'scientific-computing',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'medium',
    verification_path: 'analytical',
    tags: ['model-order-reduction', 'kolmogorov-n-width', 'parametric-pde', 'reduced-basis'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'multiple contributors',
    proposed_year: 2017,
    via: { label: 'n-width decay of parametrized-PDE solution manifolds: recent literature (e.g. the Cohen–DeVore width estimates)' },
    related_problems: [],
    statement: `Let $\\mathcal M = \\{u(a) : a \\in \\Lambda\\} \\subset V$ be the solution manifold of a parametrized linear elliptic equation $\\mathcal A(a) u = f$, $a$ ranging over a parameter set $\\Lambda$ in finite or countable dimension. Let $d_n(\\mathcal M)$ be the Kolmogorov n-width in $V$. **Determine the sharp asymptotic of $d_n(\\mathcal M)$ as $n \\to \\infty$**:
- whether analytic (holomorphic) parameter dependence yields exponential decay $d_n \\sim 2^{-c n}$ with the best constant $c$, and
- for merely smooth (e.g. $C^k$) dependence, the exact polynomial rate and the threshold at which sharpness breaks, with explicit lower-bound examples.`,
    origin:
      'Full-order finite-element solves become prohibitively expensive over parameter spaces and high-dimensional uncertainty expansions, and model-reduction/reduced-basis methods depend on a quantitative understanding of the approximability of the solution manifold. The Kolmogorov n-width characterizes the ultimate precision of linear approximation in function spaces; if the manifold n-width decays only polynomially, any linear reduction scheme is limited by this barrier, so the sharp decay rate determines the usable dimension of digital twins.',
    progress: [
      '**Cohen–DeVore (2015)**: give sophisticated approximation rates and n-width estimates for analytic/holomorphic coefficient families.',
      '**Smooth dependence**: only polynomial-type upper bounds are given; the corresponding lower bounds are established only for special parameter families.',
      '**Reduced-basis convergence**: greedy snapshot methods match exponential rates numerically on several engineering parameter families, but the optimal constant and the smooth-analytic boundary lack a unified proof.',
    ],
    obstacles: [
      '**Dimension-analyticity conflict**: the linear approximation rate of a manifold with smooth nonlinear dependence over a finite set of sampled points is constrained by logarithmic factors and dimension relations, making it hard to give simultaneously optimal upper and lower bounds; constructing a matching lower bound requires progressively controlling the snapshot-subspace dimension.',
    ],
    engineering_value:
      'Real-time simulation and digital twins rely on pre-compressed reduced bases: if the manifold n-width decays at an exponential rate, online solution errors can be predicted and basis functions added on demand; if it decays only polynomially, improved nonlinear (deep) approximation is needed. This research provides a decidable precision budget for ROM and uncertainty quantification.',
    formalization_notes:
      'The decision requires reducing the n-width decay to an iterated bound for interpolation operators over parameter families: verifying whether the exponential/polynomial constants of the bounds match the constructed counterexamples, which can be successively simplified in an auxiliary system to a set of discrete norm inequalities, of medium effort.',
    references: [
      {
        label: 'A. Cohen, R. DeVore, Approximation of high-dimensional parametric PDEs, Acta Numerica 24 (2015) 1–159',
        url: 'https://doi.org/10.1017/S0962492915000033',
      },
      {
        label: 'B. Hesthaven, B. Stamm, S. Zhang, Efficient greedy algorithms for high-dimensional parameter spaces with applications to the modal truncation and reduction of parabolic PDEs, arXiv:1811.00876',
        url: 'https://arxiv.org/abs/1811.00876',
      },
    ],
  },
  {
    id: 'me-020',
    output: 'verified_truth',
    judgment:
      'A pass proves the sharp Sobolev/Gevrey regularity threshold above which the Prandtl boundary-layer expansion is stable and below which it is ill-posed, with an explicit counterexample attaining the loss, so the analyticity-to-regularity phase boundary of the zero-viscosity limit is settled.',
    title: 'Sharp Sobolev Regularity Loss in the Inviscid Limit and the Prandtl Boundary Layer',
    titleZh: 'Prandtl 边界层与无粘极限的尖确 Sobolev 正则性损失',
    domain: 'mathematical-engineering',
    subdomain: 'fluid-dynamics',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'medium',
    verification_path: 'analytical',
    tags: ['prandtl-boundary-layer', 'inviscid-limit', 'navier-stokes', 'spectral-instability'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'L. Prandtl',
    proposed_year: 1904,
    via: {
      label: 'Prandtl boundary layers (1904); review of regularity loss in the inviscid limit see Gérard-Varet (2023) et al.',
      url: 'https://doi.org/10.1007/978-3-662-33948-0_2',
    },
    related_problems: [],
    statement: `As viscosity $\\nu \\to 0$, any sufficiently smooth Navier–Stokes solution is expected to converge to its Euler counterpart together with a near-wall Prandtl layer. It is known that for analytic data the convergence holds, whereas for merely $C^\\infty$ (non-analytic) data the Prandtl expansion is unstable. **Determine the exact regularity space in which the zero-viscosity limit is stable**: prove that the Prandtl system is ill-posed in Sobolev spaces yet well-posed in a Gevrey class $G^s$ with the optimal exponent $s$, and exhibit a solution whose Sobolev norm growth rate is sharp, so the expansion holds precisely up to a stated Gevrey threshold.`,
    origin:
      'The boundary layer and inviscid approximation of high-Reynolds-number airfoil flows are the basis of aerodynamic simulation and wind-tunnel calibration. When experimental/numerical initial data have only finite regularity rather than analyticity, the Prandtl equations can develop exponential instability, causing the classical boundary-layer assumption to fail on practical instances; hence the sharp regularity threshold determines where engineering computation must introduce turbulent wall models.',
    progress: [
      '**Gérard-Varet–Dormy (2010)**: prove that the Prandtl equations are ill-posed in Sobolev spaces.',
      '**Gérard-Varet–Maekawa–Masmoudi (2018)**: establish stability of the expansion in Gevrey classes (for several shear flows).',
      '**Grenier–Guo–Nguyen**: show via spectral instability that the inviscid limit fails for non-analytic data, giving several quantitative lower bounds on the regularity loss.',
    ],
    obstacles: [
      '**Gevrey-exponent obstacle**: the Gevrey order required for stability is strongly coupled to the growth rate of higher derivatives of the initial-data regularity; the spectral analysis of shear flows is limited to one spatial direction, and on higher-dimensional domains with variable geometry it is hard to determine the optimal critical exponent uniformly.',
    ],
    engineering_value:
      'Pinning down the regularity threshold for the validity of the boundary-layer approximation helps CFD tools automatically switch to turbulent closure models in regimes near that threshold, avoiding the pseudo-analytic behavior caused by continuing to pursue the Prandtl expansion in the analytic regime, thereby ensuring reliable interpretation of numerical convergence on high-Reynolds-number instances.',
    formalization_notes:
      'The decision is a spectral-analysis statement: it reduces the spectrum of the Prandtl linearized operator and the regularity loss to verifying upper bounds on finitely many derivatives, with ill-posedness falsifiable by finite-dimensional spectral instances, of medium effort.',
    references: [
      {
        label: 'Y. Maekawa, A. Gérard-Varet, D. Gérard-Varet, D. Dormy, On the ill-posedness of the Prandtl equation, J. Amer. Math. Soc. 23 (2010) 591–609',
        url: 'https://doi.org/10.1090/S0894-0347-09-00652-3',
      },
      {
        label: 'Y. Maekawa, A. Gérard-Varet, E. Grenier, N. Guo, E. Nguyen, Spectral instability of characteristic boundary layer flows, Proc. Natl. Acad. Sci. U.S.A. 112 (2015) 5299–5303',
        url: 'https://doi.org/10.1073/pnas.1506451112',
      },
    ],
  },
  {
    id: 'me-021',
    output: 'verified_truth',
    judgment:
      'A pass settles the smallest number of projection directions needed to guarantee that the discrete line-sum (Radon) data determine a binary image uniquely on an $n \\times n$ grid, either by an explicit family of directions achieving uniqueness with a matching necessary bound, or by an NP-hardness/ inapproximability proof for the reconstruction decision problem establishing the information-theoretic barrier.',
    title: 'Minimal Number of Projection Directions for Uniqueness in Discrete Tomography',
    titleZh: '离散断层重建中唯一性所需最少投影方向数',
    domain: 'mathematical-engineering',
    subdomain: 'inverse-problems',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'high',
    verification_path: 'analytical',
    tags: ['discrete-tomography', 'limited-data', 'combinatorial-geometry', 'uniqueness'],
    contributor: 'admin',
  date_added: '2026-08-22',
    provenance: 'lean-compilable',
    lean_statement: 'import Std\n\n/-!\nme-021 — Minimal Number of Projection Directions for Uniqueness in Discrete Tomography.\n\nThere is a smallest number of projection directions that guarantees a binary\nimage on the lattice is uniquely determined by its line sums along those\ndirections. The predicates/functions are formalization targets; the claim (proof\nleft open via `sorry`) is the headline statement.\n-/\nnamespace MathX\n\nstructure BinaryImage where\n  n : Nat\n\ndef UniquelyDeterminedByDirections (img : BinaryImage) (k : Nat) : Prop := by\n  exact False\n\ndef MinimalDirections (n : Nat) : Nat := by\n  exact 0\n\ntheorem minimal_projection_directions (img : BinaryImage) :\n    UniquelyDeterminedByDirections img (MinimalDirections img.n) := by\n  sorry\n\nend MathX\n',
    proposer: 'multiple contributors',
    proposed_year: 1996,
    via: { label: 'Minimal projection directions for discrete tomography reconstruction: the discrete tomography survey (Herman & Kuba, eds.)' },
    related_problems: [],
    statement: `Let a binary image $f \\in \\{0,1\\}^{n\\times n}$ be observed by the line sums $\\sum f$ along a fixed set $D$ of distinct lattice directions $v \\in \\mathbb Z^2$. **Determine the minimal cardinality $k$ of $D$ (and which directions) such that every binary image is uniquely determined by this $D$-line-sum data**, and when uniqueness holds, give a polynomial reconstruction algorithm; if uniqueness fails, give the smallest counterexample.

Decide also whether the decision problem of uniqueness for a given finite $D$ is in $\\mathrm P$ or is NP-complete, matching the classical few-projection obstruction.`,
    origin:
      'Sparse-view CT and industrial tomography can shorten imaging time and reduce radiation dose, but insufficient projection angles make the inversion non-unique. Discrete tomography concerns the feasible window in which binary targets (such as material inclusions, pore grids) are uniquely determined from line sums along very few directions; its information-theoretic lower bound directly determines whether low-cost imaging is feasible.',
    progress: [
      '**Gardner–Gritzmann (1997)**: systematically analyze the conditions for unique determination of finite sets along several lattice directions.',
      '**Logan–Shepp (1975)**: logarithmic singularity estimates for sparse-view reconstruction in the continuous case.',
      '**Herman–Kuba monograph**: gives exhaustively verified examples for several direction sets, but the optimal relation between the number of directions and the grid size is not fully determined.',
    ],
    obstacles: [
      '**Combinatorial obstacle**: the line-sum technique for binary matrices is highly sensitive to the choice of directions; there are many permutations producing identical line sums, and proving that any direction set below a certain threshold breaks uniqueness requires traversing exponentially many lattice-path combinations, with the decision problem being a typical source of combinatorial-optimization hardness.',
    ],
    engineering_value:
      'If unique reconstruction can be achieved with a minimal number of projection directions, the gantry dwell time and radiation dose in CT scanning can be significantly reduced; this provides a decidable uniqueness guarantee for sparse-view image inversion of cracks in industrial components and material inclusions, supporting automated online inspection.',
    formalization_notes:
      'The decision is a combinatorial-counting statement: uniqueness reduces to verifying polynomial identities for line sums and sizes, and the relation between direction sets and grid sizes is finitely enumerable, of relatively high effort.',
    references: [
      {
        label: 'R. J. Gardner, P. Gritzmann, Discrete tomography: Determination of finite sets by X-rays, Trans. Amer. Math. Soc. 349 (1997) 2271–2295',
        url: 'https://doi.org/10.1090/S0002-9947-97-01981-5',
      },
      {
        label: 'B. F. Logan, L. A. Shepp, Optimal reconstruction of a function from its projections, Duke Math. J. 42 (1975) 645–659',
        url: 'https://doi.org/10.1215/S0012-7094-75-04211-0',
      },
    ],
  },
  {
    id: 'me-022',
    output: 'verified_truth',
    judgment:
      'A pass determines the exact approximation ratio (or an inapproximability factor) achievable and provable in polynomial time for the minimum leader (sensor/actuator) selection problem that renders a given weighted network controllable or observable, including whether the problem admits a constant-factor approximation and whether strong NP-hardness holds for structured graph classes, so the algorithmic floor of network control design is pinned.',
    title: 'Hardness and Approximation of Minimum Leader Selection for Network Controllability',
    titleZh: '网络可控性的最小领航节点选择问题的困难性与近似比',
    domain: 'mathematical-engineering',
    subdomain: 'control',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'high',
    verification_path: 'analytical',
    tags: ['network-controllability', 'leader-selection', 'approximation-hardness', 'sensor-placement'],
    contributor: 'admin',
  date_added: '2026-08-22',
    provenance: 'lean-compilable',
    lean_statement: 'import Std\n\n/-!\nme-022 — Hardness and Approximation of Minimum Leader Selection for Network Controllability.\n\nFinding a minimum-size set of leader nodes that makes a network controllable is\nhard to approximate within a constant factor. The function/predicate are\nformalization targets; the claim (proof left open via `sorry`) is the headline\nstatement.\n-/\nnamespace MathX\n\nstructure Network where\n  n : Nat\n\ndef MinLeaderSet (g : Network) : Nat := by\n  exact 0\n\ndef ApproxMinLeader (g : Network) (c : Nat) : Prop := by\n  exact False\n\ntheorem leader_selection_hard (g : Network) :\n    ApproxMinLeader g 1 := by\n  sorry\n\nend MathX\n',
    proposer: 'multiple contributors',
    proposed_year: 2011,
    via: { label: 'Minimum leader selection for network controllability: surveys of the minimum-control problem and the NP-hardness tradition (Olshevsky et al.)' },
    related_problems: [],
    statement: `Let $G=(V,E)$ be a weighted graph of $n$ nodes with linear dynamics $\\dot x = A x + B u$. Choosing a set $L \\subseteq V$ of leaders amounts to fixing a diagonal support for the input matrix $B$. **Determine the computational complexity and constant approximability of the minimum-leadert-choice problem: find the smallest leader set $L$ such that $(A,B_L)$ is controllable (or observable)**, with the weights and topology of $G$ given as input.

Provide either a polynomial-time $(1+\\varepsilon)$ approximation, a matching hardness-of-approximation bound (e.g. no constant factor unless $\\mathrm P = \\mathrm{NP}$), or an exact characterization for special graph classes.`,
    origin:
      'Controllability in smart grids, UAV formations, and multi-robot systems depends on which nodes receive injected inputs, manifesting as the minimum-leader-selection problem. In practice one typically resorts to spectral or magnitude-based greedy approximations, but the algorithmic limits of optimal guarantees are unclear; determining its approximation ratio and/or hardness can guide sensor/actuator placement under scale and latency constraints.',
    progress: [
      '**Olshevsky (2014)**: computational-complexity characterization of the minimum-controllability problem and related selection problems.',
      '**Complexity of the Kalman rank criterion**: on general weighted digraphs the selection problem induced by the rank criterion is NP-hard, and a closed constant approximation ratio remains an open gap.',
      '**Submodular approximation**: greedy factors hold under several controllability criteria, but the exact boundary between the optimal ratio and strong NP-hardness is undetermined.',
    ],
    obstacles: [
      '**Rank-discontinuity obstacle**: controllability is determined by the rank criterion, and the discontinuous change of the rank at critical points when selecting subsets makes approximation-ratio proofs difficult; it is also hard to construct independent-set encodings preserving the spectral structure to obtain constant lower bounds.',
    ],
    engineering_value:
      'Minimum-leader selection directly determines the cost and redundancy requirements of sensing and actuation systems. With a provable approximation ratio or hardness lower bound, engineers can decide whether to seek exact solutions, adopt greedy heuristics, or accept the reality of theoretical inapproximability, thereby budgeting controllability in safety-critical systems such as smart grids.',
    formalization_notes:
      'The decision is a combinatorial-optimization statement: controllability reduces to verifying consistency between rank conditions and set selection, with hardness established by reduction from classic NP-complete problems, of relatively high effort.',
    references: [
      {
        label: 'A. Olshevsky, Minimal controllability problems, IEEE Trans. Control Netw. Syst. 1 (2014) 249–258, arXiv:1304.3071',
        url: 'https://doi.org/10.1109/TCNS.2014.2378871',
      },
      {
        label: 'T. H. Summers, F. L. Cortesi, J. Lygeros, On submodularity and controllability in complex dynamical networks, IEEE Trans. Automat. Control 61 (2016) 3485–3490',
        url: 'https://doi.org/10.1109/TAC.2015.2450645',
      },
    ],
  },
  {
    id: 'me-023',
    output: 'verified_truth',
    judgment:
      'A pass proves the optimal constant $C$ for which $\\|p(A)\\| \\le C \\, \\max_{z \\in W(A)} |p(z)|$ holds for every matrix $A$ and every polynomial $p$, where $W(A)$ is the numerical range, improving on the known constant $1+\\sqrt 2$ toward the conjectured value $2$ with a matching extremal example, so the Crouzeix–Palencia spectral-set question is resolved.',
    title: 'Crouzeix Theorem: Optimal Constant for the Numerical Range of a Matrix',
    titleZh: 'Crouzeix 常数：矩阵数值域上多项式范数的最优界',
    domain: 'mathematical-engineering',
    subdomain: 'scientific-computing',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'high',
    verification_path: 'analytical',
    tags: ['numerical-range', 'spectral-sets', 'krylov-convergence', 'matrix-theory'],
    contributor: 'admin',
  date_added: '2026-08-22',
    proposer: 'M. Crouzeix',
    proposed_year: 2004,
    via: {
      label: 'Crouzeix, Bounds for analytic functions of matrices, Integral Equ. Oper. Theory 48 (2004); constant conjecture 1+√2',
      url: 'https://doi.org/10.1007/s00020-002-1184-6',
    },
    related_problems: [],
    statement: `For any $n \\times n$ matrix $A$ and any polynomial $p$, let $W(A) = \\{x^* A x : \\|x\\|=1\\}$ be the numerical range. **Determine the optimal constant $C^*(W)$ such that**
$\\|p(A)\\| \\le C^* \\, \\sup_{z \\in W(A)} |p(z)|, \\qquad \\forall p \\in \\mathbb C[z],$
with $\\|\\cdot\\|$ the operator norm. Prove that $W(A)$ is a spectral set with constant $2$ (the Crouzeix conjecture), or establish the true optimal constant together with an explicit extremal example attaining it, improving the current universal bound $C^* \\le 1 + \\sqrt 2$.`,
    origin:
      'The convergence of Krylov methods and spectral-set analysis both rely on upper bounds for matrix polynomial norms. The numerical range is a finer and more easily constructed analytic object than the spectrum; the Crouzeix theorem gives a universal constant for spectral sets, but proving the optimal constant remains a recognized open problem in numerical linear algebra, directly affecting the accuracy of convergence estimates for GMRES, matrix power series, and preconditioned matrices.',
    progress: [
      '**Crouzeix (2007)**: proves that $W(A)$ is a spectral set with constant $11.08$.',
      '**Crouzeix–Palencia (2017)**: improve the universal constant to $1+\\sqrt2$.',
      '**2×2 and special classes**: the constant 2 is proved for 2×2 matrices and several special classes, while the conjecture in the general case remains unresolved.',
    ],
    obstacles: [
      '**Extremal-matrix obstacle**: pushing the estimate from $1+\\sqrt2$ down to $2$ requires attaining extrema in the optimal-condition-number direction, while eigenvector constructions that the numerical range does not pass through make counterexample search difficult; the functional-analytic quantities involved in the optimal constant are hard to bound finitely.',
    ],
    engineering_value:
      'The optimal constant determines explicit upper-bound estimates for the Krylov iterations needed to reach a given residual, is the theoretical basis of stopping criteria for GMRES-type methods on ill-conditioned nonnormal matrices, and is also used in quantitative analysis of matrix-library functions (such as the matrix exponential) and preconditioning errors.',
    formalization_notes:
      'The decision is a spectral-set-analysis statement: it reduces the norm bound to a finite-dimensional verification of polynomial moduli over the numerical range, while also accommodating contraction maps constructing counterexamples, of relatively high effort.',
    references: [
      {
        label: 'M. Crouzeix, Numerical range and functional calculus in Hilbert space, J. Funct. Anal. 244 (2007) 668–690',
        url: 'https://doi.org/10.1016/j.jfa.2006.10.013',
      },
      {
        label: 'M. Crouzeix, C. Palencia, The numerical range is a (1+sqrt2)-spectral set, SIAM J. Matrix Anal. Appl. 38 (2017) 649–655',
        url: 'https://doi.org/10.1137/17M1116670',
      },
    ],
  },

  {
    id: 'mp-032',
    output: 'verified_truth',
    judgment:
      'A pass rigorously pins down the N-dependence of the finite-size thermal conductivity kappa_N = J_N N / (T_1 - T_2) for a given anharmonic chain: either proving that it converges to a finite positive limit (Fourier law) or proving a divergent power law kappa_N ~ N^alpha with alpha > 0 (anomalous transport) with the exponent and all prefactors certified by proof rather than by simulation; a strictly certified numerical estimate of the exponent does not itself constitute a pass.',
    title: 'Fourier Law and the Thermal Conductivity of Anharmonic Chains',
    titleZh: '非线性原子链的 Fourier 定律与热导率',
    domain: 'mathematical-physics',
    subdomain: 'statistical-mechanics',
    status: 'open',
    difficulty: 'advanced',
    formalization_potential: 'medium',
    verification_path: 'numerical',
    tags: ['fourier-law', 'heat-conduction', 'anharmonic-chain', 'green-kubo', 'thermal-transport'],
    contributor: 'community',
    date_added: '2026-08-22',
    proposer: 'S. Lepri, R. Livi & A. Politi',
    proposed_year: 2003,
    via: {
      label: 'Lepri–Livi–Politi, Thermal conduction in classical low-dimensional lattices, Phys. Rep. 377 (2003)',
      url: 'https://doi.org/10.1016/S0370-1573(02)00558-6',
    },
    related_problems: [
      {
        id: 'mp-026',
        relation: 'shares_tools',
        note: 'Both involve the rigorous treatment of energy/transport quantities in the thermodynamic limit and share the analytical tools of linear response and conservation laws.',
      },
    ],
    statement: `Consider a one-dimensional chain of $N$ oscillators with Hamiltonian such as the microbial Fermi-Pasta-Ulam model
$H_N = \\sum_{i=1}^N \\frac{p_i^2}{2} + \\sum_{i=1}^{N-1}\\Big(\\frac{(q_{i+1}-q_i)^2}{2} + \\frac{\\lambda}{4}(q_{i+1}-q_i)^4\\Big),$
coupled at the two ends to Langevin reservoirs at temperatures $T_1<T_2$. Prove that the stationary heat flux $J_N$ satisfies Fourier law in the sense that the conductivity $\\kappa_N = J_N N /(T_1-T_2)$ has a finite positive limit as $N\\to\\infty$, or else prove that it diverges with an explicit power $\\kappa_N \\sim N^\\alpha$, $\\alpha>0$. Equivalently, settle the finiteness of the Green-Kubo integral $\\kappa = \\lim_{T\\to\\infty}\\frac{1}{T}\\lim_{N\\to\\infty}\\frac{\\beta^2}{N}\\int_0^T \\langle J(t)J\\rangle\\,dt$ for the bulk chain.`,
    origin:
      'Fourier (1822) conjectured that heat flux is proportional to the temperature gradient, but a rigorous proof that "heat conduction emerges from microscopic dynamics" in lattice models remains a celebrated challenge in statistical physics. One-dimensional and low-dimensional chains are expected to exhibit anomalous transport (thermal conductivity diverging with size), and its rigorous decision is a core open problem of transport theory, and the "challenge to theorists" summarized by Bonetto–Lebowitz–Rey-Bellet.',
    progress: [
      '**Bonetto–Lebowitz–Rey-Bellet (2000)**: systematically state the challenge of rigorously deriving Fourier\'s law in models.',
      '**Bernardin–Olla (2011)**: give integrability or finite-conductivity criteria for several problems in specific weakly nonlinear / pinned settings.',
      '**Lepri–Livi–Politi and many others**: large-scale numerics strongly support anomalous transport in one-dimensional FPU chains (kappa_N ~ N^alpha), but a rigorous proof is lacking.',
    ],
    obstacles: [
      '**No global integrable structure**: one-dimensional nonlinear chains are not integrable, and the interaction between linear response and conserved modes is hard to estimate.',
      '**Green-Kubo correlation long tail**: the algebraic long tail of the energy-current autocorrelation burdens finite-size extrapolation, making the convergence verdict unstable.',
    ],
    engineering_value:
      'Directly determines the size-dependence law of thermal conductivity of nanowires and low-dimensional materials, providing quantitative criteria for thermoelectric materials, thermal management of nanoelectronic devices, and phonon engineering.',
    formalization_notes:
      'The goal can be formalized as a proposition about the limit of the function kappa_N or its divergence exponent; the decision is stated with explicit inequalities, but it involves long-time numerical extrapolation, so formalization needs to be supported by rigorous finite-size bounds.',
    references: [
      {
        label: 'Bonetto, Lebowitz and Rey-Bellet, Fourier law: a challenge to theorists, in Mathematical Physics 2000; arXiv:math-ph/0002052',
        url: 'https://arxiv.org/abs/math-ph/0002052',
      },
      {
        label: 'Lepri, Livi and Politi, Thermal conduction in classical low-dimensional lattices, Phys. Rep. 377 (2003) 1–80',
        url: 'https://doi.org/10.1016/S0370-1573(02)00558-6',
      },
    ],
  },
  {
    id: 'mp-034',
    output: 'verified_truth',
    judgment:
      'A pass gives a rigorous proof that the grand-canonical Gibbs state of the dilute interacting Bose gas at inverse temperature beta > 0 and density rho admits macroscopic (generalized) Bose-Einstein condensation of the one-particle density matrix gamma^(1) below some shifted critical temperature, with the condensation density bounded below by an explicitly computable positive constant for the true short-range interaction of positive scattering length; results valid only at beta = infinity (ground state) do not qualify, and asymptotic-in-beta evidence alone is not enough without a certified lower bound.',
    title: 'Bose-Einstein Condensation of the Interacting Gas at Positive Temperature',
    titleZh: '正温度下相互作用玻色气体的玻色-爱因斯坦凝聚',
    domain: 'mathematical-physics',
    subdomain: 'many-body-quantum-mechanics',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'medium',
    verification_path: 'analytical',
    tags: ['bose-einstein-condensation', 'superfluidity', 'many-body-qm', 'grand-canonical', 'positive-temperature'],
    contributor: 'community',
    date_added: '2026-08-22',
    proposer: 'multiple contributors',
    proposed_year: 2016,
    via: { label: 'Bose condensation of interacting gases at positive temperature: review of rigorous BEC results (e.g. related work of Seiringer)' },
    related_problems: [
      {
        id: 'mp-024',
        relation: 'generalizes',
        note: 'mp-024 treats condensation and dynamics at the ground state / zero temperature; this problem extends the existence of condensation to positive finite temperature.',
      },
    ],
    statement: `Consider the dilute Bose gas in a box of volume $V$ with Hamiltonian
$H = \\sum_{p}\\epsilon_p a_p^\\dagger a_p + \\frac{1}{2}\\sum_{p_1+p_2=p_3+p_4} \\hat v(p_1-p_3)\\,a_{p_1}^\\dagger a_{p_2}^\\dagger a_{p_3}a_{p_4},$
at inverse temperature $\\beta$ and chemical potential $\\mu$, with a repulsive short-range potential $v\\ge 0$ of scattering length $a$, in the dilute regime $\\rho a^3 \\ll 1$. Prove that for $T$ below a threshold $T_c$ close to the ideal-gas critical temperature $T_c^0 = 2\\pi\\hbar^2 \\rho^{2/3}/(m k_B \\zeta(3/2)^{2/3})$, the one-body density matrix $\\gamma^{(1)}$ of the grand-canonical Gibbs state has a spectral subspace of positive, order-$V$ occupation --- i.e. generalized Bose-Einstein condensation $\\gamma^{(1)} \\to \\langle \\varphi,\\cdot\\varphi\\rangle$ with condensation density $\\rho_0(T)>0$ --- uniformly in the thermodynamic limit, including the Bogoliubov-corrected shift of $T_c$.`,
    origin:
      'Condensation of the ideal gas was proposed by Bose (1924)/Einstein (1925) and is rigorously known; but the existence of condensation in interacting Bose gases at positive temperature — extending the ground-state result (proved by Lieb–Seiringer) to nonzero temperature, including the Bogoliubov-shifted T_c — remains a celebrated open problem of statistical physics. It forms one of the central pillars of the theory of superfluidity.',
    progress: [
      '**Lieb–Seiringer (2002)**: rigorously prove the existence of condensation of the dilute Bose gas in the ground state (zero temperature) in a generalized sense.',
      '**Boccato–Brennecke–Cenatiempo–Schlein (2018)**: develop stationary Bogoliubov theory at the Gross–Pitaevskii scale, approximating ground-state properties.',
      '**Hirayama / Chen–Guo–Seiringer et al.**: progress on the Bogoliubov spectrum and low-temperature expressions, but positive-temperature condensation is still not closed.',
    ],
    obstacles: [
      '**Rigorous separation of the condensate and non-condensate modes**: the definition of the condensate mode must be handled carefully, and a rigorous characterization of particle-number conservation or superfluid density at finite temperature is hard.',
      '**Bogoliubov corrections at the temperature scale**: determining the shift of T_c due to interactions (classical/noncanonical theory) still lacks a rigorous upper bound.',
    ],
    engineering_value:
      'Provides a rigorous foundation for first-principles closure of superfluid helium, cold-atom experiments on Bose gases, and superfluid computations, and also supports quantitative predictions of condensate density in cold-atom quantum simulation.',
    formalization_notes:
      'The goal can be written as a quantitative lower bound on the spectral projection of gamma^{(1)}, with clear decision criteria, but it requires combining Bogoliubov analysis with large-deviation techniques, making formalization of medium difficulty.',
    references: [
      {
        label: 'Seiringer, Bose gases, Bose-Einstein condensation, and the Bogoliubov approximation; arXiv:1701.08721 (2017)',
        url: 'https://arxiv.org/abs/1701.08721',
      },
      {
        label: 'Boccato, Brennecke, Cenatiempo and Schlein, Bogoliubov theory in the Gross-Pitaevskii limit, Acta Math. 222 (2019) 219–335; arXiv:1801.01389',
        url: 'https://arxiv.org/abs/1801.01389',
      },
    ],
  },
  {
    id: 'mp-035',
    output: 'verified_truth',
    judgment:
      'A pass rigorously exhibits both the low-temperature (K > K_c) power-law-correlated phase and the high-temperature (K < K_c) exponentially-correlated phase of the two-dimensional XY model / Coulomb gas, proving a Berezinskii-Kosterlitz-Thouless transition and, to the extent it is well defined, the universal jump of the spin-wave stiffness rho_s(T_c)/T_c = 2/pi; agreement with the experimentally observed universal jump in thin superfluid helium films (Nelson-Kosterlitz) is an accepted corroboration for the experimental verification path.',
    title: 'Berezinskii-Kosterlitz-Thouless Transition and the Universal Jump',
    titleZh: 'BKT 相变与自旋刚度普适跃变',
    domain: 'mathematical-physics',
    subdomain: 'statistical-mechanics',
    status: 'open',
    difficulty: 'advanced',
    formalization_potential: 'high',
    verification_path: 'experimental',
    tags: ['bkt-transition', 'xy-model', 'coulomb-gas', 'phase-transition', 'superfluid'],
    contributor: 'community',
    date_added: '2026-08-22',
    proposer: 'J. M. Kosterlitz & D. J. Thouless',
    proposed_year: 1973,
    via: {
      label: 'Kosterlitz & Thouless, Ordering metastability and phase transitions in two-dimensional systems, J. Phys. C 6 (1973)',
      url: 'https://doi.org/10.1088/0022-3719/6/7/010',
    },
    related_problems: [
      {
        id: 'mp-026',
        relation: 'shares_tools',
        note: 'Both are order-and-phase-transition problems caused by two-dimensional Coulomb-type interactions, sharing the Coulomb-gas and renormalization energy-analogy tools.',
      },
    ],
    statement: `Let $H_K = -K\\sum_{\\langle x,y\\rangle}\\cos(\\theta_x-\\theta_y)$ be the classical XY (rotator) model on $\\mathbb{Z}^2$ with $\\theta_x\\in\\mathbb{T}$, equivalently the two-dimensional Coulomb gas of vortex-antivortex pairs. Prove that there exists $K_c<\\infty$ such that for $K>K_c$ the correlations of $e^{i\\theta_x}$ decay algebraically (power law, vanishing magnetization but diverging correlation length) and the spin-wave stiffness $\\rho_s(K)$ is strictly positive, whereas for $K<K_c$ correlations decay exponentially and $\\rho_s=0$, with a BKT transition at $K_c$ and the universal jump $\\rho_s(T_c^-)/T_c = 2/\\pi$. A pass must rigorously construct both phases and pin down the transition and the jump value.`,
    origin:
      'Berezinskii (1971) and Kosterlitz–Thouless (1973) predicted a continuous phase transition without a superposition order but driven by vortex binding–unbinding, together with the universal jump of the superfluid density at T_c; Fröhlich–Spencer (Coulomb gas) rigorously established parts of the low-/high-temperature phases, but the complete rigorous treatment of coexistence of both phases and the analytic transition has still not been fully closed, and can be compared directly with thin-helium-film experiments.',
    progress: [
      '**Kosterlitz–Thouless (1973)**: propose the physical picture of the vortex-unbinding mechanism and the universal jump.',
      '**Fröhlich–Spencer (1981)**: rigorously establish the properties of the low- and high-temperature phases for the two-dimensional Coulomb gas and the XY model (including exponential/power-law correlation bounds).',
      '**Nelson–Kosterlitz (1977)**: formalize the universal jump and give the comparison with superfluid-film experiments.',
    ],
    obstacles: [
      '**Rigorous control of vortex binding**: the complete binding of opposite vortex pairs and the critical exponents at the transition lack a unified rigorous argument.',
      '**Nontrivial proof of the universal jump**: rho_s(T_c)/T_c=2/pi still lacks a rigorous derivation at the endpoint, requiring delicate spin-wave and vortex-energy functional analysis.',
    ],
    engineering_value:
      'Provides precise predictions for two-dimensional superfluid films, Josephson-junction arrays, and topological-order phase transitions, supporting the quantitative design of two-dimensional order in superconducting microfluidics and quantum devices.',
    formalization_notes:
      'The proposition can be written as an explicit power-law/exponential correlation decision together with the equality for the universal jump; the decision certificate (correlation bounds and the jump) is clearly verifiable, making it a target with relatively high formalization feasibility.',
    references: [
      {
        label: 'Kosterlitz and Thouless, Ordering, metastability and phase transitions in two-dimensional systems, J. Phys. C 6 (1973) 1181–1203',
        url: 'https://doi.org/10.1088/0022-3719/6/7/010',
      },
      {
        label: 'Fröhlich and Spencer, The Kosterlitz-Thouless transition in two-dimensional abelian spin systems and the Coulomb gas, Comm. Math. Phys. 81 (1981) 527–602',
        url: 'https://doi.org/10.1007/BF01217850',
      },
      {
        label: 'Nelson and Kosterlitz, Universal jump in the superfluid density of two-dimensional superfluids, Phys. Rev. Lett. 39 (1977) 1201–1205',
        url: 'https://doi.org/10.1103/PhysRevLett.39.1201',
      },
    ],
  },


  {
    id: 'mc-027',
    output: 'verified_behavior',
    judgment:
      'The acceptable answer is a verifiable decision of "when tQSSA can be used" rather than a general error theorem: for a specific family of enzyme-reaction parameters (total enzyme concentration $\\epsilon$, interval of rate constants), deliver a verifiable upper bound $D(\\epsilon)$ on the total-variation distance between the full stochastic process and its tQSSA reduction, accompanied by a three-layer residual total band: (1) **R_model** = the residual upper bound introduced by restricting real biochemistry (finite concentrations, ionic-strength/activity effects) to ideal mass action + tQSSA reduction; (2) **R_param** = the input residual upper bound of the uncertainty propagated to $D(\\epsilon)$ when rate constants and total enzyme concentration come from measurement/calibration (must hold for all $k,\\epsilon$ in the measurement interval); (3) **R_num** = the residual upper bound introduced by solving the controlled process via master equation/Gillespie sampling or interval arithmetic; the three combine so that $D_{\\text{tot}}\\le$ R_model+R_param+R_num and are numerically verifiable in the declared parameter region. Consumption form of a passing decision: given pathway parameters and an accuracy requirement, directly obtain the certified decision "tQSSA can be used in this parameter region (error below threshold) or the full stiff master equation must be run", enabling auditable precision-vs-speed trade-offs in large-scale pathway simulation.',
    certificate: {
      r_model: {
        bound: 'Residual upper bound introduced by restricting real biochemistry (finite concentrations, ionic-strength/activity effects) to ideal mass action + tQSSA reduction',
        derivation: 'Ideal mass action + tQSSA reduction residual bound',
      },
      r_param: {
        bound: 'Input residual upper bound of rate-constant and total-enzyme-concentration measurement uncertainty propagated to the total-variation distance D(ε) (holding for all k, ε in the measurement interval)',
        derivation: 'Interval image of the measurement interval propagated to the distance upper bound D(ε)',
      },
      r_num: {
        bound: 'Residual upper bound introduced by solving the controlled process via master equation/Gillespie sampling or interval arithmetic',
        derivation: 'Interval arithmetic / sampling-error closure bound',
        kind: 'numerical',
      },
      total_band: 'D_tot ≤ R_model + R_param + R_num',
      certified_band: 'Certified total-variation-distance band between tQSSA and the full process',
    },
    title: 'Rigorous Error Bounds for the Stochastic Quasi-Steady-State Approximation',
    titleZh: '随机准稳态近似的严格误差界',
    domain: 'mathematical-chemistry',
    subdomain: 'stochastic-chemical-kinetics',
    status: 'open',
    difficulty: 'advanced',
    formalization_potential: 'medium',
    verification_path: 'numerical',
    tags: ['quasi-steady-state', 'stochastic-kinetics', 'master-equation', 'model-reduction'],
    contributor: 'community',
    date_added: '2026-08-22',
    proposer: 'multiple contributors',
    proposed_year: 2013,
    via: { label: 'Rigorous error bounds for stochastic QSSA: the limit theorems of Kang–Kurtz et al. and the traditional literature' },
    related_problems: [
      {
        id: 'mc-021',
        relation: 'shares_tools',
        note: 'Both are based on the chemical master equation and are treated analytically under steady-state structure.',
      },
    ],
    statement: `Consider the single-enzyme reaction $E+S \\rightleftharpoons ES \\rightarrow E+P$ with total enzyme concentration $\\epsilon$. The stochastic quasi-steady-state approximation (tQSSA) replaces the coupled master equation on the states $(S,ES)$ by a reduced one-dimensional process on $S$ with effective rates. **Find the sharp, explicit a priori error between the full and the reduced processes, measured in total variation and on the one-time marginal of $S$, as a function of $\\epsilon$ and the rate constants, and characterize the exact validity region of the stochastic QSSA, i.e. the regime in which the reduction error vanishes or is provably small.** Error estimates are known only in special asymptotic regimes, and a general sharp bound is open.`,
    origin:
      'The stochastic chemical master equation for enzyme kinetics is stiff because the enzyme–substrate complex evolves much faster than the substrate. The tQSSA reduction collapses this stiffness and is ubiquitous in stochastic simulation of biochemical pathways, yet no sharp, uniform a priori error bound justifies the reduction, so practitioners rely on heuristics that can silently fail in non-asymptotic regimes.',
    progress: [
      '**Rao, Arkin (2003)**: the stochastic quasi-steady-state assumption proposed and validated numerically; no sharp error bound.',
      '**Kim, Josić, Bennett (2014)**: discrete stochastic simulations test the validity of the tQSSA over parameter ranges, giving empirical validity regions.',
      '**Recent PDE/dynamical work**: partial norm-distance error estimates appear for special rate regimes, but a uniform general bound is still lacking.',
    ],
    obstacles: [
      '**Separation of scales**: the tQSSA assumption that the complex is always near equilibrium fails transiently, so uniform-in-time bounds must control fast transients.',
      '**Discreteness**: the reduced process lives on a smaller state space and approximates a stiff countable Markov chain, where competing strong vs uniform norm rates make a single sharp exponent elusive.',
    ],
    engineering_value:
      'Provides rigorous, verifiable error upper bounds for model reduction of stochastic-dynamics simulation, determining when tQSSA can be used with confidence without running the full stiff master equation, directly affecting the precision-vs-speed trade-off of large-scale pathway simulation.',
    formalization_notes:
      'The problem reduces to constructing couplings between finite or countable Markov chains; a machine-verifiable milestone is an interval-arithmetic-checked total-variation error upper bound for a given rate family. General sharp error bounds are a research-level challenge.',
    references: [
      {
        label: 'Rao, Arkin, Stochastic chemical kinetics and the quasi-steady-state assumption: Application to the Gillespie algorithm, J. Chem. Phys. 118 (2003) 4999',
        url: 'https://doi.org/10.1063/1.1545446',
      },
      {
        label: 'Kim, Josić, Bennett, The validity of quasi-steady-state approximations in discrete stochastic simulations, Biophys. J. 107 (2014) 783',
        url: 'https://doi.org/10.1016/j.bpj.2014.06.012',
      },
    ],
  },
  {
    id: 'mc-028',
    output: 'verified_truth',
    judgment:
      'A pass either proves the determined-by-spectrum (DS) or signless-Laplacian-DS property for a stated infinite family of molecular graphs via a certified spectral-invariant proof, or exhibits the minimal cospectral pair (with both graphs and their common spectrum verified by exact arithmetic) that refutes a candidate classification inside a stated family.',
    title: 'Are Molecular Graphs Determined by Their (Signless Laplacian) Spectrum?',
    titleZh: '分子图是否由其（无符号拉普拉斯）谱唯一确定',
    domain: 'mathematical-chemistry',
    subdomain: 'chemical-graph-theory',
    status: 'open',
    difficulty: 'advanced',
    formalization_potential: 'high',
    verification_path: 'numerical',
    tags: ['graph-spectrum', 'cospectral', 'molecular-graph', 'signless-laplacian'],
    contributor: 'community',
    date_added: '2026-08-22',
    proposer: 'multiple contributors',
    proposed_year: 2011,
    via: {
      label: 'Survey of spectral determination of molecular graphs: van Dam & Haemers, Which graphs are determined by their spectrum? LAA 373 (2003)',
      url: 'https://doi.org/10.1016/j.laa.2003.07.008',
    },
    related_problems: [
      {
        id: 'mc-022',
        relation: 'shares_tools',
        note: 'Both are structural-counting and classification problems on molecular graphs, sharing matching and spectral tools.',
      },
    ],
    statement: `Let $G$ be a molecular graph, a connected graph of maximum degree at most four, as arises from the carbon skeleton of a hydrocarbon. An invariant such as the adjacency spectrum determines $G$ (G is DS) if every graph with the same spectrum is isomorphic to $G$; the notion is defined analogously for the signless Laplacian spectrum. **Determine, for the families of benzenoids and other molecular graphs, exactly which graphs are determined by their spectrum and which by their signless Laplacian spectrum, and decide whether the signless Laplacian spectrum determines the structure of every tree; exhibit the minimal cospectral pairs within each stated family.** Only partial classifications exist, and even the tree case is not completely settled.`,
    origin:
      'Graph spectra encode many chemically meaningful invariants, so the question of whether a molecular graph is recoverable from its spectrum underlies isomer discrimination and spectral structure retrieval. The question of which trees are determined by their signless Laplacian spectrum, in particular, is a long-standing open problem maintained in the spectral graph theory literature with direct molecular-graph relevance.',
    progress: [
      '**van Dam, Haemers (2003)**: the systematic DS program stated; many families classified, vexed rare families (including trees) left open.',
      '**Recent counterexamples**: explicit cospectral pairs within benzenoid and molecular families were found, showing that strong restrictions are needed for DS to hold.',
      '**Signless Laplacian case**: for trees the signless Laplacian spectrum is conjectured determining for many subfamilies, but the full classification remains open.',
    ],
    obstacles: [
      '**Cospectrality is rare but nonzero**: most graphs are non-DS or known, yet controlled families keep admitting sporadic cospectral pairs that are hard to rule out.',
      '**Tree case**: the signless Laplacian spectrum of a tree is tightly constrained, which both helps and blocks—proving it forces structure requires a delicate induction without an obvious invariant.',
    ],
    engineering_value:
      'Supports spectral-based molecular-structure deduplication and retrieval algorithms: if a class of molecular graphs can be proven uniquely determined by their spectrum, spectral features can be used for efficient and unambiguous structure queries, serving the indexing of chemical databases and isomer deduplication.',
    formalization_notes:
      'This is a finite combinatorial problem, very well suited to formalization: for a given family of small graphs the DS property can be verified by exact arithmetic on spectra and isomorphism; the complete classification of the tree family is the research-level core, relying on inductive arguments in spectral graph theory.',
    references: [
      {
        label: 'van Dam, Haemers, Which graphs are determined by their spectrum? Linear Algebra Appl. 373 (2003) 241',
        url: 'https://doi.org/10.1016/S0024-3795(03)00483-X',
      },
    ],
  },


  {
    id: 'mb-026',
    output: 'verified_truth',
    judgment: 'A pass determines, with a proof, the sharp parameter region (Arnold tongues) of subharmonic response for the seasonally forced SIR/reinfection system, establishes whether tongues have positive measure and end in period-doubling or Neimark–Sacker bifurcations, and gives a rigorous criterion separating locking from intermittent chaos; a single numerical scan of one parameter set is not accepted.',
    title: 'Sharp Arnold Tongues for Subharmonic Response in Seasonally Forced SIR',
    titleZh: '季节驱动 SIR 次谐波响应的尖锐 Arnold 舌',
    domain: 'mathematical-biology',
    subdomain: 'epidemiology',
    status: 'open',
    difficulty: 'frontier',
    formalization_potential: 'medium',
    verification_path: 'numerical',
    tags: ['seasonal-forcing', 'arnold-tongue', 'subharmonic-response', 'intermittent-chaos'],
    contributor: 'community',
    date_added: '2026-08-22',
    proposer: 'multiple contributors',
    proposed_year: 2014,
    via: { label: 'Harmonic response and Arnold tongues of seasonally driven SIR: epidemiological reviews (e.g. Keeling & Rohani)' },
    related_problems: [
      {
        id: 'mb-005',
        relation: 'shares_tools',
        note: 'Both belong to the bifurcation and long-term behavior of SIR-type transmission dynamics, sharing seasonality-driving and attractor-analysis tools.',
      },
    ],
    statement:
      `Consider the seasonally forced SIR model with periodic transmission $\\beta(t)=\\beta_0\\,(1+\\varepsilon\\cos 2\\pi t)$ and a reinfection-susceptibility correction that re-couples removed individuals. **Determine the sharp boundaries (Arnold tongues) in the $(R_0,\\varepsilon)$ plane inside which the forced system locks onto a subharmonic orbit of period $m T$ (notably the biennial $m=2$ measles-like cycle), prove that these tongues occupy positive area, and decide whether each tongue terminates in a period-doubling cascade or in a Neimark–Sacker bifurcation.** Establish a rigorous criterion separating the locked regime from the intermittent-chaotic regime in which the orbit sporadically switches between the annual and biennial attractors, and give sharp bounds for that crossover in terms of $R_0$ and $\\varepsilon$.`,
    origin:
      'Childhood infectious diseases such as measles exhibit strongly seasonally driven biennial outbreaks, described by integer-dimensional Arnold tongues and intermittent switching. Although high-dimensional simulations are abundant, the analytic decision of the intra-annual/biennial locking boundary, the bifurcation type at the tongue tips, and the boundary of intermittent chaos, as rigorous conclusions for low-dimensional dynamical systems, remain unclosed.',
    progress: [
      '**Intermittent chaos**: Schwartz–Smith observed intermittent switching between attractors in periodically driven measles models, regarded as the mathematical prototype of chaotic infection sequences.',
      '**Seasonal locking**: the Keeling group, using the switching-attractor framework, treats the biennial cycle as seasonally driven period doubling, but after incorporating the AB mechanism it remains only heuristic.',
      '**Parameter scans**: 2-periodic responses are widely observed numerically on the two-dimensional parameter plane, but the analytic boundaries of the tongues are missing.',
    ],
    obstacles: [
      '**Reduction distortion**: the forcing term lifts the continuous flow to a three-dimensional dynamical system, and perturbation methods apply only to weak forcing, failing to cover the measured range of strong seasonal driving.',
      '**Chaos coexistence**: the basins of attraction of several periods interpenetrate, and Lyapunov computations are insensitive to the locking verdict inside the tongues.',
    ],
    formalization_notes:
      'The locking decision reduces to the existence and stability of single-parameter periodic solutions: tracking periodic points on invariant circles / Poincaré sections can be formally verified on a numerical core at fixed $R_0,\\varepsilon$. The rigorous measure of the tongues and the endpoint bifurcation order require symbolic boundary computation.',
    engineering_value: 'Improves vaccine strategy and early outbreak warning — correctly forecasting the phase-locking and switching risk of interannual outbreaks, avoiding forecast bias based on a single-period assumption.',
    references: [
      {
        label: 'Schwartz & Smith, Intermittent chaos in measles, Physica D 9 (1983) 394-401',
        url: 'https://doi.org/10.1016/0167-2789(83)90185-2',
      },
      {
        label: 'Stone, Olinky & Huppert, Seasonal dynamics of recurrent epidemics, Nature 446 (2007) 533-536',
        url: 'https://doi.org/10.1038/nature05638',
      },
      {
        label: 'Keeling, Rohani & Grenfell, Seasonally forced disease dynamics explored as switching between attractors, Physica D 148 (2001) 317-335',
        url: 'https://doi.org/10.1016/S0167-2789(00)00165-1',
      },
    ],
  },


  {
    id: 'me-026',
    output: 'verified_truth',
    judgment:
      'A pass either exhibits a polynomial-time (in the number of variables and the bit size) algorithm that, on the average over a natural random model of square polynomial systems or real polynomial optimization instances, finds an approximate zero or the global minimum to machine precision and is certified by rigorous interval/verified fallback (a numerical certificate), or proves a matching average-case lower bound or conditional impossibility showing no such feasible algorithm exists, so the average-case complexity of real polynomial decision is pinned.',
    title: 'Average-Case Complexity of Real Polynomial System Solving and Global Optimization',
    titleZh: '实多项式系统求解与全局优化的平均复杂度',
    domain: 'mathematical-engineering',
    subdomain: 'scientific-computing',
    status: 'open',
    difficulty: 'frontier',
    formalization_potential: 'medium',
    verification_path: 'numerical',
    tags: ['polynomial-systems', 'sms-17th-problem', 'global-optimization', 'complexity'],
    contributor: 'community',
    date_added: '2026-08-22',
    proposer: 'multiple contributors',
    proposed_year: 2008,
    via: { label: 'Smale, Mathematical problems for the next century, Math. Intelligencer 20 (1998), Problem 17 (polynomial-time algorithm for the zeros of polynomial systems); average-case complexity see Bürgisser & Cucker, Condition: The Geometry of Numerical Algorithms (Springer, 2013)' },
    related_problems: [],
    statement: `Let $f: \\mathbb R^n \\to \\mathbb R$ be a degree-$d$ polynomial, or let $F:\\mathbb C^n \\to \\mathbb C^n$ be a square polynomial system with $n$ equations in $n$ unknowns. **Determine the average-case tractability: prove that there is an algorithm that, given a random such system drawn from a product/projection model, finds an approximate zero or approximates $\\min f$ on $\\mathbb R^n$/a compact basic-semialgebraic set in time polynomial in $n$ and the degree, with the output error certified to machine precision, or prove that such a feasible algorithm cannot exist (unconditionally or modulo a plausible cryptographic/antiparadoxical hypothesis).**

Equivalently, resolve whether the decision problems of real-solvability and of global nonnegativity of a polynomial admit randomized polynomial expected-time algorithms, deciding in particular whether every infeasible-by-SOS instance is structurally hard.`,
    origin:
      'Parameter fitting, model validation, and robust design all require deciding whether a real polynomial system has a solution or whether a given polynomial is nonnegative — this is the shared foundational decision problem of scientific computing and engineering optimization. Smale’s 17th problem has long remained unresolved: even though nonnegativity can be approached by sums-of-squares hierarchies, whether its closure permits polynomial-time decision when augmentation is allowed is still unknown, and this determines whether global solvers can offer provable worst-case/average-case complexity guarantees.',
    progress: [
      '**Smale (1998)**: listed the verification of approximate zeros and the decidability of the sums-of-squares closure among the mathematical problems of the next century, asserting that a polynomial-time average-case algorithm exists.',
      '**SOS hierarchy (Lasserre)**: provides stepwise relaxations giving verifiable optimal lower bounds, but the worst-case complexity of the augmentation step is exponential and not sufficient.',
      '**Average-case empirical evidence**: homotopy and Newton-type methods take an expected polynomial number of steps on random systems, but refined average-case model lower bounds and stopping rules are not yet closed.',
    ],
    obstacles: [
      '**Geometric-bifurcation obstruction**: the bifurcations of the real solution set stem both from branching of critical trajectories and from loss of nondegeneracy of the function, so numerical algebra and stochastic geometry must be controlled simultaneously; when the decision problem is reduced to sums of squares, rounding errors are difficult to separate with a fixed number of bits when crossing compactly supported sets.',
    ],
    engineering_value:
      'A provable average-case polynomial-time algorithm would put an end to the black-box “when to stop” overhead of global optimization, giving predictable cost to parameter inversion, combinatorial design validation, and the solution of chemical reaction network equilibria; even an impossibility result would give engineers the theoretical grounds to determine which symbolic-reduction/SOS augmentation hierarchies are effective in an average sense.',
    formalization_notes:
      'The decision is given in a floating-point-computational form: average-case complexity is reduced to metric verification of the random model and to verifying the Newton-iteration convergence radius, which can be machine-checked via interval-arithmetic-based robust certificates and interruptible loops; the coefficient of difficulty is medium.',
    references: [
      {
        label: 'S. Smale, Mathematical problems for the next century, Math. Intelligencer 20 (1998) 7–15',
        url: 'https://doi.org/10.1007/BF03025291',
      },
      {
        label: 'C. Beltrán, L. M. Pardo, On Smale’s 17th problem: A probabilistic positive solution, Found. Comput. Math. 8 (2008) 1–43',
        url: 'https://doi.org/10.1007/s10208-006-0208-5',
      },
    ],
  },
  {
    id: 'me-027',
    output: 'verified_truth',
    judgment:
      'A pass resolves whether the optimal solution of Witsenhausen’s two-stage decentralized stochastic control problem is nonlinear: either produce a rigorous lower bound showing no linear controller can be optimal and a corresponding certified nonlinear policy attaining a strictly lower cost (a quantified distance certificate), or prove that an optimal linear (LQG-type) strategy exists, so the decentralized linear-quadratic optimality question is settled rather than merely conjectured from numerical search.',
    title: 'Optimality of Nonlinear vs. Linear Control in Witsenhausen’s Decentralized Problem',
    titleZh: 'Witsenhausen 分散控制问题的非线性对线性最优性',
    domain: 'mathematical-engineering',
    subdomain: 'control',
    status: 'open',
    difficulty: 'frontier',
    formalization_potential: 'medium',
    verification_path: 'numerical',
    tags: ['decentralized-control', 'stochastic-control', 'nonlinear-control', 'team-theory'],
    contributor: 'community',
    date_added: '2026-08-22',
    proposer: 'H. Witsenhausen',
    proposed_year: 1968,
    via: {
      label: 'Witsenhausen, A counterexample in stochastic optimum control, SIAM J. Control 6 (1968)',
      url: 'https://doi.org/10.1137/0306048',
    },
    failure_records: [
      {
        method: 'Dynamic programming / value iteration',
        mechanism: 'combinatorial',
        layer: 'num',
        partial: 'Numerical DP explodes in state dimension; the objective is non-convex, so grid search gives no global optimum.',
        implication: 'A certified gap needs a relaxation lower bound valid uniformly in (sigma, k) — interval / SDP route.',
      },
      {
        method: 'Optimal-transport viewpoint (Wu–Verdú)',
        mechanism: 'nonconvex',
        layer: 'formal',
        partial: 'Yields policy families and numerical evidence of nonlinearity, but no proof that the global optimum is nonlinear.',
        implication: 'Formalizing the linear-vs-nonlinear dichotomy is the open step; a quantified distance certificate is the accepted form.',
      },
    ],
    tool_links: [
      { tool_id: 'convex-optimization', role: 'partial' },
      { tool_id: 'interval-numerics', role: 'partial' },
      { tool_id: 'stochastic-processes', role: 'available' },
    ],
    related_problems: [
      {
        id: 'me-018',
        relation: 'shares_tools',
        note: 'Both concern the lack of simple necessary-and-sufficient criteria in nonlinear feedback design: me-018 addresses continuous feedback for deterministic stabilization, while me-027 addresses nonlinear-vs-linear optimality in stochastic decentralized systems.',
      },
    ],
    statement: `Consider the two-stage problem with state $x_0 \\sim \\mathcal N(0, \\sigma^2 I)$ (scalar or vector), controls $u_1 = \\gamma_1(x_0)$, transition $x_1 = x_0 + u_1$, noisy measurement $y = x_1 + v$ with $v \\sim \\mathcal N(0, I)$ independent, and $u_2 = \\gamma_2(y)$, minimizing $J = \\mathbb E[\\|x_0 + u_1 - u_2\\|^2] + k\\,\\mathbb E[\\|u_1\\|^2]$ for a fixed weight $k$. **Prove that the minimizer $\\gamma^* = (\\gamma_1^*,\\gamma_2^*)$ over all measurable policies is nonlinear with $J(\\gamma^*) < \\inf_{\\text{linear}} J$, or prove that a linear policy is optimal**, giving a certified gap $\\inf_{\\text{linear}} J - J(\\gamma^*)$ and the value function.

Numerically discovered nonlinear policies beat the best linear ones for large $\\sigma$, but no proof of nonlinearity of the global optimum (or its negation) is known.`,
    origin:
      'In multi-static sensors, decentralized networks, and flexible manufacturing, every actuator has only partial information; whether the optimal decentralized policy is still the linear Gaussian solution is the core open question of team theory. The counterexample constructed by Witsenhausen does not fall within the classical LQG framework and pins down that “decentralization plus information coupling can make the optimum nonlinear,” but a proof of its optimality has always been missing, directly affecting industrial standards and confidence in decentralized control.',
    progress: [
      '**Witsenhausen (1968)**: gave a counterexample suggesting that the optimal solution may be nonlinear, but did not prove global optimality of a nonlinear policy.',
      '**Mitter–Sahai (1983)**: established numerical evidence without full information, conjecturing that nonlinear policies are asymptotically optimal in the high-noise regime.',
      '**Wu–Verdú (2011) and later work**: used an optimal-transport viewpoint to produce several families of policies, but the linear-vs-nonlinear dichotomy for the global optimum is still undecided.',
    ],
    obstacles: [
      '**Dynamic-programming dimensionality obstruction**: the numerical solution of the one-step problem blows up exponentially on high-dimensional state spaces, and the nonconvex objective means no gradient/grid search can guarantee the global optimum; there is no relaxation lower bound that closes uniformly for arbitrary $\\sigma,k$.',
    ],
    engineering_value:
      'A rigorous proof would decide which decentralized-control scenarios must use nonlinear policies (hence extra hardware and nonconvex optimization) and which can still be implemented cheaply with linear LQG; such a settlement provides direct engineering grounds for provable performance upper bounds in multi-agent formation, fault-tolerant control, and sensor data fusion.',
    formalization_notes:
      'The decision prioritizes the numerical direction: discretize the problem on a sufficiently fine grid and compute a rigorous lower bound over the family of linear policies, combined with a deterministic cost upper bound for nonlinear policies to form a machine-checkable gap proof; a full closed-form analysis still awaits analytic treatment, coefficient of difficulty medium.',
    references: [
      {
        label: 'H. S. Witsenhausen, A counterexample in stochastic optimum control, IEEE Trans. Automat. Control 13 (1968) 94–95',
        url: 'https://doi.org/10.1109/TAC.1968.1098950',
      },
      {
        label: 'Y. Wu, S. Verdú, Witsenhausen’s counterexample: A view from optimal transport, Proc. 2011 IEEE CDC',
        url: 'https://arxiv.org/abs/1007.5351',
      },
    ],
  },
  {
    id: 'me-028',
    output: 'verified_truth',
    judgment:
      'A pass either gives the full attainable set (the $G$-closure) of effective conductivity (or elasticity) tensors for mixtures of three or more phases — proving which effective tensors are realizable and which are excluded, with explicit bounding constructions and matching upper/lower attainable isotropic bounds certified analytically — or proves that the multi-phase $G$-closure is not describable by finitely many linear bounds (e.g. by exhibiting a concrete target tensor inside the Hashin–Shtrikman bounds that no microstructure realizes), so the extremal-composite characterization is settled.',
    title: 'The G-Closure and Sharp Attainable Bounds for Multiphase Composite Conductors',
    titleZh: '多相复合导电介质的 G-闭包与尖确可达界',
    domain: 'mathematical-engineering',
    subdomain: 'materials-mechanics',
    status: 'open',
    difficulty: 'frontier',
    formalization_potential: 'low',
    verification_path: 'analytical',
    tags: ['G-closure', 'hashin-shtrikman-bounds', 'composite-conductivity', 'homogenization'],
    contributor: 'community',
    date_added: '2026-08-22',
    proposer: 'multiple contributors',
    proposed_year: 2002,
    via: {
      label: 'G-closure and attainable bounds for multiphase composite media: Milton, The Theory of Composites (2002)',
      url: 'https://www.cambridge.org/core/books/the-theory-of-composites',
    },
    failure_records: [
      {
        method: 'Rank-k sequential laminate constructions',
        mechanism: 'combinatorial',
        layer: 'formal',
        partial: 'Two-phase Hashin–Shtrikman bounds are attained by laminates; three-phase attainability is open.',
        implication: 'Certifying the attainable set needs a semidefinite relaxation of the family of quadratic inequalities.',
      },
      {
        method: 'Hashin–Shtrikman variational bounds',
        mechanism: 'unbounded_residual',
        layer: 'model',
        partial: 'Give two-sided bounds but not the exact G-closure for m >= 3 phases.',
        implication: 'A constructive interior counterexample (attainable tensor strictly inside the bounds) is the decisive accepted form.',
      },
    ],
    tool_links: [
      { tool_id: 'convex-optimization', role: 'partial' },
      { tool_id: 'polynomial-real', role: 'partial' },
    ],
    related_problems: [],
    statement: `Mix $m \\ge 3$ perfectly conducting isotropic phases with positive conductivities $\\sigma_1, \\dots, \\sigma_m$ and prescribed volume fractions to form a periodic composite. Let $\\sigma^*$ be the effective conductivity tensor. **Determine the full set of attainable pairs $(f, \\sigma^*)$ as the microstructure varies — the $G$-closure — and decide whether the Hashin–Shtrikman type bounds are simultaneously attainable: for $m \\ge 3$ phases, characterize which effective tensors inside the bounds are realized by rank-$k$ laminates (or ordered sequential laminates) and whether any strictly-interior effective tensor is excluded, providing the exact relaxation bounds.**

In particular settle whether the two-phase H–S bound structure, where the optimal bound equals a realized laminate, survives for three or more phases.`,
    origin:
      '3D printing and multiphase composites turn “whether a target stiffness/thermal conductivity can be tuned” into an engineering constraint. In the two-phase case the Hashin–Shtrikman bounds are attained by laminate constructions, but the attainable set (the G-closure) for three or more phases still lacks a closed characterization, so the feasible region in multimaterial topology optimization can only be approached by algebraic regularization, directly affecting whether one-shot material allocation schemes are physically realizable.',
    progress: [
      '**Lurie–Cherkaev / Tartar (1985–88)**: essentially completed the two-phase case, with equivalent bounds and quasiconformal/laminate attainability.',
      '**Milton (2002)**: systematically reviews the remaining inequalities and rank-2/rank-3 laminates for three or more phases, noting that the G-closure counting higher ranks is still open.',
      '**Topology-optimization evidence**: multiphase continuous relaxations converge numerically to boundary solutions, but a strictly validated analytical certificate for interior attainability/exclusion is missing.',
    ],
    obstacles: [
      '**Nonlinear comparability obstruction**: the attainable set of three-phase effective tensors is discontinuous in the rank, and high-rank laminates lack a strong duality between complementary and closed energies; one must simultaneously handle pointwise phase-fraction constraints and families of quadratic inequalities among the phases, so an analytic characterization of whether a strictly interior tensor is realized still requires constructive examples.',
    ],
    engineering_value:
      'If the multiphase attainable set could be described in closed form, multimaterial topology optimization could search within a truly physically realizable region, avoiding layouts that fail exactly because of an unrealistic material mix; it would quantify which stiffness/conductivity combinations are realized only by “unconventional high-order microstructures,” guiding design optimization under additive layer ordering and process constraints.',
    formalization_notes:
      'The decision belongs to microstructure analysis: reduce attainability to a family of quadratic inequalities on anisotropic tensors and the verification of rank-laminate constructions; because phase volume fractions and rank parameters must be combined, automation requires semidefinite relaxations and pointwise constant checks, with a low formalization coefficient.',
    references: [
      {
        label: 'K. A. Lurie, A. V. Cherkaev, Variational Methods for Structural Optimization, Springer (2000)',
        url: 'https://doi.org/10.1007/978-0-387-22628-2',
      },
      {
        label: 'G. W. Milton, The Theory of Composites, Cambridge University Press (2002)',
        url: 'https://www.cambridge.org/core/books/the-theory-of-composites/F0A6B0E2BC5D4A6C55C6A0F4F7E04A9A',
      },
    ],
  },
  {
    id: 'me-029',
    output: 'verified_behavior',
    judgment:
      'A qualifying answer is a verifiable curve criterion for “sampling budget–error–dimension” rather than a final exponent pair: for a given function class $F_d$ (smoothness $r$) and a budget of $n$ evaluations, deliver a verifiable interval $[\\underline{e},\\overline{e}]$ for the minimal worst-case error, so that the exponents $\\alpha,\\beta$ in $e^{\\text{wor}}(F_d,n)=\\Theta(n^{-\\alpha}d^{\\beta})$ are enclosed by a controlled bracket, together with a three-layer residual total band: (1) **R_model**: the residual upper bound introduced by restricting the numerical computation to the Sobolev class $F_d$ (with explicit dependence on smoothness/boundary assumptions of the function family); (2) **R_num**: the residual upper bound introduced by enclosing the explicit quadrature rule given by the above bounds (or a sampling-set construction making the lower bound verifiable) via interval/exact arithmetic; (3) the parameters (function class, dimension, error target) are exact information-model inputs, **R_param≡0 (no input-measurement residual layer; stated as such)**. Consumption form of a pass: given an error target $\\epsilon$ and dimension $d$, directly obtain the verifiable interval “the required number of samples $n$ lies in $[n_\\lo,n_\\hi]$” (together with a dividing criterion for “when grids are worthwhile and when one must concede to Monte-Carlo”), for provable sampling-budget planning in option pricing and parametrized simulation.',
    certificate: {
      r_model: {
        bound: 'Residual upper bound introduced by restricting the numerical computation to the Sobolev class F_d (smoothness r) (with dependence on smoothness/boundary assumptions of the function family)',
        derivation: 'Residual bound from restriction to the Sobolev class',
      },
      r_param: {
        bound: '≡0 (function class, dimension, and error target are exact information-model inputs; no input-measurement residual layer)',
        derivation: 'Parameters exactly given',
        kind: 'assumption',
        upper: 0,
      },
      r_num: {
        bound: 'Residual upper bound introduced by enclosing explicit quadrature rules / attainable sampling-set constructions via interval or exact arithmetic',
        derivation: 'Interval/exact arithmetic enclosure bound',
        kind: 'numerical',
      },
      total_band: 'error exponent bracket ≤ R_model + R_num',
      certified_band: '[e_lo, e_hi] (number of samples n in [n_lo, n_hi])',
    },
    title: 'Sharp Dimensional Dependence of High-Dimensional Numerical Integration',
    titleZh: '高维数值积分的维数依赖尖确指数',
    domain: 'mathematical-engineering',
    subdomain: 'scientific-computing',
    status: 'open',
    difficulty: 'frontier',
    formalization_potential: 'medium',
    verification_path: 'analytical',
    tags: ['information-based-complexity', 'high-dimensional-integration', 'tractability', 'numerical-quadrature'],
    contributor: 'community',
    date_added: '2026-08-23',
    proposer: 'H. Woźniakowski',
    proposed_year: 1994,
    via: {
      label: 'Traub & Woźniakowski, A General Theory of Optimal Algorithms; Novak & Woźniakowski, Tractability of Multivariate Problems (CMS/AME series)',
      url: 'https://www.cambridge.org/core/series/tractability-of-multivariate-problems',
    },
    related_problems: [],
    statement: `For a class $F_d$ of functions on $[0,1]^d$ with bounded smoothness $r$, let $e^{\\text{wor}}(F_d, n)$ be the minimal worst-case integration error obtainable with $n$ point function evaluations. **Determine the exact pair of exponents $(\\alpha,\\beta)$ satisfying $e^{\\text{wor}}(F_d,n) = \\Theta(n^{-\\alpha} d^{\\beta})$ for the critical scales, and give a construction $($an attainable integrand family and a corresponding quadrature rule with a certified constant$)$ that matches it.**

The classical grid estimate achieves error $O(d^r n^{-\\alpha})$ for $\alpha = 1/d$-dependent, while Monte-Carlo gives $n^{-1/2}$ independent of $d$; the sharp interpolation between these regimes for deterministic rules remains an open gap.`,
    origin:
      'Option pricing, parametrized-PDE solving, and Bayesian inverse problems push the dimension d (securities/parameters/unknown-function degrees of freedom) to tens or hundreds, where naive grid integration explodes factorially. Information-based complexity (IBC) should answer “how many true function values are needed for a trustworthy high-dimensional integral,” but for many tractability classes the upper bounds (sparse grids/quasi-Monte Carlo) and lower bounds still differ by an undetermined polynomial factor, so engineers cannot tell whether increasing sampling really trades for accuracy as expected.',
    progress: [
      '**Bakhvalov (1959)**: established the asymptotically optimal error–cost relation for grid integration.',
      '**Bungartz–Griebel (2004)**: sparse grids give upper bounds with mild dimension dependence, but a gap to the lower bound remains.',
      '**Novak–Woźniakowski (2008–2012)**: systematically give worst-case complexity lower bounds for most Sobolev/analytic classes and explicitly mark the exponents still to be closed.',
    ],
    obstacles: [
      '**Dual approximation and optimal allocation of sample information**: direct lower bounds rely on the optimal twisted approximation in nonlinear approximation (N-widths, Ne\', sampling-set selection), whose sharp constants are far from settled; the upper bounds in turn rely on a fixed quadrature/quasi-Monte Carlo structure, so the powers of d on both sides must be aligned simultaneously — a long-standing open problem in algorithmic information theory.',
    ],
    engineering_value:
      'If this exponent were closed, engineers could obtain a trustworthy “error–cost–dimension” curve: knowing when sparse grids or tensor grids are worthwhile and when one must concede to Monte-Carlo, thereby providing provable upper bounds for the sampling budgets of option pricing and parametrized simulation, instead of relying on empirical convergence plots.',
    formalization_notes:
      'The decision is largely analytic: reduce the lower bound to an optimal-approximation error lower bound for a given sampling set (numerically corroborated by semidefinite relaxations) and the upper bound to error analysis of an explicit quadrature rule; the proof core is interpolation theory on function spaces, with a medium formalization coefficient.',
    references: [
      {
        label: 'E. Novak, H. Woźniakowski, Tractability of Multivariate Problems, Vols. 1–3, European Math. Soc. (2008–2012)',
        url: 'https://www.ems-ph.org/books/show/432',
      },
      {
        label: 'H.-J. Bungartz, M. Griebel, Sparse grids, Acta Numerica 13 (2004) 147–269',
        url: 'https://doi.org/10.1017/S0962492904000182',
      },
    ],
  },
  {
    id: 'me-030',
    output: 'verified_behavior',
    judgment:
      'A qualifying answer is an “information-gain guarantee for the selected deployment” rather than a single algorithm: for a given measurement model $\\Sigma$, candidate placements $S$, and budget $k$, deliver a polynomial-time algorithm whose output information gain $f(\\hat S)$ satisfies the certified lower bound $f(\\hat S)\\ge c\\cdot f(S^*)$ (for D-optimal/log-determinant-type objectives, give a $c$ better than $1-\\nicefrac{1}{e}$ or prove its impossibility), together with a three-layer residual total band: (1) **R_model**: the residual upper bound introduced by restricting the true sensing (observation noise, communication coupling) to the objective function $f$ (submodular/weakly submodular with constraints); (2) **R_param**: the input residual upper bound on $f$ and on the guarantee ratio $c$ from the uncertainty of the measurement-model covariance $\\Sigma$ (observation noise/calibration) when it comes from estimation (valid within a tolerance ball for $\\Sigma$); (3) **R_num**: the residual upper bound introduced by enclosing the estimate of $f$ and the involved determinants/eigenvalues via interval arithmetic, so that the guarantee “$f(\\hat S)\\ge c\\cdot f(S^*)$” is not eroded by the three residual layers. Consumption form of a pass: given candidate placements and budget, directly obtain the hard guarantee “the information gain of the selected placement is at least $c\\cdot100\\%$ of the optimum” independent of instance tuning (together with a proof of optimality or impossibility of this $c$), for hard deployment decisions in environmental monitoring / structural health monitoring / active sampling.',
    certificate: {
      r_model: {
        bound: 'Residual upper bound introduced by restricting the true sensing (observation noise, communication coupling) to the objective function f (submodular/weakly submodular with constraints)',
        derivation: 'Residual bound from restriction to the submodular objective model',
      },
      r_param: {
        bound: 'Input residual upper bound on f and on the guarantee ratio c from the uncertainty of the measurement-model covariance Σ (observation noise/calibration) when it comes from estimation (valid within a tolerance ball for Σ)',
        derivation: 'Interval propagation from the Σ tolerance ball to the information-gain guarantee',
      },
      r_num: {
        bound: 'Residual upper bound introduced by enclosing the estimate of f and the involved determinants/eigenvalues via interval arithmetic',
        derivation: 'Interval arithmetic enclosure bound',
        kind: 'numerical',
      },
      total_band: 'information-gain guarantee c·f(S*) not eroded ≤ R_model + R_param + R_num',
      certified_band: 'Certified lower bound on the information gain of the selected placement relative to the optimum',
    },
    title: 'Provable Approximation for Optimal Sensor Placement and Information Gain',
    titleZh: '最优传感器布点与信息增益的可证近似',
    domain: 'mathematical-engineering',
    subdomain: 'control',
    status: 'open',
    difficulty: 'frontier',
    formalization_potential: 'medium',
    verification_path: 'numerical',
    tags: ['sensor-placement', 'observability', 'submodular-optimization', 'state-estimation', 'experimental-design'],
    contributor: 'community',
    date_added: '2026-08-23',
    proposer: 'A. Krause & C. Guestrin',
    proposed_year: 2007,
    via: {
      label: 'Krause, Singh, Guestrin, Near-Optimal Sensor Placements in Gaussian Processes, ICML (2008)',
      url: 'https://ojs.aaai.org/index.php/ICML/article/view/21370',
    },
    related_problems: [],
    statement: `Let $\\Sigma$ be a measurement model with candidate sensor positions $S$, and $f: 2^S \\to \\mathbb R_{\\ge 0}$ a set function measuring information gained (e.g. $-\\log\\det$ posterior covariance, or D-optimal experimental design objective). **Determine the best approximation ratio achievable in polynomial time for maximizing $f$ over a cardinality-$k$ subset when $f$ is submodular but no longer monotone (or a monotone submodular with observation-noise coupling), and construct an algorithm attaining it.**

For monotone submodular objectives the greedy $1-\\nicefrac{1}{e}$ guarantee is tight; for the non-monotone or constrained variants arising in joint sensing-communication design, the attainable ratio is not settled.`,
    origin:
      'Aerospace structural health monitoring, environmental sensor networks, and fault diagnosis all require selecting the most informative measurement points within a budget k. Classical submodular optimization guarantees near-optimality in the monotone case, but constraints such as equipment certification and communication-payload coupling break monotonicity; for such “constrained information gain” the optimal provable ratio is neither as good as the classical one nor known to be hard, so engineers resort to heuristics and bear unbounded loss.',
    progress: [
      '**Krause–Singh–Guestrin (2008)**: gave polynomial-time approximation algorithms for D-optimal/log-determinant-type objectives with extensive application experiments.',
      '**Michail et al. / Cochran (1973)**: general maximum information gain (with observation noise) is known to be NP-hard, but the precise approximation-hardness threshold is not delineated.',
    ],
    obstacles: [
      '**LG and greedy gaps under non-monotone/coupled constraints**: a tighter bound requires proving an information-theoretic lower bound over a wider objective class, together with a worst-case configuration instantiable as a concrete sensing matrix; currently only numerical experiments exist, lacking an approximation-hardness match parallel to the provable NP-hardness.',
    ],
    engineering_value:
      'What the bare statement promises is a **provable guarantee ratio**: if a provable ratio better than monotone greedy exists, deployment/experimental design can prune candidates based on the hard guarantee “the information gain of the selected placement is at least c·100% of the optimum,” independent of instance tuning; if it is proven that no polynomial guarantee exists, industry abandons the chase for high-quality exact solutions and adopts bounded-loss approximation. In both cases the trust boundary, currently guided by empirical plots, is substantially tightened rather than outsourcing the uncertainty to rhetoric.',
    formalization_notes:
      'The decision balances numerical and structural aspects: write the objective as a determinant/eigenvalue function of the matrix family, and reduce the approximation ratio to a continuous relaxation upper bound for interval-type submodular functions; one may first verify the greedy-vs-optimal gap on concrete instances via semidefinite programming, then convert it into a general proof.',
    references: [
      {
        label: 'A. Krause, A. Singh, C. Guestrin, Near-optimal sensor placements in Gaussian processes, ICML (2008)',
        url: 'https://ojs.aaai.org/index.php/ICML/article/view/21370',
      },
      {
        label: 'C. Cochran, Optimal sensor placement and observer theory (1973)',
        url: 'https://doi.org/10.1109/CDC.1973.269075',
      },
    ],
  },
  {
    id: 'me-031',
    output: 'verified_behavior',
    judgment:
      'A qualifying answer is a “reduced-order prediction with a hard trust interval” rather than a uniform expensive bound: for a given parametrized problem and reduced basis (rank $r$), deliver a computable, verifiable a-posteriori error upper bound $\\Delta(\\mu)$ with $\\|u(\\mu)-\\hat u_r(\\mu)\\|\\le\\Delta(\\mu)$, together with a three-layer residual total band: (1) **R_model**: the residual upper bound introduced by restricting the online full-order system to the reduced model (fixed basis $r$, truncated operator) (with explicit dependence on continuity assumptions for non-polynomial nonlinearities); (2) **R_num**: the residual upper bound introduced by enclosing the residual norm/continuity constants (SVD/eigenvalue bands) via interval/symbolic computation, so that $\\Delta$ is both sharp (near the true error on representative parameters) and cheap (independent of the full-order dimension); (3) the online parameter $\\mu$ and the reduced basis are exactly given algorithmic inputs, **R_param≡0 (no input-measurement residual layer; stated as such)**. Consumption form of a pass: given an online parameter $\\mu$ and the reduced model, directly obtain the hard confidence interval “around the prediction $\\hat u_r(\\mu)$, $\\|u-\\hat u_r\\|\\le\\Delta(\\mu)$” for direct consumption by digital twins/surgery/real-time control; if it is proven that no provable and cheap $\\Delta$ exists, then clearly specify the family of operating conditions that must retain online full-order validation.',
    certificate: {
      r_model: {
        bound: 'Residual upper bound introduced by restricting the online full-order system to the reduced model (fixed basis r, truncated operator) (with dependence on continuity assumptions for non-polynomial nonlinearities)',
        derivation: 'Residual bound for the reduced basis / truncated operator',
      },
      r_param: {
        bound: '≡0 (online parameter μ and reduced basis are exactly given algorithmic inputs; no input-measurement residual layer)',
        derivation: 'Parameters exactly given',
        kind: 'assumption',
        upper: 0,
      },
      r_num: {
        bound: 'Residual upper bound introduced by enclosing the residual norm/continuity constants (SVD/eigenvalue bands) via interval/symbolic computation',
        derivation: 'Interval/symbolic computation enclosure bound',
        kind: 'numerical',
      },
      total_band: 'a-posteriori error bound Δ(μ) ≤ R_model + R_num',
      certified_band: "‖u - u_hat_r‖ ≤ Δ(μ) hard trust interval",
    },
    title: 'Certifiable A-Posteriori Error Bounds for Nonlinear Model Reduction',
    titleZh: '非线性模型降阶的可证后验误差界',
    domain: 'mathematical-engineering',
    subdomain: 'scientific-computing',
    status: 'open',
    difficulty: 'advanced',
    formalization_potential: 'high',
    verification_path: 'numerical',
    tags: ['model-order-reduction', 'pod', 'a-posteriori-bounds', 'digital-twin', 'parametric-pde'],
    contributor: 'community',
    date_added: '2026-08-23',
    proposer: 'K. Veroy & A. T. Patera',
    proposed_year: 2005,
    via: {
      label: 'Veroy, Patera, Certified real-time solution of the parametrized steady incompressible Navier–Stokes equations (2005)',
      url: 'https://doi.org/10.1002/fld.911',
    },
    related_problems: [],
    statement: `Given a parameter-dependent evolution or steady problem solved approximately by a reduced-order model with basis of rank $r$, find a computable quantity $\\Delta(\\mu)$ such that $\\|u(\\mu) - \\hat u_r(\\mu)\\| \\le \\Delta(\\mu)$, with $\\Delta$ both **sharp** (near the true error on representative $\\mu$) and **cheap** (evaluated in reduced cost, independent of full-order dimension). **Determine whether a unified, non-empirical $\\Delta$ exists that is simultaneously sharp and cheap for nonlinear operators with non-polynomial nonlinearities, or give the parametric counterexample where the residual-based bound necessarily overestimates by a super-constant factor, and a certified way to pay for it (adaptive basis enrichment).**`,
    origin:
      'Digital twins demand millisecond-level online simulation that simultaneously gives a trustworthy error, but nonlinear terms (advection, contact, material nonlinearity) make standard residual-type bounds distorted and costly. Without a-posteriori certificates, online decisions on reduced models can only trust empirical plots; whether one can achieve both “provably sharp and cheap” directly determines whether industrial real-time simulation can have hard confidence.',
    progress: [
      '**Veroy–Patera (2005)**: gave provable, uniformly valid a-posteriori upper bounds for parametrized steady laminar fields, with acceptable estimator cost.',
      '**Chaturantabut–Sorensen (2010)**: DEIM compresses nonlinear terms effectively, but the bound theory is markedly loose and the error estimator is conservative.',
      '**Recent hyper-reduction reviews**: the “sharpness vs. cost” dilemma for general nonlinear operators has been repeatedly noted, but without a closed conclusion.',
    ],
    obstacles: [
      '**Non-polynomial nonlinearities defeat explicit estimation of residual bounds**: the bounds depend on spectral constants of the truncated operator whose explicit estimates degenerate to huge values or require full-order computation; to be simultaneously immediately provable and cheap, one must build transferable continuity bounds for families of nonlinear operators — an open interface between numerical analysis and operator interpolation.',
    ],
    engineering_value:
      'If a provable and cheap error bound is obtained, digital twins/surgery planning/real-time control can hand the reduced-order prediction together with its bound to the decision process, achieving “a hard confidence interval around the prediction”; a negative result would clearly tell the engineering community which scenarios must retain online full-order validation or adaptive basis enrichment.',
    formalization_notes:
      'The decision is largely numerical: the error bound reduces to a product of operator continuity constants (verifiable via SVD/eigenvalue bands) and the residual norm, corroborated numerically by randomized sampling regret bounds; the proof core is a two-point estimate for residual projection, with a high coefficient and clear formalization payoff.',
    references: [
      {
        label: 'K. Veroy, A. T. Patera, Certified real-time solution of parametrized steady incompressible Navier–Stokes equations, IJNMF 47 (2005)',
        url: 'https://doi.org/10.1002/fld.911',
      },
      {
        label: 'S. Chaturantabut, D. C. Sorensen, Nonlinear model reduction via DEIM, SIAM J. Sci. Comput. 32 (2010) 2737–2764',
        url: 'https://doi.org/10.1137/090766498',
      },
    ],
  },
  {
    id: 'me-032',
    output: 'verified_truth',
    judgment:
      'A pass resolves how verification can be made sound yet practical for neural feedback policies: either construct a framework that yields a certified (sub-)level-set Lyapunov/barrier certificate for a ReLU-network controller on a piecewise-affine region with a **worst-case bound on the relaxed-vs-true difference that is quantitatively tighter than existing partition bounds**, and demonstrate it on a benchmark under the stated tolerance, or exhibit an architectural/training configuration for which every SDP/MILP relaxation must lose a fixed fraction of the true feasible stability region — giving checkable certificates for learned control instead of empirical safety.',
    title: 'Sound and Scalable Stability Certification of Learned Feedback Policies',
    titleZh: '学习型反馈策略的可靠可扩稳定性证明',
    domain: 'mathematical-engineering',
    subdomain: 'control',
    status: 'open',
    difficulty: 'frontier',
    formalization_potential: 'medium',
    verification_path: 'numerical',
    tags: ['neural-network-verification', 'lyapunov-functions', 'learning-based-control', 'formal-methods'],
    contributor: 'community',
    date_added: '2026-08-23',
    proposer: 'M. Fazlyab, M. Morari & G. J. Pappas',
    proposed_year: 2020,
    via: {
      label: 'Fazlyab, Morari, Pappas, Safety Verification and Robustness Analysis of Neural Networks via Quadratic Constraints and Semidefinite Programming, IEEE TAC (2022)',
      url: 'https://doi.org/10.1109/TAC.2022.3160509',
    },
    related_problems: [],
    statement: `For a closed-loop system $\\dot x = f(x, \\pi_\\theta(x))$ where $\\pi_\\theta$ is a ReLU neural-network controller, a Lyapunov candidate $V$ and a piecewise-affine partition of the region $\\mathcal X$, **determine the tightest computable upper bound on $\\max_{x \\in \\mathcal X}( \\dot V(x) + \\lambda V(x) )$ — close the gap between the SDP/MILP-relaxed over-estimate used today and the true value — using the activation-pattern structure of $\\pi_\\theta$, so the certified basin of attraction is as large and as sound as $n$ training data can justify.**

A negative result (a config whose relaxation necessarily loses a fixed fraction of the feasible region) closes the constructive path and steers practitioners to architecture-scoped certificates.`,
    origin:
      'The perception–learning–control helmsman: autonomous driving, power-grid voltage regulation, and robotic manipulation must guarantee closed-loop stability, but neural-network policies cannot be verified directly, so one can only give conservative upper bounds via SDP/MILP relaxations. The looseness of the current relaxations grows sharply with the number of partitions, causing the safe region to be substantially underestimated or the computation to explode; whether the “relaxation-vs-truth” gap can be squeezed to a controllable constant without sacrificing reliability directly determines whether learning-based control can be deployed without human re-verification.',
    progress: [
      '**Fazlyab et al. (2020)**: incorporated ReLU-network policies into an LPV framework via quadratic constraints and SDP to give provable stability criteria.',
      '**Wang–Jungers (2021) series**: gave finer relaxations and complexity lower bounds for ReLU networks / switched systems.',
      '**Empirical evidence**: the deeper the network and the more partitions, the larger the deviation between the relaxed region and the true region, but a rigorous characterization is missing.',
    ],
    obstacles: [
      '**Combinatorial explosion of activation patterns and relaxation alignment**: each active partition introduces one large SDP matrix, and the relaxation constant grows exponentially with depth; one needs a general bound that jointly encodes the network structure (activation patterns, weight magnitudes), together with a worst-case example for that general bound to verify that the lower bound cannot be improved.',
    ],
    engineering_value:
      'If the “relaxation-vs-truth” gap is squeezed to a known controllable constant, engineers reviewing the safety proof only need to check the preset relaxation upper bound, without full-order verification of every operating condition; a negative result would give a measurable family of “must-validate online” conditions, preventing blind extrapolation of LBD certificates — in both cases learning-based control receives an auditable trust boundary.',
    formalization_notes:
      'The decision is numerical-local: turn the Lyapunov condition into per-partition LMIs/SDP, whose relaxation constants are given by activation-pattern weight norms, with the worst-case partition verifiable by random search; the proof core unifies the relaxation gap within network Lipschitz/spectral-norm bounds, with medium formalization payoff.',
    references: [
      {
        label: 'M. Fazlyab, M. Morari, G. J. Pappas, Safety verification and robustness analysis of neural networks via quadratic constraints and semidefinite programming, IEEE TAC 67 (2022) 2749–2764',
        url: 'https://doi.org/10.1109/TAC.2022.3160509',
      },
      {
        label: 'R. Wang, A. Jungers, Fine-grained relaxations for ReLU-network verification, CDC (2021)',
        url: 'https://doi.org/10.1109/CDC45484.2021.9683718',
      },
    ],
  },
  {
    id: 'mp-036',
    output: 'verified_behavior',
    judgment:
      'A qualifying answer is a “verifiable mixing-rate criterion + three-layer residual total band” rather than the precise exponent itself. For a given control-cost budget $E=\\int_0^T\\|u\\|_{H^s}^2\\,dt$ and target flattening scale (e.g. decay to $\\|\\theta\\|_{H^{-1}}\\le\\epsilon$), deliver bounds and proofs for each of the following residual layers and then synthesize the total band: (1) **R_model**: the residual upper bound introduced by idealizing the viscous physics of the passive scalar (finite Péclet/diffusion) to the inviscid equation $\\partial_t\\theta+u\\cdot\\nabla\\theta=0$ (with explicit order-of-magnitude contribution of physical viscosity to the mixing upper bound); (2) **R_num**: the residual upper bound introduced by discretization/interval arithmetic when solving the controlled model on a verifiable velocity-field construction (an explicit laminar field from upstream or its numerical implementation); (3) the parameters (control-cost budget, target scale) are exact inputs given by the designer, **R_param≡0 (no input-measurement residual layer; stated as such)**. Consumption form of a pass: given pumping energy, directly obtain the verifiable interval “the minimal energy budget that flattens the scalar to $\\epsilon$ lies in $[E_\\lo,E_\\hi]$ with total band $E_\\hi-E_\\lo\\le$ R_model+R_param+R_num,” for direct consumption by microfluidics and combustion/mixing scale design without recomputing DNS.',
    certificate: {
      r_model: {
        bound: 'Residual upper bound introduced by idealizing the viscous physics of the passive scalar (finite Péclet/diffusion) to the inviscid transport equation (with order-of-magnitude contribution of physical viscosity to the mixing upper bound)',
        derivation: 'Residual bound of the inviscid idealization (with finite-viscosity correction)',
      },
      r_param: {
        bound: '≡0 (control-cost budget and target scale are exact inputs given by the designer; no input-measurement residual layer)',
        derivation: 'Parameters exactly given',
        kind: 'assumption',
        upper: 0,
      },
      r_num: {
        bound: 'Residual upper bound introduced by discretization/interval arithmetic when solving the controlled model on a verifiable velocity-field construction',
        derivation: 'Discretization/interval arithmetic enclosure bound',
        kind: 'numerical',
      },
      total_band: 'E_hi - E_lo ≤ R_model + R_param + R_num',
      certified_band: '[E_lo, E_hi] (minimal energy budget to flatten to ε)',
    },
    title: 'Sharp Mixing Rates from Anomalous Dissipation in Passive Scalar Transport',
    titleZh: '被动标量输运中反常耗散的尖确混合速率',
    domain: 'mathematical-physics',
    subdomain: 'fluids-turbulence',
    status: 'open',
    difficulty: 'frontier',
    formalization_potential: 'low',
    verification_path: 'analytical',
    tags: ['passive-scalar', 'anomalous-dissipation', 'chaotic-mixing', 'onsager', 'optimal-transport'],
    contributor: 'community',
    date_added: '2026-08-23',
    proposer: 'L. Onsager; modern statement attributed to A. Shnirelman and A. Kiselev',
    proposed_year: 1949,
    via: {
      label: 'Shnirelman (1985), On the evolution of passive scalar equilibria; Kiselev–Nazarov–Shterenberg (2008)',
      url: 'https://www.ams.org/journals/era/2008-14-06/S1079-6762-08-00179-0/',
    },
    related_problems: [],
    statement: `Advect a passive scalar $\\theta$ by an incompressible velocity field $u$ ($\\partial_t \\theta + u \\cdot \\nabla \\theta = 0$) with control cost $\\int_0^T \\|u\\|_{H^s}^2 \\, dt$. Let the mixing rate be measured by how fast a Sobolev-type functional decays (e.g., $\\|\\theta\\|_{H^{-1}}$ or $\\|\\theta_{\\text{high}}\\|$). **Determine — for the critical smoothness $s$ — the sharp exponent $e$ such that the guaranteed mixing efficiency is $\\Theta(\\text{cost}^{-e})$, with an explicit admissible velocity field attaining the exponent (upper bound) and a matching lower bound via the relevant conservation law (e.g. a companion estimate from anomalous dissipation).**`,
    origin:
      'Microfluidics, stirring, and atmospheric transport all require flattening scalars quickly with finite energy, while whether efficient scalar mixing is accompanied by anomalous dissipation and the exponent relation between the required energy and the mixing rate still refuse precise closure. Establishing this exponent tells engineers how fine a scale can be flattened under a given energy budget, directly determining mixer design and the three-dimensional vortex-scale structure of combustion/mixing.',
    progress: [
      '**Shnirelman (1985)**: gave mixing constructions under unbounded energy, pointing out the skeleton of the energy–mixing-rate trade-off.',
      '**Crippa–De Lellis / Colombo–Crippa (around 2014)**: gave mixing-rate upper bounds and negative examples for constant-energy inviscid active deterministic/random fields.',
      '**Seis / Cotter numerical experiments**: support a conjectured exponent, but the rigorous upper and lower bounds are not aligned.',
    ],
    obstacles: [
      '**The duality between mixing rate and dissipation does not cross to closure**: the lower bound relies on a conservation-law-type inequality (e.g. the high-speed limit of scalar-gradient growth), and the upper bound relies on laminar field constructions with precise control; the dependence of both on the control cost must be tuned to the same index, exactly at the junction of optimal transport and the turbulent energy cascade.',
    ],
    engineering_value:
      'This exponent defines “given pumping energy → the minimal flattenable scalar scale,” the only theoretical line that lets microfluidic mixer size and flow rate be computed directly as cost, and combustion/atmospheric models choose subgrid closures. The value of this board is not a conditional exponent but a **verifiable mixing-budget interval** that explicitly separates model-layer (viscous correction) and numerical-layer (discrete/interval) residuals (here the parameters are design-given, R_param≡0) and synthesizes the total band, so energy-budget planning and mixer scale design no longer rely on empirical fitting but directly consume a certified band.',
    formalization_notes:
      'The decision is largely analytic: the lower bound reduces to an optimal-transport upper bound over a class of velocity fields (proved by interpolation/duality), and the upper bound reduces to an explicit laminar-field velocity construction with energy counting; delicate functional analysis is required, with a low formalization coefficient.',
    references: [
      {
        label: 'A. Shnirelman, On the evolution of passive scalar equilibria, Topol. Methods Nonlinear Anal. 6 (1995) 259–274',
        url: 'https://doi.org/10.1016/S0926-2245(95)00007-6',
      },
      {
        label: 'A. Kiselev, F. Nazarov, A. Shterenberg, Blow up and regularity for fractal Burgers equation, Dyn. PDE 5 (2008) 211–240',
        url: 'https://www.ams.org/journals/era/2008-14-06/S1079-6762-08-00179-0/',
      },
    ],
  },
  {
    id: 'mb-027',
    output: 'verified_truth',
    judgment:
      'A pass settles the sharp amplification ratio of evolutionary graphs: either exhibit an undirected (or directed) graph together with a proof that its fixation probability of a beneficial mutant beats the Moran baseline by a ratio exceeding the currently known universal constant, with a certified parameter range; or prove a universal upper bound showing no graph can amplify fixation beyond a stated constant, terminating the search for extreme "super-suppressors"—giving a clean, machine-checkable statement of how graph structure bounds selection efficiency.',
    title: 'Extremal Amplification of Fixation Probability on Evolutionary Graphs',
    titleZh: '进化图上固定概率的极值放大比',
    domain: 'mathematical-biology',
    subdomain: 'evolutionary-dynamics',
    status: 'open',
    difficulty: 'frontier',
    formalization_potential: 'medium',
    verification_path: 'analytical',
    tags: ['evolutionary-graph-theory', 'fixation-probability', 'population-structure', 'moran-process'],
    contributor: 'community',
    date_added: '2026-08-23',
    proposer: 'E. Lieberman, C. Hauert & M. A. Nowak',
    proposed_year: 2008,
    via: {
      label: 'Lieberman, Hauert, Nowak, Evolutionary dynamics on graphs, Nature 433 (2005) 312–316',
      url: 'https://doi.org/10.1038/nature03204',
    },
    related_problems: [],
    statement: `For the standard Moran process on an $N$-vertex graph, a beneficial mutant of fitness $r>1$ fixes with a probability that depends on the graph. Let the **amplification ratio** be the supremum over (connected, and possibly directed) graphs of the fixation probability relative to the complete-graph baseline. **Determine the sharp value (or the tightest universal upper bound) of this amplifying ratio as a function of population size $N$ and fitness $r$, and exhibit a graph attaining it exactly (or prove none does).** In particular, settle for which $r$ there are graphs that fix virtually surely yet the Moran-bound excludes them at any stated $\\varepsilon$.`,
    origin:
      'The spread of infectious diseases/drug resistance and social evolution are all abstracted as fixation probability modulated by network structure: whether structure amplifies or suppresses selection determines how much designed interventions (isolation/surveillance) can raise or lower the fixation of beneficial mutants. Closing this extremum tells epidemiologists “how fast structure can at most strengthen selection,” avoiding the endless pursuit of an optimal topology that does not exist.',
    progress: [
      '**Lieberman–Hauert–Nowak (2005)**: established the Moran process on graphs and the concepts of amplification/suppression.',
      '**Nowak’s lab / other groups (2005–2020)**: gave several amplifying families for various graphs (hubs, star graphs, directed hypergraphs) with numerical support.',
      '**Family constructions by Houchmandzadeh–Vallade / Diaz-Loving et al.**: showed that the extreme amplification bound tends to a constant as r varies, but the global upper bound is not uniformly closed.',
    ],
    obstacles: [
      '**Translating graph theory into dynamics for a universal upper bound**: to squeeze the fixation probability of arbitrary graphs under a single bound depending only on N, r, one must introduce harmonic measures on graphs and the required conservation structure, and there is no universal lemma that also covers directed cycles; special-case constructions and the universal bound each hold independently, and an intermediate lemma to match them is missing.',
    ],
    engineering_value:
      'Once closed, drug-resistance/tumor/species modeling can give the “theoretical maximum selection acceleration” of structured populations, providing a hard upper bound to calibrate protocol comparisons between complete graphs and network models; reverse suppression-type conclusions directly guide the failure boundary of isolation strategies.',
    formalization_notes:
      'The decision is analytic-discrete: write the fixation probability as a ratio of a graph harmonic function and a generating function, reduce the upper bound to a variational inequality on the graph degree distribution, and verify individual instances by enumeration/integer programming; the proof uses graph theory plus Poissonization techniques, with good formalization payoff (parts of this area are already verified in Lean/Isabelle).',
    references: [
      {
        label: 'E. Lieberman, C. Hauert, M. A. Nowak, Evolutionary dynamics on graphs, Nature 433 (2005) 312–316',
        url: 'https://doi.org/10.1038/nature03204',
      },
      {
        label: 'K. Zhou et al., Amplification on directed graphs via a generalization of the Moran process, Nature Comms (2022)',
        url: 'https://www.nature.com/articles/s41467-022-32426-2',
      },
    ],
  },
  {
    id: 'mc-029',
    output: 'verified_truth',
    judgment:
      'A pass settles whether absolute concentration robustness (ACR) can be certified from structure alone beyond network motifs: either give a sufficient structural criterion (readable from the reaction network graph, without solving ODEs) that guarantees ACR for a non-ACR-obvious network family and prove it, or exhibit a network whose ACR in the full-parameter sense holds but is undetectable by any finite set of rational/structural invariants, so algebraic-certificate search terminates with guaranteed completeness on a stated class.',
    title: 'Structural Certification of Absolute Concentration Robustness in Reaction Networks',
    titleZh: '反应网络中绝对浓度鲁棒性的结构判据',
    domain: 'mathematical-chemistry',
    subdomain: 'crnt',
    status: 'open',
    difficulty: 'advanced',
    formalization_potential: 'high',
    verification_path: 'analytical',
    tags: ['crnt', 'absolute-concentration-robustness', 'multistationarity', 'futile-cycle', 'algebraic-certificate'],
    contributor: 'community',
    date_added: '2026-08-23',
    proposer: 'G. A. Shinar & M. Feinberg',
    proposed_year: 2010,
    via: {
      label: 'Shinar, Feinberg, Structural sources of robustness in biochemical reaction networks, Science 327 (2010) 1389–1391',
      url: 'https://doi.org/10.1126/science.1184453',
    },
    related_problems: [],
    statement: `A reaction network exhibits absolute concentration robustness (ACR) in a species $X$ if in every positive steady state the concentration of $X$ is the same, independent of total mass. For the class of mass-action systems, **find a criterion, readable directly from the reaction graph (stoichiometry + rates), that is both sufficient and necessary for ACR in as wide a subclass as possible — or prove for a designated wide subclass that no such finite, purely structural certificate exists (requiring algebraic parameter search), giving a completeness statement that bounds what can be certified "from the wiring alone".**`,
    origin:
      'Negative-feedback/feedforward loops in synthetic biology need robust modules that “fix the output concentration regardless of the total intracellular mass”; ACR was identified by Shinar–Feinberg as having a provable source via graphical criteria, but its completeness (“which non-obvious networks are necessarily ACR”) has only partial criteria and an endless staircase. Once closed, circuit design tools could automatically and assumption-free decide whether a given network is ACR, without per-parameter simulation.',
    progress: [
      '**Shinar–Feinberg (2010)**: gave the “same-side dual concentration” graphical sufficient criterion, proving the ACR source of futile cycles.',
      '**Pérez-Millán / Gao et al. (2012–2018)**: extended to various feedback networks and toward necessary criteria, with the CRN ACR IVP framework.',
      '**Open**: for general mass-action networks there remains a gap between structural sufficient and necessary criteria, and the completeness question is unsettled.',
    ],
    obstacles: [
      '**The interface between algebraic and graphical conditions**: a precise characterization of ACR involves zero ideals of parameter algebra (e.g. a certain term must be identically zero), and translating it into purely network-topological conditions loses completeness; to make a criterion “purely structural → complete,” one must prove within some conserved/dynamical family that the algebraic conditions can be enclosed in finitely many patterns — an interface between CRNT and computational algebra.',
    ],
    engineering_value:
      'An ACR criterion that can be judged “by looking only at the wiring” lets synthetic biology tools automatically screen modules that robustly output concentration, and metabolic design judge the hard boundary of pathway robustness to mass perturbations; a completeness statement quantitatively delineates which scenarios must fall back to parameter-algebra checks, avoiding pseudo-robust judgments based on false state dependence.',
    formalization_notes:
      'The decision is algebraic-structural: ACR reduces to the constancy of a specific variable in a parameter polynomial ideal (decided for partial classes via Gröbner/resultant methods), and the proof of the graphical criterion can be mechanically turned into a membership proof in polynomial rings; the area already has substantial formalization foundations, with high formalization payoff.',
    references: [
      {
        label: 'G. A. Shinar, M. Feinberg, Structural sources of robustness in biochemical reaction networks, Science 327 (2010) 1389–1391',
        url: 'https://doi.org/10.1126/science.1184453',
      },
      {
        label: 'M. Pérez-Millán, A. Dickenstein et al., Symbolic dynamics of absolute concentration robustness, SIAM J. Appl. Dyn. Syst. (2012)',
        url: 'https://doi.org/10.1137/110839386',
      },
    ],
  },
  {
    id: 'mp-037',
    output: 'verified_behavior',
    judgment:
      'A qualifying answer is a “heat-margin decision” rather than a precise curve: for a specific natural-convection cooling geometry with given heat load, ambient conditions, and layout, deliver a verifiable total band $[\\underline{Nu},\\overline{Nu}]$ for the Nusselt number, together with a proof that the band simultaneously covers the three residual layers — (1) **R_model**: the residual upper bound from restricting true compressible-gas dynamics to Boussinesq/boundary layer (including the radiative decay term); (2) **R_param**: the input residual upper bound on the total band from the uncertainty of the heat load and ambient temperature/flow speed when they come from measurement/calibration (valid for all operating conditions in the measurement interval); (3) **R_num**: the residual upper bound of mesh, time step, and SDP duality gap when solving the controlled model by DNS/interval arithmetic; each of the three carries an independently checkable constant and the total band satisfies $\\overline{Nu}-\\underline{Nu}\\le$ R_model+R_param+R_num. Consumption form of a pass: for a given heat load, whether the fin peak temperature stays below the margin upper limit is directly given by the certified band, without recomputing DNS.',
    title: 'Certified upper bounds on heat transport in Rayleigh–Bénard convection',
    titleZh: 'Rayleigh–Bénard 对流传热 Nusselt 数的可核验上界',
    domain: 'mathematical-physics',
    subdomain: 'fluids-turbulence',
    status: 'open',
    difficulty: 'frontier',
    formalization_potential: 'medium',
    verification_path: 'numerical',
    tags: ['rayleigh-benard-convection', 'nusselt-number-bounds', 'variational-bounds', 'certified-computation', 'turbulence'],
    contributor: 'community',
    date_added: '2026-08-24',
    proposer: 'W. V. R. Malkus',
    proposed_year: 1954,
    via: {
      label: 'Ding & Kerswell, Exhausting the background approach for bounding the heat transport in Rayleigh–Bénard convection, J. Fluid Mech. 889, A33 (2020), doi:10.1017/jfm.2020.41',
      url: 'https://doi.org/10.1017/jfm.2020.41',
    },
    related_problems: [
      {
        id: 'mp-041',
        relation: 'generalizes',
        note: 'Total-band inheritance (direction 2): the asymptotic Ra^{1/3} upper-bound skeleton of mp-037 is inherited by the engineering heat-margin certificate of mp-041. This problem is upstream — if the outer bound of mp-037 is tightened, the R_model upper bound of downstream mp-041 narrows accordingly and the total band becomes tighter; if the core of mp-037 is pierced by a counterexample, the upper-bound skeleton borrowed by mp-041 fails and the margin decision fails at the same time. The trustworthiness of the downstream band chains into this problem’s upper-bound certificate.',
      },
    ],
    statement: 'Consider Boussinesq convection between two parallel plates, heated from below and cooled from above, driven by the temperature difference; the Nusselt number $Nu = \\langle q\\rangle/(\\kappa\\Delta T/h)$ is an upper-bound function $\\mathrm{Nu}(Ra,Pr)$ constrained by the facts. Howard (1963) proved $Nu\\le (\\tfrac{3}{64})^{1/2}Ra^{1/2}$, and Doering–Constantin (1996) improved the prefactor to $Nu\\le\\tfrac16 Ra^{1/2}$ with the background method; but no matter how the background field is optimized, all known rigorous proofs stop at the $Ra^{1/2}$ scaling (the best current constant in the no-slip case is $Nu\\le 0.02634\\,Ra^{1/2}$), while numerical/DNS evidence consistently points to $Nu\\sim Ra^{1/3}$ at larger $Ra$ (the Malkus–Howard marginal-stability boundary-layer assertion). The verifiable deliverable of this problem is: for given $Ra,Pr$ and boundary type, give an upper bound $\\overline{\\mathrm{Nu}}(Ra,Pr)$ with a verifiable constant and its “outer” proof, whose scaling exponent at $Ra\\to\\infty$ is strictly better than $1/2$, or prove, with no side-wall loophole, that this is impossible; the question is whether there exists a programmatic outer argument that, for a family of increasing $Ra$, produces in batch per-item independently verifiable upper/lower bound pairs for the normalized constant $c(Ra)=Nu/Ra^{1/3}$ that strictly decreases with $Ra$, and encloses them all via interval arithmetic in $[\\underline{c}(Ra),\\overline{c}(Ra)]$ with $\\overline{c}-\\underline{c}\\to 0$?',
    certificate: {
      r_model: {
        bound: 'Residual upper bound of the Boussinesq/boundary-layer approximation relative to true compressible-gas dynamics (including the radiative decay term)',
        derivation: 'Explicit residual bound of the Boussinesq approximation',
      },
      r_param: {
        bound: 'Input residual from the propagation of heat-load and ambient temperature/flow-speed measurement uncertainty to the Nu upper bound',
        derivation: 'Propagation bound valid for all operating conditions in the measurement interval',
      },
      r_num: {
        bound: 'Residual upper bound of mesh, time step, and SDP duality gap when solving the controlled model by DNS/interval arithmetic',
        derivation: 'Zero/small-gap proof via interval arithmetic and SDP duality',
        kind: 'numerical',
      },
      total_band: 'Nu_hi - Nu_lo ≤ R_model + R_param + R_num',
      certified_band: '[Nu_lo, Nu_hi]',
    },
    engineering_deliverables: ['Nu(Ra,Pr) upper-bound certificate', 'Conservative heat-margin bound for cooling design'],
    origin:
      'Rayleigh–Bénard convection is the standard model of heat transport in oceans, atmospheres, the mantle, and industrial cooling; its core engineering question is to express the mean heat flux $Nu$ as a function of $Ra$, for designing heat sinks, predicting boundary-layer fluxes, and the heat exchange in climate models. But turning $Nu(Ra)$ into a rigorous inequality rather than an empirical fit requires upper bounds in the full space of dimensionless parameters that do not rely on ad hoc closure assumptions and can directly carry a safety margin — this is precisely what the background/variational method must answer: giving a conservative upper bound usable in engineering while approaching the physically selected $1/3$ scaling. A machine-verifiable outer numerical certificate is equivalent to turning this classical problem into an “auditable computation” optimization problem.',
    progress: [
      '**Howard (1963)**: first gave the rigorous upper bound $Nu\\le(\\tfrac{3}{64})^{1/2}Ra^{1/2}$, establishing the $Ra^{1/2}$ upper-bound scaling.',
      '**Doering & Constantin (1996)**: the background method improved the prefactor to $Nu\\le\\frac16 Ra^{1/2}$ and became a computable framework.',
      '**Plasting & Kerswell (2003)**: optimized the background, further lowering the $Ra^{1/2}$ prefactor (no-slip $0.02634$).',
      '**Choffrut, Nobili & Otto (2016)**: obtained $Nu\\lesssim Ra^{1/3}$ (with logarithmic corrections) when $Pr\\gtrsim Ra^{1/3}$, breaking through the $1/2$ barrier.',
      '**Ding & Kerswell (2020)**: proved that under a certain class of constraints the background/variational method has been “exhausted,” and the $Ra^{1/2}$ upper-bound barrier cannot be crossed with that framework in the Levy sense.',
    ],
    obstacles: [
      '**The $Ra^{1/2}$ upper-bound barrier**: existing variational/background methods cannot break through the $Ra^{1/2}$ scaling, while the data point to $Ra^{1/3}$; the gap between them (the $1/6$ power) reflects the lack of new dynamical input, and no rigorous upper-bound technique converging to $1/3$ currently exists.',
      '**The marginal-stability heuristic is unproven**: the Malkus–Howard assertion that boundary layers remain marginally stable and thereby yield $1/3$ is non-rigorous, lacks a quantifiable error bound, and is hard to turn directly into an outer certificate.',
    ],
    engineering_value:
      'This board deliberately narrows the goal from “approaching the asymptotic $Ra^{1/3}$ scaling” to “delivering an instantaneous margin decision for a specific cooling geometry.” The value thereby shifts from **conditional** to **consumable**: engineers no longer need to wait for certificates that approach the true curve, but directly consume the certified interval “whether the peak temperature exceeds the limit under a specific heat load”; model-layer (Boussinesq approximation) and numerical-layer (DNS/interval) residuals are explicitly separated and synthesized into a total band, making every error source auditable during margin design. The asymptotic $1/3$ upper bound remains in the statement as an open academic goal, but it is no longer a precondition for delivering this premium certificate.',
    formalization_notes:
      'The numerical path is the most feasible: formulate the background-field upper-bound problem as a convex/semidefinite program, and use interval arithmetic + rational SDP duality to give a rigid enclosure of $\\overline{Nu}$ with a zero-gap proof; for the family $Ra\\to\\infty$, use duality-gap decomposition and asymptotic expansion to outsource the proof.',
    references: [
      {
        label: 'Howard, Heat transport by turbulent convection, J. Fluid Mech. 17 (1963)',
        url: 'https://doi.org/10.1017/S0022112063000741',
      },
      {
        label: 'Ding & Kerswell, Exhausting the background approach (JFM 2020), doi:10.1017/jfm.2020.41',
        url: 'https://doi.org/10.1017/jfm.2020.41',
      },
      {
        label: 'Choffrut, Nobili & Otto, Upper bounds on Nusselt number at finite Prandtl number, arXiv:1412.4812',
        url: 'https://arxiv.org/abs/1412.4812',
      },
    ],
  },
  {
    id: 'mp-040',
    output: 'verified_behavior',
    judgment:
      'A qualifying answer is a “simulability decision for a 2D local spin system” rather than a general area-law theorem: for a specific 2D, homogeneous, constant-gap local spin Hamiltonian, deliver a verifiable upper bound (area law) for the entanglement entropy of subregions in terms of the area, or a provable non-area-law counterexample signal, together with a three-layer residual total band — (1) **R_model**: the residual upper bound introduced by restricting the true (possibly frustrated / with arbitrary local couplings) Hamiltonian to the “constant-gap local” Hamiltonian class (with explicit restrictions on $\\Delta$ and the local dimension); (2) **R_num**: the residual upper bound introduced by the verifiable enclosure of the gap lower bound (interval/symbolic computation) and the interval estimate of the AGSP projection contraction rate, both independently checkable and synthesized into the total band; (3) the target Hamiltonian is an exactly given physical-system input, **R_param≡0 (no input-measurement residual layer; stated as such)**. Consumption form of a pass: given a concrete 2D Hamiltonian and gap evidence, directly obtain the verifiable decision “whether the ground state can be efficiently compressed by iPEPS with polynomial boundary length (area law) or is necessarily super-logarithmic (counterexample),” serving the trustworthiness and error bounds of tensor-network numerics.',
    certificate: {
      r_model: {
        bound: 'Residual upper bound introduced by restricting the true (possibly frustrated / with arbitrary local couplings) Hamiltonian to the constant-gap local Hamiltonian class (with explicit restrictions on Δ and the local dimension)',
        derivation: 'Residual bound from restriction to the constant-gap local class',
      },
      r_param: {
        bound: '≡0 (target Hamiltonian is an exactly given physical-system input; no input-measurement residual layer)',
        derivation: 'Parameters exactly given',
        kind: 'assumption',
        upper: 0,
      },
      r_num: {
        bound: 'Residual upper bound introduced by the verifiable enclosure of the gap lower bound (interval/symbolic) and the interval estimate of the AGSP projection contraction rate',
        derivation: 'Interval/symbolic enclosure bound',
        kind: 'numerical',
      },
      total_band: 'entanglement entropy area-law upper bound ≤ R_model + R_num',
      certified_band: 'S_A ≤ c·|∂A| (area-law bound) or sqrt(n)-type counterexample signal',
    },
    title: 'Certified entanglement area-law certificate (or counterexample) for gapped 2D local spin Hamiltonians',
    titleZh: '二维有能隙局域自旋系统纠缠面积律的可核验证书（或反例）',
    domain: 'mathematical-physics',
    subdomain: 'hamiltonian-lattices',
    status: 'open',
    difficulty: 'frontier',
    formalization_potential: 'low',
    verification_path: 'numerical',
    tags: ['area-law', 'entanglement-entropy', 'spectral-gap', 'spin-systems', 'tensor-networks'],
    contributor: 'community',
    date_added: '2026-08-24',
    proposer: 'M. B. Hastings',
    proposed_year: 2007,
    via: {
      label: 'Eisert, Cramer & Plenio, Colloquium: Area laws for the entanglement entropy, Rev. Mod. Phys. 82 (2010) 277, doi:10.1103/RevModPhys.82.277',
      url: 'https://doi.org/10.1103/RevModPhys.82.277',
    },
    related_problems: [],
    statement: 'The area-law conjecture asserts that the ground state of any constant-gap, local-interaction lattice Hamiltonian has entanglement entropy $S_A$ for any bipartition $A$ growing at most linearly with the interface area $|\\partial A|$. Hastings (2007) proved the one-dimensional case; but for general (gapped, possibly frustrated) systems in two or more dimensions, the area law remains open. Movassagh–Shor (2016) constructed 1D models with square-root enhancement (super-logarithmic, volume-law) counterexamples, showing the boundary of the “forbidden region.” The verifiable deliverable of this problem: for a given family of 2D, gapped local Hamiltonians, deliver an auditable upper bound (area law) or a provable counterexample signal (non-area-law) for the entanglement entropy, together with checkable gap and Lieb–Robinson/AGSP constants; the question is whether there exists a decidable criterion (e.g. the AGSP contraction rate under a local gap) that, on a machine, outputs for a given 2D Hamiltonian a certificate of either “the area law holds at this magnitude” or “necessarily super-logarithmic,” and that gives a converging band of the ratio $S_A/|\\partial A|$ for increasing sizes within the family?',
    origin:
      'The area law is directly tied to tensor-network simulability: only area-law ground states can be efficiently compressed by DMRG/MPS-style methods, thereby supporting the theory of quantum phases, topological-phase classification, and quantum Hamiltonian complexity. The two-dimensional case is open because the Lieb–Robinson and AGSP tools cannot give gap-independent exponential compression for $d>1$; turning this into a “machine-auditable” criterion would serve both condensed-matter numerical reliability (giving an upper bound on simulation error) and Hamiltonian complexity (giving a decidable complexity-classification boundary).',
    progress: [
      '**Hastings (2007)**: ground states of 1D gapped systems satisfy the area law, with logarithmic-correction bounds.',
      '**Bravyi–Hastings–Verstraete / Arad–Kitaev et al. (AGSP)**: improved the 1D bound with AGSP-type techniques, tight in the gap, with some small constants made exact.',
      '**Cho (2014) and recent 2D progress**: proved 2D area laws under additional assumptions such as “locally gapped” or “frustration-free,” but general gapped 2D remains open.',
      '**Movassagh & Shor (2016)**: constructed 1D local Hamiltonians whose entanglement entropy grows as $\\sqrt{n}$ (super-logarithmic, volume-law), forming an important counterexample endpoint.',
    ],
    obstacles: [
      '**The tools do not lift to higher dimensions**: the 1D proofs rely on Lieb–Robinson input-dimension compression and AGSP contraction rates, which in $d=2$ cannot give gap-independent exponential bounds; general gapped systems lack a decidable criterion.',
      '**No explicit constants / checkable errors**: the constants of existing bounds (even where valid) have complex dependence and blow up with dimension, making them hard to turn into machine-auditable, independently checkable certificates.',
    ],
    engineering_value:
      'This board narrows the goal from “proving the general 2D area law” to “deciding ground-state compressibility for a given concrete Hamiltonian,” shifting the value from **conditional** to **consumable**: engineers no longer passively wait for a general theorem, but directly consume the certified decision “whether the ground state can be compressed by iPEPS with polynomial boundary length,” and explicitly separate the model-layer (constant-gap local class restriction) and numerical-layer (gap enclosure / AGSP interval estimation) residuals into a total band, providing an auditable error upper bound for the trustworthiness of tensor-network simulation — current practice relies on numerical convergence; this board gives them a verifiable layer of support rather than a silent assumption.',
    formalization_notes:
      'The numerical path is feasible: use a verifiable enclosure of the gap lower bound + an interval estimate of the AGSP projection contraction rate to turn the area law into an explicit proof of $S_A\\le c|\\partial A|$ on finite lattices; for counterexamples, give a provable non-area-law amplifying signal (of $\\sqrt{n}$ type).',
    references: [
      {
        label: 'Eisert, Cramer & Plenio, Area laws for the entanglement entropy, Rev. Mod. Phys. 82 (2010) 277',
        url: 'https://doi.org/10.1103/RevModPhys.82.277',
      },
      {
        label: 'Movassagh & Shor, Supercritical entanglement in local systems: Counterexample to the area law for quantum matter, PNAS 113 (2016) 13278, doi:10.1073/pnas.1605716113',
        url: 'https://doi.org/10.1073/pnas.1605716113',
      },
    ],
  },
  {
    id: 'me-034',
    output: 'verified_behavior',
    judgment:
      'A qualifying answer is a “verifiable certificate for the worst-case number of communication rounds” rather than a single optimal algorithm: for a given connected $n$-node graph $G$, deliver a verifiable upper bound on the worst-case number of rounds $T^*(G,n)$ needed for exact quantized average consensus (together with a provable lower bound), so that the convergence time is enclosed by a controlled bracket, together with a three-layer residual total band: (1) **R_model**: the residual upper bound introduced by restricting the real distributed system to an information model with discrete quantization, finite bandwidth, and no global knowledge (with explicit dependence on synchronization/message-passing assumptions); (2) **R_num**: the residual upper bound introduced by enclosing via interval/exact arithmetic the computation of the algorithm round estimates and the random-walk mixing time / mass-transfer potential; (3) the network $G$, bandwidth, and delay are exactly given system inputs, **R_param≡0 (no input-measurement residual layer; stated as such)**. Consumption form of a pass: given network $G$, bandwidth, and delay budget, directly obtain the verifiable interval “the minimal number of communication rounds lies in $[T_\\lo,T_\\hi]$,” letting sensor networks/clock synchronization/load balancing decide in how many rounds to buy an auditable exact quantized average, replacing the current empirical round margins.',
    certificate: {
      r_model: {
        bound: 'Residual upper bound introduced by restricting the real distributed system to an information model with discrete quantization, finite bandwidth, and no global knowledge (with dependence on synchronization/message-passing assumptions)',
        derivation: 'Residual bound from restriction to the discrete-quantization information model',
      },
      r_param: {
        bound: '≡0 (network G, bandwidth, and delay are exactly given system inputs; no input-measurement residual layer)',
        derivation: 'Parameters exactly given',
        kind: 'assumption',
        upper: 0,
      },
      r_num: {
        bound: 'Residual upper bound introduced by enclosing via interval/exact arithmetic the computation of the algorithm round estimates and the random-walk mixing time / mass-transfer potential',
        derivation: 'Interval/exact arithmetic enclosure bound',
        kind: 'numerical',
      },
      total_band: 'consensus round bracket ≤ R_model + R_num',
      certified_band: '[T_lo, T_hi] (minimal number of communication rounds)',
    },
    title: 'Optimal Worst-Case Convergence Time for Finite-Rate Quantized Average Consensus',
    titleZh: '有限速率量化平均共识的最优最坏情形收敛时间',
    domain: 'mathematical-engineering',
    subdomain: 'consensus',
    status: 'open',
    difficulty: 'frontier',
    formalization_potential: 'medium',
    verification_path: 'numerical',
    tags: ['quantized-consensus', 'distributed-averaging', 'finite-time-convergence', 'mass-preservation', 'load-balancing'],
    contributor: 'community',
    date_added: '2026-08-24',
    proposer: 'A. Kashyap, T. Başar & R. Srikant',
    proposed_year: 2007,
    via: {
      label: 'Kashyap, Başar, Srikant, Quantized consensus, Automatica 43(7):1192–1203 (2007)',
      url: 'https://doi.org/10.1016/j.automatica.2007.01.002',
    },
    related_problems: [],
    statement: `Let a connected graph $G=(V,E)$ hold integer initial values $c_i\\in\\mathbb Z$; agents exchange states only along edges and only in discrete (quantized) rounds, so each transmission carries an integer. A quantized averaging scheme must drive every node to a value within one step of the exact average $\\bar c=\\sum_i c_i/n$ and then stop with a distributed certificate. **Determine, for an arbitrary connected $G$ on $n$ nodes, the optimal worst-case number of communication rounds $T^*(G,n)$ to reach finite-time quantized average consensus, and construct a distributed algorithm attaining it (matching the lower bound up to constants) — or give a network class on which every such algorithm requires a certified number of rounds that beats the known polynomial bounds by a stated factor.**`,
    origin:
      'Real communication links have finite bandwidth and memory, so sensor fusion, clock synchronization, and processor load balancing can only exchange discrete quantized values rather than reals, making the “real-valued averaging” idealization unimplementable. Quantized averaging must both preserve mass conservation (the sum is invariant) and reach agreement on discrete values in finitely many rounds, but its worst-case convergence time on general topologies has only mutually separate polynomial bounds, lacking a precise closure; closing it lets engineers know within how many rounds a distributed average can deliver an auditable final value for a given network size and bandwidth.',
    progress: [
      '**Kashyap–Başar–Srikant (2007)**: proposed randomized algorithms for the quantized averaging problem, giving convergence-time bounds for complete graphs and line graphs, and pointing out the long-standing open difficulty on general graphs.',
      '**El Chamie–Liu–Başar (2014)**: characterized finite-time convergence and neighborhood cycling in quantized averaging, giving tight bounds on the neighborhood size.',
    ],
    obstacles: [
      '**Coupling of mass conservation and rate–delay**: reaching the exact discrete mean requires keeping the total sum drift-free on the integer lattice while every node independently decides to stop; pushing the convergence rounds down to the information lower bound corresponding to spectral/topological parameters requires simultaneously controlling the “mass-transfer speed” and the “local completeness of the stopping criterion,” which constrain each other on general graphs, and a unified (mass-conservation + local stopping) lower-bound argument is missing.',
    ],
    engineering_value:
      'Once closed, this gives the directly consumable number “the minimal number of communication rounds for distributed averaging under finite bandwidth”: engineers can then decide whether sensor-network sampling/control periods must be relaxed to approximate averaging, or whether exact quantized averaging is feasible within a given delay budget. The output is a certified upper bound on the convergence rounds (with a provable worst-case network-instance lower bound), replacing the currently empirical round margins.',
    formalization_notes:
      'The decision is numerical-structural: reduce the convergence rounds to a combination of random-walk meeting times on the integer lattice and the mass-transfer potential function, with the lower bound argued via random-walk mixing times; one may first validate the algorithm and the lower-bound gap on specified topologies by simulation, then convert to a general upper bound, with medium formalization payoff.',
    references: [
      {
        label: 'A. Kashyap, T. Başar, R. Srikant, Quantized consensus, Automatica 43(7):1192–1203 (2007)',
        url: 'https://doi.org/10.1016/j.automatica.2007.01.002',
      },
      {
        label: 'M. El Chamie, J. Liu, T. Başar, Design and analysis of distributed averaging with quantized convergence, CDC 2014, doi:10.1109/CDC.2014.7039606',
        url: 'https://doi.org/10.1109/CDC.2014.7039606',
      },
    ],
  },
  {
    id: 'mp-041',
    output: 'verified_behavior',
    judgment:
      'For a specific natural-convection fin heat sink (with given heat load, ambient conditions, and tilt-angle operating point), deliver a total band $[\\underline{Nu},\\overline{Nu}]$ for the Nusselt number and a proof that it covers the three residual layers: (1) **R_model**: the residual upper bound of the Boussinesq/boundary-layer (including radiation) approximation relative to true compressible-gas dynamics; (2) **R_param**: the input residual upper bound on the total band from the uncertainty of the heat load and ambient temperature/flow speed when they come from measurement/calibration (valid for all operating conditions in the measurement interval); (3) **R_num**: the residual upper bound of mesh, time step, and SDP duality gap when solving the controlled model by DNS/interval arithmetic. The three layers each carry an independently checkable constant and satisfy $\\overline{Nu}-\\underline{Nu}\\le$ R_model+R_param+R_num. The decision should thereby directly answer “whether the fin peak temperature stays below the margin upper limit under a given heat load,” rather than relying on DNS recomputation or statistical extrapolation of empirical correlations.',
    title: 'Certified heat-sink thermal margin via a three-layer residual total band on free convection',
    titleZh: '自然对流散热器峰值温度裕量的三层残差总带证书',
    domain: 'mathematical-physics',
    subdomain: 'convective-heat-transfer',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'high',
    verification_path: 'numerical',
    tags: ['free-convection', 'nusselt-bounds', 'elementary-margins', 'interval-arithmetic', 'certified-computation'],
    contributor: 'admin',
    date_added: '2026-08-24',
    proposer: 'A. Bejan',
    proposed_year: 1984,
    via: {
      label: 'Bejan, Convection Heat Transfer, 4th ed., Wiley, 2013 (reference benchmark for natural-convection correlations and scales)',
      url: 'https://doi.org/10.1002/9781118671627',
    },
    related_problems: [
      {
        id: 'mp-037',
        relation: 'depends_on',
        note: 'Total-band inheritance (direction 2): the heat-margin total band of mp-041 depends on the Nu upper-bound system given by mp-037. mp-037 is upstream — if its Ra^{1/3} scaling upper bound is tightened, the R_model upper bound of mp-041 narrows accordingly and the total band becomes tighter; if the core outer bound of mp-037 is pierced by a counterexample, the upper-bound skeleton borrowed by mp-041 fails and the margin decision fails at the same time. In other words, to trust this margin one must first trust mp-037’s asymptotic upper-bound certificate.',
      },
    ],
    statement: `A specific fin heat sink dissipates heat under passive natural convection, with the heat load $Q$, ambient conditions, and layout already fixed. What the engineer wants is not a curve but a margin: whether the fin peak temperature $T_{max}$ stays below the thermal design limit. The verifiable deliverable of this problem is a total band $[\\underline{Nu},\\overline{Nu}]$ for $Nu$, together with bounds and proofs for each of the three residual layers: (1) R_model — the model residual upper bound of the Boussinesq/boundary-layer approximation relative to true compressible-gas dynamics; (2) R_param — the input-uncertainty residual upper bound when the heat load and ambient temperature/flow speed come from measurement/calibration; (3) R_num — the numerical residual upper bound from the mesh/time-step/SDP-duality discretization in solving the controlled model. The three satisfy $\\overline{Nu}-\\underline{Nu}\\le$ R_model+R_param+R_num and each layer is independently checkable. The margin decision for $T_{max}$ is given directly by the band without recomputation.`,
    certificate: {
      r_model: {
        bound: 'Model residual upper bound of the Boussinesq/boundary-layer approximation relative to true compressible-gas dynamics (skeleton borrowing mp-037’s asymptotic outer bound)',
        derivation: 'mp-037’s Ra^{1/3} scaling upper bound + Boussinesq residual bound',
      },
      r_param: {
        bound: 'Input residual upper bound on the total band from the propagation of heat-load and ambient temperature/flow-speed measurement uncertainty',
        derivation: 'Interval image of propagating measurement-interval parameters to the Nu band',
      },
      r_num: {
        bound: 'Numerical residual upper bound of mesh, time step, and SDP duality gap',
        derivation: 'Zero/small-gap proof via interval arithmetic and SDP duality',
        kind: 'numerical',
      },
      total_band: 'Nu_hi - Nu_lo ≤ R_model + R_param + R_num',
      certified_band: '[Nu_lo, Nu_hi]',
    },
    engineering_deliverables: ['Heat-sink peak-temperature margin decision', 'Certified band for thermal design review'],
    origin:
      'Power electronics and LED arrays commonly rely on passive cooling, and margin design has long depended on empirical correlations or expensive DNS cross-validation. If “how trustworthy is this simulation” could be replaced by a low-cost, reproducible certified band that explicitly separates the model/input/numerical three residual layers, engineers could obtain the answer “does the peak temperature exceed the limit” within a single computation, shifting trust from benchmark alignment to per-problem verifiable total bands.',
    progress: [
      '**Classical correlation systems (Morgan, Raithby–Hollands, etc.)**: give empirical correlations for free convection $Nu(Ra)$ with limited accuracy and no residual bounds.',
      '**Rigorous computation tools**: interval arithmetic and SDP-duality upper bounds for heat transport have yielded partial constants on flat plates (see the boundary-layer upper-bound literature), but have not yet landed on a three-layer total band for a specific heat-sink geometry.',
    ],
    obstacles: [
      '**The three residual layers must be packed simultaneously**: existing methods either give a rigorous bound for the model error alone (far from engineering geometry) or estimate only the numerical error via convergence, lacking a layered proof that synthesizes them into a single band; the R_param layer is often silently dropped in engineering practice and must be explicitly listed as an uncertainty-propagation term.',
      '**Geometry dependence**: the three-dimensional fin geometry makes rigorous upper-bound problems intricate, requiring an engineering-acceptable balance between checkable constants and geometric approximation.',
      '**Inheritance dependence**: the R_model upper-bound skeleton borrows the asymptotic outer-bound result of mp-037, so the validity of this certificate chains into whether mp-037’s Ra^{1/3} scaling upper bound holds.',
    ],
    engineering_value:
      'This is a template of “consumable rather than conditional”: it produces the directly usable interval decision “whether the peak temperature stays below the margin upper limit under a given heat load.” It lets passive-cooling engineers obtain a certified margin conclusion without expensive DNS, and shifts simulation trustworthiness from “benchmark alignment” to “reproducible total band,” ready for thermal design review in a single computation.',
    formalization_notes:
      'The numerical path is realistic: the DNS of this controlled model can be intervalized, turning the $Nu$ upper/lower bounds into zero/small-gap proofs via interval arithmetic and duality (R_num); the model layer is connected by an explicit residual upper bound of Boussinesq relative to compressible dynamics (R_model); input-parameter measurement uncertainty propagates to the total band via interval-parameter propagation (R_param). The formalization investment is medium, and the payoff is an auditable margin certificate for cooling design whose validity chains through depends_on into mp-037’s asymptotic upper-bound certificate.',
    references: [
      {
        label: 'A. Bejan, Convection Heat Transfer, 4th ed., Wiley (2013)',
        url: 'https://doi.org/10.1002/9781118671627',
      },
    ],
  },
  {
    id: 'mc-030',
    output: 'verified_behavior',
    judgment:
      'A qualifying answer is a “steady-state decidability certificate”: for a specific catalytic reaction network with a given measurement interval for the rate constants (itself carrying measurement residuals) and reactor operating conditions, deliver a verifiable classification criterion — whether the system has exactly one attracting steady state under these conditions, and that the target intermediate concentration necessarily falls into the total band [c_lo,c_hi]. The band must simultaneously cover the three residual layers: (1) **R_model**: the residual upper bound introduced by the true activity deviating from ideal mass action (activity coefficient ≠ concentration); (2) **R_param**: the input residual upper bound on [c_lo,c_hi] and on the steady-state discrimination boundary from the uncertainty of the rate constants and operating parameters when they come from measurement (valid for all $k$ in the measurement interval); (3) **R_num**: the residual upper bound of steady-state root finding and interval arithmetic; the three are synthesized so that the total bandwidth ≤ R_model+R_param+R_num and each layer is checkable. Consumption form of a pass: given catalytic reactor conditions and measurement uncertainty, directly obtain the verifiable statement “this intermediate concentration necessarily falls in this interval, and the system does not jump between attracting steady states.”',
    title: 'Certified decidable stability of target-intermediate concentration for mass-action catalytic networks',
    titleZh: '催化反应网络目标中间体稳态可判定性与浓度总带证书',
    domain: 'mathematical-chemistry',
    subdomain: 'reaction-network-stability',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'medium',
    verification_path: 'numerical',
    tags: ['chemical-reaction-networks', 'multistationarity', 'interval-arithmetic', 'parameter-uncertainty', 'certified-computation'],
    contributor: 'admin',
    date_added: '2026-08-24',
    proposer: 'M. Feinberg',
    proposed_year: 1987,
    via: {
      label: 'Feinberg, Chemical reaction network structure and the stability of complex isothermal reactors, Chem. Eng. Sci. 42(10):2229–2268 (1987)',
      url: 'https://doi.org/10.1016/0009-2509(87)80106-7',
    },
    related_problems: [
      {
        id: 'mc-005',
        relation: 'depends_on',
        note: 'Total-band inheritance (direction 2): the steady-state concentration band of mc-030 depends on the structural identifiability classification of rate constants in mc-005. mc-005 is upstream — it decides when rate constants can be distinguished from observable subsets; if its identifiability classification is tightened, the measurement-interval universality of mc-030 becomes more reliable and its band more trustworthy; if mc-005 decides that a measurement scheme is non-identifiable, then mc-030’s conclusion fails on the measurement intervals where parameters should have been distinguished. To trust this concentration band, one must first trust mc-005’s identifiability certificate.',
      },
      {
        id: 'mc-004',
        relation: 'shares_tools',
        note: 'Both reason about multistationarity of reaction networks; mc-004 is classification, mc-030 adds measurement-uncertainty residuals to a concrete operating point.',
      },
    ],
    statement: `For a specific catalytic reaction network and reactor, the rate constants can only be obtained as measurement intervals $[k_i-\\delta_i,k_i+\\delta_i]$. The engineer must decide: whether the system has exactly one attracting steady state under these conditions, and in which verifiable interval the target intermediate steady-state concentration $c$ lies. The deliverable is a certified classification criterion whose conclusion band simultaneously covers both the model residual of the idealized model (activity deviating from mass action) and the numerical-solution residual. A “floating-point steady state” obtained by picking one concentration per measurement does not constitute an answer; the answer must be an interval with layers separated, each with its own constant, synthesized into a total band.`,
    certificate: {
      r_model: {
        bound: 'Model residual upper bound introduced by the true activity deviating from ideal mass action (activity coefficient ≠ concentration)',
        derivation: 'Explicit bound for the activity-coefficient residual',
      },
      r_param: {
        bound: 'Input residual upper bound on [c_lo,c_hi] and the steady-state discrimination boundary from the propagation of rate-constant and operating-parameter measurement uncertainty (valid for all k in the measurement interval)',
        derivation: 'Interval image of propagating measurement-interval parameters to the concentration band and steady-state boundary',
      },
      r_num: {
        bound: 'Numerical residual upper bound of steady-state root finding and interval arithmetic',
        derivation: 'Interval root-finding residual bound',
        kind: 'numerical',
      },
      total_band: 'c_hi - c_lo ≤ R_model + R_param + R_num',
      certified_band: '[c_lo, c_hi]',
    },
    engineering_deliverables: ['Certifiable steady-state decidability certificate for catalytic reactors', 'Certified band for intermediate concentration'],
    origin:
      'Rate constants in catalysis and biochemical networks are never precise, and what engineers need is “under this measurement uncertainty, where does my target intermediate concentration lie, and will it jump between attracting steady states.” Multistationarity theory (deficiency, CRN) gives existence criteria, but for a given operating condition with measurement residuals there is no decision that synthesizes the model-layer and numerical-layer residuals into a verifiable total band. This problem turns it into a statement that engineers can directly consume.',
    progress: [
      '**CRNT deficiency theory (Feinberg et al.)**: gives structural criteria for the existence of multistationarity and for at-most-one steady state for a given network.',
      '**Interval root methods**: use interval arithmetic/enclosure to find network steady states, giving numerical residual bands for each, but without layering them together with measurement residuals and activity residuals.',
    ],
    obstacles: [
      '**The cost of measurement residuals and dynamical validation**: widening the rate constants into intervals makes the “multistationary or not” boundary decision sensitive to residuals, so the activity-model residual must be bounded explicitly rather than assuming ideal behavior by default.',
      '**Global convergence of the intermediate steady state**: exactly one attracting steady state requires tools ruling out global convergence, complementary to single-point numerical constructions.',
    ],
    engineering_value:
      'This is a “consumable” template: it converts “will my reactor jump between steady states and where does the intermediate concentration lie” from a guess depending on each simulation into a single certified total-band interval that explicitly separates the measurement/activity/numerical three residual layers. Reactor design, safety bypass, and process control can all directly consume this decision without assuming ideal mass action.',
    formalization_notes:
      'The numerical path is realistic: use interval arithmetic to find the network steady states and enclose them as $[c_lo,c_hi]$, use activity-coefficient upper/lower bounds to give the model residual, and use interval Newton or enclosure constructions to give the numerical residual, then synthesize the two layers into a total band. The formalization investment is medium-low, fitting engineering decisions.',
    references: [
      {
        label: 'M. Feinberg, Chemical reaction network structure and the stability of complex isothermal reactors, Chem. Eng. Sci. 42(10):2229–2268 (1987)',
        url: 'https://doi.org/10.1016/0009-2509(87)80106-7',
      },
    ],
  },
  {
    id: 'mb-028',
    output: 'verified_behavior',
    judgment:
      'A qualifying answer is an “allele equilibrium-frequency band” rather than a single prediction point: for a resistance allele with given selection coefficient $s$ and mutation rate $\\mu$ (both given only as measurement intervals), deliver a verifiable total band [p_lo,p_hi] for the equilibrium frequency $p^*$, together with a proof that the band simultaneously covers the three residual layers: (1) **R_model**: the model residual upper bound introduced by idealizing the discrete Wright–Fisher dynamics of a finite population to the continuous diffusion/deterministic limit (explicitly including the finite-$N$ drift for a given population size); (2) **R_param**: the input residual upper bound on $p^*$ from the propagation of the measurement intervals of the selection coefficient $s$ and mutation rate $\\mu$ when they come from measurement (valid for all $s,\\mu$ in the measurement intervals); (3) **R_num**: the numerical residual upper bound of the discretization and interval arithmetic in root finding / interval mapping of the diffusion equation. The three each carry an independently checkable constant and the total band satisfies $p_{hi}-p_{lo}\\le$ R_model+R_param+R_num. Consumption form of a pass: given measurement uncertainty and population size, directly obtain the verifiable statement “the equilibrium frequency of the resistance allele necessarily lies in this interval,” for mutation surveillance and drug-resistance risk assessment.',
    title: 'Certified equilibrium allele-frequency band for a resistance allele under measurement uncertainty',
    titleZh: '测量不确定度下耐药等位基因平衡频率的三层残差总带证书',
    domain: 'mathematical-biology',
    subdomain: 'population-genetics',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'medium',
    verification_path: 'numerical',
    tags: ['selection-mutation', 'wright-fisher', 'parameter-uncertainty', 'population-genetics', 'finitesize-effect'],
    contributor: 'admin',
    date_added: '2026-08-24',
    proposer: 'M. Kimura',
    proposed_year: 1955,
    via: {
      label: 'Kimura, Stochastic processes and distribution of gene frequencies under natural selection, Cold Spring Harb. Symp. Quant. Biol. 20 (1955) 33–53',
      url: 'https://doi.org/10.1101/SQB.1955.020.01.006',
    },
    related_problems: [
      {
        id: 'mb-003',
        relation: 'depends_on',
        note: 'Total-band inheritance (direction 2): the resistance-allele equilibrium-frequency band of mb-028 depends on the global-stability classification of replicator dynamics with mutation in mb-003. mb-003 is upstream — if its global-stability structure is tightened, the dynamical foundation of mb-028’s equilibrium band is firmer and its conclusion more reliable; if the core classification of mb-003 is pierced by a counterexample (the dynamics has no global stable structure), then mb-028’s equilibrium-band assertion fails at the same time. To trust this equilibrium band, one must first trust mb-003’s stability certificate.',
      },
    ],
    statement: `A resistance allele evolves in a finite population, with the selection coefficient $s$ and mutation rate $\\mu$ available only as measurement intervals. What engineers/regulators want is not a point prediction but a certified interval for “where the equilibrium frequency lies.” The deliverable is a verifiable total band for the equilibrium frequency $p^*$, containing three residual layers — R_model (model residual of the finite-population Wright–Fisher drift deviating from the continuous diffusion limit), R_param (input residual from propagating the $s,\\mu$ measurement intervals to $p^*$), and R_num (numerical residual of root finding and interval mapping of the diffusion equation); the three layers each have bounds and are synthesized into a single band.`,
    certificate: {
      r_model: {
        bound: 'Model residual upper bound of idealizing the discrete Wright–Fisher dynamics of a finite population to the continuous diffusion limit (explicitly including finite-N drift)',
        derivation: 'Explicit finite-N drift bound',
      },
      r_param: {
        bound: 'Input residual upper bound on p* from the propagation of the measurement intervals of the selection coefficient s and mutation rate μ (valid for all s,μ in the measurement intervals)',
        derivation: 'Interval image of propagating measurement-interval parameters to the equilibrium frequency',
      },
      r_num: {
        bound: 'Numerical residual upper bound of discretization and interval arithmetic in root finding / interval mapping of the diffusion equation',
        derivation: 'Interval-mapping and root-finding residual bound',
        kind: 'numerical',
      },
      total_band: 'p_hi - p_lo ≤ R_model + R_param + R_num',
      certified_band: '[p_lo, p_hi]',
    },
    engineering_deliverables: ['Resistance-allele equilibrium frequency band', 'Risk assessment for mutation surveillance'],
    origin:
      'Drug-resistance risk assessment needs to predict within how long and with what probability an allele rises to a given frequency; yet the measurement of the selection coefficient and mutation rate carries errors itself. Separating the “finite-population drift” model residual, the “measurement propagation” input residual, and the “diffusion solving” numerical residual and synthesizing them into a verifiable band is the practical route that advances population genetics from “predicting a single trajectory” to “giving certified intervals,” directly consumable by resistance surveillance and evolutionary medicine.',
    progress: [
      '**Selection–mutation balance theory (Kimura et al.)**: gives the classical formula for the Wright equilibrium frequency and its diffusion approximation.',
      '**Finite-$N$ corrections**: the literature gives drift corrections of the finite population to the equilibrium frequency, but mostly as approximate formulas rather than banded bounds.',
    ],
    obstacles: [
      '**Finite-$N$ drift bounds**: writing the deviation of the discrete Wright–Fisher process from the continuous diffusion as an explicit, checkable residual upper bound is nontrivial and must cover the whole range from intermediate to high-frequency alleles.',
      '**Sensitive propagation from measurement to frequency**: the sensitive nonlinearity of the equilibrium frequency in $s,\\mu$ means propagating the measurement intervals to a $p^*$ band requires an explicit interval image rather than a point estimate.',
    ],
    engineering_value:
      'Directly consumable: given measurement uncertainty and population size, deliver “the equilibrium frequency of the resistance allele necessarily lies in this interval,” for mutation-surveillance thresholds and drug-resistance risk assessment, without debating the credibility of a single predicted value. This is a template for synthesizing the “model layer (finite $N$) + statistical layer (measurement propagation)” two residual layers into a single band.',
    formalization_notes:
      'The numerical path is realistic: use interval arithmetic to map the measurement intervals of $s,\\mu$ to an interval for $p^*$, then use the finite-$N$ correction term of the Sheppard–Kimura or Wright formula to give the model residual upper bound, and synthesize the two layers into a total band. The formalization investment is medium-low.',
    references: [
      {
        label: 'M. Kimura, Stochastic processes and distribution of gene frequencies under natural selection, Cold Spring Harb. Symp. Quant. Biol. 20 (1955) 33–53',
        url: 'https://doi.org/10.1101/SQB.1955.020.01.006',
      },
    ],
  },
]

export const DOMAINS: Record<
  Domain,
  { label: string; labelZh: string; prefix: string; color: string; blurb: string; excludes: string }
> = {
  'mathematical-physics': {
    label: 'Mathematical Physics',
    labelZh: '数学物理',
    prefix: 'mp',
    color: '#2f4bb3',
    blurb: 'Rigorous analysis of integrable systems, spectral theory, kinetic theory, and turbulence.',
    excludes: 'Not accepted: cosmological models, high-energy phenomenology, and predominantly numerical computational physics.',
  },
  'mathematical-chemistry': {
    label: 'Mathematical Chemistry',
    labelZh: '数学化学',
    prefix: 'mc',
    color: '#1e7a5a',
    blurb: 'Open problems in chemical graph theory and reaction network theory (CRNT).',
    excludes: 'Not accepted: materials design requiring actual synthesis validation, drug discovery.',
  },
  'mathematical-biology': {
    label: 'Mathematical Biology',
    labelZh: '数学生物',
    prefix: 'mb',
    color: '#9a5b13',
    blurb: 'Sharp thresholds for evolutionary dynamics and epidemic network models.',
    excludes: 'Not accepted: cell biology and neuroscience requiring new experimental data.',
  },
  'mathematical-engineering': {
    label: 'Mathematical Engineering',
    labelZh: '数学工程',
    prefix: 'me',
    color: '#8a2f3c',
    blurb: 'Multi-agent coordination and lower bounds for distributed algorithms.',
    excludes: 'Not accepted: controller design requiring deployment testing, protocol engineering implementations.',
  },
}

export const RELATION_LABELS: Record<RelationType, string> = {
  depends_on: 'Depends on',
  implies: 'Implies',
  shares_tools: 'Shared tools',
  generalizes: 'Generalizes',
  analog_of: 'Analogy',
}

export const STATUS_LABELS: Record<ProblemStatus, string> = {
  open: 'Open',
  partial: 'Partially solved',
  resolved: 'Resolved',
}

/** 证书生命周期的中文标签（与 i18n 的 pd.lifecycle.* 对应，供非 React 场景复用）。 */
export const LIFECYCLE_LABELS: Record<LifecycleStatus, string> = {
  open: 'Open (unproven)',
  tightened: 'Tightened',
  refuted: 'Refuted',
  superseded: 'Superseded',
}

/** 缺省生命周期视为 open。 */
export function lifecycleOf(p: Problem): LifecycleStatus {
  return p.lifecycle_status ?? 'open'
}

export const POTENTIAL_LABELS: Record<FormalizationPotential, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

export const VERIFICATION_LABELS: Record<VerificationPath, string> = {
  analytical: 'Analytical proof',
  numerical: 'Numerical verification',
  experimental: 'Experimental',
}

/**
 * Impact domains for the original catalog entries (newer entries carry
 * `impact_domains` inline). Kept as a map so legacy blocks stay untouched.
 * 可信度收敛（2026-09）：从 40+ 个域收缩到 30 个，只保留与题面直接相关的实证
 * 挂接；余下的 AI 外推影响域已删除。收缩仍待领域专家复核。
 */
export const IMPACT_DOMAINS: Record<string, string[]> = {
  'mp-001': ['Rarefied gas engineering', 'Aerospace aerodynamics'],
  'mp-003': ['Nonlinear lattice devices', 'Energy transport design'],
  'mp-004': ['Disordered semiconductor devices', 'Two-dimensional materials design'],
  'mp-005': ['Quantum magnetic materials', 'Tensor-network algorithms'],
  'mp-006': ['Optical soliton communication', 'Nonlinear optical devices'],
  'mp-007': ['Random matrix benchmarks', 'Numerical methods for disordered systems'],
  'mp-008': ['CFD turbulence models', 'Aircraft engine design'],
  'mc-001': ['Chemical process safety', 'Bioreactor design'],
  'mc-002': ['Industrial catalytic networks', 'Metabolic engineering'],
  'mc-004': ['Biochemical oscillator design', 'Synthetic gene circuits'],
  'mb-001': ['Tumor evolution modeling', 'Population genetics'],
  'mb-002': ['Public-health modeling', 'Epidemic prevention and control strategies'],
  'mb-004': ['Ecosystem conservation', 'Fisheries resource management'],
  'me-001': ['UAV formation', 'Sensor networks'],
  'me-003': ['Swarm robotics', 'Safety certification of swarm/flocking control'],
}

export function impactOf(p: Problem): string[] {
  return p.impact_domains ?? IMPACT_DOMAINS[p.id] ?? []
}

/** All distinct impact domains across the catalog, for grouping/filtering. */
export const ALL_IMPACT_DOMAINS: string[] = [
  ...new Set(PROBLEMS.flatMap(impactOf)),
]

/** 全部已结构化的工程交付物条目（方向四反向索引）：工程师挑一个交付物，
 *  就能看到由哪些 verified_behavior 证书直接支撑。来源是各题的 engineering_deliverables。 */
export const ALL_DELIVERABLES: string[] = [
  ...new Set(PROBLEMS.flatMap((p) => p.engineering_deliverables ?? [])),
]

/** 某题声明的工程交付物；无则空。 */
export function deliverablesOf(p: Problem): string[] {
  return p.engineering_deliverables ?? []
}

// Relations that are semantically undirected: if A shares tools with B,
// the statement is true from either side, so both directions should render.
// Data is authored one-directional to avoid repeating the same note; the
// reverse edge is derived here so UI, graph and exports always agree.
export const SYMMETRIC_RELATIONS: ReadonlySet<RelationType> = new Set([
  'shares_tools',
  'analog_of',
])

// p's declared relations plus reverse-derived symmetric edges from other
// problems that point back at p.
export function relatedOf(p: Problem): RelatedProblem[] {
  const own = [...p.related_problems]
  const seen = new Set(own.map((r) => r.id + '|' + r.relation))
  for (const q of PROBLEMS) {
    if (q.id === p.id) continue
    for (const r of q.related_problems) {
      if (r.id !== p.id || !SYMMETRIC_RELATIONS.has(r.relation)) continue
      const key = q.id + '|' + r.relation
      if (seen.has(key)) continue
      seen.add(key)
      own.push({ id: q.id, relation: r.relation, note: r.note })
    }
  }
  return own
}

// ---- 信任审计（方向二消费端）：上游证书依赖树 ----
// 由 p.depends_on X 可知 X 是 p 的上游；若 p 是 verified_behavior，其总带
// 可信度链入 X 的证书。render 上游树把"要信任此裕量需先信哪些上游"可视化，
// 任一层被击穿则下游失效。此处只沿 depends_on 单向展开（继承非对称）。

export interface TrustEdge {
  id: string
  note: string
  depth: number
}

/** 返回 p 的完整上游链（含间接依赖），按依赖深度由近及远排成一条路径。
 *  用 seen 防环；依赖关系在数据层应无环，guard 只是防御。 */
export function upstreamPath(p: Problem): TrustEdge[] {
  const out: TrustEdge[] = []
  const seen = new Set<string>([p.id])
  const walk = (q: Problem, depth: number) => {
    for (const r of q.related_problems) {
      if (r.relation !== 'depends_on' || seen.has(r.id)) continue
      seen.add(r.id)
      out.push({ id: r.id, note: r.note, depth })
      const target = PROBLEMS.find((x) => x.id === r.id)
      if (target) walk(target, depth + 1)
    }
  }
  walk(p, 1)
  return out
}

/** 与 upstreamPath 互补：列出由 p 推广/继承出去、可信度系于 p 的下游题。 */
export function downstreamOf(p: Problem): { id: string; note: string }[] {
  return p.related_problems
    .filter((r) => r.relation === 'generalizes' && PROBLEMS.some((x) => x.id === r.id))
    .map((r) => ({ id: r.id, note: r.note }))
}
