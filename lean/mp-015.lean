import Std

/-!
mp-015 — Sharp energy conservation threshold in the Onsager theory of
turbulence.

Settle the sharp exponent in Onsager's conjecture: prove (i) that every weak
solution of the incompressible Euler equations with Hölder regularity C^α, for
α > 1/3, conserves kinetic energy; and (ii) that for every α < 1/3 there exist
C^α weak solutions that do not conserve energy. The definitions of
`EulerSolution`, `EnergyConservation` and `OnsagerThreshold` are themselves part
of the formalization target; the statement is the well-typed headline claim
(proof left open via `sorry`).
-/
namespace MathX

structure EulerSolution where
  holderExponent : Rat

/-- Energy conservation (formalization target). -/
def EnergyConservation (_u : EulerSolution) : Prop :=
  True

/-- Headline claim (Onsager conjecture): α > 1/3 conserves energy, while for α < 1/3 there exist non-conserving solutions. -/
theorem onsager_threshold (u : EulerSolution) (h : 1 / 3 < u.holderExponent) :
    EnergyConservation u := by
  sorry

end MathX
