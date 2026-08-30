// 障碍相似图：把每道题 obstacles 里的「已知障碍」从注解变成路由层。
//
// 动机：数学方法极少只解一题。一个 agent 在某题上收窄成功，真正有价值的问题是
// 「这项技术还能松哪些题的绑」。本模块在启动时从目录（buildCatalog 已解析出
// obstacles）确定性地构建跨题障碍链，并让审稿账本里已通过声明的 method 标签
// 沿边扩散，给出「方法 → 可解锁问题」的反向路由。
//
// 签名 = 英文内容词（去停用词、去 LaTeX）∪ 中文二元组；跨题 Jaccard ≥ 阈值连边。
// 刻意的工程取舍：不做词表分类法——实测 210 条障碍标题两两不复用，关键词规则
// 覆盖率封顶约四成且脆弱；文本相似 + 阈值透明、确定、可随目录增长自动变密。
// 建议层定位：宁可少连不可乱连，阈值在 OBSTACLE_LINK_THRESHOLD 集中可调。

export interface ObstacleRef {
  problem: string;
  index: number;
  /** 障碍的加粗头（**...**），无头时取前缀截断，仅供人读 */
  head: string;
}

export interface ObstacleLink {
  a: ObstacleRef;
  b: ObstacleRef;
  /** Jaccard 相似度，保留 3 位小数便于契约稳定 */
  score: number;
}

export const OBSTACLE_LINK_THRESHOLD = 0.1;

const STOP_WORDS = new Set(
  "the a an of to in on for with without by is are be as at from or and not no only over under between into via its it this that these those current currently known unknown yet still must cannot can"
    .split(" "),
);

/** 双语签名：英文内容词 ∪ 中文二元组。确定性、无外部依赖。 */
export function obstacleSignature(text: string): Set<string> {
  const cleaned = text
    .replace(/\$[^$]*\$/g, " ") // 去掉 LaTeX 内联数学
    .replace(/[*_`\\{}^]/g, " ");
  const sig = new Set<string>();
  for (const w of cleaned.toLowerCase().match(/[a-z][a-z-]{2,}/g) ?? []) {
    if (!STOP_WORDS.has(w)) sig.add(w);
  }
  for (const run of cleaned.match(/[一-鿿]+/g) ?? []) {
    for (let i = 0; i + 1 < run.length; i++) sig.add(run.slice(i, i + 2));
  }
  return sig;
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

function obstacleHead(text: string): string {
  const m = text.match(/^\*\*(.+?)\*\*/);
  return (m ? m[1] : text).slice(0, 80);
}

/** 跨题障碍链：同一题内部的障碍不互连（那是同一道题的内部结构）。 */
export function buildObstacleLinks(
  problems: { id: string; obstacles: string[] }[],
  threshold = OBSTACLE_LINK_THRESHOLD,
): ObstacleLink[] {
  const flat = problems.flatMap((p) =>
    p.obstacles.map((text, index) => ({
      ref: { problem: p.id, index, head: obstacleHead(text) },
      sig: obstacleSignature(text),
    })),
  );
  const links: ObstacleLink[] = [];
  for (let i = 0; i < flat.length; i++) {
    for (let j = i + 1; j < flat.length; j++) {
      if (flat[i].ref.problem === flat[j].ref.problem) continue;
      const score = jaccard(flat[i].sig, flat[j].sig);
      if (score >= threshold) {
        links.push({
          a: flat[i].ref,
          b: flat[j].ref,
          score: Math.round(score * 1000) / 1000,
        });
      }
    }
  }
  return links.sort((x, y) => y.score - x.score);
}

/**
 * 方法解锁：已通过声明携带 method 标签的问题集合 → 沿障碍链相邻、
 * 且自身尚未被该方法触及的问题。回答「这项技术下一步该试哪几道题」。
 */
export function methodUnlocks(
  links: ObstacleLink[],
  events: { problemId: string; method?: string | null }[],
): Record<string, string[]> {
  const byMethod = new Map<string, Set<string>>();
  for (const e of events) {
    const m = e.method?.trim();
    if (!m) continue;
    if (!byMethod.has(m)) byMethod.set(m, new Set());
    byMethod.get(m)!.add(e.problemId);
  }
  const adjacency = new Map<string, Set<string>>();
  const link = (x: string, y: string) => {
    if (!adjacency.has(x)) adjacency.set(x, new Set());
    adjacency.get(x)!.add(y);
  };
  for (const l of links) {
    link(l.a.problem, l.b.problem);
    link(l.b.problem, l.a.problem);
  }
  const out: Record<string, string[]> = {};
  for (const [method, solved] of byMethod) {
    const reached = new Set<string>();
    for (const p of solved) {
      for (const q of adjacency.get(p) ?? []) {
        if (!solved.has(q)) reached.add(q);
      }
    }
    out[method] = [...reached].sort();
  }
  return out;
}

/** /api/v1/obstacles.json 的载荷：链 + 方法解锁 + 规模统计。 */
export function buildObstaclesPayload(
  problems: { id: string; obstacles: string[] }[],
  events: { problemId: string; method?: string | null }[],
) {
  const links = buildObstacleLinks(problems);
  return {
    meta: {
      threshold: OBSTACLE_LINK_THRESHOLD,
      semantics:
        "cross-problem obstacle links by bilingual Jaccard signature; unlocks = approved-attempt methods diffused one hop along links",
    },
    stats: {
      problems: problems.length,
      obstacles: problems.reduce((n, p) => n + p.obstacles.length, 0),
      links: links.length,
    },
    links,
    unlocks: methodUnlocks(links, events),
  };
}
