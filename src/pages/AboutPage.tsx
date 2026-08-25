import { Reveal } from '@/components/Reveal'
import { Link } from 'react-router'
import { useI18n } from '@/i18n'

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="font-statement text-2xl md:text-3xl font-bold tracking-tight mt-16 mb-6">{children}</h2>
)

const C = {
  zh: {
    intro: (
      <>
        对外定位：<strong>AI for math 向自然科学和工程系统传导的翻译层与接口层</strong>。
        启动标准：务实优先，先让问题站住，再在社区反馈中生长。
      </>
    ),
    filter: [
      ['Q1', '能否精确陈述“要算什么 / 证什么 / 分什么类”？', '证明、计算、显式公式、复杂度判定均可'],
      ['Q2', '解决它是否需要做新实验或部署真实系统？', '答案必须为“否”'],
      ['Q3', '解决它是否只需要纸、笔、逻辑推理（或 Lean / Coq / 数值验证）？', '答案必须为“是”'],
    ],
    exception:
      '例外通道：三问未全过，但问题足够具体、有明确数学结构、有社区价值 → 可人工特批收录，并在题面显著标注。',
    workflow: [
      '提案：站内提交表单（登录后），或通过 GitHub PR 按 Markdown + YAML 模板提交',
      '筛选：三问筛选器初判，必要时进入例外通道',
      '查重：MathOverflow / arXiv 检索，确认未解且未被 Clay / Wikipedia 级资源覆盖',
      '收录：标注来源、障碍、形式化潜力、验证路径、影响领域与问题关系',
      '复审：每周自动核验 + 每季度人工复查状态（open → partial → resolved），保留解决记录',
    ],
    qc: [
      '三问筛选器通过（Q1–Q3）或例外通道批准',
      '数学陈述足够精确（研究生能理解“要算什么 / 证什么”）',
      '科学 / 工程来源已标注',
      '区分了“已知部分结果”和“完全未解”',
      '记录了已知障碍（方法困难或技术瓶颈）',
      '评估了形式化潜力（high / medium / low）',
      '标注了验证路径与影响领域',
      '参考文献至少一篇可获取',
    ],
    notdoing: [
      ['收录纯数学问题（数论、代数几何、拓扑）', 'Open Problem Garden 和 AIM 已覆盖'],
      ['收录“设计 / 优化 / 提出”类工程任务', '非数学问题'],
      ['做实验验证', '只收录逻辑 / 区间算术可核验交出的判定'],
      ['把原始数值模拟当成答案而不给残差界', '单点仿真不是证书；带三层残差总带的判定性证书才是（数值路径同样可收）'],
      ['做 AI 智能体或自动证明工具', '那是其他项目的方向，我们提供问题层'],
      ['做竞赛或悬赏', 'Millennium Prize 模式'],
      ['收录顶级知名问题（Yang–Mills、Riemann）', 'Wikipedia 和 Clay 已覆盖'],
    ],
    maintenance: [
      ['每周自动核验', 'GitHub Actions 每周一运行核验脚本：对每道题用其标签同时检索 OpenAlex 与 arXiv 最近 7 天新文献，检测“solved / we prove / disproved”等解决信号，结果写入 monitor.json 并在首页展示。'],
      ['状态生命周期', 'open → partial → resolved，季度复审；被解决的题目保留完整档案（解决者、论文、日期）而非删除——解决记录本身是站点价值的证明。'],
      ['数据接口', 'problems.json 与 benchmark.json 随每次部署自动更新，AI 基准可直接订阅。'],
    ],
    contribute:
      '提案新问题：登录后使用提交表单，通过三问筛选器即可进入审核队列。尤其欢迎：已知障碍的补充、形式化进度的更新、问题关系与影响领域的标注。',
    goal: (
      <>
        收录里程碑 100 题。选题以<strong>真实工作流缺口</strong>为准，而非单纯用完配额；尤其欢迎
        <strong>材料与工程系统中的带证判定</strong>问题（相变与结构稳定性、热 / 力学性能裕量、
        工艺-性能曲线、失效阈值），它们普遍有明确输入不确定度、值得一份可核验残差带的判定。
        指标：收录数、MathOverflow / 论文引用、AI 基准对{' '}
        <Link to="/api" className="underline underline-offset-4">benchmark.json</Link> 的采纳。
      </>
    ),
    goalTitle: '目标规模',
  },
  en: {
    intro: (
      <>
        Positioning: <strong>the translation and interface layer conducting AI for math into the
        natural sciences and engineering systems</strong>. Pragmatism first: make problems stand,
        then grow with community feedback.
      </>
    ),
    filter: [
      ['Q1', 'Can it be stated precisely — what to compute, prove, or classify?', 'Proofs, computations, explicit formulas, complexity classifications all count'],
      ['Q2', 'Does solving it require new experiments or deployed systems?', 'The answer must be “no”'],
      ['Q3', 'Is it solvable by pen, paper, and logic (or Lean / Coq / certified numerics)?', 'The answer must be “yes”'],
    ],
    exception:
      'Exception channel: if the filter is not fully met but the problem is concrete, mathematically structured, and valuable to the community, it may be admitted by manual review with a visible flag.',
    workflow: [
      'Proposal: in-site submission form (after sign-in), or a GitHub PR using the Markdown + YAML template',
      'Screening: the three-question filter, with the exception channel when needed',
      'Deduplication: MathOverflow / arXiv search to confirm the problem is open and not covered by Clay/Wikipedia-level resources',
      'Cataloging: origin, obstacles, formalization potential, verification path, impact domains, and relations',
      'Review: weekly automated verification plus quarterly manual status checks (open → partial → resolved); resolutions are archived, not deleted',
    ],
    qc: [
      'Passes the three-question filter (or approved via exception)',
      'Statement precise enough for a graduate student to start',
      'Scientific / engineering origin recorded',
      'Distinguishes partial results from fully open',
      'Known obstacles recorded (methodological or technical)',
      'Formalization potential rated (high / medium / low)',
      'Verification path and impact domains annotated',
      'At least one accessible reference',
    ],
    notdoing: [
      ['Pure-math problems (number theory, algebraic geometry, topology)', 'Covered by Open Problem Garden and AIM'],
      ['“Design / optimize / propose” engineering tasks', 'Not mathematical problems'],
      ['Running experiments', 'Only verdicts checkable by logic / interval arithmetic are admitted'],
      ['Passing off bare numerical simulation as an answer without a residual bound', 'A single simulation point is not a certificate; a judgemental certificate carrying the three-layer residual band is (numerical paths are admissible too)'],
      ['Building AI agents or automated provers', 'Other projects do that; we provide the problem layer'],
      ['Contests or bounties', 'The Millennium Prize model'],
      ['Famous top-tier problems (Yang–Mills, Riemann)', 'Covered by Wikipedia and Clay'],
    ],
    maintenance: [
      ['Weekly automated verification', 'A GitHub Actions cron runs every Monday: for each problem it searches OpenAlex and arXiv for the past 7 days using its tags, flags titles containing “solved / we prove / disproved”, writes monitor.json, and surfaces it on the homepage.'],
      ['Status lifecycle', 'open → partial → resolved, reviewed quarterly; resolved problems keep a full archive (solver, paper, date) — the resolution record is itself proof of the site’s value.'],
      ['Data API', 'problems.json and benchmark.json refresh with every deploy; AI benchmarks can subscribe directly.'],
    ],
    contribute:
      'Propose a problem: sign in and use the submission form; it enters the review queue against the three-question filter. Especially welcome: additions to known obstacles, updates on formalization progress, annotations of problem relations and impact domains.',
    goal: (
      <>
        Milestone: 100 problems. Selection follows <strong>real workflow gaps</strong> rather than
        filling a quota; <strong>certified judgements in materials and engineered systems</strong> are
        especially welcome (phase/structure stability, thermal and mechanical margin, process–property
        curves, failure thresholds), since they carry explicit input uncertainty that deserves a
        verifiable residual-band verdict. Metrics: catalog size, MathOverflow/paper citations, and
        adoption of{' '}
        <Link to="/api" className="underline underline-offset-4">benchmark.json</Link> by AI benchmarks.
      </>
    ),
    goalTitle: 'Scale target',
  },
}

