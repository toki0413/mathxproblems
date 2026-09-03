import Std

/-!
SHARED-MODULE: SolutionSteps

解题层参考证明——把目录题的核心可证子结果（"证明台阶"）真实形式化（非 sorry），
作为"从问题收录到解题层"的 L3 落点。std-only（无 mathlib），全部用 Int/Nat/List
原语与归纳证明；CI 用 `lean <file>` 直接编译即机器核验。每个定理都是完整证明。

当前台阶：
  1. me-034（有限率量化平均共识·最优最坏收敛时间）：质量守恒不变量
     量化平均共识只沿边、按整数轮交换状态，总量不创造不销毁 ⇒ 任意轮后总量不变。
     这是"可收敛到精确平均"的必要前提：极限唯一可能是初始均值（mass-preservation）。
  2. me-001（非线性多智能体共识收敛率）：奇耦合 ⇒ φ(0)=0
     共识动态 ẋ_i = Σ_{j∈N(i)} φ(x_j - x_i) 中，Lipschitz 奇耦合 φ 满足 φ(0)=0，
     一致状态是不动点——收敛证明的起点。
  3. me-001（第二台阶）：奇耦合配对抵消
     (i,j) 与反向 (j,i) 的贡献 φ(x_j-x_i) + φ(x_i-x_j) 之和为零——
     完整图所有有序对 Σ φ(x_j-x_i) 逐对抵消，是总量/均值守恒论证的原子步。
  4. me-013（在线装箱·最优渐近竞争比）：容量下界
     每个 bin 负载 ≤ C ⇒ n 个 bin 总负载 ≤ n·C（bin 数 ≥ totalLoad/C），
     在线装箱竞争比下界论证的平凡但可证的容量约束。
  5. me-001（第三台阶）：一致状态是共识动态的不动点
     所有分量相等时，耦合项 Σ_j φ(x_j - x_i) 全零，一步后每个分量不变
     （consensus_step_fixes_equal）——共识收敛极限形态的完整证明。
  6. mc-022（数学化学·Kekulé 结构）：完美匹配 ⇒ 顶点数为偶
     苯并类 Kekulé 结构即完美匹配；双计数（covered_length_eq_two_mul）
     证明被覆盖顶点数 = 2 × 匹配边数，故覆盖 n 个顶点 ⇒ n 是偶数
     （kekule_requires_even_vertices）——Kekulé 结构存在性的必要条件。
  7. me-001（第四台阶）：完整图总量守恒（均值不变）
     所有有序对耦合项之和为零（pairSum_zero，逐对抵消）；
     故一步后 Σ x_i' = Σ x_i（consensus_step_mass_conserved）——
     "极限只能等于初始均值"的最后一块：一致不动点 + 质量守恒 ⇒ 极限 = 初始均值。
  8. me-013（第二台阶）：Next-Fit 密度引理（双计数）
     相邻 bin 负载和 > C 时，双计数恒等式 2·totalLoad = Σ相邻对 + 首 + 尾
     （double_count）给出 (n-1)(C+1) ≤ 2·totalLoad（adjacent_over_total_bound）——
     Next-Fit 竞争比 ≤ 2 论证的核心。
  9. mc-022（第二台阶）：偶环有完美匹配（苯环 C₆ 的一般化）
     偶环 C_{2k} 的交替双键 {0-1, 2-3, …, (2k-2)-(2k-1)} 覆盖全部顶点
     （even_cycle_has_perfect_matching）——Kekulé 结构存在性的充分方向。
-/
namespace MathX.SolutionSteps

/-! ── me-034 台阶：质量守恒 ────────────────────────────────────────── -/

/-- 总量：状态列表各分量之和（质量守恒的守恒量）。 -/
def mass (xs : List Int) : Int := xs.foldl (fun acc x => acc + x) 0

/-- 一轮"平均保持"更新：不创造也不销毁总量。 -/
def MassPreserving (f : List Int → List Int) : Prop :=
  ∀ xs, mass (f xs) = mass xs

/-- 迭代 k 轮。 -/
def iter (f : α → α) : Nat → α → α
  | 0, x => x
  | k + 1, x => iter f k (f x)

/-- 迭代的递归引理：iter f (k+1) x = iter f k (f x)。 -/
theorem iter_succ (f : α → α) (k : Nat) (x : α) : iter f (k + 1) x = iter f k (f x) := by
  rfl

