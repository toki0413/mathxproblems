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

/** 工具能力矩阵的一行：某工具各角色的链接计数。 */
function roleCounts(
  list: { role: ToolRole }[],
): { available: number; partial: number; missing: number } {
  const c = { available: 0, partial: 0, missing: 0 }
  for (const { role } of list) c[role]++
  return c
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

  // 缺口聚合（解题层引擎的供给侧齿轮）：missing = mathlib 尚缺；partial = mathlib 尚不充分。
  const { missing, partial, totalMissing, totalPartial } = useMemo(() => {
    const missing: { toolId: string; toolName: string; problem: { id: string; title: string; titleZh: string } }[] = []
    const partial: { toolId: string; toolName: string; problem: { id: string; title: string; titleZh: string } }[] = []
    for (const tool of MATHLIB_TOOLS) {
      for (const p of byTool.get(tool.id) ?? []) {
        const item = { toolId: tool.id, toolName: tool.name, problem: p }
        ;(p.role === 'missing' ? missing : p.role === 'partial' ? partial : []).push(item)
      }
    }
    return { missing, partial, totalMissing: missing.length, totalPartial: partial.length }
  }, [byTool])

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

      {/* 能力缺口横幅：把 missing / partial 角色聚合成"mathlib 形式化待办"。
          每个缺口都可点击跳回问题——缺在哪道题、缺什么工具，一次看全。 */}
      <Reveal delay={80}>
        <div className="mt-8 border border-me/30 bg-[#fbf6f3] p-6">
          <div className="flex items-baseline justify-between gap-3 flex-wrap">
            <h2 className="font-statement text-lg font-bold text-ink">{t('tl.gaps.title')}</h2>
            <span className="font-mono2 text-[11px] text-ink-3">
              {totalMissing} {t('tl.gaps.missing')} · {totalPartial} {t('tl.gaps.partial')}
            </span>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-ink-2 leading-relaxed">{t('tl.gaps.subtitle')}</p>
          {missing.length === 0 && partial.length === 0 ? (
            <p className="mt-4 text-xs text-ink-3">{t('tl.gaps.empty')}</p>
          ) : (
            <div className="mt-4 grid gap-x-10 gap-y-4 md:grid-cols-2">
              {missing.length > 0 && (
                <div>
                  <div className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-me mb-2">{t('tl.gaps.missing')}</div>
                  <ul className="divide-y divide-me/15 border-t border-b border-me/15">
                    {missing.map(({ toolId, toolName, problem }) => (
                      <li key={`${toolId}:${problem.id}`}>
                        <Link
                          to={`/problems/${problem.id}`}
                          className="group flex items-baseline gap-2 py-2 hover:bg-[#f3ece6] transition-colors px-1 -mx-1"
                        >
                          <span className="font-mono2 text-[11px] text-me shrink-0">{toolName}</span>
                          <span className="text-ink-2">→</span>
                          <span className="font-mono2 text-[11px] text-ink-3 shrink-0">{problem.id}</span>
                          <span className="min-w-0 flex-1 truncate text-ink group-hover:underline underline-offset-4">
                            {pickLang({ title: problem.title, titleZh: problem.titleZh }, lang)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {partial.length > 0 && (
                <div>
                  <div className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-[#9a5b13] mb-2">{t('tl.gaps.partial')}</div>
                  <ul className="divide-y divide-[#9a5b13]/15 border-t border-b border-[#9a5b13]/15 max-h-72 overflow-y-auto">
                    {partial.map(({ toolId, toolName, problem }) => (
                      <li key={`${toolId}:${problem.id}`}>
                        <Link
                          to={`/problems/${problem.id}`}
                          className="group flex items-baseline gap-2 py-1.5 hover:bg-[#f3ece6] transition-colors px-1 -mx-1"
                        >
                          <span className="font-mono2 text-[11px] text-[#9a5b13] shrink-0">{toolName}</span>
                          <span className="text-ink-2">→</span>
                          <span className="font-mono2 text-[11px] text-ink-3 shrink-0">{problem.id}</span>
                          <span className="min-w-0 flex-1 truncate text-ink group-hover:underline underline-offset-4">
                            {pickLang({ title: problem.title, titleZh: problem.titleZh }, lang)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
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
              const counts = roleCounts(problems)
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
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* 能力矩阵：该工具各角色的链接计数（供给侧覆盖一目了然） */}
                        {(Object.keys(counts) as ToolRole[]).map((role) => (
                          <span
                            key={role}
                            className={`border rounded-full px-2 py-0.5 font-mono2 text-[10px] uppercase tracking-wider ${ROLE_COLOR[role]}`}
                          >
                            {TOOL_ROLE_LABEL[role]} {counts[role]}
                          </span>
                        ))}
                        <span className="border border-line rounded-full px-2.5 py-0.5 font-mono2 text-[10px] uppercase tracking-wider text-ink-3">
                          {tool.category}
                        </span>
                      </div>
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
