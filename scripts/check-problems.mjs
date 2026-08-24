#!/usr/bin/env node
// Invariant checks over the problem catalog (problems.ts).
// Guard rails we want to keep: unique ids, no dangling relation edges,
// and tag spelling consistency. Run with `node scripts/check-problems.mjs`.
//
// ponytail: this parses the TS source with regex instead of importing it,
// because the workspace has no node_modules. If CI ever gains deps/tsc,
// replace this with a real import of src/data/problems.ts. The regex
// assumptions (4-space id indent, one relation per line) are stable.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const src = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '../src/data/problems.ts'),
  'utf8',
)

const ids = [...src.matchAll(/^    id: '([^']+)'/gm)].map((m) => m[1])
let cur = null
let curTo = null
const edges = []
const judged = new Set()
const judgments = new Map() // id -> judgment 字符串（用于三层残差校验）
const outputs = new Map()
const hasEngValue = new Set()
const hasImpact = new Set()
const hasTrace = new Set()
const dates = new Map()
const hasCertificate = new Set()
const hasDeliverables = new Set()
let pendingJudgment = false
let pendingNote = false
// related_problems entry shape is id → relation → note, so we read the id
// into curTo and push the edge when the relation line follows.
for (const line of src.split(/\r?\n/)) {
  const idMatch = line.match(/^    id: '([^']+)'/)
  if (idMatch) {
    cur = idMatch[1]
    continue
  }
  if (/^    judgment:/.test(line) && cur) {
    judged.add(cur)
    // judgment 可同行 'value' 或换行后 'value'，两种都接
    const inline = line.match(/^    judgment:\s*'((?:[^'\\]|\\.)*)'/)
    if (inline) {
      judgments.set(cur, inline[1])
      pendingJudgment = false
    } else {
      pendingJudgment = true
    }
  } else if (pendingJudgment && cur) {
    const nextLine = line.match(/^\s*'((?:[^'\\]|\\.)*)'/)
    if (nextLine) judgments.set(cur, nextLine[1])
    pendingJudgment = false
  }
  const outMatch = line.match(/^    output: '([^']+)',/)
  if (outMatch && cur) outputs.set(cur, outMatch[1])
  if (/^    engineering_value:/.test(line) && cur) hasEngValue.add(cur)
  if (/^    impact_domains:/.test(line) && cur) hasImpact.add(cur)
  if (/^    certificate:/.test(line) && cur) hasCertificate.add(cur)
  if (/^    engineering_deliverables:/.test(line) && cur) hasDeliverables.add(cur)
  // 溯源判据：proposer 或 via 至少其一，视为可问责来源
  if (/^    (proposer|via):/.test(line) && cur) hasTrace.add(cur)
  const dMatch = line.match(/^    date_added: '([^']+)'/)
  if (dMatch && cur) dates.set(cur, dMatch[1])
  const to = line.match(/^        id: '([^']+)',/)
  if (to) {
    curTo = to[1]
    continue
  }
  const rel = line.match(/^        relation: '([^']+)',/)
  if (rel && cur && curTo) {
    edges.push({ from: cur, to: curTo, relation: rel[1], note: '' })
    curTo = null
    pendingNote = true
    continue
  }
  if (pendingNote && edges.length > 0) {
    const noteMatch = line.match(/^        note: '((?:[^'\\]|\\.)*)'/)
    if (noteMatch) edges[edges.length - 1].note = noteMatch[1]
    pendingNote = false
  }
}

let exitCode = 0
const fail = (msg) => {
  console.log('  FAIL ' + msg)
  exitCode = 1
}

console.log(`problems: ${ids.length}`)
const dupIds = ids.filter((id, i) => ids.indexOf(id) !== i)
if (dupIds.length) fail(`duplicate ids: ${[...new Set(dupIds)].join(', ')}`)

const idSet = new Set(ids)
const dangling = [...new Set(edges.filter((e) => !idSet.has(e.to)).map((e) => e.to))]
if (dangling.length) fail(`dangling related_problems targets: ${dangling.join(', ')}`)
else console.log(`  relation edges: ${edges.length}, dangling: 0`)

// The five relations are the whole vocabulary (RelationType in problems.ts).
// Keeping the wordlist here lets us catch typos before they reach the UI.
const RELATIONS = new Set(['depends_on', 'implies', 'shares_tools', 'generalizes', 'analog_of'])
const badRel = [...new Set(edges.filter((e) => !RELATIONS.has(e.relation)).map((e) => e.relation))]
if (badRel.length) fail(`unknown relation type: ${badRel.join(', ')}`)

