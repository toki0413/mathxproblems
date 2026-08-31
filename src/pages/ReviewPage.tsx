import { useState } from 'react'
import { PROBLEMS, DOMAINS, type Domain } from '@/data/problems'
import { useAuth } from '@/hooks/useAuth'
import { useI18n, pickLang, domainLabel } from '@/i18n'
import { trpc } from '@/providers/trpc'

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

/** 从已通过投稿的 payload 生成一篇 problems.ts 风格的可粘贴对象。
 *  authorName 为投稿者真实名：采纳后 proposer 具名，署名通路的源头可靠。 */
function buildProblemFragment(
  title: string,
  titleZh: string,
  domain: string,
  payload: Record<string, unknown>,
  authorName?: string | null,
): string {
  const asStr = (v: unknown) => (typeof v === 'string' ? v : '')
  const asList = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [])
  const lines = [
    `  {\n` +
      `    id: 'IMPORT-ME',\n` +
      `    judgment: '待填：被认可的答案必须满足什么、如何核验',\n` +
      `    title: ${JSON.stringify(title)},\n` +
      `    titleZh: ${JSON.stringify(titleZh)},\n` +
      `    domain: '${domain}',\n` +
      `    subdomain: ${JSON.stringify(asStr(payload.subdomain))},\n` +
      `    status: 'open',\n` +
      `    difficulty: 'research',\n` +
      `    formalization_potential: 'medium',\n` +
      `    verification_path: 'analytical',\n` +
      `    tags: [],\n` +
      `    contributor: 'community',\n` +
      `    date_added: '${today()}',\n` +
      `    related_problems: [],\n` +
      `    statement: ${JSON.stringify(asStr(payload.statement))},\n` +
      `    origin: ${JSON.stringify(asStr(payload.origin))},\n` +
      `    progress: [],\n` +
      `    obstacles: ${JSON.stringify(asList(payload.obstacles))},\n`,
  ]
  if (asStr(payload.engineeringValue)) lines.push(`    engineering_value: ${JSON.stringify(asStr(payload.engineeringValue))},\n`)
  const impacts = asList(payload.impactDomains)
  if (impacts.length) lines.push(`    impact_domains: ${JSON.stringify(impacts)},\n`)
  lines.push(
    `    formalization_notes: '待填',\n` +
      `    references: ${JSON.stringify(asList(payload.references).map((r) => ({ label: r, url: '' })))},\n` +
      `    proposer: '${authorName?.replace(/'/g, "\\'") || '社区投稿（匿名）'}',\n` +
      `    proposed_year: '${today().slice(0, 4)}',\n` +
      `  },`,
  )
  return lines.join('')
}

