// Engineering-need reverse demand list (C: 工程反向需求清单), deepened.
//
// 工程师带着一个具体需求来（"我要给散热器一个可核验的热裕量""我要给生物反应器
// 一个不塌方的稳定性证书"），MathX 反向回答：哪些问题/定律支撑这个需求、现在
// 到什么程度、缺口在哪。这是双桥愿景的需求侧入口——工程问题 ↔ 可证判定。
//
// 每条需求现在是一份"判定档案"：
//   chain      按依赖顺序列出要 certify 的子判定（问题或定律，含角色与"要证什么"）
//   standard   该判定落地的工程标准/规范（真实存在，供工程侧对接）
//   consumable 什么算"被服务"：可消费输出的量化形态
//   barrier    当前缺口的具体障碍（为什么还没 served）
//   workflow   判定在工程工作流中的落点
//   readiness  served = 已有可直接消费的证书；partial = 至少一个锚点；gap = 全部开放
//
// 诚实规则（由 scripts/check-needs.mjs 在 CI 强制）：
//   - chain 里每个 id 必须存在于目录（problem）或 laws.ts（law），kind 必须匹配；
//   - problem 角色的 role 枚举合法；law 步骤必须用 role='law'；
//   - workflow / readiness 枚举合法；need id 唯一；chain 非空；
//   - standard / consumable / barrier 必须非空（禁止无出处地声称"对接某标准"）。

export type NeedReadiness = 'served' | 'partial' | 'gap'
/** 问题在需求中的角色：certificate=可直接消费的证书；anchor=奠基性结构证；related=支撑/相关。 */
export type NeedProblemRole = 'certificate' | 'anchor' | 'related'
/** 判定链中一个步骤的角色（law 步骤统一用 'law'）。 */
export type NeedChainRole = NeedProblemRole | 'law'
/** 判定在工程工作流中的落点。 */
export type NeedWorkflow =
  | 'design-review'
  | 'safety-case'
  | 'alarm-setpoint'
  | 'validation'
  | 'screening'
  | 'deployment'
  | 'monitoring'
  | 'sign-off'

export interface NeedChainStep {
  /** 目录问题或定律的 id（必须真实存在）。 */
  id: string
  /** problem = 目录问题；law = laws.ts 的经验定律。 */
  kind: 'problem' | 'law'
  role: NeedChainRole
  /** 该子判定要 certify 什么（工程师视角一句话）。 */
  what: string
}

export interface EngineeringNeed {
  id: string
  /** 工程需求名（工程师视角）。 */
  name: string
  /** 所属工程领域（分组）。 */
  area: string
  /** 工程师要 certify/decide 什么。 */
  description: string
  /** 决策判定链：按依赖顺序列出要 certify 的子判定。 */
  chain: NeedChainStep[]
  /** 对接的工程标准/规范（真实存在）。 */
  standard: string
  /** 什么算"被服务"：可消费输出的量化形态。 */
  consumable: string
  /** 当前缺口的具体障碍。 */
  barrier: string
  /** 判定在工程工作流中的落点。 */
  workflow: NeedWorkflow
  readiness: NeedReadiness
  /** 诚实的现状/缺口说明。 */
  note: string
  /** 缺口驱动收题（readiness='gap' 时护栏强制必须有）：要 serve 这条需求，具体该收/推哪道题。 */
  sourcing?: NeedSourcingItem[]
}

/** 收题流水线条目：缺口 → 该收/推哪道题。由需求层驱动"从问题收录到解题层"。 */
export interface NeedSourcingItem {
  /** push = 推进已有目录问题；new = 新增候选题（进入收题流水线/候选池提案）。 */
  kind: 'push' | 'new'
  /** push 时的目标题 id（必须真实存在于目录）；new 时省略。 */
  target?: string
  /** 收题建议一句话（机器可核验的非空承诺）。 */
  what: string
}

export const NEED_READINESS_LABEL: Record<NeedReadiness, string> = {
  served: 'Served',
  partial: 'Partial',
  gap: 'Gap',
}

export const NEED_WORKFLOW_LABEL: Record<NeedWorkflow, string> = {
  'design-review': 'Design review',
  'safety-case': 'Safety case',
  'alarm-setpoint': 'Alarm / set-point',
  validation: 'Validation',
  screening: 'Screening',
  deployment: 'Deployment',
  monitoring: 'Monitoring',
  'sign-off': 'Sign-off',
}

