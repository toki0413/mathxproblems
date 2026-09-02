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

      {areas.map(({ area, needs }, gi) => (
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