/-- me-034 核心不变量：平均保持更新迭代任意轮后，总量不变。
    证明：对轮数 k 归纳；0 轮平凡；k+1 轮先走一轮再走 k 轮，
    用归纳假设与单轮保持的传递性。 -/
theorem mass_preserved_iterated {f : List Int → List Int} (h : MassPreserving f) :
    ∀ k : Nat, ∀ xs : List Int, mass (iter f k xs) = mass xs := by
  intro k
  induction k with
  | zero =>
      intro xs
      rfl
  | succ k ih =>
      intro xs
      calc
        mass (iter f (k + 1) xs) = mass (iter f k (f xs)) := by rw [iter_succ]
        _ = mass (f xs) := ih (f xs)
        _ = mass xs := h xs

/-- 机器核验样例：量化共识 [1,3,-2] 总量 2；恒等更新迭代 5 轮后仍 2。 -/
example : mass [1, 3, -2] = 2 := by
  native_decide
example : mass (iter (fun xs => xs) 5 [1, 3, -2]) = 2 := by
  rw [mass_preserved_iterated (f := fun xs => xs) (by intro xs; rfl) 5]
  native_decide

/-! ── me-001 台阶：奇耦合 ⇒ φ(0)=0 ─────────────────────────────────── -/

/-- 奇耦合：φ(-x) = -φ(x)。 -/
def OddCoupling (φ : Int → Int) : Prop :=
  ∀ x, φ (-x) = -φ x

/-- 奇函数在 0 处取 0。共识动态中一致状态因此是不动点（收敛证明的起点）。 -/
theorem odd_coupling_zero (φ : Int → Int) (hφ : OddCoupling φ) : φ 0 = 0 := by
  have h0 : φ 0 = -φ 0 := by
    simpa using hφ 0
  omega

/-- 配对抵消（me-001 第二台阶）：奇耦合下，有序对 (i,j) 的贡献 φ(x_j - x_i)
    与反向 (j,i) 的贡献 φ(x_i - x_j) 之和为零。
    这是共识动态总量/均值守恒论证的原子步：完整图所有有序对的
    Σ_{i≠j} φ(x_j - x_i) 因此逐对抵消，总量不变。 -/
theorem odd_pair_cancels (φ : Int → Int) (hφ : OddCoupling φ) (a b : Int) :
    φ (a - b) + φ (b - a) = 0 := by
  have hb : b - a = -(a - b) := by
    omega
  rw [hb, hφ (a - b)]
  omega

-- 机器核验样例：两节点共识 a=1, b=3 上，反向贡献 φ(-2)+φ(2) 抵消。
example (φ : Int → Int) (hφ : OddCoupling φ) : φ (-2) + φ 2 = 0 :=
  odd_pair_cancels φ hφ 1 3

/-! ── me-001 第三台阶：一致状态是共识动态的不动点 ─────────────────── -/

/-- 一致状态：所有分量相等（共识收敛的极限形态）。 -/
def AllEqual (xs : List Int) : Prop :=
  ∀ a ∈ xs, ∀ b ∈ xs, a = b

/-- 一致状态中任意两分量的耦合项为零：a = b ⇒ φ(a - b) = φ(0) = 0。
    这是"一致状态是不动点"的原子事实。 -/
theorem all_equal_pairs_zero (φ : Int → Int) (hφ : OddCoupling φ) {xs : List Int}
    (h : AllEqual xs) : ∀ a ∈ xs, ∀ b ∈ xs, φ (a - b) = 0 := by
  intro a ha b hb
  have hab : a - b = 0 := by
    have hab' : a = b := h a ha b hb
    omega
  rw [hab]
  exact odd_coupling_zero φ hφ

