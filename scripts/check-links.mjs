#!/usr/bin/env node
// Link-health guard: scans every reference/evidence URL in the catalog and
// reports dead links. 手动维护工具（不阻断 CI 部署，因为出版社 403 与网络抖动
// 会误报）：只在 404/410 等"确定死亡"时失败，403（出版社封爬虫）与超时记为警告。
//
// 用法：node scripts/check-links.mjs
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36'
const problemsSrc = readFileSync(join(root, 'src/data/problems.ts'), 'utf8')
const impactSrc = readFileSync(join(root, 'src/data/impactDomains.ts'), 'utf8')

const urls = []
// references: 逐块 label/url 对
for (const m of problemsSrc.matchAll(/label: '([^']*)',\s*\n\s*url: '(https?:\/\/[^']+)'/g)) {
  urls.push({ from: 'problems.ts', label: m[1].slice(0, 50), url: m[2] })
}
// impact evidence: ev() 第 4 参数
for (const m of impactSrc.matchAll(/ev\(\s*'[^']*',\s*\[[^\]]*\],\s*'[^']*',\s*'(https?:\/\/[^']+)'/g)) {
  urls.push({ from: 'impactDomains.ts', label: '(evidence)', url: m[1] })
}

const dead = []
const blocked = []
const inconclusive = []
let ok = 0
const seen = new Set()
for (const { from, label, url } of urls) {
  if (seen.has(url)) continue
  seen.add(url)
  try {
    const r = await fetch(url, {
      redirect: 'follow',
      headers: { 'User-Agent': UA, Accept: 'text/html,*/*' },
      signal: AbortSignal.timeout(20000),
    })
    if (r.status === 403 || r.status === 429 || r.status === 451) blocked.push({ url, status: r.status, label })
    else if (r.status === 404 || r.status === 410) dead.push({ url, status: r.status, label })
    else if (r.status >= 400) inconclusive.push({ url, status: r.status, label, err: 'publisher/proxy status' })
    else ok++
  } catch (e) {
    inconclusive.push({ url, err: String(e.message).slice(0, 50), label })
  }
}

for (const d of dead) console.log(`DEAD ${d.status} ${d.url}  (${d.label})`)
for (const b of blocked) console.log(`BLOCKED ${b.status} ${b.url}  (${b.label}) [probably publisher bot-protection]`)
for (const i of inconclusive) console.log(`INCONCLUSIVE ${i.url}  (${i.err})`)
console.log(`\nchecked ${seen.size} unique URLs: ${ok} ok, ${dead.length} dead, ${blocked.length} blocked(403), ${inconclusive.length} inconclusive`)

if (dead.length) {
  console.error(`check:links FAIL (${dead.length} dead link(s))`)
  process.exit(1)
}
console.log('check:links OK (no confirmed dead links; 403/timeout are warnings)')