export const ENGINEERING_NEEDS: EngineeringNeed[] = [
  {
    id: 'need-thermal-margin',
    name: 'Certified thermal margin for convective cooling',
    area: 'Thermal engineering',
    description:
      'A design-review decision: given a heat-sink geometry and a Rayleigh–Bénard-style flow regime, certify an upper bound on the Nusselt number and a peak-temperature margin that does not rely on unverified CFD.',
    chain: [
      {
        id: 'mp-037',
        kind: 'problem',
        role: 'certificate',
        what: 'Certify an upper bound on heat transport (Nusselt number) in Rayleigh–Bénard convection — the transport ceiling the heat-sink design must respect.',
      },
      {
        id: 'mp-041',
        kind: 'problem',
        role: 'certificate',
        what: 'Certify the heat-sink thermal margin via a three-layer residual total band on free convection (model / input / numerical).',
      },
      {
        id: 'law-fourier',
        kind: 'law',
        role: 'law',
        what: 'Bound the residual of Fourier\u2019s law vs. microscopic phonon transport at device scale — the conduction-side assumption behind the temperature margin.',
      },
    ],
    standard: 'JEDEC JESD51 (thermal characterization of electronic packages)',
    consumable:
      'A certified [lo, hi] band on peak junction / heat-sink temperature with R_model + R_param + R_num residual — consumable directly at design review.',
    barrier:
      'Fourier\u2019s law lacks a strict microscopic derivation at device scale (law-fourier, partial); the convection-side bounds (mp-037, mp-041) are certified but the conduction residual keeps the total band honest.',
    workflow: 'design-review',
    readiness: 'partial',
    note: 'Two certified-band problems anchor the demand; the residual band from the unproven conduction law is the honest boundary.',
  },
  {
    id: 'need-turbulence-closure',
    name: 'Turbulence closure error bound',
    area: 'CFD / aerospace',
    description:
      'RANS/LES closures need a certified statement about the dissipation mechanism they model: does the zero-viscosity limit dissipate anomalously, and can the mixing-length ansatz be bounded?',
    chain: [
      {
        id: 'mp-008',
        kind: 'problem',
        role: 'anchor',
        what: 'Decide whether the zero-viscosity limit of forced Navier–Stokes dissipates anomalously (the zeroth law of turbulence) — the physical premise every closure inherits.',
      },
      {
        id: 'mp-036',
        kind: 'problem',
        role: 'anchor',
        what: 'Establish sharp mixing rates from anomalous dissipation in passive scalar transport — the mechanism a scalar-mixing closure must reproduce.',
      },
      {
        id: 'law-mixinglength',
        kind: 'law',
        role: 'law',
        what: 'Derive or bound an error for the algebraic mixing-length closure from the Navier–Stokes equations.',
      },
    ],
    standard: 'ASME V&V 20-2009 (verification & validation in CFD)',
    consumable:
      'A certified residual bound attached to a chosen RANS/LES closure, so that \u201cthe closure error \u2264 \u03b5 in this flow class\u201d is a machine-checkable claim.',
    barrier:
      'Both supporting problems (mp-008, mp-036) are open and the mixing-length law has no rigorous derivation (law-mixinglength, gap) — the whole closure family lacks a mathematical basis.',
    workflow: 'validation',
    readiness: 'gap',
    note: 'The demand side of the closure question: a certified dissipation statement is precisely what RANS/LES validation is missing.',
    sourcing: [
      { kind: 'push', target: 'mp-008', what: '零粘性极限下奇异耗散的显式可证刻画' },
      { kind: 'new', what: '混合长闭合（law-mixinglength）误差的可证上界' },
    ],
  },
  {
    id: 'need-consensus-rate',
    name: 'Consensus convergence-rate guarantee',
    area: 'Control / multi-agent',
    description:
      'A distributed controller for a fleet (UAV, sensor, robot) needs a certified convergence rate over time-varying / quantized links, replacing simulation-only tuning.',
    chain: [
      {
        id: 'me-001',
        kind: 'problem',
        role: 'anchor',
        what: 'Prove a certified convergence rate for nonlinear multi-agent consensus — the general nonlinear guarantee.',
      },
      {
        id: 'me-002',
        kind: 'problem',
        role: 'anchor',
        what: 'Tight lower bounds for decentralized optimization over time-varying graphs — how fast it is provably impossible to go.',
      },
      {
        id: 'me-034',
        kind: 'problem',
        role: 'certificate',
        what: 'Optimal worst-case convergence time for finite-rate quantized average consensus — a directly consumable worst-case bound for the deployed protocol.',
      },
    ],
    standard: 'ISO 26262-6 (functional safety, formal methods)',
    consumable:
      'A certified worst-case convergence-time bound for the deployed consensus protocol under quantization and link dropout — input to a functional-safety case.',
    barrier:
      'The quantized worst-case bound (me-034) is certified and consumable; the nonlinear (me-001) and time-varying-graph lower bounds (me-002) remain open.',
    workflow: 'safety-case',
    readiness: 'partial',
    note: 'Readiness corrected to partial: me-034 is a consumable certificate, not merely an anchor.',
  },
  {
    id: 'need-flocking-safety',
    name: 'Flocking / swarm safety certificate',
    area: 'Safety-critical autonomy',
    description:
      'Certify that a proposed flocking law converges to a safe formation (no scattering, no collision) before deployment in autonomous swarms.',
    chain: [
      {
        id: 'me-003',
        kind: 'problem',
        role: 'anchor',
        what: 'Prove unconditional flocking for Cucker–Smale dynamics with singular kernels — the mathematical core of \u201cno scattering, no collision\u201d.',
      },
    ],
    standard: 'ASTM F3269-21 (flight procedures for unmanned aircraft systems)',
    consumable:
      'A certified invariant set guaranteeing no scattering / no collision for a candidate flocking law over a stated time horizon.',
    barrier: 'me-003 is open; no certificate exists for any flocking law.',
    workflow: 'safety-case',
    readiness: 'gap',
    note: 'The Cucker–Smale unconditional-flocking question is the mathematical core a swarm-safety certificate would rest on.',
    sourcing: [
      { kind: 'push', target: 'me-003', what: '奇异核 Cucker–Smale 无条件 flocking' },
      { kind: 'new', what: '非奇异核 flocking 不变集的构造性证明（过渡锚点）' },
    ],
  },
  {
    id: 'need-bioreactor-robustness',
    name: 'Bioreactor robustness — no species collapse',
    area: 'Bioprocess engineering',
    description:
      'Certify that a continuous bioreactor\u2019s mass-action network persists (no species goes extinct) and relaxes to a stable operating point across feed perturbations.',
    chain: [
      {
        id: 'mc-001',
        kind: 'problem',
        role: 'anchor',
        what: 'Prove the global attractor for complex-balanced reaction networks — every trajectory approaches a steady state.',
      },
      {
        id: 'mc-002',
        kind: 'problem',
        role: 'anchor',
        what: 'Prove persistence for weakly reversible networks — no species is driven extinct.',
      },
      {
        id: 'mc-027',
        kind: 'problem',
        role: 'certificate',
        what: 'Rigorous error bounds for the stochastic quasi-steady-state approximation — the consumable anchor for reduced modeling of the culture.',
      },
      {
        id: 'law-mm',
        kind: 'law',
        role: 'law',
        what: 'Bound the QSSA error when reducing Michaelis–Menten kinetics.',
      },
      {
        id: 'law-monod',
        kind: 'law',
        role: 'law',
        what: 'Derive or bound the Monod growth law from a metabolic network — the growth-rate assumption at the heart of bioreactor models.',
      },
    ],
    standard: 'ICH Q8 (Pharmaceutical Development) / Q9 (Quality Risk Management)',
    consumable:
      'A certified persistence + relaxation-time band for the bioreactor\u2019s mass-action network across the feed-perturbation interval, including the stochastic-QSSA error.',
    barrier:
      'mc-027 is a consumable anchor, but the global-attractor (mc-001) and persistence (mc-002) conjectures are open; Monod has no mechanistic derivation (law-monod, gap).',
    workflow: 'validation',
    readiness: 'partial',
    note: 'One consumable anchor (stochastic QSSA bounds) with the global network theorems still open behind it.',
  },
  {
    id: 'need-multistationarity',
    name: 'Multistationarity / switch design',
    area: 'Synthetic biology',
    description:
      'Engineers designing synthetic circuits need to decide algorithmically whether a proposed reaction network admits multiple steady states (a bistable switch).',
    chain: [
      {
        id: 'mc-004',
        kind: 'problem',
        role: 'anchor',
        what: 'Classify small reaction networks admitting multistationarity — a decidable criterion for switch detection.',
      },
      {
        id: 'mc-011',
        kind: 'problem',
        role: 'anchor',
        what: 'Separate multistationarity from monostationarity for deficiency-one networks — the classical structural route.',
      },
      {
        id: 'law-mm',
        kind: 'law',
        role: 'law',
        what: 'Bound the QSSA regime when screening candidate circuits for switch behavior.',
      },
    ],
    standard: 'EFSA GMO risk-assessment guidance (synthetic circuit safety)',
    consumable:
      'A decidable multistationarity criterion that turns \u201cis this circuit a bistable switch\u201d into a computed yes/no with a witness (two steady states).',
    barrier: 'Both classification problems (mc-004, mc-011) are open.',
    workflow: 'screening',
    readiness: 'gap',
    note: 'A decidable criterion would make switch design a certified decision instead of a simulation guess.',
    sourcing: [
      { kind: 'new', what: '小网络多稳态的可判定判据（CRNT 结构性判据，deficiency 理论算法化）' },
    ],
  },
  {
    id: 'need-epidemic-threshold',
    name: 'Epidemic intervention thresholds',
    area: 'Public health',
    description:
      'Intervention planning (vaccination, isolation, demography-aware control) needs exact epidemic thresholds rather than mean-field approximations.',
    chain: [
      {
        id: 'mb-002',
        kind: 'problem',
        role: 'anchor',
        what: 'Sharp metastable lifetime of the SIS epidemic on networks — how long an outbreak lingers.',
      },
      {
        id: 'mb-005',
        kind: 'problem',
        role: 'anchor',
        what: 'Exact epidemic threshold on clustered networks (partially resolved) — the clustered-correction to mean field.',
      },
      {
        id: 'mb-011',
        kind: 'problem',
        role: 'anchor',
        what: 'Exact critical value of the contact process on the integer lattice — the cleanest exact threshold.',
      },
      {
        id: 'mb-013',
        kind: 'problem',
        role: 'anchor',
        what: 'Sharp epidemic threshold and near-critical extinction time for SIR with demography.',
      },
    ],
    standard: 'WHO (International Health Regulations 2005) pandemic planning',
    consumable:
      'Exact (non-mean-field) thresholds plus certified uncertainty bands for the intervention window — directly usable in planning tables.',
    barrier:
      'mb-005 is partially resolved (clustered SIR threshold); the exact SIS lifetime (mb-002), contact-process critical value (mb-011) and demography-aware SIR (mb-013) remain open.',
    workflow: 'monitoring',
    readiness: 'partial',
    note: 'One partially-resolved anchor; the rest of the exact-threshold family is open.',
  },
  {
    id: 'need-reactor-steadystate',
    name: 'Catalytic reactor steady-state verification',
    area: 'Chemical process safety',
    description:
      'Certify whether a mass-action catalytic network admits a stable target intermediate concentration — the input to inherently-safe reactor design and alarm set-point review.',
    chain: [
      {
        id: 'mc-030',
        kind: 'problem',
        role: 'certificate',
        what: 'Certified decidable stability of a target-intermediate concentration for mass-action catalytic networks.',
      },
      {
        id: 'mc-001',
        kind: 'problem',
        role: 'anchor',
        what: 'Global attractor for complex-balanced networks — the global stability behind the local certificate.',
      },
      {
        id: 'mc-002',
        kind: 'problem',
        role: 'anchor',
        what: 'Persistence for weakly reversible networks — the intermediate cannot be driven extinct.',
      },
      {
        id: 'law-mm',
        kind: 'law',
        role: 'law',
        what: 'Bound the QSSA error in the reduced reactor model.',
      },
    ],
    standard: 'IEC 61511 (functional safety – safety instrumented systems)',
    consumable:
      'A certified \u201ctarget intermediate concentration is stable / not\u201d decision with a residual band — consumable for alarm set-points and inherently-safe design.',
    barrier:
      'mc-030 is a certified, consumable decision; the global network theorems (mc-001, mc-002) underpinning it remain open.',
    workflow: 'alarm-setpoint',
    readiness: 'partial',
    note: 'A certified local decision with the global theorems still open behind it.',
  },
  {
    id: 'need-resistance-mgmt',
    name: 'Resistance management in pest / pathogen populations',
    area: 'Agricultural & medical genetics',
    description:
      'Surveillance and dosing decisions need a certified band on the equilibrium frequency of a resistance allele under measurement uncertainty.',
    chain: [
      {
        id: 'mb-028',
        kind: 'problem',
        role: 'certificate',
        what: 'Certified equilibrium allele-frequency band for a resistance allele under measurement uncertainty.',
      },
    ],
    standard: 'IRAC (Insecticide Resistance Action Committee) guidelines',
    consumable:
      'A certified band on the equilibrium resistance-allele frequency under stated measurement error — input to dose and surveillance decisions.',
    barrier: 'The single-locus band is certified; multi-locus / epistatic dynamics remain open.',
    workflow: 'monitoring',
    readiness: 'partial',
    note: 'One consumable certificate; broader dynamics stay open.',
  },
  {
    id: 'need-sensor-placement',
    name: 'Optimal sensor placement with information guarantee',
    area: 'Monitoring & estimation',
    description:
      'Placement of sensors/observers with a provable approximation guarantee for the information gain — the mathematical core of monitoring-network design.',
    chain: [
      {
        id: 'me-030',
        kind: 'problem',
        role: 'certificate',
        what: 'Provable approximation for optimal sensor placement and information gain — a directly consumable placement guarantee.',
      },
    ],
    standard: 'ISO 10012 (measurement management systems)',
    consumable:
      'A sensor placement with a certified approximation ratio to the optimal information gain — consumable for monitoring-network design.',
    barrier:
      'The approximation guarantee (me-030) is certified; a tight constant and certified guarantees under correlated-noise models are not.',
    workflow: 'design-review',
    readiness: 'partial',
    note: 'Readiness corrected to partial: me-030 is a consumable certificate, not merely an open anchor.',
  },
  {
    id: 'need-eit-imaging',
    name: 'Impedance / limited-data imaging guarantee',
    area: 'Medical & industrial imaging',
    description:
      'Electrical-impedance and sparse-view imaging need a certified statement about when boundary data determine the interior uniquely, and how many views are enough.',
    chain: [
      {
        id: 'me-017',
        kind: 'problem',
        role: 'anchor',
        what: 'Global uniqueness for the Calderón problem (Lipschitz case settled; general L\u221e case open) — when EIT data determine the conductivity.',
      },
      {
        id: 'me-021',
        kind: 'problem',
        role: 'anchor',
        what: 'Minimal number of projection directions for uniqueness in discrete tomography — how few views suffice.',
      },
    ],
    standard: 'IEC 60601-2 (medical electrical equipment) / FDA 510(k) imaging review',
    consumable:
      'A certified uniqueness / stability statement for the reconstruction regime, with the number of views or the conductivity class stated — the reliability basis for imaging certification.',
    barrier:
      'The Lipschitz case (me-017, partial) gives partial ground; general L\u221e uniqueness and the discrete-tomography minimal-directions question (me-021) remain open.',
    workflow: 'validation',
    readiness: 'partial',
    note: 'Partial ground from the Lipschitz Calderón case; the general guarantees are open.',
  },
  {
    id: 'need-rom-error',
    name: 'Certified reduced-order model error',
    area: 'Numerical PDE / model reduction',
    description:
      'A reduced-order model used in a V&V workflow needs a certified a-posteriori error bound on its output, not just training-error anecdotes.',
    chain: [
      {
        id: 'me-031',
        kind: 'problem',
        role: 'certificate',
        what: 'Certifiable a-posteriori error bounds for nonlinear model reduction — the consumable output-error certificate.',
      },
    ],
    standard: 'ASME V&V 40 (credibility assessment of computational models)',
    consumable:
      'A certified a-posteriori bound on the reduced-order output error for a stated input class — directly consumable in a model-credibility dossier.',
    barrier:
      'The a-posteriori bound (me-031) is certified; extension to parameterized multi-query and uncertainty-quantification settings is ongoing.',
    workflow: 'validation',
    readiness: 'served',
    note: 'The first fully-served need: a certified error bound is directly consumable, with extension work noted.',
  },
  {
    id: 'need-dft-cert',
    name: 'Certified bounds for DFT functional error',
    area: 'Quantum chemistry / materials',
    description:
      'A materials-screening decision needs certified bounds on the error of a chosen density-functional approximation, grounded in sharp many-body constants.',
    chain: [
      {
        id: 'mc-014',
        kind: 'problem',
        role: 'anchor',
        what: 'Rigorous existence and convexity of the Levy–Lieb universal density functional — the rigorous foundation of DFT.',
      },
      {
        id: 'mc-016',
        kind: 'problem',
        role: 'anchor',
        what: 'The sharp constant in the Lieb–Thirring inequality for fermion kinetic energy — the kinetic-energy bound behind functional error.',
      },
      {
        id: 'mc-017',
        kind: 'problem',
        role: 'certificate',
        what: 'The sharp constant in the Lieb–Oxford inequality — a certified exchange-correlation bound.',
      },
      {
        id: 'mc-023',
        kind: 'problem',
        role: 'anchor',
        what: 'Complete N-representability conditions for the two-electron reduced density matrix — the representability floor.',
      },
    ],
    standard: 'NIST CCCBDB / G2 benchmark sets (computational chemistry validation)',
    consumable:
      'Certified bounds on DFT functional error for a stated electron count, assembled from sharp many-body constants — input to \u201ctrust this DFT prediction\u201d screening.',
    barrier:
      'The Lieb–Oxford constant (mc-017) is certified; Levy–Lieb existence (mc-014), the sharp Lieb–Thirring constant (mc-016) and full N-representability (mc-023) remain open.',
    workflow: 'validation',
    readiness: 'partial',
    note: 'One certified constant plus a stack of open many-body anchors — the sharp-constant ladder for DFT certification.',
  },
  {
    id: 'need-quantum-transport',
    name: 'Certified quantized conductance for quantum devices',
    area: 'Quantum metrology / devices',
    description:
      'A quantum-metrology sign-off needs a certified statement that the conductance quantization (plateaus) survives interactions — the basis of resistance standards.',
    chain: [
      {
        id: 'mp-022',
        kind: 'problem',
        role: 'anchor',
        what: 'Rigorous Kubo conductance and its quantization for interacting electrons — the interaction-robust Hall conductance.',
      },
      {
        id: 'mp-002',
        kind: 'problem',
        role: 'anchor',
        what: 'Sharp exponential mixing for 2D Navier–Stokes with degenerate noise — the transport-side regularity the metrology device inherits.',
      },
    ],
    standard: 'BIPM SI (quantum metrology: quantum Hall / Kibble balance)',
    consumable:
      'A certified quantization statement (conductance plateau) with the interaction regime stated — input to a resistance-standard sign-off.',
    barrier: 'Both supporting problems are open.',
    workflow: 'sign-off',
    readiness: 'gap',
    note: 'The rigorous Kubo-conductance quantization is the mathematical core a quantum-metrology sign-off would cite.',
    sourcing: [
      { kind: 'new', what: '相互作用电子 Kubo 电导的严格量化（mp-022 量子化平台稳健性）' },
      { kind: 'push', target: 'mp-002', what: '耗散混合作为传输侧前置' },
    ],
  },
  {
    id: 'need-learned-control',
    name: 'Certified stability of learned feedback policies',
    area: 'Control / ML safety',
    description:
      'A learned feedback policy needs a certified stability guarantee before deployment in its operational design domain (ODD), replacing simulation-only evaluation.',
    chain: [
      {
        id: 'me-032',
        kind: 'problem',
        role: 'anchor',
        what: 'Sound and scalable stability certification of learned feedback policies — the certificate a deployed policy needs.',
      },
      {
        id: 'me-018',
        kind: 'problem',
        role: 'anchor',
        what: 'Necessary-and-sufficient feedback stabilizability (closing the Brockett–Sontag gap) — the boundary of what any policy can guarantee.',
      },
    ],
    standard: 'ISO 21448 (SOTIF – safety of the intended functionality)',
    consumable:
      'A certified stability certificate for the learned policy within its stated ODD — the formal core of a SOTIF safety case.',
    barrier: 'Both supporting problems are open.',
    workflow: 'safety-case',
    readiness: 'gap',
    note: 'The demand side of the learned-control verification question.',
    sourcing: [
      { kind: 'push', target: 'me-032', what: '学习策略的可证稳定性证书' },
      { kind: 'push', target: 'me-018', what: 'Brockett–Sontag 充要判据' },
      { kind: 'new', what: 'ODD 内 LTI 子类的可判定稳定性判据' },
    ],
  },
  {
    id: 'need-composite-bounds',
    name: 'Certified effective-property bounds for multiphase composites',
    area: 'Materials / homogenization',
    description:
      'A design-allowables decision needs certified attainable bounds on the effective properties of a multiphase composite, reducing reliance on exhaustive testing.',
    chain: [
      {
        id: 'me-028',
        kind: 'problem',
        role: 'anchor',
        what: 'The G-closure and sharp attainable bounds for multiphase composite conductors — the tightest possible property range.',
      },
    ],
    standard: 'ASTM D4762 (design-allowables for polymer-matrix composites)',
    consumable:
      'Certified attainable bounds on the effective conductivity / stiffness of a multiphase composite — design allowables without exhaustive testing.',
    barrier: 'me-028 (G-closure) is open.',
    workflow: 'design-review',
    readiness: 'gap',
    note: 'Sharp attainable bounds are exactly what composite design-allowables are missing.',
    sourcing: [
      { kind: 'push', target: 'me-028', what: 'G-closure 与多相复合材料的锐可达界' },
      { kind: 'new', what: '两相/三相各向同性复合材料的可达界（过渡）' },
    ],
  },
  {
    id: 'need-molecular-screening',
    name: 'Certified descriptor bounds for molecular screening',
    area: 'Materials informatics',
    description:
      'A high-throughput screening pipeline needs certified bounds on molecular descriptors (spectral realizability, π-electron energy) to pre-filter candidate graphs.',
    chain: [
      {
        id: 'mc-003',
        kind: 'problem',
        role: 'certificate',
        what: 'Complete classification of spectra realizable by benzenoid molecular graphs — a consumable spectral realizability test.',
      },
      {
        id: 'mc-012',
        kind: 'problem',
        role: 'anchor',
        what: 'Tight bounds on the extremal Hückel π-electron energy — the energy window for screening.',
      },
      {
        id: 'mc-022',
        kind: 'problem',
        role: 'anchor',
        what: 'The maximum number of Kekulé structures in benzenoid hydrocarbons — the aromaticity ceiling.',
      },
    ],
    standard: 'OECD QSAR Toolbox (read-across guidance for chemical screening)',
    consumable:
      'Certified descriptor bounds (spectral realizability / energy window) for fast pre-screening of candidate molecular graphs.',
    barrier:
      'Spectral classification (mc-003) is certified; extremal-energy (mc-012) and Kekulé-count (mc-022) bounds remain open.',
    workflow: 'screening',
    readiness: 'partial',
    note: 'One consumable classification plus two open extremal bounds — the screening floor.',
  },
  {
    id: 'need-seasonal-epidemic',
    name: 'Vaccination timing under seasonal forcing',
    area: 'Public health',
    description:
      'Seasonal-flu planning needs a certified map of forcing amplitude × period → lock-in vs. fade regions, to time vaccination and dosing to the season.',
    chain: [
      {
        id: 'mb-026',
        kind: 'problem',
        role: 'anchor',
        what: 'Sharp Arnold tongues for subharmonic response in seasonally forced SIR — the lock-in regions a seasonal strategy must respect.',
      },
    ],
    standard: 'WHO influenza vaccine strain-selection & timing guidance',
    consumable:
      'A certified map of forcing amplitude × period → lock-in / fade regions for the SIR response — input to seasonal vaccination timing.',
    barrier: 'mb-026 is open.',
    workflow: 'monitoring',
    readiness: 'gap',
    note: 'Sharp Arnold tongues would turn seasonal-flu timing from heuristic to certified.',
    sourcing: [
      { kind: 'push', target: 'mb-026', what: '季节强迫 SIR 的锐 Arnold 舌' },
      { kind: 'new', what: '周期强迫下 SIR 的次谐波响应区域地图（过渡）' },
    ],
  },
  {
    id: 'need-eda-routing',
    name: 'Certified layout / routing budget for chip wiring',
    area: 'Chip design / EDA',
    description:
      'A place-and-route sign-off needs a certified upper bound on wiring cost or layout bandwidth, so \u201cthis netlist fits in this routing budget\u201d is a provable claim instead of an empirical guess.',
    chain: [
      {
        id: 'me-011',
        kind: 'problem',
        role: 'anchor',
        what: 'Determine the exact constant-factor approximation for graphic TSP — the wiring-cost ratio behind global routing budgets.',
      },
      {
        id: 'me-010',
        kind: 'problem',
        role: 'related',
        what: 'Decide whether graph bandwidth is constant-approximable — the layout-quality bound that decides fill-in and communication loads in LSI routing.',
      },
      {
        id: 'me-012',
        kind: 'problem',
        role: 'related',
        what: 'Strongly polynomial LP — the solver guarantee that placement / timing optimizers rely on.',
      },
    ],
    standard: 'IEEE CEDA / ISPD & ICCAD benchmark suites (place-and-route)',
    consumable:
      'A certified upper bound on routing cost or layout bandwidth with its approximation ratio stated — consumable as a wiring-budget envelope at place-and-route sign-off.',
    barrier:
      'me-011 (graphic TSP 4/3) and me-010 (bandwidth constant-approximability) are both open; no certified constant bounds any EDA wiring budget today.',
    workflow: 'screening',
    readiness: 'gap',
    note: 'The EDA demand side: certified layout/routing bounds, not heuristics, are what \u201cguaranteed routability\u201d would rest on.',
    sourcing: [
      { kind: 'push', target: 'me-011', what: '图 TSP 4/3 猜想' },
      { kind: 'push', target: 'me-010', what: '图带宽常数近似' },
      { kind: 'new', what: '网格图/稀疏图上布线成本的锐上界（过渡锚点）' },
    ],
  },
  {
    id: 'need-plc-stabilization',
    name: 'Certified controller-form selection for safety-instrumented functions',
    area: 'Industrial control / safety instrumented systems',
    description:
      'A safety-instrumented function needs a certified decision on which feedback form is implementable (continuous / Lipschitz vs. discontinuous), so the chosen controller structure is provably able to stabilize the process, not just tuned in simulation.',
    chain: [
      {
        id: 'me-018',
        kind: 'problem',
        role: 'anchor',
        what: 'A necessary-and-sufficient criterion for continuous feedback stabilizability (Brockett\u2013Sontag gap) — the boundary of what smooth embedded control can guarantee.',
      },
      {
        id: 'me-001',
        kind: 'problem',
        role: 'related',
        what: 'Certified nonlinear consensus convergence — the multi-loop coordination guarantee safety loops inherit.',
      },
    ],
    standard: 'IEC 61508 / IEC 61511 (functional safety of SIS)',
    consumable:
      'A certified \u201ccontinuous feedback exists / does not\u201d criterion for the safety function, with the controller form implied — input to SIS design and FAT/SAT review.',
    barrier: 'me-018 is open; no necessary-and-sufficient stabilizability criterion exists for the general nonlinear class.',
    workflow: 'safety-case',
    readiness: 'gap',
    note: 'The safety-instrumented demand side: choosing the controller form is currently heuristic; a certified criterion would make it a decision.',
    sourcing: [
      { kind: 'push', target: 'me-018', what: 'Brockett–Sontag 充要判据' },
      { kind: 'new', what: '仿射非线性系统的 Lipschitz 镇定可判性（过渡）' },
    ],
  },
  {
    id: 'need-lattice-thermal',
    name: 'Certified lattice thermal transport for energy materials',
    area: 'Energy / materials',
    description:
      'A materials-screening decision for heat management (thermoelectric, battery, device substrate) needs a certified statement about when a lattice reaches thermal (Fourier) behaviour — the equilibration clock behind conductivity budgets.',
    chain: [
      {
        id: 'mp-003',
        kind: 'problem',
        role: 'anchor',
        what: 'Prove the thermalization time of the FPUT lattice — the equilibration clock bounding how long a lattice takes to approach thermal-transport behaviour.',
      },
      {
        id: 'law-fourier',
        kind: 'law',
        role: 'law',
        what: 'Bound the residual of Fourier\u2019s law vs. microscopic phonon transport at device scale — the conduction-side assumption.',
      },
      {
        id: 'mp-041',
        kind: 'problem',
        role: 'related',
        what: 'Certify the convection-side thermal margin — the other half of the heat-management budget.',
      },
    ],
    standard: 'ASTM E1225 / D5470 (thermal conductivity & thermal-resistance measurement)',
    consumable:
      'A certified conductivity bound or residual band on Fourier\u2019s law for a stated lattice class — consumable in a thermal-management screening.',
    barrier:
      'mp-003 (FPUT thermalization) is open and law-fourier has no strict microscopic derivation; only the convection side (mp-041) is certified.',
    workflow: 'validation',
    readiness: 'gap',
    note: 'The conduction side of thermal budgets lacks any certified microscopic anchor; the convection side is already served.',
    sourcing: [
      { kind: 'push', target: 'mp-003', what: 'FPUT 热化时间（均匀 N 的 KAM/Nekhoroshev 常数）' },
      { kind: 'new', what: '谐波晶格声子色散的严格界（过渡）' },
    ],
  },
  {
    id: 'need-bioprocess-oscillation',
    name: 'Certified oscillation / limit-cycle behaviour in bioprocess networks',
    area: 'Bioprocess engineering',
    description:
      'A continuous-culture design needs a certified classification of when a mass-action network admits sustained oscillations vs. a stable operating point, replacing time-series heuristics for \u201cwill this culture cycle?\u201d.',
    chain: [
      {
        id: 'mc-011',
        kind: 'problem',
        role: 'anchor',
        what: 'Separate multistationarity from monostationarity for deficiency-one networks — the structural route to deciding multi-regime behaviour.',
      },
      {
        id: 'mc-004',
        kind: 'problem',
        role: 'related',
        what: 'Classify small reaction networks admitting multistationarity — the switch/oscillation detection floor.',
      },
      {
        id: 'law-monod',
        kind: 'law',
        role: 'law',
        what: 'Bound the Monod growth-law residual in reduced culture models — the growth assumption behind oscillation predictions.',
      },
    ],
    standard: 'ICH Q13 (continuous manufacturing of drug substances)',
    consumable:
      'A certified multistationarity / oscillation classification for the culture network — a computed yes/no with a witness, consumable in continuous-manufacturing design review.',
    barrier: 'mc-011 and mc-004 are open; Monod has no mechanistic derivation (law-monod, gap).',
    workflow: 'monitoring',
    readiness: 'gap',
    note: 'Oscillation vs. stable-operating-point is currently a simulation guess; a structural classification would certify it.',
    sourcing: [
      { kind: 'new', what: 'mass-action 网络振荡性的可判定判据（deficiency 分类 → 动态判据）' },
    ],
  },
  {
    id: 'need-provisioning-worstcase',
    name: 'Worst-case resource provisioning for logistics / packaging',
    area: 'Supply chain / operations',
    description:
      'A capacity-planning decision (containers, warehouse bins, packaging lanes) needs a certified worst-case provisioning ratio, so over-provisioning is justified by a proven bound rather than by rule-of-thumb safety factors.',
    chain: [
      {
        id: 'me-013',
        kind: 'problem',
        role: 'anchor',
        what: 'Determine the optimal asymptotic competitive ratio for online bin packing — the certified worst-case provisioning factor.',
      },
    ],
    standard: 'ISO 28000 (supply-chain security management) / capacity-planning practice',
    consumable:
      'A certified worst-case packing ratio with its tightness established — directly sets the over-provisioning factor in capacity planning.',
    barrier: 'me-013 is open; the exact infimum of the competitive ratio is not settled.',
    workflow: 'deployment',
    readiness: 'gap',
    note: 'Capacity over-provisioning currently rests on empirical factors; a tight certified ratio would replace them.',
    sourcing: [
      { kind: 'push', target: 'me-013', what: '在线装箱最优渐近竞争比' },
      { kind: 'new', what: '特定箱型族（如 1D bin packing）的锐界（过渡）' },
    ],
  },
  {
    id: 'need-grid-frequency-control',
    name: 'Certified frequency-regulator convergence for power grids',
    area: 'Power / energy systems',
    description:
      'A secondary frequency-regulation (AGC) design needs a certified convergence bound for the distributed consensus protocol over time-varying / quantized communication links — the formal basis of \u201cAGC converges this fast\u201d.',
    chain: [
      {
        id: 'me-034',
        kind: 'problem',
        role: 'certificate',
        what: 'Optimal worst-case convergence time for finite-rate quantized average consensus — a directly consumable worst-case bound for the deployed AGC protocol.',
      },
      {
        id: 'me-002',
        kind: 'problem',
        role: 'anchor',
        what: 'Tight lower bounds for decentralized optimization over time-varying graphs — how fast frequency regulation is provably impossible to go.',
      },
      {
        id: 'me-001',
        kind: 'problem',
        role: 'anchor',
        what: 'Prove a certified convergence rate for nonlinear multi-agent consensus — the nonlinear guarantee behind AGC under load dynamics.',
      },
    ],
    standard: 'NERC BAL-001 / ENTSO-E frequency-response requirements',
    consumable:
      'A certified worst-case convergence-time bound for the AGC consensus protocol under quantization and link dropout — input to frequency-response compliance.',
    barrier:
      'The quantized worst-case bound (me-034) is certified and consumable; the time-varying-graph lower bound (me-002) and nonlinear guarantee (me-001) remain open.',
    workflow: 'monitoring',
    readiness: 'partial',
    note: 'One consumable certificate (me-034) with the graph lower bounds still open behind it.',
    sourcing: [
      { kind: 'push', target: 'me-002', what: '时变图下界' },
      { kind: 'push', target: 'me-001', what: '非线性共识收敛保证' },
      { kind: 'new', what: '量化 + 丢包的 AGC 一致性最坏收敛时间推广（过渡）' },
    ],
  },
]

