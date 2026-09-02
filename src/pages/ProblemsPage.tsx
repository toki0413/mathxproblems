import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import Fuse from 'fuse.js'
import { AUDITED_PROBLEMS } from '@/data/audits'
import {
  DOMAINS,
  ALL_IMPACT_DOMAINS,
  ALL_DELIVERABLES,
  impactOf,
  deliverablesOf,
  type Domain,
  type FormalizationPotential,
  type VerificationPath,
  type ProblemStatus,
  type OutputKind,
} from '@/data/problems'
import { ProblemRow } from '@/components/ProblemRow'
import { Reveal } from '@/components/Reveal'
import { useI18n, enumLabel, pickLang, domainLabel } from '@/i18n'
import { trpc } from '@/providers/trpc'

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1 text-xs transition-colors ${
        active
          ? 'bg-ink text-paper border-ink'
          : 'border-line-strong text-ink-2 hover:border-ink hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

export default function ProblemsPage() {
  const { lang, t } = useI18n()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const domain = (params.get('domain') ?? '') as Domain | ''
  const potential = (params.get('potential') ?? '') as FormalizationPotential | ''
  const verification = (params.get('verification') ?? '') as VerificationPath | ''
  const status = (params.get('status') ?? '') as ProblemStatus | ''
  const output = (params.get('output') ?? '') as OutputKind | ''
  const impact = params.get('impact') ?? ''
  const deliverable = params.get('deliverable') ?? ''
  const approved = trpc.submissions.approved.useQuery(undefined, { retry: false })

  const setParam = (k: string, v: string) => {
    const next = new URLSearchParams(params)
    if (v) next.set(k, v)
    else next.delete(k)
    setParams(next, { replace: true })
  }

  const fuse = useMemo(
    () =>
      new Fuse(AUDITED_PROBLEMS, {
        keys: ['title', 'titleZh', 'tags', 'subdomain', 'statement'],
        threshold: 0.32,
        ignoreLocation: true,
      }),
    [],
  )

  const filtered = useMemo(() => {
    let list = query ? fuse.search(query).map((r) => r.item) : AUDITED_PROBLEMS
    if (domain) list = list.filter((p) => p.domain === domain)
    if (potential) list = list.filter((p) => p.formalization_potential === potential)
    if (verification) list = list.filter((p) => p.verification_path === verification)
    if (status) list = list.filter((p) => p.status === status)
    if (output) list = list.filter((p) => p.output === output)
    if (impact) list = list.filter((p) => impactOf(p).includes(impact))
    if (deliverable) list = list.filter((p) => deliverablesOf(p).includes(deliverable))
    return list
  }, [query, domain, potential, verification, status, output, impact, deliverable, fuse])

  const label = (kind: 'potential' | 'verification', v: string) => enumLabel(lang, kind, v)

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <Reveal>
        <h1 className="font-statement text-4xl md:text-5xl font-bold tracking-tight">{t('pl.title')}</h1>
        <p className="mt-4 max-w-2xl text-ink-2">
          {t('pl.subtitle')}
        </p>
      </Reveal>

      {/* 审计展示门说明：只有通过审计的问题在此展示 */}
      <Reveal delay={40}>
        <p className="mt-5 border border-line bg-white/50 px-4 py-3 text-xs text-ink-2 leading-relaxed">
          {lang === 'zh' ? (
            <>
              展示 {AUDITED_PROBLEMS.length} 道已通过审计的问题。未通过的条目已从公共展示中撤下，
              原因记录在审计表中，供人复核升级（<code className="font-mono2">src/data/audits.ts</code>）。
            </>
          ) : (
            <>
              Showing {AUDITED_PROBLEMS.length} problems that passed the audit gate. Flagged entries
              are withheld from public display; their reasons remain on the audit record for review and
              upgrade (<code className="font-mono2">src/data/audits.ts</code>).
            </>
          )}
        </p>
      </Reveal>

      <div className="mt-10 space-y-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('pl.search')}
          className="w-full bg-transparent border-b border-line-strong focus:border-ink outline-none py-3 text-lg font-statement placeholder:text-ink-3 placeholder:font-sans placeholder:text-sm transition-colors"
        />
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono2 text-[11px] uppercase tracking-[0.18em] text-ink-3 mr-1">{t('pl.domain')}</span>
          <Pill active={!domain} onClick={() => setParam('domain', '')}>{t('pl.all')}</Pill>
          {(Object.keys(DOMAINS) as Domain[]).map((d) => (
            <Pill key={d} active={domain === d} onClick={() => setParam('domain', domain === d ? '' : d)}>
              {domainLabel(DOMAINS[d], lang)}
            </Pill>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono2 text-[11px] uppercase tracking-[0.18em] text-ink-3 mr-1">{t('pl.potential')}</span>
          <Pill active={!potential} onClick={() => setParam('potential', '')}>{t('pl.all')}</Pill>
          {(['high', 'medium', 'low'] as const).map((v) => (
            <Pill key={v} active={potential === v} onClick={() => setParam('potential', potential === v ? '' : v)}>
              {label('potential', v)}
            </Pill>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono2 text-[11px] uppercase tracking-[0.18em] text-ink-3 mr-1">{t('pl.verify')}</span>
          <Pill active={!verification} onClick={() => setParam('verification', '')}>{t('pl.all')}</Pill>
          {(['analytical', 'numerical'] as const).map((v) => (
            <Pill key={v} active={verification === v} onClick={() => setParam('verification', verification === v ? '' : v)}>
              {label('verification', v)}
            </Pill>
          ))}
          <span className="text-line mx-1 hidden sm:inline">|</span>
          <select
            value={impact}
            onChange={(e) => setParam('impact', e.target.value)}
            className="bg-transparent border border-line rounded-full px-3 py-1 text-xs text-ink-2 focus:outline-none focus:border-ink"
          >
            <option value="">{t('pl.impactAll')}</option>
            {ALL_IMPACT_DOMAINS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        {/* 方向四：工程交付物反向索引——从交付物出发找到支撑它的带证问题 */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono2 text-[11px] uppercase tracking-[0.18em] text-ink-3 mr-1">
            {t('pl.deliverable')}
          </span>
          <select
            value={deliverable}
            onChange={(e) => setParam('deliverable', e.target.value)}
            className="bg-transparent border border-line rounded-full px-3 py-1 text-xs text-ink-2 focus:outline-none focus:border-ink"
          >
            <option value="">{t('pl.deliverableAll')}</option>
            {ALL_DELIVERABLES.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        {ALL_DELIVERABLES.length > 0 && (
          <p className="mt-1 text-xs text-ink-3">{t('pl.deliverableHint')}</p>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono2 text-[11px] uppercase tracking-[0.18em] text-ink-3 mr-1">{t('pl.output')}</span>
          <Pill active={!output} onClick={() => setParam('output', '')}>{t('pl.all')}</Pill>
          {(['verified_behavior', 'verified_truth', 'scaffolding'] as const).map((v) => (
            <Pill key={v} active={output === v} onClick={() => setParam('output', output === v ? '' : v)}>
              {enumLabel(lang, 'output', v)}
            </Pill>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono2 text-[11px] uppercase tracking-[0.18em] text-ink-3 mr-1">{t('pl.status')}</span>
          <Pill active={!status} onClick={() => setParam('status', '')}>{t('pl.all')}</Pill>
          {(['open', 'partial', 'resolved'] as const).map((v) => (
            <Pill key={v} active={status === v} onClick={() => setParam('status', status === v ? '' : v)}>
              {enumLabel(lang, 'status', v)}
            </Pill>
          ))}
        </div>
      </div>

      <div className="mt-10 flex items-baseline justify-between">
        <span className="font-mono2 text-xs text-ink-3">
          {filtered.length} / {AUDITED_PROBLEMS.length} {t('pl.count')}
        </span>
      </div>
      <div className="mt-2 hairline-t">
        {filtered.map((p) => (
          <ProblemRow key={p.id} p={p} index={AUDITED_PROBLEMS.indexOf(p)} />
        ))}
        {filtered.length === 0 && (
          <p className="py-16 text-center text-ink-3">
            {t('pl.noMatch')}
          </p>
        )}
      </div>

      {approved.data && approved.data.length > 0 && (
        <section className="mt-16">
          <div className="flex items-baseline justify-between">
            <h2 className="font-statement text-2xl font-bold">{t('pl.community')}</h2>
            <span className="font-mono2 text-[11px] text-ink-3 uppercase tracking-[0.15em]">
              {t('pl.comm.tag')}
            </span>
          </div>
          <div className="mt-4 divide-y divide-line border-t border-b border-line">
            {approved.data.map((s) => (
              <div key={s.id} className="py-4 flex items-baseline gap-4">
                <span className="font-mono2 text-[11px] text-ink-3 shrink-0 w-16">C-{s.id}</span>
                <div className="min-w-0">
                  <div className="font-statement font-semibold leading-snug">
                    {pickLang(s, lang)}
                  </div>
                  <div className="font-mono2 text-[11px] text-ink-3 mt-1">
                    {DOMAINS[s.domain as Domain] ? domainLabel(DOMAINS[s.domain as Domain], lang) : ''}
                    {s.authorName && (
                      <> · {t('pl.contrib.by')} {s.authorName}</>
                    )}
                    {' · '}
                    {new Date(s.createdAt).toISOString().slice(0, 10)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-ink-3">
            {t('pl.comm.ctaPre')}
            <Link to="/submit" className="underline underline-offset-4">{t('pl.comm.ctaLink')}</Link>
            {t('pl.comm.ctaEnd')}
          </p>
        </section>
      )}

      {approved.data && approved.data.length === 0 && (
        <section className="mt-16 border border-dashed border-line p-6">
          <h2 className="font-statement text-2xl font-bold">{t('pl.community')}</h2>
          <p className="mt-2 text-sm text-ink-2">
            {t('pl.comm.invite')}{' '}
            <Link to="/submit" className="underline underline-offset-4">{t('pl.comm.ctaLink')}</Link>
          </p>
        </section>
      )}
    </div>
  )
}
