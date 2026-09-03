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
-- GENERATED-BY: scripts/gen-failure-lean.mjs（勿手改；目录 failure_records 的 Lean 类型化档案）
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

def mp002 : Profile :=
  { problemId := "mp-002",
    records := [
      { method := "Harris-type / asymptotic strong Feller coupling (Hairer–Mattingly)",
        mechanism := .missing_bound, layer := .model,
        known := "Ergodicity with finitely many forced modes is proved and exponential mixing follows from Harris-type theorems, but with constants far from sharp.",
        implication := "Identify the optimal exponent a in the nu^a scaling of the Markov-semigroup spectral gap and certify matching upper and lower mixing bounds uniformly in nu." },
      { method := "Jacobian-flow sensitivity control under hypoelliptic drift",
        mechanism := .parameter_sensitive, layer := .param,
        known := "Noise reaches high modes only through the nonlinear term; the Jacobian flow is controlled non-uniformly in the viscosity nu.",
        implication := "A uniform-in-nu estimate on the Jacobian flow is the missing ingredient that converts abstract mixing into the sharp nu^a rate." },
    ] }

def mp003 : Profile :=
  { problemId := "mp-003",
    records := [
      { method := "KAM / Nekhoroshev perturbation theory",
        mechanism := .combinatorial, layer := .param,
        known := "At low energy most tori persist and Nekhoroshev-type estimates give exponential long-time stability, but the constants degenerate badly as N grows.",
        implication := "A thermodynamic-limit estimate needs KAM/Nekhoroshev constants uniform in the particle number N; the degenerating constants are the obstruction." },
      { method := "Arnold-diffusion / slow-drift analysis",
        mechanism := .missing_bound, layer := .model,
        known := "Numerics suggest a slow drift drives late-time equilibration, but no rigorous mechanism for it exists.",
        implication := "Bound the drift that transfers energy across resonances to obtain the equilibration time T_eq(N,epsilon) and the KAM/thermalization cutoff." },
    ] }

def mp004 : Profile :=
  { problemId := "mp-004",
    records := [
      { method := "Multi-scale analysis (Fröhlich–Spencer)",
        mechanism := .missing_bound, layer := .model,
        known := "Proves localization for large disorder or at spectral edges in any dimension; it needs an a priori decay scale that is missing for small lambda in d=2.",
        implication := "Construct the missing decay scale at weak disorder instead of assuming it — the decisive step for localization at all lambda > 0 on Z^2." },
      { method := "Fractional-moment method (Aizenman–Molchanov)",
        mechanism := .parameter_sensitive, layer := .param,
        known := "Gives localization in d=1 at all disorders and at large disorder in higher dimensions; weak-disorder resonances in d=2 defeat the resolvent estimate.",
        implication := "A disorder-uniform resolvent bound on Z^2 would push localization below the current resonance-limited regime." },
    ] }

def mp005 : Profile :=
  { problemId := "mp-005",
    records := [
      { method := "Projector-anticommutator / finite-volume eigenvalue certificates (Lemm–Sandvik–Wang; Pomata–Wei)",
        mechanism := .combinatorial, layer := .num,
        known := "Closed the honeycomb (degree-3) gap with numerically assisted DMRG/Lanczos certificates; the estimates fail at vertex degree 4 and the finite problems exceed exact-diagonalization reach.",
        implication := "A verified finite eigenvalue certificate (rigorous Lanczos / interval bounds) on the square lattice is the concrete formalization target." },
      { method := "PEPS / transfer-matrix gap arguments",
        mechanism := .missing_bound, layer := .formal,
        known := "The gap does not follow from the frustration-free PEPS structure alone; non-uniqueness of parent Hamiltonians blocks transfer-matrix arguments.",
        implication := "Formalize the finite-matrix certificate and push the anticommutator estimates to vertex degree 4 to reach the thermodynamic limit." },
    ] }

