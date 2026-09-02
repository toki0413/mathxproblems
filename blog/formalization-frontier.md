# The Formalization Frontier of 114 Engineering Problems

*Where AI provers meet real engineering — and where the honest boundary is.*

AI theorem provers are advancing fast in pure mathematics. Yet an engineer cannot hand an AI a control system and ask "is it safe?" — because the engineering constraint itself has never been stated as a precise mathematical proposition. The gap is not in the proving. It is in the *stating*.

MathX is a small, open, non-commercial attempt to close that gap. This post is the honest, data-driven state of where it stands: what we have cataloged, how much is machine-verifiable, and where the boundaries — real, not rhetorical — are.

---

## The catalog: 114 problems, stated as propositions

Every entry in the MathX catalog is a cross-disciplinary open problem, written so that a *recognized answer* has a precise definition. We currently track:

| Dimension | Count |
|---|---|
| Total problems | **114** |
| Mathematical physics | 35 |
| Mathematical chemistry | 24 |
| Mathematical biology | 25 |
| Mathematical engineering | 30 |
| Open | 101 |
| Partially resolved | 13 |
| Fully resolved | 0 |
| Cross-problem edges | 109 |
| Mean recorded obstacles per problem | 1.8 |

Two examples show the texture. **mp-001** (the Boltzmann–Grad limit for hard spheres at all times) is open, with the real difficulty recorded: *recollision control beyond the mean free time* and *no uniform-in-time a priori bounds*. **mp-011** (the Dry Ten Martini problem for the Almost Mathieu operator) is partially resolved — the non-critical regime fell in 2023, while the critical coupling and Liouville cases remain open. These are not invented entries; they are real research frontiers, stated precisely enough to be attacked.

## The honesty that makes this credible

We chose to make provenance a first-class, visible field. Of the 114 entries:

- **104 are AI-drafted** — generated, not yet expert-reviewed. We say so, on every page.
- **10 are lean-compilable** — carrying a Lean 4 formal statement that actually compiles (proofs still open, marked `sorry`).
- **0 are claimed expert-reviewed** — because none has been.

There is no "Verified" stamp. A stamp you give yourself is not verification. The only verifier we trust is the machine, and the machine currently certifies 10 of 114 statements. That number is the honest measure of how much of this catalog is *machine-true* today — and it is the exact list of tasks we are publishing for the community to grow.

## The boundary map: where empirical laws break

Engineers use empirical laws every day. Most of them fail to hold as rigorous mathematics — the question is *where* and *how badly*. MathX tracks this as a boundary map. Of the six laws currently mapped:

- **3 are partial** — e.g. Fourier's law: the macroscopic statement is widely used, but its rigorous derivation from microscopic dynamics is an open residual.
- **3 are gaps** — e.g. the Monod law in bioprocess engineering and the mixing-length hypothesis in turbulence have no rigorous formal statement at all.

Each gap is a *prover need*: a precisely stated target for someone to formalize, or to bound the error of. This is the demand side of the ledger, and it is published machine-readably.

## Eighteen engineering needs, seven with open gaps

From the demand side, we reverse-map concrete engineering needs back to the catalog. Eighteen needs across thermal, CFD, control, bioprocess, imaging, materials, and quantum metrology — **one is served, ten partial, seven are gaps** — anchoring **36 visible problems and 4 empirical laws** of the 114-problem catalog. Each need is a decision dossier: an ordered chain of sub-judgements to certify (consumable certificates, foundational anchors, empirical laws), the engineering standard it plugs into (JEDEC, ISO 26262, IEC 61511, ASME V&V, …), what "served" would look like, the current barrier, and its workflow slot. One example: *"a certified thermal margin for convective cooling"* — two catalog problems provide certified bands, but the Fourier's-law residual from microscopic dynamics remains open.

The reverse lookup is now bidirectional and status-aware. Every problem page lists *which engineering needs demand it*, and for each one shows the role this problem plays in that need's decision chain (consumable certificate / foundational anchor / related), whether it is currently serving the need or is a bottleneck (consumable / partial / open), and what solving it unlocks — so a visitor sees not just "this is cited" but "this is the missing link, solve it and the need advances." A coverage strip on the needs page shows how much of the catalog the demand side has touched. The honesty rule is CI-enforced: a need's declared readiness can never overstate what its chain actually supports. The gap is stated, so it can be attacked rather than hand-waved.

## The ledger: an append-only, machine-checkable trust layer

Claims on this site — band narrowings and formal status changes — enter a protocol ledger (contract v0.1) with three properties:

- **Append-only**: history is never rewritten.
- **Hash-checked**: every entry carries an evidence hash; altering evidence breaks consistency and is caught by an audit.
- **Reference-verified**: a read-only verifier checks each certified band (machine-parseable? vacuous? past the information gate?) independent of the submission path.

The write path is open and the full submit → review → ledger → audit loop is live in production. As of this writing the ledger is empty — deliberately. We would rather ship an honest empty ledger than a fabricated first entry.

## What we are asking for

MathX is public-good and volunteer-run. The highest-value thing you can do is one of:

1. **Pick a proof task** — the 5 gap needs and 3 gap laws are concrete, stated targets. Formalize one, or bound one.
2. **Review a statement** — the 104 AI-drafted entries need expert eyes to become expert-reviewed.
3. **Consume the machine layer** — `problems.json`, `needs.json`, `ledger.json` are stable, versioned, ETag-able endpoints meant for AI provers and downstream tools.
4. **Comment** — every problem has a live discussion.

The frontier is not "can an AI prove it." It is "can anyone state it precisely enough to try." That is what MathX is for.

---

*Site: [mathx-bridge.pages.dev](https://mathx-bridge.pages.dev) · GitHub: [toki0413/mathxproblems](https://github.com/toki0413/mathxproblems) · All data current as of 2026-09-02.*
