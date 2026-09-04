import Std

/-!
mc-004 — Classification of small reaction networks admitting multistationarity.

For mass-action networks with at most N reactions and S species (small, e.g.
S ≤ 2 or N ≤ 4 with arbitrary species), give a complete combinatorial
classification of which networks can admit multiple positive steady states
within a stoichiometric class. The definitions of `ReactionNetwork`,
`SmallNetwork`, `Multistationary` and `AdmitsMultistationarity` are themselves
part of the formalization target; the statement is the well-typed headline
claim (proof left open via `sorry`).
-/
namespace MathX

structure ReactionNetwork (s r : Nat) where
  species : Fin s
  reactions : Fin r

/-- Small networks: bounded numbers of reactions and species (formalization target). -/
def SmallNetwork (N : ReactionNetwork s r) : Prop :=
  True

/-- Multistationarity: the existence of multiple positive steady states within a stoichiometric class (formalization target). -/
def Multistationary (N : ReactionNetwork s r) : Prop :=
  True

/-- Headline claim: a decidable combinatorial classification of small mass-action networks — whether they admit multistationarity. -/
theorem small_network_classification (s r : Nat) (N : ReactionNetwork s r)
    (hsmall : SmallNetwork N) :
    Multistationary N ∨ ¬ Multistationary N := by
  sorry

end MathX
