// Vero 式 proof-only 任务清单（契约 v0.1）：把目录里「形式化潜力 high + 有可编译
// Lean 陈述」的题导出为可被 prover/agent 消费的证明义务。
// 语义对标 Vero (arXiv 2608.13522) 的 proof-only 模式：给规范 + 判定，求机器可查
// 证明；不是 Vero 的仓库级 code-and-proof 实例（MathX 的题是开放定理，无实现层）。
// 与 scripts/lib/catalog-checks.mjs 的 deriveProofTasks 同源（都从 problems.ts
// 派生同一筛选），CI 守卫保证两侧零漂移。
import { AUDITED_PROBLEMS } from "../src/data/audits";
import { anchorOf } from "../src/data/problems";
import type { FormalStatus } from "../src/data/problems";

export interface ProofTask {
  task_id: string;
  title: string;
  domain: string;
  /** 判定形式：被认可答案必须满足什么、如何核验（证明证书 / 数值判据 / 反例构造）。 */
  judgment: string;
  /** 形式化规范：待证的 Lean 4 陈述（lean/<id>.lean，CI 已逐字编译）。 */
  statement: string;
  /** 目标形式系统：当前锚点为 std-only（非 mathlib），如实标注。 */
  target: "Lean4/std";
  status: FormalStatus | "open";
  verification_path: string;
  /** L0 锚点：statement_anchor=true（陈述已被 CI 编译）才能入选。 */
  anchor: { statement_anchor: boolean };
  /** 可用 mathlib 工具族（共享引理库提示——Vero 发现缺引理库是失败主因）。 */
  tool_links?: { tool_id: string; role: string }[];
}

export function buildProofTasks(): ProofTask[] {
  return AUDITED_PROBLEMS.filter(
    (p) => p.lean_statement && p.formalization_potential === "high",
  )
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((p) => {
      const status: ProofTask["status"] =
        p.formal_view?.status ??
        (p.lifecycle_status === "refuted" ? "refuted" : "open");
      return {
        task_id: p.id,
        title: p.title,
        domain: p.domain,
        judgment: p.judgment ?? "",
        statement: p.lean_statement as string,
        target: "Lean4/std" as const,
        status,
        verification_path: p.verification_path,
        anchor: { statement_anchor: anchorOf(p).statement_anchor },
        tool_links: p.tool_links?.length
          ? p.tool_links.map((tl) => ({ tool_id: tl.tool_id, role: tl.role }))
          : undefined,
      };
    });
}
