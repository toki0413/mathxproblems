import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Lang = 'zh' | 'en'

const STR: Record<string, { zh: string; en: string }> = {
  // nav
  'nav.problems': { zh: '问题库', en: 'Problems' },
  'nav.graph': { zh: '问题图谱', en: 'Graph' },
  'nav.impact': { zh: '工程价值', en: 'Impact' },
  'nav.stats': { zh: '统计', en: 'Stats' },
  'nav.about': { zh: '关于', en: 'About' },
  'nav.api': { zh: 'API', en: 'API' },
  'nav.submit': { zh: '提交问题', en: 'Submit' },
  'nav.login': { zh: '登录', en: 'Sign in' },
  'nav.logout': { zh: '退出', en: 'Sign out' },
  'nav.menu': { zh: '菜单', en: 'Menu' },
  'nav.close': { zh: '关闭', en: 'Close' },
  'nav.count': { zh: '题', en: 'problems' },
  // footer
  'footer.tagline': {
    zh: 'AI for math 向自然科学和工程系统传导的翻译层与接口层。',
    en: 'The translation and interface layer conducting AI for math into the natural sciences and engineering systems.',
  },
  'footer.principles': { zh: '原则', en: 'Principles' },
  'footer.principles.body': {
    zh: '精确陈述 · 障碍记录 · 形式化路径',
    en: 'Precise statements · recorded obstacles · formalization paths',
  },
  'footer.principles.body2': {
    zh: '不做实验设计，不重复千禧年问题',
    en: 'No experimental design, no Millennium-style repeats',
  },
  'footer.criteria': { zh: '收录标准', en: 'Criteria' },
  'footer.criteria.body': {
    zh: '可精确陈述 · 无需新实验',
    en: 'Precisely statable · no new experiments needed',
  },
  'footer.criteria.body2': {
    zh: '纸笔逻辑或形式化验证可判',
    en: 'Decidable by proof or formal verification',
  },
  'footer.collected': { zh: '收录', en: 'Collected' },
  'footer.goal': { zh: '目标', en: 'goal' },
  'footer.license': { zh: 'CC BY 4.0（问题陈述与元数据）', en: 'CC BY 4.0 (statements & metadata)' },
  // home
  'home.kicker': { zh: '开放问题目录', en: 'Catalog of open problems' },
  'home.hero.1': {
    zh: '把自然科学和工程里',
    en: 'Open problems born in',
  },
  'home.hero.2': {
    zh: '「说不清」的难题',
    en: 'science and engineering,',
  },
  'home.hero.3': {
    zh: '翻译成可判定的数学。',
    en: 'stated as decidable mathematics.',
  },
  'home.hero.sub': {
    zh: '每个问题都源于真实的自然或工程模型，可以被精确陈述，且原则上可以由纸笔逻辑或形式化工具判定——但至今无人解出。',
    en: 'Every problem arises from a real natural or engineering model, admits a precise statement, and is in principle decidable by pen-and-paper logic or formal verification — yet remains unsolved.',
  },
  'home.latest': { zh: '最新收录', en: 'Latest additions' },
  'home.random': { zh: '随机一题', en: 'Random problem' },
  'home.graph': { zh: '问题图谱', en: 'Problem graph' },
  'home.graph.sub': {
    zh: '依赖、蕴含、共享工具、平行类比——研究网络的真实拓扑。',
    en: 'Dependencies, implications, shared tools, analogies — the real topology of the research network.',
  },
  'home.graph.open': { zh: '进入全屏图谱', en: 'Open full-screen graph' },
  'home.manifesto': { zh: '宣言', en: 'Manifesto' },
  'home.domains': { zh: '四个领域', en: 'Four domains' },
  'home.monitor': { zh: '实时监控', en: 'Live monitor' },
  // problems page
  'pl.title': { zh: '问题库', en: 'Problem catalog' },
  'pl.subtitle': {
    zh: '每道题都可精确陈述、无需新实验、并标注了已知障碍、形式化潜力与影响领域。',
    en: 'Every problem is precisely statable, needs no new experiments, and carries known obstacles, formalization potential and impact domains.',
  },
  'pl.search': { zh: '搜索标题、标签、编号…', en: 'Search titles, tags, ids…' },
  'pl.all': { zh: '全部', en: 'All' },
  'pl.potential': { zh: '形式化潜力', en: 'Formalization potential' },
  'pl.verify': { zh: '验证路径', en: 'Verification path' },
  'pl.status': { zh: '状态', en: 'Status' },
  'pl.output': { zh: '产出类型', en: 'Output type' },
  'pl.domain': { zh: '领域', en: 'Domain' },
  'pl.count': { zh: '道题', en: 'problems' },
  'pl.community': { zh: '社区投稿', en: 'Community submissions' },
  // detail
  'pd.statement': { zh: '精确陈述', en: 'Precise statement' },
  'pd.certificate': { zh: '残余总带证书', en: 'Residual total-band certificate' },
  'pd.certificate.band': { zh: '带证区间', en: 'Certified band' },
  'pd.certificate.total': { zh: '总带合成', en: 'Total-band composition' },
  'pd.certificate.layer': { zh: '残差层', en: 'Residual layer' },
  'pd.certificate.derivation': { zh: '复核来源', en: 'Verification source' },
  'pd.audit': { zh: '信任审计', en: 'Trust audit' },
  'pd.audit.upstream': { zh: '上游证书依赖', en: 'Upstream certificate dependency' },
  'pd.audit.downstream': { zh: '由本题继承下游', en: 'Downstream inheriting this certificate' },
  'pd.audit.hint': {
    zh: '要信任本证书，须先信以下上游证书；任一层被反例击穿，则依赖它的下游总带随之失效。',
    en: 'Trusting this certificate presumes the upstream certificates below; if any is refuted, downstream bands depending on it fail.',
  },
  'pd.audit.none': { zh: '本题无上游依赖，是可独立消费的基础证书。', en: 'No upstream dependency — an independently consumable base certificate.' },
  'pd.ledger': { zh: '验证账本', en: 'Verification ledger' },
  'pd.ledger.hint': {
    zh: '以下为社区提交、经评审通过的带证收窄记录。每一条都让该题的总带更紧。',
    en: 'Community-submitted, review-approved band-narrowing records. Each one tightens this problem.',
  },
  'pd.ledger.empty': { zh: '尚无已验证收窄记录。', en: 'No verified narrowings yet.' },
  'pd.origin': { zh: '来源与背景', en: 'Origin & context' },
  'pl.deliverable': { zh: '工程交付物', en: 'Engineering deliverable' },
  'pl.deliverableAll': { zh: '全部交付物', en: 'All deliverables' },
  'pl.deliverableHint': {
    zh: '从你的工程交付物出发，反向找到由哪个带证问题直接支撑（反向索引）。',
    en: 'Start from your engineering deliverable and find which certified problem directly supports it (reverse index).',
  },
  'pd.progress': { zh: '探索记录', en: 'Exploration record' },
  'pd.obstacles': { zh: '已知障碍', en: 'Known obstacles' },
  'pd.engineering': { zh: '工程价值与转化', en: 'Engineering value & translation' },
  'pd.formalization': { zh: '形式化评注', en: 'Formalization notes' },
  'pd.impact': { zh: '影响领域', en: 'Impact domains' },
  'pd.references': { zh: '参考文献', en: 'References' },
  'pd.related': { zh: '关联问题', en: 'Related problems' },
  'pd.comments': { zh: '讨论', en: 'Discussion' },
  'pd.meta': { zh: '元数据', en: 'Metadata' },
  'pd.obstacle.no': { zh: '障碍', en: 'Obstacle' },
  // stats
  'st.title': { zh: '统计', en: 'Statistics' },
  'st.milestone': { zh: '收录里程碑 {goal} 题 · 当前 {n} 题', en: 'Milestone: {goal} problems · currently {n}' },
  'st.goal': { zh: '收录里程碑 100 题', en: 'Milestone: 100 problems' },
  // impact
  'im.title': { zh: '从定理到证书', en: 'From theorem to certificate' },
  // submit
  'sb.title': { zh: '提交问题', en: 'Submit a problem' },
  'sb.login.required': {
    zh: '提交问题需要先登录（Kimi 账号）。',
    en: 'Signing in (Kimi account) is required before submitting a problem.',
  },
  // review
  'rv.title': { zh: '审核队列', en: 'Review queue' },
  // home principles
  'home.p1.t': { zh: '精确陈述', en: 'Precise statements' },
  'home.p1.b': {
    zh: '每题必须能回答“要算什么、证什么、分什么类”——研究生读完即可上手。',
    en: 'Every problem must answer “what to compute, prove, or classify” — legible to a graduate student.',
  },
  'home.p2.t': { zh: '障碍记录', en: 'Recorded obstacles' },
  'home.p2.b': {
    zh: '已知方法为什么卡住，与问题本身同样重要。障碍是 AI 智能体的路标。',
    en: 'Why known methods get stuck matters as much as the problem itself. Obstacles are signposts for AI agents.',
  },
  'home.p3.t': { zh: '形式化路径', en: 'Formalization paths' },
  'home.p3.b': {
    zh: '标注 Lean / Coq 可做到哪一步、数值验证可认证什么——让 AI 知道从哪下手。',
    en: 'We mark how far Lean/Coq can go and what certified numerics can establish — so AI knows where to start.',
  },
  // stats
  'st.collected': { zh: '已收录', en: 'Collected' },
  'st.of': { zh: '目标', en: 'of' },
  'st.byDomain': { zh: '按领域', en: 'By domain' },
  'st.byPotential': { zh: '按形式化潜力', en: 'By formalization potential' },
  'st.byVerification': { zh: '按验证路径', en: 'By verification path' },
  'st.byStatus': { zh: '按解决状态', en: 'By resolution status' },
  'st.byOutput': { zh: '按产出类型', en: 'By output type' },
  // api
  'api.title': { zh: '数据接口', en: 'Data API' },
  'api.subtitle': {
    zh: '为 AI 智能体与评测基准提供的机器可读接口。',
    en: 'Machine-readable exports for AI agents and evaluation benchmarks.',
  },
  // about
  'ab.title': { zh: '关于 MathX Problems', en: 'About MathX Problems' },
  // shared ui copy (previously hardcoded per-component ternaries)
  // live monitor
  'lm.loading': { zh: '正在加载…', en: 'Loading…' },
  'lm.empty': { zh: '监测数据尚未生成。', en: 'Monitor data not generated yet.' },
  'lm.verified': { zh: '最近核验', en: 'Verified' },
  'lm.noWorks': { zh: '过去 7 天无直接相关新文献。', en: 'No directly relevant new works in the past 7 days.' },
  'lm.alerts': { zh: '⚠ {n} 题出现“可能已解决”信号', en: '⚠ {n} problem(s) flagged as possibly resolved' },
  // graph page
  'gp.title': { zh: '问题图谱', en: 'Problem Graph' },
  'gp.topology': { zh: '研究网络拓扑', en: 'Research network topology' },
  'gp.desc': {
    zh: '节点形状区分四个领域（圆=物理，方=化学，三角=生物，六边形=工程），节点大小对应难度；边按关系类型着色，虚线为共享工具与平行类比。',
    en: 'Node shapes mark the four domains (circle=physics, square=chemistry, triangle=biology, hexagon=engineering); size encodes difficulty. Edges are colored by relation type, dashed for shared tools and analogies.',
  },
  // graph component
  'pg.open': { zh: '进入问题页 →', en: 'Open problem →' },
  'pg.legend': { zh: '图例', en: 'Legend' },
  'pg.potential': { zh: '形式化可行度', en: 'formalization' },
  'pg.verify': { zh: '验证路径', en: 'verification' },
  'pg.status': { zh: '状态', en: 'status' },
  'pg.search': { zh: '输入编号或关键词定位节点…', en: 'Type an id or keyword to locate…' },
  'pg.clear': { zh: '清除', en: 'Clear' },
  'pg.recent': { zh: '近期有进展', en: 'recent progress' },
  'pg.hint': { zh: '滚轮缩放 · 拖拽平移 · 点击节点查看', en: 'Scroll to zoom · drag to pan · click a node' },
  // api page
  'api.problems.desc': {
    zh: '全部问题的完整元数据与结构化正文',
    en: 'Full metadata and structured statements for every problem',
  },
  'api.benchmark.desc': {
    zh: '筛选 formalization_potential = high 的题集，供 AI 形式化基准使用',
    en: 'The formalization_potential = high subset, for AI formalization benchmarks',
  },
  'api.download': { zh: '下载', en: 'Download' },
  'api.copy': { zh: '复制', en: 'Copy' },
  'api.copied': { zh: '已复制', en: 'Copied' },
  // review page
  'rv.adminOnly': { zh: '此页仅对管理员开放。', en: 'Admins only.' },
  'rv.placeholder': { zh: '审核备注（可选）', en: 'Reviewer note (optional)' },
  'rv.approve': { zh: '通过', en: 'Approve' },
  'rv.reject': { zh: '拒绝', en: 'Reject' },
  'rv.empty': { zh: '队列为空。', en: 'Queue is empty.' },
  'rv.guide': {
    zh: '对照三问筛选器与质量控制清单逐条审核。通过后投稿以「社区投稿」身份展示。',
    en: 'Review each proposal against the three-question filter and the QC checklist.',
  },
  'rv.upHeading': { zh: '记录问题更新', en: 'Record a problem update' },
  'rv.upHint': {
    zh: '为目录里的问题写入进展 / 修订 / 状态变更，会实时展示在问题详情页的「更新记录」。',
    en: 'Attach a progress / revision / status change to a catalog problem. Shown live on its detail page.',
  },
  'rv.upProblem': { zh: '问题', en: 'Problem' },
  'rv.upDate': { zh: '日期', en: 'Date' },
  'rv.upNote': { zh: '更新内容', en: 'Update note' },
  'rv.upSubmit': { zh: '提交更新', en: 'Submit update' },
  'rv.upDone': { zh: '已记录', en: 'Recorded' },
  // review page - attempts queue (提进展/解答候选)
  'rv.atHeading': { zh: '候选审核队列', en: 'Attempt review queue' },
  'rv.atHint': {
    zh: '社区对已有问题提交的进展 / 解答思路 / 修订建议。通过后会在问题详情页的「社区候选」区展示。',
    en: 'Community-proposed progress / solution sketches / revisions for existing problems. Approved ones appear in the detail page’s “Community attempts” area.',
  },
  'rv.atBy': { zh: '提交于', en: 'submitted' },
  'rv.atEmpty': { zh: '没有待审候选。', en: 'No pending attempts.' },
  // review page - import fragment (通过后完整入库)
  'rv.importHeading': { zh: '已通过投稿 · 入库片段', en: 'Approved submissions · import fragments' },
  'rv.importHint': {
    zh: '复制生成的对象片段，按 problems.ts 的格式粘贴到问题库即可完成入库。',
    en: 'Copy the generated object fragment to the problems.ts catalog to finish the inclusion.',
  },
  'rv.importBtn': { zh: '复制入库片段', en: 'Copy import fragment' },
  'rv.importCopied': { zh: '已复制', en: 'Copied' },
  'rv.importId': { zh: '生成编号', en: 'Generated id' },
  // problems page
  'pl.impactAll': { zh: '影响领域：全部', en: 'Impact: all' },
  'pl.noMatch': { zh: '没有匹配的问题。试试放宽筛选条件。', en: 'No matches. Try loosening the filters.' },
  'pl.comm.tag': { zh: '经审核的读者投稿', en: 'Reviewed reader contributions' },
  'pl.contrib.by': { zh: '贡献者', en: 'by' },
  'pl.comm.ctaPre': { zh: '有想贡献的问题？', en: 'Have a problem to contribute? ' },
  'pl.comm.ctaLink': { zh: '提交审核', en: 'Submit it for review' },
  'pl.comm.ctaEnd': { zh: '。', en: '.' },
  'pl.comm.invite': { zh: '尚无社区投稿——第一个贡献者就是你。', en: 'No community contributions yet — be the first.' },
  // problem detail
  'pd.verified': { zh: '最近核验', en: 'Verified' },
  'pd.status': { zh: '状态', en: 'Status' },
  'pd.output': { zh: '产出类型', en: 'Output type' },
  'pd.difficulty': { zh: '难度', en: 'Difficulty' },
  'pd.formalize': { zh: '形式化潜力', en: 'Formalization' },
  'pd.verify': { zh: '验证路径', en: 'Verification' },
  'pd.contrib': { zh: '贡献者', en: 'Contributor' },
  'pd.judgment': { zh: '判定形式', en: 'Deciding form' },
  'pd.proposer': { zh: '提出者', en: 'Proposer' },
  'pd.year': { zh: '提出年份', en: 'Proposed year' },
  'pd.via': { zh: '出处', en: 'Source' },
  'pd.updates': { zh: '更新记录', en: 'Recent updates' },
  'pd.provenance': { zh: '溯源', en: 'Provenance' },
  'pd.copied': { zh: '已复制', en: 'Copied' },
  'pd.copyCit': { zh: '复制引用格式', en: 'Copy citation' },
  'pd.notFound': { zh: '未找到该问题。', en: 'Problem not found.' },
  'pd.back': { zh: '返回问题库', en: 'Back to catalog' },
  // problem detail - community attempts (提进展/解答候选)
  'pd.attempts': { zh: '社区候选', en: 'Community attempts' },
  'pd.attempts.empty': {
    zh: '还没有人提交过候选——你可以第一个提出进展、解答思路或修订建议。',
    en: 'No community attempts yet — be the first to propose progress, a solution sketch, or a revision.',
  },
  'pd.attempts.submit': { zh: '提交候选', en: 'Submit an attempt' },
  'pd.attempts.author': {
    zh: '署名（可选，匿名留空）',
    en: 'Your name (optional, leave blank for anonymous)',
  },
  'pd.attempts.kind': { zh: '类型', en: 'Type' },
  'pd.attempts.kind.progress': { zh: '进展', en: 'Progress' },
  'pd.attempts.kind.solution': { zh: '解答思路', en: 'Solution sketch' },
  'pd.attempts.kind.revision': { zh: '修订建议', en: 'Revision' },
  'pd.attempts.kind.verification': { zh: '验证收窄', en: 'Verified narrowing' },
  'pd.attempts.band': { zh: '收窄后的带证区间', en: 'Narrowed certified band' },
  'pd.attempts.verificationHint': {
    zh: '验证型投稿：声明把该题的带证区间收窄到某个值，附证明要点。审批通过后会出现在下方的验证账本，成为社区让目录变紧的记录。',
    en: 'A verified-narrowing post: claim a tighter certified band for this problem, with the key argument. Once approved it lands in the verification ledger below.',
  },
  'pd.attempts.title': { zh: '一句话标题', en: 'Short title' },
  'pd.attempts.content': { zh: '内容（可含 LaTeX $…$）', en: 'Content (LaTeX $…$ supported)' },
  'pd.attempts.send': { zh: '提交候选', en: 'Submit' },
  'pd.attempts.sent': { zh: '已提交，等待审核。', en: 'Submitted — pending review.' },
  'pd.attempts.by': { zh: '贡献者', en: 'by' },
  'pd.attempts.vote.title': { zh: '投/撤一票', en: 'Toggle vote' },
  'pd.attempts.vote.login': { zh: '登录后可投票', en: 'Sign in to vote' },
  'pd.attempts.pendingNote': {
    zh: '候选会先进入审核队列，通过后在此展示。',
    en: 'Candidates enter the review queue and appear here once approved.',
  },
  // stats page
  'st.domainProgress': { zh: '各领域进度 / 六个月目标', en: 'Progress by domain / 6-month target' },
  'st.relations': { zh: '关系连线', en: 'Relations' },
  'st.avgObstacles': { zh: '平均每题障碍', en: 'Avg. obstacles' },
  // home page
  'home.heroHeadline': {
    zh: '从自然与工程中涌现、\n可被精确陈述、\n仍在等待证明的问题。',
    en: 'Problems emerging from nature and engineering,\nprecisely statable,\nstill awaiting proof.',
  },
  'home.browse': { zh: '浏览 {n} 道问题', en: 'Browse {n} problems' },
  'home.impact': { zh: '工程价值 →', en: 'Engineering impact →' },
  'home.criteria': { zh: '收录标准', en: 'Criteria' },
  'home.live': { zh: '实时动态', en: 'Live monitor' },
  'home.view': { zh: '查看', en: 'Open' },
  'home.another': { zh: '换一题', en: 'Another' },
  // impact page
  'im.subtitle': {
    zh: '这些问题的解答可直接嵌入现有工业认证体系——把仿真测试换成机器可检的数学证明，把经验法则换成可验证的定理。',
    en: 'Solutions to these problems plug directly into existing industrial certification — replacing simulation testing with machine-checkable proof, and rules of thumb with verifiable theorems.',
  },
  'im.card1.h': { zh: '当前瓶颈', en: 'The bottleneck' },
  'im.card1.b': {
    zh: 'AI 证明器在纯数学上突飞猛进，但工业界无法验证"AI 给出的控制器是否安全"——因为问题本身没有被数学化陈述。',
    en: 'AI provers advance rapidly in pure mathematics, yet industry cannot verify whether an AI-proposed controller is safe — because the problem itself is not mathematically stated.',
  },
  'im.card2.h': { zh: 'MathX 的作用', en: 'What MathX does' },
  'im.card2.b': {
    zh: '我们把工程约束翻译成数学命题：收敛速率、稳定性判据、阈值条件。每道题附带形式化潜力评级，告诉 AI 智能体"这题 Lean 能证到哪一步"。',
    en: 'We translate engineering constraints into mathematical propositions: convergence rates, stability criteria, threshold conditions. Each problem carries a formalization rating telling an agent how far Lean can go.',
  },
  'im.card3.h': { zh: '最终交付', en: 'The deliverable' },
  'im.card3.b': {
    zh: '不是论文，而是证书：一段可机器验证的 Lean/Coq 代码，直接嵌入 ISO 26262 或 DO-178C 的合规文档。',
    en: 'Not a paper but a certificate: machine-verifiable Lean/Coq code embedded directly into ISO 26262 or DO-178C compliance documents.',
  },
  'im.cert': { zh: '对应认证标准', en: 'Matching standard' },
  'im.effect': { zh: '直接工程影响', en: 'Direct engineering impact' },
  'im.index': { zh: '影响领域索引', en: 'Impact domain index' },
  'im.why': { zh: '为什么这是 AI for Math 的落地点？', en: 'Why this is where AI for math lands' },
  // submit page
  'sb.guide': { zh: '贡献指南见「关于」页 · 三问筛选器同样适用', en: 'See About for the contributor guide · the three-question filter applies' },
  'sb.subtitle': {
    zh: '提交后进入审核队列；通过后以「社区投稿」身份进入问题库并署名。LaTeX 公式可直接书写（$…$）。',
    en: 'Submissions enter a review queue; once approved they appear in the catalog as community contributions with attribution. LaTeX is supported ($…$).',
  },
  'sb.submitted': { zh: '已提交，等待审核。', en: 'Submitted — pending review.' },
  'sb.submitAnother': { zh: '再提交一条', en: 'Submit another' },
  'sb.titleEn': { zh: '英文标题', en: 'English title' },
  'sb.titleZh': { zh: '中文标题', en: 'Chinese title' },
  'sb.domain': { zh: '领域', en: 'Domain' },
  'sb.subdomain': { zh: '子领域', en: 'Subdomain' },
  'sb.subdomain.hint': { zh: '如 spectral-theory', en: 'e.g. spectral-theory' },
  'sb.statement': { zh: '精确陈述（Q1）', en: 'Precise statement (Q1)' },
  'sb.origin': { zh: '来源与背景（哪个自然/工程模型）', en: 'Origin & context (which natural/engineering model)' },
  'sb.obstacles': { zh: '已知障碍（每行一条）', en: 'Known obstacles (one per line)' },
  'sb.impact': { zh: '影响领域（逗号分隔）', en: 'Impact domains (comma-separated)' },
  'sb.impact.hint': { zh: '如 CFD 湍流模型', en: 'e.g. CFD turbulence models' },
  'sb.refs': { zh: '参考文献（每行一条）', en: 'References (one per line)' },
  'sb.engineer': { zh: '工程价值与转化路径', en: 'Engineering value & translation path' },
  'sb.note': { zh: '给审核者的备注', en: 'Note for reviewers' },
  'sb.optional': { zh: '可选', en: 'optional' },
  'sb.submit': { zh: '提交审核', en: 'Submit for review' },
  'sb.mine': { zh: '我的提交', en: 'My submissions' },
  'sb.status.approved': { zh: '已通过', en: 'approved' },
  'sb.status.rejected': { zh: '未通过', en: 'rejected' },
  'sb.status.pending': { zh: '审核中', en: 'pending' },
  'ab.filter': { zh: '收录标准：三问筛选器', en: 'The three-question filter' },
  'ab.workflow': { zh: '收录工作流', en: 'Curation workflow' },
  'ab.qc': { zh: '质量控制清单', en: 'Quality checklist' },
  'ab.notdoing': { zh: '不做清单', en: 'What we do not do' },
  'ab.maintenance': { zh: '实时更新与维护机制', en: 'Live maintenance' },
  'ab.contribute': { zh: '贡献指南', en: 'How to contribute' },
}

