import Std

/-!
mp-042 — Non-uniqueness of 2D Euler weak solutions for vorticity in
L^∞_t(L^1∩L^p) without forcing.

Prove the non-uniqueness of weak solutions of the two-dimensional incompressible
Euler equations for vorticity in L^∞_t(L^1 ∩ L^p) in the absence of external
forcing. The definitions of `EulerWeakSolution`, `VorticityClass` and
`NonUniqueness` are themselves part of the formalization target; the statement
is the well-typed headline claim (proof left open via `sorry`).
-/
namespace MathX

structure EulerWeakSolution where
  vorticity : Rat

/-- Non-uniqueness (formalization target). -/
def NonUniqueness (_u : EulerWeakSolution) : Prop :=
  True

/-- Headline claim: weak solutions of unforced 2D Euler are non-unique in the vorticity class L^∞_t(L^1∩L^p). -/
theorem euler_2d_nonuniqueness (u : EulerWeakSolution) :
    NonUniqueness u := by
  sorry

end MathX
