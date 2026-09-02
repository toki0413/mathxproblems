// Engineering-need reverse demand list (C: 工程反向需求清单).
//
// 工程师带着一个具体需求来（"我要给散热器一个可核验的热裕量""我要给生物反应器
// 一个不塌方的稳定性证书"），MathX 反向回答：哪些问题/定律支撑这个需求、现在
// 到什么程度、缺口在哪。这是双桥愿景的需求侧入口——工程问题 ↔ 可证判定。
//
// 诚实规则（由 scripts/check-needs.mjs 在 CI 强制）：
//   - problems 里每个 id 必须存在于目录；laws 里每个 id 必须存在于 laws.ts；
//   - readiness 枚举合法；need id 唯一；
//   - 每条需求必须锚定真实问题（禁止凭空编造"支撑问题"）。
//
// readiness 语义：
//   served  = 已有可直接消费的证书（verified_behavior + certificate 已闭环）；
//   partial = 至少一个可消费锚点（证书题 / 部分已解决题），但整体缺口仍在；
//   gap     = 支撑题全部开放，无任何可消费证书。

export type NeedReadiness = 'served' | 'partial' | 'gap'
/** 问题在需求中的角色：certificate=可直接消费的证书；anchor=奠基性结构证；related=支撑/相关。 */
export type NeedProblemRole = 'certificate' | 'anchor' | 'related'

export interface EngineeringNeed {
  id: string
  /** 工程需求名（工程师视角）。 */
  name: string
  /** 所属工程领域（分组）。 */
  area: string
  /** 工程师要 certify/decide 什么。 */
  description: string
  /** 支撑它的目录问题（真实 id）。 */
  problems: { id: string; role: NeedProblemRole }[]
  /** 牵涉的经验定律（laws.ts 的 id）。 */
  laws: string[]
  readiness: NeedReadiness
  /** 诚实的现状/缺口说明。 */
  note: string
}

export const NEED_READINESS_LABEL: Record<NeedReadiness, string> = {
  served: 'Served',
  partial: 'Partial',
  gap: 'Gap',
}

