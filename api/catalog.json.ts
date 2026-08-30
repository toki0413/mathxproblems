// Stable, machine-consumable catalog contract served at /api/v1/*.
// Reads src/data/problems.ts directly with regex (the TS file can't be imported
// under node strip-types due to CJK quotes), so downstream agents/prover
// pipelines can GET a versioned, etag-able snapshot without a browser.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createHash } from "node:crypto";

const srcPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../src/data/problems.ts",
);

// Split the file into per-problem blocks by opening a new top-level `id:`.
function blocks(source: string): string[] {
  const parts = source.split("\n    id: ");
  return parts.slice(1).map((b) => "    id: " + b);
}

const str = (b: string, field: string): string => {
  const m = b.match(new RegExp(`^    ${field}: '((?:[^'\\\\]|\\\\.)*)'`, "m"));
  return m ? m[1] : "";
};
// multiline judgment value on the line right after `judgment:`
const mline = (b: string): string => {
  const m = b.match(/\n      '((?:[^'\\\\]|\\\\.)*)'/);
  return m ? m[1] : str(b, "judgment");
};
const layerBound = (b: string, layer: string): string => {
  const m = b.match(
    new RegExp(`${layer.toLowerCase()}: \\{[\\s\\S]*?bound: '((?:[^'\\\\]|\\\\.)*)'`),
  );
  return m ? m[1] : "";
};
// single-line literal inside a nested object, e.g. formal_view.statement.
const nestedStr = (b: string, outer: string, field: string): string => {
  const m = b.match(
    new RegExp(`${outer}: \\{[\\s\\S]*?(?:^    )?${field}: '((?:[^'\\\\]|\\\\.)*)'`),
  );
  return m ? m[1] : "";
};
// single-line string array inside a nested object, e.g. bridge.shared_residuals.
const nestedArr = (b: string, outer: string, field: string): string[] => {
  const m = b.match(new RegExp(`${outer}: \\{[\\s\\S]*?${field}: \\[([^\\]]*)\\]`));
  if (!m) return [];
  return [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
};

function oneProblem(block: string) {
  const id = str(block, "id");
  const certificate = block.includes("certificate: {")
    ? {
        r_model: { bound: layerBound(block, "r_model") },
        r_param: { bound: layerBound(block, "r_param") },
        r_num: { bound: layerBound(block, "r_num") },
      }
    : undefined;
  const formal_view = block.includes("formal_view: {")
    ? {
        statement: nestedStr(block, "formal_view", "statement") || str(block, "formalization_notes"),
        target: nestedStr(block, "formal_view", "target"),
        judgment: nestedStr(block, "formal_view", "judgment"),
        status: nestedStr(block, "formal_view", "status"),
        via: nestedStr(block, "formal_view", "via") || undefined,
        artifact: block.includes("artifact: {")
          ? { label: nestedStr(block, "artifact", "label"), url: nestedStr(block, "artifact", "url") }
          : undefined,
      }
    : undefined;
  const bridge = block.includes("bridge: {")
    ? {
        link: nestedStr(block, "bridge", "link"),
        direction: nestedStr(block, "bridge", "direction"),
        shared_residuals: block.includes("shared_residuals:")
          ? nestedArr(block, "bridge", "shared_residuals")
          : undefined,
        band_as_fn_of_eps: nestedStr(block, "bridge", "band_as_fn_of_eps") || undefined,
      }
    : undefined;
  return {
    id,
    title: str(block, "title"),
    titleZh: str(block, "titleZh"),
    domain: str(block, "domain"),
    subdomain: str(block, "subdomain"),
    output: str(block, "output"),
    status: str(block, "status"),
    formalization_potential: str(block, "formalization_potential"),
    verification_path: str(block, "verification_path"),
    lifecycle_status: str(block, "lifecycle_status") || "open",
    judgment: mline(block),
    certificate,
    formal_view,
    bridge,
    proposer: str(block, "proposer") || undefined,
    proposed_year: str(block, "proposed_year") || undefined,
  };
}

export function buildCatalog() {
  const source = readFileSync(srcPath, "utf8");
  return blocks(source).map(oneProblem).filter((p) => p.id);
}

export function buildBenchmark() {
  // Benchmark = problems whose judgement is decidable/consumable: certified
  // behaviour or high formalization potential. Downstream learners can train
  // against the judgement spec directly.
  return buildCatalog().filter(
    (p) => p.certificate || p.output === "verified_behavior",
  );
}

// Stable version + ETag from a content hash.
export function snapshotVersion(json: string): string {
  return createHash("sha1").update(json).digest("hex").slice(0, 10);
}