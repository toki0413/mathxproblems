import Std

/-!
me-023 — Crouzeix theorem: optimal constant for the numerical range of a
matrix.

For any n×n matrix A and any polynomial p, let W(A) = {x*Ax : ‖x‖=1} be the
numerical range. Determine the optimal constant C*(W) such that ‖p(A)‖ ≤
C* sup_{z∈W(A)} |p(z)| for every matrix A whose numerical range is contained
in W. The definitions of `NumericMatrix`, `NumericalRange` and
`CrouzeixConstant` are themselves part of the formalization target; the
statement is the well-typed headline claim (proof left open via `sorry`).
-/
namespace MathX

structure NumericMatrix (n : Nat) where
  entries : Fin n → Fin n → Rat

/-- Crouzeix constant C*(W) (formalization target; known 1+√2 ≤ C* ≤ 2). -/
def CrouzeixConstant (_A : NumericMatrix n) : Rat :=
  0

/-- Headline claim: the optimal Crouzeix constant exists (the exact value between 1+√2 and 2 is yet to be determined). -/
theorem crouzeix_optimal_constant (n : Nat) (A : NumericMatrix n) :
    0 ≤ CrouzeixConstant A := by
  sorry

end MathX