export default function AboutPage() {
  const { lang, t } = useI18n()
  const c = C[lang]
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <Reveal>
        <h1 className="font-statement text-4xl md:text-5xl font-bold tracking-tight">{t('ab.title')}</h1>
        <p className="mt-6 text-lg text-ink-2 leading-relaxed">{c.intro}</p>
      </Reveal>

      <H2>{t('ab.filter')}</H2>
      <div className="border border-line divide-y divide-[var(--line)]">
        {c.filter.map(([q, ti, d]) => (
          <div key={q} className="grid grid-cols-[4rem_1fr] gap-4 p-5">
            <span className="font-statement text-2xl font-bold">{q}</span>
            <div>
              <p className="font-medium">{ti}</p>
              <p className="text-sm text-ink-3 mt-1">{d}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[15px] text-ink-2 leading-relaxed">{c.exception}</p>

      <H2>{t('ab.workflow')}</H2>
      <ol className="space-y-3 text-ink-2">
        {c.workflow.map((s, i) => (
          <li key={i} className="flex gap-3">
            <span className="font-mono2 text-xs text-ink-3 mt-1.5">{String(i + 1).padStart(2, '0')}</span>
            <span className="leading-relaxed">{s}</span>
          </li>
        ))}
      </ol>

      <H2>{t('ab.qc')}</H2>
      <ul className="space-y-2">
        {c.qc.map((s) => (
          <li key={s} className="flex gap-3 text-[15px] text-ink-2">
            <span className="mt-[4px] inline-block h-3.5 w-3.5 border border-line-strong shrink-0" />
            {s}
          </li>
        ))}
      </ul>

      <H2>{t('ab.notdoing')}</H2>
      <div className="border border-line divide-y divide-[var(--line)]">
        {c.notdoing.map(([a, b]) => (
          <div key={a} className="grid md:grid-cols-[1fr_auto] gap-2 p-4 text-[15px]">
            <span className="font-medium">✕ {a}</span>
            <span className="text-ink-3">{b}</span>
          </div>
        ))}
      </div>

      <H2>{t('ab.maintenance')}</H2>
      <div className="border border-line divide-y divide-[var(--line)]">
        {c.maintenance.map(([k, v]) => (
          <div key={k} className="grid md:grid-cols-[11rem_1fr] gap-2 p-4 text-[15px]">
            <span className="font-medium">{k}</span>
            <span className="text-ink-2 leading-relaxed">{v}</span>
          </div>
        ))}
      </div>

      <H2>{c.goalTitle}</H2>
      <p className="text-[15px] text-ink-2 leading-relaxed">{c.goal}</p>

      <H2>{t('ab.contribute')}</H2>
      <p className="text-[15px] text-ink-2 leading-relaxed">{c.contribute}</p>
    </div>
  )
}
