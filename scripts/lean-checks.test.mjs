// Unit tests for the "proven module" anti-cheat screening (Task 2).
// Runs with `node --test scripts/lean-checks.test.mjs`. The screening is shared
// with check-lean.mjs, so a regression here means the same thing fails in CI.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { screenProvenModule, stripLeanNoise } from './lib/lean-checks.mjs'

test('clean proven module has no cheat tokens', () => {
  const src = `theorem massPreserved (h : P) : Q := by
  intro x
  exact h`
  assert.deepEqual(screenProvenModule(src), [])
})

test('by sorry is caught', () => {
  assert.deepEqual(screenProvenModule('theorem t : True := by sorry'), ['sorry'])
})

test('axiom declaration is caught', () => {
  assert.deepEqual(screenProvenModule('axiom magic : False'), ['axiom'])
})

test('admit and unsafe are caught', () => {
  assert.deepEqual(screenProvenModule('unsafe def f := 0\ntheorem t : True := by admit'), ['unsafe', 'admit'])
})

test('docstring mentioning sorry/axiom does not false-positive', () => {
  const src = `/-- This lemma must not rely on sorry or any axiom. -/
theorem t : True := by trivial`
  assert.deepEqual(screenProvenModule(src), [])
})

test('line comment mentioning unsafe is ignored', () => {
  const src = `-- never use unsafe here
theorem t : True := by trivial`
  assert.deepEqual(screenProvenModule(src), [])
})

test('prose string mentioning admit/sorry is not a cheat token', () => {
  const src = `structure Record :=
  implication := "The classification may not admit a smooth combinatorial criterion; the exact condition relies on no sorry."`
  assert.deepEqual(screenProvenModule(src), [])
})

test('stripLeanNoise removes block and line comments and string literals', () => {
  const out = stripLeanNoise('a /- b -/ c -- d\ne "f g admit" h')
  assert.equal(out.includes('b'), false)
  assert.equal(out.includes('d'), false)
  assert.equal(out.includes('admit'), false) // 字符串内单词被剥
  assert.equal(out.includes('a'), true)
  assert.equal(out.includes('c'), true)
  assert.equal(out.includes('e'), true)
  assert.equal(out.includes('h'), true)
})

test('regression: current SHARED-MODULE files are clean', () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'lean')
  for (const f of ['CertifiedBand.lean', 'SolutionSteps.lean', 'FailureRecord.lean']) {
    const src = readFileSync(join(root, f), 'utf8')
    assert.equal(src.includes('SHARED-MODULE'), true, `${f} should be a shared module`)
    assert.deepEqual(screenProvenModule(src), [], `${f} must not contain axiom/sorry/admit/unsafe`)
  }
})
