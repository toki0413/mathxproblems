import { useMemo } from 'react'
import { Link } from 'react-router'
import { PROBLEMS, DOMAINS, type Domain } from '@/data/problems'
import { DomainDot } from '@/components/ProblemRow'
import { Reveal } from '@/components/Reveal'
import { useI18n, domainLabel, enumLabel } from '@/i18n'
import { GOAL_PROBLEMS } from '@/const'

// 各领域收录目标，总和与全局里程碑 GOAL_PROBLEMS 对齐。
const TARGETS: Record<Domain, number> = {
  'mathematical-physics': 40,
  'mathematical-chemistry': 25,
  'mathematical-biology': 25,
  'mathematical-engineering': 10,
}

export default function StatsPage() {
  const { lang, t } = useI18n()
  const stats = useMemo(() => {
    const byDomain = (Object.keys(DOMAINS) as Domain[]).map((d) => ({
      domain: d,
      count: PROBLEMS.filter((p) => p.domain === d).length,
      target: TARGETS[d],
    }))
    const byPotential = (['high', 'medium', 'low'] as const).map((v) => ({
      key: v,
      count: PROBLEMS.filter((p) => p.formalization_potential === v).length,
    }))
    const byVerification = (['analytical', 'numerical'] as const).map((v) => ({
      key: v,
      count: PROBLEMS.filter((p) => p.verification_path === v).length,
    }))
    const byStatus = (['open', 'partial', 'resolved'] as const).map((v) => ({
      key: v,
      count: PROBLEMS.filter((p) => p.status === v).length,
    }))
    const byOutput = (['verified_behavior', 'verified_truth', 'scaffolding'] as const).map((v) => ({
      key: v,
      count: PROBLEMS.filter((p) => p.output === v).length,
    }))
    const relations = PROBLEMS.reduce((s, p) => s + p.related_problems.length, 0)
    return { byDomain, byPotential, byVerification, byStatus, byOutput, relations }
  }, [])

  const potentialLabel = (v: string) => enumLabel(lang, 'potential', v)
  const verificationLabel = (v: string) => enumLabel(lang, 'verification', v)
  const statusLabel = (v: string) => enumLabel(lang, 'status', v)
  const outputLabel = (v: string) => enumLabel(lang, 'output', v)

  // 产出类型的标识色，与详情页保持一致：行为证书=绿、真理解证书=蓝、学科骨架=灰
  const OUTPUT_COLOR: Record<string, string> = {
    verified_behavior: '#1e7a5a',
    verified_truth: '#2563eb',
    scaffolding: '#8b887c',
  }

  const Bar = ({ value, max, color }: { value: number; max: number; color?: string }) => (
    <div className="h-5 bg-[#f0eee7] w-full relative">
      <div
        className="h-full transition-all duration-700"
        style={{ width: `${(value / max) * 100}%`, background: color ?? 'var(--ink)' }}
      />
    </div>
  )

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <Reveal>
        <h1 className="font-statement text-4xl md:text-5xl font-bold tracking-tight">{t('st.title')}</h1>
        <p className="mt-4 text-ink-2">
          {t('st.milestone')
            .replace('{goal}', String(GOAL_PROBLEMS))
            .replace('{n}', String(PROBLEMS.length))}
        </p>
      </Reveal>

      <div className="mt-12 grid md:grid-cols-2 gap-x-16 gap-y-14">
        <Reveal>
          <section>
            <h2 className="font-mono2 text-[11px] uppercase tracking-[0.25em] text-ink-3 mb-5">
              {t('st.domainProgress')}
            </h2>
            <div className="space-y-5">
              {stats.byDomain.map(({ domain, count, target }) => (
                <div key={domain}>
                  <div className="flex items-baseline justify-between text-[15px] mb-1.5">
                    <Link
                      to={`/problems?domain=${domain}`}
                      className="flex items-center gap-2 hover:underline underline-offset-4"
                    >
                      <DomainDot domain={domain} />
                      {domainLabel(DOMAINS[domain], lang)}
                    </Link>
                    <span className="font-mono2 text-xs text-ink-3">
                      {count} / {target}
                    </span>
                  </div>
                  <Bar value={count} max={target} color={DOMAINS[domain].color} />
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        <div className="space-y-14">
          <Reveal delay={60}>
            <section>
              <h2 className="font-mono2 text-[11px] uppercase tracking-[0.25em] text-ink-3 mb-5">
                {t('st.byPotential')}
              </h2>
              <div className="space-y-4">
                {stats.byPotential.map(({ key, count }) => (
                  <div key={key}>
                    <div className="flex items-baseline justify-between text-[15px] mb-1.5">
                      <span>{potentialLabel(key)}</span>
                      <span className="font-mono2 text-xs text-ink-3">{count}</span>
                    </div>
                    <Bar value={count} max={PROBLEMS.length} />
                  </div>
                ))}
              </div>
            </section>
          </Reveal>

          <Reveal delay={120}>
            <section>
              <h2 className="font-mono2 text-[11px] uppercase tracking-[0.25em] text-ink-3 mb-5">
                {t('st.byVerification')}
              </h2>
              <div className="space-y-4">
                {stats.byVerification.map(({ key, count }) => (
                  <div key={key}>
                    <div className="flex items-baseline justify-between text-[15px] mb-1.5">
                      <span>{verificationLabel(key)}</span>
                      <span className="font-mono2 text-xs text-ink-3">{count}</span>
                    </div>
                    <Bar value={count} max={PROBLEMS.length} />
                  </div>
                ))}
              </div>
            </section>
          </Reveal>

          <Reveal delay={150}>
            <section>
              <h2 className="font-mono2 text-[11px] uppercase tracking-[0.25em] text-ink-3 mb-5">
                {t('st.byStatus')}
              </h2>
              <div className="space-y-4">
                {stats.byStatus.map(({ key, count }) => (
                  <div key={key}>
                    <div className="flex items-baseline justify-between text-[15px] mb-1.5">
                      <span>{statusLabel(key)}</span>
                      <span className="font-mono2 text-xs text-ink-3">{count}</span>
                    </div>
                    <Bar value={count} max={PROBLEMS.length} />
                  </div>
                ))}
              </div>
            </section>
          </Reveal>

          <Reveal delay={180}>
            <section>
              <h2 className="font-mono2 text-[11px] uppercase tracking-[0.25em] text-ink-3 mb-5">
                {t('st.byOutput')}
              </h2>
              <div className="space-y-4">
                {stats.byOutput.map(({ key, count }) => (
                  <div key={key}>
                    <div className="flex items-baseline justify-between text-[15px] mb-1.5">
                      <span>{outputLabel(key)}</span>
                      <span className="font-mono2 text-xs text-ink-3">{count}</span>
                    </div>
                    <Bar value={count} max={PROBLEMS.length} color={OUTPUT_COLOR[key]} />
                  </div>
                ))}
              </div>
            </section>
          </Reveal>

          <Reveal delay={210}>
            <section className="grid grid-cols-2 gap-px bg-[var(--line)] border border-line">
              {[
                [t('st.relations'), String(stats.relations)],
                [
                  t('st.avgObstacles'),
                  (PROBLEMS.reduce((s, p) => s + p.obstacles.length, 0) / PROBLEMS.length).toFixed(1),
                ],
              ].map(([k, v]) => (
                <div key={k} className="bg-paper p-5">
                  <div className="font-mono2 text-[11px] uppercase tracking-[0.15em] text-ink-3">{k}</div>
                  <div className="mt-2 font-statement text-2xl font-bold">{v}</div>
                </div>
              ))}
            </section>
          </Reveal>
        </div>
      </div>
    </div>
  )
}
