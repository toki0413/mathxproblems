import { useState } from 'react'
import { PROBLEMS } from '@/data/problems'
import { ProblemGraph } from '@/components/ProblemGraph'
import { useI18n } from '@/i18n'

export default function GraphPage() {
  const { t } = useI18n()
  // 搜索词与当前聚焦的节点 id，聚焦后 ProblemGraph 只展示该节点及其邻域
  const [focus, setFocus] = useState<string>()
  const [q, setQ] = useState('')
  const matches = q.trim()
    ? PROBLEMS.filter((p) =>
        `${p.id} ${p.title} ${p.titleZh}`.toLowerCase().includes(q.trim().toLowerCase()),
      ).slice(0, 8)
    : []

  const pick = (id: string) => {
    setFocus(id)
    setQ('')
  }

  return (
    <div className="relative" style={{ height: 'calc(100vh - 3.5rem)' }}>
      <div className="absolute top-4 left-5 z-10">
        <div className="font-mono2 text-[11px] uppercase tracking-[0.2em] text-ink-3">
          {t('gp.topology')}
        </div>
        <h1 className="font-statement text-2xl font-bold mt-1">
          {t('gp.title')}
        </h1>
        <p className="text-sm text-ink-3 mt-1 max-w-md leading-relaxed pointer-events-none">
          {t('gp.desc')}
        </p>

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
                    <span className="font-mono2 text-[11px] text-ink-3 shrink-0 uppercase">{p.id}</span>
                    <span className="truncate">{p.titleZh || p.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <ProblemGraph full interactive focusId={focus} />
    </div>
  )
}