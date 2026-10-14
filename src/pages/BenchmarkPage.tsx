import { Link } from 'react-router'
import { useEffect, useMemo, useState } from 'react'
import { DOMAINS, type Domain } from '@/data/problems'
import { DomainDot } from '@/components/ProblemRow'
import { Reveal } from '@/components/Reveal'
import { useI18n } from '@/i18n'

/**
 * LLM 数学推理基准（公开版）：目录里判定可消费的题（verified_behavior/certificate）
 * 导出为评测集（/api/v1/benchmark/tasks.json），每条带 L0/L1/L2 机器核验锚点。
 * 诚实语义：这是评测资产 + 判定协议；"分数榜"只由双桥账本里真实通过评审的
 * 结果构成，不虚构任何模型得分。
 */

interface EvalTask {
  task_id: string
  title: string
  domain: Domain
  judgment: string
  lean_statement?: string
  verification_path: string
  difficulty: string
  tags: string[]
  anchors: {
    statement_anchor: boolean
    certificate_record: { lo: number; hi: number } | null
    failure_typology: boolean
  }
}

export default function BenchmarkPage() {
  const { t } = useI18n()
  const [tasks, setTasks] = useState<EvalTask[] | null>(null)
  const [stats, setStats] = useState<{ count: number; anchors: Record<string, number> } | null>(null)
  const [offline, setOffline] = useState(false)
  const [anchorFilter, setAnchorFilter] = useState<'all' | 'l0' | 'l1' | 'l2'>('all')
  const [query, setQuery] = useState('')

  useEffect(() => {
    let alive = true
    Promise.all([
      fetch('/api/v1/benchmark/tasks.json').then((r) => (r.ok ? r.json() : Promise.reject())),
      fetch('/api/v1/benchmark/stats.json').then((r) => (r.ok ? r.json() : Promise.reject())),
    ])
      .then(([taskBody, statBody]) => {
        if (!alive) return
        setTasks(taskBody as EvalTask[])
        setStats(statBody as { count: number; anchors: Record<string, number> })
      })
      .catch(() => {
        if (alive) {
          setOffline(true)
          setTasks([])
        }
      })
    return () => {
      alive = false
    }
  }, [])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (tasks ?? []).filter((x) => {
      if (anchorFilter === 'l0' && !x.anchors.statement_anchor) return false
      if (anchorFilter === 'l1' && !x.anchors.certificate_record) return false
      if (anchorFilter === 'l2' && !x.anchors.failure_typology) return false
      if (q && !`${x.task_id} ${x.title}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [tasks, anchorFilter, query])

  const byDomain = useMemo(() => {
    const m: Record<string, number> = {}
    for (const x of tasks ?? []) m[x.domain] = (m[x.domain] ?? 0) + 1
    return m
  }, [tasks])

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <Reveal>
        <h1 className="font-statement text-4xl md:text-5xl font-bold tracking-tight">{t('bm.title')}</h1>
        <p className="mt-6 max-w-2xl text-ink-2 leading-relaxed">{t('bm.subtitle')}</p>
      </Reveal>

      {/* 统计条 */}
      <Reveal delay={60}>
        <div className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-[#fcfbf7] p-5">
            <div className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-ink-3">{t('bm.tasks')}</div>
            <div className="mt-1 font-statement text-3xl font-bold text-ink">{offline ? '—' : (stats?.count ?? '…')}</div>
          </div>
          <div className="bg-[#fcfbf7] p-5">
            <div className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-ink-3">{t('bm.l0')}</div>
            <div className="mt-1 font-statement text-3xl font-bold text-ink">{offline ? '—' : (stats?.anchors.statement_anchor ?? '…')}</div>
          </div>
          <div className="bg-[#fcfbf7] p-5">
            <div className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-ink-3">{t('bm.l1')}</div>
            <div className="mt-1 font-statement text-3xl font-bold text-ink">{offline ? '—' : (stats?.anchors.certificate_record ?? '…')}</div>
          </div>
          <div className="bg-[#fcfbf7] p-5">
            <div className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-ink-3">{t('bm.l2')}</div>
            <div className="mt-1 font-statement text-3xl font-bold text-ink">{offline ? '—' : (stats?.anchors.failure_typology ?? '…')}</div>
          </div>
        </div>
        {offline && (
          <p className="mt-3 border border-dashed border-line px-4 py-3 text-xs text-ink-3">{t('bm.offline')}</p>
        )}
      </Reveal>

      {/* 判定协议：如何算通过、如何提交 */}
      <Reveal delay={80}>
        <section className="mt-8 border border-line bg-white/50 p-6">
          <h2 className="font-mono2 text-[11px] uppercase tracking-[0.25em] text-ink-3">{t('bm.protocol')}</h2>
          <div className="mt-3 grid gap-6 md:grid-cols-3">
            <div>
              <div className="font-statement text-[15px] font-bold text-ink">{t('bm.protocol.step1')}</div>
              <p className="mt-1.5 text-sm text-ink-2 leading-relaxed">{t('bm.protocol.step1.body')}</p>
            </div>
            <div>
              <div className="font-statement text-[15px] font-bold text-ink">{t('bm.protocol.step2')}</div>
              <p className="mt-1.5 text-sm text-ink-2 leading-relaxed">{t('bm.protocol.step2.body')}</p>
            </div>
            <div>
              <div className="font-statement text-[15px] font-bold text-ink">{t('bm.protocol.step3')}</div>
              <p className="mt-1.5 text-sm text-ink-2 leading-relaxed">{t('bm.protocol.step3.body')}</p>
            </div>
          </div>
          <p className="mt-4 max-w-3xl text-xs text-ink-3 leading-relaxed">{t('bm.protocol.note')}</p>
        </section>
      </Reveal>

      {/* 下载与过滤 */}
      <Reveal delay={100}>
        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {(['all', 'l0', 'l1', 'l2'] as const).map((a) => (
              <button
                key={a}
                onClick={() => setAnchorFilter(anchorFilter === a ? 'all' : a)}
                className={`border rounded-full px-2.5 py-0.5 font-mono2 text-[10px] uppercase tracking-wider transition-colors ${
                  anchorFilter === a ? 'bg-ink text-paper border-ink' : 'text-ink-3 border-line hover:border-ink-3'
                }`}
              >
                {a === 'all' ? t('bm.filter.all') : t(`bm.filter.${a}`)}
              </button>
            ))}
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('bm.search')}
            className="min-w-0 flex-1 sm:max-w-xs border border-line bg-white/60 px-3 py-1.5 text-sm text-ink placeholder:text-ink-3 outline-none focus:border-ink-3"
          />
          <a
            href="/api/v1/benchmark/tasks.json"
            target="_blank"
            rel="noreferrer"
            className="shrink-0 border border-ink text-ink px-3.5 py-1.5 font-mono2 text-[11px] uppercase tracking-[0.14em] hover:bg-ink hover:text-paper transition-colors"
          >
            {t('bm.download')} ↓
          </a>
        </div>
        {tasks && tasks.length > 0 && (
          <p className="mt-3 font-mono2 text-[11px] text-ink-3">
            {Object.entries(byDomain).map(([d, n]) => `${DOMAINS[d as Domain].prefix} ${n}`).join(' · ')}
          </p>
        )}
      </Reveal>

      {/* 评测任务列表 */}
      <div className="mt-8 space-y-4">
        {(tasks ?? []).length === 0 && (
          <Reveal>
            <p className="border border-dashed border-line px-5 py-8 text-center text-sm text-ink-3">
              {offline ? t('bm.offlineEmpty') : t('bm.empty')}
            </p>
          </Reveal>
        )}
        {visible.map((task, i) => (
          <Reveal key={task.task_id} delay={Math.min(i, 8) * 20}>
            <article className="border border-line bg-white/50 p-6">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono2 text-[11px] text-ink-3">{task.task_id}</span>
                    <DomainDot domain={task.domain} />
                    {task.anchors.statement_anchor && (
                      <span className="border border-mc/40 text-mc rounded-full px-2 py-0.5 font-mono2 text-[10px] uppercase tracking-wider">{t('bm.l0')}</span>
                    )}
                    {task.anchors.certificate_record && (
                      <span className="border border-[#2563eb]/40 text-[#2563eb] rounded-full px-2 py-0.5 font-mono2 text-[10px] uppercase tracking-wider">
                        {t('bm.l1')} [{task.anchors.certificate_record.lo}, {task.anchors.certificate_record.hi}]
                      </span>
                    )}
                    {task.anchors.failure_typology && (
                      <span className="border border-[#9a5b13]/40 text-[#9a5b13] rounded-full px-2 py-0.5 font-mono2 text-[10px] uppercase tracking-wider">{t('bm.l2')}</span>
                    )}
                    <span className="font-mono2 text-[10px] uppercase tracking-wider text-ink-3">{task.verification_path}</span>
                  </div>
                  <Link
                    to={`/problems/${task.task_id}`}
                    className="mt-2 block font-statement text-lg font-bold text-ink hover:underline underline-offset-4 decoration-line-strong"
                  >
                    {task.title}
                  </Link>
                </div>
                <Link
                  to={`/problems/${task.task_id}`}
                  className="shrink-0 border border-ink text-ink px-3.5 py-1.5 font-mono2 text-[11px] uppercase tracking-[0.14em] hover:bg-ink hover:text-paper transition-colors"
                >
                  {t('bm.submit')} →
                </Link>
              </div>

              <p className="mt-3 text-sm text-ink-2 leading-relaxed">{task.judgment}</p>

              {task.lean_statement && (
                <details className="group mt-4">
                  <summary className="cursor-pointer select-none font-mono2 text-[10px] uppercase tracking-[0.18em] text-ink-3 hover:text-ink transition-colors">
                    {t('bm.lean')}
                  </summary>
                  <pre className="mt-2 max-h-80 overflow-auto bg-[#f4f2ec] p-4 font-mono text-[11px] leading-relaxed text-ink-2">
                    {task.lean_statement}
                  </pre>
                </details>
              )}
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  )
}
