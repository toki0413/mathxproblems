import { Link } from 'react-router'
import { TOPIC_TRAILS } from '@/data/topicTrails'
import { AUDITED_PROBLEMS } from '@/data/audits'
import { Reveal } from '@/components/Reveal'
import { DomainDot } from '@/components/ProblemRow'
import { useI18n, type Lang } from '@/i18n'

const pickBi = (v: { zh: string; en: string }, lang: Lang) => (lang === 'zh' ? v.zh : v.en)

export default function TrailsListPage() {
  const { lang, t } = useI18n()

  const byId = new Map(AUDITED_PROBLEMS.map((p) => [p.id, p]))

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <Reveal>
        <h1 className="font-statement text-4xl md:text-5xl font-bold tracking-tight">{t('tr.title')}</h1>
        <p className="mt-6 max-w-2xl text-ink-2 leading-relaxed">{t('tr.subtitle')}</p>
      </Reveal>

      <div className="mt-10 space-y-6">
        {TOPIC_TRAILS.map((trail, i) => {
          const problems = trail.problemIds
            .map((id) => byId.get(id))
            .filter((p): p is NonNullable<typeof p> => Boolean(p))
          const domains = new Set(problems.map((p) => p.domain))
          return (
            <Reveal key={trail.id} delay={i * 60}>
              <Link
                to={`/trails/${trail.id}`}
                className="group block border border-line bg-white/50 p-6 hover:border-ink-3 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono2 text-[11px] text-ink-3">{trail.id}</span>
                      <span className="font-mono2 text-[11px] text-ink-3">·</span>
                      <span className="font-mono2 text-[11px] text-ink-3">{trail.problemIds.length} {t('tr.problems')}</span>
                      {[...domains].map((d) => (
                        <DomainDot key={d} domain={d} />
                      ))}
                    </div>
                    <h2 className="mt-2 font-statement text-xl font-bold text-ink group-hover:underline underline-offset-4 decoration-line-strong">
                      {pickBi(trail.title, lang)}
                    </h2>
                    <p className="mt-2 text-sm text-ink-2 leading-relaxed max-w-3xl">{pickBi(trail.blurb, lang)}</p>
                  </div>
                  <span className="shrink-0 border border-line rounded-full px-3 py-1.5 font-mono2 text-[11px] uppercase tracking-[0.14em] text-ink-3 group-hover:border-ink-3 group-hover:text-ink transition-colors">
                    {t('tr.open')} →
                  </span>
                </div>
              </Link>
            </Reveal>
          )
        })}
      </div>
    </div>
  )
}
