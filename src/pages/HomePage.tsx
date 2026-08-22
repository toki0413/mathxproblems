import { Link, useNavigate } from 'react-router'
import { useMemo, useState } from 'react'
import { PROBLEMS, DOMAINS, type Domain } from '@/data/problems'
import { ProblemGraph } from '@/components/ProblemGraph'
import { ProblemRow, DomainDot } from '@/components/ProblemRow'
import { Reveal } from '@/components/Reveal'
import { LiveMonitor } from '@/components/LiveMonitor'
import { useI18n, pickLang, domainLabel } from '@/i18n'

const DOMAIN_EN: Record<Domain, { blurb: string; excludes: string }> = {
  'mathematical-physics': {
    blurb: 'Rigorous analysis of integrable systems, spectral theory, kinetics, and turbulence.',
    excludes: 'Excluded: cosmology models, high-energy phenomenology, numerics-led computational physics.',
  },
  'mathematical-chemistry': {
    blurb: 'Open problems in chemical graph theory and chemical reaction network theory (CRNT).',
    excludes: 'Excluded: materials design requiring synthesis, drug discovery.',
  },
  'mathematical-biology': {
    blurb: 'Evolutionary dynamics and exact thresholds of network epidemic models.',
    excludes: 'Excluded: cell biology or neuroscience requiring new experimental data.',
  },
  'mathematical-engineering': {
    blurb: 'Multi-agent coordination and distributed-algorithm lower bounds.',
    excludes: 'Excluded: controller design requiring deployment tests, protocol engineering.',
  },
}

const MANIFESTO: { q?: string; body: string }[] = [
  {
    q: '为什么 AI 在数学中的突破没有传到物理、化学、生物和工程？',
    body: '过去两年，AI 在纯数学中取得了惊人进展：多智能体协作证明定理、Lean 形式化验证、自动引理生成。但这些能力几乎完全锁死在象牙塔里。',
  },
  {
    body: '这不是因为自然科学和工程不需要数学。恰恰相反，物理、化学、生物和控制理论、网络科学中涌现了大量可精确数学化陈述的问题——可积系统的严格收敛性、反应网络的持久性判定、流行病模型的精确阈值、多智能体一致性的收敛速率界。这些问题一旦被解决，既可以通过数学标准验证，又对真实系统有直接解释力。',
  },
  {
    body: '但它们无家可归。纯数学平台觉得"太应用"，自然科学和工程平台不做数学归档。更关键的是，这些问题缺乏集中陈述、验证路径和障碍记录——而这三者正是 AI 智能体需要的基础设施。',
  },
  {
    body: 'MathX Problems 要做这个中间层。我们收录的不是 Yang–Mills 质量间隙（Clay 官网已经做得很好），也不是"设计一个更好的电池"（这不是数学问题）。我们收录的是那些"圈内人知道、圈外人找不到、AI 可以试着解决"的子领域硬骨头。每道题都有精确的数学陈述、科学来源、形式化潜力评级、验证路径，以及——至关重要的——已知障碍的记录。',
  },
  {
    body: '我们相信，一旦这个中间层建立起来，AI for math 的突破自然会流向这里。因为智能体需要的不只是算力，更是被精确陈述的问题。',
  },
]

const MANIFESTO_EN: { q?: string; body: string }[] = [
  {
    q: 'Why haven’t AI breakthroughs in mathematics reached physics, chemistry, biology, and engineering?',
    body: 'In the past two years AI has made striking progress in pure mathematics: multi-agent theorem proving, Lean formalization, automated lemma generation. Yet these capabilities remain locked inside the ivory tower.',
  },
  {
    body: 'Not because the sciences and engineering don’t need mathematics. On the contrary: rigorously statable problems keep emerging — convergence of integrable systems, persistence of reaction networks, exact thresholds of epidemic models, convergence rates of multi-agent consensus. Once solved, they are checkable by mathematical standards and directly interpretable in real systems.',
  },
  {
    body: 'But they are homeless. Pure-math platforms find them “too applied”; science and engineering platforms don’t archive mathematics. Crucially, they lack precise statements, verification paths, and records of known obstacles — exactly the infrastructure AI agents need.',
  },
  {
    body: 'MathX Problems is that middle layer. We don’t list Yang–Mills (Clay does it well) or “design a better battery” (not a math problem). We collect the hard subfield problems insiders know, outsiders can’t find, and AI can attempt. Each comes with a precise statement, scientific origin, formalization rating, verification path, and — vitally — a record of known obstacles.',
  },
  {
    body: 'Once this layer exists, AI-for-math breakthroughs will flow into it. Agents need not just compute, but precisely stated problems.',
  },
]

