import { test, expect } from "vitest";
import { buildImpact } from "./catalog.json";

test("impact registry: 33 literature-backed domains, each with real arXiv evidence", () => {
  const impact = buildImpact();
  expect(impact).toHaveLength(33);
  for (const d of impact) {
    expect(d.id).toMatch(/^[a-z0-9-]+$/);
    expect(d.name).toBeTruthy();
    expect(d.description).toBeTruthy();
    expect(d.status).toBe("literature-backed");
    expect(d.retrieved).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(d.evidence.length).toBeGreaterThan(0);
    for (const e of d.evidence) {
      expect(e.url).toMatch(/^https:\/\/arxiv\.org\/abs\//);
      expect(e.title).toBeTruthy();
      expect(e.authors.length).toBeGreaterThan(0);
      expect(e.year).toMatch(/^\d{4}$/);
    }
  }
});

test("impact registry ids are unique", () => {
  const impact = buildImpact();
  expect(new Set(impact.map((d) => d.id)).size).toBe(impact.length);
  expect(new Set(impact.map((d) => d.name)).size).toBe(impact.length);
});
