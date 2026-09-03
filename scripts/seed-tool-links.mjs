#!/usr/bin/env node
// Seed tool_links for the needs-chain problems (双向映射深化).
//
// 为需求链引用的、尚缺 tool_links 的目录问题注入"问题→工具"链接。链接的角色与
// 工具选择 grounded 于该题的真实数学内容（domain/subdomain/tags/judgment/failure_records），
// 不凭空发明：
//   available = mathlib 该工具族可直接支撑（多用于已带证书的题，如 interval-numerics）；
//   partial   = 该工具族存在但不足以单独完成（多数 open 题）；
//   missing   = 该题真正需要的工具族 mathlib 尚缺（近似算法/在线竞争比/复杂度理论，
//               即 CS 理论侧需求 —— 记录"这里 mathlib 还支撑不了"）。
//
// 幂等：已带 tool_links 的问题跳过；--check 模式下验证注入结果与映射零漂移。
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const path = join(root, 'src/data/problems.ts')
const src = readFileSync(path, 'utf8')
const check = process.argv.includes('--check')

/** 该题 → tool_links（role 与工具 grounded 于题面数学内容）。 */
const LINKS = {
  'mb-005': [
    { tool_id: 'stochastic-processes', role: 'partial' }, // 分支过程/配置模型：SIR 终局规模 LLN
    { tool_id: 'combinatorics-graph', role: 'partial' }, // 簇结构/配置模型的图论刻画
  ],
  'mc-011': [
    { tool_id: 'algebra', role: 'partial' }, // deficiency 理论的代数刻画（stoichiometric subspace）
    { tool_id: 'polynomial-real', role: 'partial' }, // 稳态方程的实代数可解性
    { tool_id: 'lattice-order', role: 'partial' }, // 结构序/偏序路由
  ],
  'mc-012': [
    { tool_id: 'combinatorics-graph', role: 'partial' }, // 图能量极值（Hückel 图族）
    { tool_id: 'analysis-asymptotics', role: 'partial' }, // 极值界/渐近
  ],
  'mb-011': [
    { tool_id: 'stochastic-processes', role: 'partial' }, // 接触过程/粒子系统
    { tool_id: 'measure-ergodic', role: 'partial' }, // 相变/渗流阈值
  ],
  'mb-013': [
    { tool_id: 'stochastic-processes', role: 'partial' }, // 灭绝时间/阈值
    { tool_id: 'analysis-asymptotics', role: 'partial' }, // 阈值指数
    { tool_id: 'dynamical-systems', role: 'partial' }, // SIR 的 ODE 侧
  ],
  'me-010': [
    { tool_id: 'combinatorics-graph', role: 'missing' }, // 图带宽常数近似：mathlib 无近似比/布局理论
    { tool_id: 'convex-optimization', role: 'partial' }, // 布局/带宽的松弛界部分可用
  ],
  'me-011': [
    { tool_id: 'combinatorics-graph', role: 'missing' }, // TSP 近似比（Christofides/4-3）：mathlib 无近似算法理论
    { tool_id: 'convex-optimization', role: 'partial' }, // LP 松弛（匹配/森林）部分可用
  ],
  'me-012': [
    { tool_id: 'convex-optimization', role: 'missing' }, // 强多项式性：LP 对偶在 mathlib，但复杂度理论缺失
    { tool_id: 'analysis-asymptotics', role: 'partial' }, // 迭代复杂度/速率
    { tool_id: 'polynomial-real', role: 'partial' }, // 代数化 LP 方法（椭球/内点）
  ],
  'me-013': [
    { tool_id: 'combinatorics-graph', role: 'missing' }, // 在线装箱竞争比：mathlib 无在线/竞争分析理论
    { tool_id: 'analysis-asymptotics', role: 'partial' }, // 渐近竞争比
  ],
  'mp-022': [
    { tool_id: 'spectral-operator', role: 'partial' }, // Kubo 电导/谱（非交换几何侧）
    { tool_id: 'analysis-asymptotics', role: 'partial' }, // 渐近/可积性估计
  ],
  'mc-014': [
    { tool_id: 'convex-optimization', role: 'partial' }, // Levy–Lieb 泛函的凸性/下确界
    { tool_id: 'analysis-asymptotics', role: 'partial' }, // 泛函分析的界
  ],
  'mc-016': [
    { tool_id: 'analysis-asymptotics', role: 'partial' }, // Lieb–Thirring 锐常数（不等式）
    { tool_id: 'convex-optimization', role: 'partial' }, // 动能泛函的凸性结构
  ],
  'mc-017': [
    { tool_id: 'analysis-asymptotics', role: 'partial' }, // Lieb–Oxford 锐常数
    { tool_id: 'interval-numerics', role: 'available' }, // 已证常数 → 可核验括区（cert）
    { tool_id: 'convex-optimization', role: 'partial' }, // 交换关联泛函的凸包
  ],
  'mc-022': [
    { tool_id: 'combinatorics-graph', role: 'partial' }, // Kekulé 结构=完美匹配计数
    { tool_id: 'algebra', role: 'partial' }, // 组合枚举/代数计数
  ],
  'mc-023': [
    { tool_id: 'convex-optimization', role: 'partial' }, // N-表示性=量子边缘多面体（凸）
    { tool_id: 'analysis-asymptotics', role: 'partial' }, // 多体界
  ],
  'me-017': [
    { tool_id: 'analysis-asymptotics', role: 'partial' }, // Calderón 唯一性/稳定性估计（Lipschitz 已settled）
    { tool_id: 'topology', role: 'partial' }, // 适定性/边值问题
    { tool_id: 'spectral-operator', role: 'partial' }, // Dirichlet-to-Neumann 谱侧
  ],
  'me-018': [
    { tool_id: 'dynamical-systems', role: 'partial' }, // Lyapunov/渐近可控性
    { tool_id: 'topology', role: 'partial' }, // 连续反馈的拓扑障碍（Brockett）
  ],
  'me-021': [
    { tool_id: 'combinatorics-graph', role: 'partial' }, // 离散断层/组合几何唯一性
    { tool_id: 'polynomial-real', role: 'partial' }, // 切换分量/唯一性多项式判据
  ],
  'mc-027': [
    { tool_id: 'stochastic-processes', role: 'partial' }, // 主方程/随机动力学
    { tool_id: 'analysis-asymptotics', role: 'partial' }, // 随机 QSSA 误差界
    { tool_id: 'interval-numerics', role: 'available' }, // 误差括区（cert）
  ],
  'mb-026': [
    { tool_id: 'dynamical-systems', role: 'partial' }, // 周期强迫/次谐波（Arnold 舌）
    { tool_id: 'measure-ergodic', role: 'partial' }, // 锁相/间歇混沌
  ],
  'me-030': [
    { tool_id: 'convex-optimization', role: 'partial' }, // 子模优化/信息增益近似
    { tool_id: 'analysis-asymptotics', role: 'partial' }, // 近似比
    { tool_id: 'combinatorics-graph', role: 'partial' }, // 观测网络/覆盖结构
  ],
  'me-031': [
    { tool_id: 'analysis-asymptotics', role: 'partial' }, // 后验误差界（ROM）
    { tool_id: 'spectral-operator', role: 'partial' }, // POD/奇异值（谱截断）
    { tool_id: 'interval-numerics', role: 'available' }, // 误差括区（cert）
  ],
  'me-032': [
    { tool_id: 'dynamical-systems', role: 'partial' }, // Lyapunov 稳定性证书
    { tool_id: 'convex-optimization', role: 'partial' }, // 神经网络验证（SDP/凸松弛）
    { tool_id: 'interval-numerics', role: 'partial' }, // 数值边界
  ],
  'mp-036': [
    { tool_id: 'measure-ergodic', role: 'partial' }, // 混沌混合/异常耗散
    { tool_id: 'analysis-asymptotics', role: 'partial' }, // Onsager 指数
    { tool_id: 'convex-optimization', role: 'partial' }, // 最优传输（标量输运）
  ],
  'mp-037': [
    { tool_id: 'analysis-asymptotics', role: 'partial' }, // Nusselt 变分上界
    { tool_id: 'interval-numerics', role: 'available' }, // 带证区间（cert）
    { tool_id: 'measure-ergodic', role: 'partial' }, // 对流输运结构
  ],
  'me-034': [
    { tool_id: 'combinatorics-graph', role: 'partial' }, // 量化/离散共识的组合结构
    { tool_id: 'analysis-asymptotics', role: 'partial' }, // 最坏收敛时间
    { tool_id: 'dynamical-systems', role: 'partial' }, // 分布式平均动态
  ],
  'mp-041': [
    { tool_id: 'interval-numerics', role: 'available' }, // 自由对流余量括区（cert）
    { tool_id: 'analysis-asymptotics', role: 'partial' }, // Nusselt 界
  ],
  'mc-030': [
    { tool_id: 'interval-numerics', role: 'available' }, // 目标中间浓度稳定性括区（cert）
    { tool_id: 'polynomial-real', role: 'partial' }, // 稳态可解性
    { tool_id: 'lattice-order', role: 'partial' }, // 单调/偏序结构
  ],
  'mb-028': [
    { tool_id: 'stochastic-processes', role: 'partial' }, // Wright–Fisher/选择-突变
    { tool_id: 'interval-numerics', role: 'available' }, // 等位基因频率带（cert）
  ],
}

