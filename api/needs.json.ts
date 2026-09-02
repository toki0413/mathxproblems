// 工程反向需求清单的机器快照：/api/v1/needs.json。
// 双桥愿景的需求侧出口：工程师/下游 agent 从工程需求反查支撑它的目录问题与
// 经验定律（判定链），附就绪度（served/partial/gap）、对接标准、可消费形态、
// 障碍与工作流落点。随契约 v0.1 版本化。
import { ENGINEERING_NEEDS, chainStepState, type NeedStepState } from "../src/data/engineeringNeeds";
import { AUDITED_PROBLEMS } from "../src/data/audits";
import { LAWS } from "../src/data/laws";

export { chainStepState } from "../src/data/engineeringNeeds";
export type { NeedStepState } from "../src/data/engineeringNeeds";

export function buildNeeds() {
  const byId = new Map(AUDITED_PROBLEMS.map((p) => [p.id, p]));
  const lawById = new Map(LAWS.map((l) => [l.id, l]));
  return ENGINEERING_NEEDS.map((n) => ({
    id: n.id,
    name: n.name,
    area: n.area,
    description: n.description,
    readiness: n.readiness,
    note: n.note,
    standard: n.standard,
    consumable: n.consumable,
    barrier: n.barrier,
    workflow: n.workflow,
    chain: n.chain.map((s) => {
      const p = s.kind === "problem" ? byId.get(s.id) : undefined;
      const l = s.kind === "law" ? lawById.get(s.id) : undefined;
      return {
        id: s.id,
        kind: s.kind,
        role: s.role,
        what: s.what,
        title: p?.title ?? l?.name ?? null,
        status: p?.status ?? l?.status ?? null,
        domain: p?.domain ?? null,
        state: chainStepState(s),
      };
    }),
  }));
}

export type NeedJson = ReturnType<typeof buildNeeds>[number];
export type NeedChainJson = NeedJson["chain"][number];
