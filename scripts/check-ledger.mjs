#!/usr/bin/env node
// 只追加账本审计：拉取 feed.json（公共账本表面），校验
//  1) 每条事件的 contentHash 与按同一规范重算的证据哈希一致（证据未被改写）；
//  2) 事件 id 严格递增且与 createdAt 次序一致（追加序未被回填/重排）。
// 用法：node scripts/check-ledger.mjs [baseUrl]
//       baseUrl 缺省取环境变量 LEDGER_URL，再缺省为 https://mathx-bridge.pages.dev
// 失败即退出码 1（供 CI/人工审计调用）。

import { evidenceHash } from "../contracts/ledger.ts";

const base = process.argv[2] ?? process.env.LEDGER_URL ?? "https://mathx-bridge.pages.dev";
const url = `${base.replace(/\/$/, "")}/api/v1/feed.json`;

const res = await fetch(url);
if (!res.ok) {
  console.error(`✗ GET ${url} -> ${res.status}`);
  process.exit(1);
}
const feed = await res.json();
const events = Array.isArray(feed) ? feed : [];

const problems = [];
for (const ev of events) {
  const { id, problemId, kind, title, content, narrative, newBand, formalStatus, method } = ev;
  const expected = evidenceHash({ problemId, kind, title, content, narrative, newBand, formalStatus, method });
  if (expected !== ev.contentHash) {
    problems.push(`hash-mismatch id=${id} (${problemId}/${kind})`);
  }
}

// 追加序：id 唯一且按 id 升序应与按 createdAt 升序一致。
const ids = events.map((e) => e.id);
if (new Set(ids).size !== ids.length) problems.push(`duplicate-ids: ${ids.join(",")}`);
const byId = [...events].sort((a, b) => a.id - b.id);
const byTime = [...events].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
for (let i = 0; i < byId.length; i++) {
  if (byId[i].id !== byTime[i].id) {
    problems.push(`order-mismatch at id=${byId[i].id} (append order inconsistent with createdAt)`);
    break;
  }
}
// 严格递增（跳过已删除导致的空洞？账本不允许删除，故应连续——仅作告警而非失败）
const nonIncreasing = [];
for (let i = 1; i < byId.length; i++) {
  if (byId[i].id <= byId[i - 1].id) nonIncreasing.push(byId[i].id);
}
if (nonIncreasing.length) problems.push(`non-increasing-id: ${nonIncreasing.join(",")}`);

if (problems.length) {
  console.error(`✗ ledger audit FAILED (${problems.length}):`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log(`✓ ledger audit OK: ${events.length} events, all hashes match, append order consistent (${base})`);
