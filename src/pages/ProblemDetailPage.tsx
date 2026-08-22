import { Link, useParams } from 'react-router'
import { useState } from 'react'
import { PROBLEMS, DOMAINS, RELATION_LABELS, impactOf, relatedOf } from '@/data/problems'
import { Markdown } from '@/components/Markdown'
import { ProblemGraph } from '@/components/ProblemGraph'
import { Stars } from '@/components/ProblemRow'
import { Comments } from '@/components/Comments'
import { useI18n, enumLabel, pickLang, domainLabel } from '@/i18n'
import { useAuth } from '@/hooks/useAuth'
import { trpc } from '@/providers/trpc'

/** 把 "**标题**: 正文" 格式的条目拆成结构化 {head, body} */
function splitEntry(s: string): { head: string; body: string } {
  const m = s.match(/^\*\*(.+?)\*\*:?\s*([\s\S]*)$/)
  if (m) return { head: m[1], body: m[2] }
  return { head: '', body: s }
}

/** 从条目标题中提取年份（若有），用于时间线排序标注 */
function extractYear(s: string): string | null {
  const m = s.match(/\b(19|20)\d{2}\b/)
  return m ? m[0] : null
}

function Meta({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5 hairline-b text-sm">
      <span className="font-mono2 text-[11px] uppercase tracking-[0.15em] text-ink-3 shrink-0">{k}</span>
      <span className="text-right text-ink-2">{v}</span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="font-mono2 text-[11px] uppercase tracking-[0.25em] text-ink-3 mb-4">{title}</h2>
      {children}
    </section>
  )
}

