import { readFileSync } from 'node:fs'

const src = readFileSync('/workspace/src/data/problems.ts', 'utf8')
const re = /what:\s*'([^']*)'/g
let m
const hits = []
while ((m = re.exec(src)) !== null) {
  if (/[\u4e00-\u9fff]/.test(m[1])) hits.push(m[1])
}
console.log('proof_steps what fields with CJK:', hits.length)
for (const h of hits) console.log('-', h)
