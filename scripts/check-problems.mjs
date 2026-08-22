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
// related_problems entry shape is id → relation → note, so we read the id
// into curTo and push the edge when the relation line follows.
for (const line of src.split(/\r?\n/)) {
  const idMatch = line.match(/^    id: '([^']+)'/)
  if (idMatch) {
    cur = idMatch[1]
    continue
  }
  if (/^    judgment:/.test(line) && cur) judged.add(cur)
  const to = line.match(/^        id: '([^']+)',/)
  if (to) {
    curTo = to[1]
    continue
  }
  const rel = line.match(/^        relation: '([^']+)',/)
  if (rel && cur && curTo) {
    edges.push({ from: cur, to: curTo, relation: rel[1] })
    curTo = null
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

if (exitCode === 0) console.log('check:problems OK')
process.exit(exitCode)