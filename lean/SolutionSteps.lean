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

end MathX.SolutionSteps
