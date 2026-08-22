import { ProblemGraph } from '@/components/ProblemGraph'
import { useI18n } from '@/i18n'

export default function GraphPage() {
  const { t } = useI18n()
  return (
    <div className="relative" style={{ height: 'calc(100vh - 3.5rem)' }}>
      <div className="absolute top-4 left-5 z-10 pointer-events-none">
        <div className="font-mono2 text-[11px] uppercase tracking-[0.2em] text-ink-3">
          {t('gp.topology')}
        </div>
        <h1 className="font-statement text-2xl font-bold mt-1">
          {t('gp.title')}
        </h1>
        <p className="text-sm text-ink-3 mt-1 max-w-md leading-relaxed">
          {t('gp.desc')}
        </p>
      </div>
      <ProblemGraph full interactive />
    </div>
  )
}
