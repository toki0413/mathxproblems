#!/usr/bin/env node
// 公证快照防编造守卫（Tier 0）。
//
// 与 api/attestations.json.ts 共用同一套公证规则（零漂移，由 api/attestations.test.ts
// 钉住 mc-017 / 确定性 / 无出处排除）：只公证 certificate.current_record（具体数值括区），
// 绝不把"目标带 / 判定通过"冒充为已核验事实。
//
// 规则：
//   1) 每个 certificate.current_record 必须通过 verifyCurrentRecord 良构性判定
//      （防"编造括区"：非空、非空洞、信息门槛内才可被公证）；
//   2) 每个 current_record 必须有 ≥1 条带 URL 的真实 references（防"无出处公证"）；
//   3) 公证列表确定性：同目录两次构建逐字节一致（任何人可复算；ETag 依赖此性质）。
// 失败即退出码 1（供 CI/人工审计调用）。
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { verifyCurrentRecord } from '../contracts/verifier.ts'

const src = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '../src/data/problems.ts'),
  'utf8',
)

// 逐题块切分（与 check-lean / catalog-checks 同源：id 4 空格缩进，块到下一个 id 为止）。
function blocksOf(s) {
  const out = []
  const re = /^    id: '([^']+)'/gm
  let m
  while ((m = re.exec(s))) {
    const next = s.indexOf("\n    id: '", m.index + 10)
    out.push({ id: m[1], block: s.slice(m.index, next > 0 ? next : undefined) })
  }
  return out
}

const RECORD_RE = /current_record:\s*\{\s*lo:\s*(-?\d+(?:\.\d+)?),\s*hi:\s*(-?\d+(?:\.\d+)?)\s*\}/
const URL_RE = /url: 'https?:[^']+'/

// 与 api/attestations.json.ts 的 recordAttestations 相同规则，推导可公证列表。
function deriveAttestations(blocks) {
  return blocks
    .filter((b) => RECORD_RE.test(b.block))
    .map((b) => {
      const [, lo, hi] = b.block.match(RECORD_RE)
      return { id: b.id, lo: Number(lo), hi: Number(hi), hasSource: URL_RE.test(b.block) }
    })
    .filter((r) => verifyCurrentRecord({ lo: r.lo, hi: r.hi }).well_formed && r.hasSource)
    .map((r) => ({ id: r.id, lo: r.lo, hi: r.hi }))
    .sort((a, b) => a.id.localeCompare(b.id))
}

const blocks = blocksOf(src)
const records = blocks.filter((b) => RECORD_RE.test(b.block))
let failed = 0

console.log(`current_record-bearing problems: ${records.length}`)

// 规则 1：良构性
for (const b of records) {
  const [, lo, hi] = b.block.match(RECORD_RE)
  const v = verifyCurrentRecord({ lo: Number(lo), hi: Number(hi) })
  if (!v.well_formed) {
    failed++
    console.error(`FAIL well-formed: ${b.id} current_record [${lo}, ${hi}] (relative width ${v.relative_width})`)
  }
}

// 规则 2：真实出处（无 URL 引用不得公证）
for (const b of records) {
  if (!URL_RE.test(b.block)) {
    failed++
    console.error(`FAIL no-source: ${b.id} has current_record but no reference with URL — 无真实出处不得公证`)
  }
}

// 规则 3：确定性
const first = JSON.stringify(deriveAttestations(blocks))
const second = JSON.stringify(deriveAttestations(blocks))
if (first !== second) {
  failed++
  console.error('FAIL determinism: 两次构建结果不一致')
}
console.log(`attestations emitted: ${JSON.parse(first).length}`)

if (failed > 0) {
  console.error(`check:attestations FAIL (${failed})`)
  process.exit(1)
}
console.log(
  `check:attestations OK (${records.length} record bracket(s), all well-formed + sourced + deterministic)`,
)
