// 目录可视化（纸墨主题，recharts 轻量封装）。
// 数据全部派生自 AUDITED_PROBLEMS，随目录零漂移；不引入 shadcn ChartContainer，
// 直接控制纸张/墨色轴与 tooltip 样式，与站内既有视觉语言一致。
import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { AUDITED_PROBLEMS } from '@/data/audits'
import { DOMAINS, type Domain } from '@/data/problems'
import { useI18n, domainLabel, enumLabel } from '@/i18n'

const INK = 'var(--ink)'
const INK2 = 'var(--ink-2)'
const INK3 = 'var(--ink-3)'
const LINE = 'var(--line)'
const LINE_STRONG = 'var(--line-strong)'

const axisTick = { fontSize: 10, fill: INK3 }
const axisLine = { stroke: LINE_STRONG }

/** 与纸墨主题一致的轻量 tooltip（recharts content 注入 props；多段 stack 逐条列出）。 */
function ChartTip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ name?: string; value?: number | string; color?: string; payload?: { fill?: string } }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  const items = payload
    .filter((p) => p.value !== undefined && p.value !== null)
    .map((p) => ({
      name: p.name,
      value: p.value,
      color: p.color ?? p.payload?.fill ?? INK,
    }))
  if (!items.length) return null
  return (
    <div className="min-w-[6rem] border border-line-strong bg-paper px-3 py-2 font-mono2 text-xs shadow-sm">
      {label && <div className="mb-1 text-ink-3">{label}</div>}
      <div className="space-y-0.5">
        {items.map((it, i) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-ink-2">
              <span className="inline-block h-2 w-2 shrink-0 rounded-[2px]" style={{ background: it.color }} />
              {it.name}
            </span>
            <span className="font-semibold text-ink" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {it.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** 目录增长：按 date_added 累计收录面积图（阶跃曲线如实反映批量录入）。 */
export function CatalogGrowth({ full = false }: { full?: boolean }) {
  const { lang, t } = useI18n()
  const data = useMemo(() => {
    const m = new Map<string, number>()
    for (const p of AUDITED_PROBLEMS) m.set(p.date_added, (m.get(p.date_added) ?? 0) + 1)
    return [...m.keys()].sort().reduce<{ date: string; n: number }[]>((rows, d) => {
      const prev = rows.length ? rows[rows.length - 1].n : 0
      rows.push({ date: d.slice(5), n: prev + (m.get(d) ?? 0) })
      return rows
    }, [])
  }, [])
  return (
    <div role="img" aria-label={t('st.growth')}>
      <ResponsiveContainer width="100%" height={full ? 240 : 190}>
        <AreaChart data={data} margin={{ top: 6, right: 10, left: -22, bottom: 0 }}>
          <defs>
            <linearGradient id="catalogGrowthFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={INK} stopOpacity={0.16} />
              <stop offset="100%" stopColor={INK} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={LINE} vertical={false} />
          <XAxis dataKey="date" tick={axisTick} axisLine={axisLine} tickLine={false} />
          <YAxis tick={axisTick} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip content={<ChartTip />} cursor={{ stroke: LINE_STRONG }} />
          <Area
            type="stepAfter"
            dataKey="n"
            name={lang === 'zh' ? '累计' : 'cumulative'}
            stroke={INK}
            strokeWidth={1.6}
            fill="url(#catalogGrowthFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

/** 领域分布：五域环形图，中心为总数，右侧图例带计数。 */
export function DomainDonut() {
  const { lang, t } = useI18n()
  const data = useMemo(
    () =>
      (Object.keys(DOMAINS) as Domain[]).map((d) => ({
        key: d,
        name: domainLabel(DOMAINS[d], lang),
        value: AUDITED_PROBLEMS.filter((p) => p.domain === d).length,
        color: DOMAINS[d].color,
      })),
    [lang],
  )
  const total = AUDITED_PROBLEMS.length
  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center" role="img" aria-label={t('home.pulse.domains')}>
      <div className="relative h-40 w-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="88%"
              paddingAngle={2}
              strokeWidth={0}
              isAnimationActive={false}
            >
              {data.map((d) => (
                <Cell key={d.key} fill={d.color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-statement text-3xl font-bold text-ink" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {total}
          </span>
          <span className="font-mono2 text-[9px] uppercase tracking-[0.18em] text-ink-3">{t('chart.unit')}</span>
        </div>
      </div>
      <ul className="w-full min-w-0 space-y-2 sm:flex-1">
        {data.map((d) => (
          <li key={d.key} className="flex items-baseline gap-2 text-xs">
            <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: d.color }} />
            <span className="truncate text-ink-2">{d.name}</span>
            <span className="ml-auto font-mono2 text-ink-3" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {d.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** 子领域广度：Top-N 横向条形。 */
export function SubdomainRank({ n = 8 }: { n?: number }) {
  const { lang, t } = useI18n()
  const data = useMemo(() => {
    const m = new Map<string, number>()
    for (const p of AUDITED_PROBLEMS) m.set(p.subdomain, (m.get(p.subdomain) ?? 0) + 1)
    return [...m.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([name, value]) => ({ name, value }))
  }, [n])
  const height = data.length * 26 + 16
  return (
    <div role="img" aria-label={t('st.subdomains')}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 14, left: 8, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={156}
            tick={{ fontSize: 10, fill: INK2 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(22,21,15,0.05)' }} />
          <Bar dataKey="value" name={lang === 'zh' ? '题数' : 'count'} fill={INK} radius={[0, 2, 2, 0]} barSize={14} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

const DIFF_ORDER = ['frontier', 'research', 'advanced'] as const
/** 难度堆叠用墨色梯度（不与领域色冲突）。 */
const DIFF_COLOR: Record<(typeof DIFF_ORDER)[number], string> = {
  frontier: '#16150f',
  research: '#5b594f',
  advanced: '#a5a193',
}

/** 领域 × 难度堆叠条形。 */
export function DomainDifficulty() {
  const { lang, t } = useI18n()
  const data = useMemo(() => {
    return (Object.keys(DOMAINS) as Domain[]).map((d) => {
      const probs = AUDITED_PROBLEMS.filter((p) => p.domain === d)
      const row: Record<string, string | number> = { domain: domainLabel(DOMAINS[d], lang) }
      for (const lv of DIFF_ORDER) row[lv] = probs.filter((p) => p.difficulty === lv).length
      return row
    })
  }, [lang])
  return (
    <div role="img" aria-label={t('st.domainDifficulty')}>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 6, right: 10, left: -22, bottom: 0 }}>
          <CartesianGrid stroke={LINE} vertical={false} />
          <XAxis dataKey="domain" tick={{ fontSize: 9, fill: INK2 }} axisLine={axisLine} tickLine={false} interval={0} />
          <YAxis tick={axisTick} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(22,21,15,0.05)' }} />
          {DIFF_ORDER.map((lv) => (
            <Bar
              key={lv}
              dataKey={lv}
              stackId="d"
              fill={DIFF_COLOR[lv]}
              name={enumLabel(lang, 'difficulty', lv)}
              barSize={22}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
