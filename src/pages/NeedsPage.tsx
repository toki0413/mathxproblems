import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { PROBLEMS } from '@/data/problems'
import { LAWS } from '@/data/laws'
import { AUDITED_PROBLEMS } from '@/data/audits'
import {
  ENGINEERING_NEEDS,
  chainStepState,
  demandCoverage,
  NEED_WORKFLOW_LABEL,
  type NeedChainRole,
  type NeedStepState,
} from '@/data/engineeringNeeds'
import { sourcingProposals } from '@/data/sourcingCandidates'
import { Reveal } from '@/components/Reveal'
import { useI18n } from '@/i18n'

// 角色 → 徽章：certificate=可直接消费（绿），anchor=奠基结构证（蓝），related=支撑（灰），law=经验定律（琥珀）。
const ROLE_COLOR: Record<NeedChainRole, { cls: string; label: string }> = {
  certificate: { cls: 'text-mc border-mc/50', label: 'certificate' },
  anchor: { cls: 'text-[#2563eb] border-[#2563eb]/50', label: 'anchor' },
  related: { cls: 'text-ink-3 border-line-strong', label: 'related' },
  law: { cls: 'text-[#9a5b13] border-[#9a5b13]/40', label: 'law' },
}

const STATE_COLOR: Record<NeedStepState, string> = {
  served: 'text-mc border-mc/50',
  partial: 'text-[#9a5b13] border-[#9a5b13]/40',
  open: 'text-me border-me/50',
}

const READINESS_COLOR: Record<string, string> = {
  served: 'text-mc border-mc/50',
  partial: 'text-[#9a5b13] border-[#9a5b13]/40',
  gap: 'text-me border-me/50',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <div className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-ink-3 mb-1.5">{label}</div>
      <div className="text-sm text-ink-2 leading-relaxed">{children}</div>
    </div>
  )
}