// ── 解析 problems.ts 的题块并按需注入 ──
const delim = '\n    id: '
const head = src.slice(0, src.indexOf(delim)) // 首个分隔符之前的原文（join 时统一插入分隔符）
const blocks = src.slice(src.indexOf(delim) + delim.length).split(delim)
const changed = []
const skipped = []
const out = [head]
for (const b of blocks) {
  const m = b.match(/^'([^']+)'/)
  const id = m ? m[1] : null
  const want = id && LINKS[id]
  if (!want) {
    out.push(b)
    continue
  }
  const already = /tool_links:\s*\[/.test(b)
  if (already) {
    skipped.push(id)
    out.push(b)
    continue
  }
  const linksBlock =
    '    tool_links: [\n' +
    want.map((l) => `      { tool_id: '${l.tool_id}', role: '${l.role}' },`).join('\n') +
    '\n    ],\n'
  // 插到 related_problems 那一行的行首（换行之后）之前；没有则插到 statement 行首之前。
  // 这样 related_problems/statement 保留其原有 4 空格缩进，tool_links 与之一致。
  const anchor = b.indexOf('related_problems:')
  const rawPos = anchor >= 0 ? anchor : b.indexOf('statement:')
  if (rawPos < 0) {
    console.error(`cannot find injection anchor for ${id}`)
    process.exit(1)
  }
  const pos = b.lastIndexOf('\n', rawPos) + 1 // 行首：换行之后
  const injected = b.slice(0, pos) + linksBlock + b.slice(pos)
  out.push(injected)
  changed.push(id)
}

if (check) {
  // --check：注入后应无可注入目标遗留（幂等校验）
  const remaining = Object.keys(LINKS).filter((id) => !skipped.includes(id) && !changed.includes(id))
  if (remaining.length) {
    console.error(`FAIL: not seeded for: ${remaining.join(', ')}`)
    process.exit(1)
  }
  // 校验已有链接的题其 tool_links 仍全部指向注册表真工具（由 check:tools 负责）
  console.log(`seed-tool-links --check OK: ${changed.length} seeded this run, ${skipped.length} already linked`)
  process.exit(0)
}

writeFileSync(path, out.join(delim))
console.log(`seeded tool_links: ${changed.length} problems (${skipped.length} already linked, skipped)`)
console.log('changed:', changed.join(', '))
console.log('run `npm run check:tools` to verify no dangling references.')
