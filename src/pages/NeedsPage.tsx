import { Link } from 'react-router'
import { PROBLEMS } from '@/data/problems'
import { LAWS } from '@/data/laws'
import { ENGINEERING_NEEDS, type NeedProblemRole } from '@/data/engineeringNeeds'
import { Reveal } from '@/components/Reveal'
import { useI18n } from '@/i18n'

// 角色 → 徽章样式：certificate=可直接消费（绿），anchor=奠基结构证（蓝），related=支撑（灰）。
const ROLE_COLOR: Record<NeedProblemRole, { cls: string; label: string }> = {
  certificate: { cls: 'text-mc border-mc/50', label: 'certificate' },
  anchor: { cls: 'text-[#2563eb] border-[#2563eb]/50', label: 'anchor' },
  related: { cls: 'text-ink-3 border-line-strong', label: 'related' },
}

const READINESS_COLOR: Record<string, string> = {
  served: 'text-mc border-mc/50',
  partial: 'text-[#9a5b13] border-[#9a5b13]/40',
  gap: 'text-me border-me/50',
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
          <span className="flex items-center gap-1.5 ml-4">
            {t('nd.readiness.hint')} — {t('nd.served')} / {t('nd.partial')} / {t('nd.gap')}
          </span>
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
                <div className="border border-line bg-white/50 p-6">
                  <div className="flex items-start gap-3 flex-wrap">
                    <h3 className="font-statement text-lg font-bold leading-snug">{n.name}</h3>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 font-mono2 text-[11px] uppercase tracking-wider ${READINESS_COLOR[n.readiness]}`}
                    >
                      {t(`nd.${n.readiness}`)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-ink-2 leading-relaxed max-w-3xl">{n.description}</p>

                  <div className="mt-4">
                    <div className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-ink-3 mb-2">
                      {t('nd.supported')}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {n.problems.map(({ id, role }) => {
                        const p = byId.get(id)
                        if (!p) return null
                        const rc = ROLE_COLOR[role]
                        return (
                          <Link
                            key={id}
                            to={`/problems/${id}`}
                            className="group border border-line rounded-full pl-3 pr-1 py-1 text-xs flex items-center gap-2 hover:border-ink transition-colors"
                          >
                            <span className="font-mono2 text-ink-2 group-hover:text-ink">{id}</span>
                            <span className="max-w-[14rem] truncate text-ink-3">{p.title}</span>
                            <span className={`border rounded-full px-1.5 py-px font-mono2 text-[9px] uppercase tracking-wider ${rc.cls}`}>
                              {rc.label}
                            </span>
                          </Link>
                        )
                      })}
                    </div>
                  </div>

                  {n.laws.length > 0 && (
                    <div className="mt-3">
                      <div className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-ink-3 mb-2">
                        {t('nd.laws')}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {n.laws.map((lid) => {
                          const l = lawById.get(lid)
                          if (!l) return null
                          return (
                            <Link
                              key={lid}
                              to="/laws"
                              className="border border-line rounded-full px-3 py-1 text-xs text-ink-2 hover:border-ink hover:text-ink transition-colors"
                            >
                              {l.name}
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <p className="mt-4 text-xs text-ink-3 leading-relaxed border-t border-line pt-3">
                    {n.note}
                  </p>
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
