#!/usr/bin/env node
// Invariant checks over the problem catalog (problems.ts).
// Validates unique ids, no dangling relation edges, tag spelling, the
// three-layer residual contract, structured certificates and inheritance
// notes. Run with `node scripts/check-problems.mjs`.
//
// The parsing + all rules live in scripts/lib/catalog-checks.mjs (pure), so the
// same logic is unit-tested by scripts/catalog-checks.test.mjs. This file is a
// thin CLI wrapper: read the source, run the checks, report.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { checkCatalog } from './lib/catalog-checks.mjs'

const src = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '../src/data/problems.ts'),
  'utf8',
)

const { notes, failures, warnings } = checkCatalog(src)

for (const line of notes) console.log('  ' + line)
for (const line of warnings) console.log('  WARNING ' + line)
for (const line of failures) console.log('  FAIL ' + line)

if (failures.length === 0) console.log('check:problems OK')
process.exit(failures.length === 0 ? 0 : 1)