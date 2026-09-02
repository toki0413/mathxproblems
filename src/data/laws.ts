// Empirical-law formalization boundary map: turn the empirical laws engineers
// rely on every day into verifiable boundary entries.
//
// The movement's mirror: engineers daily use laws that are unproven and only
// valid inside a regime. Each entry answers five questions — how it is used,
// its strict formal statement, its assumptions, where it breaks (the boundary),
// and the formalization gap (what to prove, which mathlib tools are needed) —
// and carries a three-layer residual band (the contract v0.1 Certificate
// semantics). status marks how far it is from "machine-verifiable":
//   formalized = strict result exists; partial = partly valid / partly gapped;
//   gap = open gap overall.
//
// Relation to the protocol layer: each "boundary claim" is one verifiable
// judgement, later backed by the reference verifier (contracts/verifier.ts)
// and the append-only ledger; status='gap' entries flow into the movement's
// demand list (the problem→tool direction, consumed by provers via laws.json).

import type { ToolLink } from '@/data/mathlibTools'

export type LawStatus = 'formalized' | 'partial' | 'gap'

export interface LawResiduals {
  r_model: string
  r_param: string
  r_num: string
}

export interface EmpiricalLaw {
  id: string
  name: string
  /** Industry / engineering domain (list grouping). */
  industry: string
  /** How engineers use it day to day. */
  usage: string
  /** Strict formal statement (provable under which assumptions). */
  formal_statement: string
  /** Assumptions under which it holds. */
  assumptions: string[]
  /** Failure regime / boundary (the focal point of this map). */
  boundary: string
  /** Formalization gap: what would have to be proved. */
  gap: string
  /** Three-layer residuals (contract v0.1 Certificate semantics). */
  residuals: LawResiduals
  /** Suggested tools (reusing the mathlibTools registry). */
  tool_links: ToolLink[]
  status: LawStatus
  refs?: { label: string; url: string }[]
}

export const LAW_STATUSES: LawStatus[] = ['formalized', 'partial', 'gap']

export const LAW_STATUS_LABEL: Record<LawStatus, string> = {
  formalized: 'Formalized',
  partial: 'Partial',
  gap: 'Gap',
}

