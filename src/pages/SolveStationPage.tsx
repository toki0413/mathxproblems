import { Link } from 'react-router'
import { useMemo, useState } from 'react'
import { AUDITED_PROBLEMS } from '@/data/audits'
import { DOMAINS, anchorOf, type Domain } from '@/data/problems'
import { DomainDot } from '@/components/ProblemRow'
import { Reveal } from '@/components/Reveal'
import { toolById, TOOL_ROLE_LABEL, type ToolRole } from '@/data/mathlibTools'
import { useI18n, pickLang, enumLabel } from '@/i18n'

/**
 * 求解台（Solve Station）：把目录里「formalization_potential=high 且有可编译
 * Lean 陈述」的题导出为 proof-only 任务卡（Vero 式：规范 + 判定，求机器可查证明）。
 * 与 /api/v1/proof-tasks.json 同源同筛选，避免前端与机器快照漂移。
 * 提交动作落在每题详情页（双桥写路径：progress/solution/verification/formal）。
 */

type TaskStatus = 'open' | 'provable' | 'conjectured' | 'refuted'

const STATUS_COLOR: Record<TaskStatus, string> = {
  open: 'text-ink-3 border-line-strong',
  provable: 'text-mc border-mc/50',
  conjectured: 'text-[#9a5b13] border-[#9a5b13]/40',
  refuted: 'text-me border-me/50',
}

const TOOL_ROLE_CLS: Record<ToolRole, string> = {
  available: 'text-mc border-mc/50',
  partial: 'text-[#9a5b13] border-[#9a5b13]/40',
  missing: 'text-me border-me/50',
}

