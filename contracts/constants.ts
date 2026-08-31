export const Session = {
  cookieName: "kimi_sid",
  // 会话 30 天有效（此前为一年，过长放大 token 泄露窗口）。JWT 过期与 cookie
  // maxAgeMs 同源于此，见 api/kimi/session.ts。
  maxAgeMs: 30 * 24 * 60 * 60 * 1000,
} as const;

// OAuth 登录握手用的 CSRF 防伪 state：httpOnly cookie 存一次性 nonce，
// 回调时与 state 比对并消费，防止攻击者劫持受害者发起的 OAuth 流。
export const OAuthState = {
  cookieName: "kimi_oauth_state",
  maxAgeMs: 10 * 60 * 1000, // 10 分钟，足够完成一次授权
} as const;

export const ErrorMessages = {
  unauthenticated: "Authentication required",
  insufficientPermissions: "Insufficient permissions",
} as const;

/**
 * 伪匿名访客身份：不登录也可发言的匿名社区模型。
 * 服务端在访客首次访问时签发一个随机 UUID 存进 httpOnly cookie；
 * 它不暴露真实身份，仅用于同设备限流、一人一票、内容追溯。
 */
export const Visitor = {
  cookieName: "mv_id",
  maxAgeMs: 365 * 24 * 60 * 60 * 1000, // 一年
} as const;

/** 独立管理入口：管理员经 `Authorization: Bearer <ADMIN_TOKEN>` 访问审核接口，不进入公共身份体系。 */
export const AdminAuth = {
  header: "authorization",
  scheme: "Bearer ",
} as const;

export const Paths = {
  login: "/login",
  oauthInit: "/api/oauth/login",
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

/**
 * 双桥 formal_view.status 三值。写路径（api/claims-write.ts、
 * api/attempts-router.ts）的 zod 校验以此为源；目录枚举门禁
 * （scripts/lib/catalog-checks.mjs 的 FORMAL_STATUSES）与之保持同值。
 */
export const FORMAL_STATUSES = ["provable", "conjectured", "refuted"] as const;
export type FormalStatusValue = (typeof FORMAL_STATUSES)[number];
