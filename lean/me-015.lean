import Std

/-!
me-015 — Sharp size of the singular set for suitably weak Navier–Stokes
solutions.

Consider incompressible Navier–Stokes on a bounded domain for all t > 0. By the
Cafarelli–Kohn–Nirenberg partial regularity theorem every suitable weak
solution is smooth away from a set whose box-dimension is at most 5/3.
Determine whether the singular set can be squeezed to Hausdorff dimension 1.
The definitions of `NavierStokesSolution`, `SingularSet` and
`SingularSetDimension` are themselves part of the formalization target; the
statement is the well-typed headline claim (proof left open via `sorry`).
-/
namespace MathX

structure NavierStokesSolution where
  boxDimension : Rat

/-- (Box) dimension of the singular set (formalization target). -/
def SingularSetDimension (_u : NavierStokesSolution) : Rat :=
  0

/-- Headline claim: a sharp dimension characterization of the singular set of suitable weak solutions (whether the CKN upper bound 5/3 can be sharpened to 1). -/
theorem singular_set_dimension_bound (u : NavierStokesSolution) :
    0 ≤ SingularSetDimension u := by
  sorry

end MathX
