#!/usr/bin/env node
// 生成 catalog 内联 lean_statement（L0 锚点）：把 lean/<id>.lean 的规范内容
// 转义为 JS 单引号字符串，注入 src/data/problems.ts 对应块的
// `provenance: 'lean-compilable'` + `lean_statement: '...'`，与 check-lean 的
// 逐字比对共用同一转义规则，零漂移。
// 用法：node scripts/gen-statement-lean.mjs            （改写文件）
//       node scripts/gen-statement-lean.mjs --check    （只校验，不一致则退出码 1）
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const leanDir = join(root, 'lean')
const problemsSrc = readFileSync(join(root, 'src/data/problems.ts'), 'utf8')

// 规范文件：排除共享模块（内容含 SHARED-MODULE 标记，如 CertifiedBand/FailureRecord）。
const ids = []
for (const f of readdirSync(leanDir)) {
  if (!f.endsWith('.lean')) continue
  const canonical = readFileSync(join(leanDir, f), 'utf8')
  if (canonical.includes('SHARED-MODULE')) continue
  ids.push(f.replace(/\.lean$/, ''))
}

// JS 单引号转义（与 check-lean.mjs 的 unescape 互逆）：\ → \\，' → \'，换行 → \n。
const escapeJS = (s) =>
  s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')

// 逐题块切分（与 check-lean/catalog-checks 同源：id 4 空格缩进，块到下一个 id 为止）。
const blocks = []
const idRe = /^    id: '([^']+)',$/gm
let m
while ((m = idRe.exec(problemsSrc))) {
  const next = problemsSrc.indexOf("\n    id: '", m.index + 10)
  blocks.push({ id: m[1], block: problemsSrc.slice(m.index, next > 0 ? next : undefined), start: m.index })
}

// 需要改写的块：规范文件存在、且内联 lean_statement 与 provenance 未同步。
const pending = []
for (const id of ids) {
  const b = blocks.find((x) => x.id === id)
  if (!b) throw new Error(`lean/${id}.lean 在 catalog 中无对应块`)
  const canonical = readFileSync(join(leanDir, `${id}.lean`), 'utf8')
  const inline = `    lean_statement: '${escapeJS(canonical)}',`
  const prov = "    provenance: 'lean-compilable',"
  const hasStatement = b.block.includes('\n    lean_statement:')
  const hasProv = b.block.includes('\n    provenance:')
  const synced =
    b.block.includes(inline) && (hasProv ? b.block.includes(prov) : false)
  if (!synced) pending.push({ b, canonical, inline, prov, hasStatement, hasProv })
}

if (process.argv.includes('--check')) {
  if (pending.length) {
    console.error(`FAIL: ${pending.length} 道题的内联 lean_statement/provenance 未同步：`)
    for (const { b } of pending) console.error(`  - ${b.id}`)
    console.error('      运行 node scripts/gen-statement-lean.mjs 重新生成')
    process.exit(1)
  }
  console.log(`check:gen-statement-lean OK (${ids.length} statements, all inline-synced)`)
  process.exit(0)
}

// 按位置倒序改写，避免偏移错乱。
let src = problemsSrc
for (const { b, inline, prov, hasStatement, hasProv } of pending.sort((a, z) => z.b.start - a.b.start)) {
  const { block, start } = b
  let next = block
  // provenance：有则替换该行，无则插到 date_added 行之后。
  const dateAdded = next.indexOf('\n    date_added:')
  if (hasProv) {
    next = next.replace(/^    provenance: '[^']*',$/m, prov)
  } else {
    const anchor = next.indexOf('\n', dateAdded + 1)
    next = next.slice(0, anchor) + '\n' + prov + next.slice(anchor)
  }
  // lean_statement：有则替换该行，无则插到 provenance 行之后。
  if (hasStatement) {
    next = next.replace(/^    lean_statement: '((?:[^'\\]|\\.)*)',$/m, inline)
  } else {
    const pIdx = next.indexOf('\n    provenance:')
    const anchor = next.indexOf('\n', pIdx + 1)
    next = next.slice(0, anchor) + '\n' + inline + next.slice(anchor)
  }
  src = src.slice(0, start) + next + src.slice(start + block.length)
}
writeFileSync(join(root, 'src/data/problems.ts'), src)
console.log(`gen: statement → src/data/problems.ts (${pending.length} block(s) updated, ${ids.length} statements total)`)
