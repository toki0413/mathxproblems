import Std

/-!
me-036 — Attainability of Hashin–Shtrikman bounds for isotropic composites.

For an isotropic composite of three (or more) isotropic phases, the effective
conductivity lies between the Hashin–Shtrikman (HS) bounds, but the HS bound is
not optimal in all parameter ranges: there exists a parameter range where the
attainable effective conductivities form a set strictly smaller than the HS
interval. The definitions of `Composite`, `HashinShtrikman` and `Attainable`
are themselves part of the formalization target; the statement is the well-typed
headline claim (proof left open via `sorry`).
-/
namespace MathX

structure Composite where
  phases : Nat
  volume : Nat → Rat

/-- HS bounds (lower bound, upper bound): formalization target. -/
def HashinShtrikman (_c : Composite) : Prod Rat Rat :=
  (0, 1)

/-- Whether the effective conductivity σ can be attained by some microstructure: formalization target. -/
def Attainable (_σ : Rat) (_c : Composite) : Prop :=
  True

/-- Headline claim: for isotropic composites with three or more phases there exist effective conductivities inside the HS bounds that are not attainable
    (the parameter range where the HS bounds are not optimal is nonempty). -/
theorem hs_bounds_not_optimal (c : Composite) (hc : 3 ≤ c.phases) :
    ∃ σ : Rat,
      (HashinShtrikman c).1 ≤ σ ∧ σ ≤ (HashinShtrikman c).2 ∧ ¬ Attainable σ c := by
  sorry

end MathX
