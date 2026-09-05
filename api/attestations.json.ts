// 机器核验纪录括区的公证快照：/api/v1/attestations.json。
//
// 与 claim 账本（ledger.json，人/AI 提交的声明事件）严格区分：
//   - ledger      = 谁声称了什么（append-only，需提交者，可能为空）
//   - 本快照      = 机器核验了什么既有事实（确定性快照，任何人可复算）
//
// 诚实红线（由 scripts/check-attestations.mjs 在 CI 强制，两侧共用同一构建逻辑）：
//   - 只公证 certificate.current_record（具体数值括区）；绝不把「目标带 / 判定通过」
//     冒充为已核验事实——判定是否通过仍以题本身 status / lifecycle_status 为准。
//   - 每个被公证的括区必须同时满足：
//       (1) 通过 verifyCurrentRecord 良构性判定（非空、非空洞、信息门槛）；
//       (2) 该题至少有一条带 URL 的真实 references 作为 source —— 无出处不公证。
//   - 输出确定性：同目录两次构建逐字节一致（ETag 由此派生，消费方可 If-None-Match）。
import { AUDITED_PROBLEMS } from "../src/data/audits.ts";
import { verifyCurrentRecord } from "../contracts/verifier.ts";
import type { Problem } from "../src/data/problems.ts";

export interface RecordAttestationVerdict {
  well_formed: boolean;
  nonempty: boolean;
  within_vacuous: boolean;
  within_info_gate: boolean;
  relative_width: number | null;
}

export interface RecordAttestation {
  problemId: string;
  title: string;
  record: { lo: number; hi: number };
  verdict: RecordAttestationVerdict;
  /** 真实文献出处（该题自身 references 中第一条带 URL 的引用；无出处不得公证）。 */
  source: string;
}

/** 出处：问题自身 references 中第一条带 URL 的真实引用；无则 null。 */
export function attestationSource(p: Problem): string | null {
  const ref = p.references?.find((r) => r.url);
  if (!ref) return null;
  return ref.label + (ref.url ? ` — ${ref.url}` : "");
}

/** 收集可公证的机器核验纪录括区（确定性，按 id 排序）。 */
export function recordAttestations(problems: Problem[]): RecordAttestation[] {
  const out: RecordAttestation[] = [];
  for (const p of problems) {
    const rec = p.certificate?.current_record;
    if (!rec) continue;
    const source = attestationSource(p);
    if (!source) continue; // 无真实出处 → 不公证（守卫同规则）
    const verdict = verifyCurrentRecord(rec);
    if (!verdict.well_formed) continue; // 机器核验不通过 → 不公证（守卫同规则）
    out.push({
      problemId: p.id,
      title: p.title,
      record: { lo: rec.lo, hi: rec.hi },
      verdict: {
        well_formed: verdict.well_formed,
        nonempty: verdict.nonempty,
        within_vacuous: verdict.within_vacuous,
        within_info_gate: verdict.within_info_gate,
        relative_width: verdict.relative_width,
      },
      source,
    });
  }
  return out.sort((a, b) => a.problemId.localeCompare(b.problemId));
}

export function buildAttestations() {
  const attestations = recordAttestations(AUDITED_PROBLEMS);
  return {
    contract: "record-attestation/v1",
    semantics:
      "Machine-verified record brackets (certificate.current_record), NOT certified-judgement passes. Deterministic; recomputable by anyone via contracts/verifier.ts.",
    verifier:
      "contracts/verifier.ts (read-only; verifyCurrentRecord; independent of the proposal/review path)",
    count: attestations.length,
    attestations,
  };
}