def mp006 : Profile :=
  { problemId := "mp-006",
    records := [
      { method := "I-method (Bourgain; CKSTT)",
        mechanism := .missing_bound, layer := .model,
        known := "Polynomial growth bounds for the H^s norm are known with non-optimal exponents; arbitrarily large finite growth is established, unboundedness is not.",
        implication := "Improve the I-method exponents toward the conjectured optimal t^C(s) and decide whether sup over t of the H^s norm can be infinite for s > 1." },
      { method := "Resonant frequency analysis (Guardia–Kaloshin)",
        mechanism := .combinatorial, layer := .param,
        known := "Growth is driven by resonant frequency interactions whose combinatorics on Z^2 is only controlled at small scales.",
        implication := "A large-scale combinatorial control of the resonant sets would turn the energy cascade into a rigorous polynomial bound." },
    ] }

def mp007 : Profile :=
  { problemId := "mp-007",
    records := [
      { method := "Matrix-Brownian-motion embedding / moment method (Yau–Yin)",
        mechanism := .parameter_sensitive, layer := .model,
        known := "Delocalization and bulk universality are proved for W > N^(1/2+epsilon); the embedding estimates saturate at the N^epsilon margin above sqrt(N).",
        implication := "Remove the epsilon in the window W in [N^(1/2), N^(1/2+epsilon)] by sharpening the moment/embedding estimates at the critical scale." },
      { method := "Fractional-moment localization (Schenker; Peled–Schenker–Shamis–Sodin)",
        mechanism := .missing_bound, layer := .param,
        known := "Proves localization only for W much smaller than N^(1/8); rare resonances near the critical window defeat resolvent bounds.",
        implication := "Extend the resolvent / fractional-moment control toward the sqrt(N) threshold where the transition is conjectured." },
    ] }

def mp008 : Profile :=
  { problemId := "mp-008",
    records := [
      { method := "Suitable weak solutions (Caffarelli–Kohn–Nirenberg partial regularity)",
        mechanism := .unbounded_residual, layer := .model,
        known := "Bounds the singular set of suitable weak solutions, but gives no positive lower bound on energy dissipation.",
        implication := "A certified-numerics route on a restricted solution class could establish the residual layer for the R_num/R_model band." },
      { method := "Onsager critical-regularity / anomalous dissipation programme",
        mechanism := .missing_bound, layer := .formal,
        known := "Dissipation anomaly at critical regularity is conjectured for Euler, not established for the NS zero-viscosity limit.",
        implication := "Formalizing the CKN partial-regularity theorem is a concrete first step toward a machine-checkable target." },
    ] }

def mc001 : Profile :=
  { problemId := "mc-001",
    records := [
      { method := "Pseudo-Helmholtz Lyapunov function (Horn–Jackson)",
        mechanism := .unbounded_residual, layer := .model,
        known := "Establishes local asymptotic stability; the Lyapunov function is proper only on compact subsets of the relative interior, so trajectories near the orthant faces escape its control.",
        implication := "Control the lock-down (semi-locking) sets to certify that no omega-limit point lies on the boundary — the decisive step toward global stability." },
      { method := "Numerical counterexample search",
        mechanism := .combinatorial, layer := .num,
        known := "The network space grows combinatorially and numerics cannot distinguish slow convergence from boundary attraction.",
        implication := "Verified (interval / rigorous) simulation can certify whether a trajectory approaches the boundary, complementing the Lyapunov argument." },
    ] }

def mc002 : Profile :=
  { problemId := "mc-002",
    records := [
      { method := "Endotactic / geometric reaction-vector criteria (Craciun–Nazarov–Pantea; Gopalkrishnan–Miller–Shiu)",
        mechanism := .missing_bound, layer := .model,
        known := "Prove persistence for all endotactic networks, covering all 2D and many higher-dimensional cases; weakly reversible networks need not be endotactic in dimension >= 3.",
        implication := "Extend the geometric reaction-vector condition to the weakly-reversible non-endotactic cases in dimension >= 3." },
      { method := "Semilock-set / face-boundary analysis",
        mechanism := .combinatorial, layer := .model,
        known := "A trajectory can approach a face of the orthant without any single species going to zero, evading semilock-set arguments.",
        implication := "Classify the face-approach dynamics combinatorially to certify a uniform distance from the boundary." },
    ] }

