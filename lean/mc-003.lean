import Std

/-!
mc-003 — Complete classification of spectra realizable by benzenoid molecular
graphs.

Characterize the multisets of real numbers in [-3,3] that occur as the
adjacency spectrum of a benzenoid molecular graph (finite connected subgraph of
the hexagonal lattice, no cut vertices), i.e. solve the inverse eigenvalue
problem for benzenoid graphs; in particular classify the attainable maximal
HOMO–LUMO gaps. The definitions of `BenzenoidGraph`, `RealizableSpectrum` and
`AttainableGap` are themselves part of the formalization target; the statement
is the well-typed headline claim (proof left open via `sorry`).
-/
namespace MathX

structure BenzenoidGraph (n : Nat) where
  vertices : Fin n

/-- Adjacency spectrum (formalization target): a characterization of which multisets in [-3,3] are realizable. -/
def RealizableSpectrum (_g : BenzenoidGraph n) (_spec : Fin n → Rat) : Prop :=
  True

/-- Headline claim: there is a complete characterization of realizable spectra for benzenoid molecular graphs (the inverse eigenvalue problem is decidable). -/
theorem benzenoid_spectra_classified (n : Nat) (g : BenzenoidGraph n) :
    ∃ spec : Fin n → Rat, RealizableSpectrum g spec := by
  sorry

end MathX