export const ENGINEERING_NEEDS: EngineeringNeed[] = [
  {
    id: 'need-thermal-margin',
    name: 'Certified thermal margin for convective cooling',
    area: 'Thermal engineering',
    description:
      'A design-review decision: given a heat-sink geometry and a Rayleigh–Bénard-style flow regime, certify an upper bound on the Nusselt number and a peak-temperature margin that does not rely on unverified CFD.',
    problems: [
      { id: 'mp-037', role: 'certificate' },
      { id: 'mp-041', role: 'certificate' },
    ],
    laws: ['law-fourier'],
    readiness: 'partial',
    note: 'Two certified-band problems exist (heat transport upper bound; heat-sink margin). Fourier\u2019s-law gap from microscopic dynamics remains open — the residual band is the honest boundary.',
  },
  {
    id: 'need-turbulence-closure',
    name: 'Turbulence closure error bound',
    area: 'CFD / aerospace',
    description:
      'RANS/LES closures need a certified statement about the dissipation mechanism they model: does the zero-viscosity limit dissipate anomalously, and can the mixing-length ansatz be bounded?',
    problems: [
      { id: 'mp-008', role: 'anchor' },
      { id: 'mp-036', role: 'anchor' },
    ],
    laws: ['law-mixinglength'],
    readiness: 'gap',
    note: 'Both supporting problems are open; the Prandtl mixing-length law is an unproven empirical closure with a documented failure regime (law-mixinglength, gap).',
  },
  {
    id: 'need-consensus-rate',
    name: 'Consensus convergence-rate guarantee',
    area: 'Control / multi-agent',
    description:
      'A distributed controller for a fleet (UAV, sensor, robot) needs a certified convergence rate over time-varying / quantized links, replacing simulation-only tuning.',
    problems: [
      { id: 'me-001', role: 'anchor' },
      { id: 'me-002', role: 'anchor' },
      { id: 'me-034', role: 'anchor' },
    ],
    laws: [],
    readiness: 'gap',
    note: 'All three supporting problems are open (verified_truth, no consumable certificate yet). This is the demand side of the consensus toolbox.',
  },
  {
    id: 'need-flocking-safety',
    name: 'Flocking / swarm safety certificate',
    area: 'Safety-critical autonomy',
    description:
      'Certify that a proposed flocking law converges to a safe formation (no scattering, no collision) before deployment in autonomous swarms.',
    problems: [{ id: 'me-003', role: 'anchor' }],
    laws: [],
    readiness: 'gap',
    note: 'The Cucker–Smale unconditional-flocking question is open; no certificate exists. A proof would be the mathematical core of a swarm-safety certificate.',
  },
  {
    id: 'need-bioreactor-robustness',
    name: 'Bioreactor robustness — no species collapse',
    area: 'Bioprocess engineering',
    description:
      'Certify that a continuous bioreactor\u2019s mass-action network persists (no species goes extinct) and relaxes to a stable operating point across feed perturbations.',
    problems: [
      { id: 'mc-001', role: 'anchor' },
      { id: 'mc-002', role: 'anchor' },
      { id: 'mc-027', role: 'certificate' },
    ],
    laws: ['law-mm', 'law-monod'],
    readiness: 'partial',
    note: 'mc-027 gives rigorous error bounds for the stochastic quasi-steady-state approximation (a consumable anchor), but the global-attractor and persistence conjectures behind it remain open; Michaelis–Menten and Monod are empirical with documented boundaries.',
  },
  {
    id: 'need-multistationarity',
    name: 'Multistationarity / switch design',
    area: 'Synthetic biology',
    description:
      'Engineers designing synthetic circuits need to decide algorithmically whether a proposed reaction network admits multiple steady states (a bistable switch).',
    problems: [
      { id: 'mc-004', role: 'anchor' },
      { id: 'mc-011', role: 'anchor' },
    ],
    laws: ['law-mm'],
    readiness: 'gap',
    note: 'Classification problems are open; a decidable multistationarity criterion would turn switch design into a certified decision.',
  },
  {
    id: 'need-epidemic-threshold',
    name: 'Epidemic intervention thresholds',
    area: 'Public health',
    description:
      'Intervention planning (vaccination, isolation, demography-aware control) needs exact epidemic thresholds rather than mean-field approximations.',
    problems: [
      { id: 'mb-002', role: 'anchor' },
      { id: 'mb-005', role: 'anchor' },
      { id: 'mb-011', role: 'anchor' },
      { id: 'mb-013', role: 'anchor' },
    ],
    laws: [],
    readiness: 'partial',
    note: 'mb-005 is partially resolved (clustered SIR threshold); the exact SIS lifetime, contact-process critical value and demography-aware SIR thresholds remain open.',
  },
  {
    id: 'need-reactor-steadystate',
    name: 'Catalytic reactor steady-state verification',
    area: 'Chemical process safety',
    description:
      'Certify whether a mass-action catalytic network admits a stable target intermediate concentration — the input to inherently-safe reactor design and alarm set-point review.',
    problems: [
      { id: 'mc-030', role: 'certificate' },
      { id: 'mc-001', role: 'anchor' },
      { id: 'mc-002', role: 'anchor' },
    ],
    laws: ['law-mm'],
    readiness: 'partial',
    note: 'mc-030 is a certified decidable-stability certificate (consumable); the global network theorems underpinning it are open.',
  },
  {
    id: 'need-resistance-mgmt',
    name: 'Resistance management in pest / pathogen populations',
    area: 'Agricultural & medical genetics',
    description:
      'Surveillance and dosing decisions need a certified band on the equilibrium frequency of a resistance allele under measurement uncertainty.',
    problems: [{ id: 'mb-028', role: 'certificate' }],
    laws: [],
    readiness: 'partial',
    note: 'mb-028 supplies a certified allele-frequency band (consumable); broader multi-locus dynamics remain open.',
  },
  {
    id: 'need-sensor-placement',
    name: 'Optimal sensor placement with information guarantee',
    area: 'Monitoring & estimation',
    description:
      'Placement of sensors/observers with a provable approximation guarantee for the information gain — the mathematical core of monitoring-network design.',
    problems: [{ id: 'me-030', role: 'anchor' }],
    laws: [],
    readiness: 'gap',
    note: 'me-030 (provable approximation for optimal sensor placement) is open; a certificate would directly serve monitoring-network certification.',
  },
]

const _byId = new Map(ENGINEERING_NEEDS.map((n) => [n.id, n]))

export function needById(id: string): EngineeringNeed | undefined {
  return _byId.get(id)
}