def mc003 : Profile :=
  { problemId := "mc-003",
    records := [
      { method := "Inverse eigenvalue / realizability constraints for benzenoids",
        mechanism := .combinatorial, layer := .model,
        known := "Benzenoids are bipartite so spectra are symmetric; realizability couples integer-coefficient characteristic polynomials with hexagonal-embedding geometry, and no inverse theorem exists for the family.",
        implication := "A verified enumeration of polyhex structures combined with interval arithmetic can certify realizability decisions for target gaps." },
      { method := "Extremal HOMO–LUMO gap search via Clar structures",
        mechanism := .missing_bound, layer := .formal,
        known := "Extremal gap candidates are conjectured from chemical heuristics without proof.",
        implication := "Prove the extremal-gap bound, replacing heuristic conjectures with a certified quadratic spectral criterion." },
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

def mc005 : Profile :=
  { problemId := "mc-005",
    records := [
      { method := "Differential-algebra identifiability (DAISY and successors)",
        mechanism := .combinatorial, layer := .num,
        known := "Decides identifiability for moderate-size models, but with no general complexity classification purely in terms of graph-theoretic data.",
        implication := "Formalize the correctness of the differential-algebra decision procedure for linear compartmental models as the machine-checkable first milestone." },
      { method := "Parameter-equivalence / indistinguishability analysis",
        mechanism := .parameter_sensitive, layer := .param,
        known := "Fully characterizes parameter equivalence classes for small networks; structurally identifiable parameters may still be practically unrecoverable.",
        implication := "Propagate the measurement interval through the decision boundary so identifiability conclusions remain stable for all k in the interval." },
    ] }

def mb001 : Profile :=
  { problemId := "mb-001",
    records := [
      { method := "Markov-chain state-space aggregation (isothermal theorem)",
        mechanism := .combinatorial, layer := .num,
        known := "The Moran chain has 2^N states; symmetries collapse it only for highly structured graphs, and exact computation is #P-hard in general.",
        implication := "A polynomial-time algorithm for special graph families, or a certified FPRAS for undirected graphs, is the tractable formalization target." },
      { method := "Amplifier classification via initialization schemes",
        mechanism := .parameter_sensitive, layer := .param,
        known := "Amplification depends on temperature- versus uniform-initialized placement; no unified classification exists even for undirected graphs.",
        implication := "Classify amplifiers per initialization scheme — a unified criterion is the missing statement." },
    ] }

def mb002 : Profile :=
  { problemId := "mb-002",
    records := [
      { method := "Potential-theoretic metastability (reversible tunneling theory)",
        mechanism := .missing_bound, layer := .model,
        known := "Metastability machinery applies only partially because the contact process is not reversible; rigorous results exist for regular trees and lattices.",
        implication := "Non-reversible potential-theoretic bounds are needed to settle the spectral-radius versus subgraph-trapping dichotomy for general graphs." },
      { method := "Bottleneck-subgraph / trapping analysis (Chatterjee–Durrett)",
        mechanism := .combinatorial, layer := .param,
        known := "Stars survive exponentially long below the mean-field threshold; characterizing the bottleneck configuration for a general graph is a combinatorial problem.",
        implication := "Identify the worst subgraph combinatorially to certify which graph families are governed by the adjacency spectral radius versus trapping." },
    ] }

def mb003 : Profile :=
  { problemId := "mb-003",
    records := [
      { method := "ESS / perturbation arguments (Hofbauer–Sigmund)",
        mechanism := .parameter_sensitive, layer := .param,
        known := "ESS guarantees global stability at mu = 0 and for partnership games; perturbation arguments are local and give no uniform-in-mu statement.",
        implication := "A Lyapunov certificate uniform in the mutation rate mu is the required form for the stable classification." },
      { method := "Lyapunov ruling-out of Hopf bifurcations",
        mechanism := .missing_bound, layer := .model,
        known := "Mutation can create limit cycles; Lyapunov functions that rule them out globally are known only for special payoff matrices A.",
        implication := "Extend the ODE stability library to certify global stability for the classifying pairs (A, Q), not just the mu = 0 case." },
    ] }

def mb004 : Profile :=
  { problemId := "mb-004",
    records := [
      { method := "Average Lyapunov function / splitting method (Hofbauer–Schreiber)",
        mechanism := .combinatorial, layer := .model,
        known := "Gives sufficient conditions via average Lyapunov functions; the boundary has 2^n - 1 faces whose invariant sets can be chaotic, so the criterion must average over all of them.",
        implication := "A finite algorithmic criterion over boundary average Lyapunov exponents is the target form, with each boundary invariant set growth certified." },
      { method := "Boundary invariant-set growth computation",
        mechanism := .nonconvex, layer := .num,
        known := "Deciding whether some boundary invariant set has positive average growth is not known to be decidable in general.",
        implication := "Verified computation of average Lyapunov exponents for n <= 3 is the tractable certified milestone." },
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

def me002 : Profile :=
  { problemId := "me-002",
    records := [
      { method := "Worst-case adversarial graph-sequence construction",
        mechanism := .combinatorial, layer := .num,
        known := "Lower bounds exist only for restricted graph sequences or communication models; the space of sequences is combinatorially huge and existing constructions are not known to be extremal.",
        implication := "An extremal graph-sequence construction matching the accelerated push-sum/gossip upper bounds is the needed certificate." },
      { method := "First-order oracle complexity framework",
        mechanism := .missing_bound, layer := .formal,
        known := "Static-graph lower bounds are near-tight; the role of the connectivity period B versus the spectral gap of the averaged graph is unresolved.",
        implication := "Formalize the oracle-complexity framework (deterministic vs randomized) to certify the matching lower bound in the time-varying model." },
    ] }

def me003 : Profile :=
  { problemId := "me-003",
    records := [
      { method := "Energy / entropy dissipation estimate (Cucker–Smale; Ha–Liu)",
        mechanism := .missing_bound, layer := .model,
        known := "Regular-kernel (alpha < 1) unconditional flocking is proven via energy dissipation; the singularity destroys the dissipation structure used to prove alignment.",
        implication := "A singular-kernel Lyapunov functional that controls both collisions and velocity alignment would close the alpha >= 1 case." },
      { method := "Contraction / spectral graph argument on state-dependent topology",
        mechanism := .combinatorial, layer := .param,
        known := "The interaction graph depends on the configuration, blocking fixed-spectrum contraction arguments; sticky / measure-valued formulations are only partially developed.",
        implication := "Formalize the regular-kernel Ha–Liu proof first; singular-kernel well-posedness needs measure-theory infrastructure beyond current libraries." },
    ] }

def me004 : Profile :=
  { problemId := "me-004",
    records := [
      { method := "Expander-decomposition algorithms (Chang–Pettie–Saranurak–Zhang)",
        mechanism := .unbounded_residual, layer := .num,
        known := "Give O-tilde(n^(1/3))-type upper bounds whose expander-decomposition overhead hides logarithmic slack.",
        implication := "Sharpen the expander-decomposition overhead to decide whether triangle listing matches the O-tilde(n^(1/3)) lower bound exactly." },
      { method := "Two-party communication-complexity reductions (Izumi–Le Gall)",
        mechanism := .missing_bound, layer := .model,
        known := "Yield O-tilde(n^(1/3)) lower bounds but do not capture the multi-party topology of the input graph.",
        implication := "A multi-party reduction capturing the graph topology is needed to settle the exact exponent and logarithmic factors." },
    ] }

def me006 : Profile :=
  { problemId := "me-006",
    records := [
      { method := "Martingale / drift analysis of informed-set sizes",
        mechanism := .missing_bound, layer := .model,
        known := "Give O(log n / Phi(G)) bounds up to polylog slack, tight for regular expanders; correlations across rounds resist the martingale methods.",
        implication := "Control inter-round correlations to remove the polylog slack and prove the universal O(log n / Phi(G)) bound." },
      { method := "Conductance-based analysis (Chierichetti–Lattanzi–Panconesi)",
        mechanism := .parameter_sensitive, layer := .param,
        known := "Give almost tight bounds via conductance; bottleneck-chain graphs show conductance alone is not the right parameter.",
        implication := "Identify the composite graph parameter (e.g. vertex expansion combined with diameter) that yields matching upper and lower bounds." },
    ] }

def me008 : Profile :=
  { problemId := "me-008",
    records := [
      { method := "Work-function / potential method (Koutsoupias–Papadimitriou)",
        mechanism := .missing_bound, layer := .model,
        known := "The work-function algorithm achieves at most 2k - 1; no known potential forces the conjectured ratio k on general metrics.",
        implication := "A potential or dual certificate with ratio exactly k is the required construction for the general case." },
      { method := "Dual-instance / crossing lower-bound construction",
        mechanism := .combinatorial, layer := .param,
        known := "Matching lower bounds are known only in special cases (lines, trees); the crossing / dual-instance request families are not constructed generally.",
        implication := "Build the extremal request-sequence family so the matching lower bound is certified by explicit dual certificates." },
    ] }

def me027 : Profile :=
  { problemId := "me-027",
    records := [
      { method := "Dynamic programming / value iteration",
        mechanism := .combinatorial, layer := .num,
        known := "Numerical DP explodes in state dimension; the objective is non-convex, so grid search gives no global optimum.",
        implication := "A certified gap needs a relaxation lower bound valid uniformly in (sigma, k) — interval / SDP route." },
      { method := "Optimal-transport viewpoint (Wu–Verdú)",
        mechanism := .nonconvex, layer := .formal,
        known := "Yields policy families and numerical evidence of nonlinearity, but no proof that the global optimum is nonlinear.",
        implication := "Formalizing the linear-vs-nonlinear dichotomy is the open step; a quantified distance certificate is the accepted form." },
    ] }

def me028 : Profile :=
  { problemId := "me-028",
    records := [
      { method := "Rank-k sequential laminate constructions",
        mechanism := .combinatorial, layer := .formal,
        known := "Two-phase Hashin–Shtrikman bounds are attained by laminates; three-phase attainability is open.",
        implication := "Certifying the attainable set needs a semidefinite relaxation of the family of quadratic inequalities." },
      { method := "Hashin–Shtrikman variational bounds",
        mechanism := .unbounded_residual, layer := .model,
        known := "Give two-sided bounds but not the exact G-closure for m >= 3 phases.",
        implication := "A constructive interior counterexample (attainable tensor strictly inside the bounds) is the decisive accepted form." },
    ] }

example : mp001.records.all wellFormed = true := by native_decide
example : mp002.records.all wellFormed = true := by native_decide
example : mp003.records.all wellFormed = true := by native_decide
example : mp004.records.all wellFormed = true := by native_decide
example : mp005.records.all wellFormed = true := by native_decide
example : mp006.records.all wellFormed = true := by native_decide
example : mp007.records.all wellFormed = true := by native_decide
example : mp008.records.all wellFormed = true := by native_decide
example : mc001.records.all wellFormed = true := by native_decide
example : mc002.records.all wellFormed = true := by native_decide
example : mc003.records.all wellFormed = true := by native_decide
example : mc004.records.all wellFormed = true := by native_decide
example : mc005.records.all wellFormed = true := by native_decide
example : mb001.records.all wellFormed = true := by native_decide
example : mb002.records.all wellFormed = true := by native_decide
example : mb003.records.all wellFormed = true := by native_decide
example : mb004.records.all wellFormed = true := by native_decide
example : me001.records.all wellFormed = true := by native_decide
example : me002.records.all wellFormed = true := by native_decide
example : me003.records.all wellFormed = true := by native_decide
example : me004.records.all wellFormed = true := by native_decide
example : me006.records.all wellFormed = true := by native_decide
example : me008.records.all wellFormed = true := by native_decide
example : me027.records.all wellFormed = true := by native_decide
example : me028.records.all wellFormed = true := by native_decide
end Catalog

end MathX.FailureRecord
