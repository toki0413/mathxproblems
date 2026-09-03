// Failing-path tests for the catalog guard rails (three-layer residual,
// certificate structure, inheritance notes). Runs with `node --test scripts/`.
// The rules are shared with scripts/check-problems.mjs via the pure
// catalog-checks module, so a regression here means the same thing fails in CI.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { checkCatalog } from './lib/catalog-checks.mjs'
import { verifyCertificate, checkInformation, checkRParamClause } from '../contracts/verifier.ts'

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

// A minimal verified_truth block (no certificate needed) for the boilerplate gate.
function truthProblem(id, judgment, added) {
  return `
    id: '${id}',
    output: 'verified_truth',
    judgment: '${judgment}',
    impact_domains: ['d'],
    proposer: 'X',
    date_added: '${added}',
    related_problems: [],
`
}

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

test('new problem starting with the template skeleton is gated out', () => {
  const src = `export const PROBLEMS = [ {${truthProblem('x-010', 'A pass proves the claim rigorously.', '2026-08-28')}} ]`
  assert.ok(failures(src).some((f) => f.includes('independent judgment skeleton')))
})

test('legacy template-skeleton judgement predating the gate stays allowed', () => {
  const src = `export const PROBLEMS = [ {${truthProblem('x-011', 'A pass proves the claim rigorously.', '2026-08-20')}} ]`
  assert.ok(!failures(src).some((f) => f.includes('independent judgment skeleton')))
})

test('new problem with an independent judgement skeleton passes the gate', () => {
  const src = `export const PROBLEMS = [ {${truthProblem('x-012', 'Prove the mixing rate is Θ(n^{-1/2}) and give matching constants.', '2026-08-28')}} ]`
  assert.ok(!failures(src).some((f) => f.includes('independent judgment skeleton')))
})

test('invalid lifecycle_status value fails', () => {
  const src = `export const PROBLEMS = [ {
    id: 'x-003',
    output: 'verified_truth',
    judgment: 'A pass proves the claim.',
    lifecycle_status: 'bogus',
    impact_domains: ['d'],
    proposer: 'X',
    date_added: '2026-08-22',
    related_problems: [],
} ]`
  assert.ok(failures(src).some((f) => f.includes('invalid lifecycle_status')))
})

test('formal_view/bridge enum validity is gated', () => {
  const src = [
    "    id: 'x1',",
    "    output: 'verified_behavior',",
    '    formal_view: {',
    "      status: 'provable',",
    "      judgment: 'proof certificate',",
    '    },',
    '    bridge: {',
    "      direction: 'mutual_boundary',",
    "      link: 'symbiotic boundary',",
    '    },',
    "    id: 'x2',",
    "    output: 'verified_behavior',",
    '    formal_view: {',
    "      status: 'bogus',",
    "      judgment: 'counterexample',",
    '    },',
    '    bridge: {',
    "      direction: 'sideways',",
    '    },',
  ].join('\n')
  const f = checkCatalog(src).failures.filter((x) => x.includes('formal_view') || x.includes('bridge'))
  assert.ok(f.some((x) => x.includes('invalid formal_view.status: x2=bogus')))
  assert.ok(f.some((x) => x.includes('invalid bridge.direction: x2=sideways')))
  assert.ok(!f.some((x) => x.includes('formal_view missing')))
})

test('bridge shared_residuals must reference known certificate layers', () => {
  const src = [
    "    id: 'x1',",
    "    output: 'verified_behavior',",
    '    formal_view: {',
    "      status: 'conjectured',",
    "      judgment: 'cert',",
    '    },',
    '    bridge: {',
    "      direction: 'formal_idealizes_banded',",
    "      shared_residuals: ['r_model', 'bogus_layer'],",
    '    },',
  ].join('\n')
  assert.ok(failures(src).some((f) => f.includes('invalid bridge.shared_residuals')))
})

test('formal status refuted without lifecycle closing is flagged', () => {
  const src = [
    "    id: 'x1',",
    "    output: 'verified_truth',",
    "    judgment: 'cert',",
    '    formal_view: {',
    "      status: 'refuted',",
    "      judgment: 'counterexample',",
    '    },',
    "    lifecycle_status: 'open',",
  ].join('\n')
  assert.ok(failures(src).some((f) => f.includes('status=refuted requires lifecycle_status')))
})

test('formal_view judgment check is block-scoped, not a global includes', () => {
  // x1 有 formal_view 却无 judgment;x2 有 judgment。全局 includes 会因 x2 而漏判 x1。
  const src = [
    "    id: 'x1',",
    "    output: 'verified_truth',",
    "    judgment: 'top-level',",
    '    formal_view: {',
    "      status: 'conjectured',",
    '    },',
    "    id: 'x2',",
    "    output: 'verified_truth',",
    "    judgment: 'top-level',",
    '    formal_view: {',
    "      status: 'conjectured',",
    "      judgment: 'present',",
    '    },',
  ].join('\n')
  assert.ok(failures(src).some((f) => f.includes("formal_view missing 'judgment'") && f.includes('x1')))
})

