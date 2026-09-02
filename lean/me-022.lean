import Std

/-!
me-022 — Hardness and Approximation of Minimum Leader Selection for Network Controllability.

Finding a minimum-size set of leader nodes that makes a network controllable is
hard to approximate within a constant factor. The function/predicate are
formalization targets; the claim (proof left open via `sorry`) is the headline
statement.
-/
namespace MathX

structure Network where
  n : Nat

def MinLeaderSet (g : Network) : Nat := by
  exact 0

def ApproxMinLeader (g : Network) (c : Nat) : Prop := by
  exact False

theorem leader_selection_hard (g : Network) :
    ApproxMinLeader g 1 := by
  sorry

end MathX
