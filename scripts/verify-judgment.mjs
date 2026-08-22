#!/usr/bin/env node
// Formalization skeleton for the judgment field.
// Anchors on the analytical + high-formalization-potential subset and, for
// each problem in it, classifies the judgment text into a certificate shape:
//   proof       — an accepted solution is a rigorous proof certificate
//   numeric     — an accepted solution is a certified numerical criterion
//   case        — a counterexample / case construction is an acceptable form
// and flags any judgment whose text arguably lacks the required certificate.
//
// The classification is a first-pass read of natural language, not a proof
// checker. It exists to (1) make the eligible subset legible, (2) catch
// judgment fields that read like trivia rather than a certificate, and
// (3) give a stable anchor for future tooling (a real checker, or a patch
// that emits Lean/Coq stubs). Run with `node scripts/verify-judgment.mjs`.
//
// ponytail: regex parsing of the TS source (no node_modules here, see
// check-problems.mjs). Only the 4-space `key:` lines we need are matched.
// Swap this for a real import once CI has deps/tsc.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const src = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '../src/data/problems.ts'),
  'utf8',
)

// Slice each problem object so a judgment stays scoped inside its own block.
const objects = []
{
  const start = src.indexOf('export const PROBLEMS')
  const end = src.indexOf('export const DOMAINS')
  const body = src.slice(start, end)
  let lastAt = -1
  let depth = 0
  for (let i = 0; i < body.length; i++) {
    const c = body[i]
    if (c === '{') depth++
    if (c === '}') {
      depth--
      if (depth === 0) {
        objects.push(body.slice(lastAt + 1, i + 1))
        lastAt = i + 1
      }
    }
  }
}

function field(obj, key) {
  // simplest pass: just search the object for `key: value`, first occurrence
  const re = new RegExp(`^\\s{2,4}${key}: (.*)$`, 'm')
  const m = obj.match(re)
  return m ? m[1] : null
}

// Normalize a captured value: strip surrounding quotes/backticks and a
// trailing comma so comparisons and classification see the raw content.
function clean(s) {
  if (s == null) return s
  let v = s.trim()
  if (v.endsWith(',')) v = v.slice(0, -1).trim()
  if (v.startsWith('`') && v.endsWith('`')) v = v.slice(1, -1)
  else if (v.startsWith("'") && v.endsWith("'")) v = v.slice(1, -1)
  return v
}

// certificate keyword classifier, deliberately coarse on purpose
const CERTS = [
  { shape: 'proof', re: /\bproof\b|prove|proves|certificate|certifies|rigorous\b/i },
  { shape: 'numeric', re: /numeric|interval|bound\b|estimate|error bound|compute/i },
  { shape: 'case', re: /counterexample|counter-example|obstruction|no-go|construction/i },
]

let exitCode = 0
const fail = (msg) => {
  console.log('  FAIL ' + msg)
  exitCode = 1
}

let eligible = 0
let classified = 0
const missingJudgment = []
const missingCertificate = []

for (const obj of objects) {
  const id = clean(field(obj, 'id'))
  if (!id) continue
  const fp = clean(field(obj, 'formalization_potential'))
  const vp = clean(field(obj, 'verification_path'))
  if (vp !== 'analytical' || fp !== 'high') continue
  eligible++

  const raw = field(obj, 'judgment')
  if (!raw) {
    missingJudgment.push(id)
    continue
  }
  const text = clean(raw)
  const shapes = CERTS.filter((c) => c.re.test(text)).map((c) => c.shape)
  // require at least one recognized certificate verb; otherwise the judgment
  // reads more like trivia ("an answer settles the status") than a certificate
  if (shapes.length === 0) missingCertificate.push(id)
  classified++
  console.log(`  ${id}  [${shapes.join('/') || '??'}]  ${text.slice(0, 72).replace(/\s+/g, ' ')}…`)
}

console.log(`\nanalytical+high eligible: ${eligible}`)
if (missingJudgment.length) {
  fail(`missing judgment: ${missingJudgment.join(', ')}`)
} else {
  console.log(`  judgment present: ${classified}/${eligible}`)
}
if (missingCertificate.length) {
  console.log(`  (notice) unclassified certificate shape: ${missingCertificate.join(', ')}`)
}
if (exitCode === 0) console.log('verify:judgment OK')
else console.log('verify:judgment had failures (see above)')
process.exit(exitCode)