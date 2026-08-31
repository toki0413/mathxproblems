import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { useI18n } from '@/i18n'

interface MonitorWork {
  title: string
  date: string
  url?: string
  source?: 'openalex' | 'arxiv'
}
interface MonitorEntry {
  id: string
  title: string
  query: string
  new_works: MonitorWork[]
  alerts: { type: string; work?: MonitorWork; message?: string }[]
}
interface MonitorData {
  generated_at: string
  since: string
  problems: MonitorEntry[]
}

const POLL_MS = 60_000

/**
 * 活馈式文献监测：每 60s 轮询一次 monitor.json，「活着」来自数据本身，
 * 不来自 loading 脉冲或滚动渐显。新条目以短促的 lm-enter 进入；
 * 「可能已解决」告警单列一行 ticker，与常规新文献分通道。
 */
export function LiveMonitor() {
  const { lang, t } = useI18n()
  const [data, setData] = useState<MonitorData | null>(null)
  const [loading, setLoading] = useState(true)
  // 上次已见条目（problemId:title），轮询到的新条目播放入场动画
  const seenRef = useRef<Set<string> | null>(null)
  const [fresh, setFresh] = useState<Set<string>>(new Set())

  useEffect(() => {
    let stop = false
    const load = () =>
      fetch('/monitor.json')
        .then((r) => (r.ok ? r.json() : null))
        .then((d: MonitorData | null) => {
          if (stop || !d) return
          const keys = new Set(
            d.problems.flatMap((p) => p.new_works.map((w) => `${p.id}:${w.title}`)),
          )
          if (seenRef.current !== null) {
            const added = new Set([...keys].filter((k) => !seenRef.current!.has(k)))
            if (added.size) {
              setFresh(added)
              setTimeout(() => setFresh(new Set()), 1600)
            }
          }
          seenRef.current = keys
          setData(d)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    load()
    const timer = setInterval(load, POLL_MS)
    return () => {
      stop = true
      clearInterval(timer)
    }
  }, [])

  if (loading) {
    return <div className="font-mono2 text-xs text-ink-3 animate-pulse">{t('lm.loading')}</div>
  }
  if (!data) {
    return <div className="text-[15px] text-ink-3">{t('lm.empty')}</div>
  }

  const withAlerts = data.problems.filter((p) =>
    p.alerts.some((a) => a.type === 'possible_resolution'),
  )
  const recent = [...data.problems]
    .filter((p) => p.new_works.length > 0)
    .sort((a, b) => {
      const da = a.new_works[0]?.date ?? ''
      const db = b.new_works[0]?.date ?? ''
      return db.localeCompare(da)
    })
    .slice(0, 4)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono2 text-xs text-ink-3">
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
          {t('lm.verified')}{' '}
          {new Date(data.generated_at).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US')}
        </span>
      </div>

      {/* 告警 ticker：分通道常显，不混进常规文献流 */}
      {withAlerts.length > 0 && (
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border border-[#8a2f3c]/40 bg-[#8a2f3c]/5 px-3 py-2">
          <span className="font-mono2 text-[10px] uppercase tracking-[0.15em] text-[#8a2f3c] shrink-0">
            {t('lm.alerts').replace('{n}', String(withAlerts.length))}
          </span>
          {withAlerts.map((p) => (
            <Link
              key={p.id}
              to={`/problems/${p.id}`}
              className="font-mono2 text-[11px] uppercase text-[#8a2f3c] underline underline-offset-4 hover:opacity-75"
            >
              {p.id}
            </Link>
          ))}
        </div>
      )}

      {recent.length > 0 ? (
        <ul className="space-y-3">
          {recent.map((p) => {
            const key = `${p.id}:${p.new_works[0].title}`
            return (
              <li key={p.id} className={`text-sm ${fresh.has(key) ? 'lm-enter' : ''}`}>
                <Link
                  to={`/problems/${p.id}`}
                  className="font-mono2 text-xs text-ink-3 uppercase hover:text-ink"
                >
                  {p.id}
                </Link>
                <div className="mt-0.5 text-ink-2 leading-snug">
                  {p.new_works[0].source && (
                    <span className="font-mono2 text-[10px] uppercase border border-line px-1.5 py-px mr-2 text-ink-3">
                      {p.new_works[0].source}
                    </span>
                  )}
                  {p.new_works[0].title}
                </div>
                <div
                  className="mt-0.5 font-mono2 text-[11px] text-ink-3"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {p.new_works[0].date}
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="text-[15px] text-ink-3">{t('lm.noWorks')}</p>
      )}
    </div>
  )
}
