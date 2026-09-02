// 生成 src/data/audits.ts：以 114 题真实 id 为基础，标记 4 条 flagged + 其余 passed。
// 审计为内部一致性审查（ai-assisted），非专家复核——这是诚实标签，不冒充专家意见。
import { writeFileSync } from "node:fs";
import { PROBLEMS } from "../src/data/problems.ts";

const DATE = "2026-09-02";

// 逐题审计后确认的真实问题（4 条）。其余 110 条通过。
// 注：me-020 曾因引文乱码被 flagged，已于 2026-09-02 修复并核实
// （Gérard-Varet–Dormy, JAMS 23 (2010)；Grenier–Guo–Nguyen, Duke Math. J. 165 (2016)），恢复为 passed。
const FLAGS = {
  "mp-035": "verification_path=experimental violates the inclusion criterion (no new experiments needed); the BKT statement itself is a valid conjecture but must be re-mapped to analytical/numerical",
  "me-017": "status=open is stale: global uniqueness for the Calderón problem in dimension >= 3 was settled by Haberman & Tataru (2013) for Lipschitz conductivities",
  "mp-030": "status=open is stale: the cited reference Imbrie (2016) proves many-body localization for exactly this disordered Heisenberg chain under strong-disorder conditions; status should reflect at least partial",
  "mp-028": "status=open is inconsistent: the cited reference Deng & Hani (Invent. Math. 233, 2023) proves the full derivation of the wave kinetic equation for this setup; status should reflect the resolved/partial state",
};

const lines = [];
lines.push("// 逐题审计结果（2026-09-02，ai-assisted 内部一致性审查，非专家复核）。");
lines.push("// 仅 status='passed' 的问题在公共站点展示（通过审计的才展示）。");
lines.push("// flagged 的条目不删除，原因公开，供人复核升级。");
lines.push("// 此文件由 scripts/audit-gen.mjs 生成，勿手改。");
lines.push("");
lines.push('import { PROBLEMS } from "./problems";');
lines.push("");
lines.push("export type AuditStatus = 'passed' | 'flagged'");
lines.push("");
lines.push("export interface ProblemAudit {");
lines.push("  status: AuditStatus");
lines.push("  /** 审计日期（YYYY-MM-DD） */");
lines.push("  date: string");
lines.push("  /** ai-assisted = 内部一致性/展示质量审查，非领域专家复核 */");
lines.push("  kind: 'ai-assisted'");
lines.push("  /** flagged 时必须给出原因；passed 留空 */");
lines.push("  reason?: string");
lines.push("}");
lines.push("");
lines.push("export const AUDITS: Record<string, ProblemAudit> = {");

for (const p of PROBLEMS) {
  const f = FLAGS[p.id];
  if (f) {
    lines.push(`  '${p.id}': { status: 'flagged', date: '${DATE}', kind: 'ai-assisted', reason: ${JSON.stringify(f)} },`);
  } else {
    lines.push(`  '${p.id}': { status: 'passed', date: '${DATE}', kind: 'ai-assisted' },`);
  }
}
lines.push("};");
lines.push("");

const passed = PROBLEMS.filter((p) => !FLAGS[p.id]);
lines.push("/** 已通过审计、可在公共站点展示的问题 id 集合。 */");
lines.push(`export const AUDITED_PASSED = new Set(${JSON.stringify(passed.map((p) => p.id))});`);
lines.push("");
lines.push("/** 已通过审计、可在公共站点展示的问题列表（展示门唯一事实来源）。 */");
lines.push("export const AUDITED_PROBLEMS = PROBLEMS.filter((p) => AUDITS[p.id]?.status === \"passed\");");
lines.push("");
lines.push("/** 某题是否通过审计（可直接展示）。 */");
lines.push("export function isAuditedPassed(id: string): boolean {");
lines.push('  return AUDITS[id]?.status === "passed";');
lines.push("}");
lines.push("");

const content = lines.join("\n");
writeFileSync(new URL("../src/data/audits.ts", import.meta.url), content);
console.log(`generated audits.ts: ${PROBLEMS.length} total, ${passed.length} passed, ${Object.keys(FLAGS).length} flagged`);
