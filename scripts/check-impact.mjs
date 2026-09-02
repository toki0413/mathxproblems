#!/usr/bin/env node
// Impact-domain evidence guard (B5).
//
// 诚实规则：
//   1) 目录中引用的每个影响域字符串（inline impact_domains + 遗留 IMPACT_DOMAINS
//      映射）都必须能在 src/data/impactDomains.ts 注册表中解析到；
//   2) literature-backed 条目必须 ≥1 条 evidence，且 url 为 https://arxiv.org/abs/…
//      （可核验锚点；证据由人工经 arXiv API 检索并核验，非生成）；
//   3) AI-drafted 条目是给专家留白的框架，禁止挂任何未经验证的论文。
// 与 check-laws/check-problems 一样，用正则解析 TS 源（无 TS 运行时）。
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const problemsSrc = readFileSync(join(root, 'src/data/problems.ts'), 'utf8')
const registrySrc = readFileSync(join(root, 'src/data/impactDomains.ts'), 'utf8')

// 目录引用：inline impact_domains 数组 + 遗留 IMPACT_DOMAINS 映射的值。
const referenced = new Set()
for (const m of problemsSrc.matchAll(/impact_domains:\s*\[([^\]]*)\]/g)) {
  for (const s of m[1].matchAll(/'([^']+)'/g)) referenced.add(s[1])
}
for (const m of problemsSrc.matchAll(/'([^']+)':\s*\[([^\]]*)\]?/g)) {
  // IMPACT_DOMAINS 映射的键形如 'mp-001': [...] —— 值是影响域字符串。
  if (/^\s*'(mp|mc|mb|me)-\d+'\s*:/.test(m[0])) {
    for (const s of m[2].matchAll(/'([^']+)'/g)) referenced.add(s[1])
  }
}

// 注册表条目：逐块提取 name / status / evidence（url 是 ev() 辅助调用的第 4 个参数）。
const records = []
for (const block of registrySrc.split(/\n  \{\n    id: '/).slice(1)) {
  const name = (block.match(/name: '([^']*)'/) || [])[1]
  const status = (block.match(/status: '([^']+)'/) || [])[1]
  const urls = [
    ...block.matchAll(
      /ev\(\s*'[^']*',\s*\[[^\]]*\],\s*'[^']*',\s*'(https:\/\/arxiv\.org\/abs\/[^']+)'/g,
    ),
  ].map((x) => x[1])
  if (name) records.push({ name, status, urls })
}

const failures = []
const warnings = []

// 1) 引用必须可解析
const names = new Set(records.map((r) => r.name))
const unresolved = [...referenced].filter((d) => !names.has(d))
if (unresolved.length)
  failures.push(`impact domain not in registry: ${unresolved.join(', ')}`)

// 2/3) 状态不变量
const badStatus = records.filter((r) => r.status !== 'literature-backed' && r.status !== 'AI-drafted')
if (badStatus.length) failures.push(`invalid impact status: ${badStatus.map((r) => r.name).join(', ')}`)

const emptyBacked = records.filter(
  (r) => r.status === 'literature-backed' && r.urls.length === 0,
)
if (emptyBacked.length)
  failures.push(`literature-backed domain missing evidence: ${emptyBacked.map((r) => r.name).join(', ')}`)

const fabricated = records.filter(
  (r) => r.status === 'AI-drafted' && r.urls.length > 0,
)
if (fabricated.length)
  failures.push(`AI-drafted domain must not carry unverified evidence: ${fabricated.map((r) => r.name).join(', ')}`)

// 重复名
const dup = records.filter((r, i) => records.findIndex((x) => x.name === r.name) !== i)
if (dup.length) failures.push(`duplicate impact domain names: ${dup.map((r) => r.name).join(', ')}`)

const backed = records.filter((r) => r.status === 'literature-backed').length
const drafted = records.filter((r) => r.status === 'AI-drafted').length
console.log(`impact domains: ${records.length} records (${backed} literature-backed, ${drafted} AI-drafted)`)
console.log(`referenced by catalog: ${referenced.size} unique domains`)

if (failures.length) {
  for (const f of failures) console.error(`FAIL: ${f}`)
  process.exit(1)
}
console.log('check:impact OK')
