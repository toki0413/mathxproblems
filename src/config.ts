// 评论区（Giscus / GitHub Discussions）配置。
// 站点仓库为 toki0413/mathxproblems，next-gen Discussions 已可启用。
// 启用步骤（一次性，约 5 分钟，零成本）：
// 1. 在仓库 Settings → General 中开启 Discussions
// 2. 安装 https://github.com/apps/giscus 到该仓库
// 3. 到 https://giscus.app/zh-CN 填入仓库，复制 data-repo-id / data-category-id 到下方
// 4. 将 enabled 置为 true，重新部署即可
export const COMMENTS = {
  // repo 与 category 已就位；repoId / categoryId 是 giscus 生成的临时 ID，
  // 安装并访问 giscus.app 后即可获得。缺失时保持 enabled=false，避免评论区加载失败。
  enabled: false,
  repo: 'toki0413/mathxproblems',
  repoId: '',
  category: 'General',
  categoryId: '',
}
