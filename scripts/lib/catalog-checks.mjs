// Pure catalog validation, extracted from scripts/check-problems.mjs so that
// the guard rails (three-layer residual, certificate structure, inheritance
// notes) can be unit-tested without spawning the CLI. check-problems.mjs calls
// checkCatalog() and prints the result; tests feed it synthetic snippets.

// 参考核验器（契约 v0.1）：Node 24 以 type-stripping 直接运行 contracts/*.ts，
// 让结构守卫与共享核验器共用同一实现，而不是各写一套正则。
import { verifyCertificate } from "../../contracts/verifier.ts";

export const RELATIONS = new Set(['depends_on', 'implies', 'shares_tools', 'generalizes', 'analog_of'])
export const OUTPUT_KINDS = new Set(['verified_behavior', 'verified_truth', 'scaffolding'])
export const LIFECYCLE_KINDS = new Set(['open', 'tightened', 'refuted', 'superseded'])
export const FORMAL_STATUSES = new Set(['provable', 'conjectured', 'refuted'])
export const BRIDGE_DIRECTIONS = new Set(['formal_idealizes_banded', 'banded_instantiates_formal', 'mutual_boundary'])
export const BATCH_ADDED = '2026-08-23'
export const CERT_LAYERS = ['r_model', 'r_param', 'r_num']
export const INHERITANCE_MARKERS = ['总带继承', 'inheritance']
// 试点数据契约：tool_links 只能引用注册表工具，failure_records 用固定类型学枚举。
export const TOOL_IDS = new Set([
  'spectral-operator',
  'measure-ergodic',
  'analysis-asymptotics',
  'topology',
  'lattice-order',
  'convex-optimization',
  'interval-numerics',
  'combinatorics-graph',
  'polynomial-real',
  'stochastic-processes',
  'dynamical-systems',
  'algebra',
])
export const MECHANISMS = new Set(['combinatorial', 'missing_bound', 'nonconvex', 'unbounded_residual', 'parameter_sensitive'])
export const FAILURE_LAYERS = new Set(['model', 'param', 'num', 'formal'])
export const TOOL_ROLES = new Set(['available', 'partial', 'missing'])
// 真实性收敛门槛：date_added 不早于该日期的新问题，judgment 不得再以统一的
// 'A pass ' / '合格答案为' 骨架开头（存量 101 道模板腔是既有事实，靠人后续收敛，
// 不在门内）。目的是从根上杜绝用同一模板批量生产新题。
export const VERACITY_GATE = '2026-08-26'
export const JUDGMENT_TEMPLATE_RE = /^(A pass |合格答案为)/

