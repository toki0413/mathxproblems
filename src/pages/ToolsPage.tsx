import { Link } from 'react-router'
import { useMemo } from 'react'
import { AUDITED_PROBLEMS } from '@/data/audits'
import { MATHLIB_TOOLS, TOOL_ROLE_LABEL, type ToolRole } from '@/data/mathlibTools'
import { Reveal } from '@/components/Reveal'
import { useI18n, pickLang } from '@/i18n'

/** 工具↔题目链接角色徽章色：available=可支撑（绿）、partial=部分（琥珀）、missing=缺失（红）。 */
const ROLE_COLOR: Record<ToolRole, string> = {
  available: 'text-mc border-mc/50',
  partial: 'text-[#9a5b13] border-[#9a5b13]/40',
  missing: 'text-me border-me/50',
}

export default function ToolsPage() {
  const { lang, t } = useI18n()

  // 反查：tool_id → 引用它的题目（含角色）。这是双桥愿景的 A 方向：工具→问题。
  const byTool = useMemo(() => {
    const m = new Map<string, { id: string; title: string; titleZh: string; role: ToolRole }[]>()
    for (const p of AUDITED_PROBLEMS) {
      for (const tl of p.tool_links ?? []) {
        const arr = m.get(tl.tool_id) ?? []
        arr.push({ id: p.id, title: p.title, titleZh: p.titleZh, role: tl.role })
        m.set(tl.tool_id, arr)
      }
    }
    return m
  }, [])

  // 按 category 分组（保持注册表首次出现顺序）
  const categories: { category: string; tools: typeof MATHLIB_TOOLS }[] = []
  for (const tool of MATHLIB_TOOLS) {
    const g = categories.find((c) => c.category === tool.category)
    if (g) g.tools.push(tool)
    else categories.push({ category: tool.category, tools: [tool] })
  }

  const linkedCount = useMemo(() => [...byTool.values()].reduce((s, arr) => s + arr.length, 0), [byTool])

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <Reveal>
        <h1 className="font-statement text-4xl md:text-5xl font-bold tracking-tight">{t('tl.title')}</h1>
        <p className="mt-6 max-w-2xl text-ink-2 leading-relaxed">{t('tl.subtitle')}</p>
      </Reveal>

      <Reveal delay={60}>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-1 text-xs text-ink-3">
          <span>{MATHLIB_TOOLS.length} {t('tl.tools')}</span>
          <span className="mx-1">·</span>
          <span>{linkedCount} {t('tl.links')}</span>
        </div>
      </Reveal>

      {categories.map(({ category, tools }, gi) => (
        <section key={category} className="mt-14">
          <Reveal delay={gi * 40}>
            <h2 className="font-mono2 text-[11px] uppercase tracking-[0.25em] text-ink-3 mb-4">{category}</h2>
          </Reveal>
          <div className="space-y-4">
            {tools.map((tool, ti) => {
              const problems = byTool.get(tool.id) ?? []
              return (
                <Reveal key={tool.id} delay={ti * 20}>
                  <div className="border border-line bg-white/50 p-6">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-statement text-lg font-bold text-ink hover:underline underline-offset-4"
                      >
                        {tool.name}
                      </a>
                      <span className="border border-line rounded-full px-2.5 py-0.5 font-mono2 text-[10px] uppercase tracking-wider text-ink-3 shrink-0">
                        {tool.category}
                      </span>
                    </div>
                    <div className="mt-1.5 font-mono2 text-[11px] text-ink-3 uppercase tracking-[0.12em]">{tool.area}</div>
                    <p className="mt-3 text-sm text-ink-2 leading-relaxed max-w-3xl">{tool.blurb}</p>
                    <div className="mt-4 border-t border-line pt-3">
                      <div className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-ink-3 mb-2">
                        {t('tl.problems')}
                      </div>
                      {problems.length === 0 ? (
                        <p className="text-xs text-ink-3">{t('tl.empty')}</p>
                      ) : (
                        <ul className="divide-y divide-line border-t border-b border-line">
                          {problems.map(({ id, title, titleZh, role }) => (
                            <li key={id}>
                              <Link
                                to={`/problems/${id}`}
                                className="group flex items-baseline gap-3 py-2.5 hover:bg-[#f2f0e8] transition-colors px-1 -mx-1"
                              >
                                <span className="font-mono2 text-[11px] text-ink-3 shrink-0">{id}</span>
                                <span className="min-w-0 flex-1 truncate text-ink group-hover:underline underline-offset-4 decoration-line-strong">
                                  {pickLang({ title, titleZh }, lang)}
                                </span>
                                <span className={`border rounded-full px-1.5 py-px font-mono2 text-[9px] uppercase tracking-wider shrink-0 ${ROLE_COLOR[role]}`}>
                                  {TOOL_ROLE_LABEL[role]}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
