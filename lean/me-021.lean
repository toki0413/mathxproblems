import Std

/-!
me-021 — Minimal Number of Projection Directions for Uniqueness in Discrete Tomography.

There is a smallest number of projection directions that guarantees a binary
image on the lattice is uniquely determined by its line sums along those
directions. The predicates/functions are formalization targets; the claim (proof
left open via `sorry`) is the headline statement.
-/
namespace MathX

structure BinaryImage where
  n : Nat

def UniquelyDeterminedByDirections (img : BinaryImage) (k : Nat) : Prop := by
  exact False

def MinimalDirections (n : Nat) : Nat := by
  exact 0

theorem minimal_projection_directions (img : BinaryImage) :
    UniquelyDeterminedByDirections img (MinimalDirections img.n) := by
  sorry

end MathX
