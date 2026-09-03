#!/usr/bin/env node
// Engineering-needs guard (C, deepened): every chain step must anchor to a real
// catalog problem or a real law with the correct kind; problem roles and the law
// role must be valid; workflow/readiness enums and need ids must be valid; and
// the decision dossier (chain/standard/consumable/barrier) must be non-empty so
// no need is ever a hollow claim.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const problemsSrc = readFileSync(join(root, 'src/data/problems.ts'), 'utf8')
const lawsSrc = readFileSync(join(root, 'src/data/laws.ts'), 'utf8')
const needsSrc = readFileSync(join(root, 'src/data/engineeringNeeds.ts'), 'utf8')

const problemIds = new Set(
  [...problemsSrc.matchAll(/^    id: '([^']+)'/gm)].map((m) => m[1]),
)
const lawIds = new Set(
  [...lawsSrc.matchAll(/id: '(law-[a-z0-9-]+)'/g)].map((m) => m[1]),
)

// 解析顶层对象：problem id → { status, hasCert }；law id → status。复刻
// engineeringNeeds.ts 的 chainStepState 派生逻辑，做就绪度 ↔ 判定链一致性审计。
const problemMeta = new Map()
for (const block of problemsSrc.split("\n  {\n    id: '").slice(1)) {
  const id = (block.match(/^([^']+)'/) || [])[1]
  if (!id) continue
  const status = (block.match(/status: '([^']+)'/) || [])[1] ?? 'open'
  const hasCert = /\bcertificate:\s*\{/.test(block)
  const hasProofSteps = /proof_steps:\s*\[/.test(block)
  problemMeta.set(id, { status, hasCert, hasProofSteps })
}
const lawMeta = new Map()
for (const block of lawsSrc.split("id: 'law-").slice(1)) {
  const id = `law-${(block.match(/^([^']+)'/) || [])[1]}`
  if (!id || id === 'law-') continue
  const status = (block.match(/status: '([^']+)'/) || [])[1] ?? 'gap'
  lawMeta.set(id, status)
}
// 已审计展示的问题（audits.ts 中 status='passed'）。需求锚点必须落在可见问题上，
// 否则"这道需求靠一道看不见的题支撑"会是空话。
const auditsSrc = readFileSync(join(root, 'src/data/audits.ts'), 'utf8')
const auditedIds = new Set(
  [...auditsSrc.matchAll(/'((?:mp|mc|mb|me)-\d+)': \{ status: 'passed'/g)].map((m) => m[1]),
)

const READINESS = new Set(['served', 'partial', 'gap'])
const WORKFLOWS = new Set([
  'design-review',
  'safety-case',
  'alarm-setpoint',
  'validation',
  'screening',
  'deployment',
  'monitoring',
  'sign-off',
])
const PROBLEM_ROLES = new Set(['certificate', 'anchor', 'related'])
// 每条需求至少要有 1 个"可判定的锚点"：要么是问题，要么是定律。
const CHAIN_STEP_RE = /\{\s*id: '((?:mp|mc|mb|me)-\d+|law-[a-z0-9-]+)',\s*kind: '(problem|law)',\s*role: '([a-z-]+)'/g

const needs = []
for (const block of needsSrc.split("\n  {\n    id: '").slice(1)) {
  const id = (block.match(/^([^']+)'/) || [])[1]
  const readiness = (block.match(/readiness: '([^']+)'/) || [])[1]
  const workflow = (block.match(/workflow: '([^']+)'/) || [])[1]
  const standard = (block.match(/standard: '([^']*)'/) || [])[1]
  const consumable = (block.match(/consumable:\s*\n\s*'([^']*)'/) || [])[1]
  const barrier = (block.match(/barrier:\s*\n?\s*'([^']*)'/) || [])[1]
  // 结构化收题流水线：sourcing: [ { kind, target?, what, whatEn? } ]（容忍多行与 whatEn）。
  const sourcing = []
  const si = block.indexOf('sourcing:')
  if (si >= 0) {
    for (const m of block.slice(si).matchAll(/\{\s*kind: '([^']+)'(?:,\s*target: '([^']+)')?,\s*what: '([^']*)'/g)) {
      sourcing.push({ kind: m[1], target: m[2] ?? null, what: m[3] })
    }
  }
  const chain = []
  for (const m of block.matchAll(CHAIN_STEP_RE)) {
    chain.push({ id: m[1], kind: m[2], role: m[3] })
  }
  if (id) needs.push({ id, readiness, workflow, standard, consumable, barrier, sourcing, chain })
}

const failures = []

const badReadiness = needs.filter((n) => !READINESS.has(n.readiness))
if (badReadiness.length) failures.push(`invalid readiness: ${badReadiness.map((n) => n.id).join(', ')}`)

const badWorkflow = needs.filter((n) => !WORKFLOWS.has(n.workflow))
if (badWorkflow.length) failures.push(`invalid workflow: ${badWorkflow.map((n) => n.id).join(', ')}`)

const emptyChain = needs.filter((n) => n.chain.length === 0)
if (emptyChain.length) failures.push(`need without decision chain: ${emptyChain.map((n) => n.id).join(', ')}`)

const badStandard = needs.filter((n) => !n.standard)
if (badStandard.length) failures.push(`need missing standard: ${badStandard.map((n) => n.id).join(', ')}`)
const badConsumable = needs.filter((n) => !n.consumable)
if (badConsumable.length) failures.push(`need missing consumable: ${badConsumable.map((n) => n.id).join(', ')}`)
const badBarrier = needs.filter((n) => !n.barrier)
if (badBarrier.length) failures.push(`need missing barrier: ${badBarrier.map((n) => n.id).join(', ')}`)

// 缺口驱动收题（深化规则）：readiness='gap' 的需求必须给出至少一条收题建议，
// 否则缺口只是死文字——需求层无法驱动收题（从问题收录到解题层的引擎）。
const missingSourcing = needs.filter((n) => n.readiness === 'gap' && n.sourcing.length === 0)
if (missingSourcing.length) {
  failures.push(`gap need without sourcing (缺口必须给出收题建议): ${missingSourcing.map((n) => n.id).join(', ')}`)
}

// 收题流水线结构（CI 护栏）：kind 枚举合法；push 必须有真实目录目标；what 非空。
const badSrcKind = needs.flatMap((n) => n.sourcing.filter((s) => !['push', 'new'].includes(s.kind)).map((s) => `${n.id}:${s.kind}`))
if (badSrcKind.length) failures.push(`invalid sourcing kind: ${badSrcKind.join(', ')}`)
const badPushTarget = needs.flatMap((n) =>
  n.sourcing.filter((s) => s.kind === 'push' && (!s.target || !problemIds.has(s.target))).map((s) => `${n.id}->${s.target ?? '(none)'}`),
)
if (badPushTarget.length) failures.push(`push sourcing must target a real catalog problem: ${badPushTarget.join(', ')}`)
const badWhat = needs.flatMap((n) => n.sourcing.filter((s) => !s.what).map((s) => `${n.id}`))
if (badWhat.length) failures.push(`sourcing item without what: ${[...new Set(badWhat)].join(', ')}`)

// chain 步骤：kind 与 id 所在注册表必须匹配；problem 角色枚举合法；law 必须用 role='law'。
const badKind = []
const badRole = []
for (const n of needs) {
  for (const s of n.chain) {
    if (s.kind === 'problem' && !problemIds.has(s.id)) badKind.push(`${n.id}->${s.id} (kind=problem, not in catalog)`)
    if (s.kind === 'law' && !lawIds.has(s.id)) badKind.push(`${n.id}->${s.id} (kind=law, not in laws.ts)`)
    if (s.kind === 'problem' && !PROBLEM_ROLES.has(s.role)) badRole.push(`${n.id}->${s.id} (role=${s.role})`)
    if (s.kind === 'law' && s.role !== 'law') badRole.push(`${n.id}->${s.id} (law step must use role='law')`)
  }
}
if (badKind.length) failures.push(`chain references unknown id: ${badKind.join(', ')}`)
if (badRole.length) failures.push(`chain invalid role: ${badRole.join(', ')}`)

// ── 就绪度 ↔ 判定链一致性（诚实规则，深化）──
// 从判定链派生"派生就绪度" derived：任一 certificate 角色链步可消费 → served；
// 任一链步有进展（served/partial）→ partial；否则 gap。
// 声明的 readiness 不得比 derived 更乐观（served > partial > gap > open），
// 可以更保守，但不能把 gap 说成 served。
const RANK = { served: 3, partial: 2, gap: 1, open: 0 }
function chainStepState(step) {
  if (step.kind === 'law') {
    const l = lawMeta.get(step.id)
    if (l === 'formalized') return 'served'
    if (l === 'partial') return 'partial'
    return 'open'
  }
  const p = problemMeta.get(step.id)
  if (!p) return 'open'
  if (step.role === 'certificate' && p.hasCert) return 'served'
  // L3 解题层：已有真实证明台阶（非 sorry）→ 部分进展（与 engineeringNeeds.ts 的 chainStepState 零漂移）。
  if (p.hasProofSteps) return 'partial'
  if (p.status === 'partial') return 'partial'
  return 'open'
}
const overstate = []
const nonAudited = []
const derivedDist = { served: 0, partial: 0, gap: 0 }
for (const n of needs) {
  const states = n.chain.map((s) => ({ id: s.id, state: chainStepState(s) }))
  const best = Math.max(...states.map((x) => RANK[x.state]))
  const derived = best >= 3 ? 'served' : best === 2 ? 'partial' : 'gap'
  derivedDist[derived]++
  if (RANK[n.readiness] > RANK[derived]) {
    overstate.push(`${n.id} (declared ${n.readiness}, derived ${derived}; steps: ${states.map((x) => `${x.id}=${x.state}`).join(', ')})`)
  }
  for (const s of n.chain) {
    if (s.kind === 'problem' && !auditedIds.has(s.id)) nonAudited.push(`${n.id}->${s.id}`)
  }
}
if (overstate.length) {
  failures.push(`readiness overstates derived chain state (fix data, not the rule): ${overstate.join(' | ')}`)
}
if (nonAudited.length) {
  failures.push(`chain anchors a non-audited (hidden) problem: ${nonAudited.join(', ')}`)
}

const dup = needs.filter((n, i) => needs.findIndex((x) => x.id === n.id) !== i)
if (dup.length) failures.push(`duplicate need ids: ${dup.map((n) => n.id).join(', ')}`)

const dist = {}
for (const n of needs) dist[n.readiness] = (dist[n.readiness] ?? 0) + 1
const chainKinds = {}
for (const n of needs) for (const s of n.chain) chainKinds[s.kind] = (chainKinds[s.kind] ?? 0) + 1
const referencedProblems = new Set(needs.flatMap((n) => n.chain.filter((s) => s.kind === 'problem').map((s) => s.id)))
const referencedLaws = new Set(needs.flatMap((n) => n.chain.filter((s) => s.kind === 'law').map((s) => s.id)))
const sourcedNeeds = needs.filter((n) => n.sourcing.length).length
const allItems = needs.flatMap((n) => n.sourcing)
const pipelinePush = allItems.filter((s) => s.kind === 'push').length
const pipelineNew = allItems.filter((s) => s.kind === 'new').length
console.log(
  `engineering needs: ${needs.length} (${Object.entries(dist)
    .map(([k, v]) => `${k}=${v}`)
    .join(', ')})`,
)
console.log(`sourced needs: ${sourcedNeeds}/${needs.length}; 收题流水线 ${allItems.length} 条（push 推进 ${pipelinePush} / new 候选题 ${pipelineNew}）`)
console.log(
  `chain-derived readiness: (${Object.entries(derivedDist)
    .map(([k, v]) => `${k}=${v}`)
    .join(', ')}) — declared never overstates derived`,
)
console.log(
  `chain steps: ${chainKinds.problem ?? 0} problems + ${chainKinds.law ?? 0} laws; problems referenced: ${referencedProblems.size}, laws referenced: ${referencedLaws.size}`,
)

if (failures.length) {
  for (const f of failures) console.error(`FAIL: ${f}`)
  process.exit(1)
}
console.log('check:needs OK')
