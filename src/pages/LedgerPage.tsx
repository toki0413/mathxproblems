import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { PROBLEMS } from '@/data/problems'
import { Reveal } from '@/components/Reveal'
import { useI18n } from '@/i18n'

type Verdict = {
  parseable: boolean
  relative_width: number | null
  within_vacuous: boolean | null
  within_info_gate: boolean | null
  info_gate_threshold: number
  note: string | null
}

type LedgerEvent = {
  id: number
  problemId: string
  kind: 'verification' | 'formal'
  title: string
  content: string
  narrative?: string | null
  authorName?: string | null
  newBand?: string | null
  formalStatus?: string | null
  method?: string | null
  createdAt: string
  bits: number | null
  contentHash: string
  verdict: Verdict | null
}

type Ledger = {
  contract: string
  generated: string
  append_only: boolean
  count: number
  verifier: string
  events: LedgerEvent[]
}

// 核验判定徽章配色：绿=可核验且通过闸门，琥珀=可核验但在信息量门槛之上，红=空洞或不可解析，灰=无判定。
function verdictBadge(v: Verdict | null): { cls: string; label: string } | null {
  if (!v) return null
  if (!v.parseable) return { cls: 'text-me border-me/50', label: 'unparseable' }
  if (!v.within_vacuous) return { cls: 'text-me border-me/50', label: 'vacuous' }
  if (v.within_info_gate) return { cls: 'text-mc border-mc/50', label: 'non-vacuous' }
  return { cls: 'text-[#9a5b13] border-[#9a5b13]/40', label: 'above-gate' }
}

