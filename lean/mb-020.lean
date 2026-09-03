import Std

/-!
mb-020 — Closed-form stationary densities under non-reversible
mutation–selection.

For mutation–selection models with a non-reversible mutation kernel, determine
when the stationary density admits a closed form: characterize the balance
conditions that make the stationary distribution explicit despite the cyclic
(irreversible) flow. The definitions of `MutationSelectionModel`,
`StationaryDensity` and `ClosedFormDensity` are themselves part of the
formalization target; the statement is the well-typed headline claim (proof
left open via `sorry`).
-/
namespace MathX

structure MutationSelectionModel where
  mutationRate : Rat

/-- 闭合形式平稳密度（形式化目标）。 -/
def ClosedFormDensity (_m : MutationSelectionModel) : Prop :=
  True

/-- 头条声明：非可逆突变—选择模型的平稳密度存在闭合形式刻画。 -/
theorem closed_form_stationary_density (m : MutationSelectionModel) :
    ClosedFormDensity m := by
  sorry

end MathX
