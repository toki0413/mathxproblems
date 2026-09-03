import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Lang = 'zh' | 'en'

const STR: Record<string, { zh: string; en: string }> = {
  // nav
  'nav.problems': { zh: '问题库', en: 'Problems' },
  'nav.graph': { zh: '问题图谱', en: 'Graph' },
  'nav.impact': { zh: '工程价值', en: 'Impact' },
  'nav.laws': { zh: '经验定律', en: 'Laws' },
  'nav.needs': { zh: '工程需求', en: 'Needs' },
  'nav.ledger': { zh: '协议账本', en: 'Ledger' },
  'nav.stats': { zh: '统计', en: 'Stats' },
  'nav.about': { zh: '关于', en: 'About' },
  'nav.api': { zh: 'API', en: 'API' },
  'nav.submit': { zh: '提交问题', en: 'Submit' },
  'nav.review': { zh: '审核', en: 'Review' },
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
  'footer.essay': { zh: '论形式化边界', en: 'Essay: the frontier' },
  'footer.essay.cn': { zh: '审计博文', en: 'Essay: the audit (CN)' },
  'bp.back': { zh: '返回', en: 'Back to catalog' },
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
  'home.verifications.title': { zh: '最近已验证收窄', en: 'Recent verified narrowings' },
  'home.verifications.hint': {
    zh: '社区提交、经评审通过的带证区间收窄记录。',
    en: 'Community-submitted, review-approved band-narrowing records.',
  },
  'home.verifications.empty': { zh: '还没有已验证的收窄——来提交第一份。', en: 'No verified narrowings yet — submit the first one.' },
  'home.verifications.by': { zh: '由', en: 'by' },
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
  'pl.sort': { zh: '排序', en: 'Sort' },
  'pl.sortDefault': { zh: '目录序', en: 'Catalog order' },
  'pl.sortSupport': { zh: '图谱支撑度', en: 'Graph support' },
  'pl.sortSupportHint': {
    zh: '支撑度 = 依赖该题的下游题数（确定性、可复核）',
    en: 'Support = how many problems depend on this one (deterministic, auditable)',
  },
  'pl.community': { zh: '社区投稿', en: 'Community submissions' },
  'pl.candidates': { zh: '候选池（未经审计）', en: 'Candidate pool (not yet audited)' },
  'pl.candidates.hint': {
    zh: '这些条目仅有题面 + 来源 + AI 草拟元数据，尚未通过审计。与精选核心明确分离——评审通过后升级为已认证题面，再补齐元数据进入主目录。',
    en: 'These entries carry only a statement, source and AI-drafted metadata, and have not passed the audit. Kept clearly separate from the curated core — they upgrade to Vetted after review, then to the main catalog once metadata is completed.',
  },
  'pl.candidates.proposals': { zh: '由需求缺口生成的收题提案（待实采）', en: 'Sourcing proposals from demand gaps (awaiting intake)' },
  'pl.candidates.proposals.hint': {
    zh: '由工程反向需求清单的缺口直接派生：给稳定 id、挂来源需求，待实采（补题面/来源/逐字引文）后升级为正式候选题。这是"从问题收录到解题层"的需求侧入口。',
    en: 'Derived directly from gaps in the engineering-needs list: stable id, linked to the source need, awaiting intake (statement / source / verbatim citation) before promotion to a full candidate problem. This is the demand-side entry of the problem-intake to solution-layer pipeline.',
  },
  'pl.candidates.proposals.intaked': { zh: '已实采', en: 'intaked' },
  'pd.tier.candidateNote': {
    zh: '候选条目：题面与来源已记录，但未经审计。元数据为 AI 草拟，待人工评审。勿当作已确认的开放问题引用。',
    en: 'Candidate entry: statement and source are recorded, but this has not been audited. Metadata is AI-drafted and pending human review. Do not cite as a confirmed open problem.',
  },
  'pd.tier.vettedNote': {
    zh: '已验证题面：精确陈述、判定与溯源已审，但障碍/工具/工程价值等元数据欠全（AI 辅助标注）。可升级为精选核心。',
    en: 'Vetted statement: precise statement, judgement and provenance reviewed; obstacle/tool/engineering-value metadata is incomplete (AI-assisted). Upgradable to the curated core.',
  },
  // detail
  'pd.statement': { zh: '精确陈述', en: 'Precise statement' },
  'pd.certificate': { zh: '残余总带证书', en: 'Residual total-band certificate' },
  'pd.certificate.claimedNotice': {
    zh: '注意：以下带证区间是该题被要求满足的判定形式（目标规约），并非已被证明成立的结论。判定是否成立仍未解。',
    en: 'Note: the certified band below is the judgement form this problem is required to satisfy — a target specification, not an established proved result. Whether it holds remains open.',
  },
  'pd.certificate.band': { zh: '判定区间', en: 'Judgement band' },
  'pd.certificate.total': { zh: '总带合成', en: 'Total-band composition' },
  'pd.certificate.record': { zh: '当前纪录括区', en: 'Current record bracket' },
  'pd.certificate.recordNote': {
    zh: '机器可核验的具体数值带（非判定目标；目标带仍开放）。',
    en: 'Machine-checkable numeric band — not the judgement target, which remains open.',
  },
  'pd.certificate.layer': { zh: '残差层', en: 'Residual layer' },
  'pd.certificate.derivation': { zh: '复核来源', en: 'Verification source' },
  'pd.dualbridge.title': { zh: '双桥视图', en: 'Dual-bridge view' },
  'pd.dualbridge.formal': { zh: '形式侧 (AI4Math)', en: 'Formal side (AI4Math)' },
  'pd.dualbridge.banded': { zh: '带侧 (AI4S)', en: 'Banded side (AI4S)' },
  'pd.dualbridge.bridge': { zh: '桥', en: 'The bridge' },
  'pd.dualbridge.direction': { zh: '连接方向', en: 'Connection' },
  'pd.dualbridge.status': { zh: '状态', en: 'Status' },
  'pd.dualbridge.judgment': { zh: '判定', en: 'Judgment' },
  'pd.dualbridge.target': { zh: '目标系统', en: 'Target' },
  'pd.dualbridge.shared': { zh: '共享残差层', en: 'Shared residual layers' },
  'pd.dualbridge.eps': { zh: '理想化收缩', en: 'Idealized to band' },
  'pd.audit': { zh: '信任审计', en: 'Trust audit' },
  'pd.audit.upstream': { zh: '上游证书依赖', en: 'Upstream certificate dependency' },
  'pd.audit.downstream': { zh: '由本题继承下游', en: 'Downstream inheriting this certificate' },
  'pd.audit.hint': {
    zh: '要信任本证书，须先信以下上游证书；任一层被反例击穿，则依赖它的下游总带随之失效。',
    en: 'Trusting this certificate presumes the upstream certificates below; if any is refuted, downstream bands depending on it fail.',
  },
  'pd.audit.none': { zh: '本题无上游依赖，是可独立消费的基础证书。', en: 'No upstream dependency — an independently consumable base certificate.' },
  'pd.ledger': { zh: '收窄声明账本', en: 'Narrowing ledger' },
  'pd.ledger.hint': {
    zh: '社区提交、经评审通过的带证区间收窄声明。注：此处收录的是声明及其署名，与既有判定带的包含关系与证明完备性需由评审把关，未做程序化校验；不应视为“已验证成立”。',
    en: 'Community-submitted, review-approved band-narrowing claims. Note: this records claims and attribution; containment w.r.t. any existing band and proof completeness are judged by review, not machine-checked here. Do not read them as "proved".',
  },
  'pd.ledger.empty': { zh: '尚无收窄声明。', en: 'No narrowing claims yet.' },
  'pd.origin': { zh: '来源与背景', en: 'Origin & context' },
  'pl.deliverable': { zh: '工程交付物', en: 'Engineering deliverable' },
  'pl.deliverableAll': { zh: '全部交付物', en: 'All deliverables' },
  'pd.lifecycle': { zh: '证书生命周期', en: 'Certificate lifecycle' },
  'pd.lifecycle.open': { zh: '开放待证', en: 'Open' },
  'pd.lifecycle.tightened': { zh: '已收窄', en: 'Tightened' },
  'pd.lifecycle.refuted': { zh: '已被反例击穿', en: 'Refuted' },
  'pd.lifecycle.superseded': { zh: '已被取代', en: 'Superseded' },
  'pd.lifecycle.refutedHint': {
    zh: '本题核心结论已被反例击穿，不再可信。反例来源见下方更新记录。',
    en: 'This problem&apos;s core claim has been refuted by a counterexample. See the update records for the source.',
  },
  'pl.deliverableHint': {
    zh: '从你的工程交付物出发，反向找到由哪个带证问题直接支撑（反向索引）。',
    en: 'Start from your engineering deliverable and find which certified problem directly supports it (reverse index).',
  },
  'pd.progress': { zh: '探索记录', en: 'Exploration record' },
  'pd.obstacles': { zh: '已知障碍', en: 'Known obstacles' },
  'pd.engineering': { zh: '工程价值与转化', en: 'Engineering value & translation' },
  'pd.formalization': { zh: '形式化评注', en: 'Formalization notes' },
  'pd.impact': { zh: '影响领域', en: 'Impact domains' },
  'pd.impact.backed': { zh: '已挂文献', en: 'literature-backed' },
  'pd.impact.evidence': { zh: '证据链', en: 'Evidence' },
  'pd.impact.pending': { zh: '证据待领域专家补充。', en: 'Evidence pending expert sourcing.' },
  'pd.failure': { zh: '为何已知方法失败', en: 'Why known methods fail' },
  'pd.failure.hint': {
    zh: '已知方法的结构化失败记录——AI 智能体的路标。',
    en: 'Structured records of known methods and why they get stuck — signposts for AI agents.',
  },
  'pd.failure.method': { zh: '方法', en: 'Method' },
  'pd.failure.partial': { zh: '已知部分结果', en: 'Partial result' },
  'pd.failure.impact': { zh: '启示', en: 'Implication' },
  'pd.tools': { zh: '形式工具映射', en: 'Formal tool mapping' },
  'pd.tools.hint': {
    zh: '本题 ↔ mathlib 工具族的双向索引（可用 / 部分 / 缺失）。',
    en: 'Bidirectional index to mathlib tool families: available / partial / missing.',
  },
  'pd.tools.role': { zh: '角色', en: 'Role' },
  'pd.tools.area': { zh: 'mathlib 区域', en: 'mathlib area' },
  'pd.tools.none': { zh: '暂未收录工具映射。', en: 'No tool mapping yet.' },
  'pd.proofs': { zh: '解题层证明台阶 (L3)', en: 'Proof steps (L3)' },
  'pd.proofs.hint': {
    zh: '本题已被真实形式化的核心可证子结果（非 sorry）——题本身仍开放，但这些子证明已由 CI 用 Lean 编译机器核验。这是"从问题收录到解题层"的可见进展。',
    en: 'Core sub-results of this problem that have been genuinely formalized (no sorry). The problem itself stays open, but these sub-proofs are machine-verified by CI compilation in Lean — visible progress from cataloging toward the solution layer.',
  },
  'pd.proofs.machine': { zh: '机器已核验', en: 'Machine-verified' },
  'pd.proofs.theorem': { zh: '定理', en: 'Theorem' },
  'pd.proofs.what': { zh: '证明了什么', en: 'What is proved' },
  'pd.references': { zh: '参考文献', en: 'References' },
  'pd.related': { zh: '关联问题', en: 'Related problems' },
  'pd.demanded': { zh: '被哪些工程需求倒查', en: 'Demanded by engineering needs' },
  'pd.demanded.body': {
    zh: '从需求侧反查回来：下面这些工程需求把这道题当作支撑。每一条都标注了本问题在需求判定链里扮演的角色、此刻的状态，以及解出后的落点。把题做出来，就是把需求往前推一步。',
    en: 'Reversed from the demand side: these engineering needs treat this problem as support. Each shows the role this problem plays in the need\u2019s decision chain, its current state, and what solving it unlocks. Solving it pushes the need forward.',
  },
  'pd.demanded.role': { zh: '角色', en: 'Role' },
  'pd.demanded.state': { zh: '此刻状态', en: 'Now' },
  'pd.demanded.unlock.served': {
    zh: '该子判定已可消费——这条链已就位，需求在此环节无需等待。',
    en: 'This sub-judgement is consumable \u2014 this link is in place; the need does not wait here.',
  },
  'pd.demanded.unlock.partial': {
    zh: '已有部分进展，但完整证书仍缺失——这条链尚欠一环。',
    en: 'Partial progress, but a full certificate is still missing \u2014 this link is not complete.',
  },
  'pd.demanded.unlock.open': {
    zh: '尚无证书：解出此题，需求就向前推进一步。',
    en: 'No certificate yet: solve this problem and the need advances.',
  },
  'pd.comments': { zh: '讨论', en: 'Discussion' },
  // comments（自建评论区，D1 托管，匿名即发即见）
  'cm.count': { zh: '条评论', en: 'comments' },
  'cm.empty': { zh: '还没有评论。成为第一个发言的人——评论即发即见，无需审核。', en: 'No comments yet. Be the first to speak — comments publish immediately, no review gate.' },
  'cm.anonymous': { zh: '匿名', en: 'Anonymous' },
  'cm.author': { zh: '署名（可选）', en: 'Name (optional)' },
  'cm.content': { zh: '写下你的评论……', en: 'Write a comment…' },
  'cm.send': { zh: '发布', en: 'Post' },
  'cm.note': { zh: '访客限流：同一设备每分钟至多 10 条。评论是社区讨论，不代表 MathX 的数学结论。', en: 'Rate-limited: max 10/min per visitor. Comments are community discussion, not MathX endorsements.' },
  // flags（社区红旗：对问题可信度的公开质疑，即发即见）
  'pd.flags': { zh: '社区红旗', en: 'Community flags' },
  'fl.count': { zh: '面红旗', en: 'flags' },
  'fl.empty': {
    zh: '还没有红旗。发现陈述有误、已被解决、来源误植或评级失真？公开提出来——任何读者都能看到并复核。',
    en: 'No flags yet. Spotted a wrong statement, an already-solved claim, a misattributed source, or a misleading rating? Raise it publicly — anyone can see it and verify.',
  },
  'fl.anonymous': { zh: '匿名', en: 'Anonymous' },
  'fl.type.label': { zh: '红旗类型', en: 'Flag type' },
  'fl.type.statement': { zh: '陈述有误', en: 'Statement' },
  'fl.type.solved': { zh: '已被解决', en: 'Solved' },
  'fl.type.attribution': { zh: '来源误植', en: 'Attribution' },
  'fl.type.rating': { zh: '评级失真', en: 'Rating' },
  'fl.type.other': { zh: '其他', en: 'Other' },
  'fl.author': { zh: '署名（可选）', en: 'Name (optional)' },
  'fl.content': { zh: '说明质疑（如：已解决来源、错误出处、为何评级失真）……', en: 'Explain the concern (e.g. the solving source, the wrong citation, why the rating misleads)…' },
  'fl.send': { zh: '提交红旗', en: 'Raise flag' },
  'fl.note': {
    zh: '访客限流：同一设备每分钟至多 10 条。红旗是公开质疑，不代表 MathX 认可；有助于策展人复核修订。',
    en: 'Rate-limited: max 10/min per visitor. Flags are public challenges, not MathX endorsements; they help curators recheck and revise.',
  },
  'pd.meta': { zh: '元数据', en: 'Metadata' },
  'pd.obstacle.no': { zh: '障碍', en: 'Obstacle' },
  // stats
  'st.title': { zh: '统计', en: 'Statistics' },
  'st.milestone': { zh: '收录里程碑 {goal} 题 · 当前 {n} 题', en: 'Milestone: {goal} problems · currently {n}' },
  'st.anchors': { zh: '机器核验锚点覆盖率', en: 'Machine-verified anchor coverage' },
  'st.anchors.any': { zh: '道题带锚点', en: 'problems carry an anchor' },
  'st.anchors.l0': { zh: 'L0 陈述', en: 'L0 statements' },
  'st.anchors.l1': { zh: 'L1 证书括区', en: 'L1 cert bands' },
  'st.anchors.l2': { zh: 'L2 失败类型学', en: 'L2 failure records' },
  'st.anchors.l3': { zh: 'L3 真实证明台阶', en: 'L3 proof steps' },
  'st.anchors.hint': {
    zh: '结构性质核验 ≠ 已解决：L0 陈述由 CI 编译类型核验，L1 证书括区携带机器可核验纪录，L2 失败记录已生成 Lean 类型化档案，L3 是已被真实证明（非 sorry）的核心子结果。',
    en: 'Structural verification ≠ solved: L0 statements are type-checked by CI compilation, L1 certificate bands carry machine-verifiable records, L2 failure records are backed by Lean-typed archives, and L3 are core sub-results genuinely proved (no sorry).',
  },
  'st.goal': { zh: '收录里程碑 100 题', en: 'Milestone: 100 problems' },
  // impact
  'im.title': { zh: '从定理到证书', en: 'From theorem to certificate' },
  // submit
  'sb.title': { zh: '提交问题', en: 'Submit a problem' },
  'sb.authorName': { zh: '署名（可选，留空匿名）', en: 'Attribution (optional, blank = anonymous)' },
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
  'pg.obstacles': { zh: '障碍链接', en: 'obstacle links' },
  'pg.visited': { zh: '已读', en: 'read' },
  'pg.bitslegend': { zh: '大小 ∝ 信息量', en: 'size ∝ bits' },
  'gp.index': { zh: '索引', en: 'Index' },
  'gp.readcount': { zh: '已读 {v}/{t}', en: 'read {v}/{t}' },
  'gp.bits': { zh: '累计收窄信息量', en: 'cumulative narrowing information' },
  'pd.bandruler': { zh: '收窄历程', en: 'Narrowing history' },
  'pd.bits': { zh: '比特', en: 'bits' },
  'home.bits': { zh: '累计信息量', en: 'Cumulative information' },
  'lm.updated': { zh: '更新于 {t}', en: 'updated {t}' },
  'lm.digest.title': { zh: '本期摘要', en: 'digest' },
  'lm.digest.line': { zh: '{d} 日 · {w} 篇新文献 · {p} 题有动静', en: '{d}d · {w} new works · {p} problems active' },
  'lm.digest.alerts': { zh: '{n} 条告警', en: '{n} alerts' },
  'lm.digest.top': { zh: '最活跃', en: 'most active' },
  // api page
  'api.problems.desc': {
    zh: '全部问题的完整元数据与结构化正文',
    en: 'Full metadata and structured statements for every problem',
  },
  'api.benchmark.desc': {
    zh: '筛选 formalization_potential = high 的题集，供 AI 形式化基准使用',
    en: 'The formalization_potential = high subset, for AI formalization benchmarks',
  },
  'api.tools.desc': {
    zh: '形式工具注册表：mathlib 工具族 ↔ 工程判定的供给侧索引',
    en: 'Formal tool registry — mathlib tool families ↔ engineering judgements',
  },
  'api.laws.desc': {
    zh: '经验定律边界图谱：失效域 + 形式化缺口（运动的需求清单）',
    en: 'Empirical-law boundary map — failure regimes + formalization gaps (the movement demand list)',
  },
  'api.impact.desc': {
    zh: '影响域实证链：每个影响域挂接的真实 arXiv 文献证据',
    en: 'Impact-domain evidence chains — real arXiv papers grounding each domain',
  },
  'api.needs.desc': {
    zh: '工程反向需求清单：工程需求 → 支撑问题/定律 + 就绪度',
    en: 'Engineering-need reverse demand list — need → supporting problems/laws + readiness',
  },
  'api.needs.cov.desc': {
    zh: '需求侧聚合覆盖：被倒查的问题/定律数、就绪度分布、工作流落点',
    en: 'Demand-side coverage: anchored problems/laws, readiness mix, workflow slots',
  },
  'api.feed.desc': {
    zh: '最新收录的 RSS 订阅源（自动从目录生成）',
    en: 'RSS feed of the latest catalog additions (generated from the catalog)',
  },
  'api.feed.subscribe': { zh: '订阅', en: 'Subscribe' },
  'api.download': { zh: '下载', en: 'Download' },
  'api.copy': { zh: '复制', en: 'Copy' },
  'api.copied': { zh: '已复制', en: 'Copied' },
  // review page
  'rv.adminOnly': { zh: '此页仅对管理员开放。', en: 'Admins only.' },
  'rv.adminIntro': {
    zh: '独立管理入口：输入管理员令牌即可解锁审核队列。令牌只保存在当前浏览器，不会外传。',
    en: 'Admin gate: enter the admin token to unlock the review queue. The token is stored only in this browser.',
  },
  'rv.adminPlaceholder': { zh: '管理员令牌', en: 'Admin token' },
  'rv.adminUnlock': { zh: '解锁', en: 'Unlock' },
  'rv.adminLock': { zh: '退出管理', en: 'Lock' },
  'rv.adminBadToken': { zh: '令牌无效：审核接口返回 403。', en: 'Invalid token: review API returned 403.' },
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
  'rv.atFormal': { zh: '声称的形式化状态', en: 'Claimed formal status' },
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
  'pd.provenance.hint': {
    zh: 'AI 生成初稿，未经领域专家逐条复核。难度、形式化评级与影响域均为模型推断，仅供索引参考，不作为学术结论。',
    en: 'AI-drafted content, not yet individually reviewed by domain experts. Difficulty, formalization ratings and impact domains are model estimates for indexing only, not academic claims.',
  },
  'pd.ratings.ai': {
    zh: '难度与形式化评级为 AI 模型推断，非专家评审；有待专家复核升级。',
    en: 'Difficulty and formalization ratings are AI model estimates, not expert review; they await expert upgrade.',
  },
  'pd.trust.title': { zh: '信任信号怎么读', en: 'How to read trust signals' },
  'pd.trust.output': { zh: '产出类型', en: 'Output type — ' },
  'pd.trust.output.body': {
    zh: '答案的形态，不是"已解决"。verified_truth / verified_behavior 描述若此题被解答、答案应是什么形式。',
    en: 'the shape an answer would take, not a solved claim. verified_truth / verified_behavior describe what a resolution would look like.',
  },
  'pd.trust.provenance': { zh: '溯源', en: 'Provenance — ' },
  'pd.trust.provenance.body': {
    zh: '题面怎么来的（AI 草拟 / 专家复核 / Lean 可编译）；不改变"题未解决"。',
    en: 'how the entry was drafted (AI / expert / Lean-compilable); it does not change that the problem is open.',
  },
  'pd.trust.audit': { zh: '信任审计', en: 'Trust audit — ' },
  'pd.trust.audit.body': {
    zh: '题面通过内部一致性审查；审的是条目质量，不是解决状态。',
    en: 'the entry passed an internal-consistency review; that reviews entry quality, not resolution.',
  },
  'pd.trust.anchor': { zh: '机器锚点 L0/L1/L2', en: 'Machine anchors L0/L1/L2 — ' },
  'pd.trust.anchor.body': {
    zh: '陈述 / 证书括区 / 失败类型学的结构性质被机器核验，绝不等于"已解决"。',
    en: 'structural properties (statement / certificate band / failure typology) are machine-checked; that never means solved.',
  },
  'pd.status': { zh: '状态', en: 'Status' },
  'pd.output': { zh: '产出类型', en: 'Output type' },
  'pd.difficulty': { zh: '难度', en: 'Difficulty' },
  'pd.formalize': { zh: '形式化潜力', en: 'Formalization' },
  'pd.lean.title': { zh: '形式化陈述（Lean 4）', en: 'Formal statement (Lean 4)' },
  'pd.lean.hint': {
    zh: '已在 Lean 4（Std，无 mathlib）中编译通过；证明仍开放（sorry）。陈述为机器可核验锚点，对应 lean/<id>.lean，由 check-lean 在 CI 强制保持一致。',
    en: 'Compiles in Lean 4 (Std, no mathlib); the proof is still open (sorry). The statement is a machine-verified anchor, mirrored in lean/<id>.lean and kept in sync by check-lean in CI.',
  },
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
  'pd.bibtex': { zh: '下载 BibTeX', en: 'Download BibTeX' },
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
  'pd.attempts.kind.formal': { zh: '形式化补证', en: 'Formal proof/refutation' },
  'pd.attempts.bandLo': { zh: '下限', en: 'lower' },
  'pd.attempts.bandHi': { zh: '上限', en: 'upper' },
  'pd.attempts.band': { zh: '收窄后的带证区间', en: 'Narrowed certified band' },
  'pd.attempts.verificationHint': {
    zh: '验证型投稿：声明把该题的带证区间收窄到给定上下界，附证明要点。审批通过后会出现在下方的验证账本，成为社区记录。',
    en: 'A verified-narrowing post: claim a tighter certified band (lower/upper) for this problem, with the key argument. Once approved it lands in the verification ledger below.',
  },
  'pd.attempts.formalHint': {
    zh: '形式化补证：声明该题在双桥 M 侧应迁移到的形式化状态——可证（给出证明/Lean 编译证据）、仍为猜想、或被反例否证。审批通过后进入变更 feed，供下游同步。',
    en: 'A formalization post: claim the target formal status this problem should migrate to on the M-side of the bridge — provable (with proof / Lean-compiling evidence), still conjectured, or refuted by a counterexample. Once approved it enters the change feed for downstream sync.',
  },
  'pd.attempts.formalStatus': { zh: '声称的形式化状态', en: 'Claimed formal status' },
  'pd.attempts.via': {
    zh: '出处/来源链接（Lean 文件、预印本、benchmark 条目，可选）',
    en: 'Source / link (Lean file, preprint, benchmark entry — optional)',
  },
  'pd.attempts.title': { zh: '一句话标题', en: 'Short title' },
  'pd.attempts.content': { zh: '内容（可含 LaTeX $…$）', en: 'Content (LaTeX $…$ supported)' },
  'pd.attempts.narrative': { zh: '思路与反思（可选）：怎么想到的、卡在哪、为什么失败', en: 'Rationale & reflection (optional): how you got here, what blocked you, why it failed' },
  'pd.attempts.narrative.label': { zh: '思路与反思', en: 'Rationale & reflection' },
  'pd.attempts.send': { zh: '提交候选', en: 'Submit' },
  'pd.attempts.sent': { zh: '已提交，等待审核。', en: 'Submitted — pending review.' },
  'pd.attempts.by': { zh: '贡献者', en: 'by' },
  'pd.attempts.vote.title': { zh: '投/撤一票', en: 'Toggle vote' },
  'pd.attempts.vote.login': { zh: '登录后可投票', en: 'Sign in to vote' },
  'pd.attempts.pendingNote': {
    zh: '候选会先进入审核队列，通过后在此展示。',
    en: 'Candidates enter the review queue and appear here once approved.',
  },
  // graph topology navigation (P1-1)
  'pd.topo.title': { zh: '图谱导航', en: 'Graph navigation' },
  'pd.topo.hint': {
    zh: '方向明确的邻接：本问题依赖 {d} 个上游前提，被 {s} 个问题作为依赖。支撑度 = 依赖该题的下游题数，确定性、可复核。',
    en: 'Direction-aware neighbors: this problem depends on {d} upstream prerequisites and is itself a dependency of {s} problems. Support = how many problems depend on it — deterministic and auditable.',
  },
  'pd.topo.upstream': { zh: '上游依赖', en: 'Upstream' },
  'pd.topo.upstreamHint': { zh: '（本题依赖它们）', en: 'this depends on them' },
  'pd.topo.downstream': { zh: '下游支撑', en: 'Downstream' },
  'pd.topo.downstreamHint': { zh: '（它们依赖本题）', en: 'they depend on this' },
  'pd.topo.implies': { zh: '蕴含结论', en: 'Implied' },
  'pd.topo.generalized': { zh: '推广下沉', en: 'Generalizes to' },
  'pd.topo.analogies': { zh: '类比', en: 'Analogies' },
  'pd.topo.sharedTools': { zh: '共享工具', en: 'Shared tools' },
  'pd.topo.obstacleNeighbors': { zh: '同障碍问题', en: 'Shared-obstacle problems' },
  'pd.topo.obstacleNeighborsHint': {
    zh: '（与本题共享已知障碍——另一条路也卡在这里，可复用技术）',
    en: 'share known obstacles with this problem — another route blocked the same way; techniques may transfer',
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
  // hero ledger strip（编辑风统计行）
  'home.ledger.problems': { zh: '收录问题', en: 'problems in catalog' },
  'home.ledger.domains': { zh: '学科域', en: 'domains' },
  'home.ledger.certs': { zh: '可证行为证书', en: 'behavior certificates' },
  'home.ledger.ledger': { zh: '只追加协议账本', en: 'append-only ledger' },
  // query entry（从需求出发的检索入口）
  'home.q.kicker': { zh: '从需求出发', en: 'Start from a need' },
  'home.q.title': { zh: '你有一个工程判定要做？反查支撑它的数学。', en: 'Have an engineering decision to make? Reverse-search the math behind it.' },
  'home.q.cta': { zh: '工程反向需求清单', en: 'Engineering needs, reversed' },
  // impact page
  'im.subtitle': {
    zh: '这些问题的解答可直接嵌入现有工业认证体系——把仿真测试换成机器可检的数学证明，把经验法则换成可验证的定理。',
    en: 'Solutions to these problems plug directly into existing industrial certification — replacing simulation testing with machine-checkable proof, and rules of thumb with verifiable theorems.',
  },
  // laws page（经验定律形式化边界图谱）
  'laws.title': { zh: '经验定律的形式化边界图谱', en: 'Formalization boundary map of empirical laws' },
  'laws.subtitle': {
    zh: '工程师每天都在用一堆没被证明、只在某个区间成立的定律。这份图谱逐条展示：严格形式化是什么、成立假设、失效域、以及要证明什么缺口。',
    en: 'Engineers rely every day on empirical laws that are unproven and valid only inside a regime. This map shows, law by law: the strict formal statement, the assumptions, the failure boundary, and the formal gap left to prove.',
  },
  'laws.usage': { zh: '工程师用法', en: 'How engineers use it' },
  'laws.formal': { zh: '严格形式化表述', en: 'Strict formal statement' },
  'laws.assumptions': { zh: '成立假设', en: 'Assumptions' },
  'laws.boundary': { zh: '边界 · 失效域', en: 'Boundary · failure regime' },
  'laws.gap': { zh: '形式化缺口', en: 'Formalization gap' },
  'laws.residuals': { zh: '三层残差', en: 'Three-layer residuals' },
  'laws.tools': { zh: '建议工具', en: 'Suggested tools' },
  'laws.expand': { zh: '展开边界', en: 'Show boundary' },
  'laws.collapse': { zh: '收起', en: 'Collapse' },
  // needs page（工程反向需求清单）
  'nd.title': { zh: '工程反向需求清单', en: 'Engineering needs, reversed' },
  'nd.subtitle': {
    zh: '工程师带着一个具体需求来（"给散热器一个可核验的热裕量""给生物反应器一个不塌方的稳定性证书"），MathX 反查：哪些目录问题与经验定律支撑这个需求、现在到什么程度、缺口在哪。',
    en: 'Bring a concrete engineering need (a certified thermal margin for a heat sink, a no-collapse robustness certificate for a bioreactor); MathX maps it back to the catalog problems and empirical laws that back it, how far it currently goes, and where the gap is.',
  },
  'nd.role.certificate': { zh: '可消费证书', en: 'consumable certificate' },
  'nd.role.anchor': { zh: '奠基结构证', en: 'foundational anchor' },
  'nd.role.related': { zh: '支撑', en: 'related' },
  'nd.role.law': { zh: '经验定律', en: 'empirical law' },
  'nd.readiness.hint': { zh: '就绪度', en: 'Readiness' },
  'nd.served': { zh: '已就绪', en: 'Served' },
  'nd.partial': { zh: '部分', en: 'Partial' },
  'nd.gap': { zh: '缺口', en: 'Gap' },
  'nd.chain': { zh: '判定链', en: 'Decision chain' },
  'nd.standard': { zh: '对接工程标准', en: 'Engineering standard' },
  'nd.consumable': { zh: '什么算被服务', en: 'What \u201cserved\u201d looks like' },
  'nd.barrier': { zh: '当前障碍', en: 'Current barrier' },
  'nd.sourcing': { zh: '缺口驱动收题', en: 'Gap-driven sourcing' },
  'nd.view.gap': { zh: '缺口驱动', en: 'Gap-first' },
  'nd.view.area': { zh: '按领域', en: 'By area' },
  'nd.view.gapArea': { zh: '缺口驱动（gap 置顶）', en: 'Gap-driven (gaps first)' },
  'nd.pipeline.title': { zh: '收题流水线', en: 'Sourcing pipeline' },
  'nd.pipeline.body': {
    zh: '每条缺口需求直接生成收题条目：new = 候选池条目提案（待实采为候选池），push = 推进已有目录问题。这是"从问题收录到解题层"的引擎——需求层驱动该收什么题。',
    en: 'Every gap need yields sourcing items: new = candidate-pool proposals (awaiting collection), push = advance an existing catalog problem. This is the engine from problem intake to the solution layer — the demand layer drives what to source.',
  },
  'nd.pipeline.new': { zh: '候选题提案', en: 'candidate proposals' },
  'nd.pipeline.push': { zh: '推进已有题', en: 'push targets' },
  'nd.pipeline.intaked': { zh: '已实采', en: 'intaked' },
  'nd.journey.title': { zh: '需求旅程 · 收题闭环', en: 'Demand journeys · intake loop' },
  'nd.journey.body': {
    zh: '一条需求从缺口出发的完整旅程：缺口 → 收题提案 → 实采正式题 → 机器锚点（L0 陈述 / L2 失败类型学）→ L3 证明台阶。收题只是起点，解题层（L3）才是终点——这正是"从问题收录到解题层"的纵深。',
    en: 'The full journey of a demand from gap: gap → sourcing proposal → collected catalog problem → machine anchors (L0 statement / L2 failure typology) → L3 proof steps. Intake is only the start; the solution layer (L3) is the destination — the depth from problem intake to the solution layer.',
  },
  'nd.journey.need': { zh: '缺口', en: 'gap' },
  'nd.journey.sourcing': { zh: '收题', en: 'sourcing' },
  'nd.journey.intaked': { zh: '实采', en: 'collected' },
  'nd.journey.l0': { zh: 'L0', en: 'L0' },
  'nd.journey.l2': { zh: 'L2', en: 'L2' },
  'nd.journey.noL3': { zh: '待解题', en: 'awaiting' },
  'nd.journey.empty': { zh: '暂无已实采旅程', en: 'No collected journeys yet' },
  'nd.src.push': { zh: '推进', en: 'push' },
  'nd.src.new': { zh: '候选题', en: 'new' },
  'nd.st.served': { zh: '可消费', en: 'consumable' },
  'nd.st.partial': { zh: '部分', en: 'partial' },
  'nd.st.open': { zh: '开放', en: 'open' },
  'nd.supported': { zh: '支撑问题', en: 'Supporting problems' },
  'nd.laws': { zh: '牵涉经验定律', en: 'Implicated empirical laws' },
  'nd.how.title': { zh: '如何阅读', en: 'How to read this' },
  'nd.how.body': {
    zh: '每条需求是一份"判定档案"：判定链按依赖顺序列出要 certify 的子判定（问题角色：可消费证书 / 奠基结构证 / 支撑；经验定律单独标注），并给出对接的工程标准、什么算被服务、当前障碍与工作流落点。链步状态（可消费 / 部分 / 开放）与需求就绪度（Served / Partial / Gap）都是从目录推导的评估性判断，非学术结论。',
    en: 'Each need is a decision dossier: the decision chain lists, in dependency order, the sub-judgements to certify (problem roles: consumable certificate / foundational anchor / related; empirical laws flagged separately), plus the engineering standard it plugs into, what "served" looks like, the current barrier, and the workflow slot. Step states (consumable / partial / open) and need readiness (Served / Partial / Gap) are assessments derived from the catalog, not academic claims.',
  },
  // needs coverage（需求侧聚合覆盖条）
  'nd.cov.needs': { zh: '需求总数', en: 'Total needs' },
  'nd.cov.problems': { zh: '被倒查的问题', en: 'Problems demanded' },
  'nd.cov.problems.body': { zh: '被需求点名的可见问题', en: 'visible problems anchored by needs' },
  'nd.cov.laws': { zh: '被倒查的经验定律', en: 'Laws demanded' },
  'nd.cov.workflows': { zh: '工作流落点', en: 'Workflow slots' },
  'nd.cov.workflows.body': { zh: '判定在工程工作流中的落点种类', en: 'distinct workflow slots where judgements land' },
  // ledger page（协议账本）
  'lg.title': { zh: '协议账本', en: 'The protocol ledger' },
  'lg.subtitle': {
    zh: '一份只追加、可复核的已通过判定记录。每条记录携带证据哈希（改写即失效）与参考核验器判定（带证区间是否可机器解析、是否空洞、是否跨过信息量门槛）。',
    en: 'An append-only, independently checkable record of accepted judgements. Every entry carries an evidence hash (tampering breaks it) and a reference-verifier verdict (is the certified band machine-parseable, is it vacuous, does it clear the information gate).',
  },
  'lg.contract': { zh: '契约版本', en: 'Contract' },
  'lg.append': { zh: '只追加', en: 'append-only' },
  'lg.verifier': { zh: '核验器', en: 'Verifier' },
  'lg.verifier.note': { zh: '读取侧独立判定（提交路径永不核验）', en: 'read-only verdict at export; the proposal path never verifies' },
  'lg.events': { zh: '已通过判定', en: 'Accepted' },
  'lg.error': { zh: '账本加载失败。', en: 'Failed to load the ledger.' },
  'lg.empty.title': { zh: '账本还是空的', en: 'The ledger is empty' },
  'lg.empty.body': {
    zh: '第一条已通过判定一旦落账，将在这里出现并携带证据哈希与核验判定。账本随每次评审批准追加，从不改写历史。',
    en: 'The first accepted judgement will appear here with its evidence hash and verifier verdict. The ledger only ever appends on review approval; history is never rewritten.',
  },
  'lg.band': { zh: '带证区间', en: 'certified band' },
  'lg.bits': { zh: 'bits', en: 'bits' },
  'lg.by': { zh: '提交', en: 'by' },
  'lg.verdict.title': { zh: '核验判定', en: 'Verifier verdict' },
  'lg.verdict.relative': { zh: '相对宽度', en: 'rel. width' },
  'lg.verdict.info': { zh: '信息量门槛', en: 'info gate' },
  'lg.hash': { zh: '证据哈希', en: 'evidence hash' },
  'lg.hash.note': { zh: '改写证据即破坏哈希一致性，可被 check-ledger 审计发现。', en: 'Altering evidence breaks hash consistency and is caught by the check-ledger audit.' },
  'lg.copy': { zh: '复制', en: 'copy' },
  'lg.copied': { zh: '已复制', en: 'copied' },
  'lg.verify.title': { zh: '如何复核', en: 'How to verify' },
  'lg.verify.body': {
    zh: '对任意已落账判定：拉取 /api/v1/feed.json 用 scripts/check-ledger.mjs 复核证据哈希与追加序；对每条 verification 声明，用 contracts/verifier.ts 的同一纯函数重算带证区间的判定。',
    en: 'For any accepted entry: fetch /api/v1/feed.json and run scripts/check-ledger.mjs to audit hashes and append order; for each verification band, re-run the same pure verifier from contracts/verifier.ts.',
  },
  'lg.v.unparseable': { zh: '不可解析', en: 'unparseable' },
  'lg.v.vacuous': { zh: '空洞', en: 'vacuous' },
  'lg.v.non-vacuous': { zh: '非空洞', en: 'non-vacuous' },
  'lg.v.above-gate': { zh: '超信息门槛', en: 'above-gate' },
  'api.ledger.desc': {
    zh: '协议账本的可核验导出（只追加 + 参考核验器判定）',
    en: 'machine-verifiable protocol ledger export (append-only + verifier verdicts)',
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
  'im.backed': { zh: '证据', en: 'Evidence' },
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
  // nav
  'nav.tools': { zh: '工具索引', en: 'Tools' },
  'nav.obstacles': { zh: '障碍索引', en: 'Obstacles' },
  // tools page
  'tl.title': { zh: '形式工具索引', en: 'Formal tools index' },
  'tl.subtitle': {
    zh: 'Mathlib 工具族与工程问题的双向映射——从工具出发找题，从题出发找工具支撑。',
    en: 'Bidirectional mapping between mathlib tool families and engineering problems — find problems by tool, or tools by problem.',
  },
  'tl.tools': { zh: '个工具', en: 'tools' },
  'tl.links': { zh: '条映射', en: 'links' },
  'tl.problems': { zh: '关联题目', en: 'Linked problems' },
  'tl.empty': { zh: '暂无题目挂接此工具——缺口即机会。', en: 'No problem links to this tool yet — a gap, and an opportunity.' },
  'tl.gaps.title': { zh: 'Mathlib 能力缺口', en: 'Mathlib capability gaps' },
  'tl.gaps.subtitle': {
    zh: '把 missing / partial 链接聚合成 mathlib 形式化待办：红色 = mathlib 尚缺的工具族（近似算法、在线竞争比、复杂度理论），琥珀 = mathlib 尚不充分的工具族。每个缺口点回对应题目。',
    en: 'Aggregated from missing / partial links as a mathlib formalization backlog: red = tool families mathlib lacks (approximation algorithms, competitive analysis, complexity theory), amber = tool families mathlib has but that are not yet sufficient. Each gap links back to its problem.',
  },
  'tl.gaps.missing': { zh: '待补（mathlib 尚缺）', en: 'To build (mathlib lacks)' },
  'tl.gaps.partial': { zh: '待补强（mathlib 尚不充分）', en: 'To strengthen (mathlib partial)' },
  'tl.gaps.empty': { zh: '无缺口——所有工具都有可支撑或部分支撑的题目。', en: 'No gaps — every tool certifies at least partially. ' },
  // obstacles page
  'ob.title': { zh: '失败机制索引', en: 'Failure mechanism index' },
  'ob.subtitle': {
    zh: '按已知方法失败的机制类型学组织——为什么这条路走不通，以及它对 AI/形式化的启示。',
    en: 'Organized by the typology of known method failures — why this path is blocked, and its implications for AI and formalization.',
  },
  'ob.mechanisms': { zh: '类机制', en: 'mechanisms' },
  'ob.records': { zh: '条失败记录', en: 'failure records' },
  'ob.problems': { zh: '道题目', en: 'problems' },
  'ob.layer': { zh: '残差层', en: 'Layer' },
  'ob.method': { zh: '失败方法', en: 'Failed method' },
  'ob.partial': { zh: '部分进展', en: 'Partial progress' },
  'ob.implication': { zh: '对 AI/形式化的启示', en: 'Implication' },
  'ob.empty': { zh: '该机制暂无失败记录。', en: 'No failure records under this mechanism yet.' },
  'ob.unlocks.title': { zh: '方法解锁 · 复用市场', en: 'Method unlocks · reuse market' },
  'ob.unlocks.subtitle': {
    zh: '已通过声明携带的方法标签，沿跨题障碍链扩散——回答「这项技术下一步还能试哪些题」。失败知识从「看」变成「用」。',
    en: 'Approved methods diffuse one hop along the cross-problem obstacle chain — answering “which problems should this technique try next.” Failure knowledge moves from viewing to reuse.',
  },
  'ob.unlocks.empty': {
    zh: '还没有可解锁的方法。提交带 method 标签的带证收窄或形式化补证、审批通过后，这里会出现「下一步可试的题」。',
    en: 'No unlockable methods yet. Submit a verified narrowing or formalization claim carrying a method tag; once approved, candidate problems appear here.',
  },
  'ob.m.combinatorial': {
    zh: '解空间组合爆炸：候选集合随规模指数或阶乘增长，穷举不可行，且未找到结构性剪枝。',
    en: 'Combinatorial explosion: the candidate space grows exponentially or factorially, exhaustive search is infeasible, and no structural pruning is known.',
  },
  'ob.m.missing_bound': {
    zh: '缺少关键界：证明所需的关键不等式或先验估计缺失，导致方法在关键一步卡死。',
    en: 'A critical bound is missing: the key inequality or a-priori estimate needed by the proof is absent, stalling the method at the critical step.',
  },
  'ob.m.nonconvex': {
    zh: '非凸性：目标或约束非凸，全局最优性无法由局部一阶条件保证，优化或判定算法只能停在局部解。',
    en: 'Non-convexity: the objective or constraints are non-convex, so global optimality cannot follow from local first-order conditions; methods stall at local solutions.',
  },
  'ob.m.unbounded_residual': {
    zh: '残差无界：近似方法留下的误差项无法被一致控制，收敛性论证在边界处失效。',
    en: 'Unbounded residual: the error term left by an approximation cannot be controlled uniformly, so convergence arguments fail at the boundary.',
  },
  'ob.m.parameter_sensitive': {
    zh: '参数敏感：结果对模型参数或初始条件的依赖高度不稳定，微小摄动改变定性行为，判定对输入不可鲁棒。',
    en: 'Parameter sensitivity: the outcome depends unstably on model parameters or initial data; small perturbations change the qualitative behaviour, so judgement is not input-robust.',
  },
}

const LangCtx = createContext<{
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
}>({ lang: 'en', setLang: () => {}, t: (k) => k })

export function LanguageProvider({ children }: { children: ReactNode }) {
  // 纯英文站点：固定 en，不读 localStorage、不提供切换。
  const [lang] = useState<Lang>('en')
  useEffect(() => {
    document.documentElement.lang = 'en'
  }, [])
  const t = (key: string) => STR[key]?.en ?? STR[key]?.zh ?? key
  return <LangCtx.Provider value={{ lang, setLang: () => {}, t }}>{children}</LangCtx.Provider>
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
  provenance: {
    'AI-drafted': { zh: 'AI 初稿', en: 'AI-drafted' },
    'expert-reviewed': { zh: '专家复核', en: 'Expert-reviewed' },
    'lean-compilable': { zh: 'Lean 编译通过', en: 'Lean-compilable' },
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
    formal: { zh: '形式化补证', en: 'Formal proof/refutation' },
  },
  formalStatus: {
    provable: { zh: '可证', en: 'Provable' },
    conjectured: { zh: '仍为猜想', en: 'Conjectured' },
    refuted: { zh: '已被否证', en: 'Refuted' },
  },
}

/** Resolve an enum label in the given language, falling back to raw value. */
export function enumLabel(lang: Lang, kind: string, value: string): string {
  return ENUM_LABELS[kind]?.[value]?.[lang] ?? value
}
