// 只追加账本的证据哈希与审计工具。
//
// 账本语义（契约 v0.1 配套）：已通过（approved）的证据字段不可变——
// 每次核验 / 导出按同一规范重算哈希，任何对历史证据的改写都会破坏哈希一致性，
// 从而被 scripts/check-ledger.mjs 审计发现。哈希本身不证明"证明对错"，
// 只证明"记录未被篡改"；正确性由参考核验器（contracts/verifier.ts）负责。
//
// 铁律：纯函数、无 I/O；哈希规范一旦发布即冻结，不能随代码随意变化。

export interface LedgerEvidence {
  problemId: string;
  kind: string;
  title: string;
  content?: string | null;
  narrative?: string | null;
  newBand?: string | null;
  formalStatus?: string | null;
  method?: string | null;
}

/**
 * FNV-1a 32bit 证据哈希。刻意不用加密哈希：这是"记录一致性"指纹而非安全边界，
 * 与 catalog ETag 同源风格，Node / Worker / 浏览器三端可用。
 * 键序固定、JSON 序列化确定 → 同证据必同哈希。
 */
export function evidenceHash(ev: LedgerEvidence): string {
  const canonical = JSON.stringify({
    problemId: ev.problemId,
    kind: ev.kind,
    title: ev.title,
    content: ev.content ?? null,
    narrative: ev.narrative ?? null,
    newBand: ev.newBand ?? null,
    formalStatus: ev.formalStatus ?? null,
    method: ev.method ?? null,
  });
  let h = 0x811c9dc5;
  for (let i = 0; i < canonical.length; i++) {
    h ^= canonical.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}
