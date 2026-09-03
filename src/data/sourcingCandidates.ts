// 收题流水线 → 候选池提案（由需求层派生，零漂移）。
//
// 需求缺口（sourcing.kind='new'）在候选池中落为"提案"条目：给稳定 id（cn-xxx）、
// 挂来源需求、标注待实采。诚实边界：提案只是收题建议的机器可寻址形态，不是正式题；
// 正式题（tier='candidate'）必须带可核验的题面/来源/逐字引文（见 mp-043 的 open_claim），
// 那是"实采"步骤的工作——把提案升级成目录问题后，置 status='intaked' 并填 problemId。
//
// 数据自 PROBLEMS 侧派生：需求层驱动收题（从问题收录到解题层的引擎），
// 无需第二份事实来源。id 按需求数据顺序稳定生成。
import { ENGINEERING_NEEDS } from "./engineeringNeeds";

export interface SourcingProposal {
  /** 稳定提案 id（cn-001…，按需求数据顺序派生）。 */
  id: string;
  /** 来源需求 id。 */
  needId: string;
  /** 来源需求名。 */
  needName: string;
  /** 工程领域（继承需求）。 */
  area: string;
  /** 提案标题。 */
  title: string;
  /** 收题建议原文（what）。 */
  what: string;
  /** 需求就绪度（缺口驱动，通常是 gap）。 */
  needReadiness: string;
  /** proposal = 待实采；intaked = 已实采为目录正式题（见 problemId）。 */
  status: "proposal" | "intaked";
  /** 实采后的目录问题 id（status='intaked' 时）。 */
  problemId?: string;
}

/** 每条 new 提案的英文标题（按来源需求 id 键控；缺省回退到 what）。 */
const PROPOSAL_TITLE: Record<string, string> = {
  "need-turbulence-closure": "Certified error bound for algebraic mixing-length closures",
  "need-flocking-safety": "Constructive invariant sets for flocking laws with non-singular kernels",
  "need-multistationarity": "Decidable multistationarity criterion for small reaction networks",
  "need-quantum-transport": "Rigorous quantization of Kubo conductance for interacting electrons",
  "need-learned-control": "Decidable stability criterion for LTI subclasses within an ODD",
  "need-composite-bounds": "Attainable bounds for isotropic two- and three-phase composites",
  "need-seasonal-epidemic": "Subharmonic response regions for periodically forced SIR",
  "need-eda-routing": "Sharp wiring-cost upper bounds on grid and sparse graphs",
  "need-plc-stabilization": "Decidability of Lipschitz stabilizability for control-affine systems",
  "need-lattice-thermal": "Rigorous phonon dispersion bounds for harmonic lattices",
  "need-bioprocess-oscillation": "Decidable oscillation criterion for mass-action networks",
  "need-provisioning-worstcase": "Sharp competitive-ratio bounds for restricted bin-packing families",
  "need-grid-frequency-control": "Worst-case AGC consensus time under quantization and link dropout",
};

/** 从需求数据派生全部候选池提案（new 条目 → 提案）。零漂移：无独立事实来源。 */
export function sourcingProposals(): SourcingProposal[] {
  const out: SourcingProposal[] = [];
  for (const n of ENGINEERING_NEEDS) {
    for (const s of n.sourcing ?? []) {
      if (s.kind !== "new") continue;
      out.push({
        id: `cn-${String(out.length + 1).padStart(3, "0")}`,
        needId: n.id,
        needName: n.name,
        area: n.area,
        title: PROPOSAL_TITLE[n.id] ?? s.what,
        what: s.what,
        needReadiness: n.readiness,
        status: "proposal",
      });
    }
  }
  return out;
}

/** 提案 → 目录正式题的实采登记（在 problems.ts 建好 tier='candidate' 题后调用）。 */
export function markIntaked(proposals: SourcingProposal[], needId: string, problemId: string): SourcingProposal[] {
  return proposals.map((p) => (p.needId === needId && p.status === "proposal" ? { ...p, status: "intaked", problemId } : p));
}
