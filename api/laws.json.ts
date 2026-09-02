// 边界图谱的机器快照：/api/v1/laws.json。
// 运动的需求清单（双向映射方向 B 的出口）：每条定律的 boundary 声明是
// 一条可核验判定，status='gap' 的条目即"证明者需求清单"——让 mathlib/证明者
// 订阅"哪些经验定律需要严格推导或误差界"。随契约 v0.1 版本化。
import { LAWS } from "../src/data/laws";
import type { EmpiricalLaw } from "../src/data/laws";

function oneLaw(l: EmpiricalLaw) {
  return {
    id: l.id,
    name: l.name,
    industry: l.industry,
    usage: l.usage,
    formal_statement: l.formal_statement,
    assumptions: l.assumptions,
    boundary: l.boundary,
    gap: l.gap,
    residuals: l.residuals,
    tool_links: l.tool_links?.length ? l.tool_links : undefined,
    status: l.status,
  };
}

export function buildLaws() {
  return LAWS.map(oneLaw);
}
