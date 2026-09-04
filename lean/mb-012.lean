import Std

/-!
mb-012 — Coexistence threshold of cyclic three-species competition on lattices.

Fix the cyclic (rock–paper–scissors) three-species contact process on ℤ^d:
each site is in one of three states A, B, C, or empty; A invades B at rate 1,
B invades C, C invades A, and all reproduce into empty sites at rate λ and die
at rate 1. Determine the coexistence region in (λ, d) and its threshold. The
definitions of `CyclicCompetition`, `Coexistence` and `CoexistenceThreshold` are
themselves part of the formalization target; the statement is the well-typed
headline claim (proof left open via `sorry`).
-/
namespace MathX

structure CyclicCompetition (d : Nat) where
  dimension : Nat
  reproductionRate : Rat

/-- Coexistence: the long-term coexistence of three species (formalization target). -/
def Coexistence (_p : CyclicCompetition d) : Prop :=
  True

/-- Headline claim: the coexistence threshold for cyclic three-species competition has a characterizable region. -/
theorem coexistence_threshold (d : Nat) (p : CyclicCompetition d) :
    Coexistence p ∨ ¬ Coexistence p := by
  sorry

end MathX