/-- 全零项求和为零：Σ w(x) 全为 0 ⇒ foldl 和 = 0（w 泛化）。 -/
theorem sum_zero_of_all_zero {xs : List Int} (w : Int → Int) (h : ∀ x ∈ xs, w x = 0) :
    xs.foldl (fun acc x => acc + w x) 0 = 0 := by
  induction xs with
  | nil => simp
  | cons x xs ih =>
      simp
      have hx : w x = 0 := h x (by simp)
      have ih' : xs.foldl (fun acc x => acc + w x) 0 = 0 := ih (fun y hy => h y (by simp [hy]))
      rw [hx, ih']

/-- 完整图离散共识一步（含自环，步长 1）：x_i' = x_i + Σ_{j} φ(x_j - x_i)。 -/
def consensusStep (φ : Int → Int) (xs : List Int) : List Int :=
  xs.map (fun x => x + xs.foldl (fun acc y => acc + φ (y - x)) 0)

/-- 一致状态是共识动态的不动点：所有分量相等时，一步后每个分量不变。
    证明：逐分量看，耦合项 Σ_j φ(x_j - x_i) 因全零而抵消，x_i' = x_i。 -/
theorem consensus_step_fixes_equal (φ : Int → Int) (hφ : OddCoupling φ) (xs : List Int)
    (h : AllEqual xs) : consensusStep φ xs = xs := by
  unfold consensusStep
  have hmap :
      List.map (fun x => x + xs.foldl (fun acc y => acc + φ (y - x)) 0) xs = List.map id xs := by
    apply List.map_congr_left
    intro x hx
    have hsum : xs.foldl (fun acc y => acc + φ (y - x)) 0 = 0 := by
      apply sum_zero_of_all_zero (fun z => φ (z - x))
      intro z hz
      exact all_equal_pairs_zero φ hφ h z hz x hx
    simp [hsum]
  rw [hmap, List.map_id xs]

-- 机器核验样例：一致状态 [5,5,5] 是恒等/共识动态的不动点。
example (φ : Int → Int) (hφ : OddCoupling φ) : consensusStep φ [5, 5, 5] = [5, 5, 5] :=
  consensus_step_fixes_equal φ hφ [5, 5, 5] (by
    intro a ha b hb
    · simp at ha
      simp at hb
      rw [ha, hb])

/-! ── me-013 台阶：装箱容量下界 ───────────────────────────────────── -/

/-- 一个 bin 的负载：物品权重之和（权重为自然数；1D bin packing 容量归一化为 C）。 -/
def binLoad (items : List Nat) : Nat := items.foldl (fun a x => a + x) 0

/-- 装箱：bin 列表（每个 bin 是一个物品权重列表）。abbrev 保持可约，List 的 ∈ 实例可用。 -/
abbrev BinPacking := List (List Nat)

/-- 总负载：所有 bin 负载之和。 -/
def totalLoad (p : BinPacking) : Nat := p.foldl (fun a b => a + binLoad b) 0

/-- n 个 bin、容量 C 的总容量：逐 bin 累加 C（= C × bin 数；用递归避免乘法原子）。 -/
def capacitySum (C : Nat) (p : BinPacking) : Nat := p.foldl (fun acc _ => acc + C) 0

/-- foldl 提公因式：foldl (λa b, a + w b) x ys = x + foldl (λa b, a + w b) 0 ys。
    这是"求和可提取首项"的组合恒等式，供 totalLoad / capacitySum 展开。 -/
theorem foldl_extract_sum {α : Type} (ys : List α) (w : α → Nat) :
    ∀ x : Nat, ys.foldl (fun a b => a + w b) x = x + ys.foldl (fun a b => a + w b) 0 := by
  intro x
  induction ys generalizing x with
  | nil => simp [List.foldl]
  | cons y ys ih =>
      simp [List.foldl]
      have ih1 := ih (x + w y)
      have ih2 := ih (w y)
      omega

/-- 总负载单步提取：totalLoad (b::p) = binLoad b + totalLoad p。 -/
theorem totalLoad_cons (b : List Nat) (p : BinPacking) :
    totalLoad (b :: p) = binLoad b + totalLoad p := by
  unfold totalLoad
  simp [List.foldl]
  rw [foldl_extract_sum p binLoad (binLoad b)]

/-- 容量和单步提取：capacitySum C (b::p) = C + capacitySum C p。 -/
theorem capacitySum_cons (C : Nat) (b : List Nat) (p : BinPacking) :
    capacitySum C (b :: p) = C + capacitySum C p := by
  unfold capacitySum
  simp [List.foldl]

/-- 容量下界：若每个 bin 负载 ≤ C（容量 C），则 n 个 bin 的总负载 ≤ n·C，
    即 bin 数 ≥ totalLoad / C——任何装箱的平凡但可证的容量约束，
    在线装箱竞争比下界论证的起点。证明：对 bin 数归纳，逐 bin 累加。 -/
theorem totalLoad_le_capacity {C : Nat} (p : BinPacking) (h : ∀ b ∈ p, binLoad b ≤ C) :
    totalLoad p ≤ capacitySum C p := by
  induction p with
  | nil =>
      simp [totalLoad, capacitySum]
  | cons b p ih =>
      rw [totalLoad_cons, capacitySum_cons]
      have hb : binLoad b ≤ C := h b (by simp)
      have ih' : totalLoad p ≤ capacitySum C p := ih (fun b' hb' => h b' (by simp [hb']))
      omega

/-- 机器核验样例：装箱 [[1,1],[2]] 负载 2+2=4，bin 数 2，容量 3：2·3=6 ≥ 4。 -/
example : totalLoad [[1, 1], [2]] = 4 := by
  native_decide
example : capacitySum 3 [[1, 1], [2]] = 6 := by
  native_decide
example : totalLoad [[1, 1], [2]] ≤ capacitySum 3 [[1, 1], [2]] := by
  native_decide

/-! ── mc-022 台阶：Kekulé 结构 = 完美匹配 ⇒ 顶点数为偶 ────────────── -/

/-- 一条边展成两个端点（flatMap 的映射函数）。 -/
def edgeVerts (e : Nat × Nat) : List Nat := [e.1, e.2]

/-- 匹配覆盖的顶点列表：所有边的端点平铺。 -/
def covered (edges : List (Nat × Nat)) : List Nat :=
  edges.flatMap edgeVerts

/-- 完美匹配：所有端点无重复（自动蕴含每条边端点不同），且恰好覆盖 n 个顶点。
    苯并类 Kekulé 结构正是这样的完美匹配。 -/
def PerfectMatching (edges : List (Nat × Nat)) (n : Nat) : Prop :=
  (covered edges).Nodup ∧ (covered edges).length = n ∧
    (∀ v, v < n → v ∈ covered edges)

/-- n 是偶数：∃ k, n = 2k（std-only 无 mathlib 的 Even，自行定义）。 -/
def IsEven (n : Nat) : Prop := ∃ k : Nat, n = 2 * k

/-- Kekulé 双计数：完美匹配中，被覆盖顶点数 = 2 × 匹配边数。
    证明：对边归纳；Nodup 保证新边两个端点不与已覆盖顶点重复，
    每条边贡献恰好 2 个新顶点。 -/
theorem covered_length_eq_two_mul {edges : List (Nat × Nat)}
    (hn : (covered edges).Nodup) :
    (covered edges).length = 2 * edges.length := by
  induction edges with
  | nil =>
      simp [covered]
  | cons e es ih =>
      have hc : covered (e :: es) = [e.1, e.2] ++ covered es := by
        simp [covered, edgeVerts]
      have hnes : (covered es).Nodup := by
        rw [hc] at hn
        rw [List.nodup_append] at hn
        exact hn.2.1
      rw [hc, List.length_append]
      rw [ih hnes]
      simp
      omega

/-- Kekulé 结构存在的必要条件是顶点数为偶：完美匹配覆盖 n 个顶点 ⇒ n 是偶数。
    苯并类（苯、石墨烯碎片等）必须有偶数个碳原子才可能有 Kekulé 结构。 -/
theorem kekule_requires_even_vertices {edges : List (Nat × Nat)} {n : Nat}
    (h : PerfectMatching edges n) : IsEven n := by
  rcases h with ⟨hnodup, hlen, _⟩
  have h2 : n = 2 * edges.length := by
    rw [← hlen]
    exact covered_length_eq_two_mul hnodup
  exact ⟨edges.length, h2⟩

-- 机器核验样例：苯（6 个碳，3 条 Kekulé 双键）覆盖 6 个顶点。
example : covered [(0, 1), (2, 3), (4, 5)] = [0, 1, 2, 3, 4, 5] := by
  native_decide
example : PerfectMatching [(0, 1), (2, 3), (4, 5)] 6 := by
  refine ⟨?_, ?_, ?_⟩
  · native_decide
  · native_decide
  · intro v hv
    have hv' : v = 0 ∨ v = 1 ∨ v = 2 ∨ v = 3 ∨ v = 4 ∨ v = 5 := by
      omega
    rcases hv' with rfl | rfl | rfl | rfl | rfl | rfl <;> simp [covered, edgeVerts]
example : IsEven 6 := by
  exact kekule_requires_even_vertices (edges := [(0, 1), (2, 3), (4, 5)]) (n := 6) (by
    refine ⟨?_, ?_, ?_⟩
    · native_decide
    · native_decide
    · intro v hv
      have hv' : v = 0 ∨ v = 1 ∨ v = 2 ∨ v = 3 ∨ v = 4 ∨ v = 5 := by
        omega
      rcases hv' with rfl | rfl | rfl | rfl | rfl | rfl <;> simp [covered, edgeVerts])

/-! ── me-001 第四台阶：完整图总量守恒（均值不变） ───────────────────── -/

/-- 列表和（Int）。 -/
def isum (xs : List Int) : Int := xs.foldl (fun acc x => acc + x) 0

/-- foldl 提取首项（Int 版）：foldl (λ a b, a + w b) x ys = x + foldl (λ a b, a + w b) 0 ys。 -/
theorem foldl_extract_sum_int {α : Type} (ys : List α) (w : α → Int) :
    ∀ x : Int, ys.foldl (fun a b => a + w b) x = x + ys.foldl (fun a b => a + w b) 0 := by
  intro x
  induction ys generalizing x with
  | nil => simp [List.foldl]
  | cons y ys ih =>
      rw [List.foldl_cons]
      rw [List.foldl_cons]
      have ih1 := ih (x + w y)
      rw [ih1]
      have ih2 := ih (0 + w y)
      rw [ih2]
      omega

/-- isum 的 cons 单步：isum (x :: xs) = x + isum xs。 -/
theorem isum_cons (x : Int) (xs : List Int) : isum (x :: xs) = x + isum xs := by
  unfold isum
  rw [List.foldl_cons]
  rw [foldl_extract_sum_int xs (fun y : Int => y) (0 + x)]
  simp

/-- 求和可分配进加法：foldl (λ a b, a + (w b + v b)) = foldl w + foldl v。 -/
theorem foldl_add_distrib {α : Type} (w v : α → Int) (xs : List α) :
    xs.foldl (fun acc a => acc + (w a + v a)) 0
      = xs.foldl (fun acc a => acc + w a) 0 + xs.foldl (fun acc a => acc + v a) 0 := by
  induction xs with
  | nil => simp [List.foldl]
  | cons y ys ih =>
      rw [List.foldl_cons]
      rw [List.foldl_cons]
      rw [List.foldl_cons]
      rw [foldl_extract_sum_int ys (fun a => w a + v a) (0 + (w y + v y))]
      rw [foldl_extract_sum_int ys w (0 + w y)]
      rw [foldl_extract_sum_int ys v (0 + v y)]
      rw [ih]
      omega

/-- map 后再求和 = 原和 + 逐项增量：sum (xs.map (λ x, x + w x)) = sum xs + Σ w。 -/
theorem sum_map_add (w : Int → Int) (xs : List Int) :
    isum (xs.map (fun x => x + w x)) = isum xs + xs.foldl (fun acc x => acc + w x) 0 := by
  induction xs with
  | nil => simp [isum]
  | cons x xs ih =>
      simp [List.map]
      rw [isum_cons]
      rw [ih]
      rw [isum_cons]
      rw [foldl_extract_sum_int xs w (w x)]
      omega

/-- 完整图所有有序对耦合项之和：Σ_{a∈xs} Σ_{b∈xs} φ(b - a)。 -/
def pairSum (φ : Int → Int) (xs : List Int) : Int :=
  xs.foldl (fun acc x => acc + xs.foldl (fun acc y => acc + φ (y - x)) 0) 0

/-- 内层和的首项提取：(x :: xs) 上求和 = φ(x-a) + xs 上求和。 -/
theorem inner_cons (φ : Int → Int) (x : Int) (xs : List Int) (a : Int) :
    (x :: xs).foldl (fun acc y => acc + φ (y - a)) 0
      = φ (x - a) + xs.foldl (fun acc y => acc + φ (y - a)) 0 := by
  rw [List.foldl_cons]
  rw [foldl_extract_sum_int xs (fun y => φ (y - a)) (0 + φ (x - a))]
  omega

/-- Σ_{b∈xs} (φ(b-x) + φ(x-b)) = 0：奇耦合下逐项抵消（局部配对）。 -/
theorem pair_sum_local_zero (φ : Int → Int) (hφ : OddCoupling φ) (x : Int) (xs : List Int) :
    xs.foldl (fun acc b => acc + (φ (b - x) + φ (x - b))) 0 = 0 := by
  induction xs with
  | nil => simp [List.foldl]
  | cons y ys ih2 =>
      rw [List.foldl_cons]
      rw [foldl_extract_sum_int ys (fun b => φ (b - x) + φ (x - b)) (0 + (φ (y - x) + φ (x - y)))]
      rw [odd_pair_cancels φ hφ y x]
      rw [ih2]
      omega

/-- pairSum 的 cons 展开：新增元素 x 的"出/入"双向贡献 + 其余元素内部。
    证明要点：对角项 φ(x - x) = φ 0 = 0（奇耦合）自动消失。 -/
theorem pairSum_cons (φ : Int → Int) (hφ : OddCoupling φ) (x : Int) (xs : List Int) :
    pairSum φ (x :: xs)
      = pairSum φ xs
      + xs.foldl (fun acc b => acc + φ (b - x)) 0
      + xs.foldl (fun acc a => acc + φ (x - a)) 0 := by
  unfold pairSum
  rw [List.foldl_cons]
  rw [foldl_extract_sum_int xs (fun a => (x :: xs).foldl (fun acc y => acc + φ (y - a)) 0) (0 + (x :: xs).foldl (fun acc y => acc + φ (y - x)) 0)]
  simp only [inner_cons]
  rw [foldl_add_distrib (fun a => φ (x - a)) (fun a => xs.foldl (fun acc y => acc + φ (y - a)) 0) xs]
  have h00 : φ (x - x) = 0 := by
    simpa using odd_coupling_zero φ hφ
  rw [h00]
  have hps : xs.foldl (fun acc a => acc + xs.foldl (fun acc y => acc + φ (y - a)) 0) 0 = pairSum φ xs := rfl
  rw [hps]
  omega

/-- 奇耦合下完整图总量守恒的原子事实：所有有序对耦合项之和为零。
    证明：cons 展开后，新元素 x 与其余元素的"出/入"双向贡献逐对抵消（odd_pair_cancels），
    其余元素内部的贡献由归纳假设归零。这是共识动态均值不变的核心。 -/
theorem pairSum_zero (φ : Int → Int) (hφ : OddCoupling φ) (xs : List Int) :
    pairSum φ xs = 0 := by
  induction xs with
  | nil => rfl
  | cons x xs ih =>
      rw [pairSum_cons φ hφ x xs]
      have hpair :
          xs.foldl (fun acc b => acc + φ (b - x)) 0
            + xs.foldl (fun acc a => acc + φ (x - a)) 0 = 0 := by
        have hsum := foldl_add_distrib (fun b => φ (b - x)) (fun b => φ (x - b)) xs
        have hzero := pair_sum_local_zero φ hφ x xs
        have hab :
            xs.foldl (fun acc b => acc + φ (b - x)) 0
              + xs.foldl (fun acc b => acc + φ (x - b)) 0 = 0 := by
          omega
        simpa using hab
      omega

/-- 完整图离散共识一步的总质量守恒：Σ x_i' = Σ x_i（均值不变）。
    这是"极限只能等于初始均值"的最后一块：一致状态是不动点（第三台阶）
    且质量守恒 ⇒ 一致极限必为初始均值。 -/
theorem consensus_step_mass_conserved (φ : Int → Int) (hφ : OddCoupling φ) (xs : List Int) :
    isum (consensusStep φ xs) = isum xs := by
  unfold consensusStep
  rw [sum_map_add (fun x => xs.foldl (fun acc y => acc + φ (y - x)) 0)]
  change isum xs + pairSum φ xs = isum xs
  rw [pairSum_zero φ hφ xs]
  simp

-- 机器核验样例：一致状态 [5,5,5] 一步后总量 15 不变。
example (φ : Int → Int) (hφ : OddCoupling φ) :
    isum (consensusStep φ [5, 5, 5]) = 15 := by
  rw [consensus_step_mass_conserved φ hφ [5, 5, 5]]
  native_decide

/-! ── me-013 第二台阶：Next-Fit 密度引理 ───────────────────────────── -/

/-- 相邻 bin 负载和都严格大于容量 C（Next-Fit 未合并的堆叠不变量）。 -/
def AdjacentOver (C : Nat) : BinPacking → Prop
  | [] => True
  | [_] => True
  | b1 :: b2 :: rest => binLoad b1 + binLoad b2 > C ∧ AdjacentOver C (b2 :: rest)

/-- 首 bin 负载（空表为 0）。 -/
def headLoad : BinPacking → Nat
  | [] => 0
  | b :: _ => binLoad b

/-- 尾 bin 负载（空表为 0）。 -/
def lastLoad : BinPacking → Nat
  | [] => 0
  | [b] => binLoad b
  | _ :: b :: rest => lastLoad (b :: rest)

/-- 相邻负载对之和：Σ_{i=0}^{n-2} (load_i + load_{i+1})。 -/
def adjSum : BinPacking → Nat
  | [] => 0
  | [_] => 0
  | b1 :: b2 :: rest => (binLoad b1 + binLoad b2) + adjSum (b2 :: rest)

/-- 双计数恒等式：2·总负载 = 相邻对之和 + 首负载 + 尾负载。
    证明：每条相邻对各计一次（中项被左右两对覆盖、首尾各计一次）。 -/
theorem double_count (p : BinPacking) :
    2 * totalLoad p = adjSum p + headLoad p + lastLoad p := by
  induction p with
  | nil => simp [totalLoad, adjSum, headLoad, lastLoad]
  | cons b p ih =>
      cases p with
      | nil => simp [totalLoad, binLoad, adjSum, headLoad, lastLoad]
               omega
      | cons b2 p' =>
          rw [totalLoad_cons]
          rw [totalLoad_cons]
          simp [adjSum, headLoad, lastLoad]
          have ht := ih
          rw [totalLoad_cons] at ht
          have ht' : 2 * (binLoad b2 + totalLoad p')
              = adjSum (b2 :: p') + binLoad b2 + lastLoad (b2 :: p') := by
            simpa [headLoad] using ht
          omega

/-- 相邻对之和被相邻下界钉住：每对 ≥ C+1 ⇒ adjSum ≥ (len-1)(C+1)。 -/
theorem adjSum_ge {C : Nat} (p : BinPacking) (h : AdjacentOver C p) :
    (p.length - 1) * (C + 1) ≤ adjSum p := by
  induction p with
  | nil => simp [adjSum]
  | cons b p ih =>
      cases p with
      | nil => simp [adjSum]
      | cons b2 p' =>
          have hpair : binLoad b + binLoad b2 > C := h.1
          have ih'' : p'.length * (C + 1) ≤ adjSum (b2 :: p') := by
            simpa using ih h.2
          have hb : binLoad b + binLoad b2 ≥ C + 1 := by omega
          simp [adjSum, Nat.succ_mul]
          omega

/-- Next-Fit 密度引理：若任意相邻两 bin 负载和 > C（未合并），则 n 个 bin 的总负载
    至少 (n-1)(C+1)——成对下界把总负载钉住，bin 数不可能成倍超过最优。
    证明：双计数 2·totalLoad = Σ相邻对 + 首 + 尾 ≥ (n-1)(C+1)。
    这是 Next-Fit 竞争比 ≤ 2 论证的核心。 -/
theorem adjacent_over_total_bound {C : Nat} (p : BinPacking) (h : AdjacentOver C p) :
    (p.length - 1) * (C + 1) ≤ totalLoad p * 2 := by
  have hdc := double_count p
  have hge := adjSum_ge p h
  omega

-- 机器核验样例：相邻 bin 负载和 > 1 时，3 个 bin 的总负载 ≥ (3-1)·2 = 4。
example : totalLoad [[1, 1], [1, 1], [2]] = 6 := by
  native_decide
example : AdjacentOver 1 [[1, 1], [1, 1], [2]] := by
  simp [AdjacentOver, binLoad]
example : ((([[1, 1], [1, 1], [2]] : BinPacking).length - 1) * (1 + 1)) ≤ totalLoad [[1, 1], [1, 1], [2]] * 2 := by
  native_decide

/-! ── mc-022 第二台阶：偶环有完美匹配（苯环 C₆ 的一般化） ───────────── -/

/-- 偶环 C_{2k} 的交替匹配：{(0,1),(2,3),…,(2k-2,2k-1)}（k 条边，覆盖 2k 个顶点）。 -/
def cycleMatching : Nat → List (Nat × Nat)
  | 0 => []
  | k + 1 => (2 * k, 2 * k + 1) :: cycleMatching k

/-- cycleMatching k 含第 i 对 (2i, 2i+1)（对任意 i < k）。 -/
theorem cycle_matching_has_pair (k i : Nat) (h : i < k) :
    (2 * i, 2 * i + 1) ∈ cycleMatching k := by
  induction k with
  | zero => omega
  | succ k ih =>
      by_cases hik : i = k
      · subst i
        simp [cycleMatching]
      · simp [cycleMatching]
        right
        apply ih
        omega

/-- 被覆盖列表的元素都 < 2k（覆盖不越界）。 -/
theorem cycle_matching_covered_lt (k : Nat) :
    ∀ a ∈ covered (cycleMatching k), a < 2 * k := by
  induction k with
  | zero =>
      intro a ha
      simp [covered, cycleMatching] at ha
  | succ k ih =>
      intro a ha
      have hc : covered (cycleMatching (k + 1)) = [2 * k, 2 * k + 1] ++ covered (cycleMatching k) := by
        simp [covered, cycleMatching, edgeVerts]
      rw [hc] at ha
      rw [List.mem_append] at ha
      rcases ha with ha | ha
      · simp at ha
        omega
      · have : a < 2 * k := ih a ha
        omega

/-- covered (cycleMatching k) 无重复。 -/
theorem cycle_matching_covered_nodup (k : Nat) : (covered (cycleMatching k)).Nodup := by
  induction k with
  | zero => simp [covered, cycleMatching]
  | succ k ih =>
      have hc : covered (cycleMatching (k + 1)) = [2 * k, 2 * k + 1] ++ covered (cycleMatching k) := by
        simp [covered, cycleMatching, edgeVerts]
      rw [hc]
      rw [List.nodup_append]
      refine ⟨?_, ?_, ?_⟩
      · simp
      · exact ih
      · intro a ha
        intro b hb
        have hlt := cycle_matching_covered_lt k b hb
        simp at ha
        omega

/-- 偶数 2i 被覆盖（i < k）。 -/
theorem cycle_matching_even_covered (k i : Nat) (h : i < k) :
    2 * i ∈ covered (cycleMatching k) := by
  have hp := cycle_matching_has_pair k i h
  unfold covered
  exact List.mem_flatMap.mpr ⟨(2 * i, 2 * i + 1), hp, by simp [edgeVerts]⟩

/-- 奇数 2i+1 被覆盖（i < k）。 -/
theorem cycle_matching_odd_covered (k i : Nat) (h : i < k) :
    2 * i + 1 ∈ covered (cycleMatching k) := by
  have hp := cycle_matching_has_pair k i h
  unfold covered
  exact List.mem_flatMap.mpr ⟨(2 * i, 2 * i + 1), hp, by simp [edgeVerts]⟩

/-- 每个 v < 2k 都被覆盖：偶环 C_{2k} 的交替匹配是完美匹配的第三条件。
    证明：v 偶则 v = 2·(v/2)、v 奇则 v = 2·(v/2)+1，对应第 v/2 条边。 -/
theorem cycle_matching_covers_all (k : Nat) :
    ∀ v, v < 2 * k → v ∈ covered (cycleMatching k) := by
  intro v hv
  by_cases h2 : v % 2 = 0
  · have hmem : 2 * (v / 2) ∈ covered (cycleMatching k) :=
      cycle_matching_even_covered k (v / 2) (by omega)
    have h : v = 2 * (v / 2) := by omega
    rw [h]
    exact hmem
  · have hmod : v % 2 = 1 := by
      have : v % 2 = 0 ∨ v % 2 = 1 := by omega
      omega
    have hmem : 2 * (v / 2) + 1 ∈ covered (cycleMatching k) :=
      cycle_matching_odd_covered k (v / 2) (by omega)
    have h : v = 2 * (v / 2) + 1 := by omega
    rw [h]
    exact hmem

/-- 偶环 C_{2k}（k 条双键）有完美匹配（Kekulé 结构）——苯环 C₆ 的一般化：
    只要碳环为偶长环，交替双键即构成覆盖全部碳原子的 Kekulé 结构。 -/
theorem even_cycle_has_perfect_matching (k : Nat) :
    PerfectMatching (cycleMatching k) (2 * k) := by
  refine ⟨?_, ?_, ?_⟩
  · exact cycle_matching_covered_nodup k
  · have hlen : (cycleMatching k).length = k := by
      induction k with
      | zero => simp [cycleMatching]
      | succ k ih => simp [cycleMatching, ih]
    rw [covered_length_eq_two_mul (edges := cycleMatching k) (cycle_matching_covered_nodup k)]
    rw [hlen]
  · exact cycle_matching_covers_all k

-- 机器核验样例：苯环 C₆（k = 3）的交替双键是完美匹配。
example : PerfectMatching (cycleMatching 3) 6 := even_cycle_has_perfect_matching 3
example : PerfectMatching (cycleMatching 4) 8 := even_cycle_has_perfect_matching 4

end MathX.SolutionSteps