const _byId = new Map(ENGINEERING_NEEDS.map((n) => [n.id, n]))

export function needById(id: string): EngineeringNeed | undefined {
  return _byId.get(id)
}

/** 反查深化：某目录问题在每条倒查需求里扮演的角色、链步当前状态与"要证什么"。 */
export interface NeedDemandLink {
  need: EngineeringNeed
  step: NeedChainStep
  /** 该链步当前状态（从目录推导）：本问题此刻在这条需求里是可消费 / 部分 / 开放。 */
  state: NeedStepState
}

export function demandLinksForProblem(problemId: string): NeedDemandLink[] {
  const links: NeedDemandLink[] = []
  for (const n of ENGINEERING_NEEDS) {
    for (const s of n.chain) {
      if (s.kind === 'problem' && s.id === problemId) links.push({ need: n, step: s, state: chainStepState(s) })
    }
  }
  return links
}

/** 需求侧聚合覆盖：被倒查的问题/定律数、就绪度分布、工作流落点数（供 NeedsPage 顶部统计条）。 */
export function demandCoverage(): {
  needs: number
  readiness: Record<NeedReadiness, number>
  problems: number
  laws: number
  workflows: number
} {
  const problems = new Set<string>()
  const laws = new Set<string>()
  const readiness: Record<NeedReadiness, number> = { served: 0, partial: 0, gap: 0 }
  const workflows = new Set<NeedWorkflow>()
  for (const n of ENGINEERING_NEEDS) {
    readiness[n.readiness]++
    workflows.add(n.workflow)
    for (const s of n.chain) (s.kind === 'problem' ? problems : laws).add(s.id)
  }
  return { needs: ENGINEERING_NEEDS.length, readiness, problems: problems.size, laws: laws.size, workflows: workflows.size }
}

// ── 判定链步骤的派生状态（只读、从目录推导，供页面与 API 共用同一实现）──
import { PROBLEMS } from './problems'
import { LAWS } from './laws'

export type NeedStepState = 'open' | 'partial' | 'served'
const _stepProblem = new Map(PROBLEMS.map((p) => [p.id, p]))
const _stepLaw = new Map(LAWS.map((l) => [l.id, l]))

/** 链步就绪度：certificate+带证书 → served；partial 问题/定律 → partial；其余 open。 */
export function chainStepState(step: Pick<NeedChainStep, 'id' | 'kind' | 'role'>): NeedStepState {
  if (step.kind === 'law') {
    const l = _stepLaw.get(step.id)
    if (!l) return 'open'
    if (l.status === 'formalized') return 'served'
    return l.status === 'partial' ? 'partial' : 'open'
  }
  const p = _stepProblem.get(step.id)
  if (!p) return 'open'
  if (step.role === 'certificate' && p.certificate) return 'served'
  if (p.status === 'partial') return 'partial'
  return 'open'
}

