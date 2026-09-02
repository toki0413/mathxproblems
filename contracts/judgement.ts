// Certified Judgement 契约 v0.1 —— "可证工程判定"的书面机器契约。
//
// 这是 MathX 运动的"宪法"：规定一个可被机器核验的工程判定必须携带什么、
// 字段语义是什么、哪些变更算兼容、哪些算破坏。对应
// docs/superpowers/specs/2026-09-01-certified-judgement-contract.md 的代码侧定义
// （语义文档与兼容矩阵的权威源以本文件为准，避免文档与代码漂移）。
//
// 核心主张：证书证明的是"判定形式与带界成立"，不是"底层物理为真"。
// 措辞纪律写进契约——这是协议信任的根基。

/** 契约版本。语义变化（非纯新增）必须升版。 */
export const JUDGEMENT_CONTRACT_VERSION = "v0.1" as const;

/**
 * 兼容性分类：契约变更的两种门。
 *  - additive：新增可选字段 / 新增枚举值 / 宽松校验 —— 旧消费方容忍未知字段即可兼容。
 *  - breaking：字段含义改变 / 数值语义改变 / 校验收紧 —— 即使形状未变也破坏兼容。
 * 规则：字段名没变但含义变了 = 破坏；带算术规则改变 = 破坏；bits 计算规则改变 = 破坏。
 */
export const COMPAT_CLASSES = ["additive", "breaking"] as const;
export type CompatClass = (typeof COMPAT_CLASSES)[number];

/** 三层残差带（与目录 Certificate 同构；契约要求 bound 尽量机器可解析）。 */
export interface ContractResidualLayer {
  /** 该层残差上界的表达。契约要求优先写成机器可解析形式（数值带或 "≡0"）。 */
  bound: string;
  /** 该层可独立复核的常数/方法来源。 */
  derivation: string;
}

/** 契约要求的证书最小形状（与 Problem.certificate 同构，用于核验器消费）。 */
export interface ContractCertificate {
  r_model: ContractResidualLayer;
  r_param: ContractResidualLayer;
  r_num: ContractResidualLayer;
  /** 总带合成公式。契约要求形如 "X_hi - X_lo ≤ R_model + R_param + R_num"。 */
  total_band: string;
  /** 带证区间。契约要求机器可解析的数值带（"[lo, hi]"），描述性文字视为未达到机器形式。 */
  certified_band?: string;
}

/**
 * 契约不变量（fitness functions 的源头，核验器逐条落实）：
 *  1. 带算术：总带宽 ≤ R_model + R_param + R_num（数值形式齐全时机器核验）。
 *  2. R_param 条款：参数精确给定（≡0）或必须带不确定度/测量残差内容——否则是"假声明"。
 *  3. 带非空：certified_band 必须可解析且 lo < hi。
 *  4. 带非空洞（反剧场闸门）：相对宽度 = 带宽 / |带中点| 必须 ≤ 1；超过即"空带剧场"。
 *  5. 信息量门槛（竞技场准入，可配置）：相对宽度建议 ≤ 阈值（默认 0.2），由消费方按赛道收紧。
 */
export const CONTRACT_INVARIANTS = [
  "band_arithmetic",
  "r_param_clause",
  "band_nonempty",
  "band_nonvacuous",
] as const;
export type ContractInvariant = (typeof CONTRACT_INVARIANTS)[number];

/** 契约要求的"核验器只读 + 提交路径永不核验"的信任分离。 */
export const TRUST_SEPARATION =
  "verifier is read-only and independent from the proposal/review path" as const;