// ── 参考核验器（契约 v0.1）──
const GOOD_CERT = {
  r_model: { bound: 'Boussinesq 近似的显式残差界' },
  r_param: { bound: '≡0（参数精确给定）' },
  r_num: { bound: '区间算术封闭界' },
  total_band: 'X_hi - X_lo ≤ R_model + R_param + R_num',
  certified_band: '[1.52, 1.56]',
}

test('verifier: a machine-readable, non-vacuous certificate passes', () => {
  const v = verifyCertificate(GOOD_CERT)
  assert.equal(v.pass, true)
  assert.deepEqual(Object.values(v.checks), ['pass', 'pass', 'pass', 'pass'])
  assert.ok(v.relative_width !== null && v.relative_width < 0.2)
})

test('verifier: r_param without ≡0 or uncertainty fails the clause', () => {
  const v = verifyCertificate({ ...GOOD_CERT, r_param: { bound: '一个界' } })
  assert.equal(v.checks.r_param_clause, 'fail')
  assert.equal(v.pass, false)
})

test('verifier: vacuous band (relative width > 1) fails', () => {
  const v = verifyCertificate({ ...GOOD_CERT, certified_band: '[0, 100]' })
  assert.equal(v.checks.band_nonvacuous, 'fail')
  assert.equal(v.pass, false)
  assert.equal(v.relative_width, 2)
})

test('verifier: descriptive certified_band is reported as needs_form, not a pass', () => {
  const v = verifyCertificate({ ...GOOD_CERT, certified_band: '候选核谱隙确认区间' })
  assert.equal(v.checks.band_form, 'needs_form')
  assert.equal(v.pass, true) // needs_form 不算失败，但如实报告
  assert.ok(v.reasons.some((r) => r.includes('machine form')))
})

test('verifier is deterministic: same input, same verdict', () => {
  const a = verifyCertificate(GOOD_CERT)
  const b = verifyCertificate(GOOD_CERT)
  assert.deepEqual(a, b)
})

test('verifier: missing certificate is a hard fail', () => {
  const v = verifyCertificate(undefined)
  assert.equal(v.pass, false)
  assert.ok(v.reasons.includes('certificate missing'))
})

test('checkInformation: crossing-zero band defers the vacuous gate', () => {
  const info = checkInformation('[-1, 1]')
  assert.equal(info.relative_width, null)
  assert.equal(info.within_vacuous, true)
})

// ── 双实现交叉核验（verifier.ts ↔ lean/CertifiedBand.lean）──
// 同一判定标准在两个独立实现里成立：这里用与 Lean 参考核验器相同的样例复核。
test('verifier cross-check: Lieb–Oxford current bracket [1.44, 1.58] matches the Lean CertifiedBand reference', () => {
  const v = verifyCertificate({ ...GOOD_CERT, certified_band: '[1.44, 1.58]' })
  assert.equal(v.pass, true)
  const info = checkInformation('[1.44, 1.58]')
  assert.equal(info.within_vacuous, true)
  assert.equal(info.within_info_gate, true)
  // Lean 侧 relWidth = 14/151 ≈ 0.0927；两侧必须一致。
  assert.ok(info.relative_width !== null && Math.abs(info.relative_width - 14 / 151) < 1e-9)
})

test('verifier cross-check: catalog r_param clauses match the Lean rParamClauseOk reference', () => {
  // mc-017 / mc-024：≡0 条款。
  assert.equal(
    checkRParamClause({ bound: '≡0 (purely mathematical structure; no input measurement residual layer)' }),
    'pass',
  )
  // mp-037：测量不确定度条款。
  assert.equal(
    checkRParamClause({
      bound: 'Input residual from the propagation of heat-load and ambient temperature/flow-speed measurement uncertainty to the Nu upper bound',
    }),
    'pass',
  )
})

// ── 诚实标签（provenance）──
// provLine/leanLine 自带 4 空格缩进（与解析器要求的列宽一致），
// 因此放在模板第 0 列，避免模板自身空格造成 8 空格双重缩进而解析不到。
function provProblem(id, provLine = '', leanLine = '') {
  const prov = provLine ? `${provLine}\n` : ''
  const lean = leanLine ? `${leanLine}\n` : ''
  return `export const PROBLEMS = [ {
    id: '${id}',
    output: 'verified_truth',
    judgment: 'A pass proves the claim.',
${prov}${lean}    impact_domains: ['d'],
    proposer: 'X',
    date_added: '2026-08-22',
    related_problems: [],
} ]`
}

