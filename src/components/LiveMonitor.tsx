import { useEffect, useState } from 'react'
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

export function LiveMonitor() {
  const { lang, t } = useI18n()
  const [data, setData] = useState<MonitorData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/monitor.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="font-mono2 text-xs text-ink-3 animate-pulse">
        {t('lm.loading')}
      </div>
    )
  }
  if (!data) {
    return (
      <div className="text-[15px] text-ink-3">
        {t('lm.empty')}
      </div>
    )
  }

  const withAlerts = data.problems.filter((p) => p.alerts.some((a) => a.type === 'possible_resolution'))
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
        <span>
          {t('lm.verified')} {new Date(data.generated_at).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US')}
        </span>
        {withAlerts.length > 0 && (
          <span className="text-[#8a2f3c] font-medium">
            {t('lm.alerts').replace('{n}', String(withAlerts.length))}
          </span>
        )}
      </div>
      {recent.length > 0 ? (
        <ul className="space-y-3">
          {recent.map((p) => (
            <li key={p.id} className="text-sm">
              <Link to={`/problems/${p.id}`} className="font-mono2 text-xs text-ink-3 uppercase hover:text-ink">
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
              <div className="mt-0.5 font-mono2 text-[11px] text-ink-3">{p.new_works[0].date}</div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[15px] text-ink-3">
          {t('lm.noWorks')}
        </p>
      )}
    </div>
  )
}
