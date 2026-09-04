import "dotenv/config"
import devServer from "@hono/vite-dev-server"
import path from "path"
const __dirname = import.meta.dirname
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    devServer({ entry: "api/boot.ts", exclude: [/^\/(?!api\/).*$/] }),
    inspectAttr(), react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@contracts": path.resolve(__dirname, "./contracts"),
      "@db": path.resolve(__dirname, "./db"),
      "db": path.resolve(__dirname, "./db"),
    },
  },
  envDir: path.resolve(__dirname),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    // 目录数据 chunk（problems-*.js，约 700KB / gzip ~200KB）是刻意的体积权衡：
    // 121 道题全部内联以支持首页/统计/图谱的即时聚合与随机抽样，不引入网络往返；
    // 该 chunk 按内容哈希命名、长期缓存，且路由级懒加载 + vendor 拆分已就位，
    // 因此超过默认 500KB 阈值属预期，而非待拆的失控 chunk。
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        // 拆 vendor：让 React/图表/KaTeX/Radix 各自成 chunk，首屏只加载需要的，
        // 且长期缓存不随业务代码变动失效。
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined
          if (id.includes("/react/") || id.includes("react-dom") || id.includes("react-router") || id.includes("/scheduler/"))
            return "react"
          if (id.includes("/recharts/") || id.includes("/d3-") || id.includes("victory-vendor"))
            return "charts"
          if (id.includes("/katex/") || id.includes("react-markdown") || id.includes("remark-") ||
              id.includes("rehype-") || id.includes("micromark") || id.includes("/unified/") ||
              id.includes("mdast-") || id.includes("hast-") || id.includes("vfile") || id.includes("/unist-"))
            return "markdown"
          if (id.includes("/@radix-ui/") || id.includes("radix"))
            return "radix"
          return "vendor"
        },
      },
    },
  },
});
