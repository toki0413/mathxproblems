import { useMemo } from 'react'
import { Link } from 'react-router'
import { AUDITED_PROBLEMS } from '@/data/audits'
import { DOMAINS, anchorOf, type Domain } from '@/data/problems'
import { DomainDot } from '@/components/ProblemRow'
import { Reveal } from '@/components/Reveal'
import { CatalogGrowth, SubdomainRank, DomainDifficulty } from '@/components/CatalogCharts'
import { useI18n, domainLabel, enumLabel } from '@/i18n'
import { GOAL_PROBLEMS } from '@/const'

// 各领域收录目标，总和与全局里程碑 GOAL_PROBLEMS 对齐。
const TARGETS: Record<Domain, number> = {
  'mathematical-physics': 40,
  'mathematical-chemistry': 25,
  'mathematical-biology': 25,
  'mathematical-engineering': 10,
  'mathematical-computer-science': 15,
}

export default function StatsPage() {
  const { lang, t } = useI18n()
  const stats = useMemo(() => {
    const byDomain = (Object.keys(DOMAINS) as Domain[]).map((d) => ({
      domain: d,
      count: AUDITED_PROBLEMS.filter((p) => p.domain === d).length,
      target: TARGETS[d],
    }))
    const byPotential = (['high', 'medium', 'low'] as const).map((v) => ({
      key: v,
      count: AUDITED_PROBLEMS.filter((p) => p.formalization_potential === v).length,
    }))
    const byVerification = (['analytical', 'numerical'] as const).map((v) => ({
      key: v,
      count: AUDITED_PROBLEMS.filter((p) => p.verification_path === v).length,
    }))
    const byStatus = (['open', 'partial', 'resolved'] as const).map((v) => ({
      key: v,
      count: AUDITED_PROBLEMS.filter((p) => p.status === v).length,
    }))
    const byOutput = (['verified_behavior', 'verified_truth', 'scaffolding'] as const).map((v) => ({
      key: v,
      count: AUDITED_PROBLEMS.filter((p) => p.output === v).length,
    }))
    const relations = AUDITED_PROBLEMS.reduce((s, p) => s + p.related_problems.length, 0)
    // 机器核验锚点覆盖率（L0/L1/L2/L3）：由 anchorOf + proof_steps 派生，零漂移。核验结构性质，≠ 已解决。
    const anchors = AUDITED_PROBLEMS.map((p) => anchorOf(p))
    const anchorCoverage = {
      l0: anchors.filter((a) => a.statement_anchor).length,
      l1: anchors.filter((a) => a.certificate_record).length,
      l2: anchors.filter((a) => a.failure_typology).length,
      l3: AUDITED_PROBLEMS.filter((p) => p.proof_steps?.length).length,
      any: anchors.filter((a) => a.statement_anchor || a.certificate_record || a.failure_typology).length,
    }
    return { byDomain, byPotential, byVerification, byStatus, byOutput, relations, anchorCoverage }
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

  const Bar = ({ value, max, color }: { value: number; max: number; color?: string }) => {
    // 封顶 100%：目标已超额时进度条不再撑出轨道（ME 32/10、CS 18/15 等场景）。
    const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
    return (
      <div className="h-5 bg-[#f0eee7] w-full relative overflow-hidden">
        <div
          className="h-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color ?? 'var(--ink)' }}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <Reveal>
        <h1 className="font-statement text-4xl md:text-5xl font-bold tracking-tight">{t('st.title')}</h1>
        <p className="mt-4 text-ink-2">
          {t('st.milestone')
            .replace('{goal}', String(GOAL_PROBLEMS))
            .replace('{n}', String(AUDITED_PROBLEMS.length))}
        </p>
      </Reveal>

      {/* 机器核验锚点覆盖率：L0/L1/L2 在目录中的覆盖（结构性质核验 ≠ 已解决） */}
      <Reveal delay={30}>
        <section className="mt-12 border border-line bg-[#faf9f4] p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-mono2 text-[11px] uppercase tracking-[0.25em] text-ink-3">{t('st.anchors')}</h2>
            <span className="font-mono2 text-[11px] text-ink-3">
              {stats.anchorCoverage.any}/{AUDITED_PROBLEMS.length} {t('st.anchors.any')}
            </span>
          </div>
          <div className="mt-4 grid md:grid-cols-4 gap-px bg-line border border-line">
            {(
              [
                ['l0', '#2563eb'],
                ['l1', '#1e7a5a'],
                ['l2', '#9a5b13'],
                ['l3', '#7c3aed'],
              ] as const
            ).map(([key, color]) => (
              <div key={key} className="bg-[#faf9f4] p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-ink-3">{t(`st.anchors.${key}`)}</span>
                  <span className="font-statement text-2xl font-bold" style={{ color }}>
                    {stats.anchorCoverage[key]}
                  </span>
                </div>
                <div className="mt-2">
                  <Bar value={stats.anchorCoverage[key]} max={AUDITED_PROBLEMS.length} color={color} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-ink-3 leading-relaxed">{t('st.anchors.hint')}</p>
        </section>
      </Reveal>

      {/* 可视化：目录增长 + 子领域广度 + 领域×难度 */}
      <div className="mt-12 grid md:grid-cols-2 gap-x-16 gap-y-12">
        <Reveal>
          <section>
            <h2 className="font-mono2 text-[11px] uppercase tracking-[0.25em] text-ink-3 mb-4">
              {t('st.growth')}
            </h2>
            <CatalogGrowth full />
          </section>
        </Reveal>
        <Reveal delay={60}>
          <div className="space-y-12">
            <section>
              <h2 className="font-mono2 text-[11px] uppercase tracking-[0.25em] text-ink-3 mb-4">
                {t('st.subdomains')}
              </h2>
              <SubdomainRank />
            </section>
            <section>
              <h2 className="font-mono2 text-[11px] uppercase tracking-[0.25em] text-ink-3 mb-4">
                {t('st.domainDifficulty')}
              </h2>
              <DomainDifficulty />
            </section>
          </div>
        </Reveal>
      </div>

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
                    <Bar value={count} max={AUDITED_PROBLEMS.length} />
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
                    <Bar value={count} max={AUDITED_PROBLEMS.length} />
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
                    <Bar value={count} max={AUDITED_PROBLEMS.length} />
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
                    <Bar value={count} max={AUDITED_PROBLEMS.length} color={OUTPUT_COLOR[key]} />
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
                  (AUDITED_PROBLEMS.reduce((s, p) => s + p.obstacles.length, 0) / AUDITED_PROBLEMS.length).toFixed(1),
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