export default function LedgerPage() {
  const { t } = useI18n()
  const [ledger, setLedger] = useState<Ledger | null>(null)
  const [err, setErr] = useState(false)
  const [copied, setCopied] = useState<number | null>(null)

  useEffect(() => {
    let alive = true
    fetch('/api/v1/ledger.json')
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => alive && setLedger(d))
      .catch(() => alive && setErr(true))
    return () => {
      alive = false
    }
  }, [])

  const byId = useMemo(() => new Map(PROBLEMS.map((p) => [p.id, p])), [])
  const evs = ledger?.events ?? []

  const copyHash = (id: number, hash: string) => {
    navigator.clipboard.writeText(hash)
    setCopied(id)
    setTimeout(() => setCopied(null), 1600)
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-14">
      <Reveal>
        <h1 className="font-statement text-4xl md:text-5xl font-bold tracking-tight">{t('lg.title')}</h1>
        <p className="mt-6 max-w-2xl text-ink-2 leading-relaxed">{t('lg.subtitle')}</p>
      </Reveal>

      {/* 契约横幅 */}
      <Reveal delay={60}>
        <div className="mt-8 border border-line bg-white/50 p-5">
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <dt className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-ink-3">{t('lg.contract')}</dt>
              <dd className="mt-1 font-mono2 text-mc">{ledger?.contract ?? 'v0.1'}</dd>
            </div>
            <div>
              <dt className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-ink-3">{t('lg.append')}</dt>
              <dd className="mt-1 font-mono2">{ledger ? (ledger.append_only ? 'yes' : 'no') : '—'}</dd>
            </div>
            <div>
              <dt className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-ink-3">{t('lg.events')}</dt>
              <dd className="mt-1 font-mono2">{ledger ? ledger.count : '…'}</dd>
            </div>
            <div>
              <dt className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-ink-3">{t('lg.verifier')}</dt>
              <dd className="mt-1 font-mono2 text-[11px] text-ink-3">{t('lg.verifier.note')}</dd>
            </div>
          </dl>
        </div>
      </Reveal>

      {err ? (
        <Reveal>
          <p className="mt-10 text-sm text-me">{t('lg.error')}</p>
        </Reveal>
      ) : evs.length === 0 ? (
        <Reveal>
          <div className="mt-12 border border-dashed border-line-strong p-10 text-center">
            <div className="font-statement text-lg font-semibold text-ink-2">{t('lg.empty.title')}</div>
            <p className="mt-2 text-sm text-ink-3 max-w-md mx-auto">{t('lg.empty.body')}</p>
          </div>
        </Reveal>
      ) : (
        <div className="mt-10 space-y-4">
          {evs.map((ev) => {
            const p = byId.get(ev.problemId)
            const badge = verdictBadge(ev.verdict)
            return (
              <Reveal key={ev.id}>
                <article className="border border-line bg-white/50 p-5">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-mono2 text-[11px] text-ink-3">#{ev.id}</span>
                    <Link
                      to={`/problems/${ev.problemId}`}
                      className="font-mono2 text-[11px] text-ink-2 hover:text-ink underline decoration-line-strong underline-offset-4"
                    >
                      {ev.problemId}
                    </Link>
                    {p && <span className="max-w-[16rem] truncate text-[11px] text-ink-3">{p.title}</span>}
                    <span
                      className={`rounded-full border px-2 py-px font-mono2 text-[10px] uppercase tracking-wider ${
                        ev.kind === 'verification' ? 'text-mc border-mc/50' : 'text-[#2563eb] border-[#2563eb]/50'
                      }`}
                    >
                      {ev.kind}
                    </span>
                    {badge && (
                      <span className={`rounded-full border px-2 py-px font-mono2 text-[10px] uppercase tracking-wider ${badge.cls}`}>
                        {t(`lg.v.${badge.label}`)}
                      </span>
                    )}
                    {typeof ev.bits === 'number' && (
                      <span className="font-mono2 text-[10px] text-ink-3">
                        {t('lg.bits')} {ev.bits.toFixed(2)}
                      </span>
                    )}
                    <span className="flex-1" />
                    <span className="font-mono2 text-[11px] text-ink-3">
                      {t('lg.by')} {ev.authorName || 'anonymous'}
                    </span>
                  </div>

                  <h3 className="font-statement text-base font-semibold mt-3">{ev.title}</h3>

                  {/* 带证区间 + 核验判定 */}
                  {ev.kind === 'verification' && ev.newBand && (
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      <div className="border border-line p-3">
                        <div className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-ink-3">{t('lg.band')}</div>
                        <div className="mt-1 font-mono2 text-sm text-mc">{ev.newBand}</div>
                      </div>
                      {ev.verdict && (
                        <div className="border border-line p-3">
                          <div className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-ink-3">{t('lg.verdict.title')}</div>
                          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-ink-2">
                            <span>
                              {t('lg.verdict.relative')}{' '}
                              {ev.verdict.relative_width === null ? '—' : ev.verdict.relative_width.toFixed(4)}
                            </span>
                            <span>
                              {t('lg.verdict.info')}{' '}
                              {ev.verdict.within_info_gate ? '≤' : '>'} {ev.verdict.info_gate_threshold}
                            </span>
                            {ev.verdict.note && <span className="w-full text-me">{ev.verdict.note}</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {ev.kind === 'formal' && ev.formalStatus && (
                    <div className="mt-3">
                      <span className="rounded-full border border-[#2563eb]/50 text-[#2563eb] px-2.5 py-0.5 font-mono2 text-[11px] uppercase tracking-wider">
                        {ev.formalStatus}
                      </span>
                    </div>
                  )}

                  <p className="mt-3 text-sm text-ink-2 leading-relaxed whitespace-pre-wrap line-clamp-4">{ev.content}</p>

                  {/* 证据哈希 */}
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3">
                    <span className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-ink-3">{t('lg.hash')}</span>
                    <code className="font-mono2 text-xs text-ink-2">{ev.contentHash}</code>
                    <button
                      onClick={() => copyHash(ev.id, ev.contentHash)}
                      className="rounded-full border border-line-strong px-2.5 py-0.5 font-mono2 text-[10px] text-ink-2 hover:border-ink hover:text-ink transition-colors"
                    >
                      {copied === ev.id ? t('lg.copied') : t('lg.copy')}
                    </button>
                    <span className="font-mono2 text-[10px] text-ink-3 ml-auto">{new Date(ev.createdAt).toISOString().slice(0, 10)}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-ink-3">{t('lg.hash.note')}</p>
                </article>
              </Reveal>
            )
          })}
        </div>
      )}

      {/* 如何复核 */}
      <Reveal>
        <div className="mt-10 border border-line bg-white/50 p-5">
          <h2 className="font-statement text-base font-semibold">{t('lg.verify.title')}</h2>
          <p className="mt-2 text-sm text-ink-2 leading-relaxed max-w-2xl">{t('lg.verify.body')}</p>
          <div className="mt-3 font-mono2 text-xs text-ink-3 break-all">
            <code>node scripts/check-ledger.mjs https://mathx-bridge.pages.dev</code>
          </div>
        </div>
      </Reveal>
    </div>
  )
}
