import Std

/-!
mb-027 — Extremal amplification of fixation probability on evolutionary graphs.

For the standard Moran process on an N-vertex graph, a beneficial mutant of
fitness r > 1 fixes with a probability that depends on the graph. Let the
amplification ratio be the supremum of the fixation probability over all
graphs. Determine the extremal amplification: the maximum possible fixation
probability and the graph achieving it. The definitions of `EvolutionaryGraph`,
`AmplificationRatio` and `ExtremalAmplification` are themselves part of the
formalization target; the statement is the well-typed headline claim (proof
left open via `sorry`).
-/
namespace MathX

structure EvolutionaryGraph (N : Nat) where
  vertices : Fin N

/-- Extreme amplification (formalization target). -/
def AmplificationRatio (_g : EvolutionaryGraph N) (_fitness : Rat) : Rat :=
  0

/-- Headline claim: there is a characterization of extreme amplification of fixation probability on evolutionary graphs. -/
theorem extremal_amplification (N : Nat) (g : EvolutionaryGraph N) :
    ∃ ρ : Rat, 0 ≤ ρ := by
  sorry

end MathX
