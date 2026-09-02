// 生成 src/data/audits.ts：以 114 题真实 id 为基础，标记 0 条 flagged（全部通过展示门）。
// 审计为内部一致性审查（ai-assisted），非专家复核——这是诚实标签，不冒充专家意见。
import { writeFileSync } from "node:fs";
import { PROBLEMS } from "../src/data/problems.ts";

const DATE = "2026-09-02";

// 首次审计（2026-09-02）标记了 5 条，随后逐条修复并核实，现全部恢复展示：
//   me-020  — 引文乱码/DOI 误挂无关论文 → 修正为 Gérard-Varet–Dormy (JAMS 23, 2010)
//            与 Grenier–Guo–Nguyen (Duke Math. J. 165, 2016)，已核实。
//   mp-028  — 状态 open 与所引文献矛盾 → 改为 partial（Deng–Hani, Invent. Math. 233, 2023
//            已证 O(1) 动力学时标的 WKE 推导；长时标/非高斯仍开）。
//   mp-030  — 状态 open 过时 → 改为 partial（Imbrie, J. Stat. Phys. 163, 2016 已证强无序 MBL；
//            无条件热力学极限稳定性仍争）。
//   me-017  — 状态 open 过时 → 改为 partial（Haberman–Tataru, Duke Math. J. 162, 2013 已证
//            Lipschitz 情形；L^∞ 情形仍开）。
//   mp-035  — 验证路径 experimental 违反收录标准 → 改为 analytical（目标为严格证明，
//            实验观测仅为佐证）。
// FLAGS 现为空：任何新 flagged 应在这里显式登记并附修复路径，而非静默通过。
const FLAGS = {};

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