const LangCtx = createContext<{
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
}>({ lang: 'zh', setLang: () => {}, t: (k) => k })

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(
    () => (localStorage.getItem('mathx-lang') as Lang) || 'zh',
  )
  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('mathx-lang', l)
    document.documentElement.lang = l === 'zh' ? 'zh-CN' : 'en'
  }
  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
  }, [lang])
  const t = (key: string) => STR[key]?.[lang] ?? STR[key]?.zh ?? key
  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>
}

export const useI18n = () => useContext(LangCtx)

/** Pick the bilingual field of a problem-like record. */
export function pickLang<T extends { title: string; titleZh: string }>(p: T, lang: Lang): string {
  return lang === 'zh' ? p.titleZh : p.title
}

/** Pick the bilingual label of a domain record (the DOMAINS/DOMAIN_EN entry). */
export function domainLabel(d: { label: string; labelZh: string }, lang: Lang): string {
  return lang === 'zh' ? d.labelZh : d.label
}

/**
 * Bilingual labels for the fixed enum vocabularies (formalization potential,
 * verification path, resolution status). Lives in one place so pages stop
 * hand-rolling per-file English fallbacks.
 */
const ENUM_LABELS: Record<string, Record<string, { zh: string; en: string }>> = {
  potential: {
    high: { zh: '高', en: 'High' },
    medium: { zh: '中', en: 'Medium' },
    low: { zh: '低', en: 'Low' },
  },
  verification: {
    analytical: { zh: '分析证明', en: 'Analytical' },
    numerical: { zh: '数值验证', en: 'Numerical' },
    experimental: { zh: '实验', en: 'Experimental' },
  },
  status: {
    open: { zh: '开放', en: 'Open' },
    partial: { zh: '部分解决', en: 'Partially resolved' },
    resolved: { zh: '已解决', en: 'Resolved' },
  },
  output: {
    verified_behavior: { zh: '可消费行为证书', en: 'Consumable behavior certificate' },
    verified_truth: { zh: '上游结构证（未直接消费）', en: 'Upstream structural proof (not yet consumable)' },
    scaffolding: { zh: '学科骨架（未接轨应用）', en: 'Bulked scaffold (not yet application-bound)' },
  },
  attemptKind: {
    progress: { zh: '进展', en: 'Progress' },
    solution: { zh: '解答思路', en: 'Solution sketch' },
    revision: { zh: '修订建议', en: 'Revision' },
    verification: { zh: '验证收窄', en: 'Verified narrowing' },
  },
}

/** Resolve an enum label in the given language, falling back to raw value. */
export function enumLabel(lang: Lang, kind: string, value: string): string {
  return ENUM_LABELS[kind]?.[value]?.[lang] ?? value
}
