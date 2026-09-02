import { useMemo, useState } from 'react'
import { AUDITED_PROBLEMS } from '@/data/audits'
import { relatedOf } from '@/data/problems'
import { MATHLIB_TOOLS } from '@/data/mathlibTools'
import { LAWS } from '@/data/laws'
import { IMPACT_DOMAIN_RECORDS } from '@/data/impactDomains'
import { ENGINEERING_NEEDS } from '@/data/engineeringNeeds'
import { Reveal } from '@/components/Reveal'
import { useI18n } from '@/i18n'

// Explicit, symmetric-complete edge list so AI consumers can traverse the
// problem graph without parsing each problem's adjacency array.
function relationsOf(list: typeof AUDITED_PROBLEMS) {
  return list.flatMap((p) =>
    relatedOf(p).map((r) => ({ from: p.id, to: r.id, relation: r.relation })),
  )
}

function toJson(list: typeof AUDITED_PROBLEMS) {
  return JSON.stringify(
    {
      generated: new Date().toISOString().slice(0, 10),
      count: list.length,
      problems: list,
      relations: relationsOf(list),
    },
    null,
    2,
  )
}

export default function ApiPage() {
  const { t: t2 } = useI18n()
  const benchmark = useMemo(
    () => AUDITED_PROBLEMS.filter((p) => p.formalization_potential === 'high'),
    [],
  )
  const [which, setWhich] = useState<'problems' | 'benchmark'>('problems')
  const [copied, setCopied] = useState(false)
  const data = which === 'problems' ? AUDITED_PROBLEMS : benchmark
  const json = useMemo(() => toJson(data), [data])

  const download = () => {
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = which === 'problems' ? 'problems.json' : 'benchmark.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-14">
      <Reveal>
        <h1 className="font-statement text-4xl md:text-5xl font-bold tracking-tight">{t2('api.title')}</h1>
        <p className="mt-6 text-ink-2 leading-relaxed max-w-2xl">
          {t2('api.subtitle')}
        </p>
      </Reveal>

      <div className="mt-8 border border-line divide-y divide-[var(--line)]">
        {[
          ['problems.json', t2('api.problems.desc'), AUDITED_PROBLEMS.length],
          ['benchmark.json', t2('api.benchmark.desc'), benchmark.length],
          ['tools.json', t2('api.tools.desc'), MATHLIB_TOOLS.length],
          ['laws.json', t2('api.laws.desc'), LAWS.length],
          ['impact.json', t2('api.impact.desc'), IMPACT_DOMAIN_RECORDS.length],
          ['needs.json', t2('api.needs.desc'), ENGINEERING_NEEDS.length],
          ['ledger.json', t2('api.ledger.desc'), 'append-only'],
        ].map(([path, desc, n]) => (
          <div key={path as string} className="grid md:grid-cols-[14rem_1fr_auto] gap-3 p-5 items-baseline">
            <code className="font-mono2 text-sm">{path}</code>
            <span className="text-sm text-ink-2">{desc}</span>
            <span className="font-mono2 text-xs text-ink-3">{n}</span>
          </div>
        ))}
        {/* RSS 订阅：从同一目录确定性生成，无需单独维护 feed 内容 */}
        <div className="grid md:grid-cols-[14rem_1fr_auto] gap-3 p-5 items-baseline">
          <a href="/api/v1/feed.xml" className="font-mono2 text-sm underline decoration-line-strong underline-offset-4 hover:decoration-ink">
            feed.xml
          </a>
          <span className="text-sm text-ink-2">{t2('api.feed.desc')}</span>
          <a
            href="/api/v1/feed.xml"
            className="rounded-full border border-line-strong px-3.5 py-1 text-xs text-ink-2 hover:border-ink hover:text-ink transition-colors"
          >
            {t2('api.feed.subscribe')}
          </a>
        </div>
      </div>

      <div className="mt-10">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button
            onClick={() => setWhich('problems')}
            className={`rounded-full border px-4 py-1.5 text-xs ${which === 'problems' ? 'bg-ink text-paper border-ink' : 'border-line-strong text-ink-2'}`}
          >
            problems.json
          </button>
          <button
            onClick={() => setWhich('benchmark')}
            className={`rounded-full border px-4 py-1.5 text-xs ${which === 'benchmark' ? 'bg-ink text-paper border-ink' : 'border-line-strong text-ink-2'}`}
          >
            benchmark.json
          </button>
          <div className="flex-1" />
          <button onClick={download} className="rounded-full bg-ink text-paper px-4 py-1.5 text-xs">
            {t2('api.download')}
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(json)
              setCopied(true)
              setTimeout(() => setCopied(false), 1600)
            }}
            className="rounded-full border border-line-strong px-4 py-1.5 text-xs text-ink-2 hover:border-ink"
          >
            {copied ? t2('api.copied') : t2('api.copy')}
          </button>
        </div>
        <pre className="max-h-[30rem] overflow-auto bg-ink text-paper/90 p-5 font-mono2 text-xs leading-relaxed">
          {json.length > 12000 ? json.slice(0, 12000) + '\n…' : json}
        </pre>
      </div>
    </div>
  )
}