// Parse the TS source with regex (no TS runtime available). Kept stable:
// 4-space id indent, one relation per line, judgment/note may span lines.
export function parseCatalog(src) {
  const ids = [...src.matchAll(/^    id: '([^']+)'/gm)].map((m) => m[1])
  let cur = null
  let curTo = null
  const edges = []
  const judged = new Set()
  const judgments = new Map()
  const outputs = new Map()
  const hasEngValue = new Set()
  const hasImpact = new Set()
  const hasTrace = new Set()
  const dates = new Map()
  const hasCertificate = new Set()
  const hasDeliverables = new Set()
  const lifecycleStatuses = new Map() // id -> lifecycle_status 值
  const formalViews = new Set()
  const formalStatuses = new Map() // id -> formal_view.status 值
  const formalJudgments = new Set() // id 含 formal_view.judgment(6 空格缩进,与顶层 4 空格不冲突)
  const bridges = new Set()
  const bridgeDirections = new Map() // id -> bridge.direction 值
  const bridgeResiduals = new Map() // id -> bridge.shared_residuals 数组
  let pendingJudgment = false
  let pendingNote = false
  for (const line of src.split(/\r?\n/)) {
    const idMatch = line.match(/^    id: '([^']+)'/)
    if (idMatch) {
      cur = idMatch[1]
      continue
    }
    if (/^    judgment:/.test(line) && cur) {
      judged.add(cur)
      const inline = line.match(/^    judgment:\s*'((?:[^'\\]|\\.)*)'/)
      if (inline) {
        judgments.set(cur, inline[1])
        pendingJudgment = false
      } else {
        pendingJudgment = true
      }
    } else if (pendingJudgment && cur) {
      const nextLine = line.match(/^\s*'((?:[^'\\]|\\.)*)'/)
      if (nextLine) judgments.set(cur, nextLine[1])
      pendingJudgment = false
    }
    const outMatch = line.match(/^    output: '([^']+)',/)
    if (outMatch && cur) outputs.set(cur, outMatch[1])
    if (/^    engineering_value:/.test(line) && cur) hasEngValue.add(cur)
    if (/^    impact_domains:/.test(line) && cur) hasImpact.add(cur)
    if (/^    certificate:/.test(line) && cur) hasCertificate.add(cur)
    if (/^    engineering_deliverables:/.test(line) && cur) hasDeliverables.add(cur)
    const lcMatch = line.match(/^    lifecycle_status: '([^']+)',/)
    if (lcMatch && cur) lifecycleStatuses.set(cur, lcMatch[1])
    const fv = line.match(/^    formal_view: \{/)
    if (fv && cur) formalViews.add(cur)
    const fvStatus = line.match(/^      status: '([^']+)',/)
    if (fvStatus && cur) formalStatuses.set(cur, fvStatus[1])
    if (/^      judgment:/.test(line) && cur) formalJudgments.add(cur)
    const br = line.match(/^    bridge: \{/)
    if (br && cur) bridges.add(cur)
    const brDir = line.match(/^      direction: '([^']+)',/)
    if (brDir && cur) bridgeDirections.set(cur, brDir[1])
    const sr = line.match(/^      shared_residuals: \[([^\]]*)\]/)
    if (sr && cur) bridgeResiduals.set(cur, [...sr[1].matchAll(/'([^']+)'/g)].map((m) => m[1]))
    if (/^    (proposer|via):/.test(line) && cur) hasTrace.add(cur)
    const dMatch = line.match(/^    date_added: '([^']+)'/)
    if (dMatch && cur) dates.set(cur, dMatch[1])
    const to = line.match(/^        id: '([^']+)',/)
    if (to) {
      curTo = to[1]
      continue
    }
    const rel = line.match(/^        relation: '([^']+)',/)
    if (rel && cur && curTo) {
      edges.push({ from: cur, to: curTo, relation: rel[1], note: '' })
      curTo = null
      pendingNote = true
      continue
    }
    if (pendingNote && edges.length > 0) {
      const noteMatch = line.match(/^        note: '((?:[^'\\]|\\.)*)'/)
      if (noteMatch) edges[edges.length - 1].note = noteMatch[1]
      pendingNote = false
    }
  }
  return { src, ids, edges, judged, judgments, outputs, hasEngValue, hasImpact, hasTrace, dates, hasCertificate, hasDeliverables, lifecycleStatuses, formalViews, formalStatuses, formalJudgments, bridges, bridgeDirections, bridgeResiduals }
}

