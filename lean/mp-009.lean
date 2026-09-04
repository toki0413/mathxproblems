import Std

/-!
mp-009 — Area law for ground states of two-dimensional gapped local
Hamiltonians.

Prove (or disprove) that the ground state of any constant-gap, local-interaction
lattice Hamiltonian in two dimensions has entanglement entropy growing at most
linearly with the interface area. The definitions of `GappedHamiltonian`,
`EntanglementEntropy` and `AreaLaw` are themselves part of the formalization
target; the statement is the well-typed headline claim (proof left open via
`sorry`).
-/
namespace MathX

structure GappedHamiltonian where
  size : Nat

/-- Area law: the entanglement entropy grows at most linearly with the interface area (formalization target). -/
def AreaLaw (_h : GappedHamiltonian) : Prop :=
  True

/-- Headline claim: ground states of two-dimensional gapped local Hamiltonians satisfy the area law. -/
theorem area_law_2d (h : GappedHamiltonian) :
    AreaLaw h := by
  sorry

end MathX