export default function ReviewPage() {
  const { lang, t } = useI18n()
  const { user, isAuthenticated } = useAuth()
  const utils = trpc.useUtils()
  const isAdmin = isAuthenticated && user?.role === 'admin'
  const pending = trpc.submissions.pending.useQuery(undefined, { enabled: isAdmin })
  const review = trpc.submissions.review.useMutation({
    onSuccess: () => utils.submissions.pending.invalidate(),
  })
  const [note, setNote] = useState<Record<number, string>>({})

  // attempts review queue
  const atPending = trpc.attempts.pending.useQuery(undefined, { enabled: isAdmin })
  const reviewAttempt = trpc.attempts.review.useMutation({
    onSuccess: () => utils.attempts.pending.invalidate(),
  })
  const [atNote, setAtNote] = useState<Record<number, string>>({})

  // approved submissions → paste-ready problems.ts fragment
  const approved = trpc.submissions.approvedAdmin.useQuery(undefined, { enabled: isAdmin })
  const [copied, setCopied] = useState<Record<string, boolean>>({})
  const copyFragment = (s: NonNullable<typeof approved.data>[number]) => {
    let payload: Record<string, unknown> = {}
    try {
      payload = JSON.parse(s.payload)
    } catch {
      /* ignore */
    }
    navigator.clipboard.writeText(buildProblemFragment(s.title, s.titleZh, s.domain, payload, s.authorName))
    setCopied((c) => ({ ...c, [s.id]: true }))
    setTimeout(() => setCopied((c) => ({ ...c, [s.id]: false })), 1600)
  }

  // problem-update recorder
  const [upId, setUpId] = useState(PROBLEMS[0]?.id ?? '')
  const [upDate, setUpDate] = useState(today())
  const [upNote, setUpNote] = useState('')
  const addUpdate = trpc.updates.record.useMutation({
    onSuccess: () => {
      setUpNote('')
      setUpDate(today())
    },
  })

  if (!isAdmin)
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-ink-3 text-sm">
        {t('rv.adminOnly')}
      </div>
    )

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-statement text-3xl font-bold">{t('rv.title')}</h1>
      <p className="mt-2 text-sm text-ink-3">
        {t('rv.guide')}
      </p>

      {/* problem update recorder */}
      <section className="mt-8 border border-line p-5">
        <h2 className="font-statement text-lg font-semibold">{t('rv.upHeading')}</h2>
        <p className="mt-1 text-sm text-ink-3">{t('rv.upHint')}</p>
        <div className="mt-4 space-y-3">
          <div>
            <div className="font-mono2 text-[11px] uppercase tracking-[0.15em] text-ink-2">
              {t('rv.upProblem')}
            </div>
            <select
              value={upId}
              onChange={(e) => setUpId(e.target.value)}
              className="mt-1 w-full bg-paper border border-line px-3 py-1.5 text-sm focus:outline-none focus:border-ink"
            >
              {PROBLEMS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} · {pickLang(p, lang)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="font-mono2 text-[11px] uppercase tracking-[0.15em] text-ink-2">
              {t('rv.upDate')}
            </div>
            <input
              type="date"
              value={upDate}
              onChange={(e) => setUpDate(e.target.value)}
              className="mt-1 w-full bg-paper border border-line px-3 py-1.5 text-sm focus:outline-none focus:border-ink"
            />
          </div>
          <div>
            <div className="font-mono2 text-[11px] uppercase tracking-[0.15em] text-ink-2">
              {t('rv.upNote')}
            </div>
            <textarea
              value={upNote}
              onChange={(e) => setUpNote(e.target.value)}
              rows={3}
              className="mt-1 w-full bg-paper border border-line px-3 py-1.5 text-sm focus:outline-none focus:border-ink resize-y"
            />
          </div>
          <button
            onClick={() => addUpdate.mutate({ problemId: upId, date: upDate, note: upNote })}
            disabled={addUpdate.isPending || !upNote.trim()}
            className="border border-mc text-mc px-4 py-1.5 text-sm hover:bg-mc hover:text-paper transition-colors disabled:opacity-40"
          >
            {addUpdate.isSuccess ? t('rv.upDone') : t('rv.upSubmit')}
          </button>
        </div>
      </section>

      {/* attempts review queue */}
      <section className="mt-8 border border-line p-5">
        <h2 className="font-statement text-lg font-semibold">{t('rv.atHeading')}</h2>
        <p className="mt-1 text-sm text-ink-3">{t('rv.atHint')}</p>
        <div className="mt-4 space-y-4">
          {(atPending.data ?? []).map((a) => (
            <article key={a.id} className="border border-line p-4">
              <div className="font-mono2 text-[11px] uppercase tracking-[0.15em] text-ink-3">
                #{a.id} · {a.problemId} · {a.kind} ·{' '}
                {t('rv.atBy')} {new Date(a.createdAt).toISOString().slice(0, 10)}
              </div>
              <h3 className="font-statement text-base font-semibold mt-1">{a.title}</h3>
              {a.kind === 'verification' && a.newBand && (
                <div className="mt-1 font-mono2 text-sm text-mc">
                  {t('pd.attempts.band')}：{a.newBand}
                </div>
              )}
              <p className="mt-1 text-sm whitespace-pre-wrap leading-relaxed text-ink-2">{a.content}</p>
              {a.narrative && (
                <div className="mt-2 border-l-2 border-[#9a5b13]/50 bg-[#9a5b13]/5 px-3 py-2">
                  <div className="font-mono2 text-[10px] uppercase tracking-[0.15em] text-[#9a5b13] mb-1">
                    {t('pd.attempts.narrative.label')}
                  </div>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed text-ink-2">{a.narrative}</p>
                </div>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <input
                  className="flex-1 min-w-48 bg-paper border border-line px-3 py-1.5 text-sm focus:outline-none focus:border-ink"
                  placeholder={t('rv.placeholder')}
                  value={atNote[a.id] ?? ''}
                  onChange={(e) => setAtNote((n) => ({ ...n, [a.id]: e.target.value }))}
                />
                <button
                  onClick={() => reviewAttempt.mutate({ id: a.id, status: 'approved', reviewerNote: atNote[a.id] })}
                  className="border border-mc text-mc px-4 py-1.5 text-sm hover:bg-mc hover:text-paper transition-colors"
                >
                  {t('rv.approve')}
                </button>
                <button
                  onClick={() => reviewAttempt.mutate({ id: a.id, status: 'rejected', reviewerNote: atNote[a.id] })}
                  className="border border-me text-me px-4 py-1.5 text-sm hover:bg-me hover:text-paper transition-colors"
                >
                  {t('rv.reject')}
                </button>
              </div>
            </article>
          ))}
          {(atPending.data ?? []).length === 0 && (
            <p className="text-sm text-ink-3">{t('rv.atEmpty')}</p>
          )}
        </div>
      </section>

      {/* approved submissions → import fragments */}
      {(approved.data ?? []).length > 0 && (
        <section className="mt-8 border border-line p-5">
          <h2 className="font-statement text-lg font-semibold">{t('rv.importHeading')}</h2>
          <p className="mt-1 text-sm text-ink-3">{t('rv.importHint')}</p>
          <div className="mt-4 space-y-3">
            {(approved.data ?? []).map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-4 border border-line px-4 py-3">
                <span className="font-mono2 text-sm text-ink-2">{s.id} · {pickLang(s, lang)}</span>
                <button
                  onClick={() => copyFragment(s)}
                  className="border border-mc text-mc px-4 py-1.5 text-sm hover:bg-mc hover:text-paper transition-colors"
                >
                  {copied[s.id] ? t('rv.importCopied') : t('rv.importBtn')}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="mt-8 space-y-8">
        {(pending.data ?? []).map((s) => {
          let payload: Record<string, unknown> = {}
          try {
            payload = JSON.parse(s.payload)
          } catch {
            /* ignore */
          }
          return (
            <article key={s.id} className="border border-line p-5">
              <div className="font-mono2 text-[11px] uppercase tracking-[0.15em] text-ink-3">
                #{s.id} · {DOMAINS[s.domain as Domain] ? domainLabel(DOMAINS[s.domain as Domain], lang) : ''} ·{' '}
                {new Date(s.createdAt).toISOString().slice(0, 10)}
              </div>
              <h2 className="font-statement text-xl font-semibold mt-1">{s.titleZh}</h2>
              <div className="text-sm text-ink-3">{s.title}</div>
              <dl className="mt-4 space-y-3 text-sm leading-relaxed">
                {(['statement', 'origin', 'engineeringValue', 'note'] as const).map((k) =>
                  payload[k] ? (
                    <div key={k}>
                      <dt className="font-mono2 text-[11px] uppercase tracking-[0.15em] text-ink-2">{k}</dt>
                      <dd className="mt-1 whitespace-pre-wrap text-ink-2">{String(payload[k])}</dd>
                    </div>
                  ) : null,
                )}
                {Array.isArray(payload.obstacles) && (
                  <div>
                    <dt className="font-mono2 text-[11px] uppercase tracking-[0.15em] text-ink-2">obstacles</dt>
                    <dd className="mt-1 text-ink-2">
                      {(payload.obstacles as string[]).map((o, i) => (
                        <div key={i}>· {o}</div>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <input
                  className="flex-1 min-w-48 bg-paper border border-line px-3 py-1.5 text-sm focus:outline-none focus:border-ink"
                  placeholder={t('rv.placeholder')}
                  value={note[s.id] ?? ''}
                  onChange={(e) => setNote((n) => ({ ...n, [s.id]: e.target.value }))}
                />
                <button
                  onClick={() => review.mutate({ id: s.id, status: 'approved', reviewerNote: note[s.id] })}
                  className="border border-mc text-mc px-4 py-1.5 text-sm hover:bg-mc hover:text-paper transition-colors"
                >
                  {t('rv.approve')}
                </button>
                <button
                  onClick={() => review.mutate({ id: s.id, status: 'rejected', reviewerNote: note[s.id] })}
                  className="border border-me text-me px-4 py-1.5 text-sm hover:bg-me hover:text-paper transition-colors"
                >
                  {t('rv.reject')}
                </button>
              </div>
            </article>
          )
        })}
        {pending.data?.length === 0 && (
          <p className="text-sm text-ink-3">{t('rv.empty')}</p>
        )}
      </div>
    </div>
  )
}
