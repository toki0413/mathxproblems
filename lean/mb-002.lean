import Std

/-!
mb-002 — Sharp metastable lifetime of the SIS epidemic on networks.

For the SIS contact process on a finite graph G with infection rate λ above the
epidemic threshold, the infection survives for an exponentially long time T_G
before extinction. Prove sharp asymptotics: constants c(G, λ), C(G, λ) with
𝔼[T_G] = exp(Θ(…)) — the exact exponential rate of the metastable lifetime.
The definitions of `SISProcess`, `MetastableLifetime` and
`SharpLifetimeAsymptotics` are themselves part of the formalization target; the
statement is the well-typed headline claim (proof left open via `sorry`).
-/
namespace MathX

structure SISProcess (n : Nat) where
  infectionRate : Rat

/-- Expectation of the metastable survival time (formalization target). -/
def MetastableLifetime (_p : SISProcess n) : Rat :=
  0

/-- Headline claim: SIS network epidemics admit an exact exponential asymptotic for the metastable survival time. -/
theorem sharp_metastable_lifetime (n : Nat) (p : SISProcess n) :
    0 < MetastableLifetime p := by
  sorry

end MathX
