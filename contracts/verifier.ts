// 参考核验器（reference verifier）—— MathX 运动的信任锚。
//
// 独立、确定性、只读地核验一份 Certified Judgement 证书是否满足契约 v0.1
// 的四条不变量。任何消费方（竞技场裁判、账本、合规导出、check-problems）
// 都应调用本模块，而不是各写一套——这是"证书可独立复核"这一主张的落地。
//
// 铁律：
//  - 纯函数、无 I/O、无随机 → 同输入必同判定（确定性）。
//  - 不 import 任何写入/数据库模块 → 信任分离从模块边界做起。
//  - 对描述性文字（非机器形式）如实报 needs_form，而不是假装通过——
//    这正是运动要揭示的"你的证书还没到机器可核验"。

import { parseBand } from "./band.ts";

export interface ResidualLike {
  bound?: string;
  /** 残差清单（L1.5）：机器可读数值上界（≥0，有限）。缺省表示该层尚无机器形式。 */
  upper?: number;
  /** 支撑该层 bound 的证书类型（proof/numerical/counterexample/assumption）。 */
  kind?: string;
}

export interface CertificateLike {
  r_model?: ResidualLike;
  r_param?: ResidualLike;
  r_num?: ResidualLike;
  total_band?: string;
  certified_band?: string;
  /** 总带宽的机器可读合成上界；齐备时做带算术 total ≤ R_model+R_param+R_num。 */
  total?: number;
}

export type CheckStatus = "pass" | "fail" | "needs_form";

export interface JudgementVerdict {
  /** 是否全部硬不变量通过（任一 fail 即 false；needs_form 不计为失败，但如实报告）。 */
  pass: boolean;
  checks: {
    r_param_clause: CheckStatus;
    band_form: CheckStatus;
    band_nonempty: CheckStatus;
    band_nonvacuous: CheckStatus;
    total_residual_arith: CheckStatus;
  };
  /** 相对宽度 = 带宽 / |带中点|；带不可解析时为 null。 */
  relative_width: number | null;
  reasons: string[];
}

/** R_param 的"不确定度/测量残差"内容关键词（中英双语，兼容存量与英文新数据）。 */
const UNCERTAINTY_RE = /测量|不确定度|输入残差|measurement|uncertainty|input residual/i;
const ZERO_RE = /≡\s*0|=\s*0|is zero/i;

/** 默认反剧场阈值：相对宽度 > 1 视为空带（带宽大于自身量级）。 */
export const VACUOUS_THRESHOLD = 1;
/** 竞技场准入建议阈值（可配置，消费方按赛道收紧）。 */
export const INFO_GATE_DEFAULT = 0.2;

/** 判断 R_param 是否满足契约条款：≡0 或带不确定度内容。 */
export function checkRParamClause(rParam?: ResidualLike): CheckStatus {
  const bound = rParam?.bound;
  if (!bound) return "needs_form";
  if (ZERO_RE.test(bound)) return "pass";
  if (UNCERTAINTY_RE.test(bound)) return "pass";
  return "fail";
}

/**
 * 反剧场信息量检查：相对宽度 = 带宽 / |带中点|。
 * 返回 { relative_width, within_vacuous, within_info_gate }。
 * 带不可解析时 relative_width 为 null，三项均为 false。
 */
export function checkInformation(
  certifiedBand?: string,
  opts?: { infoGateThreshold?: number },
): {
  relative_width: number | null;
  within_vacuous: boolean;
  within_info_gate: boolean;
} {
  const band = parseBand(certifiedBand);
  if (!band) return { relative_width: null, within_vacuous: false, within_info_gate: false };
  const mid = (band.lo + band.hi) / 2;
  if (mid === 0) {
    // 带跨越零点：无参考量级，无法定义相对宽度——不判空洞，交由消费方决策。
    return { relative_width: null, within_vacuous: true, within_info_gate: true };
  }
  const relative_width = (band.hi - band.lo) / Math.abs(mid);
  const threshold = opts?.infoGateThreshold ?? INFO_GATE_DEFAULT;
  return {
    relative_width,
    within_vacuous: relative_width <= VACUOUS_THRESHOLD,
    within_info_gate: relative_width <= threshold,
  };
}

