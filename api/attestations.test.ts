import { test, expect } from "vitest";
import { buildAttestations, recordAttestations, attestationSource } from "./attestations.json";
import { verifyCurrentRecord } from "../contracts/verifier";
import { AUDITED_PROBLEMS } from "../src/data/audits";
import type { Problem } from "../src/data/problems";

test("attestations serve mc-017 as a machine-verified record bracket", () => {
  const atts = recordAttestations(AUDITED_PROBLEMS);
  const mc = atts.find((a) => a.problemId === "mc-017");
  expect(mc).toBeDefined();
  expect(mc!.record).toEqual({ lo: 1.44, hi: 1.58 });
  expect(mc!.verdict.well_formed).toBe(true);
  expect(mc!.verdict.nonempty).toBe(true);
  expect(mc!.verdict.within_vacuous).toBe(true);
  expect(mc!.verdict.relative_width).not.toBeNull();
  expect(mc!.source.length).toBeGreaterThan(0);
});

test("every emitted attestation is well-formed and carries a real source", () => {
  const atts = recordAttestations(AUDITED_PROBLEMS);
  expect(atts.length).toBeGreaterThan(0);
  for (const a of atts) {
    expect(a.verdict.well_formed).toBe(true);
    expect(a.verdict.nonempty).toBe(true);
    expect(a.source.length).toBeGreaterThan(0);
  }
});

test("attestations are deterministic (recomputable by anyone)", () => {
  const a = JSON.stringify(buildAttestations());
  const b = JSON.stringify(buildAttestations());
  expect(a).toBe(b);
});

test("no-source current_record is not attested (anti-fabrication)", () => {
  const noSource = {
    id: "x-000",
    title: "t",
    certificate: { current_record: { lo: 1, hi: 2 } },
    references: [],
  } as unknown as Problem;
  expect(attestationSource(noSource)).toBeNull();
  expect(recordAttestations([noSource])).toEqual([]);
});

test("malformed current_record is not attested", () => {
  const bad = {
    id: "x-001",
    title: "t",
    certificate: { current_record: { lo: 3, hi: 2 } },
    references: [{ label: "r", url: "https://example.com" }],
  } as unknown as Problem;
  expect(verifyCurrentRecord({ lo: 3, hi: 2 }).well_formed).toBe(false);
  expect(recordAttestations([bad])).toEqual([]);
});

test("attestations are sorted by id", () => {
  const ids = recordAttestations(AUDITED_PROBLEMS).map((a) => a.problemId);
  expect(ids).toEqual([...ids].sort());
});

test("route serves machine-verified record brackets over HTTP", async () => {
  const { app } = await import("./boot");
  const res = await app.request("/api/v1/attestations.json");
  expect(res.status).toBe(200);
  expect(res.headers.get("content-type")).toContain("application/json");
  const body = (await res.json()) as {
    contract: string;
    count: number;
    attestations: Array<{
      problemId: string;
      record: { lo: number; hi: number };
      verdict: { well_formed: boolean };
      source: string;
    }>;
  };
  expect(body.contract).toBe("record-attestation/v1");
  expect(body.count).toBeGreaterThan(0);
  const mc = body.attestations.find((a) => a.problemId === "mc-017");
  expect(mc).toBeDefined();
  expect(mc!.record).toEqual({ lo: 1.44, hi: 1.58 });
  expect(mc!.verdict.well_formed).toBe(true);
  expect(mc!.source.length).toBeGreaterThan(0);
});