export default function SolveStationPage() {
  const { lang, t } = useI18n()
  const [domainFilter, setDomainFilter] = useState<'all' | Domain>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all')
  const [query, setQuery] = useState('')

  const tasks = useMemo(() => {
    return AUDITED_PROBLEMS.filter(
      (p) => p.lean_statement && p.formalization_potential === 'high',
    )
      .map((p) => {
        const status: TaskStatus =
          p.formal_view?.status ??
          (p.lifecycle_status === 'refuted' ? 'refuted' : 'open')
        return {
          id: p.id,
          title: p.title,
          titleZh: p.titleZh,
          domain: p.domain,
          judgment: p.judgment ?? '',
          statement: p.lean_statement as string,
          status,
          anchored: anchorOf(p).statement_anchor,
          tools: p.tool_links ?? [],
        }
      })
      .sort((a, b) => a.id.localeCompare(b.id))
  }, [])

  const stats = useMemo(() => {
    const byDomain = (Object.keys(DOMAINS) as Domain[]).map((d) => ({
      domain: d,
      count: tasks.filter((x) => x.domain === d).length,
    }))
    const open = tasks.filter((x) => x.status === 'open').length
    const provable = tasks.filter((x) => x.status === 'provable').length
    const anchored = tasks.filter((x) => x.anchored).length
    return { total: tasks.length, open, provable, anchored, byDomain }
  }, [tasks])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return tasks.filter((x) => {
      if (domainFilter !== 'all' && x.domain !== domainFilter) return false
      if (statusFilter !== 'all' && x.status !== statusFilter) return false
      if (q && !`${x.id} ${x.title} ${x.titleZh}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [tasks, domainFilter, statusFilter, query])

  const statusLabel = (s: TaskStatus) =>
    s === 'open' ? t('sol.status.open') : enumLabel(lang, 'formalStatus', s)

  const domainNames = (Object.keys(DOMAINS) as Domain[]).filter(
    (d) => stats.byDomain.find((b) => b.domain === d)?.count,
  )

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <Reveal>
        <h1 className="font-statement text-4xl md:text-5xl font-bold tracking-tight">{t('sol.title')}</h1>
        <p className="mt-6 max-w-2xl text-ink-2 leading-relaxed">{t('sol.subtitle')}</p>
      </Reveal>

      {/* 聚合条：任务总数 / 机器锚点 / 状态 / 领域分布 */}
      <Reveal delay={60}>
        <div className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-[#fcfbf7] p-5">
            <div className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-ink-3">{t('sol.tasks')}</div>
            <div className="mt-1 font-statement text-3xl font-bold text-ink">{stats.total}</div>
          </div>
          <div className="bg-[#fcfbf7] p-5">
            <div className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-ink-3">{t('sol.anchored')}</div>
            <div className="mt-1 font-statement text-3xl font-bold text-ink">{stats.anchored}</div>
          </div>
          <div className="bg-[#fcfbf7] p-5">
            <div className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-ink-3">{t('sol.status.open')}</div>
            <div className="mt-1 font-statement text-3xl font-bold text-ink">{stats.open}</div>
          </div>
          <div className="bg-[#fcfbf7] p-5">
            <div className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-ink-3">{t('sol.status.provable')}</div>
            <div className="mt-1 font-statement text-3xl font-bold text-ink">{stats.provable}</div>
          </div>
        </div>
      </Reveal>

      {/* 领域 chips（只有非零的领域出现） */}
      <Reveal delay={80}>
        <div className="mt-8 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setDomainFilter('all')}
            className={`border rounded-full px-3 py-1 font-mono2 text-[11px] tracking-wide transition-colors ${
              domainFilter === 'all' ? 'bg-ink text-paper border-ink' : 'text-ink-2 border-line hover:border-ink-3'
            }`}
          >
            {t('sol.filter.all')}
          </button>
          {domainNames.map((d) => (
            <button
              key={d}
              onClick={() => setDomainFilter(domainFilter === d ? 'all' : d)}
              className={`flex items-center gap-1.5 border rounded-full px-3 py-1 font-mono2 text-[11px] tracking-wide transition-colors ${
                domainFilter === d ? 'bg-ink text-paper border-ink' : 'text-ink-2 border-line hover:border-ink-3'
              }`}
            >
              <DomainDot domain={d} />
              {pickLang({ title: DOMAINS[d].label, titleZh: DOMAINS[d].labelZh }, lang)}
            </button>
          ))}
        </div>
      </Reveal>

      {/* 状态过滤 + 搜索 */}
      <Reveal delay={100}>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {(['all', 'open', 'provable', 'conjectured', 'refuted'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
                className={`border rounded-full px-2.5 py-0.5 font-mono2 text-[10px] uppercase tracking-wider transition-colors ${
                  statusFilter === s ? 'bg-ink text-paper border-ink' : 'text-ink-3 border-line hover:border-ink-3'
                }`}
              >
                {s === 'all' ? t('sol.filter.all') : statusLabel(s)}
              </button>
            ))}
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('sol.search')}
            className="min-w-0 flex-1 sm:max-w-xs border border-line bg-white/60 px-3 py-1.5 text-sm text-ink placeholder:text-ink-3 outline-none focus:border-ink-3"
          />
        </div>
      </Reveal>

      {/* 任务卡列表 */}
      <div className="mt-8 space-y-4">
        {visible.length === 0 && (
          <Reveal>
            <p className="border border-dashed border-line px-5 py-8 text-center text-sm text-ink-3">{t('sol.empty')}</p>
          </Reveal>
        )}
        {visible.map((task, i) => (
          <Reveal key={task.id} delay={Math.min(i, 8) * 20}>
            <article className="border border-line bg-white/50 p-6">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono2 text-[11px] text-ink-3">{task.id}</span>
                    <DomainDot domain={task.domain} />
                    <span
                      className={`border rounded-full px-2 py-0.5 font-mono2 text-[10px] uppercase tracking-wider ${STATUS_COLOR[task.status]}`}
                    >
                      {statusLabel(task.status)}
                    </span>
                    {task.anchored && (
                      <span className="border border-mc/40 text-mc rounded-full px-2 py-0.5 font-mono2 text-[10px] uppercase tracking-wider">
                        {t('sol.anchor')}
                      </span>
                    )}
                  </div>
                  <Link
                    to={`/problems/${task.id}`}
                    className="mt-2 block font-statement text-lg font-bold text-ink hover:underline underline-offset-4 decoration-line-strong"
                  >
                    {pickLang({ title: task.title, titleZh: task.titleZh }, lang)}
                  </Link>
                </div>
                <Link
                  to={`/problems/${task.id}`}
                  className="shrink-0 border border-ink text-ink px-3.5 py-1.5 font-mono2 text-[11px] uppercase tracking-[0.14em] hover:bg-ink hover:text-paper transition-colors"
                >
                  {t('sol.view')} →
                </Link>
              </div>

              <p className="mt-3 text-sm text-ink-2 leading-relaxed">{task.judgment}</p>

              {task.tools.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-ink-3 mr-1">{t('sol.tools')}</span>
                  {task.tools.map((tl) => {
                    const tool = toolById(tl.tool_id)
                    return (
                      <span
                        key={tl.tool_id}
                        className={`border rounded-full px-2 py-0.5 font-mono2 text-[10px] uppercase tracking-wider ${TOOL_ROLE_CLS[tl.role]}`}
                        title={tool?.name}
                      >
                        {tool?.name ?? tl.tool_id} · {TOOL_ROLE_LABEL[tl.role]}
                      </span>
                    )
                  })}
                </div>
              )}

              <details className="group mt-4">
                <summary className="cursor-pointer select-none font-mono2 text-[10px] uppercase tracking-[0.18em] text-ink-3 hover:text-ink transition-colors">
                  {t('sol.lean')}
                </summary>
                <pre className="mt-2 max-h-80 overflow-auto bg-[#f4f2ec] p-4 font-mono text-[11px] leading-relaxed text-ink-2">
                  {task.statement}
                </pre>
              </details>
            </article>
          </Reveal>
        ))}
      </div>

      <Reveal delay={120}>
        <p className="mt-10 max-w-3xl text-xs text-ink-3 leading-relaxed">{t('sol.footnote')}</p>
      </Reveal>
    </div>
  )
}