export const LAWS: EmpiricalLaw[] = [
  {
    id: 'law-mm',
    name: 'Michaelis–Menten kinetics',
    industry: 'Bioprocess engineering',
    usage: 'v₀ = Vmax·[S]/(Km + [S]) describes the initial rate of single-substrate enzyme reactions — the default assumption in enzyme kinetics and metabolic modeling.',
    formal_statement:
      'Under the quasi-steady-state approximation (d[ES]/dt ≈ 0) with [S] ≫ [E]₀, the initial rate v₀ = Vmax[S]/(Km+[S]) is strictly derivable.',
    assumptions: ['Substrate far in excess of enzyme [S] ≫ [E]₀', 'Quasi-steady-state approximation (QSSA)', 'Irreversible, no product inhibition', 'Well mixed'],
    boundary:
      'QSSA breaks down when [S] approaches [E]₀, enzyme time scales are comparable to substrate depletion, or product inhibition is significant — exactly the transient / high-cell-density segments of fed-batch fermentation.',
    gap: 'Strict error bounds (residual upper bounds) for the QSSA on general reaction networks are still missing; only a few special cases have explicit bounds.',
    residuals: {
      r_model: 'Residual bound dropped by the QSSA idealization (missing in most cases)',
      r_param: 'Uncertainty in the empirical calibration of Vmax / Km',
      r_num: 'Numerical residual of curve fitting',
    },
    tool_links: [
      { tool_id: 'lattice-order', role: 'partial' },
      { tool_id: 'dynamical-systems', role: 'partial' },
      { tool_id: 'interval-numerics', role: 'available' },
    ],
    status: 'partial',
  },
  {
    id: 'law-monod',
    name: 'Monod growth law',
    industry: 'Bioprocess engineering',
    usage: 'μ = μmax·S/(Ks + S) relates the specific microbial growth rate to the limiting substrate concentration — the basis of fermentation and bioreactor design.',
    formal_statement:
      'A purely empirical relation: unlike Michaelis–Menten it has no mechanistic derivation; it is a curve fit to experimental data with no first-principles basis.',
    assumptions: ['Single limiting substrate', 'No inhibition', 'Steady-state continuous culture'],
    boundary:
      'Fails under substrate inhibition, maintenance metabolism, multi-substrate co-metabolism and non-steady batch phases; having no mechanistic basis, any extrapolation outside the calibrated regime has no mathematical guarantee.',
    gap: 'A strict derivation or error bound of Monod form from a cellular metabolic network — an open gap overall; the cleanest sample of an "unproven law".',
    residuals: {
      r_model: 'Model residual of collapsing a whole class of metabolic reactions into a single growth law (no bound available)',
      r_param: 'Uncertainty in the empirical parameters μmax / Ks',
      r_num: 'Numerical residual of batch-experiment fitting',
    },
    tool_links: [
      { tool_id: 'dynamical-systems', role: 'partial' },
      { tool_id: 'lattice-order', role: 'partial' },
    ],
    status: 'gap',
  },
  {
    id: 'law-mixinglength',
    name: 'Mixing-length turbulence closure',
    industry: 'Energy / CFD',
    usage: 'τ_turb = ρl²|∂u/∂y|(∂u/∂y) (Prandtl mixing length) gives an algebraic closure for turbulent shear stress — the bedrock of engineering turbulence models.',
    formal_statement:
      'Semi-empirical: it draws an analogy between turbulent stress and molecular viscosity with no strict derivation; it is upheld only by agreement with experiment in specific flow shapes.',
    assumptions: ['Local equilibrium', 'Single length scale l', 'Two-dimensional shear flow'],
    boundary:
      'Fails outright in boundary-layer separation, strong curvature and non-equilibrium / transitional turbulence; the whole family of algebraic / one-equation closures has no rigorous mathematical basis.',
    gap: 'Strictly deriving an error bound for any algebraic closure from the Navier–Stokes equations — the twin gap of catalog problem mp-008.',
    residuals: {
      r_model: 'Residual bound of the closure idealization (essentially absent)',
      r_param: 'Empirical calibration of the mixing length l',
      r_num: 'Numerical discretization residual',
    },
    tool_links: [
      { tool_id: 'measure-ergodic', role: 'partial' },
      { tool_id: 'analysis-asymptotics', role: 'partial' },
      { tool_id: 'interval-numerics', role: 'partial' },
    ],
    status: 'gap',
  },
  {
    id: 'law-fourier',
    name: "Fourier's law of heat conduction",
    industry: 'Energy / thermal management',
    usage: 'q = −k∇T relates heat flux to temperature gradient — the foundation of nearly all thermal simulation (chips, batteries, buildings).',
    formal_statement:
      'Derivable from kinetic theory under local thermal equilibrium and a domain much larger than the phonon mean free path; it fails at the nanoscale and under ultrafast heating.',
    assumptions: ['Local thermal equilibrium', 'Domain size ≫ phonon mean free path', 'Isotropic conductivity k'],
    boundary:
      'Fails when device feature sizes are comparable to the phonon MFP (chip hot spots, nanoscale films) or under ultrafast heating; k itself is an empirical quantity.',
    gap: 'A strict limiting derivation from kinetic theory (phonon Boltzmann equation) to Fourier with explicit residuals — a heat-transfer analogue of the catalog problems.',
    residuals: {
      r_model: 'Residual bound of the local-equilibrium idealization',
      r_param: 'Uncertainty in the measured / calibrated conductivity k',
      r_num: 'Numerical solution residual',
    },
    tool_links: [
      { tool_id: 'analysis-asymptotics', role: 'partial' },
      { tool_id: 'measure-ergodic', role: 'partial' },
      { tool_id: 'interval-numerics', role: 'available' },
    ],
    status: 'partial',
  },
  {
    id: 'law-darcy',
    name: "Darcy's law",
    industry: 'Energy / porous media',
    usage: 'q = −(k/μ)∇p describes slow seepage in porous media — the basis of oil & gas recovery, groundwater and fuel-cell flow-field design.',
    formal_statement:
      'Derivable by homogenization from the Navier–Stokes equations under low Reynolds number, Newtonian incompressible flow and a homogeneous isotropic medium.',
    assumptions: ['Low Reynolds number (laminar)', 'Newtonian incompressible fluid', 'Homogeneous isotropic medium'],
    boundary:
      'Fails at high Reynolds number / inertial effects (needs the Forchheimer correction) and in fractured / non-Darcy media.',
    gap: 'Strict homogenization from Navier–Stokes to Darcy with explicit residual upper bounds (with Reynolds-number dependence).',
    residuals: {
      r_model: 'Residual bound of the homogenization idealization',
      r_param: 'Uncertainty in the measured permeability k',
      r_num: 'Numerical discretization residual',
    },
    tool_links: [
      { tool_id: 'analysis-asymptotics', role: 'partial' },
      { tool_id: 'polynomial-real', role: 'partial' },
    ],
    status: 'partial',
  },
  {
    id: 'law-snf',
    name: 'S–N fatigue curve & Miner linear damage rule',
    industry: 'Structures / materials',
    usage: 'Miner\'s rule D = Σ(nᵢ/Nᵢ) predicts fatigue damage accumulation — the standard practice in mechanical / structural life assessment.',
    formal_statement:
      'Purely empirical: it assumes linear, order-independent damage accumulation; the S–N curve itself is a statistical fit to fatigue tests.',
    assumptions: ['Linear accumulation', 'Constant-amplitude loading', 'No load-order effects'],
    boundary:
      'Under multi-axial loading, load sequencing (high-low / low-high) and overload effects, Miner\'s rule has been repeatedly falsified by experiment; extrapolating S–N curves to large cycle counts has no guarantee.',
    gap: 'A strict derivation of an accumulation law with error bounds from damage mechanisms (crack initiation / growth) — the whole class has no rigorous theory.',
    residuals: {
      r_model: 'Residual bound of the linear-accumulation idealization',
      r_param: 'Statistical calibration uncertainty of the S–N curve',
      r_num: 'Numerical residual of life prediction',
    },
    tool_links: [
      { tool_id: 'stochastic-processes', role: 'partial' },
      { tool_id: 'interval-numerics', role: 'partial' },
    ],
    status: 'gap',
  },
]

/** Industries present in the catalog, for list grouping. */
export const LAW_INDUSTRIES: string[] = [...new Set(LAWS.map((l) => l.industry))]