test('expert-reviewed without a review record is rejected', () => {
  const src = provProblem('x-020', "    provenance: 'expert-reviewed',")
  assert.ok(failures(src).some((f) => f.includes('provenance upgrade lacks recorded evidence') && f.includes('x-020')))
})

test('lean-compilable without a lean_statement is rejected', () => {
  const src = provProblem('x-021', "    provenance: 'lean-compilable',")
  assert.ok(failures(src).some((f) => f.includes('provenance upgrade lacks recorded evidence') && f.includes('x-021')))
})

test('lean-compilable with a lean_statement is allowed', () => {
  const src = provProblem('x-022', "    provenance: 'lean-compilable',", "    lean_statement: 'theorem t : True := by trivial',")
  assert.ok(!failures(src).some((f) => f.includes('provenance upgrade lacks recorded evidence')))
  assert.ok(!failures(src).some((f) => f.includes('invalid provenance')))
})

test('invalid provenance value fails', () => {
  const src = provProblem('x-023', "    provenance: 'self-verified',")
  assert.ok(failures(src).some((f) => f.includes('invalid provenance')))
})

test('lean_statement present but still AI-drafted warns (honest default)', () => {
  const src = provProblem('x-024', '', "    lean_statement: 'theorem t : True := by trivial',")
  assert.ok(warnings(src).some((w) => w.includes('lean_statement present but provenance not')))
})

test('default (no provenance field) counts as AI-drafted', () => {
  const src = provProblem('x-025', '', '')
  const note = checkCatalog(src).notes.find((n) => n.startsWith('provenance:'))
  assert.ok(note.includes('AI-drafted=1'))
})

// ── 三层质量分层（扩库基础设施）──
function tierProblem(id, tierLine = '', provLine = '', leanLine = '') {
  const tier = tierLine ? `${tierLine}\n` : ''
  const prov = provLine ? `${provLine}\n` : ''
  const lean = leanLine ? `${leanLine}\n` : ''
  return `export const PROBLEMS = [ {
    id: '${id}',
    output: 'verified_truth',
    judgment: 'A pass proves the claim.',
${tier}${prov}${lean}    impact_domains: ['d'],
    proposer: 'X',
    date_added: '2026-08-22',
    related_problems: [],
} ]`
}

test('invalid tier value fails', () => {
  const src = tierProblem('x-030', "    tier: 'gold',")
  assert.ok(failures(src).some((f) => f.includes('invalid tier')))
})

test('candidate tier claiming expert review is rejected', () => {
  const src = tierProblem('x-031', "    tier: 'candidate',", "    provenance: 'expert-reviewed',")
  assert.ok(failures(src).some((f) => f.includes('candidate-tier problems must stay AI-drafted') && f.includes('x-031')))
})

test('candidate tier carrying lean_statement is rejected', () => {
  const src = tierProblem('x-032', "    tier: 'candidate',", '', "    lean_statement: 'theorem t : True := by trivial',")
  assert.ok(failures(src).some((f) => f.includes('candidate-tier problems cannot carry lean_statement') && f.includes('x-032')))
})

test('candidate tier AI-drafted without lean stays quiet', () => {
  const src = tierProblem('x-033', "    tier: 'candidate',")
  assert.ok(!failures(src).some((f) => f.includes('candidate-tier')))
})

test('default (no tier field) counts as core in the distribution note', () => {
  const src = tierProblem('x-034', '')
  const note = checkCatalog(src).notes.find((n) => n.startsWith('tier:'))
  assert.ok(note.includes('core=1'))
})

// ── 开放声明引文（文献即专家 / 升级证据门）──
function claimProblem(id, tierLine, claimLines = '') {
  const claim = claimLines ? `${claimLines}\n` : ''
  return `export const PROBLEMS = [ {
    id: '${id}',
    output: 'verified_truth',
    judgment: 'A pass proves the claim.',
${tierLine}    impact_domains: ['d'],
    proposer: 'X',
    date_added: '2026-08-22',
    related_problems: [],
${claim}} ]`
}

test('vetted tier without open_claim fails the evidence gate', () => {
  const src = claimProblem('x-040', "    tier: 'vetted',\n")
  assert.ok(failures(src).some((f) => f.includes('vetted-tier problems require an open_claim') && f.includes('x-040')))
})

test('vetted tier with a complete open_claim passes', () => {
  const claim = `    open_claim: {
      quote: 'the question remains unresolved',
      source: 'https://arxiv.org/abs/0000.00000',
    },`
  const src = claimProblem('x-041', "    tier: 'vetted',\n", claim)
  assert.ok(!failures(src).some((f) => f.includes('open_claim')))
})

test('open_claim missing quote or source fails the structure check', () => {
  const partial = `    open_claim: {
      quote: 'only a quote',
    },`
  const src = claimProblem('x-042', "    tier: 'vetted',\n", partial)
  assert.ok(failures(src).some((f) => f.includes('open_claim must carry both') && f.includes('x-042')))
})