// UI derives reverse symmetric edges at render time, so data is authored one
// direction only — no self-loops, and one unique edge per (from,to,relation).
const selfLoops = edges.filter((e) => e.from === e.to)
if (selfLoops.length) fail(`self-loop edges: ${selfLoops.map((e) => e.from).join(', ')}`)
const seenEdges = new Set()
const dupEdges = []
for (const e of edges) {
  const key = `${e.from}|${e.relation}|${e.to}`
  if (seenEdges.has(key)) dupEdges.push(key)
  seenEdges.add(key)
}
if (dupEdges.length) fail(`duplicate relation edges: ${[...new Set(dupEdges)].join(', ')}`)
if (!badRel.length && !selfLoops.length && !dupEdges.length) {
  console.log(`  relations: ok (${[...RELATIONS].join(', ')})`)
}

const tags = [
  ...src.matchAll(/tags: \[([^\]]*)\]/g),
].flatMap((m) => [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]))
const norm = new Map()
for (const t of tags) {
  const k = t.trim().toLowerCase()
  if (!norm.has(k)) norm.set(k, new Set())
  norm.get(k).add(t)
}
const variants = [...norm.entries()].filter(([, set]) => set.size > 1)
if (variants.length) {
  variants.forEach(([k, set]) =>
    console.log(`  tag variant '${k}': ${[...set].join(' / ')}`),
  )
  fail(`${variants.length} tag(s) differ only by case/whitespace`)
}

const missingJudgment = ids.filter((id) => !judged.has(id))
if (missingJudgment.length) {
  fail(`problems missing 'judgment': ${missingJudgment.join(', ')}`)
} else {
  console.log(`  judgment: all ${ids.length} problems covered`)
}

// 'output' must be present on every problem and be one of the three OutputKind
// values; the distribution is what the transfer-strength UI renders.
const OUTPUT_KINDS = new Set(['verified_behavior', 'verified_truth', 'scaffolding'])
const missingOutput = ids.filter((id) => !outputs.has(id))
if (missingOutput.length) fail(`problems missing 'output': ${missingOutput.join(', ')}`)
const badOutput = [...outputs.entries()].filter(([, v]) => !OUTPUT_KINDS.has(v))
if (badOutput.length) fail(`invalid output: ${badOutput.map(([k, v]) => `${k}=${v}`).join(', ')}`)
if (missingOutput.length === 0 && badOutput.length === 0) {
  const dist = {}
  for (const v of outputs.values()) dist[v] = (dist[v] ?? 0) + 1
  const distStr = ['verified_behavior', 'verified_truth', 'scaffolding']
    .filter((k) => dist[k])
    .map((k) => `${k}=${dist[k]}`)
    .join(' ')
  console.log(`  output: all covered (${distStr})`)
}

// 应用价值判据：任何题都必须给出 impact_domains；verified_behavior 的题
// 必须有一句 engineering_value 说明产出如何被工程直接消费。
const noImpact = ids.filter((id) => !hasImpact.has(id))
if (noImpact.length) fail(`problems missing 'impact_domains': ${noImpact.join(', ')}`)
else console.log(`  impact_domains: all ${ids.length} problems covered`)

const vbNoEng = ids.filter((id) => outputs.get(id) === 'verified_behavior' && !hasEngValue.has(id))
if (vbNoEng.length) fail(`verified_behavior problems missing 'engineering_value': ${vbNoEng.join(', ')}`)
else
  console.log(
    `  engineering_value: all verified_behavior problems covered (${
      ids.filter((id) => outputs.get(id) === 'verified_behavior').length
    })`,
  )

// 三层残差判据（方向一）：verified_behavior 的 judgment 必须显式覆盖
// R_model / R_param / R_num 三层，且 R_param 要么有不确定度传播说明、
// 要么显式声明 ≡0（参数精确给定时如实注明，不硬凑）。
const vbIds = ids.filter((id) => outputs.get(id) === 'verified_behavior')
const LAYERS = ['R_model', 'R_param', 'R_num']
const missingLayers = []
const noRParamDecl = []
for (const id of vbIds) {
  const j = judgments.get(id) ?? ''
  for (const layer of LAYERS) {
    if (!j.includes(layer)) missingLayers.push(`${id}:${layer}`)
  }
  // R_param 必须显式说明：要么有不确定度传播内容，要么声明 ≡0
  if (j.includes('R_param') && !/R_param[^\n]*≡\s*0/.test(j) && !/R_param[^\n]*测量|不确定度|输入残差/.test(j)) {
    noRParamDecl.push(id)
  }
}
if (missingLayers.length)
  fail(`verified_behavior judgments missing residual layers: ${missingLayers.join(', ')}`)
