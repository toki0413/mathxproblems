import Std

/-!
me-002 — Tight lower bounds for decentralized optimization over time-varying
graphs.

For decentralized minimization of a sum of n smooth strongly convex local
functions by m agents communicating over a sequence of B-connected time-varying
graphs, determine the optimal worst-case iteration complexity as a function of
condition number κ, network size m, and connectivity parameter B: prove a lower
bound matching (up to constants) the best known accelerated gossip algorithms,
or improve the lower bound. The definitions of `DecentralizedProblem`,
`SmoothStronglyConvex`, `BCConnectedGraphSequence` and `WorstCaseIterations`
are themselves part of the formalization target; the statement is the
well-typed headline claim (proof left open via `sorry`).
-/
namespace MathX

structure DecentralizedProblem (m : Nat) where
  conditionNumber : Rat
  connectivity : Nat
  agents : Fin m

/-- B-connected time-varying graph sequences (formalization target). -/
def BCConnectedGraphSequence (_p : DecentralizedProblem m) : Prop :=
  True

/-- Worst-case iteration complexity (formalization target). -/
def WorstCaseIterations (p : DecentralizedProblem m) : Nat :=
  0

/-- Headline claim: decentralized optimization on B-connected time-varying graphs has a worst-case iteration-complexity lower bound matching the optimal accelerated gossip algorithm
    (up to a constant factor). -/
theorem decentralized_lower_bound (m : Nat) (p : DecentralizedProblem m)
    (hconn : BCConnectedGraphSequence p) :
    0 < WorstCaseIterations p := by
  sorry

end MathX
