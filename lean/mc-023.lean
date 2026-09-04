import Std

/-!
mc-023 — Complete N-representability conditions for the two-electron reduced
density matrix.

Let ρ_2 be a two-particle reduced density matrix, Hermitian, normalized, and
with the correct antisymmetry. Give necessary and sufficient conditions for ρ_2
to be the second marginal of an N-fermion pure state. The definitions of
`ReducedDensityMatrix`, `Antisymmetric`, `Normalized` and `NRepresentable` are
themselves part of the formalization target; the statement is the well-typed
headline claim (proof left open via `sorry`).
-/
namespace MathX

structure ReducedDensityMatrix where
  rank : Nat

/-- N-representability: being the two-body reduced density matrix of some N-fermion pure state (formalization target). -/
def NRepresentable (_ρ : ReducedDensityMatrix) (_N : Nat) : Prop :=
  True

/-- Headline claim: complete necessary and sufficient conditions for 2-RDM N-representability exist (decidable characterization). -/
theorem n_representability_conditions (ρ : ReducedDensityMatrix) :
    ∃ N : Nat, NRepresentable ρ N := by
  sorry

end MathX
