#!/usr/bin/env node
// 边界图谱数据校验：对 src/data/laws.ts 做结构守卫（与 catalog-checks 同风格的正则解析）。
// 校验：id 格式、industry 非空、status 枚举、三层残差齐全、boundary/gap/formal_statement 非空、
// tool_links 引用注册表工具（复用 catalog-checks 的 TOOL_IDS）。失败退出码 1。

import { readFileSync } from "node:fs";
import { TOOL_IDS } from "./lib/catalog-checks.mjs";

const src = readFileSync(new URL("../src/data/laws.ts", import.meta.url), "utf8");

const LAW_STATUSES = ["formalized", "partial", "gap"];
const field = (block, re) => (block.match(re) || [])[1]?.trim() ?? "";

const failures = [];
const notes = [];
const blocks = src.split(/\n  \{\n/).slice(1);

for (const b of blocks) {
  const id = field(b, /^\s*id: '([^']+)'/);
  if (!id) continue;
  if (!/^law-[a-z0-9-]+$/.test(id)) failures.push(`${id}: bad id format`);
  const industry = field(b, /industry: '([^']*)'/);
  if (!industry) failures.push(`${id}: missing industry`);
  const status = field(b, /status: '([^']*)'/);
  if (!LAW_STATUSES.includes(status)) failures.push(`${id}: invalid status '${status}'`);
  for (const k of ["r_model", "r_param", "r_num"]) {
    const v = field(b, new RegExp(`${k}: '([^']*)'`));
    if (!v) failures.push(`${id}: missing residual ${k}`);
  }
  for (const k of ["boundary", "gap", "formal_statement"]) {
    if (!new RegExp(`\\n\\s*${k}:`, "m").test(b)) failures.push(`${id}: missing ${k}`);
  }
  for (const m of b.matchAll(/tool_id: '([^']+)'/g)) {
    if (!TOOL_IDS.has(m[1])) failures.push(`${id}: unknown tool '${m[1]}'`);
  }
  notes.push(`${id} (${status})`);
}

if (failures.length) {
  console.error(`✗ check:laws FAILED (${failures.length})`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`✓ check:laws OK (${notes.length} laws)`);
for (const n of notes) console.log(`  · ${n}`);
