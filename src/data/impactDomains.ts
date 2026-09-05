// Impact-domain evidence registry (B5: 影响域实证链).
//
// 信任修复（2026-08）删除了 AI 外推的影响域后，站内只剩 15 题遗留的
// `IMPACT_DOMAINS` 字符串映射、零证据。本注册表把每个影响域从"一句话标签"
// 升级为"可验证的证据链"：每条 literature-backed 证据都对应一篇真实的 arXiv
// 论文（2026-09-02 通过 arXiv API 检索并逐一验证 abs URL 存活，非生成/伪造），
// 且该论文确实把对应问题族与该工程域连接起来。
//
// 诚实规则（由 scripts/check-impact.mjs 在 CI 强制）：
//   - literature-backed 必须 ≥1 条 evidence，且 url 为 https://arxiv.org/abs/…
//   - AI-drafted 是给专家留白的框架条目，禁止挂任何未经验证的论文；
//   - 目录中引用的每个影响域字符串都必须能在本注册表中解析到。
//
// evidence.role:  paper 如何支撑该连接（grounding=论文本身建立问题↔域的联系）。

export interface ImpactEvidence {
  /** 论文标题（arXiv API 结果原样）。 */
  title: string
  /** 前几位作者（原样）。 */
  authors: string[]
  /** 发表年份（arXiv published 日期）。 */
  year: string
  /** arXiv abs 稳定链接——可核验锚点。 */
  url: string
  /** 支撑角色：grounding = 论文直接建立问题族↔工程域的联系。 */
  role: 'grounding'
}

export type ImpactDomainStatus = 'literature-backed' | 'AI-drafted'

export interface ImpactDomainRecord {
  id: string
  /** 工程域名称，与 problems.ts 中 impactOf() 返回的字符串一致。 */
  name: string
  /** 该域代表的工程需求。 */
  description: string
  evidence: ImpactEvidence[]
  status: ImpactDomainStatus
  /** 证据检索/核验日期。 */
  retrieved: string
}

const ev = (
  title: string,
  authors: string[],
  year: string,
  url: string,
): ImpactEvidence => ({ title, authors, year, url, role: 'grounding' })

