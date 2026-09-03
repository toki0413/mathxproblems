#!/usr/bin/env node
// 生成 lean/FailureRecord.lean 的 Catalog section（L2 锚点）：
// 从 src/data/problems.ts 提取全部 failure_records，转成 Lean 类型化档案（Profile），
// 让目录失败知识库 ↔ Lean 类型学参考逐题对齐、零漂移。
// 用法：node scripts/gen-failure-lean.mjs            （改写文件）
//       node scripts/gen-failure-lean.mjs --check    （只校验，不一致则退出码 1）
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const problemsSrc = readFileSync(join(root, 'src/data/problems.ts'), 'utf8')
const target = join(root, 'lean/FailureRecord.lean')

// 逐题块切分（与 catalog-checks 同源：id 4 空格缩进，块到下一个 id 为止）。
const blocks = []
const idRe = /^    id: '([^']+)'/gm
let m
while ((m = idRe.exec(problemsSrc))) {
  const start = m.index
  const next = problemsSrc.indexOf("\n    id: '", start + 10)
  blocks.push({ id: m[1], block: problemsSrc.slice(start, next > 0 ? next : undefined) })
}

const unquote = (s) => s.replace(/\\'/g, "'").replace(/\\\\/g, "\\")

/** 从 from 位置起找 `name: '...'`，返回 { value, end }；找不到返回 null。 */
function field(block, name, from) {
  const re = new RegExp(`${name}: '((?:[^'\\\\]|\\\\.)*)'`, 'g')
  re.lastIndex = from
  const mm = re.exec(block)
  return mm ? { value: unquote(mm[1]), end: mm.index + mm[0].length } : null
}

// 解析每道题的失败档案（条目内字段按 method/mechanism/layer/partial/implication 顺序）。
const profiles = []
for (const { id, block } of blocks) {
  const frIdx = block.indexOf('failure_records:')
  if (frIdx < 0) continue
  const records = []
  let searchFrom = frIdx
  for (;;) {
    const f = field(block, 'method', searchFrom)
    if (!f) break
    const mech = field(block, 'mechanism', searchFrom)
    const layer = field(block, 'layer', searchFrom)
    const partial = field(block, 'partial', searchFrom)
    const impl = field(block, 'implication', searchFrom)
    if (!mech || !layer || !partial || !impl) {
      throw new Error(`failure_records 字段不完整: ${id}`)
    }
    records.push({
      method: f.value,
      mechanism: mech.value,
      layer: layer.value,
      partial: partial.value,
      implication: impl.value,
    })
    searchFrom = impl.end
  }
  if (records.length === 0) continue
  profiles.push({ id, records })
}

// Lean 字符串字面量转义。
const leanStr = (s) =>
  '"' + s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n") + '"'

const safeName = (id) => id.replace(/-/g, "")

const genProfile = ({ id, records }) => {
  const recs = records
    .map(
      (r) =>
        [
          `      { method := ${leanStr(r.method)},`,
          `        mechanism := .${r.mechanism}, layer := .${r.layer},`,
          `        known := ${leanStr(r.partial)},`,
          `        implication := ${leanStr(r.implication)} },`,
        ].join("\n"),
    )
    .join("\n")
  return `def ${safeName(id)} : Profile :=
  { problemId := ${leanStr(id)},
    records := [
${recs}
    ] }`
}

const sectionHeader = `section Catalog
-- GENERATED-BY: scripts/gen-failure-lean.mjs（勿手改；目录 failure_records 的 Lean 类型化档案）
`
const body = profiles.map(genProfile).join("\n\n")
const wellFormed = profiles
  .map(({ id }) => `example : ${safeName(id)}.records.all wellFormed = true := by native_decide`)
  .join("\n")
const section = `${sectionHeader}${body}\n\n${wellFormed}\nend Catalog`

// 用 section 替换文件里 `section Catalog` … `end Catalog` 之间的内容。
const leanSrc = readFileSync(target, "utf8")
const startIdx = leanSrc.indexOf("section Catalog")
const endIdx = leanSrc.indexOf("end Catalog")
if (startIdx < 0 || endIdx < 0) throw new Error(`lean/${target.split("/").pop()} 缺少 section Catalog / end Catalog 标记`)
const next = leanSrc.slice(0, startIdx) + section + leanSrc.slice(endIdx + "end Catalog".length)

const check = process.argv.includes("--check")
if (check) {
  if (next !== leanSrc) {
    console.error(`FAIL: lean/FailureRecord.lean Catalog section 与目录 failure_records 不同步`)
    console.error(`      （${profiles.length} 道题的档案应重新生成）`)
    process.exit(1)
  }
  console.log(`check:gen-failure-lean OK (${profiles.length} profiles, ${profiles.reduce((n, p) => n + p.records.length, 0)} records)`)
} else {
  writeFileSync(target, next)
  console.log(`gen: failure → ${target} (${profiles.length} profiles, ${profiles.reduce((n, p) => n + p.records.length, 0)} records)`)
}
