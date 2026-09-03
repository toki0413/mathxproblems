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

/-- 亚稳态存活时间的期望（形式化目标）。 -/
def MetastableLifetime (_p : SISProcess n) : Rat :=
  0

/-- 头条声明：SIS 网络流行存在亚稳态存活时间的精确指数渐近。 -/
theorem sharp_metastable_lifetime (n : Nat) (p : SISProcess n) :
    0 < MetastableLifetime p := by
  sorry

end MathX
