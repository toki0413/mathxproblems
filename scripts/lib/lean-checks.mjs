// Pure screening for "proven" Lean modules (SHARED-MODULE / proof_steps targets).
// Anti-cheat guard mirroring Vero (arXiv 2608.13522) 的声明筛选/axiom allowlist：
// 一个声称"机器可查证明"的模块，不得藏在 axiom / sorry / admit / unsafe 之后。
// 仅供 SHARED-MODULE（已证）使用；陈述文件（mb-*.lean）合法含 `by sorry`，不在本筛查内。
export const PROVEN_CHEAT_RE = /\b(axiom|sorry|admit|unsafe)\b/g

/**
 * 剥掉 Lean 源码里的"非代码"噪音：块注释（/- -/）、行注释（-- ...）与
 * 双引号字符串字面量（"..."，含转义）。文档字符串/散文里的英文单词
 * （如 "may not admit a criterion"）不能算作弊记号，必须先剔除。
 */
export function stripLeanNoise(src) {
  return src
    .replace(/\/-[\s\S]*?-\//g, " ")
    .replace(/--[^\n]*/g, " ")
    .replace(/"(?:[^"\\]|\\.)*"/g, " ");
}

/** 兼容旧名（仅剥注释）；新代码请用 stripLeanNoise。 */
export const stripLeanComments = stripLeanNoise;

/**
 * 筛查一个"已证"模块：返回命中的作弊记号列表（axiom/sorry/admit/unsafe）。
 * 命中即该模块不能宣称已证明。
 */
export function screenProvenModule(src) {
  const code = stripLeanNoise(src);
  const hits = new Set();
  for (const m of code.matchAll(PROVEN_CHEAT_RE)) hits.add(m[1]);
  return [...hits];
}
