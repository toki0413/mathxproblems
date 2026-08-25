import type { Domain } from '@contracts/constants'
export type { Domain }

export type FormalizationPotential = 'high' | 'medium' | 'low'
export type VerificationPath = 'analytical' | 'numerical' | 'experimental'
export type ProblemStatus = 'open' | 'partial' | 'resolved'
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

/** 三层残差中一层的结构化形式：把 judgment 中的残差层提取为字段，
 *  供 UI 渲染带证区间与各层常数，而非让人读一段中文判断"这是不是带证区间"。
 *  R_param≡0 时 bound 写 "≡0"。 */
export interface ResidualLayer {
  /** 该层残差上界的表达（公式或描述），如 "Boussinesq 近似的显式残差界" */
  bound: string
  /** 该层可独立复核的常数/方法来源 */
  derivation: string
}

/** 三层残差总带的结构化形式（方向一 L1）。
 *  目的：让 judgment 的三层残差从散文升级为可被 UI 渲染、可被审计的字段。
 *  这不是为接入形式化核验服务，而是为工程消费层（带证区间图 + 继承链可视化）做数据基础。 */
export interface Certificate {
  r_model: ResidualLayer
  r_param: ResidualLayer
  r_num: ResidualLayer
  /** 总带合成公式，如 "Nu_hi - Nu_lo ≤ R_model + R_param + R_num" */
  total_band: string
  /** 带证区间表达，如 "[Nu_lo, Nu_hi]" */
  certified_band?: string
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
  last_verified?: string
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
  proposed_year?: string
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
    last_verified: '2026-08-22',
    proposer: 'O. E. Lanford III',
    proposed_year: 1975,
    via: {
      label: 'Lanford, Time evolution of large classical systems, Springer Lecture Notes in Physics 38 (1975)',
      url: 'https://doi.org/10.1007/3-540-07160-1_16',
    },
    impact_domains: ["稀薄气体动力学","高超声速与微流控气体模拟"],
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
    last_verified: '2026-08-22',
    proposer: 'M. Hairer & J. C. Mattingly',
    proposed_year: 2006,
    via: {
      label: 'Hairer & Mattingly, Ergodicity of the 2D Navier–Stokes equations with degenerate stochastic forcing, Ann. of Math. 164 (2006)',
      url: 'https://doi.org/10.4007/annals.2006.164.993',
    },
    impact_domains: ["大气与海洋湍流同化","气候与海洋模式可预测性"],
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
    last_verified: '2026-08-22',
    impact_domains:
    ["非平衡统计物理","热导率的第一性原理建模"],
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
    last_verified: '2026-08-22',
    proposer: 'P. W. Anderson',
    proposed_year: 1958,
    via: {
      label: 'Anderson, Absence of diffusion in certain random lattices, Physical Review 109 (1958)',
      url: 'https://doi.org/10.1103/PhysRev.109.1492',
    },
    impact_domains: ["无序电子与光子输运","绝缘体-金属转变材料设计"],
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
    last_verified: '2026-08-22',
    proposer: 'I. Affleck, T. Kennedy, E. H. Lieb & H. Tasaki',
    proposed_year: 1987,
    via: {
      label: 'AKLT, Rigorous results on valence-bond ground states, Commun. Math. Phys. 115 (1988)',
      url: 'https://doi.org/10.1007/BF01217704',
    },
    impact_domains: ["量子自旋系统与拓扑态","量子模拟与量子纠错"],
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
    last_verified: '2026-08-22',
    proposer: 'J. Bourgain',
    proposed_year: 1996,
    via: {
      label: 'Bourgain, On the growth in time of higher Sobolev norms of smooth solutions of Hamiltonian PDE, GAFA 6 (1996)',
      url: 'https://doi.org/10.1007/BF02246886',
    },
    impact_domains: ["波湍流与极端事件预测","非线性光学与海洋怪波"],
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
    last_verified: '2026-08-22',
    proposer: 'L. Erdős & H.-T. Yau',
    proposed_year: 2012,
    via: { label: '随机带矩阵局域化-退局域化综述与近期结果：Becker–Cipolloni–Erdős 系列；结合 Erdős–Yau, A dynamical approach to random matrix theory (2012)' },
    impact_domains: ["量子混沌与随机矩阵理论","量子输运与开放系统"],
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
        note: 'Yau–Yin 在一维环上对 W>N^{1/2+ε} 建立退局域化与体统计普遍性，基本闭合了 √N 阈值猜测的退局域化一侧；端部窗口与临界行为仍开放。',
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
    last_verified: '2026-08-22',
    proposer: 'L. Onsager',
    proposed_year: 1949,
    via: {
      label: 'Onsager, Statistical hydrodynamics, Nuovo Cimento 6 (1949); 现代表述见 Eyink–Sreenivasan 综述',
      url: 'https://doi.org/10.1007/BF02780991',
    },
    impact_domains: ["湍流耗散统计建模","CFD 亚网格模型基准"],
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
    last_verified: '2026-08-22',
    proposer: 'F. Horn & R. Jackson',
    proposed_year: 1972,
    via: {
      label: 'Horn & Jackson, General mass action kinetics, ARMA 47 (1972); 猜想现代表述见 Katz–Weinberg (2017/2019)',
      url: 'https://doi.org/10.1007/BF00251396',
    },
    impact_domains: ["反应网络动力学理论","代谢与信号网络的数学稳定性"],
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
    last_verified: '2026-08-22',
    proposer: 'D. Angeli, P. De Leenheer & E. Sontag',
    proposed_year: 2007,
    via: {
      label: 'Angeli–De Leenheer–Sontag, A graph-theoretic approach to persistence, SIAM J. Appl. Dyn. Syst. 6 (2007)',
      url: 'https://doi.org/10.1137/060664017',
    },
    impact_domains: ["反应网络持续性判据","催化过程的长期稳定运行"],
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
    last_verified: '2026-08-22',
    proposer: 'multiple contributors',
    proposed_year: 2000,
    via: { label: '化学图逆特征值/可实现谱综述：Gutman & Cyvin, Advances in the Theory of Benzenoid Hydrocarbons' },
    impact_domains: ["有机电子材料能隙设计","芳香烃的合成筛选"],
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
    judgment: '合格答案为"可核验二次谱判据"而非穷举所有谱：对给定目标 HOMO–LUMO 光隙与六环数 $h$，交付一个可核验判定——是否存在苯环型分子图实现该谱隙，并给出一组候选结构与其谱的可复核证书，附两层残差总带：(1) **R_model**：把真实分子电子结构限制为 Hückel 邻接谱模型所引入的残差上界（显式含对六环嵌入/成环双键的定性限制）；(2) **R_num**：谱计算与可实现性裁决（数论约束 + 六边形嵌入验证）所用区间/精确算术的残差上界。参数（目标光隙、六环数）为精确给定的设计输入，故 **R_param≡0（无输入测量残差层，如实注明）**。判定通过的消费形式：给定目标带隙，直接得到"该带隙能否被某苯环分子实现（是/否）+ 若可则给出候选核并附总带"的可核验判定，供有机电子材料预筛直接消费而无需对候选全集枚举。',
    certificate: {
      r_model: {
        bound: '把真实分子电子结构限制为 Hückel 邻接谱模型所引入的残差上界（含对六环嵌入/成环双键的定性限制）',
        derivation: 'Hückel 模型残差界',
      },
      r_param: {
        bound: '≡0（目标光隙与六环数为精确给定的设计输入，无输入测量残差层）',
        derivation: '参数精确给定',
      },
      r_num: {
        bound: '谱计算与可实现性裁决（数论约束 + 六边形嵌入验证）所用区间/精确算术的残差上界',
        derivation: '区间/精确算术封闭',
      },
      total_band: '光隙可实现性判定包络 ≤ R_model + R_num',
      certified_band: '候选核谱隙确认区间',
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
    last_verified: '2026-08-22',
    proposer: 'G. Craciun & M. Feinberg',
    proposed_year: 2005,
    via: {
      label: 'Craciun & Feinberg, Multiple equilibria in complex chemical reaction networks, SIAM J. Appl. Math. 65 (2005)（结合注入性/参数化判据）',
      url: 'https://doi.org/10.1137/S0895479803446819',
    },
    impact_domains: ["细胞多稳态与命运决定","反应网络双稳态设计"],
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
    judgment: 'A pass must supply an algorithm together with a complete classification of when the rate constant vector is structurally identifiable from the observable subset, and a correctness proof of the decision procedure relative to the stated ideal noise-free observation model. 合格答案为可核验判定并附三层残差：(1) **R_model**＝把观测限制为可辨性子集/理想无噪模型所丢掉的近似残差上界；(2) **R_param**＝速率常数测量不确定度对判定边界的输入残差上界（可辨识性结论须对 $k$ 落在测量区间内仍稳定）；(3) **R_num**＝代数判定步骤（微分代数符号计算）的核验残差上界。无输入测量残差时须如实注明 R_param≡0。',
    certificate: {
      r_model: {
        bound: '把观测限制为可辨性子集/理想无噪模型所丢掉的近似残差上界',
        derivation: '理想无噪观测模型限制残差界',
      },
      r_param: {
        bound: '速率常数测量不确定度对可辨识性判定边界的输入残差上界（结论对测量区间内所有 k 仍稳定）',
        derivation: '测量区间传播到分辨边界的区间映像',
      },
      r_num: {
        bound: '代数判定步骤（微分代数符号计算）的核验残差上界',
        derivation: '符号计算/量词消解封闭界',
      },
      total_band: '可辨识性判定边界 ≤ R_model + R_param + R_num',
      certified_band: '结构可辨识/不可辨识分类判定',
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
    last_verified: '2026-08-22',
    proposer: 'E. Sontag',
    proposed_year: 2008,
    via: { label: 'Sontag, Dynamic compensation, parameter identifiability, and equivariances, PLoS Comput. Biol. 13 (2017); 可辨识性方法综述见 Miao et al., SIAM Review 53 (2011)', url: 'https://doi.org/10.1371/journal.pcbi.1005447' },
    impact_domains: ["实验动力学建模","催化与系统生物学的参数化"],
    related_problems: [
      {
        id: 'mc-030',
        relation: 'generalizes',
        note: '总带继承（方向二）：mc-005 的结构可辨识性分类被 mc-030 的稳态浓度带继承。本题为上游——若 mc-005 判定某测量方案不可辨识，则 mc-030 在该测量区间上的浓度带失效；下游带的可信度链入本题的分类证书。',
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
    last_verified: '2026-08-22',
    proposer: 'E. Lieberman, C. Hauert & M. A. Nowak',
    proposed_year: 2005,
    via: {
      label: 'Lieberman–Hauert–Nowak, Evolutionary dynamics on graphs, Nature 433 (2005)',
      url: 'https://doi.org/10.1038/nature03204',
    },
    impact_domains: ["合成生物学群体设计","肿瘤演化与治疗策略"],
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
    last_verified: '2026-08-22',
    proposer: 'R. Pastor-Satorras & A. Vespignani',
    proposed_year: 2001,
    via: {
      label: '网络 SIS 亚稳态寿命传统：Pastor-Satorras & Vespignani, Epidemic spreading in scale-free networks, PRL 86 (2001)',
      url: 'https://doi.org/10.1103/PhysRevLett.86.3200',
    },
    impact_domains: ["网络流行病学","传染病防控的疫苗与隔离策略"],
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
    last_verified: '2026-08-22',
    proposer: 'J. Hofbauer & K. Sigmund',
    proposed_year: 1998,
    via: {
      label: '复制子动力学含突变稳定性：Hofbauer & Sigmund, Evolutionary Games and Population Dynamics (1998)',
      url: 'https://www.cambridge.org/core/books/evolutionary-games-and-population-dynamics',
    },
    impact_domains: ["进化博弈动力学","社会学习与演化经济学"],
    related_problems: [
      {
        id: 'mb-004',
        relation: 'analog_of',
        note: 'Replicator dynamics and Lotka–Volterra are mathematically equivalent (Hofbauer transformation); stability classifications should transfer.',
      },
      {
        id: 'mb-028',
        relation: 'generalizes',
        note: '总带继承（方向二）：mb-003 的全局稳定性分类被 mb-028 的耐药平衡频率带继承。本题为上游——若 mb-003 的稳定性结构被击穿，下游 mb-028 的平衡带断言失效；下游带的可信度链入本题的分类证书。',
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
    last_verified: '2026-08-22',
    proposer: 'J. Hofbauer',
    proposed_year: 1981,
    via: { label: 'Hofbauer, A general cooperation theorem for hypercycles, MAB 53 (1981); 持久性综述见 Hofbauer & Sigmund (1998)' },
    impact_domains: ["群落生态共存理论","工程微生物组的稳定性设计"],
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
    last_verified: '2026-08-22',
    proposer: 'R. Olfati-Saber, J. A. Fax & R. M. Murray',
    proposed_year: 2007,
    via: {
      label: 'Olfati-Saber–Fax–Murray, Consensus and cooperation in networked multi-agent systems, Proc. IEEE 95 (2007)',
      url: 'https://doi.org/10.1109/JPROC.2006.887291',
    },
    impact_domains: ["多智能体协同控制","无人机群与车联网"],
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
    last_verified: '2026-08-22',
    proposer: 'K. Scaman et al.',
    proposed_year: 2017,
    via: {
      label: 'Scaman et al., Optimal algorithms for smooth and strongly convex distributed optimization in networks, ICML (2017)',
      url: 'https://proceedings.mlr.press/v70/scaman17a.html',
    },
    impact_domains: ["分布式优化与联邦学习","边缘计算的通信效率"],
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
    last_verified: '2026-08-22',
    proposer: 'F. Cucker & S. Smale',
    proposed_year: 2007,
    via: {
      label: 'Cucker & Smale, Emergent behavior in flocks, IEEE Trans. Auto. Control 52 (2007); 奇异核情形见 Ha–Tadmor 传统',
      url: 'https://doi.org/10.1109/TAC.2007.895842',
    },
    impact_domains: ["集群机器人避撞与编队","无人系统的编队保持"],
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
    last_verified: '2026-08-22',
    proposer: 'multiple contributors',
    proposed_year: 2000,
    via: { label: '面积律综述（1D 已证; 2D 一般开放）：Brandão & Harrow; Eisert–Cramer–Plenio 综述' },
    impact_domains: ['量子计算', '张量网络算法', '材料模拟'],
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
      'A positive resolution certifies that PEPS contraction cost is polynomial in the boundary length, giving 张量网络模拟 2D 量子材料 一个先验的复杂度上界；反例则标定 PEPS 方法的适用边界。',
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
    last_verified: '2026-08-22',
    proposer: 'multiple contributors',
    proposed_year: 1958,
    via: { label: '三维弱无序 Anderson 离域化（区别于已解决的二维/强无序）：Anderson (1958) 与近期离域化文献' },
    impact_domains: ['半导体器件', '无序材料设计'],
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
      '无序半导体的载流子输运建模依赖迁移率边的存在性；严格结果将把器件模拟中经验性的迁移率边参数变为可证量。',
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
    last_verified: '2026-08-22',
    proposer: 'B. Simon',
    proposed_year: 1982,
    via: { label: 'Almost Mathieu 算子公开问题综述：Simon, von Neumann eigenvalues conjecture (1982); Dry Ten Martini 见 Avila–Jitomirskaya 系列' },
    impact_domains: ['拓扑材料', '莫尔超晶格'],
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
      '莫尔材料的 Hofstadter 谱工程（拓扑带隙、陈数设计）直接以全部隙开放为前提；严格判据给出磁通—带隙对应关系的可信区间。',
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
    last_verified: '2026-08-22',
    impact_domains:
    ['量子磁性材料', '冷原子模拟'],
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
      '自旋链是量子模拟器校验的标准模型；Bethe 基的完备性证书可直接作为冷原子与固态量子模拟平台的数值基准。',
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
    last_verified: '2026-08-22',
    proposer: 'M. Kardar, G. Parisi & Y.-C. Zhang',
    proposed_year: 1986,
    via: {
      label: 'KPZ, Dynamic scaling of growing interfaces, PRL 56 (1986); 普适性综述见 Corwin (arXiv:1106.1596)',
      url: 'https://doi.org/10.1103/PhysRevLett.56.889',
    },
    impact_domains: ['界面生长工艺', '随机建模基准'],
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
      '薄膜沉积与界面粗化工艺中的涨落模型校核需要非可积情形的普适性保证；严格结果将把 KPZ 统计从可积模型库推广到工程模型的一般校验基准。',
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
    last_verified: '2026-08-22',
    proposer: 'M. Feinberg',
    proposed_year: 1980,
    via: { label: '复平衡系统有界性传统：Feinberg, Chemical reaction network structure and stability of complex isothermal reactors (讲义)' },
    impact_domains: ['化工过程安全', '生物反应器设计'],
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
      '有界性证明给出反应器浓度的先验上界，可直接用于安全壳设计与失控反应筛查的数学认证环节。',
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
    last_verified: '2026-08-22',
    proposer: 'I. Gutman',
    proposed_year: 2008,
    via: { label: 'Gutman & Furtula (eds.), Distance in Molecular Graphs — Theory (2012); 化学图逆特征值问题综述见 Graovac 等的分子拓扑工作' },
    impact_domains: ['分子电子学', '材料逆向设计'],
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
      '该问题是分子逆向设计（从目标电子性质反推结构）的严格内核：可判定性结果直接转化为筛选算法的完备性保证。',
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
    last_verified: '2026-08-22',
    proposer: 'M. E. J. Newman',
    proposed_year: 2002,
    via: {
      label: 'Newman, Spread of epidemic disease on networks, PRE 66 (2002)',
      url: 'https://doi.org/10.1103/PhysRevE.66.016128',
    },
    impact_domains: ['公共卫生建模', '网络基础设施防护'],
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
      '聚集网络阈值是社区封控、疫苗分配与楼宇通风策略模型的直接输入参数；严格比较原理可判定“聚集是否保护人群”这一关键设计问题。',
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
    last_verified: '2026-08-22',
    proposer: 'E. Lieberman, C. Hauert & M. A. Nowak',
    proposed_year: 2005,
    via: { label: '强放大器：Lieberman–Hauert–Nowak (2005); 超放大器见 Pavlogiannis–Tkadlec–Chatterjee–Nowak, Nat. Commun. 8 (2017)' },
    impact_domains: ['肿瘤演化建模', '群体遗传学'],
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
      '放大器分类给出肿瘤微环境结构风险的数学筛查指标，也为定向进化实验的群体结构设计提供最优图族。',
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
    last_verified: '2026-08-22',
    proposer: 'H. J. Muller',
    proposed_year: 1932,
    via: {
      label: 'Muller, Some genetic aspects of sex, Am. Nat. 66 (1932); 严格速率见 Haigh (1978)',
      url: 'https://doi.org/10.1086/280418',
    },
    impact_domains: ['病毒演化预测', '育种群体管理'],
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
      '棘轮速率定律直接输入病毒群体退化预测与保种群体最小规模设计；严格渐近将把经验拟合参数替换为可认证常数。',
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
    last_verified: '2026-08-22',
    proposer: 'E. Lieberman, C. Hauert & M. A. Nowak',
    proposed_year: 2005,
    via: { label: '等温性定理：Lieberman–Hauert–Nowak (2005); 加权/有向推广见相关固定概率文献' },
    impact_domains: ['群体遗传学', '分布式网络动力学'],
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
      '等温性判据是“结构是否影响演化”的快速筛查器；同样的判据可直接复用于分布式网络中意见/状态扩散的中立性审计。',
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
    last_verified: '2026-08-22',
    proposer: 'multiple contributors',
    proposed_year: 2017,
    via: {
      label: 'CONGEST 三角形检测复杂度：Izumi & Le Gall, OPODIS (2017) 下界',
      url: 'https://doi.org/10.1007/978-3-319-72581-1_10',
    },
    impact_domains: ['分布式系统', '网络分析基础设施'],
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
      '闭合该间隙将给出分布式图挖掘系统（集群级三角计数）理论上的性能天花板，直接指导通信预算与分片策略设计。',
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
    last_verified: '2026-08-22',
    proposer: 'M. Ben-Or',
    proposed_year: 1983,
    via: { label: '随机共识下界传统：Ben-Or, Another advantage of free choice, PODC (1983)' },
    impact_domains: ['区块链协议', '容错控制'],
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
      '紧界直接确定 BFT/共识协议在敌对调度下的最坏延迟上界，是区块链终局性与容错飞控/车控总线形式化验证的必备参数。',
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
    last_verified: '2026-08-22',
    proposer: 'R. Karp, C. Schindelhauer, S. Shenker & B. Vöcking',
    proposed_year: 2000,
    via: {
      label: 'Karp et al., Randomized rumor spreading, FOCS (2000)',
      url: 'https://doi.org/10.1109/SFCS.2000.892141',
    },
    impact_domains: ['分布式数据库复制', '物联网 gossip 协议'],
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
      '该界是 gossip 类复制协议 SLA（收敛时间保证）的理论上限来源；闭合间隙可以把工程上的保守超时参数收紧到最优。',
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
    last_verified: '2026-08-22',
    proposer: 'S. Lepri, R. Livi & A. Politi',
    proposed_year: 2003,
    via: {
      label: 'Lepri–Livi–Politi, Thermal conduction in classical low-dimensional lattices, Phys. Rep. 377 (2003)',
      url: 'https://doi.org/10.1016/S0370-1573(02)00558-6',
    },
    impact_domains: ['微纳传热', '热管理材料'],
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
      '芯片与电池微纳尺度的热管理仿真几乎全部依赖傅里叶定律；严格推导将为求解域远小于声子平均自由程时是否适用傅里叶定律提供数学判据，直接关乎热设计仿真可信度。',
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
    last_verified: '2026-08-22',
    impact_domains:
    ['湍流数值模拟', '大气海洋流动'],
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
      '湍流的隐式大涡模拟（LES）与粗网格能耗判据直接依赖 Onsager 临界指数的可信区间；端点情形的判定可转化为转捩判据的严格化。',
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
    last_verified: '2026-08-22',
    proposer: 'T. Došlić',
    proposed_year: 2007,
    via: {
      label: '富勒烯哈密顿性（已由 Král′–Škrekovski–Vukičević–Wagner, J. Graph Theory (2012) 解决）',
      url: 'https://doi.org/10.1002/jgt.20652',
    },
    impact_domains: ['碳纳米材料结构预测', '分子图算法'],
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
      '该猜想若成立，富勒烯同分异构体的“螺旋条带”枚举与自动生成算法就有了完备性保证，可直接支撑碳材料结构库的构建成本与正确性论证。',
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
    last_verified: '2026-08-22',
    proposer: 'N. Barton, A. Etheridge & A. Véber',
    proposed_year: 2017,
    via: {
      label: 'Barton–Etheridge–Véber, The infinitesimal model: definition, derivation and dominance, Theor. Popul. Biol. 118 (2017)',
      url: 'https://doi.org/10.1016/j.tpb.2017.05.001',
    },
    impact_domains: ['动植物遗传育种', '多基因性状预测'],
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
      '基因组选择（GS）模型的“基础假设 = 无限小模型正态性”一旦被严格限定适用范围，就能为育种算法何时适用、何时改校平均型提供可分性判据。',
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
    last_verified: '2026-08-22',
    proposer: 'T. E. Harris',
    proposed_year: 1974,
    via: {
      label: 'Harris, Contact interactions on a lattice, Ann. Probab. 2 (1974); 亚临界渐近见 Liggett 专著',
      url: 'https://doi.org/10.1214/aop/1176996477',
    },
    impact_domains: ['传染病空间建模', '生态灭绝时间'],
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
      '该量是“逃逸失效时间”类风险指标（疫情是否可能意外拖长、濒危种群能否短暂反弹）的数学上限来源；精确指数可把风险分级标准从量级收紧到常数量级。',
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
    last_verified: '2026-08-22',
    proposer: 'A. Meyerson',
    proposed_year: 2001,
    via: {
      label: 'Meyerson, Online facility location, FOCS (2001)',
      url: 'https://doi.org/10.1109/SFCS.2001.959910',
    },
    impact_domains: ['物流网络优化', '边缘缓存部署'],
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
      '竞争比是“在线必须付出的代价”的数学量化：闭合间隙能把边缘缓存与物流动态布点的产能超配系数从保守量级收紧到最优量级，直接降低资源预留成本。',
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
    last_verified: '2026-08-22',
    proposer: 'M. Manasse, L. McGeoch & D. Sleator',
    proposed_year: 1988,
    via: {
      label: 'Manasse–McGeoch–Sleator, Competitive algorithms for on-line problems, STOC (1988)',
      url: 'https://doi.org/10.1145/62212.62249',
    },
    impact_domains: ['机器人调度', '缓存与页面置换'],
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
      '若 k 服务者猜想成立，移动资源按请求动态调度的“最优在线代价”就有了确切上限 $k$；可用来为机器人集群、复制存储与 CDN 的响应时间 SLA 提供严格设计方案而非常规保守因子。',
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
    last_verified: '2026-08-22',
    proposer: 'Z. Rudnick & P. Sarnak',
    proposed_year: 1994,
    via: {
      label: 'Rudnick & Sarnak, The behaviour of eigenstates of arithmetic hyperbolic manifolds, Comment. Math. Helv. 74 (1994)',
      url: 'https://doi.org/10.1007/PL00000356',
    },
    impact_domains: ['量子混沌', '声学与振动本征态'],
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
      '若 QUE 成立，则振动/声腔的高阶本征模式必然均匀填充空间而不会集中在少数区域，可直接支撑声学腔体、谐振器与结构振动模态的均匀化设计判据。',
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
    last_verified: '2026-08-22',
    impact_domains: ['量子热机', '孤立量子气体的非平衡演化'],
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
      'ETH 是“孤立量子系统如何达到热平衡”的操作性判据；若被证明，可为量子引擎的效率上限与纠缠生成时间提供严格预测。',
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
    last_verified: '2026-08-22',
    proposer: 'G. Craciun & M. Feinberg',
    proposed_year: 2005,
    via: {
      label: '缺陷为一网络单/多稳判定：Craciun & Feinberg (2005) 注入性判据及综述',
      url: 'https://doi.org/10.1137/S0895479803446819',
    },
    impact_domains: ['生化反应设计', '代谢通量控制'],
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
      '双稳态是细胞信号与记忆的关键机制；完整判定缺陷一网络的多稳态性可直接用于代谢通路与合成生物学开关的可逆/不可逆设计。',
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
    last_verified: '2026-08-22',
    proposer: 'I. Gutman',
    proposed_year: 1978,
    via: { label: 'Gutman, The energy of a graph, Ber. Math.-Statist. Sekt. 103 (1978)（Hückel π 电子能量理论）' },
    impact_domains: ['共轭烃设计', '芳香性指标'],
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
      'π 电子能是分子稳定性的代理指标；改进其极值界能给出芳香性/反应活性排序的定量上界，用于高通量筛优选配基骨架。',
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
    last_verified: '2026-08-22',
    proposer: 'T. E. Harris',
    proposed_year: 1974,
    via: {
      label: '接触过程临界值：Harris (1974); 上/下界见 Liggett, Stochastic Interacting Systems (1999)',
      url: 'https://doi.org/10.1214/aop/1176996477',
    },
    impact_domains: ['传染病临界传播', '物种入侵阈值'],
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
      '精确临界传播率可为局部接触传染（沙漠生物入侵、病害蔓延）的物理判据提供无先验拟合的解析常数，替代蒙特卡洛外推。',
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
    last_verified: '2026-08-22',
    proposer: 'R. M. May & W. J. Leonard',
    proposed_year: 1975,
    via: {
      label: 'May & Leonard, Nonlinear aspects of competition between three species, SIAM J. Appl. Math. 29 (1975)',
      url: 'https://doi.org/10.1137/0129033',
    },
    impact_domains: ['微生物群落稳态', '生物多样性维持'],
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
      '三物种石头剪刀布是微生物群落多样性的最小模型；证明共存阈值可直接指导菌群/益生元配方的比例设计，避免私有化走向单菌统治。',
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
    last_verified: '2026-08-22',
    proposer: 'H. Andersson & T. Britton',
    proposed_year: 2000,
    via: {
      label: '随机流行病模型（阈值/近临界）：Andersson & Britton, Stochastic Epidemic Models and Their Statistical Analysis (2000)',
      url: 'https://doi.org/10.1007/978-1-4612-1158-7',
    },
    impact_domains: ['传染病防控策略', '疫苗覆盖阈值'],
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
      '近临界灭绝时间的统计律决定了“疫情是否自然熄灭”的可判定窗口；精确速率能校准防控资源投放时机与疫苗覆盖临界值。',
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
    last_verified: '2026-08-22',
    proposer: 'M. Babaioff, N. Immorlica & R. Kleinberg',
    proposed_year: 2007,
    via: {
      label: 'Babaioff–Immorlica–Kleinberg, Matroids, secretary problems, and online mechanisms, SODA (2007)',
      url: 'https://doi.org/10.5555/1283383.1283496',
    },
    impact_domains: ['在线人才/资源选配', '云资源竞价分配'],
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
      '若 $1/e$ 猜想成立，在线竞拍与人才漏斗的最优收益就有一个与规模无关的常数下界，可直接为云竞价与招聘漏斗设定紧的收益基线与达标线。',
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
    last_verified: '2026-08-22',
    proposer: 'U. Feige',
    proposed_year: 2000,
    via: {
      label: 'Feige, Approximating the bandwidth via volume respecting embeddings, JCSS 60 (2000)',
      url: 'https://doi.org/10.1006/jcss.1999.1682',
    },
    impact_domains: ['矩阵稀疏化求解', '芯片布线布局'],
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
      '带宽越小，稀疏矩阵的填充与通信越省；判定常数近似性决定了“带最小化布局器”能否做出可靠上界，直接影响有限元与LSI布线工具的缩放策略。',
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
    last_verified: '2026-08-22',
    proposer: 'S. O. Gharan, A. Saberi & M. Singh',
    proposed_year: 2011,
    via: {
      label: 'Gharan–Saberi–Singh, A randomized rounding approach to the traveling salesman problem, FOCS (2011)',
      url: 'https://doi.org/10.1109/FOCS.2011.76',
    },
    impact_domains: ['物流路径规划', '芯片走线规划'],
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
      '路径/布线成本的近似比直接换算成物流或芯片布线的资源超配系数；把 3/2 收紧到 4/3，意味着同预算可多服务约 11% 的路由请求。',
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
    last_verified: '2026-08-22',
    impact_domains:
    ['工业调度优化', '供应链规划'],
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
      '几乎所有工业调度、供应链与预算规划都退化为 LP；强多项式算法意味着求解复杂度不随数据规模（整数溢出/精度）膨胀，可彻底消除求解器在大规模实例上的数值不确定性。',
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
    last_verified: '2026-08-22',
    proposer: 'E. G. Coffman, M. R. Garey & D. S. Johnson',
    proposed_year: 1997,
    via: { label: '在线装箱综述：Coffman–Garey–Johnson, Bin packing surveys (1997)' },
    impact_domains: ['云计算资源装箱', '智能物流装箱'],
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
      '装箱竞争比直接对应数据中心的 VM 装箱超配系数与物流装载率；从 $1.58889$ 收紧到最优意味着同等规模客户/包裹可节省可证明的资源缓冲，是云平台成本优化的数学根基。',
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
    last_verified: '2026-08-22',
    proposer: 'L. Kučera',
    proposed_year: 1995,
    via: {
      label: 'Kučera, Expected complexity of graph partitioning problems, Discrete Appl. Math. 57 (1995); 算法阈值见 Alon–Krivelevich–Sudakov',
      url: 'https://doi.org/10.1016/0166-218X(94)00103-G',
    },
    impact_domains: ['网络社群检测', '生物网络噪声判定'],
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
      '社群检测/噪声网络判定直接决定推荐系统与生物网络分析中"是否真的存在结构"的判定阈值；明确的检测阈值可给出样本量与计算量的工程边界，是数据科学推理可靠性的基础。',
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
    last_verified: '2026-08-22',
    proposer: 'T. Y. Hou & G. Luo',
    proposed_year: 2014,
    via: {
      label: 'Hou & Luo, Toward a finite-time singularity of the 3D incompressible Euler equations, PNAS 111 (2014)（数值候选; 解析证明开放）',
      url: 'https://doi.org/10.1073/pnas.1402374111',
    },
    impact_domains: ['CFD 湍流模型', '航空发动机设计'],
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
    last_verified: '2026-08-22',
    proposer: 'M. Aizenman',
    proposed_year: 1981,
    via: {
      label: 'Aizenman, Proof of the triviality of φ⁴ field theory, Commun. Math. Phys. 86 (1982); 结合 Fröhlich (1982)',
      url: 'https://doi.org/10.1007/BF01205659',
    },
    impact_domains: ['量子场论基准', '数值重整化', '随机几何'],
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
    last_verified: '2026-08-22',
    proposer: 'M. B. Hastings & S. Michalakis',
    proposed_year: 2014,
    via: {
      label: 'Hastings & Michalakis, Quantization of Hall conductance for interacting electrons on a torus, Commun. Math. Phys. 330 (2014)',
      url: 'https://doi.org/10.1007/s00220-014-2167-x',
    },
    impact_domains: ['拓扑材料', '量子输运', '霍尔效应器件'],
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
    last_verified: '2026-08-22',
    proposer: 'E. H. Lieb',
    proposed_year: 2006,
    via: { label: 'Lieb, Density functionals for Coulomb systems, Int. J. Quantum Chem. 24 (1983); Lévy–Lieb 泛函严格性质见同一工作及其后续' },
    impact_domains: ['电子结构计算', '材料设计', '量子化学'],
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
    last_verified: '2026-08-22',
    impact_domains:
    ['类脑计算', '存储器设计', '神经网络理论'],
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
    last_verified: '2026-08-22',
    proposer: 'M. M. Desai & D. S. Fisher',
    proposed_year: 2007,
    via: {
      label: 'Desai & Fisher, Beneficial mutation-selection balance and the effect of linkage, Genetics 176 (2007)',
      url: 'https://doi.org/10.1534/genetics.106.067082',
    },
    impact_domains: ['进化算法设计', '微生物育种', '病毒演化监测'],
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
    last_verified: '2026-08-22',
    proposer: 'A. Jaffe & E. Witten',
    proposed_year: 2000,
    via: {
      label: 'Yang–Mills 质隙，Clay Millennium Prize Problem (2000)',
      url: 'https://www.claymath.org/millennium/yang-mills/',
    },
    impact_domains: ['量子场论的严格构造', '基本粒子物理', '数学与物理的交叉'],
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
    last_verified: '2026-08-22',
    proposer: 'L. Erdős, B. Schlein & H.-T. Yau',
    proposed_year: 2007,
    via: {
      label: 'Erdős–Schlein–Yau, Rigorous derivation of the Gross–Pitaevskii equation, PRL 98 (2007)',
      url: 'https://doi.org/10.1103/PhysRevLett.98.040404',
    },
    impact_domains: ['冷原子物理', '量子多体系统的有效方程', '非线性薛定谔方程'],
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
    last_verified: '2026-08-22',
    proposer: 'C. Fefferman',
    proposed_year: 2000,
    via: {
      label: 'Navier–Stokes 全局正则性，Clay Millennium Prize Problem (2000)',
      url: 'https://www.claymath.org/millennium/navier-stokes/',
    },
    impact_domains: ['流体力学数学理论', '湍流体动力学', '偏微分方程整体理论'],
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
    last_verified: '2026-08-22',
    proposer: 'multiple contributors',
    proposed_year: 2000,
    via: { label: 'Wigner, On the interaction of electrons in metals, Phys. Rev. 46 (1934); 2D 库仑/长程势结晶化严格现状综述见 Bétermin & Knüpfer, arXiv:1710.05581 (2017)' },
    impact_domains: ['凝聚态物理中的结晶现象', '经典与量子库仑体系', '最优点配置'],
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
    last_verified: '2026-08-22',
    proposer: 'F. D. M. Haldane',
    proposed_year: 1983,
    via: {
      label: 'Haldane, Continuum dynamics of the 1D Heisenberg antiferromagnet, PRL 50 (1983)',
      url: 'https://doi.org/10.1103/PhysRevLett.50.1153',
    },
    impact_domains: ['量子自旋链的谱隙', '对称保护拓扑相', '低维量子磁性'],
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
    last_verified: '2026-08-22',
    proposer: 'multiple contributors',
    proposed_year: 2016,
    via: {
      label: '波湍流方程长期有效性：Faou–Germain–Hani, Ann. PDE 2 (2016) 早时；长期开放',
      url: 'https://doi.org/10.1007/s40818-016-0008-1',
    },
    impact_domains: ['波动湍流理论', '弱非线性色散系统的统计描述', '非线性偏微分方程的长期行为'],
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
    last_verified: '2026-08-22',
    proposer: 'multiple contributors',
    proposed_year: 2020,
    via: {
      label: '奇异相互作用平均场极限：Duerinckx & Serfaty 系列 (2020–2023)',
      url: 'https://arxiv.org/abs/2001.07038',
    },
    impact_domains: ['等离子体动力学的数学理论', '天体力学与自引力系统', '传播混沌'],
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
    last_verified: '2026-08-22',
    proposer: 'P. W. Anderson',
    proposed_year: 1958,
    via: {
      label: '多体局域化综述：Nandkishore & Huse, Ann. Rev. Cond. Matter Phys. 6 (2015); 一性原理刻画开放',
      url: 'https://doi.org/10.1146/annurev-conmatphys-031214-014726',
    },
    impact_domains: ['强关联无序量子体系', '量子热化与遍历性', '量子信息中的局域守恒量'],
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
    last_verified: '2026-08-22',
    proposer: 'E. H. Lieb & W. Thirring',
    proposed_year: 1975,
    via: {
      label: 'Lieb & Thirring, Bound for the kinetic energy of fermions which proves stability of matter, PRL 35 (1975); 锐常数见 Frank 等',
      url: 'https://doi.org/10.1103/PhysRevLett.35.687',
    },
    impact_domains: ['原子与凝聚体系的稳定性论证', '密度泛函理论的数学下界'],
    related_problems: [
      {
        id: 'mp-026',
        relation: 'shares_tools',
        note: '两者都以动能下界与稳定性论证为共同工具。',
      },
      {
        id: 'mc-017',
        relation: 'analog_of',
        note: '同为多体能量函数中的待定锐利常数，结构平行。',
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
      '合格答案为"交换关联能下界的可核验收敛常数"而非终极锐常数：交付一个机器可核验的两边括号，使 Lieb–Oxford 常数被例 $C$ 满足 $c \\le C \\le C_0$ 且 $C_0-c$ 相比已知界（当前 $[1.44,1.58]$）有受控的显著收缩，并附三层残差总带：(1) **R_model**：把真实（动量泛函、自旋对称性相应）交换关联能限制为 $\\rho^{4/3}$ 局部泛函族所引入的残差上界（显式区分 spin-unpolarized 情形的更紧界）；(2) **R_num**：对可达性构造与下界泛函用区间/符号计算封闭所引入的残差上界；(3) 该题常数为纯数学结构，**R_param≡0（无输入测量残差层，如实注明）**。判定通过的消费形式：给定密度泛函实现，直接得到"该泛函的交换关联能是否仍满足严格运动学下界"的可核验判定，其括号宽由三层残差总带明确划定，供 DFT 工具作者认证其梯度/元泛函不违反下界。',
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
    last_verified: '2026-08-22',
    proposer: 'E. H. Lieb & S. Oxford',
    proposed_year: 1981,
    via: {
      label: 'Lieb & Oxford, Improved lower bound on the indirect Coulomb energy, Int. J. Quantum Chem. 19 (1981)',
      url: 'https://doi.org/10.1002/qua.560190308',
    },
    impact_domains: ['密度泛函近似器的构造约束', '交换关联能泛函的严格下界'],
    related_problems: [
      {
        id: 'mc-014',
        relation: 'shares_tools',
        note: 'Lieb–Oxford 下界是约束 Levy–Lieb 泛函构造的常用工具。',
      },
      {
        id: 'mc-016',
        relation: 'analog_of',
        note: '同为多体能量等式中待定的锐利常数。',
      },
    ],
    statement: `For an $N$-electron wave function $\u03c8$ with one-particle density $\u03c1$, the indirect (exchange plus correlation) Coulomb energy $W(\u03c8)=\\langle \u03c8,\\sum_{i<j}|x_i-x_j|^{-1}\u03c8\\rangle - \\tfrac{1}{2}\\iint_{\u211d^6} \u03c1(x)\u03c1(y)|x-y|^{-1}\\, dx\\, dy$ satisfies $W(\u03c8)\\ge -C\\int_{\u211d^3}\u03c1(x)^{4/3}\\, dx$. **Determine the sharp constant $C_{\\mathrm{opt}}=\\sup\{-W(\u03c8)/\\int \u03c1^{4/3}\\, dx\\}$**, the least such $C$ valid for all $N$ and all $\u03c8$. The value is open; current records place it strictly between the improved upper bound $1.58$ and a lower bound above $1.44$.`,
    certificate: {
      r_model: {
        bound: '把真实（动量泛函、自旋对称性相应）交换关联能限制为 ρ^{4/3} 局部泛函族所引入的模型残差上界（显式区分 spin-unpolarized 情形的更紧界）',
        derivation: '局部 ρ^{4/3} 泛函族限定残差界',
      },
      r_param: {
        bound: '≡0（纯数学结构，无输入测量残差层）',
        derivation: '常数为纯数学结构，参数精确给定',
      },
      r_num: {
        bound: '对可达性构造与下界泛函用区间/符号计算封闭所引入的数值残差上界',
        derivation: '区间/符号计算封闭界',
      },
      total_band: 'C_0 - c ≤ R_model + R_num',
      certified_band: '[c, C_0]',
    },
    engineering_deliverables: ['DFT 泛函下界合规审查', '交换关联能收缩括号'],
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
      "The sharp exchange-correlation constant is the ceiling every correlation functional must respect; pinning it down lets DFT tool authors and materials simulators certify their gradient-corrected functionals do not violate the strict kinematic lower bound. 本榜交付的是可核验收缩括号而非终极常数，并把模型层（局部 $\\rho^{4/3}$ 泛函族限定）与数值层（区间/符号封闭）残差显式分开合成总带，使"该泛函是否违反下界"成为带证判定而非依赖当前最好的已知常数。",
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
    last_verified: '2026-08-22',
    proposer: 'M. Altunbulak & A. Klyachko',
    proposed_year: 2008,
    via: {
      label: 'Altunbulak & Klyachko, The Pauli principle revisited, Commun. Math. Phys. 327 (2014)',
      url: 'https://doi.org/10.1007/s00220-014-1962-8',
    },
    impact_domains: ['波函数展开所需的 Slater 行列式数目', '自然轨道与活性空间方法'],
    related_problems: [
      {
        id: 'mc-023',
        relation: 'shares_tools',
        note: '两者同属约化密度算子的可实现性（marginal problem）研究。',
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
    last_verified: '2026-08-22',
    proposer: 'S. Nosé',
    proposed_year: 1984,
    via: {
      label: 'Nosé, A unified formulation of the constant temperature molecular dynamics methods, J. Chem. Phys. 81 (1984)',
      url: 'https://doi.org/10.1063/1.447334',
    },
    impact_domains: ['恒温分子动力学模拟的采样可靠性', '动力系统的可积性与遍历理论'],
    related_problems: [
      {
        id: 'mc-020',
        relation: 'shares_tools',
        note: '两者都是分子模拟中生成热平衡采样的核心工具。',
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
    last_verified: '2026-08-22',
    proposer: 'R. H. Swendsen & J.-S. Wang',
    proposed_year: 1986,
    via: {
      label: 'Swendsen & Wang, Replica Monte Carlo simulation of spin-glasses, PRL 57 (1986); 混合/截止开放',
      url: 'https://doi.org/10.1103/PhysRevLett.57.2607',
    },
    impact_domains: ['团簇与聚合物的平衡采样', '分析化学与统计力学的蒙特卡罗效率'],
    related_problems: [
      {
        id: 'mc-019',
        relation: 'shares_tools',
        note: '同属分子模拟中生成热平衡采样的核心工具。',
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
    last_verified: '2026-08-22',
    proposer: 'multiple contributors',
    proposed_year: 2010,
    via: {
      label: '随机反应网络积形平稳分布：Anderson, Craciun & Kurtz, Trans. AMS 362 (2010)',
      url: 'https://arxiv.org/abs/0802.1262',
    },
    impact_domains: ['生化主方程的解析求解', '随机化学生物学的稳态分析'],
    related_problems: [
      {
        id: 'mc-001',
        relation: 'shares_tools',
        note: '确定性 CRN 与随机 CRN 共享复杂平衡这一结构判据。',
      },
      {
        id: 'mc-002',
        relation: 'shares_tools',
        note: '网络结构决定动力学行为的主题在两种建模下互相关联。',
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
    last_verified: '2026-08-22',
    proposer: 'I. Gutman',
    proposed_year: 2008,
    via: { label: '苯环烃 Kekulé 结构数：Gutman & Cyvin 等化学图论文献' },
    impact_domains: ['芳香性与稳定性的图论指标', '受合成本碳氢化合物的结构计数'],
    related_problems: [
      {
        id: 'mc-024',
        relation: 'shares_tools',
        note: '同为苯环型体系中的结构计数与 Clar 覆盖问题。',
      },
      {
        id: 'mc-009',
        relation: 'shares_tools',
        note: '同为针对苯环/富勒烯类分子图的组合结构判定。',
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
    last_verified: '2026-08-22',
    proposer: 'multiple contributors',
    proposed_year: 2007,
    via: { label: '两电子 RDM N-representability：Mazziotti (ed.), Reduced-Density-Matrix Mechanics, Adv. Chem. Phys. 134 (2007)' },
    impact_domains: ['二阶约化密度矩阵泛函理论', '确定性多电子理论的严格约束'],
    related_problems: [
      {
        id: 'mc-018',
        relation: 'shares_tools',
        note: '两者同属约化密度算子的可实现性（marginal problem）研究。',
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
      'A pass provides an algorithm with a proven (polynomial or #P-hard) complexity bound and rigorous optimality for computing the Clar number, and solves the open exact-counting problem of Clar covers for a basic benzenoid family such as hexagons O(k,l,m) or oblate rectangles Ob(n,m), the count being certified by closed form. 合格答案为可核验判定并附残差总带：(1) **R_model**＝把真实 π 电子稳定结构限制为 Kekulé/Clar 覆盖组合模型所丢掉的近似残差上界；(2) **R_num**＝枚举与封闭形式计算的区间/精确算术残差上界；(3) 参数（六环数、几何族）为精确给定的数论输入，**R_param≡0（无输入测量残差层，如实注明）**。',
    certificate: {
      r_model: {
        bound: '把真实 π 电子稳定结构限制为 Kekulé/Clar 覆盖组合模型所丢掉的近似残差上界',
        derivation: 'Kekulé/Clar 组合模型限制残差界',
      },
      r_param: {
        bound: '≡0（六环数与几何族为精确给定的数论输入，无输入测量残差层）',
        derivation: '参数精确给定',
      },
      r_num: {
        bound: '枚举与封闭形式计算的区间/精确算术残差上界',
        derivation: '区间/精确算术封闭',
      },
      total_band: 'Clar 数 / Clar 覆盖计数闭环 ≤ R_model + R_num',
      certified_band: 'Clar 数与覆盖计数的核验闭式',
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
    last_verified: '2026-08-22',
    proposer: 'multiple contributors',
    proposed_year: 1992,
    via: { label: 'Clar 数与 Clar 覆盖：Gutman 等化学图论/组合文献' },
    impact_domains: ['芳香性指数的量子化学依据', '受合成本碳氢化合物的结构与计数'],
    related_problems: [
      {
        id: 'mc-022',
        relation: 'shares_tools',
        note: '同为苯环型体系中的结构计数；Kekulé 结构数表示匹配计数，而 Clar 数表示最大不相交芳香六元环数。',
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
    last_verified: '2026-08-22',
    proposer: 'multiple contributors',
    proposed_year: 2013,
    via: { label: 'Walsh 基下选择-重组闭合性：与种群遗传混合表述相关，近期有解析闭包结果' },
    impact_domains: ['定量遗传学', '适应度地貌的数学理论'],
    related_problems: [
      {
        id: 'mb-003',
        relation: 'shares_tools',
        note: '两者都研究群体遗传学中演化动力学的长期状态，共用测度与不等式工具。',
      },
    ],
    statement:
      `Consider a haploid $L$-locus biallelic population whose gamete frequencies lie in the simplex $\\Delta^{2^L-1}$. Let $\\mathcal{S}$ be the (multiplicative) selection map induced by a fitness surface and $\\mathcal{R}$ the linear recombination operator (the rescaled convex combination restricting alleles to pair in proportion to the recombination rate). **Determine whether the combined dynamics $p\\mapsto \\mathcal{R}\\,\\mathcal{S}\\,[\\,p\\,]$ admits a closed finite-dimensional description under the Walsh (Fourier) transform of gamete frequencies** for arbitrary fitness surfaces, or only for surfaces that are pairwise additive. Moreover, prove or disprove a sharp norm bound
$\\|\\,\\mathcal{R}\\,\\mathcal{S}\\,[p] - \\mathcal{R}\\,\\mathcal{S}\\,[q]\\,\\| \\le c \\, \\|p - q\\|$
with a constant $c<1$ independent of $L$, which would guarantee eventual fixation from every initial condition.`,
    origin:
      '连锁与重组如何塑造适应度地貌上的演化是群体遗传学的核心议题。在 Walsh 基下把选择与重组表示为对角化部分加上不可对角化耦合，直接决定能否用低阶矩封闭地预言多基因性状的动态，而这一闭合性在一般适应度地貌上至今未给出充分刻画。',
    progress: [
      '**线性界与可对角情形**: 对 pair-additive 适应度，Walsh 高次系数在重组下线性衰减，矩动力学闭合。',
      '**随机适应度理论**: Sella–Hirsh 把单体选择视为玻尔兹曼统计，近似给出 stationary density，但未解决确定性的闭合时刻方程。',
      '**数值观察**: 高维适应度地貌上高阶 Walsh 系数与决定适应度的低阶系数强耦合，闭合只近似成立。',
    ],
    obstacles: [
      '**物理闭合缺失**: 选择项把基因型的首矩与外积高阶矩耦合，重组无法抵消该非线性耦合，moment closure 在一般地表下无明确截断原理。',
      '**L 无关常数**: 收缩常数 $c<1$ 需在所有轨迹上一致，重组算子的谱半径虽为 1，但选择可任意放大比值，界限难以统一。',
    ],
    engineering_value:
      "A sharp, L-independent contraction bound guarantees eventual fixation from every initial condition, letting breeders and genetic engineers certify exactly when multi-locus selection maps close at low order under linkage - making genomic-selection predictions provably stable rather than empirically fitted.",
    formalization_notes:
      '可把目标表述为一个有限维捕获不等式的验证问题：在固定的 $L$ 与给定的适应度地表上，验证 $\\mathcal{R}\\,\\mathcal{S}$ 是否在某个测度下为 Piccard 收缩。pair-additive 情形的 Walsh 线性化可形式化证明；一般情形的反例或界则属于开放研究。',
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
    last_verified: '2026-08-22',
    proposer: 'multiple contributors',
    proposed_year: 2017,
    via: {
      label: '受噪 Lotka–Volterra 持久性与灭绝速率：Hening & Nguyen 系列',
      url: 'https://doi.org/10.1007/s00285-017-1188-y',
    },
    impact_domains: ['物种共存理论', '随机生态学'],
    related_problems: [
      {
        id: 'mb-004',
        relation: 'depends_on',
        note: '把 mb-004 的确定性持久性判据推广到有环境噪声的情形，其结果依赖该基础判据。',
      },
    ],
    statement:
      `Let $n$ species follow
$\\dot{x}_i = x_i\\,\\Big( r_i + \\sum_j a_{ij} x_j + \\sigma_i \\,\\dot{W}_i \\Big),$
a Lotka–Volterra system perturbed by bounded multiplicative environmental noise. **Find a necessary and sufficient condition, stated only in terms of the mean interaction matrix $A=(a_{ij})$ and the noise intensities $\\sigma_i$, under which all species survive almost surely in the sense that $\\lim_{T\\to\\infty} \\frac1T \\tfrac1n \\sum_j \\log x_j(T) > 0$**, and complement it with a sharp estimate of the large-deviation rate for extinction, the exponent of $\\mathbb{P}(\\min_i x_i < \\varepsilon)$ as $\\varepsilon\\to 0$.`,
    origin:
      '野外与实验室中物种的随机波动威胁着共存，而确定性 Lotka–Volterra 的持久性判据（mb-004）在存在环境噪声时是否依然刻画几乎必然的长期存活并不清楚。噪声既能通过存储效应维持共存，也能因随机漂移把群落推到灭绝，何种结构条件保证前者占优是生态学随机稳定性理论未关闭的问题。',
    progress: [
      '**确定性临界**: mb-004 给出了无噪声情形的细反满足判据，噪声使问题从吸收态变为渐近扩散。',
      '**存储效应**: 定量结果说明适度噪声可提高持久性，但只对特殊两物种情形严格。',
      '**Lyapunov 方法**: 已证明这类扩散在拟不变测度意义下的持久性可由一组线性泛函的符号刻画，但几乎必然形式与指数界仍开放。',
    ],
    obstacles: [
      '**边界行为**: 退化边界处的反射型扩散其灭绝概率遵循大偏差，拟测度的存在不足以保证路径-wise 的存活率。',
      '**交互符号**: 非对称竞争矩阵使 Lyapunov 函数构造困难，且噪声项与漂移项的相互作用难以分解。',
    ],
    engineering_value:
      "An almost-sure persistence condition plus a sharp extinction-rate exponent gives ecosystem managers and microbial-reactor engineers a teachable threshold for when environmental noise drives engineered communities to extinction, and how fast, enabling noise-budgeted design of coexisting consortia.",
    formalization_notes:
      '几乎所有问题可归约为 SDE 在正象限内的不动点与大偏差分析，形式化目标集中在一个主定理：矩阵与噪声强度的联合条件等价于几乎必然持久，并伴随可验证的指数界。',
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
    last_verified: '2026-08-22',
    proposer: 'multiple contributors',
    proposed_year: 2012,
    via: { label: 'Turing, The chemical basis of morphogenesis, Phil. Trans. R. Soc. B 237 (1952); 模式选择讨论见 Murray, Mathematical Biology II (3rd ed., 2003)' },
    impact_domains: ['图灵斑图与自组织', '发育生物学的形态发生理论'],
    related_problems: [
      {
        id: 'mb-012',
        relation: 'analog_of',
        note: '空间斑图形成问题：本问题针对反应—扩散域生长，mb-012 针对格点上的竞争斑图，机制同类而异。',
      },
    ],
    statement:
      `Consider a two-species activator–inhibitor reaction–diffusion system on a one-dimensional interval whose length $\\ell(t)$ grows smoothly from $\\ell_0$, with homogeneous initial conditions slightly perturbed. **Prove that the linearly selected pattern wavenumber $k^*(t)$ scales as $k^*(t)\\asymp \\ell(t)^{-\\alpha}$ for some $\\alpha$ you must identify, and determine whether the dominant peak of the dispersion relation displaces through countably many mode-doubling bifurcations as $\\ell(t)$ increases**. Give a criterion, in terms of the diffusion ratio and the reaction Jacobian, under which a growing domain forever trails the instantaneous marginal-stability mode rather than re-localizing to a fixed number of peaks.`,
    origin:
      '真实发育组织（四肢、皮肤条纹、斑马与鱼鳞）是在区域不断生长期间进行铸型的一种几何敏感过程。待定量化的问题在于：生长如何决定最终峰数、模式如何随尺寸重新定位，以及线性色散预测在多大程度上被非线性饱和所推翻，这都缺乏第一性原理的刻画。',
    progress: [
      '**静态理论**: 恒定域上 Turing 不稳定性由色散关系的正峰决定，波长与域尺寸的比值 $k\\ell$ 被数值观察到大致常数。',
      '**模式翻倍**: 生长使 $k\\ell$ 保持驻定，触发 mode-doubling/tripling，此现象已有实验与数值记录。',
      '**文献缺口**: 生长域上的谱分析多基于拟稳态假设，未给出峰数与生长率的精确函数关系。',
    ],
    obstacles: [
      '**拟稳态失效**: 域生长时间尺度大于模式弛豫时，色散谱本身的瞬时变化与非线性演化耦合，线性模式选择不再直接决定最终斑图。',
      '**多尺度奇异扰动**: 慢扩散域边界层与快反应内部层相互牵制，匹配渐近解极其脆弱。',
    ],
    engineering_value:
      "A first-principles peak-count scaling law lets synthetic-morphogenesis and tissue-engineering researchers design growing scaffolds whose pattern wavelength is set by the growth protocol, turning the qualitative observation that length controls stripe count into quantitative design rules.",
    formalization_notes:
      '线性阶段在均匀区间上的谱可显式写出，验证 k 与尺寸的幂律关系是纸笔可判定的。最终斑图数则要求解一个自由边界问题，属于开放研究。',
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
    last_verified: '2026-08-22',
    proposer: 'multiple contributors',
    proposed_year: 2016,
    via: { label: 'Kimura, A stochastic model concerning the maintenance of genetic variability in quantitative characters, Proc. Natl. Acad. Sci. USA 54 (1965); 双等位基因平衡密度见 Kimura, Genetics (1964)' },
    impact_domains: ['群体遗传学的基本理论', '等位基因频率谱理论'],
    related_problems: [
      {
        id: 'mb-009',
        relation: 'analog_of',
        note: '同属多基因型的平衡定量刻画，mb-009 关注无限小模型的涌现，本问题关注平衡密度闭式。',
      },
    ],
    statement:
      `On the $(K-1)$-simplex of allele frequencies, let the Wright–Fisher diffusion with generator
$\\mathcal{L} = \\sum_i \\partial_{x_i}\\big[ x_i(1-x_i)\\partial_{x_i}\\big] + \\text{mutation} + \\text{selection},$
be given where mutation is a constant-flux matrix $M=(m_{ij})$ (which may be asymmetric) and selection is a fixed additive fitness. **Prove that a closed-form stationary density $\\pi(x) \\propto e^{\\beta V(x)} \\prod_i x_i^{\\theta_i-1}$ exists exactly when the mutation matrix $M$ is reversible (satisfying detailed balance $\\theta_i m_{ij}=\\theta_j m_{ji}$), and that no such closed form exists for the general asymmetric, non-reversible $M$; give the diagonalizable condition that separates the two classes and the resulting order of the density.**`,
    origin:
      '种群中平衡多态性（balancing selection）的维持如何量化、等位基因频率处于何种稳态分布，是经典的单座位理论。可逆突变的 Wright 平衡函数已广为人知，但真实突变通常呈非对称流动，此时密度是否仍为势函数乘多项式乘积的闭合形式长期悬而未决。',
    progress: [
      '**可逆情形**: 满足细分平衡的突变矩阵对应势函数解，等位基因频率服从 Wright 的封闭密度。',
      '**无选择近似**: 中性且突变任意时 stationary density 仍可确切给出，但加入选择即需求解特定偏微分方程。',
      '**部分结果**: 对某些对称选择与非对称突变组合，数值观察者发现密度仍为解析多项式乘积，但缺乏一般性定理。',
    ],
    obstacles: [
      '**不可恢复的不可逆流**: 非可逆突变引入循环流，打破势函数结构，stationary density 需解一阶与二阶微分子方程耦合的非线性系统。',
      '**存在性归属**: 区分闭式存在的代数判据需运行纯组合条件，未找到统一的不动点刻画。',
    ],
    formalization_notes:
      '可逆情形的闭式验证是清晰的计算目标；问题核心在于把 non-reversible 情形的无穷次可解性与不存在闭式联系起来，可形式化为一个纯代数可判定条件。',
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
    last_verified: '2026-08-22',
    proposer: 'W. D. Hamilton',
    proposed_year: 1964,
    via: {
      label: 'Hamilton, The genetical evolution of social behaviour, J. Theor. Biol. 7 (1964)',
      url: 'https://doi.org/10.1016/0022-5193(64)90038-4',
    },
    impact_domains: ['亲缘选择理论', '社会行为的演化博弈'],
    related_problems: [
      {
        id: 'mb-006',
        relation: 'shares_tools',
        note: '同属结构化群体上自然选择的精确刻画，共用图上的 Moran/传递过程工具。',
      },
    ],
    statement:
      `In a finite structured population of size $N$ on a regular graph, a mutant allele performs an act that costs its bearer $c$ and benefits its partner $b$. The mutant spreads if its fixation probability exceeds the neutral value $1/N$. **Prove an exact condition for spread, expressible as the inclusive-fitness inequality $b\\,r - c > 0$ with a precisely computed relatedness coefficient $r(N)$ that tends to a positive limit as $N\\to\\infty$ on the star graph, or else establish the contrary claim that on spatially viscous topologies $\\lim_{N\\to\\infty} r(N)=0$ in the appropriate limit**, and resolve which topology-dependent scaling (weak selection, large population, or broad benefit) drives the qualitative answer.`,
    origin:
      'Hamilton 规则 $br>c$ 是亲缘选择理论的基石，但当纳入结构化有限群体及弱选择、黏性人口时，相关度 $r$ 的精确取值变得高度拓扑依赖。围绕黏性人口中完全替代时 $r=0$ 的著名主张（即群体组内替代导致合作中性化）已有激烈争论，缺乏对每一图族的第一性原理证明。',
    progress: [
      '**经典理论**: 无限与扩散近似下 $r$ 定义为亲缘协方差比例，已有清晰表述。',
      '**图上的规则**: 对一般图推导出扩展的 Hamilton 规则，且部分图（星图）中 r 的极限行为被数值指出。',
      '**争论焦点**: 文献中关于黏性人口 $r\\to0$ 与 $r\\to+$ 并存，取决于有限群体纠正与弱选择展开的次序。',
    ],
    obstacles: [
      '**极限次序**: 大 N 与弱选择两种极限在非交换时导致不同的 $r$，需人为取定一致的阶次。',
      '**度量选择**: 亲缘度 $r$ 对演化时间窗与群体内成对的分布敏感，尚未统一到单一图不变量。',
    ],
    engineering_value:
      "A resolved relatedness coefficient r(N) for structured populations settles when inclusive-fitness predictions hold, so evolutionary-tumor and social-evolution modelers can deploy the br minus c rule with a correctly computed r instead of a topology-dependent guess.",
    formalization_notes:
      '固定图族与固定选择强度下，$r(N)$ 是有限传递过程固定概率的代数函数，可形式化验证其极限；核心裁判是不同极限次序下的不一致性判定。',
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
    last_verified: '2026-08-22',
    proposer: 'R. M. May',
    proposed_year: 1972,
    via: {
      label: 'May, Will a large complex system be stable? Nature 238 (1972)',
      url: 'https://doi.org/10.1038/238413a0',
    },
    impact_domains: ['生态系统稳定性理论', '随机矩阵方法在生态学的应用'],
    related_problems: [
      {
        id: 'mb-004',
        relation: 'shares_tools',
        note: '同属生态动力学稳定性：mb-004 关注持久性判据，本问题关注雅可比谱的稳定性阈值。',
      },
    ],
    statement:
      `Let $M$ be an interaction matrix whose off-diagonal entries have a random magnitude with variance $\\sigma^2$, but whose signs obey a fixed pattern: predator-prey, competitive, or mutualistic, paired according to a given directed food-web scaffold with mean degree $\\bar{k}$. **Determine the sharp critical line in the plane $(\\sigma\\sqrt{n}, \\bar{k})$ separating almost-sure asymptotic stability (all eigenvalues lie in the left half-plane) from instability, for each sign pattern, and prove the quantitative deviation of that threshold from the eigenvalue radius $\\sqrt{n}\\,\\sigma$ of the unstructured random ensemble**, including the role of strict predator-prey sign antisymmetry in rescuing stability.`,
    origin:
      'May 的著名悖论指出随机生态系统的稳定性随连接度按 $\\sqrt{n}\\,\\sigma$ 崩溃，但真实食物网稳定的主张依赖其特定的捕食—被捕食符号结构提供的稳定作用。随之而来的定量问题是：把符号模式的信息代入谱理论后，稳定阈值与纯随机情形仍有严格可证明的差异，该差异多大、何时足以维持现实尺度的稳定，缺乏精确刻画。',
    progress: [
      '**May 判据**: i.i.d. 随机矩阵的谱半径判定了弱结构系统的失稳阈值。',
      '**修正结果**: 符号结构化随机矩阵的谱具有半圆以外的悬挂特征根，某些结构下可证明光标在谱外。',
      '**数值谱**: 捕食—被捕食模式被观察到显著扩大稳定窗口，但形式化证明对各模式不全。',
    ],
    obstacles: [
      '**独立失败**: 食物网边的相关与符号约束破坏独立性，使 RMT 迹法的误差无法一致控制。',
      '**谱重影**: 符号反对称结构在捕食者—被捕食者对内产生符号代偿，主特征根的实部与虚部纠缠难分离。',
    ],
    engineering_value:
      "A sharp complexity-stability threshold for sign-structured food webs gives ecosystem managers a quantitative stability margin: they can certify whether a real network with its measured degree distribution and sign pattern sits in the provably-stable window, informing biodiversity and rewilding risk assessment.",
    formalization_notes:
      '对固定符号模式，稳定性判据是可数维的线性代数性质，可用谱判据打包成可判定不等式；问题归属为把 RMT 精细校正推广到非 i.i.d. 且有符号约束的矩阵类。',
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
    judgment: 'A pass proves a fundamental lower bound on the relative variance of an intracellular readout of a spatially distributed morphogen concentration, establishes whether negative feedback can beat the linear-sensing Berg-Purcell scaling or whether an information-theoretic floor persists, and gives the minimal achievable ligand-count sensing error for a given gradient geometry under the molecular-number-noise constraint; a diffusion-only estimate is not accepted. 合格答案为可核验判定并附三层残差：(1) **R_model**＝把真实发育信号转导限制为配体-受体泊松计数/Berg–Purcell 模型所丢掉的近似残差上界；(2) **R_param**＝配体浓度、受体数、梯度几何来自测量/标定时其不确定度对感知下限的输入残差上界（对测量区间内所有配置成立）；(3) **R_num**＝随机动力学/主方程求解或区间封闭的残差上界。无输入测量不确定度时须如实注明 R_param≡0。',
    certificate: {
      r_model: {
        bound: '把真实发育信号转导限制为配体-受体泊松计数/Berg–Purcell 模型所丢掉的近似残差上界',
        derivation: 'Berg–Purcell 计数模型残差界',
      },
      r_param: {
        bound: '配体浓度、受体数、梯度几何来自测量/标定时其不确定度对感知下限的输入残差上界（对测量区间内所有配置成立）',
        derivation: '测量参数传播到感知误差下限的区间映像',
      },
      r_num: {
        bound: '随机动力学/主方程求解或区间封闭的残差上界',
        derivation: '主方程求解残差界 / 区间封闭',
      },
      total_band: '感知误差下限 ≤ R_model + R_param + R_num',
      certified_band: '最小可实现配体计数感知误差区间',
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
    last_verified: '2026-08-22',
    proposer: 'multiple contributors',
    proposed_year: 2013,
    via: { label: '形态梯度浓度感知信息下界：与 Berg–Purcell 极限 (1977) 相关' },
    impact_domains: ['发育信号处理的物理极限', '细胞内分子噪声理论'],
    related_problems: [
      {
        id: 'mb-014',
        relation: 'shares_tools',
        note: '同属存储与信息容量的信息论逼近：mb-014 关注联想记忆容量，本问题关注发育读取的精度下限。',
      },
    ],
    statement:
      `A cell reads the concentration $c$ of a morphogen produced by a distant source, receiving on average $N$ bound ligand molecules sampled from a gradient. Given the full ligand-density distribution in space, **prove a lower bound on the relative error of any unbiased positional reading, of the Berg-Purcell form $\\sigma_c/c \\ge 1/\\sqrt{N}$, and decide whether inserting a negative-feedback regulation of ligand production or receptor reuse can reduce this error to a value allowing positioning below the established brute bound, or whether an information-theoretic floor (fixed by ligand copy number and the readout channel capacity) persists regardless of feedback**. Make the bound sharp in terms of the gradient shape (exponential versus power-law decay).`,
    origin:
      '胚胎通过解读形态发生梯度的浓度确定各细胞沿身体轴的位置，而细胞只能采集有限数目的配体分子，这一分子采样测量的本质噪声设定了发育定位的物理极限。经典 Berg–Purcell 估计给出 $1/\\sqrt{N}$ 的相对误差，但负反馈、受体可重复使用等机制是否可能突破该极限，是开发与信息论交叉中活跃而未决的问题。',
    progress: [
      '**Berg-Purcell 界**: 简单受体模型给出相对误差与采样次数平方根成反比，是感知精度的经典基准。',
      '**负反馈结果**: Lestas-Vinnicombe-Paulsson 证明反馈无法克服产物（输出）的泊松噪声下限，故精度有一个独立的固有损失。',
      '**发育实例**: 转录网络信息容量达到最大化，部分梯度读取接近 Berg-Purcell 界极限，但缺口的具体来源仍未闭合。',
    ],
    obstacles: [
      '**空间与非平衡**: 形态发生梯度是非平衡、非均匀的空间分布，经典平衡态采样论证不能直接推广。',
      '**反馈收益的边界**: 是否可将反馈的信息增益折算为采样数的有效增量，需同时锁定信源与信道两处的误差来源。',
    ],
    engineering_value:
      "A proven information-theoretic floor on concentration sensing sets the resolution ceiling for positional readouts in synthetic morphogen circuits and organoid engineering - telling bioengineers the minimal ligand-count and layout noise they cannot beat, and exactly where negative feedback genuinely helps.",
    formalization_notes:
      '把读取建模为在给定配体空间分布下的随机采样，相对误差的极值是一个标准的 Fisher 信息问题，可在层间梯度与泊松下精确求解，从而给出可验证的下界不等式。',
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
    last_verified: '2026-08-22',
    proposer: 'multiple contributors',
    proposed_year: 2007,
    via: { label: 'NS 合适弱解奇异集维数：Caffarelli–Kohn–Nirenberg 部分正则性传统及后续维数结果' },
    impact_domains: ['湍流数值模拟校验', 'CFD 网格自适应性', '能量守恒数值格式'],
    related_problems: [],
    statement: `Consider incompressible Navier–Stokes on a bounded domain for all $t>0$. By the Cafarelli–Kohn–Nirenberg partial regularity theorem every suitable weak solution is smooth away from a set whose box-counting dimension is at most $5/3$. **Prove or disprove the sharp improvement**: the singular set has vanishing one-dimensional Hausdorff measure $\\mathcal H^1(S)=0$, or find an exponent sharper than $5/3$ that is provably optimal.

Equivalently, sharpen the $\\varepsilon$-regularity criterion $\\|u\\|^2 < \\varepsilon$ on unit parabolic cylinders to the minimal integrability condition under which local regularity is enforced, and match the upper dimension bound with a dimension-reducing lower example.`,
    origin:
      '湍流与高雷诺数流动中，数值解是否收敛到真解、自适应剖分在何处加密，都取决于对奇异集合大小和结构的定量理解。CKN 定理给出了维数 5/3 的上界，但解析与数值证据都指向可进一步收紧到维数 1；从 5/3 压到 1 的主要障碍是向后解的唯一性在有界域上并未被完全控制。',
    progress: [
      '**Cafarelli–Kohn–Nirenberg (1982)**: 由 $\\varepsilon$-正则判据给出奇异集 box-维数 $\\le 5/3$。',
      '**向后唯一性与 $L_{3,\\infty}$ 解**: Escauriaza–Seregin–Šverák 与 Kukavica 的工作把局部正则性部分归结为向后唯一性问题，维数上界有若干改进。',
      '**Kukavica (2009)**: 给出奇异集分形维数的改进估计，但尚未达到维数 1。',
    ],
    obstacles: [
      '**维数 1 障碍**: 把奇异性挤进一维集合需要更强的连续模信息，而 CKN 的 $\\varepsilon$-正则判据目前只给出关于空间离散的一致估计，时序方向的估计与线性奇异维数不匹配。',
    ],
    engineering_value:
      '奇异集维数的尖确估计直接决定高 Reynolds 数仿真中网格加密策略的效率：目标维数是降低层格数与湍流大涡模拟近壁分辨率的理论依据，也是自适应方法能否保证收敛速率的判据。',
    formalization_notes:
      '判定可由能量不等式与 $\\varepsilon$-正则判据形式化：验证某圆柱上收敛性成立即给出奇异集的测度上界，属于可在辅助系统中逐步化简为有限不等式的分析型判据，形式化系数中等偏高。',
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
    last_verified: '2026-08-22',
    proposer: 'A. P. Calderón',
    proposed_year: 1980,
    via: {
      label: 'Calderón, On an inverse boundary value problem, Seminário Brasileiro de Análise (1980); 三维唯一性开放',
      url: 'https://doi.org/10.1007/978-3-662-12877-0_1',
    },
    impact_domains: ['电阻抗断层成像', '无损检测', '传感器反演孔径设计'],
    related_problems: [],
    statement: `Let $\\Omega \\subset \\mathbb R^3$ be a bounded connected domain and let $\\gamma \\in L^\\infty_+(\\Omega)$ be a strictly positive conductivity. The Dirichlet-to-Neumann map $\\Lambda_\\gamma$ is defined by $\\Lambda_\\gamma(f) = \\gamma \\partial_\\nu u|_{\\partial\\Omega}$ for the unique solution of $-\\nabla\\cdot(\\gamma\\nabla u)=0$ with $u|_{\\partial\\Omega}=f$. **Prove that $\\Lambda_{\\gamma_1} = \\Lambda_{\\gamma_2}$ implies $\\gamma_1=\\gamma_2$ for general $L^\\infty$ conductivities.**

The known route reduces the problem to a complex-phasor substructure (the Brown–Uhlmann condition); decisions here include removing that condition, or proving a stability estimate with log-type modulus that is genuinely sharp.`,
    origin:
      '电阻抗断层成像通过边界电压测量反演体内导电率分布，是医学成像与地球物理探测的基本反问题。Calderón 问题在二维对无规导电率已获证，三维全局唯一性在 Lipschitz 一级亦已建立，但对一般有界不光滑导电率的全局唯一性仍悬而未决。',
    progress: [
      '**Sylvester–Uhlmann (1987)**: 光滑导电率情形证明稳定全局唯一性。',
      '**Brown–Uhlmann (1997)**: 二维对 $L^\\infty$ 导电率证明唯一性，并在高维把问题化为一条可积性条件。',
      '**Haberman–Tataru (2013)**: 三维 Lipschitz 导电率唯一性成立，但对 $L^\\infty$ 的全局唯一性仍有缺口。',
    ],
    obstacles: [
      '**可积性条件障碍**: 复杂相位子构造要求界在 $L^\\infty$ 意义下成立，而 Brown–Uhlmann 化归所依赖的反演公式需要额外的正则性，直接推广到任意可测系数落在远期奇异积分的技术限制上。',
    ],
    engineering_value:
      '三维唯一性是否成立决定电阻抗成像重建算法能否提供理论保证：若唯一性在常见光滑系数下成立，则迭代重建与正则化反演可依确定性误差界收敛，为临床像差校验与无损检测提供可靠性依据。',
    formalization_notes:
      '判定是分析型反问题命题：唯一性可化为对复数相位子与辅助方程解的构造性验证，形式化集中于奇异积分估计与稳定性的有限化简，系数中等偏高。',
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
    last_verified: '2026-08-22',
    proposer: 'R. W. Brockett',
    proposed_year: 1983,
    via: {
      label: 'Brockett, Asymptotic stability and feedback stabilization, in Differential Geometric Control Theory (1983); Sontag (1983)',
      url: 'https://doi.org/10.1007/978-1-4612-5423-6_18',
    },
    impact_domains: ['机器人与自动驾驶镇定控制', '航天器姿态控制', '无传感器反馈设计'],
    related_problems: [
      {
        id: 'me-001',
        relation: 'shares_tools',
        note: '两项都以 Lyapunov 方法与图/耗散结构为共同工具，分别把一致性收敛与反馈镇定的判定落到构造性判据上。',
      },
    ],
    statement: `For a control-affine system  $\\dot x = f(x) + \\sum_{i=1}^m g_i(x) u_i$ on $\\mathbb R^n$, a necessary condition for continuous feedback stabilizability is Brockett’s $f(0) \\in \\mathrm{int}\\, \\overline{\\mathrm{conv}}\\, U(x)$ condition; a sufficient condition (for asymptotic controllability plus a known class of Lyapunov functions) is provided by Sontag’s criterion. **Find a tractable condition that is both necessary and sufficient for the existence of a globally asymptotically stabilizing continuous state feedback**, resolving in particular whether asymptotically controllable systems without smooth Lyapunov functions admit continuous (not merely Holder/upper-semicontinuous) stabilizing feedback.

Provide an explicit convexity/transversality criterion and test it against the known nonholonomic examples where only discontinuous or time-periodic feedback exists.`,
    origin:
      '镇定设计是控制器综合的核心任务。经典判据一正一负互不覆盖：Brockett 条件为必要而常不充分，Sontag 型构造给出充分性却依赖控制 Lyapunov 函数的存在。机械、航天等工程系统中 Lipschitz 反馈比不连续反馈更易实现，因此判定连续反馈是否存在直接指导控制器形式的选取。',
    progress: [
      '**Brockett (1983)**: 给出连续反馈镇定的必要条件。',
      '**Sontag (1983)**: 用控制 Lyapunov 函数建立渐近可控与反馈镇定的充分条件。',
      '**Clarke–Ledyaev–Sontag–Subbotin (1997)**: 证明可渐近镇定系统存在半连续/间断反馈，但完全连续反馈的充要判据仍缺。',
    ],
    obstacles: [
      '**无平滑性障碍**: 渐近可控系统的可达集不满足光滑 Lipschitz 结构时，无法用梯度型反馈唯一确定控制，凸性与横截性等几何条件难以用一个可检验的代数条件同时刻画充要两端。',
    ],
    engineering_value:
      '连续（尤其 Lipschitz）状态反馈是嵌入式控制器最容易实现且对测量噪声最稳定的形式。一个既必要又充分的判据能告诉工程师哪些系统可安全采用光滑反馈、哪些必须接受滑模或不连续控制，从而避免在控制器结构上做错误取舍。',
    formalization_notes:
      '判定是几何控制命题：把可达集凸包与梯度型反馈的相容性化为对有限状态空间的包含关系检验，形式化集中于凸性与横截性的有限化简，系数中等。',
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
    last_verified: '2026-08-22',
    proposer: 'multiple contributors',
    proposed_year: 2017,
    via: { label: '参数化 PDE 解流形 n-宽衰减：近期文献（如 Cohen–DeVore 宽度估计）' },
    impact_domains: ['模拟降阶与数字孪生', '多参数优化设计', '不确定性量化'],
    related_problems: [],
    statement: `Let $\\mathcal M = \\{u(a) : a \\in \\Lambda\\} \\subset V$ be the solution manifold of a parametrized linear elliptic equation $\\mathcal A(a) u = f$, $a$ ranging over a parameter set $\\Lambda$ in finite or countable dimension. Let $d_n(\\mathcal M)$ be the Kolmogorov n-width in $V$. **Determine the sharp asymptotic of $d_n(\\mathcal M)$ as $n \\to \\infty$**:
- whether analytic (holomorphic) parameter dependence yields exponential decay $d_n \\sim 2^{-c n}$ with the best constant $c$, and
- for merely smooth (e.g. $C^k$) dependence, the exact polynomial rate and the threshold at which sharpness breaks, with explicit lower-bound examples.`,
    origin:
      '全阶有限元求解在参数空间和高维不确定性展开下成本急剧上升，模型降阶/降基方法依赖对解流形可近似性的定量理解。Kolmogorov n 宽刻画了在泛函空间中线性逼近的极限精度，若流形 n 宽只按多项式衰减则任何线性降阶方案都受限于此障碍，因此尖确衰减率决定数字孪生可用维度。',
    progress: [
      '**Cohen–DeVore (2015)**: 解析/全纯系数族给出复杂的逼近率与 n 宽估计。',
      '**光滑依赖**: 仅给出多项式型上界，对应下界仅在特殊参数族中建立。',
      '**降基收敛性**: 贪心快照法在若干工程类参数族上数值吻合指数率，但最优常数与光滑-解析分界缺乏统一证明。',
    ],
    obstacles: [
      '**维数与解析性冲突**: 光滑非线性依赖的流形在有限实测点集合上的线性逼近率受制于对数因子与维数关系，难以同时最优地给出上下界；构造匹配下界需要逐步控制快照子空间维数。',
    ],
    engineering_value:
      '实时仿真与数字孪生依赖预先压缩的降阶基：若流形 n 宽为指数率则可预测在线求解误差并按需增加基函数，若仅为多项式率则需改进非线性（深度）近似。该项研究为 ROM 与不确定性量化提供可判定的精度预算。',
    formalization_notes:
      '判定需把 n 宽衰减化为对插值算子在参数族上的叠代界：验证上下界的指数/多项式常数与构造的反例是否匹配，可在辅助系统中逐步简化为一组离散范数不等式，系数中等。',
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
    last_verified: '2026-08-22',
    proposer: 'L. Prandtl',
    proposed_year: 1904,
    via: {
      label: 'Prandtl 边界层 (1904); 无粘极限正则性损失综述见 Gérard-Varet (2023) 等',
      url: 'https://doi.org/10.1007/978-3-662-33948-0_2',
    },
    impact_domains: ['航空边界层仿真', '高雷诺数 CFD 校验', '湍流壁面模型'],
    related_problems: [],
    statement: `As viscosity $\\nu \\to 0$, any sufficiently smooth Navier–Stokes solution is expected to converge to its Euler counterpart together with a near-wall Prandtl layer. It is known that for analytic data the convergence holds, whereas for merely $C^\\infty$ (non-analytic) data the Prandtl expansion is unstable. **Determine the exact regularity space in which the zero-viscosity limit is stable**: prove that the Prandtl system is ill-posed in Sobolev spaces yet well-posed in a Gevrey class $G^s$ with the optimal exponent $s$, and exhibit a solution whose Sobolev norm growth rate is sharp, so the expansion holds precisely up to a stated Gevrey threshold.`,
    origin:
      '高 Reynolds 数翼型绕流的边界层与无粘化近似是气动仿真与风洞标定的基础。当实验/数值初始数据仅有有限正则而非常解析时，Prandtl 方程可能出现指数级失稳，使经典的边界层假设在实际算例上失效，因此尖锐正则阈值决定工程计算在何处必须引入湍流壁面模型。',
    progress: [
      '**Gérard-Varet–Dormy (2010)**: 证明 Prandtl 方程在 Sobolev 空间病态。',
      '**Gérard-Varet–Maekawa–Masmoudi (2018)**: 建立 Gevrey 类中的展开稳定性（对若干剪切流）。',
      '**Grenier–Guo–Nguyen**: 通过谱失稳显示无粘极限对非解析数据失效，给出正则性损失的若干定量下界。',
    ],
    obstacles: [
      '**Gevrey 指数障碍**: 稳定性要求的 Gevrey 阶与初始数据正则的高阶导数增长速率强耦合，剪切流的谱分析局限于一维方向，高维位势与变几何边界上难以统一确定最优临界指数。',
    ],
    engineering_value:
      '明确边界层近似成立的正则阈值，帮助 CFD 工具在接近该阈值的工况下自动转用湍流闭合模型，避免在解析域内继续追求 Prandtl 展开导致的伪解析行为，从而保证高雷诺数算例的数值收敛解释可靠。',
    formalization_notes:
      '判定是谱分析型命题：把 Prandtl 线性算子谱与正则丢番部化为对有限阶导数的上界验证，病态性可由有限维谱实例证伪，系数中等。',
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
    last_verified: '2026-08-22',
    proposer: 'multiple contributors',
    proposed_year: 1996,
    via: { label: '离散断层重建最少投影方向：discrete tomography 综述（Herman & Kuba, 编）' },
    impact_domains: ['CT 少视角成像', '工业无损检测', '材料网格形态反演'],
    related_problems: [],
    statement: `Let a binary image $f \\in \\{0,1\\}^{n\\times n}$ be observed by the line sums $\\sum f$ along a fixed set $D$ of distinct lattice directions $v \\in \\mathbb Z^2$. **Determine the minimal cardinality $k$ of $D$ (and which directions) such that every binary image is uniquely determined by this $D$-line-sum data**, and when uniqueness holds, give a polynomial reconstruction algorithm; if uniqueness fails, give the smallest counterexample.

Decide also whether the decision problem of uniqueness for a given finite $D$ is in $\\mathrm P$ or is NP-complete, matching the classical few-projection obstruction.`,
    origin:
      '少视角 CT 与工业断层扫描能缩短成像时间并降低辐射剂量，但投影角不足会导致反演不唯一。离散断层学关注二值目标（如材料夹杂、孔隙网格）从极少数方向线和技术而唯一判定的可行窗口，其信息论下界直接决定低成本成像是否可行。',
    progress: [
      '**Gardner–Gritzmann (1997)**: 系统分析有限集合沿若干格路方向的唯一判定条件。',
      '**Logan–Shepp (1975)**: 连续情形的少视角重建对数奇异度估计。',
      '**Herman–Kuba 专著**: 对若干方向集给出穷举验证的示例，但方向数与网格尺寸的最优关系未完全确定。',
    ],
    obstacles: [
      '**组合障碍**: 二值矩阵的线和技术对方向选择高度敏感，存在大量同线和技术置换，证明任何小于某阈值的方向集都破坏唯一性需要遍历指数多的格路组合，且判定问题是组合优化困难性的典型来源。',
    ],
    engineering_value:
      '若能以最少数量的投影方向实现唯一重建，即可在 CT 扫描中显著减短机架停留时间与辐射剂量；对工业构件裂纹与材料夹渣的少视角图像反演提供可判定的唯一性保证，支撑自动化在线检测。',
    formalization_notes:
      '判定是组合记数命题：把唯一性化为对线和大小的独立集/多项式恒等式验证，方向集与网格尺寸的关系可有限枚举，系数相对高。',
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
    last_verified: '2026-08-22',
    proposer: 'multiple contributors',
    proposed_year: 2011,
    via: { label: '网络可控性最小领航节点：最小控制问题综述与 NP-困难传统（Olshevsky 等）' },
    impact_domains: ['无人机编队与智能电网', '传感器与执行器布置', '社会网络影响控制'],
    related_problems: [],
    statement: `Let $G=(V,E)$ be a weighted graph of $n$ nodes with linear dynamics $\\dot x = A x + B u$. Choosing a set $L \\subseteq V$ of leaders amounts to fixing a diagonal support for the input matrix $B$. **Determine the computational complexity and constant approximability of the minimum-leadert-choice problem: find the smallest leader set $L$ such that $(A,B_L)$ is controllable (or observable)**, with the weights and topology of $G$ given as input.

Provide either a polynomial-time $(1+\\varepsilon)$ approximation, a matching hardness-of-approximation bound (e.g. no constant factor unless $\\mathrm P = \\mathrm{NP}$), or an exact characterization for special graph classes.`,
    origin:
      '智能电网、无人机编队与多机器人系统中的可控性取决于在哪些节点注入输入，表现为最小领航选择问题。实践中通常以谱或强度贪心近似，但最优保证的算法界限并不清楚；确定其近似比与/或困难性可指导在规模与时延约束下的传感器/执行器布置。',
    progress: [
      '**Olshevsky (2014)**: 最小可控性问题与相关选择的计算复杂度刻画。',
      '**Kalman 秩判据的复杂度**: 对一般加权有向图，秩判据导致的选择问题显示 NP-hard，封闭常数近似比仍有缺口。',
      '**子模近似**: 若干可控性准则下的贪心因子成立，但最优比率与强 NP-hard 的精确边界未定。',
    ],
    obstacles: [
      '**秩不连续障碍**: 可控性由秩判据决定，选择子集时秩在临界处的不连续变化使近似比证明困难，且难以构造保持谱结构的独立集编码来获得常数下界。',
    ],
    engineering_value:
      '最小领航选择直接决定传感与执行系统的造价与冗余需求。给出可证明近似比或难近似下界后，工程师可决定是否求精确解、采用贪心启发还是接受理论不可逼近的现实，从而在智能电网等安全关键系统中做可控性预算。',
    formalization_notes:
      '判定是组合优化命题：把可控性化成秩条件与集合选择的一致性验证，hardness 可由经典 NP-complete 问题归约建立，系数较高。',
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
    last_verified: '2026-08-22',
    proposer: 'M. Crouzeix',
    proposed_year: 2004,
    via: {
      label: 'Crouzeix, Bounds for analytic functions of matrices, Integral Equ. Oper. Theory 48 (2004); 常数猜想 1+√2',
      url: 'https://doi.org/10.1007/s00020-002-1184-6',
    },
    impact_domains: ['Krylov 子空间收敛性', '矩阵函数估计', '预条件与扰动分析'],
    related_problems: [],
    statement: `For any $n \\times n$ matrix $A$ and any polynomial $p$, let $W(A) = \\{x^* A x : \\|x\\|=1\\}$ be the numerical range. **Determine the optimal constant $C^*(W)$ such that**
$\\|p(A)\\| \\le C^* \\, \\sup_{z \\in W(A)} |p(z)|, \\qquad \\forall p \\in \\mathbb C[z],$
with $\\|\\cdot\\|$ the operator norm. Prove that $W(A)$ is a spectral set with constant $2$ (the Crouzeix conjecture), or establish the true optimal constant together with an explicit extremal example attaining it, improving the current universal bound $C^* \\le 1 + \\sqrt 2$.`,
    origin:
      'Krylov 方法的收敛与谱集分析都依赖矩阵多项式范数的上界。数值范围是比谱更精细又更易构造的分析对象，Crouzeix 定理给出谱集的普适常数，但最优常数的证明仍是数值线性代数中公认的开放问题，直接关系到 GMRES、幂级数函数与预条件矩阵的收敛估计精度。',
    progress: [
      '**Crouzeix (2007)**: 证明 $W(A)$ 为常数 $11.08$ 的谱集。',
      '**Crouzeix–Palencia (2017)**: 把普适常数改进为 $1+\\sqrt2$。',
      '**2×2 与特殊类**: 已证常数 2 对 2×2 矩阵及若干特殊类成立，一般情形的猜想仍未解决。',
    ],
    obstacles: [
      '**极端矩阵障碍**: 从估值 $1+\\sqrt2$ 压到 $2$ 需要获得最优条件数方向的极值，而数值范围不经过的特征向量构造使反例寻找困难，最优常数涉及的泛函分析量难以有限界化。',
    ],
    engineering_value:
      '最优常数决定 Krylov 迭代到给定残差所需的明确上界估计，是 GMRES 类算子在病态非正规矩阵上停机判据的理论基础，也用于矩阵库函数（如矩阵指数）与预条件误差的定量分析。',
    formalization_notes:
      '判定是谱集分析命题：把范数界化简为对数值范围上多项式模的有限维验证，兼顾构造反例的凝聚映射，系数相对高。',
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
    last_verified: '2026-08-22',
    proposer: 'S. Lepri, R. Livi & A. Politi',
    proposed_year: 2003,
    via: {
      label: 'Lepri–Livi–Politi, Thermal conduction in classical low-dimensional lattices, Phys. Rep. 377 (2003)',
      url: 'https://doi.org/10.1016/S0370-1573(02)00558-6',
    },
    impact_domains: ['纳米尺度热传导', '低维系统的输运', '非平衡统计物理'],
    related_problems: [
      {
        id: 'mp-026',
        relation: 'shares_tools',
        note: '均涉及热力学极限下能量/输运量的严格化，并共用线性响应与守恒律的分析工具。',
      },
    ],
    statement: `Consider a one-dimensional chain of $N$ oscillators with Hamiltonian such as the microbial Fermi-Pasta-Ulam model
$H_N = \\sum_{i=1}^N \\frac{p_i^2}{2} + \\sum_{i=1}^{N-1}\\Big(\\frac{(q_{i+1}-q_i)^2}{2} + \\frac{\\lambda}{4}(q_{i+1}-q_i)^4\\Big),$
coupled at the two ends to Langevin reservoirs at temperatures $T_1<T_2$. Prove that the stationary heat flux $J_N$ satisfies Fourier law in the sense that the conductivity $\\kappa_N = J_N N /(T_1-T_2)$ has a finite positive limit as $N\\to\\infty$, or else prove that it diverges with an explicit power $\\kappa_N \\sim N^\\alpha$, $\\alpha>0$. Equivalently, settle the finiteness of the Green-Kubo integral $\\kappa = \\lim_{T\\to\\infty}\\frac{1}{T}\\lim_{N\\to\\infty}\\frac{\\beta^2}{N}\\int_0^T \\langle J(t)J\\rangle\\,dt$ for the bulk chain.`,
    origin:
      'Fourier (1822) 猜测热流与温度梯度成正比，但严格证明在晶格模型中“由微观动力学涌现导热”至今是统计物理的著名挑战。一维及低维链预期出现反常输运（热导率随尺寸发散），其严格判定是输运理论的核心开放问题，也是 Bonetto–Lebowitz–Rey-Bellet 所总结的“对理论家的挑战”。',
    progress: [
      '**Bonetto–Lebowitz–Rey-Bellet (2000)**: 系统陈述 Fourier 定律在模型中的严格化挑战。',
      '**Bernardin–Olla (2011)**: 在特定弱非线性/带钉扎情形给出若干问题的可积或有限导判据。',
      '**Lepri–Livi–Politi 及多方**: 大规模数值强烈支持一维 FPU 链的反常输运（kappa_N ~ N^alpha），但缺乏严格证明。',
    ],
    obstacles: [
      '**无全局可积结构**: 一维非线性链并非可积，线性响应与守恒模的相互作用难以估计。',
      '**格林拟相关性长尾**: 能量电流自相关的代数长尾拖累有限尺寸外推，使收敛判别不稳定。',
    ],
    engineering_value:
      '直接决定纳米线与低维材料热导的尺寸依赖规律，为热电材料、纳米电子器件热管理以及声子工程提供定量判据。',
    formalization_notes:
      '目标可形式化为对 kappa_N 函数极限或发散指数的命题；判定用明确的不等号提出，但涉及长期数值外推，形式化需结合严格有限尺寸界的支撑。',
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
    last_verified: '2026-08-22',
    proposer: 'multiple contributors',
    proposed_year: 2016,
    via: { label: '正温度相互作用玻色凝聚：BEC 严格结果综述（如 Seiringer 相关）' },
    impact_domains: ['超流物理', '低温多体量子理论', '玻色体系的相变'],
    related_problems: [
      {
        id: 'mp-024',
        relation: 'generalizes',
        note: 'mp-024 处理的是基态/零温下的凝聚与动力学；本题把凝聚的存在性问题推广到正的有限温度。',
      },
    ],
    statement: `Consider the dilute Bose gas in a box of volume $V$ with Hamiltonian
$H = \\sum_{p}\\epsilon_p a_p^\\dagger a_p + \\frac{1}{2}\\sum_{p_1+p_2=p_3+p_4} \\hat v(p_1-p_3)\\,a_{p_1}^\\dagger a_{p_2}^\\dagger a_{p_3}a_{p_4},$
at inverse temperature $\\beta$ and chemical potential $\\mu$, with a repulsive short-range potential $v\\ge 0$ of scattering length $a$, in the dilute regime $\\rho a^3 \\ll 1$. Prove that for $T$ below a threshold $T_c$ close to the ideal-gas critical temperature $T_c^0 = 2\\pi\\hbar^2 \\rho^{2/3}/(m k_B \\zeta(3/2)^{2/3})$, the one-body density matrix $\\gamma^{(1)}$ of the grand-canonical Gibbs state has a spectral subspace of positive, order-$V$ occupation --- i.e. generalized Bose-Einstein condensation $\\gamma^{(1)} \\to \\langle \\varphi,\\cdot\\varphi\\rangle$ with condensation density $\\rho_0(T)>0$ --- uniformly in the thermodynamic limit, including the Bogoliubov-corrected shift of $T_c$.`,
    origin:
      '理想气体的凝聚由 Bose (1924)/Einstein (1925) 提出且严格已知；但相互作用玻色气体在正温度下的凝聚存在性——把基态结论（Lieb–Seiringer 已证）推广到非零温度、含 Bogoliubov 移位的 T_c——仍是统计物理的著名开放问题。它构成超流现象理论的核心支柱之一。',
    progress: [
      '**Lieb–Seiringer (2002)**: 严格证明稀薄玻色气体基态（零温）在广义意义下存在凝聚。',
      '**Boccato–Brennecke–Cenatiempo–Schlein (2018)**: 在 Gross-Pitaevskii 尺度下发展稳态 Bogoliubov 理论，逼近基态性质。',
      '**Hirayama / Chen–Guo–Seiringer 等**: Bogoliubov 谱与低温表达的进展，但正温度凝聚仍未封闭。',
    ],
    obstacles: [
      '**非零模与模的严格分离**: 凝聚模的定义需要小心处理，粒子数守恒或超流密度在有限温度下的严格刻画艰难。',
      '**温度尺度上的 Bogoliubov 修正**: 确定相互作用对 T_c 的移位（经典/非规范理论）尚缺严格上界。',
    ],
    engineering_value:
      '为超流氦、玻色气体冷原子实验和超流体计算的第一性原理闭合提供严格基础，也支撑冷原子量子模拟中对凝聚态密度的定量预测。',
    formalization_notes:
      '目标可写成关于 gamma^{(1)} 特征投影的定量下界，判定标准明确，但需结合 Bogoliubov 分析与大偏差技术，形式化属中等难度。',
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
    last_verified: '2026-08-22',
    proposer: 'J. M. Kosterlitz & D. J. Thouless',
    proposed_year: 1973,
    via: {
      label: 'Kosterlitz & Thouless, Ordering metastability and phase transitions in two-dimensional systems, J. Phys. C 6 (1973)',
      url: 'https://doi.org/10.1088/0022-3719/6/7/010',
    },
    impact_domains: ['超流薄膜', '二维相变理论', '凝聚态严格模型'],
    related_problems: [
      {
        id: 'mp-026',
        relation: 'shares_tools',
        note: '同为二维库仑型相互作用导致的序与相变问题，共用库仑气体与 renormalization 的能量类比工具。',
      },
    ],
    statement: `Let $H_K = -K\\sum_{\\langle x,y\\rangle}\\cos(\\theta_x-\\theta_y)$ be the classical XY (rotator) model on $\\mathbb{Z}^2$ with $\\theta_x\\in\\mathbb{T}$, equivalently the two-dimensional Coulomb gas of vortex-antivortex pairs. Prove that there exists $K_c<\\infty$ such that for $K>K_c$ the correlations of $e^{i\\theta_x}$ decay algebraically (power law, vanishing magnetization but diverging correlation length) and the spin-wave stiffness $\\rho_s(K)$ is strictly positive, whereas for $K<K_c$ correlations decay exponentially and $\\rho_s=0$, with a BKT transition at $K_c$ and the universal jump $\\rho_s(T_c^-)/T_c = 2/\\pi$. A pass must rigorously construct both phases and pin down the transition and the jump value.`,
    origin:
      'Berezinskii (1971) 与 Kosterlitz–Thouless (1973) 预言了无叠加序但由涡旋束缚-去束缚驱动的连续相变，以及超流密度在 T_c 的普适跳跃；Fröhlich–Spencer（库仑气体）严格确立了部分低/o 高温相，但两相共存与分析过渡的完整严格化至今未完全闭合，且可由薄氦膜实验直接比照。',
    progress: [
      '**Kosterlitz–Thouless (1973)**: 提出涡旋去束缚机制与普适跳跃的物理图景。',
      '**Fröhlich–Spencer (1981)**: 对二维库仑气体及 XY 模型严格建立低温和高温相的性质（含指数/幂律关联界）。',
      '**Nelson–Kosterlitz (1977)**: 形式化普适跳跃并给出与超流薄膜实验的对照。',
    ],
    obstacles: [
      '**涡旋束缚的严格控制**: 相对偶涡旋的完全束缚与过渡点的临界指数缺乏统一严格论证。',
      '**普适跳跃非平凡证明**: rho_s(T_c)/T_c=2/pi 尚缺端点处严格推导，需精细的 spin-wave 与涡旋能泛函分析。',
    ],
    engineering_value:
      '为二维超流薄膜、约瑟夫森结阵列和拓扑序相变提供精确预测，支撑超导微流与量子器件中二维序的定量设计。',
    formalization_notes:
      '命题可写成明确的幂律/指数关联判定与普适跳跃的等式，判定证书（关联界与跳跃）清晰可验证，是形式化可行度较高的目标。',
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
      '合格答案为"何时可用 tQSSA"的可核验判定而非通用误差定理：对一具体酶促反应参数族（总酶浓度 $\\epsilon$、速率常数区间），交付完整随机过程与其 tQSSA 约化之间全变差距离的可核验上界 $D(\\epsilon)$，并附三层残差总带：(1) **R_model**＝把真实生物化学（有限浓度、离子强度/活性效应）限制为理想质量作用 + tQSSA 约化所引入的残差上界；(2) **R_param**＝速率常数与总酶浓度来自测量/标定时，其不确定度传播到 $D(\\epsilon)$ 的输入残差上界（对测量区间内的所有 $k,\\epsilon$ 均须成立）；(3) **R_num**＝主方程/Gillespie 采样或区间算术求解该受控过程所引入的残差上界，三者合成使 $D_{\\text{tot}}\\le$ R_model+R_param+R_num 且在声明参数区内可数值验证。判定通过的消费形式：给定通路参数与精度要求，直接得到"在此参数区可使用 tQSSA（误差低于阈值）或必须跑完整刚性主方程"的带证判定，供大规模通路模拟在精度与速度间做可审计权衡。',
    certificate: {
      r_model: {
        bound: '把真实生物化学（有限浓度、离子强度/活性效应）限制为理想质量作用 + tQSSA 约化所引入的残差上界',
        derivation: '理想质量作用 + tQSSA 约化残差界',
      },
      r_param: {
        bound: '速率常数与总酶浓度测量不确定度传播到全变差距离 D(ε) 的输入残差上界（对测量区间内所有 k, ε 成立）',
        derivation: '测量区间传播到 D(ε) 的距离上界区间映像',
      },
      r_num: {
        bound: '主方程/Gillespie 采样或区间算术求解该受控过程所引入的残差上界',
        derivation: '区间算术 / 采样误差封闭界',
      },
      total_band: 'D_tot ≤ R_model + R_param + R_num',
      certified_band: 'tQSSA 与完整过程的带证全变差距离带',
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
    last_verified: '2026-08-22',
    proposer: 'multiple contributors',
    proposed_year: 2013,
    via: { label: '随机 QSSA 严格误差界：Kang–Kurtz 等极限与传统文献' },
    impact_domains: ['酶动力学的随机建模与降维', '生物化学主方程的刚性分解'],
    related_problems: [
      {
        id: 'mc-021',
        relation: 'shares_tools',
        note: '两者都基于化学主方程，并在稳态结构下做解析处理。',
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
      '为随机动力学模拟的模型降维提供严格的可验证误差上界，决定何时可以放心使用 tQSSA 而不必跑完整刚性主方程，直接影响大规模通路模拟的精度与速度权衡。',
    formalization_notes:
      '问题可化为有限或可数马尔可夫链之间的耦合构造；一个可机器验证的里程碑是对给定速率族给出区间算术检验的总变异误差上界。一般的尖锐误差界属于研究级挑战。',
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
    last_verified: '2026-08-22',
    proposer: 'multiple contributors',
    proposed_year: 2011,
    via: {
      label: '分子图谱确定性综述：van Dam & Haemers, Which graphs are determined by their spectrum? LAA 373 (2003)',
      url: 'https://doi.org/10.1016/j.laa.2003.07.008',
    },
    impact_domains: ['分子图同构的无歧义结构识别', '化学指纹与结构检索'],
    related_problems: [
      {
        id: 'mc-022',
        relation: 'shares_tools',
        note: '同为分子图上的结构计数与分类问题，共享匹配与谱工具。',
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
      '支撑基于谱的分子结构去重与检索算法：若能证明某类分子图由谱唯一确定，就能用谱特征做高效且无歧义的结构查询，服务于化学数据库的索引与异构体排重。',
    formalization_notes:
      '这是有限组合问题，非常适合形式化：对给定小图族的 DS 性质可用精确算术验证谱与同构；树族的完整分类是研究级核心，依赖图谱论中的归纳论证。',
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
    last_verified: '2026-08-22',
    proposer: 'multiple contributors',
    proposed_year: 2014,
    via: { label: '季节驱动 SIR 谐波响应与 Arnold 舌：流行病学综述（如 Keeling & Rohani）' },
    impact_domains: ['传染病年际波动理论', '吸引子锁定与混沌态预报'],
    related_problems: [
      {
        id: 'mb-005',
        relation: 'shares_tools',
        note: '同属 SIR 型传播动力学的分叉与长期行为，共享季节驱动与吸引子分析工具。',
      },
    ],
    statement:
      `Consider the seasonally forced SIR model with periodic transmission $\\beta(t)=\\beta_0\\,(1+\\varepsilon\\cos 2\\pi t)$ and a reinfection-susceptibility correction that re-couples removed individuals. **Determine the sharp boundaries (Arnold tongues) in the $(R_0,\\varepsilon)$ plane inside which the forced system locks onto a subharmonic orbit of period $m T$ (notably the biennial $m=2$ measles-like cycle), prove that these tongues occupy positive area, and decide whether each tongue terminates in a period-doubling cascade or in a Neimark–Sacker bifurcation.** Establish a rigorous criterion separating the locked regime from the intermittent-chaotic regime in which the orbit sporadically switches between the annual and biennial attractors, and give sharp bounds for that crossover in terms of $R_0$ and $\\varepsilon$.`,
    origin:
      '麻疹等儿童传染病呈现强季节驱动的隔年爆发现象，其由整数维 Arnold 舌与间歇切换所描述。尽管高维模拟丰富，但年内/隔年锁定界限的解析判定、舌末端分叉类型、以及间歇混沌的分界，作为低维动态系统的严格结论仍未闭合。',
    progress: [
      '**间歇混沌**: Schwartz–Smith 在周期驱动的麻疹模型中观测到吸引子间的间歇切换，被视为混沌感染序列的数学原型。',
      '**季节锁定**: Keeling 团队用切换吸引子框架把隔年周期视为季节驱动的周期倍化，但并入 AB 机制后仅为启发式。',
      '**参数扫描**: 2 周期响应在二维参数平面上被广泛数值观察，但舌的解析边界缺失。',
    ],
    obstacles: [
      '**降维失真**: 强制项把连续流提升为三维动力系统，扰动法只适用于弱强制，无法覆盖强季节驱动的实测区间。',
      '**混沌共存**: 多个周期的吸引盆相互渗透，Lyapunov 计算对舌内锁定判定不敏感。',
    ],
    formalization_notes:
      '把锁定判定归约为单参数周期解的存在与稳定：用不变环 / Poincaré 截面上的周期点追踪，可在固定 $R_0,\\varepsilon$ 的数字核上形式化验证。舌的严格测度与末端分叉阶需要符号边界计算。',
    engineering_value: '改进疫苗策略与疫情早预警——正确预报年际爆发的相位锁定与切换风险，避免基于单周期假设的预报偏差。',
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
    last_verified: '2026-08-22',
    proposer: 'multiple contributors',
    proposed_year: 2008,
    via: { label: 'Smale, Mathematical problems for the next century, Math. Intelligencer 20 (1998), 第 17 题（多项式系统零点的多项式时间算法）；平均情形复杂度见 Bürgisser & Cucker, Condition: The Geometry of Numerical Algorithms (Springer, 2013)' },
    impact_domains: ['回归与参数辨识', '全局优化求解器', '符号数值混合验证'],
    related_problems: [],
    statement: `Let $f: \\mathbb R^n \\to \\mathbb R$ be a degree-$d$ polynomial, or let $F:\\mathbb C^n \\to \\mathbb C^n$ be a square polynomial system with $n$ equations in $n$ unknowns. **Determine the average-case tractability: prove that there is an algorithm that, given a random such system drawn from a product/projection model, finds an approximate zero or approximates $\\min f$ on $\\mathbb R^n$/a compact basic-semialgebraic set in time polynomial in $n$ and the degree, with the output error certified to machine precision, or prove that such a feasible algorithm cannot exist (unconditionally or modulo a plausible cryptographic/antiparadoxical hypothesis).**

Equivalently, resolve whether the decision problems of real-solvability and of global nonnegativity of a polynomial admit randomized polynomial expected-time algorithms, deciding in particular whether every infeasible-by-SOS instance is structurally hard.`,
    origin:
      '参数拟合、模型校验与鲁棒设计都要判定一个实多项式系统是否有解或某多项式是否非负，这是科学计算与工程优化的共同底层决策。Smale 第十七问题长期悬而未决：即便非负性可由平方和层次逼近，其闭包在允许增广时是否导致多项式时间判定仍未知，决定全局求解器能否给出可证明的最坏/平均复杂度保证。',
    progress: [
      '**Smale (1998)**: 将拟零域验算与平方和闭包的可判定性列为新世纪数学问题，断言存在多项式时间平均算法。',
      '**SOS 层次 (Lasserre)**: 给出可核验最优下界的逐步松弛，但增广步骤的最坏复杂度指数且非充分。',
      '**平均分析实证**: 同伦与牛顿类方法在随机系统上期望多项式步数，但精致的平均模型下界与停机停止法则尚未闭合。',
    ],
    obstacles: [
      '**几何分歧障碍**: 实解集的分歧既源于临界轨迹的分叉又源于函数的非退化性损失，需要同时控制数值代数与随机几何；把判定问题归约到平方和时，舍入误差在跨越紧支集合时难以用固定位数分隔。',
    ],
    engineering_value:
      '可证明的平均多项式时间算法将终结全局优化中"何时停止"的黑箱开销，使参数反演、组合设计校验与化学反应网络平衡的求解具有可预测成本；即便得到不可能性，也为工程师标定哪些符号降阶/SOS 增广层次在平均意义下有效提供理论依据。',
    formalization_notes:
      '判定以波动计算形式给出：把平均复杂度化为对随机模型的度量与牛顿迭代收敛半径验证，可通过基于区间算术的鲁棒证书与中断循环进行机检，系数中等。',
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
    last_verified: '2026-08-22',
    proposer: 'H. Witsenhausen',
    proposed_year: 1968,
    via: {
      label: 'Witsenhausen, A counterexample in stochastic optimum control, SIAM J. Control 6 (1968)',
      url: 'https://doi.org/10.1137/0306048',
    },
    impact_domains: ['多智能体协同控制', '分散传感网络', '容错与鲁棒控制器设计'],
    related_problems: [
      {
        id: 'me-018',
        relation: 'shares_tools',
        note: '两者都处理非线性反馈设计缺乏简洁充要判据的问题：me-018 面向确定性镇定的连续反馈，me-027 面向随机分散系统中的非线性-线性最优性。',
      },
    ],
    statement: `Consider the two-stage problem with state $x_0 \\sim \\mathcal N(0, \\sigma^2 I)$ (scalar or vector), controls $u_1 = \\gamma_1(x_0)$, transition $x_1 = x_0 + u_1$, noisy measurement $y = x_1 + v$ with $v \\sim \\mathcal N(0, I)$ independent, and $u_2 = \\gamma_2(y)$, minimizing $J = \\mathbb E[\\|x_0 + u_1 - u_2\\|^2] + k\\,\\mathbb E[\\|u_1\\|^2]$ for a fixed weight $k$. **Prove that the minimizer $\\gamma^* = (\\gamma_1^*,\\gamma_2^*)$ over all measurable policies is nonlinear with $J(\\gamma^*) < \\inf_{\\text{linear}} J$, or prove that a linear policy is optimal**, giving a certified gap $\\inf_{\\text{linear}} J - J(\\gamma^*)$ and the value function.

Numerically discovered nonlinear policies beat the best linear ones for large $\\sigma$, but no proof of nonlinearity of the global optimum (or its negation) is known.`,
    origin:
      '多基地传感器、分散式网络与柔性制造中的每个执行器只拥有部分信息，最优分散策略是否仍是线性高斯解是团队理论（Team Theory）的核心未决问题。Witsenhausen 构造的反例不在经典 LQG 框架内成立，敲定了"分散+信息耦合致非线性最优"可能发生，但其最优性证明始终缺失，直接影响分散控制的工业标准和置信度。',
    progress: [
      '**Witsenhausen (1968)**: 给出表明最优解可能非线性的反例，但未证明全局最优非线性。',
      '**Mitter–Sahai (1983)**: 建立无信息的数值证据，猜测高噪声区非线性渐近最优。',
      '**Wu–Verdú (2011) 及后续**: 用最优传输观点给出若干策略族，但全局最优的线性-非线性二分仍未判定。',
    ],
    obstacles: [
      '**动态规划维数障碍**: 一步问题的数值解在多维状态空间上指数爆炸，且目标函数非凸使任何梯度/网格搜索无法保证全局最优；缺乏可在任意 $\\sigma,k$ 上统一闭合的松弛下界。',
    ],
    engineering_value:
      '若给出严格证明，可判定哪些分散控制场景必须采用非线性（从而需额外硬件与非凸优化），哪些仍可用线性 LQG 廉价实现；该定论对多智能体编队、容错控制和传感数据融合的可证性能上界提供直接工程依据。',
    formalization_notes:
      '判定以数值方向优先：把问题离散到充分细的网格并在线性策略族上计算严格下界，配合非线性策略的确定性代价上界形成可机检的间隙证明；完整的闭式分析仍待解析化，系数中等。',
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
    last_verified: '2026-08-22',
    proposer: 'multiple contributors',
    proposed_year: 2002,
    via: {
      label: '多相复合介质 G-闭包与可达界：Milton, The Theory of Composites (2002)',
      url: 'https://www.cambridge.org/core/books/the-theory-of-composites',
    },
    impact_domains: ['多相材料设计', '增材制造微结构优化', '热-力耦合多材料'],
    related_problems: [],
    statement: `Mix $m \\ge 3$ perfectly conducting isotropic phases with positive conductivities $\\sigma_1, \\dots, \\sigma_m$ and prescribed volume fractions to form a periodic composite. Let $\\sigma^*$ be the effective conductivity tensor. **Determine the full set of attainable pairs $(f, \\sigma^*)$ as the microstructure varies — the $G$-closure — and decide whether the Hashin–Shtrikman type bounds are simultaneously attainable: for $m \\ge 3$ phases, characterize which effective tensors inside the bounds are realized by rank-$k$ laminates (or ordered sequential laminates) and whether any strictly-interior effective tensor is excluded, providing the exact relaxation bounds.**

In particular settle whether the two-phase H–S bound structure, where the optimal bound equals a realized laminate, survives for three or more phases.`,
    origin:
      '3D 打印与多相复合材料把"能否调到理想刚度/热导率"变成工程约束。二相情形的 Hashin–Shtrikman 界已由层叠结构可达，但三相及更多的可达到界面（G-闭包）仍无封闭刻画，使多材料拓扑优化中的可行域只能用代数正则化逼近，直接影响一体成形的材料分配方案是否物理可实现。',
    progress: [
      '**Lurie–Cherkaev / Tartar (1985–88)**: 二相情形等价界与拟共形/层叠可达性基本完成。',
      '**Milton (2002)**: 系统综述三相及以上的剩余不等式与秩-2/秩-3 层叠，指出 G-闭包计入高阶秩仍开放。',
      '**拓扑优化实证**: 多相连续松弛在数值上收敛到边界解，但严格的中部可达/排除判定缺已验证的分析证书。',
    ],
    obstacles: [
      '**非线性可比拟障碍**: 三相有效张量的可达集对秩数不连续，高秩层叠在互补能量与封闭能量间的对偶不强，需同时处理逐点相分数约束与各相间的二次不等式族，解析刻画一个严格内界张量是否被实现仍需构造性例子。',
    ],
    engineering_value:
      '若多相可达集可封闭描述，多材料拓扑优化就能在真正物理可实现域内搜索，避免给出一芯全内失效的材料布局；量化哪些刚度/导率组合仅由"非常规高阶微结构"实现，指导增材层序与工艺约束下的设计优化。',
    formalization_notes:
      '判定属于材料微结构分析：把可达性化为各向异性张量上的一组二次不等式与秩-层叠构造的验证；由于需组合相位体积分数与秩参数，其自动化需借助半定松弛与逐点常数检验，形式化系数偏低。',
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
      '合格答案为"采样预算-误差-维数"的可核验曲线判据而非终极指数配对：对给定函数类 $F_d$（光滑度 $r$）与预算 $n$ 次求值，交付最小最坏情形误差的可核验区间 $[\\underline{e},\\overline{e}]$，使 $e^{\\text{wor}}(F_d,n)=\\Theta(n^{-\\alpha}d^{\\beta})$ 的指数 $\\alpha,\\beta$ 被一个受控括号包围，并附三层残差总带：(1) **R_model**：把数值计算限制为该 Sobolev 类 $F_d$ 所引入的残差上界（显式含对函数族光滑度/边界假设的依赖）；(2) **R_num**：对上述界给出的显式求积规则（或使下界可核验的采样集构造）用区间/精确算术封闭所引入的残差上界；(3) 参数（函数类、维数、误差目标）为精确给定的信息模型输入，**R_param≡0（无输入测量残差层，如实注明）**。判定通过的消费形式：给定误差目标 $\\epsilon$ 与维数 $d$，直接得到"需要的采样数 $n$ 落在 $[n_\\lo,n_\\hi]$"的可核验区间（连带"何时网格值得、何时让步 Monte-Carlo"的分界判据），供期权定价与参数化仿真做可证采样预算规划。',
    certificate: {
      r_model: {
        bound: '把数值计算限制为该 Sobolev 类 F_d（光滑度 r）所引入的残差上界（含对函数族光滑度/边界假设的依赖）',
        derivation: 'Sobolev 类限制残差界',
      },
      r_param: {
        bound: '≡0（函数类、维数与误差目标为精确给定的信息模型输入，无输入测量残差层）',
        derivation: '参数精确给定',
      },
      r_num: {
        bound: '对显式求积规则/可达采样集构造用区间或精确算术封闭所引入的残差上界',
        derivation: '区间/精确算术封闭界',
      },
      total_band: 'error 指数括号 ≤ R_model + R_num',
      certified_band: '[e_lo, e_hi]（采样数 n 落在 [n_lo, n_hi]）',
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
    last_verified: '2026-08-23',
    impact_domains: ['金融衍生产品定价', '贝叶斯反问题后验归一化', '参数化 PDE 与代理模型', '高维统计计算'],
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
      '期权定价、参数化 PDE 求解与贝叶斯反问题把维数 d（证券/参数/未知函数自由度）推到数十上百，朴素网格积分数阶爆炸。信息基计算复杂性（IBC）本应给出"多少真实函数值才能得到可信高维积分"的结论，但许多可积性类的上界（稀疏网格/准蒙特卡洛）与下界仍差一个未定多项式因子，导致工程师无法判断增大采样是否真的按预期换精度。',
    progress: [
      '**Bakhvalov (1959)**: 建立网格积分误差-代价的渐近最优关系。',
      '**Bungartz–Griebel (2004)**: 稀疏网格给出维数依赖温和的上界，但离下界仍有间隙。',
      '**Novak–Woźniakowski (2008–2012)**: 系统给出多数 Sobolev/解析类的最坏情形复杂度下界，并明确下标出仍待闭合的指数。',
    ],
    obstacles: [
      '**对偶逼近与样本信息的最优分配**: 直接下界依赖非线性逼近（N 宽、Ne\', 采样集选择）的最优扭转逼近，其尖锐常数远未定型；上界又依赖某固定正交/准蒙特卡洛结构，上下界对 d 的幂次需同时对齐，属算法信息论中的长开放问题。',
    ],
    engineering_value:
      '若该指数闭合，工程师能得到一个可信的"误差-代价-维数"曲线：知道何时密码或网格值得、何时必须让步蒙特卡洛，从而为期权定价、参数化仿真的采样预算提供可证上界，而非依赖经验性收敛图。',
    formalization_notes:
      '判定偏解析：把下界化为对给定采样集的最优逼近误差下界（可用半定规划松弛数值佐证），上界化为显式求积规则误差分析；证明主体是函数空间插值论，形式化系数中等。',
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
      '合格答案为"选定布站的信息增益保证"而非单一算法：对给定测量模型 $\\Sigma$、候选布点 $S$ 与预算 $k$，交付一个多项式时间算法，其输出信息增益 $f(\\hat S)$ 满足带证下界 $f(\\hat S)\\ge c\\cdot f(S^*)$（对 D-最优/对数行列式类目标给出优于 $1-\\nicefrac{1}{e}$ 的 $c$ 或证明其不可能），并附三层残差总带：(1) **R_model**：把真实传感（观测噪声、通讯耦合）限制为该目标函数 $f$（子模/次模带约束）所引入的残差上界；(2) **R_param**：测量模型协方差 $\\Sigma$（观测噪声/标定）来自估测时，其不确定度对 $f$ 与保证比 $c$ 的输入残差上界（对 $\\Sigma$ 容差球内成立）；(3) **R_num**：对 $f$ 的估计与所涉行列式/特征值用区间算术封闭所引入的残差上界，使"$f(\\hat S)\\ge c\\cdot f(S^*)$"的保证不受三层残差侵蚀。判定通过的消费形式：给定候选布点与预算，直接得到"所选布点的信息增益不低于最优的 $c\\cdot100\\%$"这一不依赖实例调参的硬保证（连带证明该 $c$ 的最优性或不可能性），供环境监测/结构健康监测/主动采样做硬性布站决策。',
    certificate: {
      r_model: {
        bound: '把真实传感（观测噪声、通讯耦合）限制为该目标函数 f（子模/次模带约束）所引入的残差上界',
        derivation: '子模目标模型限制残差界',
      },
      r_param: {
        bound: '测量模型协方差 Σ（观测噪声/标定）来自估测时，其不确定度对 f 与保证比 c 的输入残差上界（对 Σ 容差球内成立）',
        derivation: 'Σ 容差球到信息增益保证的区间传播',
      },
      r_num: {
        bound: '对 f 的估计与所涉行列式/特征值用区间算术封闭所引入的残差上界',
        derivation: '区间算术封闭界',
      },
      total_band: '信息增益保证 c·f(S*) 不减损 ≤ R_model + R_param + R_num',
      certified_band: '所选布点相对最优的信息增益带证下界',
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
    last_verified: '2026-08-23',
    impact_domains: ['环境监测网络布设', '故障诊断传感冗余设计', '结构健康监测', '机器学习主动采样'],
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
      '航空结构健康监测、环境传感网与故障诊断都需要在预算 k 内挑出信息量最大的测量点。经典子模优化保证了单调情形的近期最优，但设备认证、到通讯载荷耦合等约束会破坏单调性，此类"带约束信息增益"的最优可证比既不等于既好也非已知硬，工程师因此只能用启发式并承担无界损失。',
    progress: [
      '**Krause–Singh–Guestrin (2008)**: 对 D-最优/对数行列式型目标给出多项式时间近似算法与广泛应用实验。',
      '**Michail et al. / Cochran (1973)**: 已知一般最大信息增益（含观测噪声）的 NP-困难，但精确近似难度阈值未划定。',
    ],
    obstacles: [
      '**非单调/耦合约束上的 LG 与贪心间隙**: 更紧的上界需证明一个在更广目标类上的信息论下界，且需一个能实例化为具体传感矩阵的最坏情形构型；目前只有数值实验，缺乏与可证明 NP-难度平行的近似-困难匹配。',
    ],
    engineering_value:
      '裸命题承诺的是**可证的保证比**：若存在优于单调贪心的可证比，布点/实验设计就能基于"所选布点的信息增益不低于最优的 c·100%"这一不依赖实例调参的硬保证来剪枝候选；若证明不存在多项式保证，则工业放弃追高质量精确解、改采有界损失近似。两者的共同点是大幅收敛当前靠经验图指导的信任边界，而不是把不确定性外包给一圈话术。',
    formalization_notes:
      '判定以数值-结构并重：把目标写为该矩阵族的行列式/特征值函数，近似比化为区间型次模函数的连续化上界；可先用半定规划验证具体实例上贪心与最优的间隙，再转成一般证明。',
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
      '合格答案为"降阶预测带硬性信任区间"而非统一昂贵界：对给定参数化问题与降阶基（秩 $r$），交付一个可计算、可核验的后验误差上界 $\\Delta(\\mu)$ 使 $\\|u(\\mu)-\\hat u_r(\\mu)\\|\\le\\Delta(\\mu)$，并附三层残差总带：(1) **R_model**：把在线全阶系统限制为降阶模型（固定基 $r$、截断算子）所引入的残差上界（含对非多项式非线性项连续性假设的显式依赖）；(2) **R_num**：残差范数/连续常数（SVD/特征值带）用区间/符号计算封闭所引入的残差上界，使 $\\Delta$ 既 sharp（在代表参数上接近真实误差）又 cheap（独立于全阶维数）；(3) 在线参数 $\\mu$ 与降阶基为精确给定的算法输入，**R_param≡0（无输入测量残差层，如实注明）**。判定通过的消费形式：给定在线参数 $\\mu$ 与降阶模型，直接得到"预测值 $\\hat u_r(\\mu)$ 外围的硬性置信区间 $\\|u-\\hat u_r\\|\\le\\Delta(\\mu)$"供数字孪生/手术/实时控制直接消费；若证明不存在可证且便宜的 $\\Delta$，则明确给出必须保留在线全阶校验的工况族。',
    certificate: {
      r_model: {
        bound: '把在线全阶系统限制为降阶模型（固定基 r、截断算子）所引入的残差上界（含对非多项式非线性连续性假设的依赖）',
        derivation: '降阶基/截断算子残差界',
      },
      r_param: {
        bound: '≡0（在线参数 μ 与降阶基为精确给定的算法输入，无输入测量残差层）',
        derivation: '参数精确给定',
      },
      r_num: {
        bound: '残差范数/连续常数（SVD/特征值带）用区间/符号计算封闭所引入的残差上界',
        derivation: '区间/符号计算封闭界',
      },
      total_band: '后验误差界 Δ(μ) ≤ R_model + R_num',
      certified_band: "‖u - u_hat_r‖ ≤ Δ(μ) 硬性信任区间",
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
    last_verified: '2026-08-23',
    impact_domains: ['数字孪生与实时仿真', '手术/驾驶实时决策', '柔性多体结构与 MEMS', '参数化设计空间探索'],
    proposer: 'K. Veroy & A. T. Patera',
    proposed_year: 2005,
    via: {
      label: 'Veroy, Patera, Certified real-time solution of the parametrized steady incompressible Navier–Stokes equations (2005)',
      url: 'https://doi.org/10.1002/fld.911',
    },
    related_problems: [],
    statement: `Given a parameter-dependent evolution or steady problem solved approximately by a reduced-order model with basis of rank $r$, find a computable quantity $\\Delta(\\mu)$ such that $\\|u(\\mu) - \\hat u_r(\\mu)\\| \\le \\Delta(\\mu)$, with $\\Delta$ both **sharp** (near the true error on representative $\\mu$) and **cheap** (evaluated in reduced cost, independent of full-order dimension). **Determine whether a unified, non-empirical $\\Delta$ exists that is simultaneously sharp and cheap for nonlinear operators with non-polynomial nonlinearities, or give the parametric counterexample where the residual-based bound necessarily overestimates by a super-constant factor, and a certified way to pay for it (adaptive basis enrichment).**`,
    origin:
      '数字孪生要求毫秒级在线仿真同时给出可信误差，但非线性项（对流、接触、材料非线性）会使标准残差型上界失真且代价偏高。降阶模型若没有后验证书，在线决策只能相信于经验图；问题在于能否在"可证sharp+廉价"上两全，直接决定工业实时仿真能否有硬性置信。',
    progress: [
      '**Veroy–Patera (2005)**: 参数化稳态层可积场给出可证且一致的后验上界，误差估计器代价可接受。',
      '**Chaturantabut–Sorensen (2010)**: DEIM 有效压缩非线性项，但上界理论明显松弛，误差估计器偏向保守。',
      '**近期超约化综述**: "sharpness vs. cost" 对于一般非线性算子的两难被反复指出，但无封闭结论。',
    ],
    obstacles: [
      '**非多项式非线性使残差上界的明确估计失效**: 依赖截断算子的谱常数，其显式上界退化为巨大或需要全阶计算；要同时达到立即可证与廉价，需对非线性算子族建立可转移的连续性界，属数值分析与算子插值之间的开放接口。',
    ],
    engineering_value:
      '若得到可证且便宜的误差界，数字孪生/手术计划/实时控制可把降阶预测连同其上界一起交予决策，达到"预测值外围有硬性置信区间"；负面结果则明确告诉工程界哪些场景必须保留在线全阶校验或自适应加基。',
    formalization_notes:
      '判定偏数值：误差界化为算子连续常数（可用 SVD/特征值带验证）乘残差范数的乘积，结合随机采样遗憾界作数值佐证；证明核心是残差投影两点式估计，系数较高形式化收益明显。',
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
    last_verified: '2026-08-23',
    impact_domains: ['自动驾驶/机器人安全控制', '电网与工艺自动化的可证明稳定', '航空作动器容错', '强化学习工业落地'],
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
      '感知-学习-控制舵手：自动驾驶、电网电压调节、机器人操作必须保证闭环稳定，但神经网络策略无法直接放样，只能用 SDP/MILP 松弛给出保守上界。当前松弛的松弛度随分区增大而大涨，导致安全域被大幅低估或计算爆炸；能否在不牺牲可靠性下把"松弛-真值"差距压到一个可控常数，直接决定学习控制可否无人工复核地落地。',
    progress: [
      '**Fazlyab et al. (2020)**: 用二次约束与 SDP 把 ReLU 网络策略纳入 LPV 框架给出可证稳定性判据。',
      '**Wang–Jungers (2021) 系列**: 对 ReLU 网络/切换系统给出更细的松弛与复杂度下界。',
      '**实证**: 网络越深分区越多，松弛域与真值域偏离越大，但缺严格刻画。',
    ],
    obstacles: [
      '**激活模式组合爆炸与松弛对位**: 每个活跃分区引入一次 SDP 大矩阵，且松弛常数随层数指数增长；需要一个能联合编码网络结构（活化模式、权重大小）的通用上界，同时给出对该通用界的最坏情形例子以验证下界不可改进。',
    ],
    engineering_value:
      '若把"松弛-真值"差距压到已知可控常数，工程师复核安全证明时只需检查预设松弛上界，而不必全阶验证每种工况；负面结果则给出可度量的"必须在线校验"工况族，防止对 LBD 证书的盲目外推——两者的共同点是给学习控制提供可审计的信任边界。',
    formalization_notes:
      '判定偏数值-局部：把 Lyapunov 条件化为逐分区 LMI/SDP，其上界松弛常数由活化模式权重范数给出，可用随机搜索验证最坏分区；证明主体是把松弛差统一到网络 Lipschitz/谱谱常数界，形式化收益中等。',
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
      '合格答案为"可核验混合率判据 + 三层残差总带"而非精确指数本身。对给定的控制代价预算 $E=\\int_0^T\\|u\\|_{H^s}^2\\,dt$ 与目标抹平尺度（如衰减到 $\\|\\theta\\|_{H^{-1}}\\le\\epsilon$），交付下述残差各带的界与证明后合成总带：(1) **R_model**：把被动标量的有黏物理（有限 Péclét/扩散）理想化为无黏 $\\partial_t\\theta+u\\cdot\\nabla\\theta=0$ 所引入的残差上界（显式含物理黏性对混合上限的量级贡献）；(2) **R_num**：对某一可核验速度场构造（上游显式层流场或其数值实现）求解该受控模型时，因离散/区间算术引入的残差上界；(3) 参数（控制代价预算、目标尺度）为设计者给定的精确输入，**R_param≡0（无输入测量残差层，如实注明）**。判定通过的消费形式：给定泵送能量，直接得到"能把标量抹平到 $\\epsilon$ 的最小能量预算落在 $[E_\\lo,E_\\hi]$ 且总带 $E_\\hi-E_\\lo\\le$ R_model+R_param+R_num"的可核验区间，供微流控与燃烧掺混尺动设计直接消费而无需 DNS 重算。',
    certificate: {
      r_model: {
        bound: '把被动标量的有黏物理（有限 Péclét/扩散）理想化为无黏输运方程所引入的残差上界（含物理黏性对混合上限的量级贡献）',
        derivation: '无黏理想化残差界（含有限黏性修正）',
      },
      r_param: {
        bound: '≡0（控制代价预算与目标尺度为设计者给定的精确输入，无输入测量残差层）',
        derivation: '参数精确给定',
      },
      r_num: {
        bound: '对可核验速度场构造求解该受控模型时，因离散/区间算术引入的残差上界',
        derivation: '离散/区间算术封闭界',
      },
      total_band: 'E_hi - E_lo ≤ R_model + R_param + R_num',
      certified_band: '[E_lo, E_hi]（抹平到 ε 的最小能量预算）',
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
    last_verified: '2026-08-23',
    impact_domains: ['微流控混合器设计', '大气/洋流输运模型', '燃烧与掺混工艺', '药物递送中的瞬态混合'],
    proposer: 'L. Onsager; 现代陈述归 A. Shnirelman 与 A. Kiselev',
    proposed_year: 1949,
    via: {
      label: 'Shnirelman (1985), On the evolution of passive scalar equilibria; Kiselev–Nazarov–Shterenberg (2008)',
      url: 'https://www.ams.org/journals/era/2008-14-06/S1079-6762-08-00179-0/',
    },
    related_problems: [],
    statement: `Advect a passive scalar $\\theta$ by an incompressible velocity field $u$ ($\\partial_t \\theta + u \\cdot \\nabla \\theta = 0$) with control cost $\\int_0^T \\|u\\|_{H^s}^2 \\, dt$. Let the mixing rate be measured by how fast a Sobolev-type functional decays (e.g., $\\|\\theta\\|_{H^{-1}}$ or $\\|\\theta_{\\text{high}}\\|$). **Determine — for the critical smoothness $s$ — the sharp exponent $e$ such that the guaranteed mixing efficiency is $\\Theta(\\text{cost}^{-e})$, with an explicit admissible velocity field attaining the exponent (upper bound) and a matching lower bound via the relevant conservation law (e.g. a companion estimate from anomalous dissipation).**`,
    origin:
      '微流控、搅拌与大气输运都需要用有限能量把标量快速搅匀，而标量高效混合时是否伴随反常耗散、所需能量随混合率的指数关系仍拒绝精确闭合。确立该指数让工程师知道给定能量预算下能把多细的尺度抹平，直接决定混合器设计与燃烧掺混的三维涡级结构。',
    progress: [
      '**Shnirelman (1985)**: 给出无界能量下的混合构造，指出能量-混合率权衡的骨架。',
      '**Crippa–De Lellis / Colombo–Crippa (2014 前后)**: 对常能量无黏主动确定性/随机场给出混合率上界并负例。',
      '**Seis/ Cotter 数值实验**: 支持某指数猜想，但严格上下界未对齐。',
    ],
    obstacles: [
      '**混合率与耗散的对偶不穿过闭合**: 下界依赖一条守恒律型不等式（如标量梯度增长的高速极限），上界依赖能精确受控的层流场构造；两者对控制成本的依赖需同时调到同一指标，正好落在最优输运-湍流能级串交接处。',
    ],
    engineering_value:
      '该指数定义"给定泵送能量→可抹平的标量最小尺度"，是微流控混合器尺寸与流速直接算成本、燃烧/大气模型选择次网格闭合的唯一理论线。本榜的价值不是条件性的指数，而是一个把模型层（有黏修正）与数值层（离散/区间）残差显式区分（本题参数为设计给定，R_param≡0）并合成总带的**可核验混合预算区间**，使能量预算规划与混合器尺度设计不再靠经验拟合，而是直接消费带证区间。',
    formalization_notes:
      '判定偏分析：下界化为对一类速度场的最优输运上界（用插值/对偶证明），上界化为显式层流场的速度场构造与能量计数；需精细的泛函分析，形式化系数偏低。',
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
    last_verified: '2026-08-23',
    impact_domains: ['抗药性演化预测', '肿瘤克隆演化建模', '物种入侵与生态网络', '合成生物学自稳定种群'],
    proposer: 'E. Lieberman, C. Hauert & M. A. Nowak',
    proposed_year: 2008,
    via: {
      label: 'Lieberman, Hauert, Nowak, Evolutionary dynamics on graphs, Nature 433 (2005) 312–316',
      url: 'https://doi.org/10.1038/nature03204',
    },
    related_problems: [],
    statement: `For the standard Moran process on an $N$-vertex graph, a beneficial mutant of fitness $r>1$ fixes with a probability that depends on the graph. Let the **amplification ratio** be the supremum over (connected, and possibly directed) graphs of the fixation probability relative to the complete-graph baseline. **Determine the sharp value (or the tightest universal upper bound) of this amplifying ratio as a function of population size $N$ and fitness $r$, and exhibit a graph attaining it exactly (or prove none does).** In particular, settle for which $r$ there are graphs that fix virtually surely yet the Moran-bound excludes them at any stated $\\varepsilon$.`,
    origin:
      '传染病/抗药性传播与社会演化都抽象为固定概率受网络结构调制：是结构放大还是抑制选择决定了设计干预（隔离/监测）能多大程度抬高或压低有利突变固定。闭合该极值告诉流行病学家"结构最多把选择加强到多快"，避免永远追逐不存在的最优拓扑。',
    progress: [
      '**Lieberman–Hauert–Nowak (2005)**: 建立图上 Moran 过程与 amplification / suppression 概念。',
      '**Nowak 实验室 / 别的研究组 (2005–2020)**: 对各类图（热点、星图、有向超图）给出若干放大家族并数值支持。',
      '**Houchmandzadeh–Vallade / Diaz-Loving 等的族类构造**: 证明极值放大界随 r 趋于恒定，但全局问题上界未统一闭合。',
    ],
    obstacles: [
      '**通用上界的图论转动力学**: 把任意图的固定概率统一压到一个仅靠 N、r 的上界，需要引入图上的调和测度与说谎的守恒结构，尚无同时涵盖有向环的通用引理；特例构造又与通用界各自成立，缺中介引理来匹配。',
    ],
    engineering_value:
      '闭合后，抗药性/肿瘤/物种建模可给出结构化种群的"理论最大选择加速度"，协议对比单调板与网络模型时有硬性上限做校准；反向抑制型结论直接指导隔离策略的失效边界。',
    formalization_notes:
      '判定偏分析-离散：把固定概率写为图上调和函数与生成函数之比，上界化为对图度分布的变分不等式，个别实例用枚举/整数规划验证；证明用图论+泊松化技巧，形式化收益较好（该领域已有部分在 Lean/Isabelle 验证）。',
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
    last_verified: '2026-08-23',
    impact_domains: ['合成生物学鲁棒电路设计', '代谢通量调节元件', '信号通路设计抗环境扰动', '药物作用靶点鲁棒性'],
    proposer: 'G. A. Shinar & M. Feinberg',
    proposed_year: 2010,
    via: {
      label: 'Shinar, Feinberg, Structural sources of robustness in biochemical reaction networks, Science 327 (2010) 1389–1391',
      url: 'https://doi.org/10.1126/science.1184453',
    },
    related_problems: [],
    statement: `A reaction network exhibits absolute concentration robustness (ACR) in a species $X$ if in every positive steady state the concentration of $X$ is the same, independent of total mass. For the class of mass-action systems, **find a criterion, readable directly from the reaction graph (stoichiometry + rates), that is both sufficient and necessary for ACR in as wide a subclass as possible — or prove for a designated wide subclass that no such finite, purely structural certificate exists (requiring algebraic parameter search), giving a completeness statement that bounds what can be certified "from the wiring alone".**`,
    origin:
      '合成生物学的负反馈/前馈环路需要设计"无论细胞内总物质量如何都能固定输出浓度"的鲁棒模块；ACR 由 Shinar–Feinberg 用图形判据识别出可证来源，但其完备性（"哪些非显然网络也一定 ACR"）只有部分判据、无止境台阶。闭合后电路设计工具能自动、无假设地判断一个给定网络是否 ACR，而无需逐参数仿真。',
    progress: [
      '**Shinar–Feinberg (2010)**: 给出"同侧对偶浓度"的图形充分判据，证明间歇循环的 ACR 来源。',
      '**Pérez-Millán / Gao et al. (2012–2018)**: 推广到多种反馈网络与必要判据方向，CRN ACR IVP 框架。',
      '**开放**: 对一般 mass-action 网络，结构性充分与必要判据之间仍有断裂，完备性问题未定。',
    ],
    obstacles: [
      '**代数条件 vs 图条件的交接**: ACR 的精确刻画会用参数代数的零点理想（如某项必须恒为零），把其翻译成纯网络拓扑条件丢失完备性；要让判据"纯结构→完备"，需在某种守恒/动力系统族内证明代数条件可被封入有限模式，属 CRNT 与计算代数间。',
    ],
    engineering_value:
      '一个"只看接线就能判断"的 ACR 判据让合成生物学工具自动化筛选稳健输出电压的模块、代谢设计判断通路抗质量扰动的硬边界；完备性声明定量划定何种场景必须退而求参数代数检查，避免假状态依赖的伪鲁棒判断。',
    formalization_notes:
      '判定偏代数-结构性：ACR 化为参数多项式理想中特定变量的常数性（用 Gröbner/立柱判定部分类），图形判据的证明可机械转成多项式环的 membership 证明，该领域已有显著形式化基础，形式化收益高。',
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
      '合格答案为"散热裕量判定"而非精确曲线：对某一具体自然对流散热几何与给定发热量、环境与布置工况，交付 Nusselt 数的可核验总带 [\\underline{Nu},\\overline{Nu}]，并附证明该带同时覆盖三层残差——(1) **R_model**：把真实可压缩气体动力学限制为 Boussinesq/边界层（含辐射衰减项）带来的残差上界；(2) **R_param**：发热量、环境温度/流速来自测量/标定时，其不确定度传播到总带的输入残差上界（对测量区间内所有工况成立）；(3) **R_num**：DNS/区间算术求解该受控模型时网格、时间步与 SDP 对偶间隙的残差上界，三者各自附可复核常数且总带满足 $\\overline{Nu}-\\underline{Nu}\\le$ R_model+R_param+R_num。判定通过的消费形式：给定发热量下，翅片峰值温度是否低于裕量上限由带证区间直接给出，无需 DNS 重算。',
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
    last_verified: '2026-08-24',
    impact_domains: ['海洋与大气热输运建模', '核反应堆与电子散热设计', '气候/岩浆地幔对流预测', '湍流极限标度的严谨约束'],
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
        note: '总带继承（方向二）：mp-037 的渐近 Ra^{1/3} 上界骨架被 mp-041 的工程散热裕量证书继承。本题为上游——若 mp-037 的外包被收紧，下游 mp-041 的 R_model 上界随之收窄、总带更紧；若 mp-037 的核心被反例击穿，则 mp-041 借用的上界骨架失效、裕量判定同时失效。下游带的可信度链入本题的上界证书。',
      },
    ],
    statement: '考虑两平板间、高温在下低温在上、温差驱动的 Boussinesq 对流，Nusselt 数 $Nu = \\langle q\\rangle/(\\kappa\\Delta T/h)$ 是被事实所约束的上限函数 $\\mathrm{Nu}(Ra,Pr)$。Howard 1963 证明 $Nu\\le (\\tfrac{3}{64})^{1/2}Ra^{1/2}$，Doering–Constantin 1996 以 background 方法改进前因子为 $Nu\\le\\tfrac16 Ra^{1/2}$；但无论怎样优化 background 场，所有已知严格证法都停在 $Ra^{1/2}$ 标度（no-slip 情形目前最佳常数 $Nu\\le 0.02634\\,Ra^{1/2}$），而数值/DNS 证据一致指向更大 $Ra$ 时 $Nu\\sim Ra^{1/3}$（Malkus–Howard 边界层边缘稳定论断）。本题要交付的可核验产物为：对给定的 $Ra,Pr$ 与边界类型，给出一个带可验证常数的上界 $\\overline{\\mathrm{Nu}}(Ra,Pr)$ 及其"外包"证明，并使其在 $Ra\\to\\infty$ 时的标度指数严格优于 $1/2$，或无侧壁缝隙地证明不可能；请问是否存在程序化的外包论据，能对一族递增的 $Ra$ 成批产出随 $Ra$ 严格下降的归一化常数 $c(Ra)=Nu/Ra^{1/3}$ 的逐项可独立核验的上界/下界对，并用区间算术把它们整体包围在 $[\\underline{c}(Ra),\\overline{c}(Ra)]$ 中且 $\\overline{c}-\\underline{c}\\to 0$？',
    certificate: {
      r_model: {
        bound: 'Boussinesq/边界层近似相对真实可压缩气体动力学的残差上界（含辐射衰减项）',
        derivation: 'Boussinesq 近似的显式残差界',
      },
      r_param: {
        bound: '发热量、环境温度/流速测量不确定度传播到 Nu 上界的输入残差',
        derivation: '测量区间内所有工况成立的传播界',
      },
      r_num: {
        bound: 'DNS/区间算术求解受控模型时网格、时间步与 SDP 对偶间隙的残差上界',
        derivation: '区间算术与 SDP 对偶的零/小间隙证明',
      },
      total_band: 'Nu_hi - Nu_lo ≤ R_model + R_param + R_num',
      certified_band: '[Nu_lo, Nu_hi]',
    },
    engineering_deliverables: ['Nu(Ra,Pr) 上界证书', '散热设计保守裕量界'],
    origin:
      'Rayleigh–Bénard 对流是海洋、大气、地幔与工业散热中热输运的标准模型，其核心工程问题是把平均热流 $Nu$ 表达成 $Ra$ 的函数，用于设计散热器、预测边界层通量与气候模型中的热量交换。但把 $Nu(Ra)$ 变成严格不等式而非经验拟合，就要在无量纲参数全空间中提供不依赖人为闭合假设的、可直接饱含安全裕量的上界——这正是 background/变分法要回答的问题：既给出工程可用的保守上界，又逼近真实物理选择的 $1/3$ 标度。能在机器上核验的外包数值证书，等价于把这一经典问题转化为一个"可审计算"的优化问题。',
    progress: [
      '**Howard (1963)**: 首次给出严谨上界 $Nu\\le(\\tfrac{3}{64})^{1/2}Ra^{1/2}$，确立 $Ra^{1/2}$ 上界标度。',
      '**Doering & Constantin (1996)**: background 方法改进前因子为 $Nu\\le\\frac16 Ra^{1/2}$，并成为可计算框架。',
      '**Plasting & Kerswell (2003)**: 最优化 background，进一步压低 $Ra^{1/2}$ 前因子（no-slip $0.02634$）。',
      '**Choffrut, Nobili & Otto (2016)**: 当 $Pr\\gtrsim Ra^{1/3}$ 时得到 $Nu\\lesssim Ra^{1/3}$（含对数修正），突破 $1/2$ 障碍。',
      '**Ding & Kerswell (2020)**: 证明确有一类约束下 background/变分法已被"穷尽"，$Ra^{1/2}$ 上界障碍在 Levy 意义下无法用该框架逾越。',
    ],
    obstacles: [
      '**$Ra^{1/2}$ 上界障碍**: 现有变分/background 方法无法突破 $Ra^{1/2}$ 标度，而数据指向 $Ra^{1/3}$；两者差距（$1/6$ 次幂）正是缺少新动力学输入的体现，目前不存在会收敛到 $1/3$ 的严格上界技术。',
      '**边缘稳定启发式未被证明**: Malkus–Howard 关于边界层保持边缘稳定从而导出 $1/3$ 的论断是非严格的，缺乏可量化的错误边界，难以直接转成外包证书。',
    ],
    engineering_value:
      '本榜刻意把目标从"逼近 $Ra^{1/3}$ 的渐近标度"收窄为"对某一具体散热几何交付瞬时裕量判定"。这样价值就从**条件性**转为**可消费**：工程师不再需要等证书逼近真实曲线，而是直接消费"特定发热量下峰值温度是否越限"这一带证区间；模型层（Boussinesq 近似）与数值层（DNS/区间）残差被显式分开并合成总带，承担裕量设计时每个误差来源都可审计。渐近 $1/3$ 上界仍作为 open 的生物学目标保留在 statement 中，但不再是本溢价证书的交付前提。',
    formalization_notes:
      '数值迁径最可行：把 background-field 上界问题表述为凸/半定规划，并用区间算术 + 有理数 SDP 对偶给出 $\\overline{Nu}$ 的刚性包围与零间隙证明；对 $Ra\\to\\infty$ 的族则用对偶间隙分解与渐近展开外包。',
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
      '合格答案为"二维局域自旋可模拟性判定"而非一般面积律定理：对某一具体二维、均匀、常数能隙的局域自旋哈密顿量，交付纠缠熵对子区域面积的可核验上界（面积律）或可证的非面积律反例信号，并附三层残差总带——(1) **R_model**：把真实（可能带阻挫/任意局域耦合）哈密顿量限制为"常数能隙局域"Hamiltonian 类所引入的残差上界（对 $\\Delta$、局域维度显式限定）；(2) **R_num**：能隙下界的可验证外包（区间/符号计算）与 AGSP 投影收缩率的区间估计所引入的残差上界，二者独立可复核且合成总带界；(3) 目标哈密顿量为精确给定的物理系统输入，**R_param≡0（无输入测量残差层，如实注明）**。判定通过的消费形式：给定具体 2D 哈密顿量与能隙证据，直接得到"该基态能否被 iPEPS 以多项式边界长度高效压缩（面积律）或必然超对数（反例）"的可核验判定，服务张量网络数值的可信度与误差上界。',
    certificate: {
      r_model: {
        bound: '把真实（可能带阻挫/任意局域耦合）哈密顿量限制为常数能隙局域 Hamiltonian 类所引入的残差上界（显式限定 Δ 与局域维度）',
        derivation: '常数能隙局域类限制残差界',
      },
      r_param: {
        bound: '≡0（目标哈密顿量为精确给定的物理系统输入，无输入测量残差层）',
        derivation: '参数精确给定',
      },
      r_num: {
        bound: '能隙下界的可验证外包（区间/符号）与 AGSP 投影收缩率的区间估计所引入的残差上界',
        derivation: '区间/符号外包封闭界',
      },
      total_band: '纠缠熵面积律上界 ≤ R_model + R_num',
      certified_band: 'S_A ≤ c·|∂A|（面积律界）或 sqrt(n) 型反例信号',
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
    last_verified: '2026-08-24',
    impact_domains: ['量子多体可模拟性/张量网络方法', '拓扑物相与纠缠分类', '量子哈密顿复杂度', '凝聚态基态结构'],
    proposer: 'M. B. Hastings',
    proposed_year: 2007,
    via: {
      label: 'Eisert, Cramer & Plenio, Colloquium: Area laws for the entanglement entropy, Rev. Mod. Phys. 82 (2010) 277, doi:10.1103/RevModPhys.82.277',
      url: 'https://doi.org/10.1103/RevModPhys.82.277',
    },
    related_problems: [],
    statement: '面积律猜测断言：任意常数能隙、局域相互作用的格点哈密顿量的基态，对任意二分区域 $A$ 的纠缠熵 $S_A$ 至多随界面面积 $|\\partial A|$ 线性增长。Hastings 2007 证明了一维情形；但之于二维或更高维的一般（有能隙、可带阻挫）系统，面积律仍是开放。Movassagh–Shor 2016 构造了 1D 的平方根增强（超对数、体积律）反例模型，显示了"禁区"的边界。本题可验证产物：对给定的一族二维、有能隙局域哈密顿量，交付纠缠熵的可审计上界（面积律）或可证的反例信号（非面积律），并附可复核的能隙与 Lieb–Robinson/AGSP 常数；请问是否存在可判定的判据（如局部能隙下的 AGSP 收缩率），能在机器上对给定 2D 哈密顿量输出"面积律成立该量级/或必然超对数"两端之一的证书，且对族内递增尺寸给出收敛的 $S_A/|\\partial A|$ 比值带？',
    origin:
      '面积律与张量网络可模拟性直接挂钩：满足面积律的基态才能被 DMRG/MPS-style 方法高效压缩，进而支撑量子相、拓扑物态分类与量子哈密顿复杂度的理论。二维的开放是因为 Lieb–Robinson 与 AGSP 工具在 $d>1$ 无法给出与能隙无关的指数压缩；能把它变成"机器可审计"的判据，将同时服务于凝聚态数值可靠性（给仿真误差一个上界）与哈密顿复杂度（给出可判定的复杂性分类边界）。',
    progress: [
      '**Hastings (2007)**: 一维有能隙系统基态满足面积律，给出对数修正界。',
      '**Bravyi–Hastings–Verstraete / Arad–Kitaev et al. (AGSP)**: 以类 AGSP 技术改进一维界并对能隙 tight，部分小常数被精确化。',
      '**Cho (2014) 与近期 2D 进展**: 在"局部有能隙"或"无阻挫"等附加假设下证明 2D 面积律，但一般有能隙 2D 仍开放。',
      '**Movassagh & Shor (2016)**: 构造 1D 局域哈密顿量，纠缠熵按 $\\sqrt{n}$（超对数、体积律）增强，构成重要的反例端点。',
    ],
    obstacles: [
      '**工具无法上维**: 一维证明依赖 Lieb–Robinson 的输入维压缩与 AGSP 收缩率，在 $d=2$ 无法给出对能隙独立的指数界，一般有能隙情形缺乏可判定的判据。',
      '**无显式常数/可复核误差**: 现有上界（即使成立）的常数依赖复杂且随维数爆炸，难以转成机器可审计、可独立复核的证书。',
    ],
    engineering_value:
      '本榜把目标从"证明一般 2D 面积律"收窄为"对给定具体哈密顿量判定基态可压缩性"，价值从**条件性**转为**可消费**：工程师不再被动等待一般定理，而是直接消费"该基态能否以多项式边界长度被 iPEPS 压缩"这一带证判定，并把模型层（常数能隙局域类的限定）与数值层（能隙外包/AGSP 区间估计）残差显式分开合成总带，为张量网络仿真的可信度提供可审计的误差上界——现有实践靠数值收敛，本榜给它们一层可核验的支撑而非静默假设。',
    formalization_notes:
      '数值路径可行：用能隙下界的可验证外包 + AGSP 投影收缩率的区间估计，把面积律转成对有限格的显式 $S_A\\le c|\\partial A|$ 的证明；对反例则以可证的非面积律放大信号（$\\sqrt{n}$ 型）给出。',
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
      '合格答案为"最坏情形通信轮数的可核验证书"而非单一最优算法：对给定连通 $n$ 节点图 $G$，交付精确量化平均共识所需最坏轮数 $T^*(G,n)$ 的可核验上界（连带可证下界），使该收敛时间被一个受控括号包围，并附三层残差总带：(1) **R_model**：把真实分布式系统限制为离散量化、有限带宽、无全局知识的信息模型所引入的残差上界（显式含对同步/消息传递假设的依赖）；(2) **R_num**：对算法轮数估计与随机游走混合时间/质量迁移势的计算用区间/精确算术封闭所引入的残差上界；(3) 网络 $G$、带宽与时延为精确给定的系统输入，**R_param≡0（无输入测量残差层，如实注明）**。判定通过的消费形式：给定网络 $G$、带宽与时延预算，直接得到"最少通轮数落在 $[T_\\lo,T_\\hi]$"的可核验区间，供传感网/时钟同步/负载均衡决定采样与控制在多少轮内换取可审计的精确量化平均，替代当前经验轮数余量。',
    certificate: {
      r_model: {
        bound: '把真实分布式系统限制为离散量化、有限带宽、无全局知识的信息模型所引入的残差上界（含对同步/消息传递假设的依赖）',
        derivation: '离散量化信息模型限制残差界',
      },
      r_param: {
        bound: '≡0（网络 G、带宽与时延为精确给定的系统输入，无输入测量残差层）',
        derivation: '参数精确给定',
      },
      r_num: {
        bound: '对算法轮数估计与随机游走混合时间/质量迁移势的计算用区间/精确算术封闭所引入的残差上界',
        derivation: '区间/精确算术封闭界',
      },
      total_band: '共识轮数括号 ≤ R_model + R_num',
      certified_band: '[T_lo, T_hi]（最少通轮数）',
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
    last_verified: '2026-08-24',
    impact_domains: ['物联网与边缘传感网数据融合', '分布式时钟同步与事件触发估计', '处理器网络负载均衡', '多智能体编队共识'],
    proposer: 'A. Kashyap, T. Başar & R. Srikant',
    proposed_year: 2007,
    via: {
      label: 'Kashyap, Başar, Srikant, Quantized consensus, Automatica 43(7):1192–1203 (2007)',
      url: 'https://doi.org/10.1016/j.automatica.2007.01.002',
    },
    related_problems: [],
    statement: `Let a connected graph $G=(V,E)$ hold integer initial values $c_i\\in\\mathbb Z$; agents exchange states only along edges and only in discrete (quantized) rounds, so each transmission carries an integer. A quantized averaging scheme must drive every node to a value within one step of the exact average $\\bar c=\\sum_i c_i/n$ and then stop with a distributed certificate. **Determine, for an arbitrary connected $G$ on $n$ nodes, the optimal worst-case number of communication rounds $T^*(G,n)$ to reach finite-time quantized average consensus, and construct a distributed algorithm attaining it (matching the lower bound up to constants) — or give a network class on which every such algorithm requires a certified number of rounds that beats the known polynomial bounds by a stated factor.**`,
    origin:
      '真实通信链路带宽与内存有限，传感器融合、时钟同步和处理器负载均衡都只能交换离散量化值而非实数，因此"实值平均"理想化不可落地。量化平均要既保质量守恒（和不变）又能在有限轮内以离散值达一致，但其最坏收敛时间在一般拓扑上只有相互分离的多项式界，缺少精确闭合；闭合它让工程师知道给定网络规模和带宽下分布式平均值能在多少轮内拿到可审计的最终值。',
    progress: [
      '**Kashyap–Başar–Srikant (2007)**: 提出量化平均问题的随机化算法，对完全图与线型图给出收敛时间界，并指出一般图上的长期开放困难。',
      '**El Chamie–Liu–Başar (2014)**: 刻画量化平均的有限时间收敛与邻域循环现象，给出邻域大小的紧界。',
    ],
    obstacles: [
      '**质量守恒与速率-延迟的耦合**: 达到精确离散均值要求在整数格上保持总和不漂移，同时每个节点独立判断停止；把收敛轮数压到谱/拓扑参数对应的信息下界需要同时控制"质量迁移速度"与"停止判据的局部完备性"，二者在一般图上互相制约，缺一个统一的（质量守恒+局部停止）下界论证。',
    ],
    engineering_value:
      '闭合后给出"有限带宽下分布式平均的最少通信轮数"这个可直接消费的数字：工程师据此决定传感网采样/控制周期是否需要放宽为近似平均，或在给定时延预算下判断精确量化平均是否可行。产出是收敛轮数的证书化上界（与可证明的最坏网络实例下界），替代当前仅按经验设置的轮数余量。',
    formalization_notes:
      '判定偏数值-结构：把收敛轮数化为整数格上的随机游走相遇时间与质量迁移势函数的组合，下界用随机游走混合时间论证；可先用指定拓扑上的仿真验证算法与下界间隙，再转成一般上界，形式化收益中等。',
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
      '对一具体自然对流翅片散热器（给定发热量、环境与倾斜角工况），交付 Nusselt 数总带 $[\\underline{Nu},\\overline{Nu}]$ 及证明其覆盖三层残差：(1) **R_model**：Boussinesq/边界层（含辐射）近似相对真实可压缩气体动力学的残差上界；(2) **R_param**：发热量、环境温度/流速来自测量/标定时，其不确定度传播到总带的输入残差上界（对测量区间内所有工况成立）；(3) **R_num**：DNS/区间算术求解该受控模型时网格、时间步与 SDP 对偶间隙的残差上界。三层各自附可复核常数且满足 $\\overline{Nu}-\\underline{Nu}\\le$ R_model+R_param+R_num。判定应能据此直接给出"给定发热量下翅片峰值温度是否低于裕量上限"，而非依赖 DNS 重算或经验相关式的统计外推。',
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
    last_verified: '2026-08-24',
    proposer: 'A. Bejan',
    proposed_year: 1984,
    via: {
      label: 'Bejan, Convection Heat Transfer, 4th ed., Wiley, 2013（自然对流相关式与尺度的基准参考）',
      url: 'https://doi.org/10.1002/9781118671627',
    },
    impact_domains: ['功率电子与 LED 散热设计', '被动式自然冷却系统', '数据中心机柜热管理', '航空航天被动热控'],
    related_problems: [
      {
        id: 'mp-037',
        relation: 'depends_on',
        note: '总带继承（方向二）：mp-041 的散热裕量总带依赖 mp-037 给出的 Nu 上界体系。mp-037 是上游——若其 Ra^{1/3} 标度上界被收紧，则 mp-041 的 R_model 上界随之收窄，总带更紧；若 mp-037 的核心外包被反例击穿，则 mp-041 借用的上界骨架失效，裕量判定同时失效。换言之，要信任本裕量得先信 mp-037 的渐近上界证书。',
      },
    ],
    statement: `一具体翅片散热器在被动自然对流下散热，发热量 $Q$、环境与布置已定。工程师要的回答不是曲线而是裕量：翅片峰值温度 $T_{max}$ 是否低于热设计上限。本题要交付的可核验产物是 $Nu$ 的一个总带 $[\\underline{Nu},\\overline{Nu}]$，并附三层残差各自的界与证明：(1) R_model——Boussinesq/边界层近似相对真实可压缩气体动力学的模型残差上界；(2) R_param——发热量、环境温度/流速来自测量/标定时的输入不确定度残差上界；(3) R_num——对该受控模型求解放置网格/时间步/SDP 对偶的数值残差上界。三者满足 $\\overline{Nu}-\\underline{Nu}\\le$ R_model+R_param+R_num 且逐层可独立复核。$T_{max}$ 的裕量判断由带直接给出而无需重算。`,
    certificate: {
      r_model: {
        bound: 'Boussinesq/边界层近似相对真实可压缩气体动力学的模型残差上界（骨架借用 mp-037 的渐近外包）',
        derivation: 'mp-037 的 Ra^{1/3} 标度上界 + Boussinesq 残差界',
      },
      r_param: {
        bound: '发热量、环境温度/流速测量不确定度传播到总带的输入残差上界',
        derivation: '测量区间参数传播到 Nu 带的区间映像',
      },
      r_num: {
        bound: '网格、时间步与 SDP 对偶间隙的数值残差上界',
        derivation: '区间算术与 SDP 对偶的零/小间隙证明',
      },
      total_band: 'Nu_hi - Nu_lo ≤ R_model + R_param + R_num',
      certified_band: '[Nu_lo, Nu_hi]',
    },
    engineering_deliverables: ['散热器峰值温度裕量判定', '热设计评审带证区间'],
    origin:
      '功率电子与 LED 灯组普遍依赖被动散热，裕量设计长期靠经验相关式或昂贵 DNS 交叉验证。若能把"这条仿真可信度多高"换成一个低成本、可复验、且明确分离模型/输入/数值三层残差的带证区间，工程师便能在一次计算内拿到"峰值温度是否越限"的回答，并把信任从基准对准迁移到逐题可核验的总带。',
    progress: [
      '**经典相关式体系（Morgan, Raithby–Hollands 等）**: 给出自由对流 $Nu(Ra)$ 的经验相关式，精度有限且无残差界。',
      '**Rigorous computation 工具**: 面向热输运的区间算术与 SDP 对偶上界已在平板上得到部分常数（参见边界层上界文献），但尚未落到具体散热器几何的三层总带。',
    ],
    obstacles: [
      '**三层残差必须同时装箱**: 现有方法要么只给模型误差的严格界（远离工程几何），要么只靠数值收敛估计数值误差，缺把它们合成单带的分层证明；R_param 一层在工程实践中常被静默吞掉，必须显式列为不确定度传播项。',
      '**几何依赖**: 翅片三维几何使严格上界依赖问题变得繁杂，需在可复核常数与几何逼近程度之间取一个工程可接受的平衡。',
      '**继承依赖**: R_model 上界骨架借用 mp-037 的渐近外包结果，因此本证书的有效性链入 mp-037 的 Ra^{1/3} 标度上界是否成立。',
    ],
    engineering_value:
      '这是"可消费而非条件性"的样板：产出"给定发热量下峰值温度是否低于裕量上限"这一可直接使用的区间判断。它让被动散热工程师不必再做昂贵 DNS 就有带证的裕量结论，且把仿真可信度从"基准对准"换成"可复验总带"，一次计算即可上市热设计评审。',
    formalization_notes:
      '数值路径现实：该受控模型的 DNS 可做区间化，把 $Nu$ 上/下界改成区间算术与对偶的零/小间隙证明（R_num）；模型层用 Boussinesq 对可压缩动力学的显式残差上界对接（R_model）；输入参数测量不确定度通过区间参数传播到总带（R_param）。形式化投入中等，收益是给散热设计一个可审计的裕量证书，且其有效性通过 depends_on 链入 mp-037 的渐近上界证书。',
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
      '合格答案为"稳态可判定性证书"：对一具体催化反应网络与给定速率常数测量区间（本身带测量残差）与反应器工况，交付一个可核验的分类判据——该工况下是否恰有一个吸引稳态，且目标中间体浓度必然落入总带 [c_lo,c_hi]。带需同时覆盖三层残差：(1) **R_model**：把真实活度走离理想质量作用（活度系数≠浓度）引入的残差上界；(2) **R_param**：速率常数与工况参数来自测量时，其不确定度传播到 [c_lo,c_hi] 与稳态判别边界的输入残差上界（对测量区间内所有 $k$ 成立）；(3) **R_num**：稳态求根与区间算术的残差上界，三者合成使总带宽 ≤ R_model+R_param+R_num 且逐层可复核。判定通过的消费形式：给定催化反应器工况与测量不确定度，直接得到"该中间体浓度必落在此区间、系统不会在吸引稳态间跳变"的可核验声明。',
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
    last_verified: '2026-08-24',
    proposer: 'M. Feinberg',
    proposed_year: 1987,
    via: {
      label: 'Feinberg, Chemical reaction network structure and the stability of complex isothermal reactors, Chem. Eng. Sci. 42(10):2229–2268 (1987)',
      url: 'https://doi.org/10.1016/0009-2509(87)80106-7',
    },
    impact_domains: ['催化与反应器设计', '多稳态风险预警', '过程安全与动态控制', '生物化学信号网络'],
    related_problems: [
      {
        id: 'mc-005',
        relation: 'depends_on',
        note: '总带继承（方向二）：mc-030 的稳态浓度带依赖 mc-005 的速率常数结构可辨识性分类。mc-005 是上游——它判定从可观测子集何时能分辨速率常数；若其可辨识性分类被收紧，mc-030 的测量区间普适性更可靠、带更可信；若 mc-005 判定该测量方案不可辨识，则 mc-030 在本应区分参数的测量区间上结论失效。要信任本浓度带，得先信 mc-005 的可辨识性证书。',
      },
      {
        id: 'mc-004',
        relation: 'shares_tools',
        note: 'Both reason about multistationarity of reaction networks; mc-004 is classification, mc-030 adds measurement-uncertainty residuals to a concrete operating point.',
      },
    ],
    statement: `对一具体催化反应网络与反应器，速率常数只能以测量区间 $[k_i-\\delta_i,k_i+\\delta_i]$ 获取。工程师要判断：该工况下系统是否恰有一个吸引稳态，目标中间体稳态浓度 $c$ 落在哪个可核验区间。本题要交付：一个带证分类判据，其结论带同时覆盖理想化模型（活度走离质量作用）的模型残差与数值求解的残差两层。任何一根拾取一剂浓度得到的"浮点稳态"不构成答案；答案须为逐层分隔、各自有常数、合成为总带的区间。`,
    certificate: {
      r_model: {
        bound: '把真实活度走离理想质量作用（活度系数≠浓度）引入的模型残差上界',
        derivation: '活度系数残差显式界',
      },
      r_param: {
        bound: '速率常数与工况参数测量不确定度传播到 [c_lo,c_hi] 与稳态判别边界的输入残差上界（对测量区间内所有 k 成立）',
        derivation: '测量区间参数传播到浓度带与稳态边界的区间映像',
      },
      r_num: {
        bound: '稳态求根与区间算术的数值残差上界',
        derivation: '区间求根残差界',
      },
      total_band: 'c_hi - c_lo ≤ R_model + R_param + R_num',
      certified_band: '[c_lo, c_hi]',
    },
    engineering_deliverables: ['催化反应器稳态可判定证书', '中间体浓度带证区间'],
    origin:
      '催化与生化网络的速率常数从不精确，而工程师需要的是"在此测量不确定度下，我的目标中间体浓度落在哪儿、会不会在吸引稳态间跳变"。多稳态理论（缺陷、CRN）给出存在性判据，但对带测量残差的给定工况缺少把模型层与数值层残差合成一个可核验总带的判定。本题把它变成工程师可直接消费的声明。',
    progress: [
      '**CRNT 缺陷理论（Feinberg 等）**: 对给定网络给出多稳态存在与至多单稳态的结构判据。',
      '**区间根方法**: 用区间算术/包围求网络稳态，给出各自的数值残差带，但未与测量残差及活度残差分层合成。',
    ],
    obstacles: [
      '**测量残差与动力学校验的费用**: 速度常数的区间放宽使"是否多稳态"的边界判定对残差敏感，须把活度模型残差显式写界而非默认理想。',
      '**中间体稳态的全局收敛性**: 恰有一个吸引稳态要求排斥全局收敛的证明工具，与单点数值构造互补。',
    ],
    engineering_value:
      '这是"可消费"样板：把"我的反应器会不会在稳态间跳变、中间体浓度落哪"从依赖每次仿真的猜测，换成一次带证、且明确把测量/活度/数值三层残差分开的总带区间。反应器设计、安全旁路和过程控制都能直接消费这个判定，而不必假设理想质量作用。',
    formalization_notes:
      '数值路径现实：用区间算术求网络稳态并围成 $[c_lo,c_hi]$，用活度系数上/下界给出模型残差，用区间牛顿或包围构造给出数值残差，再把两层合成总带。形式化投入中等偏低，适配工程判定。',
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
      '合格答案为"等位基因平衡频率带"而非单一预测点：对给定选择系数 $s$ 与突变率 $\\mu$（二者只以测量区间给出）的某耐药等位基因，交付平衡频率 $p^*$ 的可核验总带 [p_lo,p_hi]，并附证明该带同时覆盖三层残差：(1) **R_model**：把有限种群的离散 Wright–Fisher 动力学理想化为连续扩散/确定极限引入的模型残差上界（对给定种群大小显式包含有限 $N$ 漂移）；(2) **R_param**：选择系数 $s$ 与突变率 $\\mu$ 来自测量时，其测量区间传播到 $p^*$ 的输入残差上界（对测量区间内所有 $s,\\mu$ 成立）；(3) **R_num**：对扩散方程求根/区间映像时离散化与区间算术的数值残差上界。三者各自附可复核常数且总带满足 $p_{hi}-p_{lo}\\le$ R_model+R_param+R_num。判定通过的消费形式：给定测量不确定度与种群大小，直接得到"耐药等位基因平衡频率必将落在此区间"的可核验声明，用于突变监控与耐药风险评估。',
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
    last_verified: '2026-08-24',
    proposer: 'M. Kimura',
    proposed_year: 1955,
    via: {
      label: 'Kimura, Stochastic processes and distribution of gene frequencies under natural selection, Cold Spring Harb. Symp. Quant. Biol. 20 (1955) 33–53',
      url: 'https://doi.org/10.1101/SQB.1955.020.01.006',
    },
    impact_domains: ['抗菌与抗除草剂耐药风险评估', '突变监控与基因组流行病学', '作物与微生物育种', '进化医学'],
    related_problems: [
      {
        id: 'mb-003',
        relation: 'depends_on',
        note: '总带继承（方向二）：mb-028 的耐药等位基因平衡频率带依赖 mb-003 的带突变复制子动力学全局稳定性分类。mb-003 是上游——若其全局稳定性结构被收紧，则 mb-028 平衡带的动力学根基更稳、结论更可靠；若 mb-003 的核心分类被反例击穿（动力学无全局稳定结构），则 mb-028 的平衡带断言同时失效。要信任本平衡带，得先信 mb-003 的稳定性证书。',
      },
    ],
    statement: `某耐药等位基因在一有限种群中演化，选择系数 $s$ 与突变率 $\\mu$ 只能以测量区间获得。工程师/监管者要的不是一个点预测，而是"平衡频率落哪儿"的带证区间。本题要交付：平衡频率 $p^*$ 的可核验总带，其内含三层残差——R_model（有限种群 Wright–Fisher 漂移偏离连续扩散极限的模型残差）、R_param（$s,\\mu$ 测量区间传播到 $p^*$ 的输入残差）、R_num（扩散方程求根与区间映像的数值残差）；三层各有界并合成为单带。`,
    certificate: {
      r_model: {
        bound: '有限种群离散 Wright–Fisher 动力学理想化为连续扩散极限的模型残差上界（显式包含有限 N 漂移）',
        derivation: '有限 N 漂移显式界',
      },
      r_param: {
        bound: '选择系数 s 与突变率 μ 测量区间传播到 p* 的输入残差上界（对测量区间内所有 s,μ 成立）',
        derivation: '测量区间参数传播到平衡频率的区间映像',
      },
      r_num: {
        bound: '扩散方程求根/区间映像时离散化与区间算术的数值残差上界',
        derivation: '区间映像与求根残差界',
      },
      total_band: 'p_hi - p_lo ≤ R_model + R_param + R_num',
      certified_band: '[p_lo, p_hi]',
    },
    engineering_deliverables: ['耐药等位基因平衡频率带', '突变监控风险评估'],
    origin:
      '耐药风险评估需要预测某一等位基因在多长时间内、以多大概率升到给定频率；而选择系数与突变率的测量本身带误差。把"有限种群漂移"这一层模型残差、"测量传播"这一层输入残差与"扩散求解"这一层数值残差分开并合成为可核验带，是把种群遗传学从"预测单一轨迹"推进到"给带证区间"的实际路径，能直接被耐药监控与进化医学消费。',
    progress: [
      '**选择-突变平衡理论（Kimura 等）**: 给出 Wright 平衡频率的经典公式与扩散近似。',
      '**有限 $N$ 修正**: 有文献给出有限种群对平衡频率的漂移修正，但多半是近似式而非带界。',
    ],
    obstacles: [
      '**有限 $N$ 漂移界**: 把离散 Wright–Fisher 相对连续扩散的偏离写成显式、可复核的残差上界并不平凡，需覆盖中等到高频等位基因的整个区间。',
      '**测量→频率映射的敏感传播**: 平衡频率对 $s,\\mu$ 的敏感非线性，使把测量区间传播为 $p^*$ 带需要显式的区间映像而非点估计。',
    ],
    engineering_value:
      '直接可消费：给定测量不确定度与种群大小，售出"耐药等位基因平衡频率必将落在此区间"，用于突变监控阈值与耐药风险评估，不再为单一预测值的可信度争辩。这是把"模型层（有限 $N$）+ 统计层（测量传播）"两层残差合成单带的范例。',
    formalization_notes:
      '数值路径现实：用区间算术把 $s,\\mu$ 的测量区间映射到 $p^*$ 的区间，再用 Sheppard–Kimura 或 Wright 公式的有限 $N$ 修正项给模型残差上界，两层合成总带。形式化投入中等偏低。',
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
    blurb: '可积系统、谱理论、动理学与湍流的严格分析。',
    excludes: '不收：宇宙学模型、高能唯象、以数值为主的计算物理。',
  },
  'mathematical-chemistry': {
    label: 'Mathematical Chemistry',
    labelZh: '数学化学',
    prefix: 'mc',
    color: '#1e7a5a',
    blurb: '化学图论与反应网络理论（CRNT）的开放问题。',
    excludes: '不收：需实际合成验证的材料设计、药物发现。',
  },
  'mathematical-biology': {
    label: 'Mathematical Biology',
    labelZh: '数学生物',
    prefix: 'mb',
    color: '#9a5b13',
    blurb: '进化动力学与流行病网络模型的精确阈值。',
    excludes: '不收：需新实验数据的细胞生物学、神经科学。',
  },
  'mathematical-engineering': {
    label: 'Mathematical Engineering',
    labelZh: '数学工程',
    prefix: 'me',
    color: '#8a2f3c',
    blurb: '多智能体协调与分布式算法下界。',
    excludes: '不收：需部署测试的控制器设计、协议工程实现。',
  },
}

export const RELATION_LABELS: Record<RelationType, string> = {
  depends_on: '依赖于',
  implies: '蕴含',
  shares_tools: '共享工具',
  generalizes: '推广',
  analog_of: '平行类比',
}

export const STATUS_LABELS: Record<ProblemStatus, string> = {
  open: '开放',
  partial: '部分解决',
  resolved: '已解决',
}

/** 证书生命周期的中文标签（与 i18n 的 pd.lifecycle.* 对应，供非 React 场景复用）。 */
export const LIFECYCLE_LABELS: Record<LifecycleStatus, string> = {
  open: '开放待证',
  tightened: '已收窄',
  refuted: '已被反例击穿',
  superseded: '已被取代',
}

/** 缺省生命周期视为 open。 */
export function lifecycleOf(p: Problem): LifecycleStatus {
  return p.lifecycle_status ?? 'open'
}

export const POTENTIAL_LABELS: Record<FormalizationPotential, string> = {
  high: '高',
  medium: '中',
  low: '低',
}

export const VERIFICATION_LABELS: Record<VerificationPath, string> = {
  analytical: '分析证明',
  numerical: '数值验证',
  experimental: '实验',
}

/**
 * Impact domains for the original catalog entries (newer entries carry
 * `impact_domains` inline). Kept as a map so legacy blocks stay untouched.
 */
export const IMPACT_DOMAINS: Record<string, string[]> = {
  'mp-001': ['稀薄气体工程', '航空航天气动', '动理学数值格式'],
  'mp-002': ['大气海洋环流', '气候模式校准', '随机湍流建模'],
  'mp-003': ['非线性晶格器件', '能量输运设计', '可积系统基准'],
  'mp-004': ['无序半导体器件', '二维材料设计'],
  'mp-005': ['量子磁性材料', '张量网络算法', '量子模拟基准'],
  'mp-006': ['光孤子通信', '非线性光学器件'],
  'mp-007': ['随机矩阵基准', '无序体系数值方法', '机器学习谱理论'],
  'mp-008': ['CFD 湍流模型', '航空发动机设计', '能源转换效率'],
  'mc-001': ['化工过程安全', '生物反应器设计', '合成生物学'],
  'mc-002': ['工业催化网络', '代谢工程'],
  'mc-003': ['有机半导体设计', '分子电子学'],
  'mc-004': ['生化振荡器设计', '多稳态开关', '合成基因回路'],
  'mc-005': ['反应动力学参数辨识', '系统生物学建模'],
  'mb-001': ['肿瘤演化建模', '群体遗传学', '进化算法设计'],
  'mb-002': ['公共卫生建模', '流行病防控策略', '网络安全传播'],
  'mb-003': ['微生物群落管理', '生态干预设计'],
  'mb-004': ['生态系统保育', '渔业资源管理', '入侵物种控制'],
  'me-001': ['无人机编队', '传感器网络', '自动驾驶车队'],
  'me-002': ['联邦学习', '边缘计算优化', '分布式训练系统'],
  'me-003': ['群体机器人', '蜂拥控制安全认证', '生物群体建模'],
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
