// 评论区（Giscus / GitHub Discussions）配置。
// 启用步骤（约 5 分钟，零成本）：
// 1. 创建公开仓库（如 yourname/mathxproblems）并在 Settings → General 中开启 Discussions
// 2. 安装 https://github.com/apps/giscus 到该仓库
// 3. 到 https://giscus.app/zh-CN 填入仓库，复制 data-repo / data-repo-id / data-category-id 到下方
// 4. 将 enabled 置为 true，重新部署即可
export const COMMENTS = {
  enabled: false,
  repo: '',
  repoId: '',
  category: 'General',
  categoryId: '',
}
