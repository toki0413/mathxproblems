import Std

/-!
mc-018 — Exact pinning by generalized Pauli constraints in fermionic ground
states.

For N fermions in a d-dimensional one-particle space, the natural occupation
numbers λ_1 ≥ … ≥ λ_d (ordered eigenvalues of the one-particle reduced density
matrix) satisfy generalized Pauli constraints; determine when the ground state
is exactly pinned on a facet of the constraint polytope. The definitions of
`FermionSystem`, `OccupationNumbers` and `PauliPinning` are themselves part of
the formalization target; the statement is the well-typed headline claim (proof
left open via `sorry`).
-/
namespace MathX

structure FermionSystem (N d : Nat) where
  particles : Nat
  orbitals : Nat

/-- Pinning under generalized Pauli constraints (formalization target). -/
def PauliPinning (_s : FermionSystem N d) : Prop :=
  True

/-- Headline claim: exact pinning of fermionic ground states on faces of the generalized Pauli constraints polytope is characterizable. -/
theorem pauli_pinning_exact (N d : Nat) (s : FermionSystem N d) :
    PauliPinning s := by
  sorry

end MathX
