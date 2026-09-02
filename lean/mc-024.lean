import Std

/-!
mc-024 — Computing the Clar Number and Enumerating Clar Covers of Benzenoid Systems.

For every benzenoid system, the Clar number (the maximum number of pairwise
disjoint aromatic sextets) is computable and the Clar covers can be enumerated.
The function/predicate are formalization targets; the claim (proof left open via
`sorry`) is the headline statement.
-/
namespace MathX

def ClarNumber (g : Nat) : Nat := by
  exact 0

def ClarCoversEnumerated (g : Nat) : Prop := by
  exact False

theorem clar_number_is_computable (g : Nat) :
    ClarCoversEnumerated g := by
  sorry

end MathX
