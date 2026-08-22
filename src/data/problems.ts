export type Domain =
  | 'mathematical-physics'
  | 'mathematical-chemistry'
  | 'mathematical-biology'
  | 'mathematical-engineering'

export type FormalizationPotential = 'high' | 'medium' | 'low'
export type VerificationPath = 'analytical' | 'numerical' | 'experimental'
export type ProblemStatus = 'open' | 'partial' | 'resolved'
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
}

/** 一条针对某个问题的更新（修订、新进展或状态变更） */
export interface ProblemUpdate {
  date: string
  note: string
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
  formalization_notes: string
  references: { label: string; url: string }[]
  /** 判定形式：一个被认可的答案必须满足什么、如何被核验（证明证书 / 数值判据 / 反例构造…） */
  judgment?: string
  /** 溯源：提出者 */
  proposer?: string
  /** 溯源：提出年份 */
  proposed_year?: string
  /** 溯源：出处（文献或对话） */
  via?: { label: string; url?: string }
  /** 轻量更新记录：修订 / 新进展 / 状态变更 */
  updates?: ProblemUpdate[]
}

export const PROBLEMS: Problem[] = [
  {
    id: 'mp-001',
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
    proposed_year: '1955',
  },
  {
    id: 'mp-004',
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
    formalization_notes:
      'Both the enumerative part (polyhex enumeration) and spectral computation are decidable and verified numerically; formal proofs of asymptotic bounds are realistic. High suitability for verified-computation approaches (interval arithmetic in Lean/Coq).',
    references: [
      {
        label: 'Gutman, Polansky, Mathematical Concepts in Organic Chemistry, Springer, 1986',
        url: 'https://link.springer.com/book/10.1007/978-3-642-70982-1',
      },
    ],
    judgment: 'A pass gives necessary and sufficient conditions for a multiset in $[-3,3]$ to be the adjacency spectrum of a benzenoid graph and characterizes the attainable HOMO–LUMO gaps, with a constructive realizability certificate for each allowed spectrum and the number-theoretic plus hexagonal-embedding constraints verified.',
  },
  {
    id: 'mc-004',
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
    judgment: 'A pass must supply an algorithm together with a complete classification of when the rate constant vector is structurally identifiable from the observable subset, and a correctness proof of the decision procedure relative to the stated ideal noise-free observation model.',
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
    related_problems: [],
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
    related_problems: [
      {
        id: 'mb-004',
        relation: 'analog_of',
        note: 'Replicator dynamics and Lotka–Volterra are mathematically equivalent (Hofbauer transformation); stability classifications should transfer.',
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
    impact_domains: ['量子磁性材料', '冷原子模拟'],
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
    proposed_year: '1931',
  },
  {
    id: 'mp-013',
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
    id: 'mc-006',
    judgment: 'A pass proves the existence of a positive eps such that eps is at most the liminf and the limsup is at most 1/eps for every species along every positive trajectory, and thereby rules out extinction or blow-up; the boundary-dynamics analysis yielding the uniform bound must be rigorously certified.',
    title: 'Permanence Conjecture for Complex-Balanced Reaction Networks',
    titleZh: '复平衡反应网络的持久性猜想',
    domain: 'mathematical-chemistry',
    subdomain: 'crnt',
    status: 'partial',
    difficulty: 'frontier',
    formalization_potential: 'medium',
    verification_path: 'analytical',
    tags: ['crnt', 'permanence', 'complex-balanced', 'dynamical-systems'],
    contributor: 'admin',
    date_added: '2026-08-22',
    last_verified: '2026-08-22',
    impact_domains: ['化工过程安全', '合成生物学'],
    related_problems: [
      {
        id: 'mc-001',
        relation: 'generalizes',
        note: 'The Global Attractor Conjecture asserts convergence to a positive equilibrium; permanence asserts uniform persistence of all species — stronger and still open in general.',
      },
    ],
    statement: `Prove that every complex-balanced mass-action system is **permanent**: there exists $\\varepsilon > 0$ such that for every positive initial condition $x(0) \\in \\mathbb{R}^n_{>0}$, the trajectory satisfies
$$\\varepsilon \\le \\liminf_{t\\to\\infty} x_i(t) \\le \\limsup_{t\\to\\infty} x_i(t) \\le 1/\\varepsilon \\quad \\text{for all } i,$$
i.e. no species concentration approaches $0$ or $\\infty$ along any trajectory.`,
    origin:
      'Permanence is the design-level guarantee that a chemical or biochemical network cannot silently drive a species to extinction — the key safety property of industrial reactors and engineered metabolic circuits.',
    progress: [
      '**Angel–De Leenheer–Sontag (2007)**: permanence for a class of networks via boundary dynamics analysis.',
      '**Craciun–Nazarov–Pantea (2013)**: permanence for endotactic networks in 2D; later extended to 3D and strongly endotactic networks.',
      '**General case**: open; closely tied to the (toric) Global Attractor Conjecture resolved by Craciun.',
    ],
    obstacles: [
      '**Boundary dynamics are only partially understood**: the ω-limit sets on faces of the positive orthant can carry complicated dynamics in dimension $\\ge 4$.',
      '**No general Lyapunov-type criterion** rules out slow approach to the boundary for non-endotactic networks.',
    ],
    engineering_value:
      '持久性证书可直接翻译成化工安全联锁设计准则（无物种耗竭/爆炸性积累）与合成生物回路的鲁棒性验收条件。',
    formalization_notes:
      'Complex balance is decidable from the network graph and rate constants; the dynamical conclusion is the open part. Structural sufficient conditions (endotacticity) are checkable algorithms — a certification pipeline is feasible.',
    references: [
      {
        label: 'Craciun, Nazarov, Pantea, Persistence and permanence of mass-action and power-law dynamical systems, SIAM J. Appl. Math. 73, 2013',
        url: 'https://arxiv.org/abs/1010.3050',
      },
      {
        label: 'Anderson, A proof of the Global Attractor Conjecture in the single linkage class case, SIAM J. Appl. Math. 71, 2011',
        url: 'https://arxiv.org/abs/1101.0761',
      },
    ],
  },
  {
    id: 'mc-007',
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
    impact_domains: ['化工过程安全', '生物反应器设计'],
    related_problems: [
      {
        id: 'mc-006',
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
      'As mc-006: the hypothesis is decidable from rate data; the conclusion is analytic. Amenable to computer-assisted search for counterexamples in parameterized families.',
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
    impact_domains: ['湍流数值模拟', '大气海洋流动'],
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
    proposed_year: '1949',
  },
  {
    id: 'mc-009',
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
    id: 'mc-010',
    title: 'Wigner Crystallization: Ordered Ground States at Low Density',
    titleZh: 'Wigner 结晶：低密度下的有序基态',
    domain: 'mathematical-chemistry',
    subdomain: 'condensed-matter-theory',
    status: 'open',
    difficulty: 'frontier',
    formalization_potential: 'low',
    verification_path: 'numerical',
    tags: ['wigner-crystal', 'coulomb', 'ground-state', 'crystallization'],
    contributor: 'admin',
    date_added: '2026-08-22',
    last_verified: '2026-08-22',
    impact_domains: ['电子晶体材料', '二维材料物性'],
    related_problems: [
      {
        id: 'mp-010',
        relation: 'analog_of',
        note: 'Order/disorder transitions in low-density matter: Anderson (mp-010) drives localization, Wigner drives crystallization — opposite sides of the same confining-potential dichotomy.',
      },
    ],
    statement: `Prove that at sufficiently low density, a system of particles interacting via Coulomb (or Riesz) repulsion — specifically the classical or quantum jellium — develops **crystalline long-range order**: the minimizing ground-state density profile is periodic (a Bravais lattice, e.g. bcc in 3D or triangular in 2D), and the thermodynamic-limit energy per particle is attained by such a periodic configuration. Rigorously establish that the correlation function does not decay (long-range order) in the low-density regime.`,
    origin:
      'Wigner (1934) predicted that electrons at low density freeze into a crystal to minimize Coulomb repulsion; electron crystals are now observed in quantum dots, 2D semiconductors and ultracold ions. Despite the Nobel-level importance, a rigorous proof that the ground state is actually ordered remains open — the central unsolved step of the "crystallization conjecture".',
    progress: [
      '**Stability / thermodynamic limit**: the existence and boundedness of the essential ground-state energy density is established (Dyson\u2013Lenard; Lieb\u2013Thirring and successors).',
      '**Riesz-gas crystallization**: rigorously proved for the singular log-gas ($\\log/|x|$) and for Riesz kernels approaching the hard-core limit, but still open at the physical Coulomb interaction ($\\alpha=d-1$) in $d \\ge 2$.',
      '**Jellium ordering**: numerical/free-energy arguments strongly favour a lattice, yet the rigorous presence of long-range order is open.',
    ],
    obstacles: [
      '**Mixing of scales**: long-range Coulomb energy is not simply a sum of local terms, defeating the cluster/Berezin \u201ctechnique\u201d that works for short-range crystallization.',
      '**No order parameter with a provable gap**: proving the correlation function stays bounded away from zero requires controlling infinitely many competing periodic structures.',
    ],
    engineering_value:
      '电子晶体（Wigner 晶格）的严格性证明将给出二维材料与量子点阵列物性的先验判据，为“规则点阵是否可长期稳定”的工程问题提供数学基准。',
    formalization_notes:
      'The thermodynamic-limit part is partially formalizable (energy density existence); the ordering step is a hard open analytic question. Certified numerics for small Wigner clusters (ground states of few Coulomb charges) is already an achievable, checkable sub-goal.',
    references: [
      {
        label: 'Wigner, On the interaction of electrons in metals, Physical Review 46, 1934',
        url: 'https://doi.org/10.1103/PhysRev.46.1002',
      },
      {
        label: 'Saff, Totik, Logarithmic Potentials with External Fields, Springer, 1997',
        url: 'https://doi.org/10.1007/978-3-642-57063-0',
      },
    ],
    judgment: 'A pass proves that at sufficiently low density the Coulomb (or Riesz) jellium ground state exhibits crystalline long-range order — a periodic (Bravais-lattice) energy-minimizing density profile and a non-decaying correlation function in the thermodynamic limit — with the energy-density and ordering estimate certified; the open short-range-free ordering step must itself be resolved, not assumed.',
    proposer: 'Wigner',
    proposed_year: '1934',
  },
  {
    id: 'mb-009',
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
    id: 'mp-017',
    title: 'Rigorous Derivation of the Linear Boltzmann Equation from the Lorentz Gas',
    titleZh: '由洛伦兹气体严格推导线性玻尔兹曼方程',
    domain: 'mathematical-physics',
    subdomain: 'kinetic-theory',
    status: 'open',
    difficulty: 'frontier',
    formalization_potential: 'low',
    verification_path: 'analytical',
    tags: ['lorentz-gas', 'boltzmann-grad', 'kinetic-limits', 'collision-kernel'],
    contributor: 'admin',
    date_added: '2026-08-22',
    last_verified: '2026-08-22',
    impact_domains: ['中子输运', '光子散射传输'],
    related_problems: [
      {
        id: 'mp-001',
        relation: 'shares_tools',
        note: 'mp-001 derives the (nonlinear) Boltzmann equation from hard spheres; mp-017 derives the linear Boltzmann from the Lorentz gas \u2014 the same kinetic-limit toolkit in a fixed-scatterer geometry.',
      },
    ],
    statement: `Let a point particle move at unit speed through a static (periodic or random) array of scatterers of radius $\\varepsilon$, undergo elastic collisions, and rescale space\u2013time by $\\varepsilon^{-2}$ (Boltzmann\u2013Grad scaling). Prove that, for fixed times, the rescaled one-particle density $f^\\varepsilon(t,x,v)$ converges in suitable topology to the solution of the linear Boltzmann equation
$$\\partial_t f + v\\cdot\\nabla_x f = \\mathcal{L}f, \\qquad \\mathcal{L}f(x,v)=\\int_{S^{d-1}} K(v,v')\\big[f(x,v')-f(x,v)\\big]\\,\\mathrm{d}\\!\\sigma(v'),$$
with the collision kernel $K$ determined by the single-scatterer differential cross-section \u2014 rigorously, in the limit $\\varepsilon\\to0$.`,
    origin:
      'The Lorentz gas is the simplest model of a test particle in a fixed array of scatterers, and using it to justify the linear Boltzmann (or the low-density collision kernel) from first principles is a central open problem in kinetic theory. Only a rigorous derivation exists for special regimes (Markovian/non-periodic random assortments or for the Boltzmann\u2013Grad limit of the hard-sphere gas), not for generic deterministic periodic scatterer arrays.',
    progress: [
      '**poisson/Lorentz-Boltzmann in random media** established in some low-density random settings (e.g. via the "Gaussianity"/coupling methods).',
      '**Periodic arrays long-time + collision events**: the scaling limit with repeated collisions on a periodic layout is not rigorously closed; the derived kernel vs. cross-section identity is conditional.',
    ],
    obstacles: [
      '**Recollisions and clustering** in the deterministic lattice inject correlations that a naive Boltzmann ansatz ignores.',
      '**Long-time validity**: the kinetic regime requires times $t\\sim\\varepsilon^{-2}$ where collisions repeatedly realign the velocity, where error accumulation is hard to control.',
    ],
    engineering_value:
      '线性玻尔兹曼方程是中子与光子屏蔽、散射传输仿真的工作马；严格推导其碰撞核能校验蒙特卡洛输运代码对复杂周期/随机介质的等效截面假设。',
    formalization_notes:
      'Requires a genuine kinetic limit with controlled recollisions; current rigorous results are conditional break one main assumption, so a full formal proof is far off \u2014 marked low potential.',
    references: [
      {
        label: 'Gallavotti, Rigorous theory of the Boltzmann equation in the Lorentz gas, Stat. Mech. (CIFM), 1972',
        url: 'https://doi.org/10.1007/BFb0006495',
      },
      {
        label: 'Sporer, Lorentz gas with almost periodic arrangement of scatterers, preprint 1992',
        url: 'https://doi.org/10.1007/BF01048184',
      },
    ],
    judgment: 'A pass rigorously proves convergence of the rescaled one-particle density to the linear Boltzmann equation, with the collision kernel equal to the single-scatterer cross-section, under Boltzmann–Grad scaling for a fixed periodic scatterer array, with recollision control certified; restricted/random-media or conditional results alone are insufficient.',
  },
  {
    id: 'mp-018',
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
    impact_domains: ['工业调度优化', '供应链规划'],
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
    proposed_year: '1998',
  },
  {
    id: 'me-013',
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
    id: 'mp-021',
    title: 'Thermalization of Fermi–Pasta–Ulam Chains: Approach to Gibbs on the Energy Shell',
    titleZh: 'Fermi–Pasta–Ulam 链的热化：能量面上的 Gibbs 趋近',
    domain: 'mathematical-physics',
    subdomain: 'ergodic-theory',
    status: 'open',
    difficulty: 'frontier',
    formalization_potential: 'low',
    verification_path: 'numerical',
    tags: ['fpu', 'thermalization', 'ergodicity', 'statistical-mechanics'],
    contributor: 'admin',
    date_added: '2026-08-22',
    last_verified: '2026-08-22',
    impact_domains: ['分子动力学', '能量输运设计', '晶格动力学'],
    related_problems: [
      {
        id: 'mp-003',
        relation: 'shares_tools',
        note: 'Both address the long-time statistical behavior of Hamiltonian lattice dynamics; mp-003 on integrable soliton transport, mp-021 on equipartition and Gibbs convergence.',
      },
    ],
    statement: `Fix a one-dimensional chain of $N$ particles with Hamiltonian $H = \\sum p_i^2/2 + V(q_{i} - q_{i-1})$ and an anharmonic nearest-neighbor potential that breaks integrability (e.g. the Fermi–Pasta–Ulam $\\alpha$ or $\\beta$ model). Prove or disprove that, in the mechanically relevant large-$N$ regime and at fixed positive energy density, every small open set of initial conditions converges in the long-time average to the microcanonical (Gibbs) measure on the conserved energy surface $\\{H = E\\}$ — establishing thermalization and the corresponding equipartition of energy among Fourier modes.`,
    origin:
      'The FPU experiment (1955) showed numerics far from equipartition, triggering the theory of integrable systems and KAM. Whether realistic FPU chains do eventually thermalize on the full energy shell, and at what time scale, is a foundational problem in statistical mechanics and molecular dynamics; genuine thermalization has never been rigorously proved for these non-integrable high-dimensional systems.',
    progress: [
      '**FPU (1955)**: numerical non-thermalization on accessible times, beginning the KAM theory.',
      '**Berezin / retuning (2005+)**: long-time quasirecurrences and the "FPU paradox" resolved only heuristically on intermediate scales.',
      '**Konstantinou–Mertens–Flytzanis (various)**: empirical equipartition thresholds by energy density; no rigorous proof.',
    ],
    obstacles: [
      '**No microscopic ergodicity**: high-dimensional Hamiltonian systems with conserved quantities resist proof of ergodicity; small-divisor and KAM obstacles block genericity arguments at positive energy density.',
      '**Two time scales**: linear phonons relax fast while the coupling between modes is weak, so a mixing estimate uniformly in $N$ is out of reach of current techniques.',
    ],
    engineering_value:
      'Whether and how fast systems equilibrate sets the validity of molecular-dynamics thermostats and thermal-conductivity calculations; a proof would justify Gibbs sampling in MD.',
    formalization_notes:
      'The dynamics is ODE but the ergodicity content is analytic dynamical-systems theory; formalization is not a realistic early target, though the linearized (phonon) spectrum is.',
    references: [
      {
        label: 'Fermi, Pasta, Ulam, Studies of nonlinear problems, Los Alamos Report LA-1940 (1955)',
        url: 'https://www.osti.gov/biblio/4377577',
      },
      {
        label: 'Gallavotti (ed.), The Fermi–Pasta–Ulam Problem: A Status Report, Lecture Notes in Physics 728, Springer (2008)',
        url: 'https://doi.org/10.1007/978-3-540-72995-2',
      },
    ],
    judgment: 'A pass proves or disproves that, at fixed positive energy density and large $N$, the long-time average of a small open ball of initial data converges to the microcanonical measure on the energy surface $\\{H=E\\}$, establishing equipartition among Fourier modes, with the mixing/time-scale obstruction resolved uniformly in $N$; a heuristic reconciliation of the FPU paradox or intermediate-scale quasirecrence alone is not accepted.',
  },
  {
    id: 'mp-022',
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
    id: 'mc-015',
    judgment: 'A pass certifies for every N at least 1 that no configuration of N particles attains total Lennard-Jones energy below the recorded global minimum, or proves a new exact global minimum, delivering a global-optimization lower bound that rules out all competing configurations.',
    title: 'Global Optimality of Ground-State Geometries for Lennard-Jones Clusters of Arbitrary Size',
    titleZh: '任意尺寸 Lennard-Jones 团簇基态几何的全局最优性',
    domain: 'mathematical-chemistry',
    subdomain: 'cluster-geometry',
    status: 'open',
    difficulty: 'research',
    formalization_potential: 'low',
    verification_path: 'numerical',
    tags: ['lennard-jones', 'global-optimization', 'cluster-geometry', 'basin-hopping'],
    contributor: 'admin',
    date_added: '2026-08-22',
    last_verified: '2026-08-22',
    impact_domains: ['纳米团簇设计', '分子吸附', '力场基准'],
    related_problems: [
      {
        id: 'mc-009',
        relation: 'shares_tools',
        note: 'Both concern provable optimality of discrete structures in chemistry — mc-009 on Hamiltonian cycles of fullerene graphs, mc-015 on global energy minima of clusters.',
      },
    ],
    statement: `For the $d$-dimensional Lennard-Jones potential $V(r) = r^{-12} - r^{-6}$ (or the shifted pairwise form), prove or disprove that, for every $N \\ge 1$, the global minimum of the total energy
$$E_N(x_1,\\dots,x_N) = \\sum_{i<j} V(|x_i - x_j|)$$
over configurations in $\\mathbb{R}^d$ with arbitrary relative distances is attained by the known lowest-energy structure (as tabulated in benchmark databases), i.e. certify that no configuration of $N$ particles has energy below the recorded putative global minimum for all $N$; in particular determine the exact global minimum for each $N$, not merely conjectural records.`,
    origin:
      'Finding global minima of atomic clusters is a prototypically NP-hard continuous optimization problem; for Lennard-Jones clusters the global optimum is known numerically (basin-hopping databases) up to $N \\approx 1000$ but is *proven* for very few $N$, and no strategy certifies optimality for arbitrary $N$. The problem is central to nanocluster and materials design.',
    progress: [
      '**Wales & Doye (1997)**: basin-hopping produced the reference list of lowest-energy Lennard-Jones structures for $N \\le 110$, plus subsequent extensions.',
      '**Structure predictions**: icosahedral and decahedral motifs conjectured, but mathematical certification of global optimality is absent except in trivial/reduced dimensions.',
    ],
    obstacles: [
      '**Nonconvexity**: the 12-6 potential is strongly nonconvex with an exponential number of local minima; no convex relaxation is known to certify the global optimum.',
      '**Continuous hardness**: the configuration space is unbounded and energy is not coercive in the usual sense at the hard-core scale; standard global-optimization lower bounds are uselessly weak.',
    ],
    engineering_value:
      'Certifying ground states enables error-controlled predictions for nanocluster catalysis and surface adsorption; rigorous global minima would anchor force-field benchmarking.',
    formalization_notes:
      'This is a global continuous/discrete optimization certification problem; formalizing the (few) known optimal configurations is feasible, but a general $\\forall N$ certification is the open hard part.',
    references: [
      {
        label: 'Wales, Doye, Global optimization by basin-hopping and the lowest energy structures of Lennard-Jones clusters containing up to 110 atoms, J. Phys. Chem. A 101 (1997) 5111–5116',
        url: 'https://doi.org/10.1021/jp970984n',
      },
      {
        label: 'Wille, Vennik, Electrostatic interactions and the structure of Lennard-Jones clusters, Journal of Physics A 18 (1985) L419',
        url: 'https://doi.org/10.1088/0305-4470/18/8/007',
      },
    ],
  },
  {
    id: 'mb-014',
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
    impact_domains: ['类脑计算', '存储器设计', '神经网络理论'],
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
    proposed_year: '1982',
  },
  {
    id: 'mb-015',
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
