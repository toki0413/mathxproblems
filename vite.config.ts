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
