import Std

/-!
me-011 — Graphic TSP 4/3-conjecture.

For every finite weighted graph, the shortest Hamiltonian cycle in its metric
closure costs at most 4/3 the minimum-spanning-tree weight. The definitions of
`MSTWeight` and `GraphicTSPOpt` are themselves part of the formalization target;
the statement is the well-typed headline claim (proof left open via `sorry`).
-/
namespace MathX

structure MetricGraph where
  n : Nat
  dist : Nat → Nat → Nat

def MSTWeight (g : MetricGraph) : Nat := by
  exact 0

def GraphicTSPOpt (g : MetricGraph) : Nat := by
  exact 0

theorem graphic_tsp_4over3 (g : MetricGraph) (hg : 3 ≤ g.n) :
    (GraphicTSPOpt g : Rat) ≤ ((4 : Rat) / 3) * (MSTWeight g : Rat) := by
  sorry

end MathX