export const IMPACT_DOMAIN_RECORDS: ImpactDomainRecord[] = [
  // ── 数学物理（mp）──
  {
    id: 'rare-gases',
    name: 'Rarefied gas engineering',
    description:
      'High-altitude / low-pressure flows (spacecraft re-entry, MEMS, vacuum systems) where the continuum Navier–Stokes description fails and kinetic theory is the working model.',
    evidence: [
      ev(
        'Fluid dynamics at arbitrary Knudsen on a base of Alexeev-Boltzmann equation: sound in a rarefied gas',
        ['Sergey B. Leble', 'Maxim A. Solovchuk'],
        '2006',
        'https://arxiv.org/abs/physics/0608133',
      ),
    ],
    status: 'literature-backed',
    retrieved: '2026-09-02',
  },
  {
    id: 'aero-aero',
    name: 'Aerospace aerodynamics',
    description:
      'Rarefied and transitional flow regimes around hypersonic vehicles; kinetic-level correctness of Boltzmann-type models underpins aerodynamic and thermal design.',
    evidence: [
      ev(
        'Fluid dynamics at arbitrary Knudsen on a base of Alexeev-Boltzmann equation: sound in a rarefied gas',
        ['Sergey B. Leble', 'Maxim A. Solovchuk'],
        '2006',
        'https://arxiv.org/abs/physics/0608133',
      ),
    ],
    status: 'literature-backed',
    retrieved: '2026-09-02',
  },
  {
    id: 'nonlin-lattice',
    name: 'Nonlinear lattice devices',
    description:
      'Mechanical/acoustic metamaterials and lattice wave devices whose energy transport is governed by nonlinear chain dynamics (FPU-type).',
    evidence: [
      ev(
        'Ballistic resonance and thermalization in Fermi-Pasta-Ulam-Tsingou chain at finite temperature',
        ['Vitaly A. Kuzkin', 'Anton M. Krivtsov'],
        '2019',
        'https://arxiv.org/abs/1910.12573',
      ),
    ],
    status: 'literature-backed',
    retrieved: '2026-09-02',
  },
  {
    id: 'energy-transport',
    name: 'Energy transport design',
    description:
      'Thermal management of nanoscale and lattice-based devices where heat transport departs from Fourier\u2019s law; rigorous FPU thermalization results bound design uncertainty.',
    evidence: [
      ev(
        'Ballistic resonance and thermalization in Fermi-Pasta-Ulam-Tsingou chain at finite temperature',
        ['Vitaly A. Kuzkin', 'Anton M. Krivtsov'],
        '2019',
        'https://arxiv.org/abs/1910.12573',
      ),
    ],
    status: 'literature-backed',
    retrieved: '2026-09-02',
  },
  {
    id: 'disordered-semi',
    name: 'Disordered semiconductor devices',
    description:
      'Device physics of localization in disordered electronic systems — mobility edges, insulating phases, and conductance statistics in doped/amorphous semiconductors.',
    evidence: [
      ev(
        'Spin freezing by Anderson localization in one-dimensional semiconductors',
        ['Carlos Echeverría-Arrondo', 'E. Ya. Sherman'],
        '2012',
        'https://arxiv.org/abs/1204.5597',
      ),
    ],
    status: 'literature-backed',
    retrieved: '2026-09-02',
  },
  {
    id: '2d-materials',
    name: 'Two-dimensional materials design',
    description:
      'Disorder and localization effects in 2D materials (transition-metal dichalcogenides, moiré systems) that set limits on carrier mobility and device reliability.',
    evidence: [
      ev(
        'Observation of Intrinsic Anderson Localization in Few-Layer ReS\u2082',
        ['Shreya Paul', 'Pritam Das', 'Devarshi Chakrabarty'],
        '2026',
        'https://arxiv.org/abs/2606.31233',
      ),
    ],
    status: 'literature-backed',
    retrieved: '2026-09-02',
  },
  {
    id: 'quantum-magnetics',
    name: 'Quantum magnetic materials',
    description:
      'Gapped spin-liquid and valence-bond phases whose spectral-gap and entanglement properties are decided by AKLT-type Hamiltonians.',
    evidence: [
      ev(
        'The AKLT model on a hexagonal chain is gapped',
        ['Marius Lemm', 'Anders Sandvik', 'Sibin Yang'],
        '2019',
        'https://arxiv.org/abs/1904.01043',
      ),
    ],
    status: 'literature-backed',
    retrieved: '2026-09-02',
  },
  {
    id: 'tensor-networks',
    name: 'Tensor-network algorithms',
    description:
      'Tensor-network simulation methods (DMRG/MPS, PEPS) whose accuracy is benchmarked against exactly-gapped model states like AKLT.',
    evidence: [
      ev(
        'The AKLT model on a hexagonal chain is gapped',
        ['Marius Lemm', 'Anders Sandvik', 'Sibin Yang'],
        '2019',
        'https://arxiv.org/abs/1904.01043',
      ),
    ],
    status: 'literature-backed',
    retrieved: '2026-09-02',
  },
  {
    id: 'soliton-comm',
    name: 'Optical soliton communication',
    description:
      'Long-haul fiber transmission using solitons, where quantum noise and timing jitter set fundamental rate limits.',
    evidence: [
      ev(
        'Quantum noise in optical fibers II: Raman jitter in soliton communications',
        ['J. F. Corney', 'P. D. Drummond'],
        '1999',
        'https://arxiv.org/abs/quant-ph/9912096',
      ),
    ],
    status: 'literature-backed',
    retrieved: '2026-09-02',
  },
  {
    id: 'nonlinear-optics',
    name: 'Nonlinear optical devices',
    description:
      'Devices whose operation relies on soliton or nonlinear wave phenomena in fiber and waveguide media.',
    evidence: [
      ev(
        'Quantum noise in optical fibers II: Raman jitter in soliton communications',
        ['J. F. Corney', 'P. D. Drummond'],
        '1999',
        'https://arxiv.org/abs/quant-ph/9912096',
      ),
    ],
    status: 'literature-backed',
    retrieved: '2026-09-02',
  },
  {
    id: 'rmt-bench',
    name: 'Random matrix benchmarks',
    description:
      'Statistical benchmarks for disordered and chaotic systems based on random-matrix ensembles (spectral statistics, conductance fluctuations).',
    evidence: [
      ev(
        'Applications of random matrix theory to condensed matter and optical physics',
        ['C. W. J. Beenakker'],
        '2009',
        'https://arxiv.org/abs/0904.1432',
      ),
    ],
    status: 'literature-backed',
    retrieved: '2026-09-02',
  },
  {
    id: 'num-disorder',
    name: 'Numerical methods for disordered systems',
    description:
      'Numerical approaches to localization and transport in disordered systems, where ensemble-level predictions need certified error control.',
    evidence: [
      ev(
        'Applications of random matrix theory to condensed matter and optical physics',
        ['C. W. J. Beenakker'],
        '2009',
        'https://arxiv.org/abs/0904.1432',
      ),
    ],
    status: 'literature-backed',
    retrieved: '2026-09-02',
  },
  {
    id: 'cfd-turb',
    name: 'CFD turbulence models',
    description:
      'Industrial CFD closures (RANS/LES) whose modeling error is the dominant uncertainty in aerodynamic, automotive and energy flow design.',
    evidence: [
      ev(
        'Bayesian neural network correction of RANS turbulence models with uncertainty quantification in separated flows',
        ['Tyler Buchanan', 'Ali Eidi', 'Richard P. Dwight'],
        '2026',
        'https://arxiv.org/abs/2604.23300',
      ),
    ],
    status: 'literature-backed',
    retrieved: '2026-09-02',
  },
  {
    id: 'aero-engine',
    name: 'Aircraft engine design',
    description:
      'Turbomachinery and separated-flow regimes where RANS model form drives compressor/turbine performance prediction.',
    evidence: [
      ev(
        'Bayesian neural network correction of RANS turbulence models with uncertainty quantification in separated flows',
        ['Tyler Buchanan', 'Ali Eidi', 'Richard P. Dwight'],
        '2026',
        'https://arxiv.org/abs/2604.23300',
      ),
    ],
    status: 'literature-backed',
    retrieved: '2026-09-02',
  },
  // ── 化学（mc）──
  {
    id: 'chem-safety',
    name: 'Chemical process safety',
    description:
      'Inherently safe design of chemical reactors: global stability of the underlying reaction network decides whether a process can run away.',
    evidence: [
      ev(
        'First order endotactic reaction networks',
        ['Chuang Xu'],
        '2024',
        'https://arxiv.org/abs/2409.01598',
      ),
      ev(
        'Intermediates, Catalysts, Persistence, and Boundary Steady States',
        ['Michael Marcondes de Freitas', 'Elisenda Feliu', 'Carsten Wiuf'],
        '2015',
        'https://arxiv.org/abs/1509.06034',
      ),
    ],
    status: 'literature-backed',
    retrieved: '2026-09-02',
  },
  {
    id: 'bioreactor',
    name: 'Bioreactor design',
    description:
      'Design and scale-up of bioreactors where network-level stability/persistence guarantees process robustness across operating regimes.',
    evidence: [
      ev(
        'First order endotactic reaction networks',
        ['Chuang Xu'],
        '2024',
        'https://arxiv.org/abs/2409.01598',
      ),
      ev(
        'Intermediates, Catalysts, Persistence, and Boundary Steady States',
        ['Michael Marcondes de Freitas', 'Elisenda Feliu', 'Carsten Wiuf'],
        '2015',
        'https://arxiv.org/abs/1509.06034',
      ),
    ],
    status: 'literature-backed',
    retrieved: '2026-09-02',
  },
  {
    id: 'catalytic-nets',
    name: 'Industrial catalytic networks',
    description:
      'Industrial catalysis and metabolic networks whose long-term behavior (no species extinction) is a pre-condition for stable operation.',
    evidence: [
      ev(
        'Persistence of Delayed Complex Balanced Chemical Reaction Networks',
        ['Xiaoyu Zhang', 'Chuanhou Gao'],
        '2019',
        'https://arxiv.org/abs/1905.05343',
      ),
    ],
    status: 'literature-backed',
    retrieved: '2026-09-02',
  },
  {
    id: 'metabolic-eng',
    name: 'Metabolic engineering',
    description:
      'Designing metabolic pathways that persist without collapse under continuous production conditions.',
    evidence: [
      ev(
        'Persistence of Delayed Complex Balanced Chemical Reaction Networks',
        ['Xiaoyu Zhang', 'Chuanhou Gao'],
        '2019',
        'https://arxiv.org/abs/1905.05343',
      ),
    ],
    status: 'literature-backed',
    retrieved: '2026-09-02',
  },
  {
    id: 'bio-oscillator',
    name: 'Biochemical oscillator design',
    description:
      'Synthetic and natural biochemical oscillators whose existence depends on multistationarity of the underlying reaction network.',
    evidence: [
      ev(
        'Symbolic proof of bistability in reaction networks',
        ['Angélica Torres', 'Elisenda Feliu'],
        '2019',
        'https://arxiv.org/abs/1909.13608',
      ),
    ],
    status: 'literature-backed',
    retrieved: '2026-09-02',
  },
  {
    id: 'gene-circuits',
    name: 'Synthetic gene circuits',
    description:
      'Design of synthetic circuits whose bistable/oscillatory behavior must be certified before deployment in engineered cells.',
    evidence: [
      ev(
        'Symbolic proof of bistability in reaction networks',
        ['Angélica Torres', 'Elisenda Feliu'],
        '2019',
        'https://arxiv.org/abs/1909.13608',
      ),
    ],
    status: 'literature-backed',
    retrieved: '2026-09-02',
  },
  // ── 生物（mb）──
  {
    id: 'tumor-evo',
    name: 'Tumor evolution modeling',
    description:
      'Evolutionary dynamics of mutant clones in cancer, where fixation/extinction probabilities on interaction graphs decide treatment response.',
    evidence: [
      ev(
        'Fixation probability on clique-based graphs',
        ['Jeong-Ok Choi', 'Unjong Yu'],
        '2017',
        'https://arxiv.org/abs/1711.04393',
      ),
    ],
    status: 'literature-backed',
    retrieved: '2026-09-02',
  },
  {
    id: 'popgen',
    name: 'Population genetics',
    description:
      'Fixation and absorption probabilities in structured populations — the standard object of mathematical population genetics.',
    evidence: [
      ev(
        'Fixation probability on clique-based graphs',
        ['Jeong-Ok Choi', 'Unjong Yu'],
        '2017',
        'https://arxiv.org/abs/1711.04393',
      ),
    ],
    status: 'literature-backed',
    retrieved: '2026-09-02',
  },
  {
    id: 'public-health',
    name: 'Public-health modeling',
    description:
      'Epidemic spread on networks: exact thresholds replace mean-field approximations in intervention planning (vaccination, isolation).',
    evidence: [
      ev(
        'Decentralized Protection Strategies against SIS Epidemics in Networks',
        ['Stojan Trajanovski', 'Yezekael Hayel', 'Eitan Altman'],
        '2014',
        'https://arxiv.org/abs/1409.1730',
      ),
    ],
    status: 'literature-backed',
    retrieved: '2026-09-02',
  },
  {
    id: 'epidemic-control',
    name: 'Epidemic prevention and control strategies',
    description:
      'Protection/resource-allocation strategies for network epidemics, whose guarantees rest on the epidemic threshold being known exactly.',
    evidence: [
      ev(
        'Decentralized Protection Strategies against SIS Epidemics in Networks',
        ['Stojan Trajanovski', 'Yezekael Hayel', 'Eitan Altman'],
        '2014',
        'https://arxiv.org/abs/1409.1730',
      ),
    ],
    status: 'literature-backed',
    retrieved: '2026-09-02',
  },
  {
    id: 'eco-conserv',
    name: 'Ecosystem conservation',
    description:
      'Long-term coexistence of interacting species — permanence of Lotka–Volterra-type models as a conservation target.',
    evidence: [
      ev(
        'Classification of permanence and impermanence for a Lotka-Volterra model of three competing species with seasonal succession',
        ['Lei Niu', 'Xizhuang Xie'],
        '2024',
        'https://arxiv.org/abs/2402.19213',
      ),
    ],
    status: 'literature-backed',
    retrieved: '2026-09-02',
  },
  {
    id: 'fisheries',
    name: 'Fisheries resource management',
    description:
      'Sustainable harvesting models where species permanence thresholds guide catch limits.',
    evidence: [
      ev(
        'Classification of permanence and impermanence for a Lotka-Volterra model of three competing species with seasonal succession',
        ['Lei Niu', 'Xizhuang Xie'],
        '2024',
        'https://arxiv.org/abs/2402.19213',
      ),
    ],
    status: 'literature-backed',
    retrieved: '2026-09-02',
  },
  // ── 工程（me）──
  {
    id: 'uav-formation',
    name: 'UAV formation',
    description:
      'Distributed consensus and formation control for fleets of autonomous vehicles, where convergence guarantees replace ad-hoc tuning.',
    evidence: [
      ev(
        'Distributed Average Consensus in Wireless Multi-Agent Systems with Over-the-Air Aggregation',
        ['Themistoklis Charalambous', 'Zheng Chen', 'Christoforos N. Hadjicostis'],
        '2025',
        'https://arxiv.org/abs/2507.22648',
      ),
    ],
    status: 'literature-backed',
    retrieved: '2026-09-02',
  },
  {
    id: 'sensor-nets',
    name: 'Sensor networks',
    description:
      'Distributed estimation and averaging over wireless sensor networks, where consensus rate bounds certification of convergence time.',
    evidence: [
      ev(
        'Distributed Average Consensus in Wireless Multi-Agent Systems with Over-the-Air Aggregation',
        ['Themistoklis Charalambous', 'Zheng Chen', 'Christoforos N. Hadjicostis'],
        '2025',
        'https://arxiv.org/abs/2507.22648',
      ),
    ],
    status: 'literature-backed',
    retrieved: '2026-09-02',
  },
  {
    id: 'swarm-robotics',
    name: 'Swarm robotics',
    description:
      'Flocking/consensus of robotic swarms, whose emergent behavior is governed by Cucker–Smale-type dynamics.',
    evidence: [
      ev(
        'Cucker-Smale flocking with alternating leaders',
        ['Zhuchun Li', 'Seung-Yeal Ha'],
        '2013',
        'https://arxiv.org/abs/1310.3875',
      ),
      ev(
        'From particle to kinetic and hydrodynamic descriptions of flocking',
        ['Seung-Yeal Ha', 'Eitan Tadmor'],
        '2008',
        'https://arxiv.org/abs/0806.2182',
      ),
    ],
    status: 'literature-backed',
    retrieved: '2026-09-02',
  },
  {
    id: 'swarm-safety',
    name: 'Safety certification of swarm/flocking control',
    description:
      'Certifying that a proposed flocking/swarm controller converges safely before deployment in safety-critical autonomous systems.',
    evidence: [
      ev(
        'Cucker-Smale flocking with alternating leaders',
        ['Zhuchun Li', 'Seung-Yeal Ha'],
        '2013',
        'https://arxiv.org/abs/1310.3875',
      ),
      ev(
        'From particle to kinetic and hydrodynamic descriptions of flocking',
        ['Seung-Yeal Ha', 'Eitan Tadmor'],
        '2008',
        'https://arxiv.org/abs/0806.2182',
      ),
    ],
    status: 'literature-backed',
    retrieved: '2026-09-02',
  },
  // ── 计算机（mcs）──
  {
    id: 'dnn-interpretability',
    name: 'DNN interpretability engineering',
    description:
      'Rigorous, symbolic explanation of DNN inference logic through AND-OR interaction patterns and per-interaction generalization-power quantification, enabling trustable AI systems in critical applications.',
    evidence: [
      ev(
        'Technical Report: Quantifying and Analyzing the Generalization Power of a DNN',
        ['Yuxuan He', 'Junpeng Zhang', 'Lei Cheng', 'Hongyuan Zhang', 'Quanshi Zhang'],
        '2025',
        'https://arxiv.org/abs/2505.06993',
      ),
    ],
    status: 'literature-backed',
    retrieved: '2026-09-05',
  },
  {
    id: 'certified-robustness',
    name: 'Certified robustness engineering',
    description:
      'Formal, provable guarantees that a DNN behaves safely inside an input region — the working model for safety-critical AI systems (aviation, autonomous control) that cannot rely on empirical testing alone.',
    evidence: [
      ev(
        'Reluplex: An Efficient SMT Solver for Verifying Deep Neural Networks',
        ['Guy Katz', 'Clark Barrett', 'David Dill', 'Kyle Julian', 'Mykel Kochenderfer'],
        '2017',
        'https://arxiv.org/abs/1702.01135',
      ),
    ],
    status: 'literature-backed',
    retrieved: '2026-09-05',
  },
  {
    id: 'noise-robust-learning',
    name: 'Noise-robust learning engineering',
    description:
      'Building and maintaining learning systems that stay accurate when training labels or inputs are noisy — the working model for cheaply collected, low-quality real-world datasets where relabeling is too expensive.',
    evidence: [
      ev(
        'Deep Learning is Robust to Massive Label Noise',
        ['David Rolnick', 'Andreas Veit', 'Serge Belongie', 'Nir Shavit'],
        '2017',
        'https://arxiv.org/abs/1705.10694',
      ),
    ],
    status: 'literature-backed',
    retrieved: '2026-09-05',
  },
]

const _byName = new Map(IMPACT_DOMAIN_RECORDS.map((r) => [r.name, r]))

/** 按目录中使用的域字符串解析到注册表条目；未知域返回 undefined（应由守卫拦截）。 */
export function impactRecord(name: string): ImpactDomainRecord | undefined {
  return _byName.get(name)
}
