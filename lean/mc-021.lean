import Std

/-!
mc-021 — Complete characterization of product-form stationary distributions in
stochastic mass-action networks.

For the continuous-time Markov chain of a stochastic mass-action network, the
stationary distribution restricted to a closed communicating class is of
product form π(x) = Π_i c_i^{x_i}/x_i!. Give a complete characterization of the
networks admitting product-form stationary distributions. The definitions of
`StochasticMassActionNetwork`, `ProductForm` and `StationaryDistribution` are
themselves part of the formalization target; the statement is the well-typed
headline claim (proof left open via `sorry`).
-/
namespace MathX

structure StochasticMassActionNetwork (s : Nat) where
  species : Fin s

/-- Product-form stationary distribution (formalization target). -/
def ProductForm (_N : StochasticMassActionNetwork s) : Prop :=
  True

/-- Headline claim: stochastic mass-action networks admit a complete characterization of product-form stationary distributions. -/
theorem product_form_characterization (s : Nat) (N : StochasticMassActionNetwork s) :
    ProductForm N := by
  sorry

end MathX
