import { Link } from 'react-router'
import { useEffect, useMemo, useState } from 'react'
import { AUDITED_PROBLEMS } from '@/data/audits'
import { DOMAINS } from '@/data/problems'
import { DomainDot } from '@/components/ProblemRow'
import { Reveal } from '@/components/Reveal'
import { useI18n, pickLang, type Lang } from '@/i18n'

const pickBi = (v: { zh: string; en: string }, lang: Lang) => (lang === 'zh' ? v.zh : v.en)

/**
 * 活动时间线：合并三类事件，按时间倒序——
 *  1) 判定活动（动态）：账本里已通过的收窄/补证（/api/v1/ledger.json，机器可复算）；
 *  2) 题目收录（静态）：date_added 新增条目；
 *  3) 文献里程碑（静态）：progress 里的 **作者 (年份)** 引用，按年份归桶。
 * 动态源缺失（如纯前端预览）时优雅降级为空态并注明，不伪造历史。
 */

interface LedgerEvent {
  id: number
  problemId: string
  kind: 'verification' | 'formal'
  title: string
  content?: string | null
  authorName?: string | null
  newBand?: string | null
  formalStatus?: string | null
  method?: string | null
  createdAt: string
  verdict?: {
    parseable: boolean
    relative_width: number | null
    within_vacuous: boolean | null
    within_info_gate: boolean | null
  } | null
}

const KIND_BADGE: Record<string, { cls: string; label: { zh: string; en: string } }> = {
  verification: { cls: 'text-mc border-mc/50', label: { zh: '带证收窄', en: 'narrowing' } },
  formal: { cls: 'text-[#2563eb] border-[#2563eb]/40', label: { zh: '形式补证', en: 'formal claim' } },
}

