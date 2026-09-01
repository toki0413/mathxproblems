import { useEffect, useRef } from 'react'
import { COMMENTS } from '@/config'

export function Comments({ term }: { term: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!COMMENTS.enabled || !ref.current) return
    const el = ref.current
    el.innerHTML = ''
    const s = document.createElement('script')
    s.src = 'https://giscus.app/client.js'
    s.async = true
    s.crossOrigin = 'anonymous'
    s.setAttribute('data-repo', COMMENTS.repo)
    s.setAttribute('data-repo-id', COMMENTS.repoId)
    s.setAttribute('data-category', COMMENTS.category)
    s.setAttribute('data-category-id', COMMENTS.categoryId)
    s.setAttribute('data-mapping', 'specific')
    s.setAttribute('data-term', term)
    s.setAttribute('data-strict', '1')
    s.setAttribute('data-reactions-enabled', '1')
    s.setAttribute('data-emit-metadata', '0')
    s.setAttribute('data-input-position', 'top')
    s.setAttribute('data-theme', 'light')
    s.setAttribute('data-lang', 'en')
    el.appendChild(s)
  }, [term])

  if (!COMMENTS.enabled) {
    return (
      <div className="border border-dashed border-line-strong p-6 text-sm text-ink-3 leading-relaxed">
        <span className="font-mono2 text-[11px] uppercase tracking-[0.2em] text-ink-2 block mb-2">
          Discussion
        </span>
        Discussion is powered by GitHub Discussions via Giscus, and opens here once the
        site repository enables it. See <code className="font-mono2 text-xs">src/config.ts</code>
        to enable: create a public repo, turn on Discussions, and install the giscus app —
        three steps, after which visitors can comment with a GitHub account.
      </div>
    )
  }
  return <div ref={ref} className="min-h-[8rem]" />
}
