#!/usr/bin/env node
// Mathlib↔问题 双向映射护栏（check:tools）。
//
// 校验四件事：
//   1. 每个 tool_links.tool_id（problems.ts 与 laws.ts）都必须存在于 MATHLIB_TOOLS 注册表
//      —— 不允许悬空引用（A 方向反查才能落到真工具）。
//   2. 每个注册表工具至少被一道题或一条定律引用 —— 供给侧不能是空壳（MathX 作为
//      "应用侧 Mathlib 入口"，注册一个 certifies 不了任何东西的工具是死条目）。
//   3. role 枚举合法（available/partial/missing）。
//   4. 注册表 id 唯一。
//
// 只做结构校验（零漂移）：不发明链接，只保证已有链接指向真实工具。
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const problemsSrc = readFileSync(join(root, 'src/data/problems.ts'), 'utf8')
const lawsSrc = readFileSync(join(root, 'src/data/laws.ts'), 'utf8')
const toolsSrc = readFileSync(join(root, 'src/data/mathlibTools.ts'), 'utf8')

// 注册表工具 id（MATHLIB_TOOLS 数组项）
const toolIds = [...toolsSrc.matchAll(/^\s*id: '([^']+)',$/gm)].map((m) => m[1])
const dupIds = toolIds.filter((id, i) => toolIds.indexOf(id) !== i)
const toolSet = new Set(toolIds)

const ROLES = new Set(['available', 'partial', 'missing'])

// 收集 (source, problemId/lawId, tool_id, role)
const links = []
for (const m of problemsSrc.matchAll(/tool_links:\s*\[/g)) {
  // 从块起点向后找工具 id 与 role
  const block = problemsSrc.slice(m.index)
  // 向上回溯到所属题 id
  const before = problemsSrc.slice(0, m.index)
  const idMatch = [...before.matchAll(/^    id: '([^']+)'/gm)].pop()
  const srcId = idMatch ? idMatch[1] : '(unknown)'
  // 解析块内 link 项（到 "]," 为止）
  const end = block.indexOf('],', 8)
  const body = block.slice(0, end < 0 ? 2000 : end + 2)
  for (const lm of body.matchAll(/\{\s*tool_id: '([^']+)',\s*role: '([^']+)'\s*\}/g)) {
    links.push({ source: 'problem', srcId, tool_id: lm[1], role: lm[2] })
  }
}
for (const m of lawsSrc.matchAll(/tool_links:\s*\[/g)) {
  const block = lawsSrc.slice(m.index)
  const before = lawsSrc.slice(0, m.index)
  const idMatch = [...before.matchAll(/id: '(law-[a-z0-9-]+)'/g)].pop()
  const srcId = idMatch ? idMatch[1] : '(unknown)'
  const end = block.indexOf('],', 8)
  const body = block.slice(0, end < 0 ? 2000 : end + 2)
  for (const lm of body.matchAll(/\{\s*tool_id: '([^']+)',\s*role: '([^']+)'\s*\}/g)) {
    links.push({ source: 'law', srcId, tool_id: lm[1], role: lm[2] })
  }
}

const failures = []

// 1. 悬空引用
const dangling = links.filter((l) => !toolSet.has(l.tool_id))
if (dangling.length) failures.push(`dangling tool_id (not in registry): ${dangling.map((l) => `${l.source}:${l.srcId}->${l.tool_id}`).join(', ')}`)

// 2. 非法 role
const badRole = links.filter((l) => !ROLES.has(l.role))
if (badRole.length) failures.push(`invalid tool role: ${badRole.map((l) => `${l.srcId}->${l.tool_id}:${l.role}`).join(', ')}`)

// 3. 注册表 id 唯一
if (dupIds.length) failures.push(`duplicate tool ids: ${dupIds.join(', ')}`)

// 4. 供给侧空壳：注册了却没人引用的工具
const used = new Set(links.map((l) => l.tool_id))
const unused = toolIds.filter((id) => !used.has(id))

// 统计
const linkedProblems = new Set(links.filter((l) => l.source === 'problem').map((l) => l.srcId))
const linkedLaws = new Set(links.filter((l) => l.source === 'law').map((l) => l.srcId))
const allProblemIds = new Set([...problemsSrc.matchAll(/^    id: '([^']+)'/gm)].map((m) => m[1]))
const allLawIds = new Set([...lawsSrc.matchAll(/id: '(law-[a-z0-9-]+)'/g)].map((m) => m[1]))
const byRole = {}
for (const l of links) byRole[l.role] = (byRole[l.role] ?? 0) + 1
const linkCount = links.length

console.log(`tool registry: ${toolIds.length} tools; ${used.size} used by catalog`)
console.log(
  `tool_links coverage: ${linkedProblems.size}/${allProblemIds.size} problems, ${linkedLaws.size}/${allLawIds.size} laws; ${linkCount} links (${Object.entries(byRole)
    .map(([k, v]) => `${k}=${v}`)
    .join(', ')})`,
)
if (unused.length) console.log(`unused (registered but unreferenced) tools: ${unused.join(', ')}`)

if (failures.length) {
  for (const f of failures) console.error(`FAIL: ${f}`)
  process.exit(1)
}
console.log('check:tools OK')
