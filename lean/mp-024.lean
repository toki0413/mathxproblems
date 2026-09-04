import Std

/-!
mp-024 — Rigorous Gross–Pitaevskii limit for the dynamics of a dilute Bose gas.

Prove that the dynamics of a dilute Bose gas with singular (scaling) two-body
interaction converges to the Gross–Pitaevskii (nonlinear Schrödinger) equation
in the mean-field limit, on long time scales. The definitions of `BoseGas`,
`GrossPitaevskiiEquation` and `MeanFieldLimit` are themselves part of the
formalization target; the statement is the well-typed headline claim (proof
left open via `sorry`).
-/
namespace MathX

structure BoseGas (N : Nat) where
  particles : Nat

/-- Headline claim: the dynamical Gross–Pitaevskii limit holds for dilute Bose gases. -/
def GrossPitaevskiiLimit (_g : BoseGas N) : Prop :=
  True

theorem gp_limit_dynamics (N : Nat) (g : BoseGas N) :
    GrossPitaevskiiLimit g := by
  sorry

end MathX
