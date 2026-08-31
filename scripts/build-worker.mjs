// 把 Cloudflare Pages 单入口 worker 打包到构建输出目录根部。
// Pages Advanced Mode 要求 output dir 里有一个 _worker.js；它处理 /api/* 并回退 ASSETS。
import { build } from "esbuild";
import { mkdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, "dist/public");
const outFile = resolve(outDir, "_worker.js");

// 每次重新打包前清掉旧的 worker 产物，避免残留的旧逻辑被 Pages 消费。
await rm(outFile, { force: true });
await mkdir(outDir, { recursive: true });

await build({
  entryPoints: [resolve(root, "_worker.ts")],
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  tsconfig: resolve(root, "tsconfig.json"),
  outfile: outFile,
  sourcemap: false,
});

console.log(`worker bundle written to ${outFile}`);