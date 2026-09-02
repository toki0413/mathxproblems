// 工程反向需求清单的机器快照：/api/v1/needs.json。
// 双桥愿景的需求侧出口：工程师/下游 agent 从工程需求反查支撑它的目录问题与
// 经验定律，附就绪度（served/partial/gap）。随契约 v0.1 版本化。
import { ENGINEERING_NEEDS } from "../src/data/engineeringNeeds";
import { PROBLEMS } from "../src/data/problems";
import { LAWS } from "../src/data/laws";

export function buildNeeds() {
  const byId = new Map(PROBLEMS.map((p) => [p.id, p]));
  const lawById = new Map(LAWS.map((l) => [l.id, l]));
  return ENGINEERING_NEEDS.map((n) => ({
    id: n.id,
    name: n.name,
    area: n.area,
    description: n.description,
    readiness: n.readiness,
    note: n.note,
    problems: n.problems.map(({ id, role }) => {
      const p = byId.get(id);
      return {
        id,
        role,
        title: p?.title,
        status: p?.status,
        domain: p?.domain,
      };
    }),
    laws: n.laws.map((lid) => {
      const l = lawById.get(lid);
      return { id: lid, name: l?.name, status: l?.status };
    }),
  }));
}
