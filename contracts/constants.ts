export const Session = {
  cookieName: "kimi_sid",
  maxAgeMs: 365 * 24 * 60 * 60 * 1000,
} as const;

export const ErrorMessages = {
  unauthenticated: "Authentication required",
  insufficientRole: "Insufficient permissions",
} as const;

export const Paths = {
  login: "/login",
  oauthCallback: "/api/oauth/callback",
} as const;

/** 问题所属领域（跨前端题库与后端投稿共享的唯一事实来源） */
export const DOMAIN_IDS = [
  "mathematical-physics",
  "mathematical-chemistry",
  "mathematical-biology",
  "mathematical-engineering",
] as const;

export type Domain = (typeof DOMAIN_IDS)[number];

// ponytail: 存量题的 id 形如 mp-001 / me-017（短横线 + 编号），但已有 mp-001…mp-035 与
// 若干跳号（如 mp-017 缺失），导出时若逐个登记会退化成一份易失真的镜像表。这里只做
// 格式层校验挡住明显伪造值；若日后需要严格存在性校验，应把题库 id 集合提到共享契约层。
export const PROBLEM_ID_RE = /^[a-z]{2}-\d{1,3}$/;
