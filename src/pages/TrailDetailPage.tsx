import { Link, useParams } from 'react-router'
import { useMemo } from 'react'
import { TOPIC_TRAILS } from '@/data/topicTrails'
import { AUDITED_PROBLEMS } from '@/data/audits'
import { DOMAINS, type RelationType } from '@/data/problems'
import { DomainDot } from '@/components/ProblemRow'
import { Reveal } from '@/components/Reveal'
import { useI18n, pickLang, type Lang } from '@/i18n'
import NotFound from '@/pages/NotFound'

const RELATION_LABEL: Record<RelationType, { zh: string; en: string }> = {
  depends_on: { zh: '依赖', en: 'depends on' },
  implies: { zh: '蕴含', en: 'implies' },
  shares_tools: { zh: '共享工具', en: 'shares tools' },
  generalizes: { zh: '推广', en: 'generalizes' },
  analog_of: { zh: '类比', en: 'analog of' },
}

const pickBi = (v: { zh: string; en: string }, lang: Lang) => (lang === 'zh' ? v.zh : v.en)

export default function TrailDetailPage() {
  const { trailId } = useParams()
  const { lang, t } = useI18n()

  const trail = TOPIC_TRAILS.find((tr) => tr.id === trailId)

  const model = useMemo(() => {
    if (!trail) return null
    const byId = new Map(AUDITED_PROBLEMS.map((p) => [p.id, p]))
    const problems = trail.problemIds
      .map((id) => byId.get(id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p))
    // 簇内关系：仅保留两端都在簇内的 related_problems 边。
    const edges: { from: string; to: string; relation: RelationType; note: string }[] = []
    const inCluster = new Set(trail.problemIds)
    for (const p of problems) {
      for (const r of p.related_problems) {
        if (inCluster.has(r.id)) {
          edges.push({ from: p.id, to: r.id, relation: r.relation, note: r.note })
        }
      }
    }
    return { problems, edges }
  }, [trail])

  if (!trail || !model) return <NotFound />

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <Reveal>
        <div className="flex items-center gap-2 flex-wrap">
          <Link to="/trails" className="font-mono2 text-[11px] uppercase tracking-[0.18em] text-ink-3 hover:text-ink transition-colors">
            ← {t('tr.back')}
          </Link>
          <span className="font-mono2 text-[11px] text-ink-3">·</span>
          <span className="font-mono2 text-[11px] text-ink-3">{trail.problemIds.length} {t('tr.problems')}</span>
          {[...new Set(model.problems.map((p) => p.domain))].map((d) => (
            <DomainDot key={d} domain={d} />
          ))}
        </div>
        <h1 className="mt-4 font-statement text-4xl md:text-5xl font-bold tracking-tight">{pickBi(trail.title, lang)}</h1>
        <p className="mt-6 max-w-3xl text-ink-2 leading-relaxed">{pickBi(trail.blurb, lang)}</p>
      </Reveal>

      <Reveal delay={60}>
        <div className="mt-8 border-l-2 border-ink pl-5 py-1">
          <div className="font-mono2 text-[10px] uppercase tracking-[0.2em] text-ink-3">{t('tr.boundary')}</div>
          <p className="mt-2 text-sm text-ink leading-relaxed max-w-3xl">{pickBi(trail.boundary, lang)}</p>
        </div>
      </Reveal>

      {/* 簇内关系（由 related_problems 派生，非第二份数据） */}
      {model.edges.length > 0 && (
        <Reveal delay={80}>
          <section className="mt-10">
            <h2 className="font-mono2 text-[11px] uppercase tracking-[0.25em] text-ink-3 mb-4">{t('tr.relations')}</h2>
            <div className="grid gap-x-10 gap-y-3 md:grid-cols-2">
              {model.edges.map((e, i) => (
                <div key={`${e.from}->${e.to}:${i}`} className="flex items-baseline gap-2 text-sm">
                  <Link to={`/problems/${e.from}`} className="font-mono2 text-[11px] text-ink-3 shrink-0 hover:underline underline-offset-4">
                    {e.from}
                  </Link>
                  <span className="border border-line rounded-full px-2 py-px font-mono2 text-[10px] uppercase tracking-wider text-ink-3 shrink-0">
                    {pickBi(RELATION_LABEL[e.relation], lang)}
                  </span>
                  <Link to={`/problems/${e.to}`} className="font-mono2 text-[11px] text-ink-3 shrink-0 hover:underline underline-offset-4">
                    {e.to}
                  </Link>
                  <span className="min-w-0 flex-1 truncate text-ink-2" title={e.note}>
                    {e.note}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </Reveal>
      )}

      {/* 题单（研究叙事顺序） */}
      <Reveal delay={100}>
        <section className="mt-10">
          <h2 className="font-mono2 text-[11px] uppercase tracking-[0.25em] text-ink-3 mb-4">{t('tr.trail')}</h2>
          <div className="border-t border-line">
            {model.problems.map((p, i) => (
              <div key={p.id} className="border-b border-line py-4 flex items-baseline gap-3">
                <span className="font-mono2 text-[11px] text-ink-3 shrink-0 w-8">{String(i + 1).padStart(2, '0')}</span>
                <DomainDot domain={p.domain} />
                <Link
                  to={`/problems/${p.id}`}
                  className="font-mono2 text-[11px] text-ink-3 shrink-0 hover:underline underline-offset-4"
                >
                  {p.id}
                </Link>
                <Link
                  to={`/problems/${p.id}`}
                  className="min-w-0 flex-1 truncate font-statement text-[15px] font-bold text-ink hover:underline underline-offset-4 decoration-line-strong"
                >
                  {pickLang({ title: p.title, titleZh: p.titleZh }, lang)}
                </Link>
                <span className="shrink-0 font-mono2 text-[10px] uppercase tracking-wider text-ink-3">
                  {DOMAINS[p.domain].prefix}
                </span>
              </div>
            ))}
          </div>
        </section>
      </Reveal>
    </div>
  )
}