else
  console.log(
    `  three-layer residual: all ${vbIds.length} verified_behavior judgments cover R_model/R_param/R_num`,
  )
if (noRParamDecl.length)
  fail(`R_param declared without uncertainty content or ≡0 note: ${noRParamDecl.join(', ')}`)
else console.log(`  R_param declaration: all verified_behavior problems explicit`)

// 总带继承链判据（方向二）：verified_behavior 的 depends_on 边必须在 note
// 中写明继承语义（上游加固/击穿下游）。只警告不阻断，便于渐进补齐。
const INHERITANCE_MARKERS = ['总带继承', 'inheritance']
const vbDependsOn = edges.filter(
  (e) => outputs.get(e.from) === 'verified_behavior' && e.relation === 'depends_on',
)
const noInheritanceNote = vbDependsOn.filter(
  (e) => !INHERITANCE_MARKERS.some((m) => e.note.includes(m)),
)
if (noInheritanceNote.length)
  console.log(
    `  WARNING: depends_on edges from verified_behavior missing inheritance note: ${noInheritanceNote
      .map((e) => `${e.from}->${e.to}`)
      .join(', ')}`,
  )
else if (vbDependsOn.length)
  console.log(
    `  inheritance chain: all ${vbDependsOn.length} depends_on edges from verified_behavior carry inheritance notes`,
  )

// 结构化证书判据（方向一 L1）：verified_behavior 若填了 certificate，必须三层齐全
// （r_model/r_param/r_num + total_band），且 R_param 的 bound 要么有不确定度说明、
// 要么声明 ≡0。这是渐进式推进——已填的题必须结构正确，未填的题暂不阻断。
const CERT_LAYERS = ['r_model', 'r_param', 'r_num']
const certIds = [...hasCertificate]
const badCert = []
for (const id of certIds) {
  // 提取该 problem 的源码块：从顶层 id:（换行+4空格）开始到下一个顶层 id: 之前
  const start = src.indexOf(`\n    id: '${id}',`)
  if (start < 0) { badCert.push(`${id}:block-not-found`); continue }
  const nextId = src.indexOf('\n    id: \'', start + 10)
  const block = src.slice(start, nextId > 0 ? nextId : undefined)
  for (const layer of CERT_LAYERS) {
    if (!block.includes(`${layer}:`)) badCert.push(`${id}:${layer}`)
  }
  if (!block.includes('total_band:')) badCert.push(`${id}:total_band`)
  // R_param 的 bound 要么含 ≡0，要么含测量/不确定度/输入残差
  const rpBound = block.match(/r_param:\s*\{[^}]*bound:\s*'([^']*)'/)
  if (rpBound && rpBound[1] && !rpBound[1].includes('≡0') &&
      !/测量|不确定度|输入残差/.test(rpBound[1])) {
    badCert.push(`${id}:r_param-bound`)
  }
}
if (badCert.length) fail(`certificate structural issues: ${badCert.join(', ')}`)
else if (certIds.length)
  console.log(`  certificate: all ${certIds.length} structured certificates have complete layers`)

// 工程交付物判据（方向四基础）：填了 engineering_deliverables 的题必须有非空数组。
// 只统计不阻断——渐进式推进。
const delivIds = [...hasDeliverables]
if (delivIds.length)
  console.log(`  engineering_deliverables: ${delivIds.length} problems have structured deliverables`)

// 溯源判据：proposer 或 via 至少其一。存量题只警告不阻断；新纳入的题
// （date_added 属于本轮清洗批次之后）缺失溯源则必须阻断。
const BATCH_ADDED = '2026-08-23'
const noTraceNew = ids.filter((id) => !hasTrace.has(id) && (dates.get(id) ?? '') >= BATCH_ADDED)
const noTraceLegacy = ids.filter((id) => !hasTrace.has(id) && (dates.get(id) ?? '') < BATCH_ADDED)
if (noTraceNew.length) fail(`new problems missing 'proposer'/'via' traceability: ${noTraceNew.join(', ')}`)
if (noTraceLegacy.length)
  console.log(`  WARNING: legacy problems missing proposer/via: ${noTraceLegacy.join(', ')}`)

if (exitCode === 0) console.log('check:problems OK')
process.exit(exitCode)