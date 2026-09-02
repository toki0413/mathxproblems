import { useState } from 'react'
import { LAWS, LAW_INDUSTRIES, LAW_STATUS_LABEL, type LawStatus } from '@/data/laws'
import { toolById } from '@/data/mathlibTools'
import { Reveal } from '@/components/Reveal'
import { useI18n } from '@/i18n'

/** 与站点其它状态色一致：formulated=绿、partial=琥珀、gap=中性灰 */
const STATUS_COLOR: Record<LawStatus, string> = {
  formalized: '#1e7a5a',
  partial: '#9a5b13',
  gap: '#8b887c',
}

function Residuals({ residuals }: { residuals: { r_model: string; r_param: string; r_num: string } }) {
  return (
    <div className="grid gap-2 text-sm">
      {(['r_model', 'r_param', 'r_num'] as const).map((k) => (
        <div key={k} className="flex items-baseline gap-3">
          <span className="font-mono2 text-[11px] uppercase tracking-[0.15em] text-ink-3 shrink-0 w-16">
            {k}
          </span>
          <span className="text-ink-2 leading-relaxed">{residuals[k]}</span>
        </div>
      ))}
    </div>
  )
}

export default function LawsPage() {
  const { t } = useI18n()
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <div className="mx-auto max-w-4xl px-5 py-14">
      <Reveal>
        <h1 className="font-statement text-4xl md:text-5xl font-bold tracking-tight">{t('laws.title')}</h1>
        <p className="mt-6 text-ink-2 leading-relaxed max-w-2xl">{t('laws.subtitle')}</p>
      </Reveal>

      {LAW_INDUSTRIES.map((industry) => (
        <Reveal key={industry}>
          <section className="mt-14">
            <div className="flex items-baseline justify-between hairline-b pb-2 mb-4">
              <h2 className="font-mono2 text-[11px] uppercase tracking-[0.25em] text-ink-3">{industry}</h2>
              <span className="font-mono2 text-[11px] text-ink-3">
                {LAWS.filter((l) => l.industry === industry).length} laws
              </span>
            </div>
            <div className="space-y-3">
              {LAWS.filter((l) => l.industry === industry).map((law) => {
                const open = openId === law.id
                return (
                  <div key={law.id} className="border border-line bg-white/50">
                    <button
                      onClick={() => setOpenId(open ? null : law.id)}
                      className="w-full flex items-start justify-between gap-4 p-5 text-left group"
                    >
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-statement text-lg font-bold group-hover:underline underline-offset-4">
                            {law.name}
                          </span>
                          <span
                            className="text-[11px] font-mono2 uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
                            style={{ background: STATUS_COLOR[law.status] }}
                          >
                            {LAW_STATUS_LABEL[law.status]}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-ink-3 leading-relaxed">{law.usage}</p>
                      </div>
                      <span className="font-mono2 text-xs text-ink-3 shrink-0 mt-1">
                        {open ? t('laws.collapse') : t('laws.expand')}
                      </span>
                    </button>

                    {open && (
                      <div className="px-5 pb-5 space-y-5">
                        <div>
                          <div className="font-mono2 text-[11px] uppercase tracking-[0.15em] text-ink-3 mb-1.5">
                            {t('laws.formal')}
                          </div>
                          <p className="text-sm text-ink-2 leading-relaxed">{law.formal_statement}</p>
                        </div>
                        <div>
                          <div className="font-mono2 text-[11px] uppercase tracking-[0.15em] text-ink-3 mb-1.5">
                            {t('laws.assumptions')}
                          </div>
                          <ul className="flex flex-wrap gap-2">
                            {law.assumptions.map((a) => (
                              <li key={a} className="border border-line rounded-full px-3 py-1 text-xs text-ink-2">
                                {a}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="border-l-3 border-l-[#9a5b13] bg-[#f2f0e8] p-4">
                          <div className="font-mono2 text-[11px] uppercase tracking-[0.15em] text-ink-3 mb-1.5">
                            {t('laws.boundary')}
                          </div>
                          <p className="text-sm text-ink leading-relaxed font-statement">{law.boundary}</p>
                        </div>
                        <div>
                          <div className="font-mono2 text-[11px] uppercase tracking-[0.15em] text-ink-3 mb-1.5">
                            {t('laws.gap')}
                          </div>
                          <p className="text-sm text-ink-2 leading-relaxed">{law.gap}</p>
                        </div>
                        <div>
                          <div className="font-mono2 text-[11px] uppercase tracking-[0.15em] text-ink-3 mb-1.5">
                            {t('laws.residuals')}
                          </div>
                          <Residuals residuals={law.residuals} />
                        </div>
                        <div>
                          <div className="font-mono2 text-[11px] uppercase tracking-[0.15em] text-ink-3 mb-1.5">
                            {t('laws.tools')}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {law.tool_links.map((tl) => {
                              const tool = toolById(tl.tool_id)
                              return (
                                <span
                                  key={tl.tool_id}
                                  className="border border-line rounded-full px-3 py-1 text-xs text-ink-2"
                                >
                                  {tool ? tool.name : tl.tool_id} · {tl.role}
                                </span>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        </Reveal>
      ))}
    </div>
  )
}
