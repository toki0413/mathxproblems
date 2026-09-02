import Std

/-!
me-004 — Optimal round complexity of triangle detection in the CONGEST model.

Any distributed protocol that decides whether an n-vertex graph contains a
triangle must communicate Ω(n) rounds in the worst case. `TriangleDetectionRounds`
is the formalization target; the linear lower bound is the headline claim
(proof left open via `sorry`).
-/
namespace MathX

def TriangleDetectionRounds (n : Nat) : Nat := by
  exact 0

theorem congest_triangle_lower_bound :
    ∃ c : Nat, 0 < c ∧ ∀ n : Nat, 0 < n → c * n ≤ TriangleDetectionRounds n := by
  sorry

end MathX
