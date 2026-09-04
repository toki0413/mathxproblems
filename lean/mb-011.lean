import Std

/-!
mb-011 — Exact critical value of the contact process on the integer lattice.

For the contact process on ℤ^d — each occupied site infects nearest neighbors
at rate λ and recovers at rate 1 — determine the exact value of the critical
infection rate λ_c(d) = inf{λ > 0 : the infection survives forever from a
single seed with positive probability}. The definitions of `ContactProcess`,
`CriticalInfectionRate` and `SurvivesForever` are themselves part of the
formalization target; the statement is the well-typed headline claim (proof
left open via `sorry`).
-/
namespace MathX

structure ContactProcess (d : Nat) where
  dimension : Nat

/-- Critical infection rate λ_c(d) (formalization target). -/
def CriticalInfectionRate (_p : ContactProcess d) : Rat :=
  0

/-- Headline claim: the exact critical value of the contact process on the whole lattice exists and is characterizable. -/
theorem exact_critical_value (d : Nat) (p : ContactProcess d) :
    0 < CriticalInfectionRate p := by
  sorry

end MathX
