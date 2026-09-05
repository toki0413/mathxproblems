import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { AUDITED_PROBLEMS } from '@/data/audits'
import {
  DOMAINS,
  RELATION_LABELS,
  impactOf,
  type Domain,
  type Problem,
  type RelationType,
  type FormalizationPotential,
} from '@/data/problems'
import { useI18n, enumLabel, pickLang, domainLabel } from '@/i18n'
import { trpc } from '@/providers/trpc'
import { Stars } from '@/components/ProblemRow'
import type { BitsInfo } from '@/hooks/useBitsIndex'

interface N {
  id: string
  problem: Problem
  x: number
  y: number
  vx: number
  vy: number
  r: number
  domain: Domain
}
interface L {
  a: number
  b: number
  relation: RelationType
  directed: boolean
}

const DIRECTED: RelationType[] = ['depends_on', 'implies', 'generalizes']
export const RELATION_COLORS: Record<RelationType, string> = {
  depends_on: '#8a2f3c',
  implies: '#2f4bb3',
  shares_tools: '#8b887c',
  generalizes: '#1e7a5a',
  analog_of: '#9a5b13',
}
const RELATION_EN: Record<RelationType, string> = {
  depends_on: 'depends on',
  implies: 'implies',
  shares_tools: 'shared tools',
  generalizes: 'generalizes',
  analog_of: 'analogue of',
}
const DIFF_R = { research: 5, advanced: 6, frontier: 7 } as const

/** formalization_potential → 节点光环颜色，与难度/领域构成第三视觉通道 */
const POTENTIAL_COLOR: Record<FormalizationPotential, string> = {
  high: '#1e7a5a',
  medium: '#9a5b13',
  low: '#8b887c',
}

/** Domain glyph: mp circle, mc square, mb triangle, me hexagon, mcs diamond. */
function glyph(ctx: CanvasRenderingContext2D, d: Domain, x: number, y: number, r: number) {
  ctx.beginPath()
  if (d === 'mathematical-physics') {
    ctx.arc(x, y, r, 0, Math.PI * 2)
  } else if (d === 'mathematical-chemistry') {
    ctx.rect(x - r * 0.9, y - r * 0.9, r * 1.8, r * 1.8)
  } else if (d === 'mathematical-biology') {
    ctx.moveTo(x, y - r)
    ctx.lineTo(x + r * 0.95, y + r * 0.72)
    ctx.lineTo(x - r * 0.95, y + r * 0.72)
    ctx.closePath()
  } else if (d === 'mathematical-engineering') {
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 6
      if (i === 0) ctx.moveTo(x + r * Math.cos(a), y + r * Math.sin(a))
      else ctx.lineTo(x + r * Math.cos(a), y + r * Math.sin(a))
    }
    ctx.closePath()
  } else {
    // mathematical-computer-science: diamond
    ctx.moveTo(x, y - r)
    ctx.lineTo(x + r, y)
    ctx.lineTo(x, y + r)
    ctx.lineTo(x - r, y)
    ctx.closePath()
  }
}

const DOMAIN_KEYS = Object.keys(DOMAINS) as Domain[]

/** /api/v1/obstacles.json 的最小契约：跨题障碍链（虚线第二图层） */
interface ObstacleEdge {
  a: { problem: string; head: string }
  b: { problem: string; head: string }
  score: number
}

