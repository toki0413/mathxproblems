import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { AUDITED_PROBLEMS } from '@/data/audits'
import { DOMAINS, type Domain, type Problem } from '@/data/problems'
import { ProblemGraph } from '@/components/ProblemGraph'
import { useI18n, pickLang, domainLabel } from '@/i18n'
import { useVisited } from '@/hooks/useVisited'
import { useBitsIndex } from '@/hooks/useBitsIndex'

/**
 * 图谱页：左图右文的分屏联动。图是导航仪器，不是装饰总览——
 * hover 图节点 → 右侧对应条目高亮并滚入视野；hover 列表条目 → 图中节点成为焦点。
 * 已读问题在两侧同步灰化（图中空心、列表划线），把探索进度还给用户。
 */
export default function GraphPage() {
  const { lang, t } = useI18n()
  const nav = useNavigate()
  const [focus, setFocus] = useState<string>()
  const [q, setQ] = useState('')
  const [hoverId, setHoverId] = useState<string | null>(null)
  const visited = useVisited()
  // 逐题累计 bits：图节点半径编码 + 索引行徽标共用一份索引
  const bitsIndex = useBitsIndex()
  const rowRefs = useRef(new Map<string, HTMLButtonElement>())

  const matches = q.trim()
    ? AUDITED_PROBLEMS.filter((p) =>
        `${p.id} ${p.title} ${p.titleZh}`.toLowerCase().includes(q.trim().toLowerCase()),
      ).slice(0, 8)
    : []

  // 索引按领域分组，顺序与图例一致，便于建立「领域 ↔ 区域」的心智地图
  const grouped = useMemo(
    () =>
      (Object.keys(DOMAINS) as Domain[]).map((d) => ({
        domain: d,
        items: AUDITED_PROBLEMS.filter((p) => p.domain === d),
      })),
    [],
  )

  const pick = (id: string) => {
    setFocus(id)
    setQ('')
  }

  // 图 → 列表：高亮并滚动到对应行（block:'nearest' 避免大幅跳动）
  const onGraphHover = (p: Problem | null) => {
    setHoverId(p ? p.id : null)
    if (p) rowRefs.current.get(p.id)?.scrollIntoView({ block: 'nearest' })
  }

  return (
    <div
      className="grid lg:grid-cols-[1fr_26rem]"
      style={{ height: 'calc(100vh - 3.5rem)' }}
    >
      {/* 左：图谱 */}
      <div className="relative min-h-[50vh]">
        <div className="absolute top-4 left-5 z-10">
          <div className="font-mono2 text-[11px] uppercase tracking-[0.2em] text-ink-3">
            {t('gp.topology')}
          </div>
          <h1 className="font-statement text-2xl font-bold mt-1">{t('gp.title')}</h1>
          <div className="relative mt-3 max-w-xs">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('pg.search')}
              className="w-full bg-paper border border-line px-3 py-1.5 text-sm focus:outline-none focus:border-ink"
            />
            {focus && (
              <button
                onClick={() => {
                  setFocus(undefined)
                  setQ('')
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 font-mono2 text-[11px] uppercase text-ink-3 hover:text-ink"
              >
                {t('pg.clear')}
              </button>
            )}
            {q.trim() && matches.length > 0 && (
              <ul className="absolute left-0 right-0 top-full mt-1 max-h-72 overflow-auto bg-paper border border-line shadow-sm z-20">
                {matches.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => pick(p.id)}
                      className="flex items-baseline gap-3 w-full text-left px-3 py-2 hover:bg-[#f2f0e8] text-sm"
                    >
                      <span className="font-mono2 text-[11px] text-ink-3 shrink-0 uppercase">
                        {p.id}
                      </span>
                      <span className="truncate">{p.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <ProblemGraph
          full
          interactive
          focusId={focus}
          hoverId={hoverId}
          onHoverProblem={onGraphHover}
          visitedIds={visited}
          hoverPanel={false}
          bitsIndex={bitsIndex}
        />
      </div>

      {/* 右：可滚动索引 */}
      <aside className="hidden lg:flex flex-col hairline-t lg:border-t-0 lg:border-l border-line bg-paper min-h-0">
        <div className="flex items-baseline justify-between px-5 py-3 hairline-b shrink-0">
          <span className="font-mono2 text-[11px] uppercase tracking-[0.2em] text-ink-3">
            {t('gp.index')}
          </span>
          <span
            className="font-mono2 text-[11px] text-ink-3"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {t('gp.readcount')
              .replace('{v}', String(visited.size))
              .replace('{t}', String(AUDITED_PROBLEMS.length))}
          </span>
        </div>
        <div className="overflow-y-auto min-h-0 flex-1">
          {grouped.map(({ domain, items }) => (
            <div key={domain}>
              <div
                className="sticky top-0 z-10 px-5 py-1.5 font-mono2 text-[10px] uppercase tracking-[0.18em] hairline-b"
                style={{ color: DOMAINS[domain].color, background: 'var(--paper)' }}
              >
                {domainLabel(DOMAINS[domain], lang)} · {items.length}
              </div>
              {items.map((p) => {
                const isVisited = visited.has(p.id)
                const isHover = hoverId === p.id
                const bits = bitsIndex.get(p.id)?.bits ?? 0
                return (
                  <button
                    key={p.id}
                    ref={(el) => {
                      if (el) rowRefs.current.set(p.id, el)
                      else rowRefs.current.delete(p.id)
                    }}
                    onMouseEnter={() => setHoverId(p.id)}
                    onMouseLeave={() => setHoverId(null)}
                    onClick={() => nav(`/problems/${p.id}`)}
                    className={`flex items-baseline gap-3 w-full text-left px-5 py-2 hairline-b transition-colors ${
                      isHover ? 'bg-[#f2f0e8]' : ''
                    }`}
                  >
                    <span className="font-mono2 text-[11px] text-ink-3 shrink-0 uppercase w-14">
                      {p.id}
                    </span>
                    <span
                      className={`text-[13px] leading-snug ${
                        isVisited ? 'line-through text-ink-3' : 'text-ink'
                      }`}
                    >
                      {pickLang(p, lang)}
                    </span>
                    {bits > 0 && (
                      <span
                        className="ml-auto shrink-0 font-mono2 text-[10px] text-[#1e7a5a]"
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                        title={t('gp.bits')}
                      >
                        +{bits.toFixed(1)}b
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}
