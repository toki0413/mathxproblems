import { Link, useParams } from 'react-router'
import { useState } from 'react'
import { PROBLEMS, DOMAINS, RELATION_LABELS, impactOf, relatedOf, upstreamPath, downstreamOf, lifecycleOf, type OutputKind } from '@/data/problems'
import { Markdown } from '@/components/Markdown'
import { ProblemGraph } from '@/components/ProblemGraph'
import { Stars } from '@/components/ProblemRow'
import { Comments } from '@/components/Comments'
import { useI18n, enumLabel, pickLang, domainLabel } from '@/i18n'
import { trpc } from '@/providers/trpc'
import { useMarkVisited } from '@/hooks/useVisited'
import { BandRuler } from '@/components/BandRuler'

/** 产出类型的标识色：行为证书=绿、真理解证书=蓝、学科骨架=灰 */
const OUTPUT_COLOR: Record<OutputKind, string> = {
  verified_behavior: '#1e7a5a',
  verified_truth: '#2563eb',
  scaffolding: '#8b887c',
}

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
  useMarkVisited(p?.id)
  const [copied, setCopied] = useState(false)
  const dbUpdates = trpc.updates.byProblem.useQuery({ problemId: id ?? '' })
  const attempts = trpc.attempts.approved.useQuery({ problemId: id ?? '' })
  const [atKind, setAtKind] = useState<'progress' | 'solution' | 'revision' | 'verification'>('progress')
  const [atTitle, setAtTitle] = useState('')
  const [atAuthor, setAtAuthor] = useState('')
  const [atContent, setAtContent] = useState('')
  const [atNarrative, setAtNarrative] = useState('')
  const [atBandLo, setAtBandLo] = useState('')
  const [atBandHi, setAtBandHi] = useState('')
  const submitAttempt = trpc.attempts.submit.useMutation({
    onSuccess: () => {
      setAtTitle('')
      setAtAuthor('')
      setAtContent('')
      setAtNarrative('')
      setAtBandLo('')
      setAtBandHi('')
    },
  })

  // 伪匿名：访客 httpOnly cookie 由后台签发，无需登录即可参与（一人一票按访客计）。
  const [myVotes, setMyVotes] = useState<ReadonlySet<number>>(() => new Set())
  const voteAttempt = trpc.attempts.vote.useMutation({
    onMutate: (v) => {
      setMyVotes((prev) => {
        const next = new Set(prev)
        if (next.has(v.attemptId)) next.delete(v.attemptId)
        else next.add(v.attemptId)
        return next
      })
    },
    onSuccess: (res, v) => {
      setAttemptVotes((prev) => new Map(prev).set(v.attemptId, res.votes))
    },
    onError: (_, v) => {
      // 回滚乐观态
      setMyVotes((prev) => {
        const next = new Set(prev)
        if (next.has(v.attemptId)) next.delete(v.attemptId)
        else next.add(v.attemptId)
        return next
      })
    },
  })
  const [attemptVotes, setAttemptVotes] = useState<ReadonlyMap<number, number>>(() => new Map())

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

          {lifecycleOf(p) === 'refuted' && (
            <div className="mt-4 border border-me bg-me/5 px-4 py-3 text-sm text-me" style={{ borderLeftWidth: 3 }}>
              {t('pd.lifecycle.refutedHint')}
            </div>
          )}

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

          {p.certificate && (
            <Section title={t('pd.certificate')}>
              <div className="border border-line mb-3">
                <div className="px-4 py-2.5 text-xs text-ink-3 leading-relaxed">
                  {t('pd.certificate.claimedNotice')}
                </div>
              </div>
              <div className="border border-line">
                {/* 带证区间 + 总带合成公式：把 judgment 的三层残差从散文变成可审计的字段 */}
                <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2 px-5 py-4 hairline-b">
                  <div>
                    <div className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-ink-3">
                      {t('pd.certificate.band')}
                    </div>
                    <div className="font-mono2 text-sm text-ink mt-1">
                      {p.certificate.certified_band ?? '—'}
                    </div>
                  </div>
                  <div>
                    <div className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-ink-3">
                      {t('pd.certificate.total')}
                    </div>
                    <div className="font-mono text-sm text-ink mt-1">{p.certificate.total_band}</div>
                  </div>
                </div>
                {/* 三层残差，各给 bound + derivation */}
                <div className="divide-y divide-line">
                  {(
                    [
                      ['R_model', p.certificate.r_model],
                      ['R_param', p.certificate.r_param],
                      ['R_num', p.certificate.r_num],
                    ] as const
                  ).map(([layer, res]) => (
                    <div key={layer} className="flex flex-col sm:flex-row sm:items-baseline gap-1.5 px-5 py-3">
                      <span className="font-mono2 text-[11px] uppercase tracking-wider text-ink-3 w-20 shrink-0">
                        {layer}
                      </span>
                      <span className="flex-1 min-w-0 text-ink-2 text-sm leading-relaxed">
                        {res.bound}
                      </span>
                      <span className="sm:w-56 shrink-0 font-mono2 text-[11px] text-ink-3 text-right">
                        {res.derivation}
                      </span>
                    </div>
                  ))}
                </div>
                {/* 验证账本：社区提交、经评审通过的带证收窄记录（验证-收窄飞轮） */}
                {(() => {
                  const verified = (attempts.data ?? []).filter((a) => a.kind === 'verification')
                  if (verified.length === 0) return null
                  return (
                    <div className="hairline-t px-5 py-4">
                      <div className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-ink-3 mb-2">
                        {t('pd.ledger')}
                      </div>
                      <p className="text-xs text-ink-3 mb-3 leading-relaxed">{t('pd.ledger.hint')}</p>
                      <BandRuler steps={verified} />
                      <ul className="divide-y divide-line">
                        {verified.map((v) => (
                          <li key={v.id} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-2.5">
                            <span className="font-mono2 text-xs text-mc" style={{ fontVariantNumeric: 'tabular-nums' }}>{v.newBand}</span>
                            {v.bits != null && (
                              <span
                                className={`font-mono2 text-[10px] shrink-0 ${v.bits >= 0 ? 'text-mc' : 'text-me'}`}
                                style={{ fontVariantNumeric: 'tabular-nums' }}
                              >
                                {v.bits >= 0 ? '+' : ''}{v.bits.toFixed(2)} {t('pd.bits')}
                              </span>
                            )}
                            <span className="flex-1 min-w-0 text-ink-2 text-xs leading-relaxed">{v.title}</span>
                            <span className="font-mono2 text-[11px] text-ink-3">
                              {v.authorName ? `${v.authorName} · ` : ''}
                              {new Date(v.createdAt).toISOString().slice(0, 10)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })()}
              </div>
            </Section>
          )}

          {/* 双桥视图：形式侧 (AI4Math) 与带侧 (AI4S) 并排，中间用桥串起两套记号体系 */}
          {(p.formal_view || p.bridge) && (
            <Section title={t('pd.dualbridge.title')}>
              <div className="grid md:grid-cols-2 gap-4">
                {p.formal_view && (
                  <div className="border border-line p-4">
                    <div className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-ink-3 mb-2">
                      {t('pd.dualbridge.formal')}
                    </div>
                    <p className="text-sm text-ink-2 leading-relaxed">{p.formal_view.statement}</p>
                    <div className="mt-3 hairline-t pt-3 space-y-1">
                      <div className="text-xs">
                        <span className="font-mono2 text-ink-3 uppercase tracking-wider">{t('pd.dualbridge.target')}·</span>
                        <span className="text-ink-2">{p.formal_view.target}</span>
                      </div>
                      <div className="text-xs">
                        <span className="font-mono2 text-ink-3 uppercase tracking-wider">{t('pd.dualbridge.status')}·</span>
                        <span className={`font-mono2 ${p.formal_view.status === 'provable' ? 'text-mc' : p.formal_view.status === 'refuted' ? 'text-me' : 'text-ink-2'}`}>{p.formal_view.status}</span>
                      </div>
                      {p.formal_view.judgment && (
                        <div className="text-xs text-ink-2 leading-relaxed">
                          <span className="font-mono2 text-ink-3 uppercase tracking-wider">{t('pd.dualbridge.judgment')}· </span>
                          {p.formal_view.judgment}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {p.certificate && (
                  <div className="border border-line p-4">
                    <div className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-ink-3 mb-2">
                      {t('pd.dualbridge.banded')}
                    </div>
                    <div className="font-mono text-sm text-ink">{p.certificate.certified_band ?? '—'}</div>
                    <div className="mt-1 font-mono text-sm text-ink-2">{p.certificate.total_band}</div>
                  </div>
                )}
              </div>
              {p.bridge && (
                <div className="mt-4 border border-line p-4" style={{ borderLeftWidth: 3 }}>
                  <div className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-ink-3 mb-2">{t('pd.dualbridge.bridge')}</div>
                  <p className="text-sm text-ink-2 leading-relaxed">{p.bridge.link}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    <span className="font-mono2 text-ink-3 uppercase tracking-wider">{t('pd.dualbridge.direction')}: <span className="text-ink-2">{p.bridge.direction}</span></span>
                    {p.bridge.shared_residuals && p.bridge.shared_residuals.length > 0 && (
                      <span className="font-mono2 text-ink-3 uppercase tracking-wider">
                        {t('pd.dualbridge.shared')}: <span className="text-me">{p.bridge.shared_residuals.join(', ')}</span>
                      </span>
                    )}
                  </div>
                  {p.bridge.band_as_fn_of_eps && (
                    <div className="mt-2 text-xs text-ink-2 leading-relaxed">
                      <span className="font-mono2 text-ink-3 uppercase tracking-wider">{t('pd.dualbridge.eps')}: </span>
                      {p.bridge.band_as_fn_of_eps}
                    </div>
                  )}
                </div>
              )}
            </Section>
          )}

          {/* 信任审计：把 depends_on 继承语义渲染成上游证书依赖树，回答"凭什么信它" */}
          {(() => {
            const upstream = p.certificate ? upstreamPath(p) : []
            const downstream = p.certificate ? downstreamOf(p) : []
            if (upstream.length === 0 && downstream.length === 0) return null
            return (
              <Section title={t('pd.audit')}>
                <p className="text-xs text-ink-3 mb-4 leading-relaxed">{t('pd.audit.hint')}</p>
                {upstream.length > 0 ? (
                  <div className="border border-line">
                    <div className="px-5 py-2.5 hairline-b font-mono2 text-[10px] uppercase tracking-[0.18em] text-ink-3">
                      {t('pd.audit.upstream')}
                    </div>
                    <ul className="divide-y divide-line">
                      {upstream.map((u) => (
                        <li key={u.id} className="flex items-baseline gap-4 px-5 py-3">
                          <span className="font-mono2 text-[10px] text-ink-3 shrink-0 w-8">L{u.depth}</span>
                          <Link
                            to={`/problems/${u.id}`}
                            className="font-mono2 text-xs text-ink hover:underline underline-offset-4 shrink-0 w-16"
                          >
                            {u.id}
                          </Link>
                          <span className="flex-1 min-w-0 text-ink-2 text-xs leading-relaxed">{u.note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="border border-dashed border-line-strong px-5 py-3 text-sm text-ink-3">
                    {t('pd.audit.none')}
                  </p>
                )}
                {downstream.length > 0 && (
                  <div className="border border-line mt-4">
                    <div className="px-5 py-2.5 hairline-b font-mono2 text-[10px] uppercase tracking-[0.18em] text-ink-3">
                      {t('pd.audit.downstream')}
                    </div>
                    <ul className="divide-y divide-line">
                      {downstream.map((d) => (
                        <li key={d.id} className="flex items-baseline gap-4 px-5 py-3">
                          <Link
                            to={`/problems/${d.id}`}
                            className="font-mono2 text-xs text-ink hover:underline underline-offset-4 shrink-0 w-16"
                          >
                            {d.id}
                          </Link>
                          <span className="flex-1 min-w-0 text-ink-2 text-xs leading-relaxed">{d.note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Section>
            )
          })()}

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
              {p.engineering_deliverables && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {p.engineering_deliverables.map((d) => (
                    <span
                      key={d}
                      className="border border-line rounded-full px-3 py-1 text-xs text-ink-2 bg-white/50"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              )}
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
                    {/* 候选投票：登录用户可投/撤一票，票数是社区认可信号 */}
                    <button
                      onClick={() => voteAttempt.mutate({ attemptId: a.id })}
                      disabled={voteAttempt.isPending}
                      title={t('pd.attempts.vote.title')}
                      className={`ml-auto inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono2 text-[11px] transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                        myVotes.has(a.id)
                          ? 'bg-mc text-paper border-mc'
                          : 'border-line-strong text-ink-2 hover:border-ink'
                      }`}
                    >
                      <span aria-hidden="true">▲</span>
                      {attemptVotes.get(a.id) ?? a.votes}
                    </button>
                  </div>
                  <h3 className="font-statement font-semibold mt-2">{a.title}</h3>
                  <div className="font-statement text-ink-2 leading-relaxed mt-1">
                    <Markdown>{a.content}</Markdown>
                  </div>
                  {/* 思路与反思：与论证本体分块，失败/卡点同样沉淀为内容 */}
                  {a.narrative && (
                    <div className="mt-3 border-l-2 border-[#9a5b13]/50 bg-[#9a5b13]/5 px-3 py-2">
                      <div className="font-mono2 text-[10px] uppercase tracking-[0.15em] text-[#9a5b13] mb-1">
                        {t('pd.attempts.narrative.label')}
                      </div>
                      <div className="font-statement text-sm text-ink-2 leading-relaxed">
                        <Markdown>{a.narrative}</Markdown>
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>

            <div className="mt-6 border border-line bg-white/50 p-5 space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="font-mono2 text-[11px] uppercase tracking-[0.15em] text-ink-2">
                    {t('pd.attempts.kind')}
                  </div>
                  {(['progress', 'solution', 'revision', 'verification'] as const).map((k) => (
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
                <input
                  value={atAuthor}
                  onChange={(e) => setAtAuthor(e.target.value)}
                  placeholder={t('pd.attempts.author')}
                  className="w-full bg-paper border border-line px-3 py-1.5 text-sm focus:outline-none focus:border-ink"
                />
                {atKind === 'verification' && (
                  <>
                    <p className="text-xs text-ink-3 leading-relaxed">{t('pd.attempts.verificationHint')}</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={atBandLo}
                        onChange={(e) => setAtBandLo(e.target.value)}
                        placeholder={t('pd.attempts.bandLo')}
                        className="w-full bg-paper border border-line px-3 py-1.5 text-sm focus:outline-none focus:border-ink"
                      />
                      <span className="text-ink-3">–</span>
                      <input
                        type="number"
                        value={atBandHi}
                        onChange={(e) => setAtBandHi(e.target.value)}
                        placeholder={t('pd.attempts.bandHi')}
                        className="w-full bg-paper border border-line px-3 py-1.5 text-sm focus:outline-none focus:border-ink"
                      />
                    </div>
                  </>
                )}
                <textarea
                  value={atContent}
                  onChange={(e) => setAtContent(e.target.value)}
                  rows={4}
                  placeholder={t('pd.attempts.content')}
                  className="w-full bg-paper border border-line px-3 py-1.5 text-sm focus:outline-none focus:border-ink resize-y"
                />
                <textarea
                  value={atNarrative}
                  onChange={(e) => setAtNarrative(e.target.value)}
                  rows={3}
                  placeholder={t('pd.attempts.narrative')}
                  className="w-full bg-paper border border-dashed border-line-strong px-3 py-1.5 text-sm focus:outline-none focus:border-ink resize-y"
                />
                <button
                  onClick={() =>
                    submitAttempt.mutate({
                      problemId: p.id,
                      kind: atKind,
                      title: atTitle,
                      content: atContent,
                      narrative: atNarrative.trim() || undefined,
                      authorName: atAuthor.trim() || undefined,
                      newBand:
                        atKind === 'verification' && atBandLo && atBandHi
                          ? `[${atBandLo}, ${atBandHi}]`
                          : undefined,
                    })
                  }
                  disabled={
                    submitAttempt.isPending ||
                    !atTitle.trim() ||
                    !atContent.trim() ||
                    (atKind === 'verification' && (!atBandLo || !atBandHi || Number(atBandLo) >= Number(atBandHi)))
                  }
                  className="border border-mc text-mc px-4 py-1.5 text-sm hover:bg-mc hover:text-paper transition-colors disabled:opacity-40"
                >
                  {submitAttempt.isSuccess ? t('pd.attempts.sent') : t('pd.attempts.send')}
                </button>
              </div>
          </Section>
        </article>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 self-start">
          <div className="border border-line bg-white/50 p-5">
            <Meta k={t('pd.status')} v={enumLabel(lang, 'status', p.status)} />
            <Meta
              k={t('pd.output')}
              v={
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono2 text-[10px] uppercase tracking-wider"
                  style={{ color: OUTPUT_COLOR[p.output], borderColor: OUTPUT_COLOR[p.output] }}
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: OUTPUT_COLOR[p.output] }} />
                  {enumLabel(lang, 'output', p.output)}
                </span>
              }
            />
            {/* 证书生命周期徽章：缺省 open 不显示，refuted 用警示色并提示反例来源 */}
            {lifecycleOf(p) !== 'open' && (
              <Meta
                k={t('pd.lifecycle')}
                v={
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono2 text-[10px] uppercase tracking-wider ${
                      lifecycleOf(p) === 'refuted' ? 'text-me border-me' : 'text-ink-2 border-line-strong'
                    }`}
                  >
                    {lifecycleOf(p) === 'refuted' && <span aria-hidden="true">▼</span>}
                    {t(`pd.lifecycle.${lifecycleOf(p)}`)}
                  </span>
                }
              />
            )}
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
