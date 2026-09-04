import Std

/-!
mb-010 — Sharp extinction-time asymptotics for the subcritical contact process.

For the subcritical contact process (the SIS-type epidemic) on ℤ^d with
infection rate close to the critical value, prove sharp asymptotics for the
extinction time of a finite infection started from a single site. The
definitions of `SubcriticalContactProcess`, `ExtinctionTime` and
`SharpExtinctionAsymptotics` are themselves part of the formalization target;
the statement is the well-typed headline claim (proof left open via `sorry`).
-/
namespace MathX

structure SubcriticalContactProcess (d : Nat) where
  dimension : Nat

/-- Extinction time (formalization target). -/
def ExtinctionTime (_p : SubcriticalContactProcess d) : Rat :=
  0

/-- Headline claim: the extinction time of a subcritical contact process admits a sharp asymptotic. -/
theorem sharp_extinction_time (d : Nat) (p : SubcriticalContactProcess d) :
    0 < ExtinctionTime p := by
  sorry

end MathX
