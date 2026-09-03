#!/usr/bin/env node
// Lean anchor guard: every lean/<id>.lean must compile with the Lean 4 toolchain
// (std-only, no mathlib — light enough for CI), and the inline `lean_statement`
// embedded in src/data/problems.ts must match the canonical file so the UI copy
// can't drift from what is actually verified.
// Run with `node scripts/check-lean.mjs`; requires `lean` on PATH (see deploy.yml
// which installs elan first).
import { readFileSync, readdirSync } from 'node:fs'
import { execFileSync as run } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const leanDir = join(root, 'lean')
const src = readFileSync(join(root, 'src/data/problems.ts'), 'utf8')

const ids = []
for (const f of readdirSync(leanDir)) {
  if (f.endsWith('.lean')) ids.push(f.replace(/\.lean$/, ''))
}
if (ids.length < 5) {
  console.error(`FAIL: expected >=5 Lean statement files, got ${ids.length}`)
  process.exit(1)
}

let failed = 0
for (const id of ids) {
  const file = join(leanDir, `${id}.lean`)
  const canonical = readFileSync(file, 'utf8')
  // 共享模块（内容含 SHARED-MODULE 标记，如 lean/CertifiedBand.lean 参考核验器）：
  // 只要求编译通过，不要求目录里某道题的 inline lean_statement 与它逐字匹配。
  const isShared = canonical.includes('SHARED-MODULE')
  try {
    run('lean', [file], { stdio: ['ignore', 'pipe', 'pipe'], cwd: leanDir })
  } catch (e) {
    failed++
    console.error(`FAIL compile: ${id}.lean`)
    console.error(String(e.stderr || e.message).slice(0, 2000))
    continue
  }
  console.log(`  ok compile: ${id}.lean`)

  if (isShared) {
    console.log(`  ok shared module (no inline statement required): ${id}`)
    continue
  }

  // inline copy must match the canonical file
  const blockStart = src.indexOf(`\n    id: '${id}',`)
  if (blockStart < 0) {
    failed++
    console.error(`FAIL: no catalog block for ${id}`)
    continue
  }
  const blockEnd = src.indexOf('\n    id: \'', blockStart + 10)
  const block = src.slice(blockStart, blockEnd > 0 ? blockEnd : undefined)
  const m = block.match(/lean_statement: '((?:[^'\\]|\\.)*)'/)
  if (!m) {
    failed++
    console.error(`FAIL: ${id} has lean file but no inline lean_statement`)
    continue
  }
  const inline = unescape(m[1])
  if (inline !== canonical) {
    failed++
    console.error(`FAIL: ${id} inline lean_statement drifted from lean/${id}.lean`)
  } else {
    console.log(`  ok inline match: ${id}`)
  }
}

function unescape(s) {
  let out = ''
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '\\' && i + 1 < s.length) {
      const c = s[i + 1]
      if (c === 'n') { out += '\n'; i++ }
      else if (c === "'") { out += "'"; i++ }
      else if (c === '\\') { out += '\\'; i++ }
      else { out += s[i] }
    } else {
      out += s[i]
    }
  }
  return out
}

if (failed > 0) {
  console.error(`check:lean FAIL (${failed} problem(s))`)
  process.exit(1)
}
console.log(`check:lean OK (${ids.length} statements, all compile + inline match)`)
