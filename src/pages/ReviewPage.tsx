import { useState } from 'react'
import { PROBLEMS, DOMAINS, type Domain } from '@/data/problems'
import { useAuth } from '@/hooks/useAuth'
import { useI18n, pickLang, domainLabel } from '@/i18n'
import { trpc } from '@/providers/trpc'

function today(): string {
  return new Date().toISOString().slice(0, 10)
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
