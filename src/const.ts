// 独立管理入口的访问令牌存放在浏览器本地，所有审核请求以
// `Authorization: Bearer <token>` 附带。未配置即非管理员（管理接口返回 403）。
export const ADMIN_TOKEN_KEY = "mv_admin_token";

// 收录里程碑。当前 100 题已达成，滚动上调至下一档 "超容" 目标，
// 统一以 GOAL_PROBLEMS 为基准，避免首页/页脚/统计/关于页口径不一致。
export const GOAL_PROBLEMS = 120;
