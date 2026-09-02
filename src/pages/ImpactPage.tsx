import { Link } from 'react-router'
import { PROBLEMS, DOMAINS, impactOf, type Problem } from '@/data/problems'
import { IMPACT_DOMAIN_RECORDS } from '@/data/impactDomains'
import { Stars } from '@/components/ProblemRow'
import { Reveal } from '@/components/Reveal'
import { useI18n, pickLang } from '@/i18n'

const CERTIFICATION_MAP: Record<string, { standard: string; impact: string }> = {
  'me-001': {
    standard: 'ISO 26262-6 Annex D · 功能安全形式化方法',
    impact: '将多智能体一致性从"仿真测试"升级为"机器可检证书"，直接进入汽车功能安全认证流程。',
  },
  'me-003': {
    standard: 'DO-178C · 机载软件认证',
    impact: '集群避碰的数学证书可替代部分飞行测试，降低无人机群认证成本。',
  },
  'mp-008': {
    standard: 'CFD 工业标准（RANS/LES 闭合模型）',
    impact: '证明或证伪湍流耗散率假设，决定整个航空航天湍流建模的数学根基。',
  },
  'mc-001': {
    standard: '化工过程安全 · IEC 61511',
    impact: '反应网络全局稳定性证书可替代昂贵的中试放大实验，用于本质安全设计。',
  },
  'mc-002': {
    standard: '生物制药工艺验证',
    impact: '持久性判据确保代谢通路不崩溃，直接关联连续生产工艺的鲁棒性认证。',
  },
  'mb-002': {
    standard: '公共卫生干预阈值（WHO 指南）',
    impact: '网络 SIS 精确阈值替代均场近似，优化疫苗分配与隔离策略的数学依据。',
  },
}

const CERTIFICATION_MAP_EN: Record<string, { standard: string; impact: string }> = {
  'me-001': {
    standard: 'ISO 26262-6 Annex D · formal methods for functional safety',
    impact: 'Upgrades multi-agent consensus from “simulation testing” to “machine-checkable certificates”, entering automotive functional-safety certification.',
  },
  'me-003': {
    standard: 'DO-178C · airborne software certification',
    impact: 'Mathematical certificates for swarm collision avoidance can replace part of flight testing, cutting drone-swarm certification cost.',
  },
  'mp-008': {
    standard: 'CFD industrial standards (RANS/LES closures)',
    impact: 'Proving or refuting the dissipation-rate assumption decides the mathematical foundation of aerospace turbulence modeling.',
  },
  'mc-001': {
    standard: 'Chemical process safety · IEC 61511',
    impact: 'Global-stability certificates for reaction networks can replace costly pilot-scale experiments in inherently safe design.',
  },
  'mc-002': {
    standard: 'Biopharmaceutical process validation',
    impact: 'Persistence criteria guarantee metabolic pathways do not collapse — directly tied to robustness certification of continuous manufacturing.',
  },
  'mb-002': {
    standard: 'Public-health intervention thresholds (WHO guidance)',
    impact: 'Exact network SIS thresholds replace mean-field approximations as the mathematical basis for vaccine allocation and isolation policy.',
  },
}

export default function ImpactPage() {
  const { lang, t } = useI18n()
  const certified = PROBLEMS.filter((p) => CERTIFICATION_MAP[p.id])

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <Reveal>
        <h1 className="font-statement text-4xl md:text-5xl font-bold tracking-tight">{t('im.title')}</h1>
        <p className="mt-6 max-w-2xl text-ink-2 leading-relaxed">
          {t('im.subtitle')}
        </p>
      </Reveal>

      <div className="mt-14 space-y-0">
        {certified.map((p: Problem, i: number) => {
          const cert = (lang === 'zh' ? CERTIFICATION_MAP : CERTIFICATION_MAP_EN)[p.id]
          return (
            <Reveal key={p.id} delay={i * 60}>
              <Link
                to={`/problems/${p.id}`}
                className="group grid md:grid-cols-[5rem_1fr_1fr] gap-6 py-8 hairline-b hover:bg-[#f2f0e8] transition-colors px-2 -mx-2"
              >
                <div className="font-mono2 text-xs text-ink-3 uppercase pt-1">{p.id}</div>
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ background: DOMAINS[p.domain].color }}
                    />
                    <h3 className="font-statement text-xl font-bold group-hover:underline underline-offset-4">
                      {pickLang(p, lang)}
                    </h3>
                    <Stars difficulty={p.difficulty} />
                  </div>
                  <p className="mt-4 text-[15px] text-ink-2 leading-relaxed font-statement">
                    {p.engineering_value}
                  </p>
                </div>
                <div className="md:border-l md:border-line md:pl-6">
                  <div className="font-mono2 text-[11px] uppercase tracking-[0.15em] text-ink-3">
                    {t('im.cert')}
                  </div>
                  <div className="mt-2 font-medium text-sm">{cert.standard}</div>
                  <div className="mt-3 font-mono2 text-[11px] uppercase tracking-[0.15em] text-ink-3">
                    {t('im.effect')}
                  </div>
                  <p className="mt-2 text-[15px] text-ink-2 leading-relaxed">{cert.impact}</p>
                </div>
              </Link>
            </Reveal>
          )
        })}
      </div>

      <Reveal delay={150}>
        <section className="mt-16">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="font-statement text-2xl font-bold">
              {t('im.index')}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-0">
            {IMPACT_DOMAIN_RECORDS.map((rec) => {
              const list = PROBLEMS.filter((p) => impactOf(p).includes(rec.name))
              return (
                <div key={rec.id} className="py-3 hairline-b">
                  <Link
                    to={`/problems?impact=${encodeURIComponent(rec.name)}`}
                    className="group flex items-baseline justify-between gap-3"
                  >
                    <span className="text-sm text-ink-2 group-hover:text-ink group-hover:underline underline-offset-4">
                      {rec.name}
                    </span>
                    <span className="font-mono2 text-[11px] text-ink-3 shrink-0">
                      {list.map((p) => p.id).join(' · ')}
                    </span>
                  </Link>
                  {rec.status === 'literature-backed' && (
                    <p className="mt-1 font-mono2 text-[10px] text-ink-3 leading-relaxed">
                      {t('im.backed')}:{' '}
                      <a
                        href={rec.evidence[0].url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline decoration-line-strong underline-offset-2 hover:decoration-ink"
                      >
                        {rec.evidence[0].authors[0]} et al. ({rec.evidence[0].year})
                      </a>
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      </Reveal>

      <Reveal delay={200}>
        <div className="mt-16 bg-ink text-paper p-8 md:p-10">
          <h2 className="font-statement text-2xl font-bold">
            {t('im.why')}
          </h2>
          <div className="mt-6 grid md:grid-cols-3 gap-8 text-[15px] leading-relaxed text-paper/80">
            {[
              [t('im.card1.h'), t('im.card1.b')],
              [t('im.card2.h'), t('im.card2.b')],
              [t('im.card3.h'), t('im.card3.b')],
            ].map(([h, b]) => (
              <div key={h}>
                <div className="font-mono2 text-[11px] uppercase tracking-[0.2em] text-paper/40 mb-2">{h}</div>
                {b}
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  )
}