export default function ProblemDetailPage() {
  const { id } = useParams()
  const { lang, t } = useI18n()
  const p = PROBLEMS.find((x) => x.id === id)
  const [copied, setCopied] = useState(false)
  const { isAuthenticated } = useAuth()
  const dbUpdates = trpc.updates.byProblem.useQuery({ problemId: id ?? '' })
  const attempts = trpc.attempts.approved.useQuery({ problemId: id ?? '' })
  const [atKind, setAtKind] = useState<'progress' | 'solution' | 'revision'>('progress')
  const [atTitle, setAtTitle] = useState('')
  const [atContent, setAtContent] = useState('')
  const submitAttempt = trpc.attempts.submit.useMutation({
    onSuccess: () => {
      setAtTitle('')
      setAtContent('')
    },
  })

  // 把目录静态更新与后台录入的更新合并，按日期倒序展示
  const updates = [
    ...(p?.updates ?? []).map((u) => ({ date: u.date, note: u.note, author: undefined as string | undefined })),
    ...(dbUpdates.data ?? []).map((u) => ({ date: u.date, note: u.note, author: u.authorName ?? undefined })),
  ].sort((a, b) => b.date.localeCompare(a.date))

  if (!p) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-24 text-center">
        <p className="font-statement text-2xl">{t('pd.notFound')}</p>
        <Link to="/problems" className="mt-4 inline-block text-ink-2 underline underline-offset-4">
          {t('pd.back')}
        </Link>
      </div>
    )
  }

  const related = relatedOf(p)
    .map((r) => ({ ...r, target: PROBLEMS.find((q) => q.id === r.id) }))
    .filter((r) => r.target)

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <Link to="/problems" className="font-mono2 text-xs text-ink-3 hover:text-ink">
        ← 问题库
      </Link>

      <div className="mt-8 grid lg:grid-cols-[1fr_19rem] gap-14">
        <article>
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className="font-mono2 text-[11px] uppercase tracking-[0.2em] px-2.5 py-1 rounded-full text-white"
              style={{ background: DOMAINS[p.domain].color }}
            >
              {p.id}
            </span>
            <span className="font-mono2 text-xs uppercase tracking-[0.18em] text-ink-3">
              {domainLabel(DOMAINS[p.domain], lang)}
            </span>
            <span className="font-mono2 text-xs text-ink-3 border border-line rounded-full px-2.5 py-1">
              {enumLabel(lang, 'status', p.status)}
            </span>
          </div>
          <h1 className="mt-5 font-statement text-3xl md:text-4xl font-bold leading-tight tracking-tight">
            {pickLang(p, lang)}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 font-mono2 text-xs text-ink-3">
            <Stars difficulty={p.difficulty} />
            <span>{t('pd.verified')} {p.last_verified ?? p.date_added}</span>
          </div>

          <Section title={t('pd.statement')}>
            <Markdown>{p.statement}</Markdown>
          </Section>

          {p.judgment && (
            <Section title={t('pd.judgment')}>
              <div
                className="bg-[#f2f0e8] p-5 border border-line"
                style={{ borderLeftWidth: 3, borderLeftColor: DOMAINS[p.domain].color }}
              >
                <p className="font-statement leading-[1.9] text-ink-2">{p.judgment}</p>
              </div>
            </Section>
          )}

          <Section title={t('pd.origin')}>
            <p className="font-statement leading-[1.9] text-ink-2">{p.origin}</p>
          </Section>

          <Section title={t('pd.progress')}>
            <div className="relative pl-6">
              <span className="absolute left-[5px] top-2 bottom-2 w-px bg-[var(--line-strong)]" />
              <ul className="space-y-5">
                {p.progress.map((s, i) => {
                  const { head, body } = splitEntry(s)
                  const year = extractYear(s)
                  return (
                    <li key={i} className="relative">
                      <span
                        className="absolute -left-6 top-[7px] h-[11px] w-[11px] rounded-full border-2 bg-paper"
                        style={{ borderColor: DOMAINS[p.domain].color }}
                      />
                      <div className="flex items-baseline gap-3 flex-wrap">
                        {year && (
                          <span className="font-mono2 text-xs text-ink-3">{year}</span>
                        )}
                        {head && (
                          <span className="font-statement font-bold text-ink md-inline">
                            <Markdown>{head}</Markdown>
                          </span>
                        )}
                      </div>
                      <div className="font-statement leading-[1.85] text-ink-2 mt-1">
                        <Markdown>{body || s}</Markdown>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          </Section>

          <Section title={t('pd.obstacles')}>
            <div className="space-y-3">
              {p.obstacles.map((s, i) => {
                const { head, body } = splitEntry(s)
                return (
                  <div
                    key={i}
                    className="border border-line bg-white/50 p-5"
                    style={{ borderLeftWidth: 3, borderLeftColor: DOMAINS[p.domain].color }}
                  >
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono2 text-[11px] text-ink-3 shrink-0">
                        {t('pd.obstacle.no')} {String(i + 1).padStart(2, '0')}
                      </span>
                      {head && (
                        <span className="font-statement font-bold text-ink md-inline">
                          <Markdown>{head}</Markdown>
                        </span>
                      )}
                    </div>
                    <div className="font-statement leading-[1.85] text-ink-2 mt-2">
                      <Markdown>{body || s}</Markdown>
                    </div>
                  </div>
                )
              })}
            </div>
          </Section>

          {p.engineering_value && (
            <Section title={t('pd.engineering')}>
              <p className="font-statement leading-[1.9] text-ink-2">{p.engineering_value}</p>
            </Section>
          )}

          {impactOf(p).length > 0 && (
            <Section title={t('pd.impact')}>
              <div className="flex flex-wrap gap-2">
                {impactOf(p).map((d) => (
                  <Link
                    key={d}
                    to={`/problems?impact=${encodeURIComponent(d)}`}
                    className="border border-line rounded-full px-3.5 py-1.5 text-sm text-ink-2 hover:border-ink hover:text-ink transition-colors"
                  >
                    {d}
                  </Link>
                ))}
              </div>
              <p className="mt-3 text-xs text-ink-3 leading-relaxed">
                {lang === 'zh'
                  ? '点击影响领域可查看传导至同一工程/技术方向的全部问题。'
                  : 'Click an impact domain to see every problem translating into the same engineering direction.'}
              </p>
            </Section>
          )}

          <Section title={t('pd.formalization')}>
            <div className="bg-[#f2f0e8] p-5 border border-line">
              <p className="font-statement leading-[1.9] text-ink-2">{p.formalization_notes}</p>
            </div>
          </Section>

          <Section title={t('pd.references')}>
            <ul className="space-y-2.5 text-sm">
              {p.references.map((r, i) => (
                <li key={i}>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-ink-2 underline decoration-line-strong underline-offset-4 hover:decoration-ink"
                  >
                    {r.label}
                  </a>
                </li>
              ))}
            </ul>
          </Section>

          {related.length > 0 && (
            <Section title={t('pd.related')}>
              <ul className="space-y-0">
                {related.map((r) => (
                  <li key={r.id}>
                    <Link
                      to={`/problems/${r.id}`}
                      className="flex items-baseline gap-4 py-3 hairline-b group"
                    >
                      <span className="font-mono2 text-xs text-ink-3 uppercase w-16 shrink-0">{r.id}</span>
                      <span className="flex-1 min-w-0">
                        <span className="block truncate text-ink group-hover:underline underline-offset-4">
                          {r.target!.title}
                        </span>
                        <span className="block text-xs text-ink-3 mt-0.5">{r.note}</span>
                      </span>
                      <span className="font-mono2 text-[11px] text-ink-3 shrink-0">
                        {RELATION_LABELS[r.relation]}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <ProblemGraph height={300} focusId={p.id} />
              </div>
            </Section>
          )}

          {updates.length > 0 && (
            <Section title={t('pd.updates')}>
              <ul className="relative pl-6 space-y-4">
                <span className="absolute left-[5px] top-2 bottom-2 w-px bg-[var(--line-strong)]" />
                {updates.map((u, i) => (
                  <li key={`${u.date}-${i}`} className="relative">
                    <span className="absolute -left-6 top-[7px] h-[11px] w-[11px] rounded-full border-2 bg-paper" style={{ borderColor: DOMAINS[p.domain].color }} />
                    <span className="font-mono2 text-xs text-ink-3">{u.date}</span>
                    {u.author && <span className="font-mono2 text-xs text-ink-3 ml-2">· {u.author}</span>}
                    <p className="font-statement text-ink-2 leading-relaxed mt-1">{u.note}</p>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <Section title={t('pd.comments')}>
            <Comments term={`${p.id} ${p.title}`} />
          </Section>

          <Section title={t('pd.attempts')}>
            <p className="text-sm text-ink-3 mb-4">{t('pd.attempts.pendingNote')}</p>
            <div className="space-y-4">
              {(attempts.data ?? []).length === 0 && (
                <p className="border border-dashed border-line-strong p-5 text-sm text-ink-3 leading-relaxed">
                  {t('pd.attempts.empty')}
                </p>
              )}
              {attempts.data?.map((a) => (
                <article key={a.id} className="border border-line p-5" style={{ borderLeftWidth: 3, borderLeftColor: DOMAINS[p.domain].color }}>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono2 text-[11px] uppercase tracking-[0.15em] text-ink-3">
                      {enumLabel(lang, 'attemptKind', a.kind)}
                    </span>
                    {a.authorName && (
                      <span className="font-mono2 text-[11px] text-ink-3">· {t('pd.attempts.by')} {a.authorName}</span>
                    )}
                    <span className="font-mono2 text-[11px] text-ink-3">· {new Date(a.createdAt).toISOString().slice(0, 10)}</span>
                  </div>
                  <h3 className="font-statement font-semibold mt-2">{a.title}</h3>
                  <div className="font-statement text-ink-2 leading-relaxed mt-1">
                    <Markdown>{a.content}</Markdown>
                  </div>
                </article>
              ))}
            </div>

            {isAuthenticated ? (
              <div className="mt-6 border border-line bg-white/50 p-5 space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="font-mono2 text-[11px] uppercase tracking-[0.15em] text-ink-2">
                    {t('pd.attempts.kind')}
                  </div>
                  {(['progress', 'solution', 'revision'] as const).map((k) => (
                    <button
                      key={k}
                      onClick={() => setAtKind(k)}
                      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                        atKind === k ? 'bg-ink text-paper border-ink' : 'border-line-strong text-ink-2 hover:border-ink'
                      }`}
                    >
                      {t(`pd.attempts.kind.${k}`)}
                    </button>
                  ))}
                </div>
                <input
                  value={atTitle}
                  onChange={(e) => setAtTitle(e.target.value)}
                  placeholder={t('pd.attempts.title')}
                  className="w-full bg-paper border border-line px-3 py-1.5 text-sm focus:outline-none focus:border-ink"
                />
                <textarea
                  value={atContent}
                  onChange={(e) => setAtContent(e.target.value)}
                  rows={4}
                  placeholder={t('pd.attempts.content')}
                  className="w-full bg-paper border border-line px-3 py-1.5 text-sm focus:outline-none focus:border-ink resize-y"
                />
                <button
                  onClick={() =>
                    submitAttempt.mutate({ problemId: p.id, kind: atKind, title: atTitle, content: atContent })
                  }
                  disabled={submitAttempt.isPending || !atTitle.trim() || !atContent.trim()}
                  className="border border-mc text-mc px-4 py-1.5 text-sm hover:bg-mc hover:text-paper transition-colors disabled:opacity-40"
                >
                  {submitAttempt.isSuccess ? t('pd.attempts.sent') : t('pd.attempts.send')}
                </button>
              </div>
            ) : (
              <p className="mt-6 text-sm text-ink-3">{t('pd.attempts.login')}</p>
            )}
          </Section>
        </article>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 self-start">
          <div className="border border-line bg-white/50 p-5">
            <Meta k={t('pd.status')} v={enumLabel(lang, 'status', p.status)} />
            <Meta k={t('pd.difficulty')} v={<Stars difficulty={p.difficulty} />} />
            <Meta
              k={t('pd.formalize')}
              v={enumLabel(lang, 'potential', p.formalization_potential)}
            />
            <Meta
              k={t('pd.verify')}
              v={enumLabel(lang, 'verification', p.verification_path)}
            />
            {p.contributor && <Meta k={t('pd.contrib')} v={p.contributor} />}
            {p.proposer && <Meta k={t('pd.proposer')} v={p.proposer} />}
            {p.proposed_year && <Meta k={t('pd.year')} v={p.proposed_year} />}
            {p.via && (
              <Meta
                k={t('pd.via')}
                v={
                  p.via.url ? (
                    <a
                      href={p.via.url}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline underline-offset-2"
                    >
                      {p.via.label}
                    </a>
                  ) : (
                    p.via.label
                  )
                }
              />
            )}
            <div className="pt-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`[${p.id}] ${p.title} — ${window.location.href}`)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 1600)
                }}
                className="w-full rounded-full border border-line-strong py-2 text-xs text-ink-2 hover:border-ink hover:text-ink transition-colors"
              >
                {copied ? t('pd.copied') : t('pd.copyCit')}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}