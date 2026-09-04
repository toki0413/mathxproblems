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

/-- Closed-form stationary density (formalization target). -/
def ClosedFormDensity (_m : MutationSelectionModel) : Prop :=
  True

/-- Headline claim: the stationary density of the irreversible mutation–selection model admits a closed-form characterization. -/
theorem closed_form_stationary_density (m : MutationSelectionModel) :
    ClosedFormDensity m := by
  sorry

end MathX
