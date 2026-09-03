// 逐题审计结果（2026-09-02，ai-assisted 内部一致性审查，非专家复核）。
// 仅 status='passed' 的问题在公共站点展示（通过审计的才展示）。
// flagged 的条目不删除，原因公开，供人复核升级。
// 此文件由 scripts/audit-gen.mjs 生成，勿手改。

import { PROBLEMS } from "./problems";

export type AuditStatus = 'passed' | 'flagged'

export interface ProblemAudit {
  status: AuditStatus
  /** 审计日期（YYYY-MM-DD） */
  date: string
  /** ai-assisted = 内部一致性/展示质量审查，非领域专家复核 */
  kind: 'ai-assisted'
  /** flagged 时必须给出原因；passed 留空 */
  reason?: string
}

export const AUDITS: Record<string, ProblemAudit> = {
  'mp-001': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mp-002': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mp-003': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mp-004': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mp-005': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mp-006': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mp-007': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mp-008': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mc-001': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mc-002': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mc-003': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mc-004': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mc-005': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mb-001': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mb-002': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mb-003': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mb-004': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'me-001': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'me-002': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'me-003': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mp-009': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mp-010': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mp-011': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mp-012': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mp-013': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mc-007': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mc-008': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mb-005': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mb-006': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mb-007': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mb-008': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'me-004': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'me-005': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'me-006': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mp-014': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mp-015': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mc-009': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mb-009': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mb-010': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'me-007': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'me-008': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mp-016': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mp-018': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mc-011': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mc-012': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mb-011': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mb-012': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mb-013': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'me-009': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'me-010': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'me-011': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'me-012': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'me-013': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'me-014': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mp-019': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mp-020': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mp-022': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mc-014': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mb-014': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mb-015': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mp-023': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mp-024': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mp-025': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mp-026': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mp-027': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mp-028': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mp-029': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mp-030': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mc-016': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mc-017': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mc-018': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mc-019': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mc-020': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mc-021': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mc-022': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mc-023': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mc-024': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mb-016': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mb-017': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mb-019': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mb-020': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mb-021': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mb-022': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mb-024': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'me-015': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'me-017': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'me-018': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'me-019': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'me-020': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'me-021': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'me-022': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'me-023': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mp-032': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mp-034': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mp-035': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mc-027': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mc-028': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mb-026': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'me-026': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'me-027': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'me-028': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'me-029': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'me-030': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'me-031': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'me-032': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mp-036': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mb-027': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mc-029': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mp-037': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mp-040': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'me-034': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mp-041': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mc-030': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  'mb-028': { status: 'passed', date: '2026-09-02', kind: 'ai-assisted' },
  // 候选池第一批（Tier 3，扩库实采）：题面 + 来源 + AI 草拟元数据，未经审计。
  // flagged 使它们被展示门排除出主目录；候选池分区单独展示，评审升级后转 passed。
  // mp-042 已满足证据门（open_claim 逐字引文 + 可解析来源，文献即专家）→ 升级 vetted，
  // 进入主目录；mp-043 保留 candidate，待评审。
  'mp-042': { status: 'passed', date: '2026-09-03', kind: 'ai-assisted' },
  'mp-043': { status: 'flagged', date: '2026-09-03', kind: 'ai-assisted', reason: 'candidate pool — open_claim present but statement is engineering-modeling and not yet independently verified; pending review for upgrade' },
  // 需求缺口实采批次（收题流水线 cn-002/cn-004 → 候选池正式题）：题面 + 来源 + AI 草拟，
  // 未经独立核验，保留 candidate 待评审；升级后转 passed 进入主目录。
  'mp-044': { status: 'passed', date: '2026-09-03', kind: 'ai-assisted' },
  'me-035': { status: 'flagged', date: '2026-09-03', kind: 'ai-assisted', reason: 'candidate pool — 需求缺口实采（need-flocking-safety / cn-002），题面待独立核验；pending review' },
  'mp-045': { status: 'passed', date: '2026-09-03', kind: 'ai-assisted' },
  'me-036': { status: 'passed', date: '2026-09-03', kind: 'ai-assisted' },
  'mc-031': { status: 'passed', date: '2026-09-03', kind: 'ai-assisted' },
};

/** 已通过审计、可在公共站点展示的问题 id 集合。 */
export const AUDITED_PASSED = new Set(["mp-001","mp-002","mp-003","mp-004","mp-005","mp-006","mp-007","mp-008","mc-001","mc-002","mc-003","mc-004","mc-005","mb-001","mb-002","mb-003","mb-004","me-001","me-002","me-003","mp-009","mp-010","mp-011","mp-012","mp-013","mc-007","mc-008","mb-005","mb-006","mb-007","mb-008","me-004","me-005","me-006","mp-014","mp-015","mc-009","mb-009","mb-010","me-007","me-008","mp-016","mp-018","mc-011","mc-012","mb-011","mb-012","mb-013","me-009","me-010","me-011","me-012","me-013","me-014","mp-019","mp-020","mp-022","mc-014","mb-014","mb-015","mp-023","mp-024","mp-025","mp-026","mp-027","mp-028","mp-029","mp-030","mc-016","mc-017","mc-018","mc-019","mc-020","mc-021","mc-022","mc-023","mc-024","mb-016","mb-017","mb-019","mb-020","mb-021","mb-022","mb-024","me-015","me-017","me-018","me-019","me-020","me-021","me-022","me-023","mp-032","mp-034","mp-035","mc-027","mc-028","mb-026","me-026","me-027","me-028","me-029","me-030","me-031","me-032","mp-036","mb-027","mc-029","mp-037","mp-040","me-034","mp-041","mc-030","mc-031","mp-044","mp-045","me-036","mb-028"]);

/** 已通过审计、可在公共站点展示的问题列表（展示门唯一事实来源）。 */
export const AUDITED_PROBLEMS = PROBLEMS.filter((p) => AUDITS[p.id]?.status === "passed");

/** 某题是否通过审计（可直接展示）。 */
export function isAuditedPassed(id: string): boolean {
  return AUDITS[id]?.status === "passed";
}
