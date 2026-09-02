#!/usr/bin/env node
// Engineering-needs guard (C): every need must anchor to real catalog problems
// and real laws; readiness enum and need ids must be valid.
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

const needs = []
for (const block of needsSrc.split(/\n  \{\n    id: '/).slice(1)) {
  const id = (block.match(/^([^']+)'/) || [])[1]
  const readiness = (block.match(/readiness: '([^']+)'/) || [])[1]
  const probIds = [...block.matchAll(/\{ id: '((?:mp|mc|mb|me)-\d+)', role: '([a-z]+)' \}/g)].map((m) => m[1])
  const lawRefs = [...block.matchAll(/'((?:law-[a-z0-9-]+))'/g)].map((m) => m[1])
  if (id) needs.push({ id, readiness, probIds, lawRefs })
}

const failures = []

const badReadiness = needs.filter(
  (n) => n.readiness && !['served', 'partial', 'gap'].includes(n.readiness),
)
if (badReadiness.length) failures.push(`invalid readiness: ${badReadiness.map((n) => n.id).join(', ')}`)

const missingReadiness = needs.filter((n) => !n.readiness)
if (missingReadiness.length) failures.push(`need missing readiness: ${missingReadiness.map((n) => n.id).join(', ')}`)

const badProb = []
for (const n of needs) for (const p of n.probIds) if (!problemIds.has(p)) badProb.push(`${n.id}->${p}`)
if (badProb.length) failures.push(`need references unknown problem: ${badProb.join(', ')}`)

const badLaw = []
for (const n of needs) for (const l of n.lawRefs) if (!lawIds.has(l)) badLaw.push(`${n.id}->${l}`)
if (badLaw.length) failures.push(`need references unknown law: ${badLaw.join(', ')}`)

const dup = needs.filter((n, i) => needs.findIndex((x) => x.id === n.id) !== i)
if (dup.length) failures.push(`duplicate need ids: ${dup.map((n) => n.id).join(', ')}`)

const noProb = needs.filter((n) => n.probIds.length === 0)
if (noProb.length) failures.push(`need without supporting problem: ${noProb.map((n) => n.id).join(', ')}`)

const dist = {}
for (const n of needs) dist[n.readiness] = (dist[n.readiness] ?? 0) + 1
console.log(
  `engineering needs: ${needs.length} (${Object.entries(dist)
    .map(([k, v]) => `${k}=${v}`)
    .join(', ')})`,
)
console.log(`problems referenced: ${new Set(needs.flatMap((n) => n.probIds)).size}, laws referenced: ${new Set(needs.flatMap((n) => n.lawRefs)).size}`)

if (failures.length) {
  for (const f of failures) console.error(`FAIL: ${f}`)
  process.exit(1)
}
console.log('check:needs OK')
