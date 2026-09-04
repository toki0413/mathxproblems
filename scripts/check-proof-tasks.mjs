#!/usr/bin/env node
// Invariant checks for the Vero-style proof-only task export (proof-tasks.json).
// Mirrors the runtime derivation in api/proof-tasks.json.ts: selects problems
// with formalization_potential='high' AND a lean_statement (L0 anchor), and
// asserts the task list is non-trivial, unique and fully judged.
// Run with `node scripts/check-proof-tasks.mjs`.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { parseCatalog, deriveProofTasks } from './lib/catalog-checks.mjs'

const src = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '../src/data/problems.ts'),
  'utf8',
)

const { notes, failures, warnings } = deriveProofTasks(parseCatalog(src))

for (const line of notes) console.log('  ' + line)
for (const line of warnings) console.log('  WARNING ' + line)
for (const line of failures) console.log('  FAIL ' + line)

if (failures.length === 0) console.log('check:proof-tasks OK')
process.exit(failures.length === 0 ? 0 : 1)
