import Std

/-!
mc-031 — Joshi–Shiu conjecture for sequestration networks.

For every m ≥ 2 and odd n ≥ 3, the sequestration network K_{m,n} (a minimal
multistationary mass-action family, no embedded multistationary subnetwork with
inflow/outflow) admits multiple non-degenerate positive steady states. The
definitions of `SequestrationNetwork`, `PositiveSteadyState` and
`NonDegenerate` are themselves part of the formalization target; the statement
is the well-typed headline claim (proof left open via `sorry`).
-/
namespace MathX

structure SequestrationNetwork where
  m : Nat
  n : Nat

structure PositiveSteadyState (N : SequestrationNetwork) where
  concentrations : Nat → Rat
  positive : ∀ i, 0 < concentrations i

/-- 非退化（证明目标之一：把行列式/雅可比非退化条件形式化进来）。 -/
def NonDegenerate (N : SequestrationNetwork) (_s : PositiveSteadyState N) : Prop :=
  True

def AdmitsMultipleNonDegenerate (N : SequestrationNetwork) : Prop :=
  ∃ s1 : PositiveSteadyState N,
    ∃ s2 : PositiveSteadyState N,
      NonDegenerate N s1 ∧ NonDegenerate N s2 ∧ s1.concentrations ≠ s2.concentrations

/-- Joshi–Shiu 猜想：\tilde{K}_{m,n}（m≥2，n≥3 奇数）多重非退化正稳态。 -/
theorem joshi_shiu_conjecture (m n : Nat) (hm : 2 ≤ m) (hn : 3 ≤ n) (hodd : n % 2 = 1) :
    AdmitsMultipleNonDegenerate { m := m, n := n } := by
  sorry

end MathX
