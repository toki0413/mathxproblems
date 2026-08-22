import { Link } from 'react-router'
import { DOMAINS, type Problem } from '@/data/problems'
import { useI18n, pickLang, domainLabel } from '@/i18n'

export const DIFFICULTY_STARS: Record<Problem['difficulty'], number> = {
  research: 3,
  advanced: 4,
  frontier: 5,
}

export function Stars({ difficulty, className = '' }: { difficulty: Problem['difficulty']; className?: string }) {
  const n = DIFFICULTY_STARS[difficulty]
  return (
    <span className={`font-mono2 text-[11px] tracking-wider ${className}`} title={`难度 ${n}/5`}>
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
      className="group grid grid-cols-[1fr_auto] md:grid-cols-[1fr_9rem_6.5rem_5.5rem] items-baseline gap-x-6 py-4 hairline-b hover:bg-[#f2f0e8] transition-colors px-2 -mx-2"
    >
      <span className="min-w-0">
        <span className="block truncate text-[1.05rem] font-medium text-ink group-hover:underline underline-offset-4 decoration-line-strong">
          {pickLang(p, lang)}
        </span>
      </span>
      <span className="hidden md:flex items-center gap-2 text-ink-2">
        <DomainDot domain={p.domain} />
        {domainLabel(DOMAINS[p.domain], lang)}
      </span>
      <span className="hidden md:block">
        <Stars difficulty={p.difficulty} />
      </span>
      <span className="font-mono2 text-xs text-ink-3 text-right uppercase">{p.id}</span>
    </Link>
  )
}

