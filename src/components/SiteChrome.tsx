import { Link, NavLink, useLocation } from 'react-router'
import { useEffect, useState } from 'react'
import { CATALOG_COUNT } from '@/data/catalogMeta'
import { GOAL_PROBLEMS } from '@/const'
import { useI18n } from '@/i18n'

const NAV = [
  { to: '/problems', key: 'nav.problems' },
  { to: '/graph', key: 'nav.graph' },
  { to: '/impact', key: 'nav.impact' },
  { to: '/needs', key: 'nav.needs' },
  { to: '/ledger', key: 'nav.ledger' },
  { to: '/laws', key: 'nav.laws' },
  { to: '/tools', key: 'nav.tools' },
  { to: '/obstacles', key: 'nav.obstacles' },
  { to: '/stats', key: 'nav.stats' },
  { to: '/about', key: 'nav.about' },
  { to: '/api', key: 'nav.api' },
]

export function SiteHeader() {
  const loc = useLocation()
  const [open, setOpen] = useState(false)
  const { t } = useI18n()
  useEffect(() => setOpen(false), [loc.pathname])
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [loc.pathname])

  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur hairline-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 h-14">
        <Link to="/" className="flex items-baseline gap-2 group">
          <span className="font-statement text-xl font-bold tracking-tight">
            Math<span className="italic">X</span>
          </span>
          <span className="font-mono2 text-[11px] uppercase tracking-[0.18em] text-ink-3 group-hover:text-ink transition-colors">
            Problems
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `px-3 py-1.5 text-sm transition-colors ${
                  isActive
                    ? 'text-ink font-medium underline decoration-ink decoration-[1.5px] underline-offset-[7px]'
                    : 'text-ink-3 hover:text-ink'
                }`
              }
            >
              {t(n.key)}
            </NavLink>
          ))}
          <Link
            to="/submit"
            className="ml-2 px-3 py-1.5 text-sm border border-line rounded-full text-ink-2 hover:bg-ink hover:text-paper hover:border-ink transition-colors"
          >
            {t('nav.submit')}
          </Link>
          <span className="font-mono2 text-[11px] text-ink-3 border border-line rounded-full px-2.5 py-0.5 ml-2">
            {CATALOG_COUNT} {t('nav.count')}
          </span>
        </nav>
        <button
          className="md:hidden font-mono2 text-xs uppercase tracking-widest text-ink-2"
          onClick={() => setOpen(!open)}
        >
          {open ? t('nav.close') : t('nav.menu')}
        </button>
      </div>
      {open && (
        <nav className="md:hidden hairline-t px-5 py-3 flex flex-col gap-1">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className="py-2 text-sm text-ink-2">
              {t(n.key)}
            </NavLink>
          ))}
          <NavLink to="/submit" className="py-2 text-sm text-ink-2">
            {t('nav.submit')}
          </NavLink>
        </nav>
      )}
    </header>
  )
}

export function SiteFooter() {
  const { t } = useI18n()
  return (
    <footer className="hairline-t mt-24">
      <div className="mx-auto max-w-6xl px-5 py-10 grid gap-8 md:grid-cols-3 text-sm">
        <div>
          <div className="font-statement text-lg font-bold">
            Math<span className="italic">X</span>{' '}
            <span className="font-mono2 text-[11px] uppercase tracking-[0.18em] text-ink-3">
              Problems
            </span>
          </div>
          <p className="mt-3 text-ink-3 leading-relaxed max-w-xs">{t('footer.tagline')}</p>
        </div>
        <div className="text-ink-3 leading-loose">
          <div className="font-mono2 text-[11px] uppercase tracking-[0.18em] text-ink-2 mb-2">
            {t('footer.principles')}
          </div>
          {t('footer.principles.body')}
          <br />
          {t('footer.principles.body2')}
        </div>
        <div className="text-ink-3 leading-loose">
          <div className="font-mono2 text-[11px] uppercase tracking-[0.18em] text-ink-2 mb-2">
            {t('footer.criteria')}
          </div>
          {t('footer.criteria.body')}
          <br />
          {t('footer.criteria.body2')}
        </div>
      </div>
      <div className="hairline-t">
        <div className="mx-auto max-w-6xl px-5 py-4 font-mono2 text-[11px] text-ink-3 flex flex-wrap gap-x-6 gap-y-1">
          <span>© 2026 MathX Problems</span>
          <Link to="/blog/formalization-frontier" className="hover:text-ink underline underline-offset-4">
            {t('footer.essay')}
          </Link>
          <Link to="/blog/cn-audit-gate" className="hover:text-ink underline underline-offset-4">
            {t('footer.essay.cn')}
          </Link>
          <span>
            {t('footer.collected')} {CATALOG_COUNT} / {t('footer.goal')} {GOAL_PROBLEMS}
          </span>
          <span>{t('footer.license')}</span>
        </div>
      </div>
    </footer>
  )
}
