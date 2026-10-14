// 专题簇（Topic Trails）：把被同一条"边界/主题"串起来的题目策展成叙事路线图。
// 数据只声明簇的构成（题目 id 列表）；簇内关系（蕴含/共享工具/类比）由
// problems.ts 的 related_problems 派生，避免第二份事实来源。
// 页面：/trails（簇列表）+ /trails/:id（簇详情）。

export interface TopicTrail {
  /** 簇 id（URL 段，如 transformer-boundary）。 */
  id: string
  /** 簇的短名（导航/徽章用）。 */
  title: { zh: string; en: string }
  /** 一句话叙述：为什么这些题被同一条边界串起来。 */
  blurb: { zh: string; en: string }
  /** 该簇聚焦的边界问题（可判定内核）。 */
  boundary: { zh: string; en: string }
  /** 有序题目列表（展示顺序 = 研究叙事顺序）。 */
  problemIds: string[]
}

export const TOPIC_TRAILS: TopicTrail[] = [
  {
    id: 'transformer-boundary',
    title: { zh: 'Transformer 边界', en: 'The Transformer Boundary' },
    blurb: {
      zh: '同一个问题串起九道题：Transformer 到底能算什么？RASP 语言刻画"能算"的上限，复杂度谱系给出 worst-case 精确性边界，内部机制解释"习得的语言"——三层合起来回答"为什么说必须超越 Transformer"。',
      en: 'Nine problems tied by one question: what can a Transformer compute? RASP bounds what it can express, the complexity spectrum sets worst-case exact limits, and internal mechanisms explain the language it learns — together addressing why the field says scaling a Transformer may not be enough.',
    },
    boundary: {
      zh: '对 Transformer 族的精确计算能力给出可判定的刻画：哪些问题类原理上不可达（TC⁰ 上界），哪些语言识别/程序编译要付出什么资源代价，哪些"习得行为"（上下文学习、长度泛化）能被严格解释。',
      en: 'A decidable characterization of what Transformer families can compute: which problem classes are provably out of reach, what resource cost language recognition and program compilation incur, and which learned behaviors admit rigorous explanation.',
    },
    problemIds: ['cs-019', 'cs-020', 'cs-021', 'cs-022', 'cs-023', 'cs-024', 'cs-025', 'cs-026', 'cs-027'],
  },
  {
    id: 'dnn-interpretability',
    title: { zh: '深度学习可解释性', en: 'DNN Interpretability' },
    blurb: {
      zh: 'AND-OR 交互分解声称"DNN 推理逻辑可以被少量交互模式精确解释"。这组题把该声称变成可判定的数学：稀疏性界、泛化能力定义、泛化间隙、公理化刻画、条件输入推广、统计保证。',
      en: 'The AND-OR interaction theory claims DNN inference can be exactly rewritten as few interaction patterns. This trail turns that claim into decidable mathematics: sparsity bounds, generalization-power definitions, gaps, axioms, extensions, and statistical guarantees.',
    },
    boundary: {
      zh: '交互稀疏性、交互泛化能力与全局泛化间隙之间是否存在紧的关系，且该关系能否对任意 DNN 族机器核验。',
      en: 'Whether tight bounds relate interaction sparsity, interaction generalization power, and the global generalization gap, and whether the relation is machine-checkable for any DNN family.',
    },
    problemIds: ['cs-001', 'cs-002', 'cs-003', 'cs-004', 'cs-005', 'cs-006'],
  },
  {
    id: 'noise-robust-learning',
    title: { zh: '噪声鲁棒学习', en: 'Noise-Robust Learning' },
    blurb: {
      zh: '现实数据集又脏又贵，重标注成本太高——学习系统必须带着标签噪声保持准确。这组题把"噪声容忍"的工程承诺拆成四个可判定问题：损失鲁棒性、记忆容量与学习顺序、噪声容忍损失、噪声估计的可辨识性。',
      en: 'Real datasets are noisy and relabeling is expensive — learning systems must stay accurate under label noise. This trail splits the engineering promise into four decidable questions: loss robustness, memorization and learning order, noise-tolerant losses, and identifiability of noise estimation.',
    },
    boundary: {
      zh: '对给定的噪声过程，损失函数类、网络容量与估计器各自的可判定边界是什么——哪些承诺可证、哪些只是经验现象。',
      en: 'For a stated noise process, where are the decidable boundaries of the loss family, network capacity, and estimators — which promises are provable and which are merely empirical.',
    },
    problemIds: ['cs-015', 'cs-016', 'cs-017', 'cs-018'],
  },
  {
    id: 'generalization-theory',
    title: { zh: '过参数化泛化理论', en: 'Generalization Theory' },
    blurb: {
      zh: '为什么过参数化网络能记住训练集却仍然泛化？这组题从四个独立入口逼近同一现象：稀疏中奖彩票、叠加容量、良性过拟合、VC 维界、NTK 极限的收敛速率。',
      en: 'Why do overparameterized networks memorize training data yet still generalize? Four independent entrances to one phenomenon: sparse winning tickets, superposition capacity, benign overfitting, VC-dimension bounds, and NTK convergence rates.',
    },
    boundary: {
      zh: '过参数化与泛化之间是否存在统一的定量刻画，或这些现象在数学上分属互不归约的机制。',
      en: 'Whether a unified quantitative account relates overparameterization to generalization, or whether the phenomena are mathematically irreducible to one mechanism.',
    },
    problemIds: ['cs-009', 'cs-010', 'cs-012', 'cs-013', 'cs-014'],
  },
]

/** 按题目 id 查所属簇（详情页"属于哪个专题簇"跳转用）。 */
export function trailOfProblem(problemId: string): TopicTrail | undefined {
  return TOPIC_TRAILS.find((tr) => tr.problemIds.includes(problemId))
}
