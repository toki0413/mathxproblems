#!/usr/bin/env node
// 审计守卫：审计表（src/data/audits.ts）必须覆盖目录中每一道题，
// status 合法、flagged 必须带原因、不得有悬空 id（指向不存在的题）。
// 失败即退出码 1（供 CI 调用）。
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const problemsSrc = readFileSync(join(root, "src/data/problems.ts"), "utf8");
const auditsSrc = readFileSync(join(root, "src/data/audits.ts"), "utf8");

const problemIds = new Set(
  [...problemsSrc.matchAll(/^    id: '([^']+)'/gm)].map((m) => m[1]),
);
const auditIds = new Set(
  [...auditsSrc.matchAll(/^  '([^']+)': \{/gm)].map((m) => m[1]),
);
const failures = [];

// 1) 每道题都必须有审计记录
const missing = [...problemIds].filter((id) => !auditIds.has(id));
if (missing.length) failures.push(`problems missing audit: ${missing.join(', ')}`);

// 2) 审计表不得有悬空 id
const dangling = [...auditIds].filter((id) => !problemIds.has(id));
if (dangling.length) failures.push(`audit references unknown problem: ${dangling.join(', ')}`);

// 3) status 合法
const badStatus = [...auditsSrc.matchAll(/^  '([^']+)': \{ status: '([^']+)'/gm)].filter(
  ([, , s]) => !['passed', 'flagged'].includes(s),
);
if (badStatus.length) failures.push(`invalid audit status: ${badStatus.map((m) => m[1]).join(', ')}`);

// 4) flagged 必须带原因（逐条解析 audit 条目块）
const flaggedIds = [...auditsSrc.matchAll(/^  '([^']+)': \{ status: 'flagged'/gm)].map((m) => m[1]);
const flaggedMissingReason = flaggedIds.filter((id) => {
  const start = auditsSrc.indexOf(`'${id}': {`);
  const lineEnd = auditsSrc.indexOf("\n", start);
  const block = auditsSrc.slice(start, lineEnd > 0 ? lineEnd : start + 400);
  return !/reason: /.test(block);
});
if (flaggedMissingReason.length) failures.push(`flagged audit missing reason: ${flaggedMissingReason.join(', ')}`);

const passedCount = (auditsSrc.match(/status: 'passed'/g) || []).length;
const flaggedCount = (auditsSrc.match(/status: 'flagged'/g) || []).length;

console.log(`audit: ${problemIds.size} problems, ${passedCount} passed, ${flaggedCount} flagged`);

if (failures.length) {
  for (const f of failures) console.error(`  FAIL ${f}`);
  process.exit(1);
}
console.log("check:audits OK");
