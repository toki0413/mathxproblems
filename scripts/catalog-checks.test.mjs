// Failing-path tests for the catalog guard rails (three-layer residual,
// certificate structure, inheritance notes). Runs with `node --test scripts/`.
// The rules are shared with scripts/check-problems.mjs via the pure
// catalog-checks module, so a regression here means the same thing fails in CI.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { checkCatalog } from './lib/catalog-checks.mjs'

// Minimal but rule-valid problem block. Every field is required by some rule;
// a "clean" vb problem must satisfy them all so the test targets one axis only.
function vbProblem(id, judgment, certBlock = '') {
  const cert = certBlock ? `certificate: ${certBlock},\n    ` : ''
  return `
    id: '${id}',
    output: 'verified_behavior',
    judgment: '${judgment}',
    ${cert}impact_domains: ['d'],
    engineering_value: 'v',
    proposer: 'X',
    date_added: '2026-08-22',
    related_problems: [],
`
}

const OK_JUDGMENT =
  'R_model 模型残差；R_param 测量不确定度输入残差；R_num 数值残差。'
const CERT_OK = `{
  r_model: { bound: 'b', derivation: 'd' },
  r_param: { bound: '测量不确定度传播', derivation: 'd' },
  r_num: { bound: 'b', derivation: 'd' },
  total_band: 'T',
  certified_band: 'c',
}`

const failures = (src) => checkCatalog(src).failures
const warnings = (src) => checkCatalog(src).warnings

test('verified_behavior judgment carrying all three layers passes', () => {
  const src = `export const PROBLEMS = [ {${vbProblem('x-001', OK_JUDGMENT, CERT_OK)}} ]`
  assert.ok(!failures(src).some((f) => f.includes('missing residual layers')))
})

test('judgment missing a residual layer fails with the exact layer', () => {
  const src = `export const PROBLEMS = [ {${vbProblem('x-001', 'R_model 只有 R_model', CERT_OK)}} ]`
  const hit = failures(src).find((f) => f.includes('missing residual layers'))
  assert.ok(hit, 'should flag missing layers')
  assert.match(hit, /x-001:R_param/)
  assert.match(hit, /x-001:R_num/)
})

test('R_param declared without uncertainty content or ≡0 fails', () => {
  const src = `export const PROBLEMS = [ {${vbProblem('x-001', 'R_model m; R_param r; R_num n', CERT_OK)}} ]`
  assert.ok(failures(src).some((f) => f.includes('R_param declared without')))
})

test('R_param explicitly ≡0 passes the declaration rule', () => {
  const j = 'R_model m; R_param≡0（纯数学，参数精确给定）; R_num n'
  const src = `export const PROBLEMS = [ {${vbProblem('x-001', j, CERT_OK)}} ]`
  assert.ok(!failures(src).some((f) => f.includes('R_param declared without')))
})

test('complete certificate passes structural check', () => {
  const src = `export const PROBLEMS = [ {${vbProblem('x-001', OK_JUDGMENT, CERT_OK)}} ]`
  assert.ok(!failures(src).some((f) => f.includes('certificate structural')))
})

test('certificate missing r_num fails', () => {
  const bad = CERT_OK.replace('r_num: { bound: \'b\', derivation: \'d\' },', '')
  const src = `export const PROBLEMS = [ {${vbProblem('x-001', OK_JUDGMENT, bad)}} ]`
  assert.ok(failures(src).some((f) => f.includes('certificate structural') && f.includes('x-001:r_num')))
})

test('certificate r_param bound with neither ≡0 nor uncertainty fails', () => {
  const bad = CERT_OK.replace("bound: '测量不确定度传播'", "bound: '一个界'")
  const src = `export const PROBLEMS = [ {${vbProblem('x-001', OK_JUDGMENT, bad)}} ]`
  assert.ok(failures(src).some((f) => f.includes('certificate structural') && f.includes('x-001:r_param-bound')))
})

test('nil certificate block is not treated as a certificate', () => {
  const src = `export const PROBLEMS = [ {${vbProblem('x-001', OK_JUDGMENT, '')}} ]`
  assert.ok(!failures(src).some((f) => f.includes('certificate structural')))
})

test('depends_on edge without inheritance note warns', () => {
  const src = `export const PROBLEMS = [ {
    id: 'x-002',
    output: 'verified_behavior',
    judgment: '${OK_JUDGMENT}',
    impact_domains: ['d'],
    engineering_value: 'v',
    proposer: 'X',
    date_added: '2026-08-22',
    related_problems: [
      {
        id: 'x-001',
        relation: 'depends_on',
        note: 'merely shares a toolset',
      },
    ],
  }, {${vbProblem('x-001', OK_JUDGMENT, CERT_OK)}} ]`
  assert.ok(warnings(src).some((w) => w.includes('missing inheritance note')))
})

test('depends_on edge carrying inheritance marker stays quiet', () => {
  const src = `export const PROBLEMS = [ {
    id: 'x-002',
    output: 'verified_behavior',
    judgment: '${OK_JUDGMENT}',
    impact_domains: ['d'],
    engineering_value: 'v',
    proposer: 'X',
    date_added: '2026-08-22',
    related_problems: [
      {
        id: 'x-001',
        relation: 'depends_on',
        note: '总带继承：上游加固/击穿下游',
      },
    ],
  }, {${vbProblem('x-001', OK_JUDGMENT, CERT_OK)}} ]`
  assert.ok(!warnings(src).some((w) => w.includes('missing inheritance note')))
})