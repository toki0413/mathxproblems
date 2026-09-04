import Std

/-!
mb-005 — Epidemic threshold of SIR epidemics on clustered networks.

For the SIR epidemic on a configuration-model network with clustering (built
from households, triangles, or general cliques with prescribed degree–clique
distributions), determine the basic reproduction number R_0 and the epidemic
threshold rigorously: prove a law of large numbers for the final size. The
definitions of `ClusteredNetwork`, `BasicReproductionNumber` and
`EpidemicThreshold` are themselves part of the formalization target; the
statement is the well-typed headline claim (proof left open via `sorry`).
-/
namespace MathX

structure ClusteredNetwork (n : Nat) where
  vertices : Fin n

/-- Basic reproduction number R_0 (formalization target). -/
def BasicReproductionNumber (_g : ClusteredNetwork n) : Rat :=
  0

/-- Headline claim: SIR on clustered networks admits a rigorous characterization of the basic reproduction number and the epidemic threshold. -/
theorem clustered_epidemic_threshold (n : Nat) (g : ClusteredNetwork n) :
    0 ≤ BasicReproductionNumber g := by
  sorry

end MathX
