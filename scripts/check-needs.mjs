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
  const chain = []
  for (const m of block.matchAll(CHAIN_STEP_RE)) {
    chain.push({ id: m[1], kind: m[2], role: m[3] })
  }
  if (id) needs.push({ id, readiness, workflow, standard, consumable, barrier, chain })
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

const dup = needs.filter((n, i) => needs.findIndex((x) => x.id === n.id) !== i)
if (dup.length) failures.push(`duplicate need ids: ${dup.map((n) => n.id).join(', ')}`)

const dist = {}
for (const n of needs) dist[n.readiness] = (dist[n.readiness] ?? 0) + 1
const chainKinds = {}
for (const n of needs) for (const s of n.chain) chainKinds[s.kind] = (chainKinds[s.kind] ?? 0) + 1
const referencedProblems = new Set(needs.flatMap((n) => n.chain.filter((s) => s.kind === 'problem').map((s) => s.id)))
const referencedLaws = new Set(needs.flatMap((n) => n.chain.filter((s) => s.kind === 'law').map((s) => s.id)))
console.log(
  `engineering needs: ${needs.length} (${Object.entries(dist)
    .map(([k, v]) => `${k}=${v}`)
    .join(', ')})`,
)
console.log(
  `chain steps: ${chainKinds.problem ?? 0} problems + ${chainKinds.law ?? 0} laws; problems referenced: ${referencedProblems.size}, laws referenced: ${referencedLaws.size}`,
)

if (failures.length) {
  for (const f of failures) console.error(`FAIL: ${f}`)
  process.exit(1)
}
console.log('check:needs OK')
