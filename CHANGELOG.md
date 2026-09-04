# Changelog

本文件记录 MathX Problems 的版本变更。格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [SemVer](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### 安全

- **全站安全响应头**：CSP / HSTS / X-Frame-Options / X-Content-Type-Options / Referrer-Policy / Permissions-Policy 由 Worker 统一注入（API 与静态资源一致），补齐 Cloudflare 侧产业级验收项

### 性能与清理

- **构建体积告警文档化**：`chunkSizeWarningLimit` 显式标注目录数据 chunk（~700KB，按内容哈希长缓存）为刻意权衡，非告警遗漏
- **临时脚本清理**：删除一次性 `scripts/tmp-dump.mjs`、`scripts/tmp-scan-cjk.mjs`

## [0.1.0] - 2026-09-04

首个产业级预发布。开放数学问题目录 + 社区协作站（数学物理/化学/生物/工程四领域）。

### 新增

- **问题目录**：121 道开放问题（core 114 / vetted 7），每条带判定形式、障碍、形式化潜力、溯源与引用
- **双语切换**：全站中英可切换（~350 键 i18n），数据字段按语言渲染，避免混排
- **Lean 形式化锚点**：112 个陈述文件由 CI 用 Lean 4 工具链逐字编译 + 内联一致性守卫（L0）
- **经验定律图谱**：6 条经验定律（Michaelis–Menten、Monod、mixing-length、Fourier、Darcy、Miner）的边界/失效域/形式化缺口
- **工程反向需求清单**：24 条需求，判定链锚定 41 道题 + 4 条定律，缺口驱动收题流水线
- **影响域证据链**：30 个影响域注册表，18 篇 arXiv 论文逐篇验证（非生成）；26 道题挂接（含 11 道 verified_behavior）
- **协议账本**：只追加、带证据哈希 + 参考核验器判定，可独立复核
- **机器可读 API**：problems/laws/needs/impact/tools/feed/ledger JSON 出口
- **社区层**：匿名投稿审稿队列、评论、红旗、候选/投票、独立管理入口（Bearer 令牌）

### 修复

- **React hooks 条件调用崩溃**：无效问题 ID 触发 "Rendered fewer hooks than expected"（ProblemDetailPage）
- **CI 门禁接入**：`eslint`（0 error）+ `tsc -b` 进入 deploy.yml，此前 lint/类型错误可一路部署上线
- **写门面默认闭门**：`CLAIMS_WRITE_ENABLED` 移出仓库配置（wrangler.toml [vars]），生产恢复 501 默认闭门
- **i18n HTML 实体**：英文 refuted 提示的 `&apos;` 字面泄漏
- **文档漂移**：README / tech-spec 的 MySQL→Cloudflare D1、65 题→121 题、bigint→integer

### 基础设施

- GitHub Actions：push→Cloudflare Pages 自动部署（守卫 + Lean 编译 + lint/tsc + 构建 + 账本冒烟）
- 周更核验（OpenAlex + arXiv 检索"可能已解决"信号）与链接健康审计
- 数据不变量守卫：121 题交叉引用零悬空（needs/sourcing/tool/related/impact）
