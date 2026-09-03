import { Link } from 'react-router'
import { useMemo } from 'react'
import { AUDITED_PROBLEMS } from '@/data/audits'
import { MECHANISM_LABEL, type FailureMechanism, type FailureLayer } from '@/data/mathlibTools'
import { Reveal } from '@/components/Reveal'
import { useObstacleGraph } from '@/hooks/useObstacleGraph'
import { useI18n } from '@/i18n'

const MECHANISM_ORDER: FailureMechanism[] = [
  'combinatorial',
  'missing_bound',
  'nonconvex',
  'unbounded_residual',
  'parameter_sensitive',
]

const LAYER_COLOR: Record<FailureLayer, string> = {
  model: 'text-[#2563eb] border-[#2563eb]/50',
  param: 'text-[#9a5b13] border-[#9a5b13]/40',
  num: 'text-me border-me/50',
  formal: 'text-ink-3 border-line-strong',
}

export default function ObstaclesPage() {
  const { t } = useI18n()
  // 障碍路由层：跨题障碍链 + 方法解锁（复用市场）。纯静态部署 404 时静默为 null。
  const obstacleGraph = useObstacleGraph()

  // mechanism → 带有该机制失败记录的题目
  const byMechanism = useMemo(() => {
    const m = new Map<FailureMechanism, { id: string; title: string; titleZh: string; method: string; layer?: FailureLayer; partial?: string; implication?: string }[]>()
    for (const p of AUDITED_PROBLEMS) {
      for (const r of p.failure_records ?? []) {
        const arr = m.get(r.mechanism) ?? []
        arr.push({
          id: p.id,
          title: p.title,
          titleZh: p.titleZh,
          method: r.method,
          layer: r.layer,
          partial: r.partial,
          implication: r.implication,
        })
        m.set(r.mechanism, arr)
      }
    }
    return m
  }, [])

  // 方法解锁（复用市场）：method → 沿障碍链一跳可达、尚未被该方法触及的问题
  const unlocks = useMemo(() => {
    const raw = obstacleGraph?.unlocks ?? {}
    return Object.entries(raw)
      .filter(([, ids]) => ids.length > 0)
      .map(([method, ids]) => ({
        method,
        items: ids
          .map((id) => ({ id, target: AUDITED_PROBLEMS.find((q) => q.id === id) }))
          .filter((x) => x.target),
      }))
      .filter((u) => u.items.length > 0)
  }, [obstacleGraph])

  const recordCount = useMemo(() => [...byMechanism.values()].reduce((s, arr) => s + arr.length, 0), [byMechanism])
  const problemCount = useMemo(
    () => new Set([...byMechanism.values()].flatMap((arr) => arr.map((x) => x.id))).size,
    [byMechanism],
  )

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <Reveal>
        <h1 className="font-statement text-4xl md:text-5xl font-bold tracking-tight">{t('ob.title')}</h1>
        <p className="mt-6 max-w-2xl text-ink-2 leading-relaxed">{t('ob.subtitle')}</p>
      </Reveal>

      <Reveal delay={60}>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-1 text-xs text-ink-3">
          <span>{MECHANISM_ORDER.length} {t('ob.mechanisms')}</span>
          <span className="mx-1">·</span>
          <span>{recordCount} {t('ob.records')}</span>
          <span className="mx-1">·</span>
          <span>{problemCount} {t('ob.problems')}</span>
        </div>
      </Reveal>

      {/* 复用市场（P1-2）：已通过的方法 → 下一步可试的题。失败知识从"看"变成"用"。 */}
      <section className="mt-14">
        <Reveal>
          <h2 className="font-statement text-xl font-bold">{t('ob.unlocks.title')}</h2>
          <p className="mt-1.5 max-w-2xl text-sm text-ink-3 leading-relaxed">{t('ob.unlocks.subtitle')}</p>
        </Reveal>
        <div className="mt-3 space-y-4">
          {unlocks.map((u, i) => (
            <Reveal key={u.method} delay={i * 20}>
              <div className="border border-line bg-white/50 p-5">
                <div className="font-mono2 text-[10px] uppercase tracking-[0.15em] text-mc mb-2">
                  {u.method}
                </div>
                <ul className="divide-y divide-line border-t border-b border-line">
                  {u.items.map(({ id, target }) => (
                    <li key={id}>
                      <Link
                        to={`/problems/${id}`}
                        className="group flex items-baseline gap-3 py-2.5 hover:bg-[#f2f0e8] transition-colors px-1 -mx-1"
                      >
                        <span className="font-mono2 text-[11px] text-ink-3 shrink-0">{id}</span>
                        <span className="min-w-0 flex-1 truncate text-ink group-hover:underline underline-offset-4 decoration-line-strong">
                          {target!.title}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
          {unlocks.length === 0 && (
            <Reveal>
              <p className="border border-dashed border-line-strong p-5 text-sm text-ink-3 leading-relaxed">
                {t('ob.unlocks.empty')}
              </p>
            </Reveal>
          )}
        </div>
      </section>

      {MECHANISM_ORDER.map((mech, gi) => {
        const items = byMechanism.get(mech) ?? []
        return (
          <section key={mech} className="mt-14">
            <Reveal delay={gi * 40}>
              <h2 className="font-statement text-xl font-bold">{MECHANISM_LABEL[mech]}</h2>
              <p className="mt-1.5 max-w-2xl text-sm text-ink-3 leading-relaxed">{t(`ob.m.${mech}`)}</p>
              <div className="mt-4 font-mono2 text-[11px] uppercase tracking-[0.2em] text-ink-3">
                {items.length} {t('ob.problems')}
              </div>
            </Reveal>
            <div className="mt-3 space-y-4">
              {items.length === 0 && (
                <Reveal>
                  <p className="border border-dashed border-line-strong p-5 text-sm text-ink-3">{t('ob.empty')}</p>
                </Reveal>
              )}
              {items.map((it, i) => (
                <Reveal key={`${it.id}-${i}`} delay={i * 20}>
                  <div className="border border-line bg-white/50 p-5">
                    <div className="flex items-baseline justify-between gap-3 flex-wrap">
                      <Link
                        to={`/problems/${it.id}`}
                        className="group font-mono2 text-[11px] text-ink-3 shrink-0 hover:text-ink"
                      >
                        {it.id}
                      </Link>
                      <div className="flex items-center gap-2 flex-wrap">
                        {it.layer && (
                          <span className={`border rounded-full px-2 py-0.5 font-mono2 text-[9px] uppercase tracking-wider ${LAYER_COLOR[it.layer]}`}>
                            {t('ob.layer')} {it.layer}
                          </span>
                        )}
                        <span className="font-mono2 text-[10px] text-ink-3">{MECHANISM_LABEL[mech]}</span>
                      </div>
                    </div>
                    <Link
                      to={`/problems/${it.id}`}
                      className="block mt-1 font-statement font-semibold text-ink leading-snug group-hover:underline underline-offset-4"
                    >
                      {it.title}
                    </Link>
                    <div className="mt-3 text-sm text-ink-2 leading-relaxed">
                      <span className="font-mono2 text-[10px] uppercase tracking-[0.15em] text-ink-3">
                        {t('ob.method')} ·{' '}
                      </span>
                      {it.method}
                    </div>
                    {it.partial && (
                      <div className="mt-2.5 border-l-2 border-mc/50 bg-mc/5 px-3 py-2">
                        <div className="font-mono2 text-[10px] uppercase tracking-[0.15em] text-mc mb-1">
                          {t('ob.partial')}
                        </div>
                        <p className="text-sm leading-relaxed text-ink-2">{it.partial}</p>
                      </div>
                    )}
                    {it.implication && (
                      <div className="mt-2.5">
                        <div className="font-mono2 text-[10px] uppercase tracking-[0.15em] text-ink-3 mb-1">
                          {t('ob.implication')}
                        </div>
                        <p className="text-sm leading-relaxed text-ink-2">{it.implication}</p>
                      </div>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
