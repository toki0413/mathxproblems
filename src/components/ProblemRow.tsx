import { Link } from 'react-router'
import type { CSSProperties } from 'react'
import { DOMAINS, tierOf, TIER_LABELS, type Problem, type ProblemStatus } from '@/data/problems'
import { useI18n, pickLang, domainLabel, enumLabel } from '@/i18n'

/** 解析状态的颜色：开放=中性、部分解决=琥珀、已解决=绿，与详情页观感一致 */
const STATUS_COLOR: Record<ProblemStatus, string> = {
  open: '#8b887c',
  partial: '#9a5b13',
  resolved: '#1e7a5a',
}

export const DIFFICULTY_STARS: Record<Problem['difficulty'], number> = {
  research: 3,
  advanced: 4,
  frontier: 5,
}

export function Stars({ difficulty, className = '' }: { difficulty: Problem['difficulty']; className?: string }) {
  const n = DIFFICULTY_STARS[difficulty]
  return (
    <span className={`font-mono2 text-[11px] tracking-wider ${className}`} title={`Difficulty ${n}/5`}>
      <span className="text-ink">{'★'.repeat(n)}</span>
      <span className="text-line-strong">{'★'.repeat(5 - n)}</span>
    </span>
  )
}

export function DomainDot({ domain, className = '' }: { domain: Problem['domain']; className?: string }) {
  return (
    <span
      className={`inline-block rounded-full ${className}`}
      style={{ width: 8, height: 8, background: DOMAINS[domain].color }}
    />
  )
}

export function ProblemRow({ p, index }: { p: Problem; index: number }) {
  void index
  const { lang } = useI18n()
  return (
    <Link
      to={`/problems/${p.id}`}
      className="group grid grid-cols-[1fr_auto] md:grid-cols-[1fr_9rem_6.5rem_5.5rem] items-baseline gap-x-6 py-4 hairline-b hover:bg-[#f2f0e8] hover:shadow-[inset_3px_0_0_0_var(--row-accent)] transition-colors px-2 -mx-2"
      style={{ '--row-accent': DOMAINS[p.domain].color } as CSSProperties}
    >
      <span className="min-w-0">
        <span className="block truncate text-[1.05rem] font-medium text-ink group-hover:underline underline-offset-4 decoration-line-strong">
          {pickLang(p, lang)}
        </span>
        {tierOf(p) !== 'core' && (
          <span
            className={`mt-0.5 inline-flex items-center rounded-full border px-2 py-px font-mono2 text-[9px] uppercase tracking-wider ${
              tierOf(p) === 'vetted'
                ? 'text-[#9a5b13] border-[#9a5b13]/40'
                : 'border-dashed text-ink-3 border-line-strong'
            }`}
          >
            {TIER_LABELS[tierOf(p)]}
          </span>
        )}
      </span>
      <span className="hidden md:inline-flex items-center gap-2 text-ink-2">
        <DomainDot domain={p.domain} />
        {domainLabel(DOMAINS[p.domain], lang)}
        <span
          className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono2 text-[10px] uppercase tracking-wider"
          style={{ color: STATUS_COLOR[p.status], borderColor: STATUS_COLOR[p.status] }}
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLOR[p.status] }} />
          {enumLabel(lang, 'status', p.status)}
        </span>
      </span>
      <span className="hidden md:block">
        <Stars difficulty={p.difficulty} />
      </span>
      <span className="font-mono2 text-xs text-ink-3 text-right uppercase">{p.id}</span>
    </Link>
  )
}

