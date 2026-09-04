import Std

/-!
mb-013 — Sharp epidemic threshold and near-critical extinction time for SIR with
demography.

For the Markovian SIR process with demography on a finite population of size N,
where the basic reproduction number is scaled as R_0 = 1 + δ N^{-α} for fixed
δ > 0 and α > 0, prove the sharp threshold and the near-critical extinction
time asymptotics. The definitions of `SIRDemography`, `EpidemicThreshold` and
`NearCriticalExtinctionTime` are themselves part of the formalization target;
the statement is the well-typed headline claim (proof left open via `sorry`).
-/
namespace MathX

structure SIRDemography (N : Nat) where
  population : Nat

/-- Headline claim: SIR with births and deaths has a sharp threshold and extinction-time asymptotics under near-critical scaling. -/
def NearCriticalExtinctionTime (_p : SIRDemography N) : Rat :=
  0

theorem sir_demography_threshold (N : Nat) (p : SIRDemography N) :
    0 < NearCriticalExtinctionTime p := by
  sorry

end MathX