export default function NeedsPage() {
  const { t } = useI18n()
  const byId = new Map(PROBLEMS.map((p) => [p.id, p]))
  const lawById = new Map(LAWS.map((l) => [l.id, l]))

  // 按工程领域分组
  const areas: { area: string; needs: typeof ENGINEERING_NEEDS }[] = []
  for (const n of ENGINEERING_NEEDS) {
    const g = areas.find((a) => a.area === n.area)
    if (g) g.needs.push(n)
    else areas.push({ area: n.area, needs: [n] })
  }
  // 需求侧聚合覆盖（倒查的密度：多少题、多少定律被需求点名）
  const cov = demandCoverage()

  // 视图切换：缺口驱动（gap 置顶）/ 按领域分组
  const [mode, setMode] = useState<'gap' | 'area'>('gap')
  const RANK = { gap: 0, partial: 1, served: 2 }
  const gapSorted = useMemo(
    () => [...ENGINEERING_NEEDS].sort((a, b) => RANK[a.readiness] - RANK[b.readiness] || a.id.localeCompare(b.id)),
    [],
  )
  const groups =
    mode === 'area'
      ? areas
      : [{ area: t('nd.view.gapArea'), needs: gapSorted }]

  // 收题流水线聚合：所有需求缺口 → 候选题提案（new）与推进目标（push）
  const proposals = useMemo(() => sourcingProposals(), [])
  const pipeline = useMemo(() => {
    const news = proposals
    const pushes: { needId: string; needName: string; target: string; what: string }[] = []
    for (const n of ENGINEERING_NEEDS) {
      for (const s of n.sourcing ?? []) {
        if (s.kind === 'push' && s.target) pushes.push({ needId: n.id, needName: n.name, target: s.target, what: s.what })
      }
    }
    return { news, pushes, intaked: proposals.filter((p) => p.status === 'intaked') }
  }, [proposals])

  // 需求旅程（收题闭环的可视化）：缺口 → 收题提案 → 实采正式题 → 机器锚点(L0/L2) → L3 证明台阶。
  // 由 sourcingProposals + byId 派生，零漂移；显示"收题只是起点，解题层才是终点"的纵深。
  const journeys = useMemo(
    () =>
      proposals
        .filter((p) => p.status === 'intaked' && p.problemId)
        .map((p) => {
          const prob = byId.get(p.problemId!)
          return {
            needId: p.needId,
            needName: p.needName,
            area: p.area,
            readiness: ENGINEERING_NEEDS.find((n) => n.id === p.needId)?.readiness ?? 'gap',
            proposalId: p.id,
            proposalTitle: p.title,
            problemId: p.problemId!,
            problemTitle: prob?.title,
            anchors: { l0: !!prob?.lean_statement, l2: !!(prob?.failure_records && prob.failure_records.length > 0) },
            proofSteps: prob?.proof_steps?.length ?? 0,
          }
        }),
    [proposals, byId],
  )

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <Reveal>
        <h1 className="font-statement text-4xl md:text-5xl font-bold tracking-tight">{t('nd.title')}</h1>
        <p className="mt-6 max-w-2xl text-ink-2 leading-relaxed">{t('nd.subtitle')}</p>
      </Reveal>

      <Reveal delay={60}>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-1 text-xs text-ink-3">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-mc" /> {t('nd.role.certificate')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-[#2563eb]" /> {t('nd.role.anchor')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-[#8b887c]" /> {t('nd.role.related')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-[#9a5b13]" /> {t('nd.role.law')}
          </span>
          <span className="flex items-center gap-1.5 ml-4">
            {t('nd.readiness.hint')} — {t('nd.served')} / {t('nd.partial')} / {t('nd.gap')}
          </span>
        </div>
      </Reveal>

      {/* 需求侧覆盖聚合条：多少需求、多少题/定律被点名、就绪度分布、工作流落点 */}
      <Reveal delay={90}>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-px bg-line border border-line">
          <div className="bg-[#faf9f4] p-4">
            <div className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-ink-3">{t('nd.cov.needs')}</div>
            <div className="mt-1 font-statement text-2xl font-bold">{cov.needs}</div>
            <div className="mt-1 text-xs text-ink-3">
              <span className="text-mc">{cov.readiness.served} {t('nd.served').toLowerCase()}</span>
              <span className="mx-1">·</span>
              <span className="text-[#9a5b13]">{cov.readiness.partial} {t('nd.partial').toLowerCase()}</span>
              <span className="mx-1">·</span>
              <span className="text-me">{cov.readiness.gap} {t('nd.gap').toLowerCase()}</span>
            </div>
          </div>
          <div className="bg-[#faf9f4] p-4">
            <div className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-ink-3">{t('nd.cov.problems')}</div>
            <div className="mt-1 font-statement text-2xl font-bold">
              {cov.problems}
              <span className="text-base font-normal text-ink-3"> / {AUDITED_PROBLEMS.length}</span>
            </div>
            <div className="mt-1 text-xs text-ink-3">{t('nd.cov.problems.body')}</div>
          </div>
          <div className="bg-[#faf9f4] p-4">
            <div className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-ink-3">{t('nd.cov.laws')}</div>
            <div className="mt-1 font-statement text-2xl font-bold">
              {cov.laws}
              <span className="text-base font-normal text-ink-3"> / {LAWS.length}</span>
            </div>
          </div>
          <div className="bg-[#faf9f4] p-4">
            <div className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-ink-3">{t('nd.cov.workflows')}</div>
            <div className="mt-1 font-statement text-2xl font-bold">{cov.workflows}</div>
            <div className="mt-1 text-xs text-ink-3">{t('nd.cov.workflows.body')}</div>
          </div>
        </div>
      </Reveal>

      {/* 视图切换：缺口驱动（gap 置顶）/ 按领域 */}
      <Reveal delay={100}>
        <div className="mt-8 flex items-center gap-2">
          {(['gap', 'area'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-full border px-3 py-1 font-mono2 text-[11px] uppercase tracking-wider transition-colors ${
                mode === m ? 'border-ink bg-ink text-white' : 'border-line-strong text-ink-3 hover:text-ink'
              }`}
            >
              {t(`nd.view.${m}`)}
            </button>
          ))}
        </div>
      </Reveal>

      {/* 收题流水线：需求缺口直接生成候选题提案（new）与推进目标（push） */}
      <Reveal delay={110}>
        <div className="mt-6 border border-line bg-[#faf9f4] p-6">
          <div className="font-mono2 text-[11px] uppercase tracking-[0.25em] text-ink-3">{t('nd.pipeline.title')}</div>
          <p className="mt-2 text-sm text-ink-2 leading-relaxed max-w-3xl">{t('nd.pipeline.body')}</p>

          {/* 闭环进度：提案 → 已实采（缺口驱动收题的完成度） */}
          <div className="mt-3 flex items-center gap-3">
            <span className="font-mono2 text-[11px] text-ink-2">
              {t('nd.pipeline.intaked')}: {pipeline.intaked.length}/{pipeline.news.length}
            </span>
            <div className="h-1.5 w-full max-w-[240px] bg-line rounded-full overflow-hidden">
              <div
                className="h-full bg-mc transition-all"
                style={{ width: `${pipeline.news.length ? (pipeline.intaked.length / pipeline.news.length) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-px bg-line border border-line">
            <div className="bg-[#faf9f4] p-4">
              <div className="flex items-baseline gap-2">
                <span className="font-statement text-2xl font-bold text-mc">{pipeline.news.length}</span>
                <span className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-ink-3">{t('nd.pipeline.new')}</span>
              </div>
              <ul className="mt-3 space-y-1.5">
                {pipeline.news.map((x, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-ink-2 leading-snug">
                    <Link to={`/needs#${x.needId}`} className="font-mono2 text-[10px] text-ink-3 hover:text-ink underline underline-offset-4 shrink-0 pt-px">
                      {x.needId}
                    </Link>
                    <span className="min-w-0 flex-1">{x.what}</span>
                    {x.status === 'intaked' && x.problemId && (
                      <Link
                        to={`/problems/${x.problemId}`}
                        className="font-mono2 text-[10px] text-mc hover:underline underline-offset-4 shrink-0 pt-px"
                      >
                        {x.problemId} ✓
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#faf9f4] p-4">
              <div className="flex items-baseline gap-2">
                <span className="font-statement text-2xl font-bold text-[#2563eb]">{pipeline.pushes.length}</span>
                <span className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-ink-3">{t('nd.pipeline.push')}</span>
              </div>
              <ul className="mt-3 space-y-1.5">
                {pipeline.pushes.map((x, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-ink-2 leading-snug">
                    <Link to={`/problems/${x.target}`} className="font-mono2 text-[10px] text-[#2563eb] hover:underline shrink-0 pt-px">
                      {x.target}
                    </Link>
                    <span>{x.what}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Reveal>

      {/* 需求旅程（收题闭环可视化）：缺口 → 收题 → 实采 → 机器锚点 → L3 证明台阶 */}
      <Reveal delay={120}>
        <div className="mt-6 border border-line bg-[#faf9f4] p-6">
          <div className="font-mono2 text-[11px] uppercase tracking-[0.25em] text-ink-3">{t('nd.journey.title')}</div>
          <p className="mt-2 text-sm text-ink-2 leading-relaxed max-w-3xl">{t('nd.journey.body')}</p>

          {journeys.length === 0 ? (
            <p className="mt-4 text-sm text-ink-3">{t('nd.journey.empty')}</p>
          ) : (
            <div className="mt-4 space-y-3">
              {journeys.map((j) => (
                <div key={j.problemId} className="flex flex-col gap-2 border border-line bg-white/60 p-4">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="font-mono2 text-[11px] text-ink-3">{j.area}</span>
                    <span className={`rounded-full border px-2 py-px font-mono2 text-[10px] uppercase tracking-wider ${READINESS_COLOR[j.readiness]}`}>
                      {t(`nd.${j.readiness}`)}
                    </span>
                    <span className="text-[13px] text-ink-2 font-medium min-w-0">{j.needName}</span>
                  </div>

                  {/* 五段旅程链 */}
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-2">
                    {/* 1. 缺口需求 */}
                    <Link to={`/needs#${j.needId}`} className="group">
                      <div className="flex items-center gap-1.5 border border-me/40 bg-[#fdf6f5] px-2.5 py-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-me" />
                        <span className="font-mono2 text-[11px] text-ink group-hover:underline">{j.needId}</span>
                      </div>
                    </Link>
                    <span className="text-ink-3">→</span>

                    {/* 2. 收题提案 */}
                    <div className="flex items-center gap-1.5 border border-line-strong bg-[#f2f0e8] px-2.5 py-1.5">
                      <span className="font-mono2 text-[11px] text-ink-3">{j.proposalId}</span>
                      <span className="font-mono2 text-[9px] uppercase tracking-wider text-ink-3">{t('nd.journey.sourcing')}</span>
                    </div>
                    <span className="text-ink-3">→</span>

                    {/* 3. 实采正式题 */}
                    <Link to={`/problems/${j.problemId}`} className="group">
                      <div className="flex items-center gap-1.5 border border-mc/50 bg-[#f5f8f2] px-2.5 py-1.5">
                        <span className="font-mono2 text-[11px] text-mc group-hover:underline">{j.problemId}</span>
                        <span className="font-mono2 text-[9px] uppercase tracking-wider text-mc">{t('nd.journey.intaked')}</span>
                      </div>
                    </Link>
                    <span className="text-ink-3">→</span>

                    {/* 4. 机器锚点 L0/L2 */}
                    <div className="flex items-center gap-1.5 border border-line-strong bg-white px-2.5 py-1.5">
                      <span className="font-mono2 text-[10px] text-[#2563eb]">{t('nd.journey.l0')}</span>
                      <span className={j.anchors.l0 ? 'text-mc' : 'text-ink-3'}>{j.anchors.l0 ? '✓' : '·'}</span>
                      <span className="mx-0.5 text-ink-3">/</span>
                      <span className="font-mono2 text-[10px] text-[#9a5b13]">{t('nd.journey.l2')}</span>
                      <span className={j.anchors.l2 ? 'text-mc' : 'text-ink-3'}>{j.anchors.l2 ? '✓' : '·'}</span>
                    </div>
                    <span className="text-ink-3">→</span>

                    {/* 5. L3 证明台阶 */}
                    <div
                      className={`flex items-center gap-1.5 border px-2.5 py-1.5 ${
                        j.proofSteps > 0 ? 'border-mc/60 bg-[#f5f8f2]' : 'border-line-strong bg-[#f2f0e8]'
                      }`}
                    >
                      <span className={`font-mono2 text-[11px] ${j.proofSteps > 0 ? 'text-mc' : 'text-ink-3'}`}>
                        {j.proofSteps > 0 ? `L3 · ${j.proofSteps}` : t('nd.journey.noL3')}
                      </span>
                    </div>
                  </div>

                  {j.problemTitle && <p className="mt-1 text-[12px] text-ink-3 truncate">{j.problemTitle}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </Reveal>

      {groups.map(({ area, needs }, gi) => (
        <section key={area} className="mt-14">
          <Reveal delay={gi * 40}>
            <h2 className="font-mono2 text-[11px] uppercase tracking-[0.25em] text-ink-3 mb-4">{area}</h2>
          </Reveal>
          <div className="space-y-4">
            {needs.map((n) => (
              <Reveal key={n.id}>
                <div id={n.id} className="scroll-mt-24 border border-line bg-white/50 p-6">
                  <div className="flex items-start gap-3 flex-wrap">
                    <h3 className="font-statement text-lg font-bold leading-snug">{n.name}</h3>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 font-mono2 text-[11px] uppercase tracking-wider ${READINESS_COLOR[n.readiness]}`}
                    >
                      {t(`nd.${n.readiness}`)}
                    </span>
                    <span className="rounded-full border border-line-strong px-2.5 py-0.5 font-mono2 text-[11px] uppercase tracking-wider text-ink-3">
                      {NEED_WORKFLOW_LABEL[n.workflow]}
                    </span>
                    {mode === 'gap' && (
                      <span className="rounded-full border border-line-strong px-2.5 py-0.5 font-mono2 text-[11px] uppercase tracking-wider text-ink-3">
                        {n.area}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-sm text-ink-2 leading-relaxed max-w-3xl">{n.description}</p>

                  {/* 判定链：按依赖顺序列出要 certify 的子判定 */}
                  <Field label={t('nd.chain')}>
                    <ol className="space-y-2">
                      {n.chain.map((s, i) => {
                        const title = s.kind === 'problem' ? byId.get(s.id)?.title : lawById.get(s.id)?.name
                        const rc = ROLE_COLOR[s.role]
                        const st = chainStepState(s)
                        return (
                          <li key={s.id} className="flex items-start gap-3">
                            <span className="font-mono2 text-[11px] text-ink-3 shrink-0 w-5 pt-0.5">
                              {String(i + 1).padStart(2, '0')}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                {s.kind === 'problem' ? (
                                  <Link
                                    to={`/problems/${s.id}`}
                                    className="font-mono2 text-[11px] text-ink-2 hover:text-ink underline decoration-line-strong underline-offset-4"
                                  >
                                    {s.id}
                                  </Link>
                                ) : (
                                  <Link
                                    to="/laws"
                                    className="font-mono2 text-[11px] text-ink-2 hover:text-ink underline decoration-line-strong underline-offset-4"
                                  >
                                    {s.id}
                                  </Link>
                                )}
                                <span className={`border rounded-full px-1.5 py-px font-mono2 text-[9px] uppercase tracking-wider ${rc.cls}`}>
                                  {rc.label}
                                </span>
                                <span className={`border rounded-full px-1.5 py-px font-mono2 text-[9px] uppercase tracking-wider ${STATE_COLOR[st]}`}>
                                  {t(`nd.st.${st}`)}
                                </span>
                                {s.kind === 'problem' && byId.get(s.id)?.proof_steps?.length ? (
                                  <span className="border border-mc/50 text-mc rounded-full px-1.5 py-px font-mono2 text-[9px] uppercase tracking-wider">
                                    L3
                                  </span>
                                ) : null}
                              </div>
                              <p className="mt-0.5 text-[13px] text-ink-2 leading-relaxed">{s.what}</p>
                              {title && <p className="text-[11px] text-ink-3 truncate">{title}</p>}
                            </div>
                          </li>
                        )
                      })}
                    </ol>
                  </Field>

                  {/* 对接标准 */}
                  <Field label={t('nd.standard')}>{n.standard}</Field>

                  {/* 什么算被服务 */}
                  <Field label={t('nd.consumable')}>{n.consumable}</Field>

                  {/* 当前障碍 */}
                  <Field label={t('nd.barrier')}>
                    <span className="text-me/90">{n.barrier}</span>
                  </Field>

                  {/* 缺口驱动收题：结构化流水线条目（push=推进 / new=候选题） */}
                  {n.sourcing && n.sourcing.length > 0 && (
                    <Field label={t('nd.sourcing')}>
                      <ul className="space-y-1.5">
                        {n.sourcing.map((s, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span
                              className={`rounded-full border px-1.5 py-px font-mono2 text-[9px] uppercase tracking-wider shrink-0 mt-1 ${
                                s.kind === 'new' ? 'text-mc border-mc/50' : 'text-[#2563eb] border-[#2563eb]/50'
                              }`}
                            >
                              {t(`nd.src.${s.kind}`)}
                            </span>
                            {s.kind === 'push' && s.target && (
                              <Link
                                to={`/problems/${s.target}`}
                                className="font-mono2 text-[11px] text-[#2563eb] hover:text-ink underline underline-offset-4 shrink-0 mt-0.5"
                              >
                                {s.target}
                              </Link>
                            )}
                            <span className="text-sm text-ink-2 leading-relaxed">{s.what}</span>
                          </li>
                        ))}
                      </ul>
                    </Field>
                  )}

                  <p className="mt-4 text-xs text-ink-3 leading-relaxed border-t border-line pt-3">{n.note}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      ))}

      <Reveal delay={120}>
        <div className="mt-16 bg-[#f2f0e8] p-6 md:p-8 text-sm text-ink-2 leading-relaxed">
          <div className="font-mono2 text-[11px] uppercase tracking-[0.2em] text-ink-3 mb-3">
            {t('nd.how.title')}
          </div>
          {t('nd.how.body')}
        </div>
      </Reveal>
    </div>
  )
}