export default function HomePage() {
  const nav = useNavigate()
  const { lang, t } = useI18n()
  const latest = useMemo(
    () => [...PROBLEMS].sort((a, b) => b.date_added.localeCompare(a.date_added)).slice(0, 5),
    [],
  )
  const [random, setRandom] = useState(
    () => PROBLEMS[Math.floor(Math.random() * PROBLEMS.length)],
  )

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pt-20 pb-16 md:pt-28">
        <Reveal>
          <p className="font-mono2 text-[11px] uppercase tracking-[0.25em] text-ink-3">
            Open problems at the interface of mathematics & the sciences
          </p>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="mt-6 font-statement text-4xl md:text-6xl font-bold leading-[1.08] tracking-tight max-w-4xl whitespace-pre-line">
            {t('home.heroHeadline')}
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="mt-8 max-w-2xl text-ink-2 text-lg leading-relaxed">{t('home.hero.sub')}</p>
        </Reveal>
        <Reveal delay={240}>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/problems"
              className="rounded-full bg-ink text-paper px-6 py-2.5 text-sm font-medium hover:opacity-85 transition-opacity"
            >
              {t('home.browse').replace('{n}', String(PROBLEMS.length))}
            </Link>
            <Link
              to="/impact"
              className="rounded-full border border-line-strong px-6 py-2.5 text-sm text-ink-2 hover:border-ink hover:text-ink transition-colors"
            >
              {t('home.impact')}
            </Link>
            <Link
              to="/about"
              className="rounded-full border border-line-strong px-6 py-2.5 text-sm text-ink-2 hover:border-ink hover:text-ink transition-colors"
            >
              {t('home.criteria')}
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Live monitor strip */}
      <section className="hairline-t bg-[#f4f2ec]">
        <div className="mx-auto max-w-6xl px-5 py-8">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-mono2 text-[11px] uppercase tracking-[0.25em] text-ink-3">
              {t('home.live')}
            </h2>
          </div>
          <LiveMonitor />
        </div>
      </section>

      {/* Manifesto */}
      <section className="hairline-t">
        <div className="mx-auto max-w-6xl px-5 py-20 grid md:grid-cols-[14rem_1fr] gap-10">
          <Reveal>
            <h2 className="font-mono2 text-[11px] uppercase tracking-[0.25em] text-ink-3 sticky top-24">
              {t('home.manifesto')}
            </h2>
          </Reveal>
          <div className="max-w-2xl space-y-8">
            {(lang === 'zh' ? MANIFESTO : MANIFESTO_EN).map((m, i) => (
              <Reveal key={i} delay={i * 40}>
                {m.q && (
                  <p className="font-statement text-2xl font-bold leading-snug mb-6">{m.q}</p>
                )}
                <p className="font-statement text-lg leading-[1.9] text-ink-2">{m.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Four domains */}
      <section className="hairline-t">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <Reveal>
            <h2 className="font-mono2 text-[11px] uppercase tracking-[0.25em] text-ink-3 mb-10">
              {t('home.domains')}
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-2 border-t border-l border-line">
            {(Object.keys(DOMAINS) as Domain[]).map((d, i) => {
              const count = PROBLEMS.filter((p) => p.domain === d).length
              return (
                <Reveal key={d} delay={i * 60}>
                  <Link
                    to={`/problems?domain=${d}`}
                    className="group block border-r border-b border-line p-8 h-full hover:bg-[#f2f0e8] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="font-mono2 text-[11px] uppercase tracking-[0.2em]"
                        style={{ color: DOMAINS[d].color }}
                      >
                        {DOMAINS[d].prefix} · {count}
                      </span>
                      <DomainDot domain={d} />
                    </div>
                    <h3 className="mt-4 font-statement text-2xl font-bold">
                      {domainLabel(DOMAINS[d], lang)}
                    </h3>
                    <p className="mt-4 text-[15px] text-ink-2 leading-relaxed">
                      {lang === 'zh' ? DOMAINS[d].blurb : DOMAIN_EN[d].blurb}
                    </p>
                  </Link>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* Latest + random */}
      <section className="hairline-t">
        <div className="mx-auto max-w-6xl px-5 py-20 grid lg:grid-cols-[1fr_22rem] gap-14">
          <div>
            <Reveal>
              <div className="flex items-baseline justify-between mb-6">
                <h2 className="font-mono2 text-[11px] uppercase tracking-[0.25em] text-ink-3">
                  {t('home.latest')}
                </h2>
              </div>
            </Reveal>
            <div>
              {latest.map((p) => (
                <ProblemRow key={p.id} p={p} index={PROBLEMS.indexOf(p)} />
              ))}
            </div>
          </div>
          <Reveal delay={120}>
            <div className="border border-line p-6 bg-white/50">
              <h3 className="font-mono2 text-[11px] uppercase tracking-[0.25em] text-ink-3">
                {t('home.random')}
              </h3>
              <p className="mt-4 font-statement text-xl font-bold leading-snug">
                {pickLang(random, lang)}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  onClick={() => nav(`/problems/${random.id}`)}
                  className="rounded-full bg-ink text-paper px-4 py-1.5 text-sm font-medium"
                >
                  {t('home.view')}
                </button>
                <button
                  onClick={() => setRandom(PROBLEMS[Math.floor(Math.random() * PROBLEMS.length)])}
                  className="rounded-full border border-line-strong px-4 py-1.5 text-sm text-ink-2 hover:border-ink"
                >
                  {t('home.another')}
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Graph preview */}
      <section className="hairline-t">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <Reveal>
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="font-mono2 text-[11px] uppercase tracking-[0.25em] text-ink-3">
                {t('home.graph')}
              </h2>
              <Link
                to="/graph"
                className="font-mono2 text-xs uppercase tracking-[0.15em] text-ink underline underline-offset-4"
              >
                {t('home.graph.open')} →
              </Link>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <ProblemGraph height={440} />
          </Reveal>
        </div>
      </section>

      {/* Principles strip */}
      <section className="bg-ink text-paper">
        <div className="mx-auto max-w-6xl px-5 py-16 grid md:grid-cols-3 gap-10">
          {[
            ['01', t('home.p1.t'), t('home.p1.b')],
            ['02', t('home.p2.t'), t('home.p2.b')],
            ['03', t('home.p3.t'), t('home.p3.b')],
          ].map(([n, ti, d]) => (
            <Reveal key={n}>
              <div className="font-mono2 text-[11px] tracking-[0.25em] text-paper/40">{n}</div>
              <div className="mt-3 font-statement text-xl font-bold">{ti}</div>
              <p className="mt-3 text-[15px] text-paper/60 leading-relaxed">{d}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  )
}
