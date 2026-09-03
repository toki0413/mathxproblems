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

end MathX.SolutionSteps