export function ProblemGraph({
  height = 420,
  focusId,
  interactive = true,
  full = false,
  hoverId,
  onHoverProblem,
  visitedIds,
  hoverPanel = true,
  bitsIndex,
}: {
  height?: number
  focusId?: string
  interactive?: boolean
  /** full = full-viewport exploration mode with filters + detail panel */
  full?: boolean
  /** 外部受控悬停（分屏联动：右侧列表 → 图节点） */
  hoverId?: string | null
  /** 图内悬停上报（图节点 → 右侧列表） */
  onHoverProblem?: (p: Problem | null) => void
  /** 已读问题集合：已读节点空心灰化 */
  visitedIds?: Set<string>
  /** 是否显示右上角悬停卡片（分屏模式下由列表承担，关闭） */
  hoverPanel?: boolean
  /** 逐题累计 bits：节点半径加成 + 悬停卡/图例展示；无后端时缺省 */
  bitsIndex?: ReadonlyMap<string, BitsInfo>
}) {
  const { lang, t } = useI18n()
  const nav = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState<Problem | null>(null)
  // 外部悬停走 ref：hoverId 高频变化不应重建整个力导模拟
  const extHoverRef = useRef<string | null>(null)
  const wakeRef = useRef<(() => void) | null>(null)
  // 障碍链接第二图层：默认关闭，打开后图按「共同困难」重排
  const [obstacleEdges, setObstacleEdges] = useState<ObstacleEdge[]>([])
  const [showObstacles, setShowObstacles] = useState(false)
  const [hidden, setHidden] = useState<Set<Domain>>(new Set())
  const [hiddenRels, setHiddenRels] = useState<Set<RelationType>>(new Set())
  // 额外两个可探索维度：按验证路径 / 按解决状态隐藏节点
  const [hiddenVp, setHiddenVp] = useState<Set<string>>(new Set())
  const [hiddenSt, setHiddenSt] = useState<Set<string>>(new Set())
  // 后台录入的近期更新问题；配合目录里的静态 updates 一起打标记
  const { data: dbRecent = [] } = trpc.updates.recent.useQuery(undefined, { staleTime: 60_000 })
  const recentIds = useMemo(() => {
    const s = new Set<string>(dbRecent)
    AUDITED_PROBLEMS.forEach((p) => {
      if (p.updates?.length) s.add(p.id)
    })
    return s
  }, [dbRecent])
  const recentCount = recentIds.size

  // 障碍链数据：纯静态部署下 404 时静默为空（图层开关仍可出现但无边可画）
  useEffect(() => {
    if (!full) return
    fetch('/api/v1/obstacles.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && Array.isArray(d.links)) setObstacleEdges(d.links as ObstacleEdge[])
      })
      .catch(() => {})
  }, [full])

  useEffect(() => {
    extHoverRef.current = hoverId ?? null
    wakeRef.current?.()
  }, [hoverId])

  const allProblems = focusId
    ? AUDITED_PROBLEMS.filter(
        (p) =>
          p.id === focusId ||
          AUDITED_PROBLEMS.find((q) => q.id === focusId)?.related_problems.some((r) => r.id === p.id) ||
          p.related_problems.some((r) => r.id === focusId),
      )
    : AUDITED_PROBLEMS

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return

    const W = wrap.clientWidth
    const H = full ? wrap.clientHeight : height
    const dpr = window.devicePixelRatio || 1
    canvas.width = W * dpr
    canvas.height = H * dpr
    canvas.style.width = `${W}px`
    canvas.style.height = `${H}px`
    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)

    const problems = allProblems.filter(
      (p) =>
        !hidden.has(p.domain) &&
        !hiddenVp.has(p.verification_path) &&
        !hiddenSt.has(p.status),
    )
    const idx = new Map(problems.map((p, i) => [p.id, i]))
    // seed positions clustered by domain quadrant for topological readability
    const centers: Record<Domain, [number, number]> = {
      'mathematical-physics': [-1, -1],
      'mathematical-chemistry': [1, -1],
      'mathematical-biology': [-1, 1],
      'mathematical-engineering': [1, 1],
      'mathematical-computer-science': [0, 0],
    }
    const spread = Math.min(W, H) * 0.24
    const nodes: N[] = problems.map((p, i) => {
      const [cx, cy] = centers[p.domain]
      const ang = i * 2.399963 // golden angle
      const rad = spread * (0.25 + 0.75 * Math.sqrt((i % 9) / 9))
      return {
        id: p.id,
        problem: p,
        x: W / 2 + cx * spread + rad * Math.cos(ang),
        y: H / 2 + cy * spread * 0.8 + rad * Math.sin(ang),
        vx: 0,
        vy: 0,
        r: p.id === focusId ? DIFF_R[p.difficulty] + 3 : DIFF_R[p.difficulty],
        domain: p.domain,
      }
    })
    const links: L[] = []
    problems.forEach((p, i) =>
      p.related_problems.forEach((r) => {
        const j = idx.get(r.id)
        if (j === undefined) return
        if (links.some((l) => l.a === j && l.b === i)) return
        links.push({ a: i, b: j, relation: r.relation, directed: DIRECTED.includes(r.relation) })
      }),
    )

    // 障碍链 → 节点下标对；打开图层后，吸引力中心从领域象限切换为障碍连通分量
    const obLinks: { a: number; b: number; score: number }[] = []
    if (showObstacles) {
      for (const e of obstacleEdges) {
        const a = idx.get(e.a.problem)
        const b = idx.get(e.b.problem)
        if (a === undefined || b === undefined || a === b) continue
        obLinks.push({ a, b, score: e.score })
      }
    }
    // 并查集求连通分量，每个 ≥2 节点的簇分配到圆环上的一个引力中心
    const targetOf = (() => {
      if (!obLinks.length) return null
      const parent = nodes.map((_, i) => i)
      const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])))
      obLinks.forEach((l) => parent[find(l.a)] = find(l.b))
      const comp = new Map<number, number[]>()
      nodes.forEach((_, i) => {
        const r = find(i)
        comp.set(r, [...(comp.get(r) ?? []), i])
      })
      const clusters = [...comp.values()].filter((c) => c.length >= 2)
      const ring = Math.min(W, H) * 0.3
      const centerOf = new Map<number, [number, number]>()
      clusters.forEach((c, ci) => {
        const ang = (ci / clusters.length) * Math.PI * 2 - Math.PI / 2
        const cx: [number, number] = [W / 2 + ring * Math.cos(ang), H / 2 + ring * 0.82 * Math.sin(ang)]
        c.forEach((i) => centerOf.set(i, cx))
      })
      return centerOf
    })()

    // camera: world→screen is screen = (world - cam) * k + center
    const cam = { x: W / 2, y: H / 2 }
    let k = full ? 0.9 : 1
    const toScreen = (wx: number, wy: number) => ({
      x: (wx - cam.x) * k + W / 2,
      y: (wy - cam.y) * k + H / 2,
    })
    const toWorld = (sx: number, sy: number) => ({
      x: (sx - W / 2) / k + cam.x,
      y: (sy - H / 2) / k + cam.y,
    })

    let dragNode: N | null = null
    let panning = false
    let panStart = { x: 0, y: 0, cx: 0, cy: 0 }
    let moved = 0
    let hoverN: N | null = null
    let raf = 0
    let tick = 0

    const neighborsOf = (n: N | null): Set<number> => {
      if (!n) return new Set()
      const i = nodes.indexOf(n)
      const s = new Set<number>([i])
      links.forEach((l) => {
        if (l.a === i) s.add(l.b)
        if (l.b === i) s.add(l.a)
      })
      obLinks.forEach((l) => {
        if (l.a === i) s.add(l.b)
        if (l.b === i) s.add(l.a)
      })
      return s
    }

    const step = () => {
      tick++
      // 引力中心：障碍图层开启且该节点属于某簇时按簇聚合，否则按领域象限
      for (const n of nodes) {
        const i = nodes.indexOf(n)
        const oc = targetOf?.get(i)
        const [cx, cy] = centers[n.domain]
        const tx = oc ? oc[0] : W / 2 + cx * spread * (targetOf ? 1.35 : 1)
        const ty = oc ? oc[1] : H / 2 + cy * spread * 0.8 * (targetOf ? 1.35 : 1)
        n.vx += (tx - n.x) * 0.0016
        n.vy += (ty - n.y) * 0.0016
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]
          const b = nodes[j]
          let dx = a.x - b.x
          let dy = a.y - b.y
          let d2 = dx * dx + dy * dy
          if (d2 < 1) d2 = 1
          const f = (full ? 5200 : 2600) / d2
          const d = Math.sqrt(d2)
          dx /= d
          dy /= d
          a.vx += dx * f
          a.vy += dy * f
          b.vx -= dx * f
          b.vy -= dy * f
        }
      }
      const rest = full ? 120 : focusId ? 170 : 110
      for (const l of links) {
        const a = nodes[l.a]
        const b = nodes[l.b]
        const dx = b.x - a.x
        const dy = b.y - a.y
        const d = Math.max(Math.hypot(dx, dy), 1)
        const f = (d - rest) * 0.01
        a.vx += (dx / d) * f
        a.vy += (dy / d) * f
        b.vx -= (dx / d) * f
        b.vy -= (dy / d) * f
      }
      for (const n of nodes) {
        if (n === dragNode) continue
        n.vx *= 0.82
        n.vy *= 0.82
        n.x += n.vx
        n.y += n.vy
      }

      // ---- draw ----
      ctx.clearRect(0, 0, W, H)
      const extN = hoverN ? null : (nodes.find((n) => n.id === extHoverRef.current) ?? null)
      const effHover = hoverN ?? extN
      const active = neighborsOf(effHover)
      const dimAll = effHover !== null
      // 入场：节点按序依次浮现（约 1s 内全部到位），内容即运动
      const enter = (i: number) => Math.max(0, Math.min(1, (tick * 3 - i) / 45))

      // 障碍链接：虚线、低透明度、灰墨色——第二图层以线型而非颜色区分
      if (showObstacles) {
        for (const l of obLinks) {
          const a = nodes[l.a]
          const b = nodes[l.b]
          const sa = toScreen(a.x, a.y)
          const sb = toScreen(b.x, b.y)
          const isActive = !dimAll || (active.has(l.a) && active.has(l.b))
          ctx.globalAlpha = (isActive ? 0.28 + l.score * 1.6 : 0.06) * Math.min(enter(l.a), enter(l.b))
          ctx.strokeStyle = '#4c4a42'
          ctx.lineWidth = 1
          ctx.setLineDash([2, 5])
          ctx.beginPath()
          ctx.moveTo(sa.x, sa.y)
          ctx.lineTo(sb.x, sb.y)
          ctx.stroke()
          ctx.setLineDash([])
        }
        ctx.globalAlpha = 1
      }

      // domain cluster labels (zoomed-out cartography)
      if (!focusId) {
        ctx.globalAlpha = Math.max(0, 1.15 - k) * 0.5
        for (const d of DOMAIN_KEYS) {
          const members = nodes.filter((n) => n.domain === d)
          if (!members.length) continue
          const mx = members.reduce((s, n) => s + n.x, 0) / members.length
          const my = members.reduce((s, n) => s + n.y, 0) / members.length
          const s = toScreen(mx, my)
          ctx.font = '600 15px Georgia, "Songti SC", serif'
          ctx.fillStyle = DOMAINS[d].color
          ctx.textAlign = 'center'
          ctx.fillText(domainLabel(DOMAINS[d], lang), s.x, s.y - 64 * k)
          ctx.font = '9px ui-monospace, Menlo, monospace'
          ctx.fillText(`${members.length}`, s.x, s.y - 52 * k)
        }
        ctx.globalAlpha = 1
        ctx.textAlign = 'left'
      }

      // edges
      for (const l of links) {
        if (hiddenRels.has(l.relation)) continue
        const a = nodes[l.a]
        const b = nodes[l.b]
        const sa = toScreen(a.x, a.y)
        const sb = toScreen(b.x, b.y)
        const isActive = !dimAll || (active.has(l.a) && active.has(l.b))
        const color = RELATION_COLORS[l.relation]
        ctx.globalAlpha = (isActive ? 0.9 : 0.12) * Math.min(enter(l.a), enter(l.b))
        ctx.strokeStyle = color
        ctx.lineWidth = isActive ? 1.3 : 0.9
        ctx.setLineDash(l.relation === 'shares_tools' || l.relation === 'analog_of' ? [4, 4] : [])
        ctx.beginPath()
        ctx.moveTo(sa.x, sa.y)
        ctx.lineTo(sb.x, sb.y)
        ctx.stroke()
        ctx.setLineDash([])

        if (l.directed) {
          const dx = sb.x - sa.x
          const dy = sb.y - sa.y
          const d = Math.hypot(dx, dy) || 1
          const ux = dx / d
          const uy = dy / d
          const tx = sb.x - ux * (b.r * k + 6)
          const ty = sb.y - uy * (b.r * k + 6)
          ctx.fillStyle = color
          ctx.beginPath()
          ctx.moveTo(tx + ux * 7, ty + uy * 7)
          ctx.lineTo(tx - uy * 3.5, ty + ux * 3.5)
          ctx.lineTo(tx + uy * 3.5, ty - ux * 3.5)
          ctx.closePath()
          ctx.fill()
        }

        if (isActive && (dimAll || k > 1.35 || focusId)) {
          const mx = (sa.x + sb.x) / 2
          const my = (sa.y + sb.y) / 2
          ctx.font = '9px ui-monospace, Menlo, monospace'
          const label = lang === 'zh' ? RELATION_LABELS[l.relation] : RELATION_EN[l.relation]
          const tw = ctx.measureText(label).width
          ctx.fillStyle = 'rgba(250,250,248,0.92)'
          ctx.fillRect(mx - tw / 2 - 3, my - 7, tw + 6, 14)
          ctx.fillStyle = color
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(label, mx, my)
          ctx.textAlign = 'left'
        }
      }
      ctx.globalAlpha = 1

      // nodes (domain-shaped glyphs)
      ctx.textBaseline = 'middle'
      for (let ni = 0; ni < nodes.length; ni++) {
        const n = nodes[ni]
        const color = DOMAINS[n.domain].color
        const s = toScreen(n.x, n.y)
        // 累计 bits → 半径加成（sqrt 压缩、封顶 2.5px）：推进量一眼可读
        const bitsBoost = Math.min(2.5, Math.sqrt(Math.max(bitsIndex?.get(n.id)?.bits ?? 0, 0)) * 1.1)
        const rr = (n.r + bitsBoost) * Math.min(k, 1.6)
        const isFocus = n.id === focusId
        const isHover = n === effHover
        const isActive = !dimAll || active.has(nodes.indexOf(n))
        const visited = visitedIds?.has(n.id) ?? false
        ctx.globalAlpha = (isActive ? 1 : 0.22) * enter(ni) * (visited && !isHover ? 0.6 : 1)
        if (isFocus || isHover) {
          glyph(ctx, n.domain, s.x, s.y, rr + 4)
          ctx.strokeStyle = color
          ctx.lineWidth = 1
          ctx.stroke()
        }
        glyph(ctx, n.domain, s.x, s.y, rr)
        if (visited) {
          // 已读：空心化（纸底 + 领域色描边），探索进度可视化
          ctx.fillStyle = '#fafaf8'
          ctx.fill()
          ctx.strokeStyle = color
          ctx.lineWidth = 1.2
          ctx.stroke()
        } else {
          ctx.fillStyle = color
          ctx.fill()
        }
        // formalization_potential 光环
        ctx.globalAlpha = isActive ? 0.85 : 0.2
        glyph(ctx, n.domain, s.x, s.y, rr + 4)
        ctx.strokeStyle = POTENTIAL_COLOR[n.problem.formalization_potential]
        ctx.lineWidth = 1.6
        ctx.stroke()
        ctx.globalAlpha = 1
        // 近期有进展标记
        if (recentIds.has(n.id)) {
          const bx = s.x + rr * 0.72
          const by = s.y - rr * 0.72
          ctx.beginPath()
          ctx.arc(bx, by, 3.2, 0, Math.PI * 2)
          ctx.fillStyle = POTENTIAL_COLOR[n.problem.formalization_potential]
          ctx.fill()
          ctx.strokeStyle = '#fafaf8'
          ctx.lineWidth = 1
          ctx.stroke()
        }
        if (isHover || k > 1.05 || focusId) {
          ctx.font = '10px ui-monospace, Menlo, monospace'
          ctx.fillStyle = isHover ? '#16150f' : '#8b887c'
          ctx.fillText(n.id.toUpperCase(), s.x + rr + 5, s.y)
        }
        ctx.globalAlpha = 1
      }

      if (tick < 420 || dragNode || hoverN || panning) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    const wake = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(step)
    }
    wakeRef.current = wake

    const pos = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const pick = (m: { x: number; y: number }) =>
      nodes.find((n) => {
        const s = toScreen(n.x, n.y)
        return Math.hypot(s.x - m.x, s.y - m.y) < Math.max(14, n.r * k + 6)
      }) ?? null

    const onMove = (e: MouseEvent) => {
      const m = pos(e)
      moved += Math.abs(e.movementX) + Math.abs(e.movementY)
      if (dragNode) {
        const w = toWorld(m.x, m.y)
        dragNode.x = w.x
        dragNode.y = w.y
        dragNode.vx = dragNode.vy = 0
      } else if (panning) {
        cam.x = panStart.cx - (m.x - panStart.x) / k
        cam.y = panStart.cy - (m.y - panStart.y) / k
      }
      const hit = pick(m)
      if (hit !== hoverN) {
        hoverN = hit
        setHovered(hit ? hit.problem : null)
        onHoverProblem?.(hit ? hit.problem : null)
      }
      if (tick >= 420) wake()
      canvas.style.cursor = interactive && hit ? 'pointer' : panning ? 'grabbing' : 'default'
    }
    const onDown = (e: MouseEvent) => {
      if (!interactive) return
      moved = 0
      const m = pos(e)
      const hit = pick(m)
      if (hit) {
        dragNode = hit
      } else if (full) {
        panning = true
        panStart = { x: m.x, y: m.y, cx: cam.x, cy: cam.y }
      }
      if (tick >= 420) wake()
    }
    const onUp = (e: MouseEvent) => {
      if (!interactive) return
      const m = pos(e)
      const hit = pick(m)
      if (hit && hit === dragNode && moved < 6) {
        if (full) {
          setHovered(hit.problem)
        } else {
          nav(`/problems/${hit.id}`)
        }
      }
      dragNode = null
      panning = false
    }
    const onWheel = (e: WheelEvent) => {
      if (!full) return
      e.preventDefault()
      const m = pos(e)
      const before = toWorld(m.x, m.y)
      k = Math.max(0.45, Math.min(3.2, k * (e.deltaY > 0 ? 0.9 : 1.1)))
      const after = toWorld(m.x, m.y)
      cam.x += before.x - after.x
      cam.y += before.y - after.y
      wake()
    }

    if (interactive) {
      canvas.addEventListener('mousemove', onMove)
      canvas.addEventListener('mousedown', onDown)
      canvas.addEventListener('mouseup', onUp)
      canvas.addEventListener('wheel', onWheel, { passive: false })
    }
    return () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mousedown', onDown)
      canvas.removeEventListener('mouseup', onUp)
      canvas.removeEventListener('wheel', onWheel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height, focusId, interactive, full, lang, hidden, hiddenRels, hiddenVp, hiddenSt, recentIds, nav, showObstacles, obstacleEdges, visitedIds, bitsIndex])

  const toggleDomain = (d: Domain) =>
    setHidden((s) => {
      const n = new Set(s)
      if (n.has(d)) n.delete(d)
      else n.add(d)
      return n
    })

  const toggleRel = (r: RelationType) =>
    setHiddenRels((s) => {
      const n = new Set(s)
      if (n.has(r)) n.delete(r)
      else n.add(r)
      return n
    })

  const toggleVp = (v: string) =>
    setHiddenVp((s) => {
      const n = new Set(s)
      if (n.has(v)) n.delete(v)
      else n.add(v)
      return n
    })

  const toggleSt = (v: string) =>
    setHiddenSt((s) => {
      const n = new Set(s)
      if (n.has(v)) n.delete(v)
      else n.add(v)
      return n
    })

  // bits 前置：悬停卡读单题，图例只在全库有累计量时出现
  const hoveredBits = hovered ? bitsIndex?.get(hovered.id) : undefined
  const bitsTotal = useMemo(() => {
    let s = 0
    bitsIndex?.forEach((v) => {
      s += v.bits
    })
    return s
  }, [bitsIndex])

  return (
    <div className={full ? 'relative h-full' : ''}>
      <div
        ref={wrapRef}
        className={`graph-frame w-full overflow-hidden ${full ? 'absolute inset-0' : 'hairline-t hairline-b'}`}
      >
        <canvas ref={canvasRef} />
      </div>

      {full && hoverPanel && hovered && (
        <aside className="absolute top-4 right-4 w-[320px] bg-paper/97 backdrop-blur border border-line shadow-sm p-4 pointer-events-auto">
          <div className="font-mono2 text-[11px] uppercase tracking-[0.15em] text-ink-3 flex items-center gap-2">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ background: DOMAINS[hovered.domain].color }}
            />
            {hovered.id.toUpperCase()} · {domainLabel(DOMAINS[hovered.domain], lang)}
          </div>
          <Link to={`/problems/${hovered.id}`} className="block mt-2 group">
            <div className="font-statement text-base leading-snug font-semibold group-hover:underline">
              {pickLang(hovered, lang)}
            </div>
          </Link>
          <div className="mt-3 flex items-center gap-3 text-xs text-ink-2">
            <Stars difficulty={hovered.difficulty} />
            <span className="font-mono2 text-[11px] text-ink-3">{hovered.subdomain}</span>
          </div>
          {hoveredBits && hoveredBits.bits > 0 && (
            <div
              className="mt-2 font-mono2 text-[11px] text-[#1e7a5a]"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              Σ +{hoveredBits.bits.toFixed(2)} bits
              {hoveredBits.lastBand && (
                <span className="text-ink-3"> · {hoveredBits.lastBand}</span>
              )}
            </div>
          )}
          {impactOf(hovered).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {impactOf(hovered).map((d) => (
                <span
                  key={d}
                  className="font-mono2 text-[10px] border border-line rounded-full px-2 py-0.5 text-ink-2"
                >
                  {d}
                </span>
              ))}
            </div>
          )}
          <Link
            to={`/problems/${hovered.id}`}
            className="mt-4 inline-block font-mono2 text-[11px] uppercase tracking-[0.15em] text-ink underline underline-offset-4"
          >
            {t('pg.open')}
          </Link>
        </aside>
      )}

      <div
        className={`flex flex-wrap items-center gap-x-5 gap-y-2 font-mono2 text-[11px] text-ink-3 ${
          full ? 'absolute bottom-3 left-4 right-4' : 'pt-3'
        }`}
      >
        <span className="text-ink-2 uppercase tracking-[0.15em]">
          {t('pg.legend')}
        </span>
        {/* formalization_potential 光环图例 */}
        <span className="bg-paper/80 px-1">
          {t('pg.potential')}
        </span>
        {(
          [
            ['high', '#1e7a5a'],
            ['medium', '#9a5b13'],
            ['low', '#8b887c'],
          ] as const
        ).map(([k, c]) => (
          <span key={k} className="flex items-center gap-1.5 bg-paper/80 px-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ border: `2px solid ${c}` }} />
            {enumLabel(lang, 'potential', k)}
          </span>
        ))}
        {recentCount > 0 && (
          <span className="flex items-center gap-1.5 bg-paper/80 px-1">
            <span className="inline-block w-2 h-2 rounded-full bg-[#1e7a5a]" />
            {t('pg.recent')}
          </span>
        )}
        {(Object.keys(RELATION_LABELS) as RelationType[]).map((r) =>
          full ? (
            <button
              key={r}
              onClick={() => toggleRel(r)}
              className={`flex items-center gap-1.5 bg-paper/80 px-1 transition-opacity ${
                hiddenRels.has(r) ? 'opacity-30 line-through' : ''
              }`}
            >
              <span
                className="inline-block w-5 border-t-2"
                style={{
                  borderColor: RELATION_COLORS[r],
                  borderStyle: r === 'shares_tools' || r === 'analog_of' ? 'dashed' : 'solid',
                }}
              />
              {lang === 'zh' ? RELATION_LABELS[r] : RELATION_EN[r]}
              {DIRECTED.includes(r) && ' →'}
            </button>
          ) : (
            <span key={r} className="flex items-center gap-1.5 bg-paper/80 px-1">
              <span
                className="inline-block w-5 border-t-2"
                style={{
                  borderColor: RELATION_COLORS[r],
                  borderStyle: r === 'shares_tools' || r === 'analog_of' ? 'dashed' : 'solid',
                }}
              />
              {lang === 'zh' ? RELATION_LABELS[r] : RELATION_EN[r]}
              {DIRECTED.includes(r) && ' →'}
            </span>
          ),
        )}
        {full && (
          <>
            <span className="text-line">|</span>
            {DOMAIN_KEYS.map((d) => (
              <button
                key={d}
                onClick={() => toggleDomain(d)}
                className={`flex items-center gap-1.5 bg-paper/80 px-1 transition-opacity ${
                  hidden.has(d) ? 'opacity-30 line-through' : ''
                }`}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ background: DOMAINS[d].color }}
                />
                {domainLabel(DOMAINS[d], lang)}
              </button>
            ))}
            <span className="text-line">|</span>
            <span className="bg-paper/80 px-1">{t('pg.verify')}</span>
            {(['analytical', 'numerical', 'experimental'] as const).map((v) => (
              <button
                key={v}
                onClick={() => toggleVp(v)}
                className={`bg-paper/80 px-1 transition-opacity ${
                  hiddenVp.has(v) ? 'opacity-30 line-through' : ''
                }`}
              >
                {enumLabel(lang, 'verification', v)}
              </button>
            ))}
            <span className="text-line">|</span>
            <span className="bg-paper/80 px-1">{t('pg.status')}</span>
            {(['open', 'partial', 'resolved'] as const).map((v) => (
              <button
                key={v}
                onClick={() => toggleSt(v)}
                className={`bg-paper/80 px-1 transition-opacity ${
                  hiddenSt.has(v) ? 'opacity-30 line-through' : ''
                }`}
              >
                {enumLabel(lang, 'status', v)}
              </button>
            ))}
            {obstacleEdges.length > 0 && (
              <>
                <span className="text-line">|</span>
                <button
                  onClick={() => setShowObstacles((v) => !v)}
                  className={`flex items-center gap-1.5 bg-paper/80 px-1 transition-opacity ${
                    showObstacles ? '' : 'opacity-40'
                  }`}
                  title={lang === 'zh' ? '按共同障碍重新聚类' : 'Re-cluster by shared obstacles'}
                >
                  <span className="inline-block w-5 border-t border-dashed border-[#4c4a42]" />
                  {t('pg.obstacles')}
                </button>
              </>
            )}
            {visitedIds && visitedIds.size > 0 && (
              <>
                <span className="text-line">|</span>
                <span className="flex items-center gap-1.5 bg-paper/80 px-1">
                  <span className="inline-block w-2.5 h-2.5 rounded-full border border-ink-3 bg-paper" />
                  {t('pg.visited')}
                </span>
              </>
            )}
            {bitsTotal > 0 && (
              <>
                <span className="text-line">|</span>
                <span
                  className="flex items-center gap-1.5 bg-paper/80 px-1"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  <span className="inline-block w-3 h-3 rounded-full border-2 border-ink-3" />
                  {t('pg.bitslegend')} · Σ +{bitsTotal.toFixed(1)}
                </span>
              </>
            )}
            <span className="text-line">|</span>
            <span className="bg-paper/80 px-1">
              {t('pg.hint')}
            </span>
          </>
        )}
      </div>
    </div>
  )
}
