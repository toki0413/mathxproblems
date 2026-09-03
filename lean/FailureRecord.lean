import Std

/-!
SHARED-MODULE: FailureRecord

L2 锚点：把"已知方法为何失败"的类型学变成 Lean 可核验的类型化结构。
镜像 scripts/lib/catalog-checks.mjs 的枚举（MECHANISMS / FAILURE_LAYERS），
与 TS 守卫对同一套类型学做双实现交叉核验：目录数据的枚举合法性（TS 守卫）
↔ Lean 侧类型学自洽（互异、可判、档案良构）。

每道目录问题的 failure_records 在此落为类型化档案（Profile）：
"为什么卡住"从散文变成机器可核验的结构化事实——机制、层、已证部分、启示，
其中 partial 是"已知方法走到这一步就被卡住"的可核验描述。
-/
namespace MathX.FailureRecord

/-- 失败机制类型学（对应 catalog-checks 的 MECHANISMS）。 -/
inductive Mechanism : Type
  | combinatorial
  | missing_bound
  | nonconvex
  | unbounded_residual
  | parameter_sensitive
deriving DecidableEq, Repr

/-- 失败层（对应 catalog-checks 的 FAILURE_LAYERS）。 -/
inductive Layer : Type
  | model
  | param
  | num
  | formal
deriving DecidableEq, Repr

/-- 一条结构化失败记录（镜像目录 failure_records 条目的形态）。 -/
structure Record where
  method : String
  mechanism : Mechanism
  layer : Layer
  known : String
  implication : String

/-- 一道题的失败档案。 -/
structure Profile where
  problemId : String
  records : List Record

/-! 类型学一致性（机器可核验） -/

/-- 机制两两不同（组合爆炸 ≠ 缺界）。 -/
theorem mechanisms_distinct :
    Mechanism.combinatorial ≠ Mechanism.missing_bound := by
  intro h
  injection h

/-- 机制两两不同（非凸 ≠ 残差无界）。 -/
theorem mechanisms_nonconvex_distinct :
    Mechanism.nonconvex ≠ Mechanism.unbounded_residual := by
  intro h
  injection h

/-- 层两两不同（model ≠ param）。 -/
theorem layers_model_ne_param : Layer.model ≠ Layer.param := by
  intro h
  injection h

/-- 层两两不同（num ≠ formal）。 -/
theorem layers_num_ne_formal : Layer.num ≠ Layer.formal := by
  intro h
  injection h

/-- 类型学可判：任意两个机制/层可机器判定相等（DecidableEq 已导出）。 -/
example (a b : Mechanism) : Decidable (a = b) := inferInstance
example (a b : Layer) : Decidable (a = b) := inferInstance

/-- 机制含义（与 TS/UI 侧 ob.m.* 含义文案对应）。 -/
def mechanismMeaning (m : Mechanism) : String :=
  match m with
  | .combinatorial => "解空间组合爆炸：候选集指数/阶乘增长，穷举不可行，未找到结构性剪枝"
  | .missing_bound => "缺少关键界：证明所需的关键不等式或先验估计缺失，方法在关键一步卡死"
  | .nonconvex => "非凸性：目标或约束非凸，全局最优性无法由局部一阶条件保证"
  | .unbounded_residual => "残差无界：近似方法留下的误差项无法被一致控制"
  | .parameter_sensitive => "参数敏感：结果对模型参数或初始条件不稳定，判定不鲁棒"

/-- 良构判定：一条记录 method 与 known（已证部分结果）均非空（可计算）。 -/
def wellFormed (r : Record) : Bool :=
  (r.method != "") && (r.known != "")

/-- 健全性：wellFormed = true ⇒ method 非空。 -/
theorem wellFormed_imp_method_nonempty (r : Record) (h : wellFormed r = true) :
    (r.method != "") = true := by
  unfold wellFormed at h
  rw [Bool.and_eq_true] at h
  exact h.1

/-- 健全性：wellFormed = true ⇒ known（已证部分结果）非空。 -/
theorem wellFormed_imp_known_nonempty (r : Record) (h : wellFormed r = true) :
    (r.known != "") = true := by
  unfold wellFormed at h
  rw [Bool.and_eq_true] at h
  exact h.2

/-! 目录问题档案（L2 落锚，partial 即"已知方法走到这一步就被卡住"） -/

section Catalog

def mp001 : Profile :=
  { problemId := "mp-001",
    records := [
      { method := "Lanford collision-tree expansion",
        mechanism := .combinatorial, layer := .formal,
        known := "Converges for times up to a fraction of the mean free time; global-in-time only in the vacuum (no-recollision) setting.",
        implication := "Needs a phase-space exclusion argument controlling the combinatorially proliferating collision trees uniformly in time." },
      { method := "BBGKY hierarchy with pseudo-trajectories",
        mechanism := .missing_bound, layer := .model,
        known := "Gallagher–Saint-Raymond–Texier gave refined short-time control of pseudo-trajectories.",
        implication := "A uniform-in-time a priori bound on the marginals would close the gap; the natural first formalization target." },
    ] }

def mc004 : Profile :=
  { problemId := "mc-004",
    records := [
      { method := "Quantifier elimination on multistationarity conditions",
        mechanism := .combinatorial, layer := .num,
        known := "Multistationarity conditions are polynomial inequalities in rate constants; quantifier elimination is doubly exponential in the number of species and reactions.",
        implication := "A verified SAT/SMT or Lean enumeration of the motif space would certify exhaustiveness without correctness gaps." },
      { method := "Computer-assisted network enumeration (Joshi–Shiu atoms)",
        mechanism := .unbounded_residual, layer := .formal,
        known := "Embedding and lifting results show small motifs generate all multistationary networks, but exhaustive case analysis over topologies has correctness gaps.",
        implication := "Machine-check the enumeration so the finite list of multistationarity motifs is certified to be exhaustive." },
    ] }

def me001 : Profile :=
  { problemId := "me-001",
    records := [
      { method := "Spectral / quadratic-form rate analysis via lambda_2(L)",
        mechanism := .missing_bound, layer := .model,
        known := "The linear case has the exact rate given by lambda_2(L); nonlinear coupling destroys the quadratic-form structure, so lambda_2 no longer controls the rate.",
        implication := "Construct a Lyapunov rate certificate whose constant depends on the sector bound and lambda_2(L) for Lipschitz nonlinear coupling." },
      { method := "Passivity / output-strict passivity arguments",
        mechanism := .missing_bound, layer := .formal,
        known := "Give asymptotic consensus for sector-bounded nonlinearities but no explicit convergence rate.",
        implication := "Formalize the linear-case rate theorem as milestone zero and extend it to Lipschitz couplings in Mathlib." },
    ] }

-- 档案良构机器核验：三道题的全部记录 method + partial 均非空。
example : mp001.records.all wellFormed = true := by native_decide
example : mc004.records.all wellFormed = true := by native_decide
example : me001.records.all wellFormed = true := by native_decide

end Catalog

end MathX.FailureRecord
