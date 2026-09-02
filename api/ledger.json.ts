// 协议账本的机器快照：/api/v1/ledger.json。
//
// 契约 v0.1 只追加账本的「可核验导出」：每条已通过声明携带
//   - contentHash：证据哈希（scripts/check-ledger.mjs 复核历史未被改写）
//   - verdict：参考核验器对 kind='verification' 的带证区间给出的独立判定
//     （是否可机器解析、相对宽度、反剧场闸门、信息量门槛）
//
// 信任分离（TRUST_SEPARATION）：核验器只在读取/导出侧运行，提交路径永不核验。
// 消费方用同一纯函数模块（contracts/verifier.ts + contracts/band.ts）即可复算。
// feed.json 保持原样不动，兼容 check-ledger 与既有消费方。
import { JUDGEMENT_CONTRACT_VERSION } from "@contracts/judgement";
import { checkInformation, INFO_GATE_DEFAULT } from "@contracts/verifier";
import { parseBand } from "@contracts/band";
import { listLatestClaimEvents } from "./queries/attempts";

export interface BandVerdict {
  parseable: boolean;
  relative_width: number | null;
  within_vacuous: boolean | null;
  within_info_gate: boolean | null;
  info_gate_threshold: number;
  note: string | null;
}

/** 对一条 verification 声明的带证区间运行参考核验器（纯函数、读取侧）。 */
export function bandVerdict(band: string | null | undefined): BandVerdict | null {
  if (!band) return null;
  if (!parseBand(band)) {
    return {
      parseable: false,
      relative_width: null,
      within_vacuous: null,
      within_info_gate: null,
      info_gate_threshold: INFO_GATE_DEFAULT,
      note: "band not machine-parseable; contract requires [lo, hi]",
    };
  }
  const info = checkInformation(band);
  const note = info.within_vacuous
    ? null
    : `vacuous: relative width ${info.relative_width?.toFixed(3)} > 1 (anti-theatre gate)`;
  return {
    parseable: true,
    relative_width: info.relative_width,
    within_vacuous: info.within_vacuous,
    within_info_gate: info.within_info_gate,
    info_gate_threshold: INFO_GATE_DEFAULT,
    note,
  };
}

export async function buildLedger(limit = 50) {
  const events = await listLatestClaimEvents(limit);
  return {
    contract: JUDGEMENT_CONTRACT_VERSION,
    generated: new Date().toISOString(),
    append_only: true,
    count: events.length,
    verifier: "contracts/verifier.ts (read-only; independent of the proposal/review path)",
    events: events.map((ev) => ({
      ...ev,
      verdict: ev.kind === "verification" ? bandVerdict(ev.newBand) : null,
    })),
  };
}