/**
 * 残差清单带算术（机器可读数值路径）：r_model/r_param/r_num 的 `upper` 与 `total`
 * 全部为有限数时，判定 total ≤ R_model+R_param+R_num；任一数值缺失 → needs_form
 * （描述性带如实报告无法机检，不伪装通过）。
 */
export function checkTotalResidualArith(cert?: CertificateLike): CheckStatus {
  const upper = (r?: ResidualLike) =>
    r && typeof r.upper === "number" && Number.isFinite(r.upper) ? r.upper : null;
  const layers = [upper(cert?.r_model), upper(cert?.r_param), upper(cert?.r_num)];
  const total = cert?.total;
  if (layers.some((u) => u === null) || typeof total !== "number" || !Number.isFinite(total)) {
    return "needs_form";
  }
  return total <= layers[0]! + layers[1]! + layers[2]! ? "pass" : "fail";
}

/**
 * 核验一份证书。逐条落实契约不变量，返回结构化判定。
 *  - 带算术（total ≤ R_model+R_param+R_num）：当前数据多为描述性公式，
 *    无法机检时如实报 needs_form，并在 reasons 里说明契约要求机器形式。
 */
export function verifyCertificate(
  cert: CertificateLike | undefined,
  opts?: { infoGateThreshold?: number },
): JudgementVerdict {
  const reasons: string[] = [];
  if (!cert) {
    return {
      pass: false,
      checks: {
        r_param_clause: "needs_form",
        band_form: "needs_form",
        band_nonempty: "needs_form",
        band_nonvacuous: "needs_form",
        total_residual_arith: "needs_form",
      },
      relative_width: null,
      reasons: ["certificate missing"],
    };
  }

  const rParamClause = checkRParamClause(cert.r_param);
  const band = parseBand(cert.certified_band);
  const info = checkInformation(cert.certified_band, opts);
  const totalResidualArith = checkTotalResidualArith(cert);

  // 带形式与包含
  const bandForm: CheckStatus = cert.certified_band
    ? band
      ? "pass"
      : "needs_form"
    : "needs_form";
  const bandNonempty: CheckStatus = band
    ? band.lo < band.hi
      ? "pass"
      : "fail"
    : "needs_form";
  const bandNonvacuous: CheckStatus = band
    ? info.within_vacuous
      ? "pass"
      : "fail"
    : "needs_form";

  if (rParamClause === "fail") reasons.push("r_param neither ≡0 nor carries measurement/uncertainty content");
  if (rParamClause === "needs_form") reasons.push("r_param.bound missing or not machine-readable");
  if (bandForm === "needs_form" && cert.certified_band)
    reasons.push("certified_band is descriptive text, not a parseable [lo,hi] band (contract requires machine form)");
  if (bandNonvacuous === "fail")
    reasons.push(`band is vacuous: relative width ${info.relative_width?.toFixed(2)} > ${VACUOUS_THRESHOLD}`);
  if (totalResidualArith === "fail")
    reasons.push("residual ledger arithmetic: total > R_model+R_param+R_num");
  if (!info.within_info_gate && band)
    reasons.push(
      `information gate advisory: relative width ${info.relative_width?.toFixed(2)} > recommended ${opts?.infoGateThreshold ?? INFO_GATE_DEFAULT}`,
    );

  const checks = {
    r_param_clause: rParamClause,
    band_form: bandForm,
    band_nonempty: bandNonempty,
    band_nonvacuous: bandNonvacuous,
    total_residual_arith: totalResidualArith,
  };
  const pass = !Object.values(checks).includes("fail");
  return { pass, checks, relative_width: info.relative_width, reasons };
}

/** 一份可被核验的"判定"最小形状（兼容 Problem 的 judgment + certificate 提取）。 */
export interface JudgementLike {
  certificate?: CertificateLike;
}

/** 顶层入口：核验一道题/一条定律的判定证书。 */
export function verifyJudgement(j: JudgementLike, opts?: { infoGateThreshold?: number }): JudgementVerdict {
  return verifyCertificate(j.certificate, opts);
}
