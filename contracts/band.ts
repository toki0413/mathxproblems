// 带证区间的解析与信息量计量：收窄飞轮的「比特」定义。
// 账本里 kind='verification' 的 newBand 形如 "[1.52, 1.56]"，是本仓库唯一
// 机器可读的数值带（目录 certificate.certified_band 是描述性文字，不可解析）。
// 一次收窄的信息量增益定义为 -log2(新带宽 / 旧带宽)：带宽每减半记 1 比特，
// 让跨题贡献可比，也让 trivial 收窄（≈0 比特）与实质突破（≫1 比特）在账本上可分。
// 纯函数、无依赖，前后端共用（前端首页收窄条、后端 feed.json 装配同调此源）。

export interface ParsedBand {
  lo: number;
  hi: number;
}

// 接受 [a, b] / (a, b)，数字允许负号、小数、科学计数法。其余写法一律视为
// 不可解析（返回 null），宁缺毋滥——bits 缺失好过静默误算。
const BAND_RE =
  /^[[(]\s*(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\s*,\s*(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\s*[\])]$/;

export function parseBand(raw: string | null | undefined): ParsedBand | null {
  if (!raw) return null;
  const m = raw.trim().match(BAND_RE);
  if (!m) return null;
  const lo = Number(m[1]);
  const hi = Number(m[2]);
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || !(lo < hi)) return null;
  return { lo, hi };
}

export function bandWidth(band: ParsedBand): number {
  return band.hi - band.lo;
}

/**
 * 从 prev 收窄到 next 的信息量增益（比特）。
 * 任一端不可解析、宽度非正、或 next 反而更宽（负增益一律返回负值，不截断——
 * 负比特是审计信号：审稿应能看到「收窄」名不副实）时按实计算或返回 null。
 */
export function bandBits(
  prevRaw: string | null | undefined,
  nextRaw: string | null | undefined,
): number | null {
  const prev = parseBand(prevRaw);
  const next = parseBand(nextRaw);
  if (!prev || !next) return null;
  return -Math.log2(bandWidth(next) / bandWidth(prev));
}
