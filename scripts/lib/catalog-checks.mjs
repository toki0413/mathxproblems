// Pure catalog validation, extracted from scripts/check-problems.mjs so that
// the guard rails (three-layer residual, certificate structure, inheritance
// notes) can be unit-tested without spawning the CLI. check-problems.mjs calls
// checkCatalog() and prints the result; tests feed it synthetic snippets.

export const RELATIONS = new Set(['depends_on', 'implies', 'shares_tools', 'generalizes', 'analog_of'])
export const OUTPUT_KINDS = new Set(['verified_behavior', 'verified_truth', 'scaffolding'])
export const BATCH_ADDED = '2026-08-23'
export const CERT_LAYERS = ['r_model', 'r_param', 'r_num']
export const INHERITANCE_MARKERS = ['总带继承', 'inheritance']

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
  return { src, ids, edges, judged, judgments, outputs, hasEngValue, hasImpact, hasTrace, dates, hasCertificate, hasDeliverables }
}

// Run all checks over a parsed catalog. Returns structured findings so the CLI
// and tests share exactly the same logic.
export function checkCatalog(raw) {
  const cat = typeof raw === 'string' ? parseCatalog(raw) : raw
  const { src, ids, edges, judged, judgments, outputs, hasEngValue, hasImpact, hasTrace, dates, hasCertificate, hasDeliverables } = cat
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
    if (j.includes('R_param') && !/R_param[^\n]*≡\s*0/.test(j) && !/R_param[^\n]*测量|不确定度|输入残差/.test(j)) {
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

  // 结构化证书（方向一 L1）
  const certIds = [...hasCertificate]
  const badCert = []
  for (const id of certIds) {
    const start = src.indexOf(`\n    id: '${id}',`)
    if (start < 0) { badCert.push(`${id}:block-not-found`); continue }
    const nextId = src.indexOf('\n    id: \'', start + 10)
    const block = src.slice(start, nextId > 0 ? nextId : undefined)
    for (const layer of CERT_LAYERS) if (!block.includes(`${layer}:`)) badCert.push(`${id}:${layer}`)
    if (!block.includes('total_band:')) badCert.push(`${id}:total_band`)
    const rpBound = block.match(/r_param:\s*\{[^}]*bound:\s*'([^']*)'/)
    if (rpBound && rpBound[1] && !rpBound[1].includes('≡0') && !/测量|不确定度|输入残差/.test(rpBound[1])) {
      badCert.push(`${id}:r_param-bound`)
    }
  }
  if (badCert.length) failures.push(`certificate structural issues: ${badCert.join(', ')}`)
  else if (certIds.length) notes.push(`certificate: all ${certIds.length} structured certificates have complete layers`)

  const delivIds = [...hasDeliverables]
  if (delivIds.length) notes.push(`engineering_deliverables: ${delivIds.length} problems have structured deliverables`)

  // 溯源（方向：proposer/via）
  const noTraceNew = ids.filter((id) => !hasTrace.has(id) && (dates.get(id) ?? '') >= BATCH_ADDED)
  const noTraceLegacy = ids.filter((id) => !hasTrace.has(id) && (dates.get(id) ?? '') < BATCH_ADDED)
  if (noTraceNew.length) failures.push(`new problems missing 'proposer'/'via' traceability: ${noTraceNew.join(', ')}`)
  if (noTraceLegacy.length) warnings.push(`legacy problems missing proposer/via: ${noTraceLegacy.join(', ')}`)

  return { notes, failures, warnings }
}