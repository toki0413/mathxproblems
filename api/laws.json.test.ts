import { test, expect } from "vitest";
import { buildLaws } from "./laws.json";

test("laws snapshot serves 6 entries with required fields", () => {
  const laws = buildLaws();
  expect(laws).toHaveLength(6);
  for (const l of laws) {
    expect(l.id).toMatch(/^law-[a-z0-9-]+$/);
    expect(typeof l.name).toBe("string");
    expect(l.industry).toBeTruthy();
    expect(l.formal_statement).toBeTruthy();
    expect(Array.isArray(l.assumptions)).toBe(true);
    expect(l.boundary).toBeTruthy();
    expect(l.gap).toBeTruthy();
    expect(["formalized", "partial", "gap"]).toContain(l.status);
    expect(l.residuals).toMatchObject({
      r_model: expect.any(String),
      r_param: expect.any(String),
      r_num: expect.any(String),
    });
  }
});

test("boundary map keeps both partial and gap entries (demand list)", () => {
  const laws = buildLaws();
  expect(laws.some((l) => l.status === "gap")).toBe(true);
  expect(laws.some((l) => l.status === "partial")).toBe(true);
});

test("unique ids across the boundary map", () => {
  const laws = buildLaws();
  expect(new Set(laws.map((l) => l.id)).size).toBe(laws.length);
});
