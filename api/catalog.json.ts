// Stable, machine-consumable catalog contract served at /api/v1/*.
// Directly imports the typed PROBLEMS array rather than regex-parsing the source
// file: esbuild/Vite (and CF's bundler) parse TS + CJK fine, so there's no runtime
// filesystem dependency — which keeps this module loadable in Cloudflare Workers.
// Downstream agents/prover pipelines GET a versioned, etag-able snapshot.
import { PROBLEMS } from "../src/data/problems";
import type { Problem } from "../src/data/problems";

function oneProblem(p: Problem) {
  return {
    id: p.id,
    title: p.title,
    titleZh: p.titleZh,
    domain: p.domain,
    subdomain: p.subdomain,
    output: p.output,
    status: p.status,
    formalization_potential: p.formalization_potential,
    verification_path: p.verification_path,
    lifecycle_status: p.lifecycle_status ?? "open",
    judgment: p.judgment,
    obstacles: p.obstacles ?? [],
    certificate: p.certificate
      ? {
          r_model: { bound: p.certificate.r_model.bound },
          r_param: { bound: p.certificate.r_param.bound },
          r_num: { bound: p.certificate.r_num.bound },
        }
      : undefined,
    formal_view: p.formal_view
      ? {
          statement: p.formal_view.statement || p.formalization_notes,
          target: p.formal_view.target,
          judgment: p.formal_view.judgment,
          status: p.formal_view.status,
          via: p.formal_view.via || undefined,
          artifact: p.formal_view.artifact
            ? {
                label: p.formal_view.artifact.label,
                url: p.formal_view.artifact.url,
              }
            : undefined,
        }
      : undefined,
    bridge: p.bridge
      ? {
          link: p.bridge.link,
          direction: p.bridge.direction,
          shared_residuals: p.bridge.shared_residuals?.length
            ? (p.bridge.shared_residuals as string[])
            : undefined,
          band_as_fn_of_eps: p.bridge.band_as_fn_of_eps || undefined,
        }
      : undefined,
    proposer: p.proposer || undefined,
    proposed_year: p.proposed_year ?? undefined,
  };
}

export function buildCatalog() {
  return PROBLEMS.map(oneProblem).filter((p) => p.id);
}

export function buildBenchmark() {
  // Benchmark = problems whose judgement is decidable/consumable: certified
  // behaviour or high formalization potential. Downstream learners can train
  // against the judgement spec directly.
  return buildCatalog().filter(
    (p) => p.certificate || p.output === "verified_behavior",
  );
}

// Stable version + ETag from a content hash. Non-crypto FNV-1a: this isn't a
// security boundary, just a cache-busting fingerprint, so node:crypto isn't
// needed (keeps the module Workers-safe).
export function snapshotVersion(json: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < json.length; i++) {
    h ^= json.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).slice(0, 10);
}