export default function TimelinePage() {
  const { lang, t } = useI18n()
  const [events, setEvents] = useState<LedgerEvent[] | null>(null)

  useEffect(() => {
    let alive = true
    fetch('/api/v1/ledger.json')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((body) => {
        if (alive) setEvents((body.events ?? []) as LedgerEvent[])
      })
      .catch(() => {
        if (alive) setEvents([])
      })
    return () => {
      alive = false
    }
  }, [])

  // 静态：最新收录（date_added 倒序，前 10）
  const additions = useMemo(
    () =>
      [...AUDITED_PROBLEMS]
        .sort((a, b) => (b.date_added ?? '').localeCompare(a.date_added ?? ''))
        .slice(0, 10),
    [],
  )

  // 静态：progress 里程碑，从 **作者 (年份)** 引用解析年份（仅收录带年份的条目）。
  const milestones = useMemo(() => {
    const out: { problemId: string; label: string; year: string; note: string }[] = []
    for (const p of AUDITED_PROBLEMS) {
      for (const line of p.progress ?? []) {
        const m = line.match(/\*\*(.+?)\s*\((\d{4})\)/)
        if (!m) continue
        out.push({
          problemId: p.id,
          label: m[1].trim(),
          year: m[2],
          note: line,
        })
      }
    }
    return out.sort((a, b) => b.year.localeCompare(a.year))
  }, [])

  const liveCount = events?.length ?? 0

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <Reveal>
        <h1 className="font-statement text-4xl md:text-5xl font-bold tracking-tight">{t('tl2.title')}</h1>
        <p className="mt-6 max-w-2xl text-ink-2 leading-relaxed">{t('tl2.subtitle')}</p>
      </Reveal>

      {/* 判定活动（动态账本） */}
      <Reveal delay={60}>
        <section className="mt-10">
          <div className="flex items-baseline justify-between gap-3 flex-wrap">
            <h2 className="font-mono2 text-[11px] uppercase tracking-[0.25em] text-ink-3">{t('tl2.live')}</h2>
            <span className="font-mono2 text-[11px] text-ink-3">{liveCount} {t('tl2.events')}</span>
          </div>
          {events === null ? (
            <p className="mt-3 text-xs text-ink-3">{t('tl2.loading')}</p>
          ) : liveCount === 0 ? (
            <p className="mt-3 border border-dashed border-line px-5 py-6 text-sm text-ink-3">{t('tl2.liveEmpty')}</p>
          ) : (
            <div className="mt-3 border-t border-line">
              {events.map((ev) => {
                const badge = KIND_BADGE[ev.kind] ?? KIND_BADGE.verification
                const day = String(ev.createdAt ?? '').slice(0, 10)
                const rel = ev.kind === 'verification' && ev.verdict?.relative_width != null
                  ? `rel ${ev.verdict.relative_width.toFixed(3)}`
                  : null
                const formal = ev.kind === 'formal' && ev.formalStatus ? ev.formalStatus : null
                return (
                  <div key={ev.id} className="border-b border-line py-3.5 flex items-baseline gap-3">
                    <span className="font-mono2 text-[11px] text-ink-3 shrink-0 w-24">{day}</span>
                    <span className={`border rounded-full px-2 py-0.5 font-mono2 text-[10px] uppercase tracking-wider shrink-0 ${badge.cls}`}>
                      {pickBi(badge.label, lang)}
                    </span>
                    <Link to={`/problems/${ev.problemId}`} className="font-mono2 text-[11px] text-ink-3 shrink-0 hover:underline underline-offset-4">
                      {ev.problemId}
                    </Link>
                    <span className="min-w-0 flex-1 truncate text-sm text-ink">
                      {ev.newBand ? `→ ${ev.newBand}` : ev.title}
                    </span>
                    {rel && <span className="shrink-0 font-mono2 text-[11px] text-ink-3">{rel}</span>}
                    {formal && (
                      <span className="shrink-0 font-mono2 text-[10px] uppercase tracking-wider text-ink-3">{formal}</span>
                    )}
                    <span className="shrink-0 font-mono2 text-[11px] text-ink-3">· {ev.authorName ?? 'anon'}</span>
                  </div>
                )
              })}
            </div>
          )}
          <p className="mt-3 max-w-3xl text-xs text-ink-3 leading-relaxed">{t('tl2.liveNote')}</p>
        </section>
      </Reveal>

      {/* 题目收录（静态） */}
      <Reveal delay={80}>
        <section className="mt-10">
          <h2 className="font-mono2 text-[11px] uppercase tracking-[0.25em] text-ink-3">{t('tl2.added')}</h2>
          <div className="mt-3 border-t border-line">
            {additions.map((p) => (
              <div key={p.id} className="border-b border-line py-3 flex items-baseline gap-3">
                <span className="font-mono2 text-[11px] text-ink-3 shrink-0 w-24">{p.date_added}</span>
                <DomainDot domain={p.domain} />
                <Link to={`/problems/${p.id}`} className="font-mono2 text-[11px] text-ink-3 shrink-0 hover:underline underline-offset-4">
                  {p.id}
                </Link>
                <Link to={`/problems/${p.id}`} className="min-w-0 flex-1 truncate text-sm text-ink hover:underline underline-offset-4 decoration-line-strong">
                  {pickLang({ title: p.title, titleZh: p.titleZh }, lang)}
                </Link>
                <span className="shrink-0 font-mono2 text-[10px] uppercase tracking-wider text-ink-3">{DOMAINS[p.domain].prefix}</span>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* 文献里程碑（静态 progress，年份取自引用） */}
      <Reveal delay={100}>
        <section className="mt-10">
          <div className="flex items-baseline justify-between gap-3 flex-wrap">
            <h2 className="font-mono2 text-[11px] uppercase tracking-[0.25em] text-ink-3">{t('tl2.milestones')}</h2>
            <span className="font-mono2 text-[11px] text-ink-3">{milestones.length}</span>
          </div>
          <div className="mt-3 border-t border-line">
            {milestones.map((m, i) => (
              <div key={`${m.problemId}:${m.year}:${i}`} className="border-b border-line py-3 flex items-baseline gap-3">
                <span className="font-mono2 text-[11px] text-ink-3 shrink-0 w-12">{m.year}</span>
                <span className="font-statement text-[13px] font-bold text-ink shrink-0">{m.label}</span>
                <Link to={`/problems/${m.problemId}`} className="font-mono2 text-[11px] text-ink-3 shrink-0 hover:underline underline-offset-4">
                  {m.problemId}
                </Link>
                <span className="min-w-0 flex-1 truncate text-sm text-ink-2" title={m.note}>{m.note}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 max-w-3xl text-xs text-ink-3 leading-relaxed">{t('tl2.milestoneNote')}</p>
        </section>
      </Reveal>
    </div>
  )
}