// Run all checks over a parsed catalog. Returns structured findings so the CLI
// and tests share exactly the same logic.
export function checkCatalog(raw) {
  const cat = typeof raw === 'string' ? parseCatalog(raw) : raw
  const { src, ids, edges, judged, judgments, outputs, hasEngValue, hasImpact, hasTrace, dates, hasCertificate, hasDeliverables, lifecycleStatuses, formalViews, formalStatuses, formalJudgments, bridges, bridgeDirections, bridgeResiduals } = cat
  const notes = []
  const failures = []
  const warnings = []

  notes.push(`problems: ${ids.length}`)
  const dupIds = ids.filter((id, i) => ids.indexOf(id) !== i)
  if (dupIds.length) failures.push(`duplicate ids: ${[...new Set(dupIds)].join(', ')}`)

  const idSet = new Set(ids)
  const dangling = [...new Set(edges.filter((e) => !idSet.has(e.to)).map((e) => e.to))]
  if (dangling.length) failures.push(`dangling related_problems targets: ${dangling.join(', ')}`)
  else notes.push(`relation edges: ${edges.length}, dangling: 0`)

  const badRel = [...new Set(edges.filter((e) => !RELATIONS.has(e.relation)).map((e) => e.relation))]
  if (badRel.length) failures.push(`unknown relation type: ${badRel.join(', ')}`)

  const selfLoops = edges.filter((e) => e.from === e.to)
  if (selfLoops.length) failures.push(`self-loop edges: ${selfLoops.map((e) => e.from).join(', ')}`)
  const seenEdges = new Set()
  const dupEdges = []
  for (const e of edges) {
    const key = `${e.from}|${e.relation}|${e.to}`
    if (seenEdges.has(key)) dupEdges.push(key)
    seenEdges.add(key)
  }
  if (dupEdges.length) failures.push(`duplicate relation edges: ${[...new Set(dupEdges)].join(', ')}`)
  if (!badRel.length && !selfLoops.length && !dupEdges.length) {
    notes.push(`relations: ok (${[...RELATIONS].join(', ')})`)
  }

  const tags = [...src.matchAll(/tags: \[([^\]]*)\]/g)].flatMap((m) => [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]))
  const norm = new Map()
  for (const t of tags) {
    const k = t.trim().toLowerCase()
    if (!norm.has(k)) norm.set(k, new Set())
    norm.get(k).add(t)
  }
  const variants = [...norm.entries()].filter(([, set]) => set.size > 1)
  if (variants.length) {
    variants.forEach(([k, set]) => notes.push(`tag variant '${k}': ${[...set].join(' / ')}`))
    failures.push(`${variants.length} tag(s) differ only by case/whitespace`)
  }

  const missingJudgment = ids.filter((id) => !judged.has(id))
  if (missingJudgment.length) failures.push(`problems missing 'judgment': ${missingJudgment.join(', ')}`)
  else notes.push(`judgment: all ${ids.length} problems covered`)

  // 防再生（真实性收敛）：VERACITY_GATE 之后收录的新问题不得再用统一模板骨架，
  // 否则批量模板腔会复发。存量（日期早于门槛）不在此门内。
  const templatedNew = ids.filter(
    (id) => (dates.get(id) ?? '') >= VERACITY_GATE && JUDGMENT_TEMPLATE_RE.test(judgments.get(id) ?? ''),
  )
  if (templatedNew.length)
    failures.push(`new problems must use an independent judgment skeleton (avoid 'A pass '/'合格答案为'): ${templatedNew.join(', ')}`)
  else notes.push(`judgment boilerplate gate: all problems pass (no template skeleton at/after ${VERACITY_GATE})`)

  // 生命周期（方向四）：值必须是合法枚举；refuted 的题应有 updates（含反例说明）。
  const badLifecycle = [...lifecycleStatuses.entries()].filter(([, v]) => !LIFECYCLE_KINDS.has(v))
  if (badLifecycle.length) failures.push(`invalid lifecycle_status: ${badLifecycle.map(([k, v]) => `${k}=${v}`).join(', ')}`)
  else if (lifecycleStatuses.size) notes.push(`lifecycle_status: ${[...LIFECYCLE_KINDS].filter((k) => [...lifecycleStatuses.values()].includes(k)).join(', ')}`)

  // 双桥(方向: formal_view/bridge 枚举合法性 + 判定存在 + 映射残差层合法性)。
  const fvStatusesOk = [...formalStatuses].filter(([, v]) => !FORMAL_STATUSES.has(v))
  const brDirsOk = [...bridgeDirections].filter(([, v]) => !BRIDGE_DIRECTIONS.has(v))
  // 判定按块统计,不做全文件 includes,避免别的块漏掉本块的缺失(逐块精确)。
  const fvNoJudge = [...formalViews].filter((id) => !formalJudgments.has(id))
  const badResiduals = [...bridgeResiduals].filter(([, arr]) => arr.some((x) => !CERT_LAYERS.includes(x)))
  if (fvStatusesOk.length) failures.push(`invalid formal_view.status: ${fvStatusesOk.map(([k, v]) => `${k}=${v}`).join(', ')}`)
  if (brDirsOk.length) failures.push(`invalid bridge.direction: ${brDirsOk.map(([k, v]) => `${k}=${v}`).join(', ')}`)
  if (fvNoJudge.length) failures.push(`formal_view missing 'judgment': ${fvNoJudge.join(', ')}`)
  if (badResiduals.length) failures.push(`invalid bridge.shared_residuals: ${badResiduals.map(([k, v]) => `${k}=${v.join(',')}`).join(', ')}`)
  if (formalViews.size && fvStatusesOk.length === 0 && brDirsOk.length === 0 && badResiduals.length === 0) {
    notes.push(`dual-bridge: ${formalViews.size} formal_view, ${bridges.size} bridge, enums valid`)
  }

  // 序交叉不变式: 形式侧证伪(status=refuted)使带侧声称的证书失效,
  // 生命周期不得仍挂在 open/tightened(须落到 refuted/superseded)。
  const badRefute = [...formalStatuses].filter(([id, v]) => v === 'refuted' && !['refuted', 'superseded'].includes(lifecycleStatuses.get(id)))
  if (badRefute.length) failures.push(`formal_view.status=refuted requires lifecycle_status refuted/superseded: ${badRefute.map(([k]) => k).join(', ')}`)

  const missingOutput = ids.filter((id) => !outputs.has(id))
  if (missingOutput.length) failures.push(`problems missing 'output': ${missingOutput.join(', ')}`)
  const badOutput = [...outputs.entries()].filter(([, v]) => !OUTPUT_KINDS.has(v))
  if (badOutput.length) failures.push(`invalid output: ${badOutput.map(([k, v]) => `${k}=${v}`).join(', ')}`)
  if (missingOutput.length === 0 && badOutput.length === 0) {
    const dist = {}
    for (const v of outputs.values()) dist[v] = (dist[v] ?? 0) + 1
    const distStr = ['verified_behavior', 'verified_truth', 'scaffolding'].filter((k) => dist[k]).map((k) => `${k}=${dist[k]}`).join(' ')
    notes.push(`output: all covered (${distStr})`)
  }

  const noImpact = ids.filter((id) => !hasImpact.has(id))
  if (noImpact.length) failures.push(`problems missing 'impact_domains': ${noImpact.join(', ')}`)
  else notes.push(`impact_domains: all ${ids.length} problems covered`)

  const vbNoEng = ids.filter((id) => outputs.get(id) === 'verified_behavior' && !hasEngValue.has(id))
  if (vbNoEng.length) failures.push(`verified_behavior problems missing 'engineering_value': ${vbNoEng.join(', ')}`)
  else notes.push(`engineering_value: all verified_behavior problems covered (${ids.filter((id) => outputs.get(id) === 'verified_behavior').length})`)

  // 三层残差（方向一）
  const vbIds = ids.filter((id) => outputs.get(id) === 'verified_behavior')
  const missingLayers = []
  const noRParamDecl = []
  for (const id of vbIds) {
    const j = judgments.get(id) ?? ''
    for (const layer of ['R_model', 'R_param', 'R_num']) {
      if (!j.includes(layer)) missingLayers.push(`${id}:${layer}`)
    }
    if (j.includes('R_param') && !/R_param[^\n]*≡\s*0/i.test(j) && !/R_param[^\n]*测量|不确定度|输入残差|measurement|uncertainty|input residual/i.test(j)) {
      noRParamDecl.push(id)
    }
  }
  if (missingLayers.length) failures.push(`verified_behavior judgments missing residual layers: ${missingLayers.join(', ')}`)
  else notes.push(`three-layer residual: all ${vbIds.length} verified_behavior judgments cover R_model/R_param/R_num`)
  if (noRParamDecl.length) failures.push(`R_param declared without uncertainty content or ≡0 note: ${noRParamDecl.join(', ')}`)
  else notes.push('R_param declaration: all verified_behavior problems explicit')

  // 继承链（方向二）—— 仅警告
  const vbDependsOn = edges.filter((e) => outputs.get(e.from) === 'verified_behavior' && e.relation === 'depends_on')
  const noInheritanceNote = vbDependsOn.filter((e) => !INHERITANCE_MARKERS.some((m) => e.note.includes(m)))
  if (noInheritanceNote.length)
    warnings.push(`depends_on edges from verified_behavior missing inheritance note: ${noInheritanceNote.map((e) => `${e.from}->${e.to}`).join(', ')}`)
  else if (vbDependsOn.length) notes.push(`inheritance chain: all ${vbDependsOn.length} depends_on edges from verified_behavior carry inheritance notes`)

  // 结构化证书（方向一 L1）+ 参考核验器（契约 v0.1 四条不变量）
  const certIds = [...hasCertificate]
  const badCert = []
  let vPass = 0
  let vNeedsForm = 0
  const vFail = []
  for (const id of certIds) {
    const start = src.indexOf(`\n    id: '${id}',`)
    if (start < 0) { badCert.push(`${id}:block-not-found`); continue }
    const nextId = src.indexOf('\n    id: \'', start + 10)
    const block = src.slice(start, nextId > 0 ? nextId : undefined)
    for (const layer of CERT_LAYERS) if (!block.includes(`${layer}:`)) badCert.push(`${id}:${layer}`)
    if (!block.includes('total_band:')) badCert.push(`${id}:total_band`)
    const rpBound = block.match(/r_param:\s*\{[^}]*bound:\s*'([^']*)'/)
    if (rpBound && rpBound[1] && !rpBound[1].includes('≡0') && !/测量|不确定度|输入残差|measurement|uncertainty|input residual/i.test(rpBound[1])) {
      badCert.push(`${id}:r_param-bound`)
    }
    // 参考核验器：从块内提取字段，交由共享 verifier 判定（契约 v0.1）。
    const field = (re) => (block.match(re) || [])[1] ?? ''
    const cert = {
      r_model: { bound: field(/r_model:\s*\{\s*bound:\s*'([^']*)'/) },
      r_param: { bound: field(/r_param:\s*\{\s*bound:\s*'([^']*)'/) },
      r_num: { bound: field(/r_num:\s*\{\s*bound:\s*'([^']*)'/) },
      total_band: field(/total_band:\s*'([^']*)'/),
      certified_band: (block.match(/certified_band:\s*'([^']*)'/) || [])[1] ?? undefined,
    }
    const verdict = verifyCertificate(cert)
    const failChecks = Object.entries(verdict.checks)
      .filter(([, s]) => s === 'fail')
      .map(([k]) => k)
    if (failChecks.length) vFail.push(`${id}:${failChecks.join('+')}`)
    else if (verdict.checks.band_form === 'pass') vPass += 1
    else vNeedsForm += 1
  }
  if (badCert.length) failures.push(`certificate structural issues: ${badCert.join(', ')}`)
  else if (certIds.length) notes.push(`certificate: all ${certIds.length} structured certificates have complete layers`)
  if (vFail.length) failures.push(`certificate verifier (contract v0.1): ${vFail.join(', ')}`)
  else if (certIds.length)
    notes.push(`verifier: ${vPass} certificates machine-verified, ${vNeedsForm} need machine form (${certIds.length} total)`)

  // 试点：形式工具映射 + 结构化失败记录契约（工具 id / 机制 / 层 / 角色 枚举合法）。
  const badTool = [...src.matchAll(/tool_id: '([^']+)'/g)]
    .map((m) => m[1])
    .filter((id) => !TOOL_IDS.has(id))
  const badRole = [...src.matchAll(/tool_links:\s*\[\s*([\s\S]*?)\]\s*,\n/g)]
    .flatMap((m) => [...m[1].matchAll(/role: '([^']+)'/g)].map((r) => r[1]))
    .filter((r) => !TOOL_ROLES.has(r))
  const badMech = [...src.matchAll(/mechanism: '([^']+)'/g)]
    .map((m) => m[1])
    .filter((m) => !MECHANISMS.has(m))
  const badLayer = [...src.matchAll(/layer: '([^']+)'/g)]
    .map((m) => m[1])
    .filter((l) => !FAILURE_LAYERS.has(l))
  const toolCount = (src.match(/tool_links:/g) || []).length
  const failureCount = (src.match(/failure_records:/g) || []).length
  if (badTool.length) failures.push(`tool_links reference unknown tools: ${[...new Set(badTool)].join(', ')}`)
  if (badRole.length) failures.push(`tool_links use invalid role: ${[...new Set(badRole)].join(', ')}`)
  if (badMech.length) failures.push(`failure_records use unknown mechanism: ${[...new Set(badMech)].join(', ')}`)
  if (badLayer.length) failures.push(`failure_records use invalid layer: ${[...new Set(badLayer)].join(', ')}`)
  else notes.push(`pilot index: ${toolCount} tool_links blocks, ${failureCount} failure_records blocks`)

  const delivIds = [...hasDeliverables]
  if (delivIds.length) notes.push(`engineering_deliverables: ${delivIds.length} problems have structured deliverables`)

  // 溯源（方向：proposer/via）
  const noTraceNew = ids.filter((id) => !hasTrace.has(id) && (dates.get(id) ?? '') >= BATCH_ADDED)
  const noTraceLegacy = ids.filter((id) => !hasTrace.has(id) && (dates.get(id) ?? '') < BATCH_ADDED)
  if (noTraceNew.length) failures.push(`new problems missing 'proposer'/'via' traceability: ${noTraceNew.join(', ')}`)
  if (noTraceLegacy.length) warnings.push(`legacy problems missing proposer/via: ${noTraceLegacy.join(', ')}`)

  return { notes, failures, warnings }
}