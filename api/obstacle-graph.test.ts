// api/obstacle-graph.ts 的单测：双语签名、跨题连边、方法解锁扩散。
import { describe, expect, it } from "vitest";
import {
  buildObstacleLinks,
  buildObstaclesPayload,
  methodUnlocks,
  obstacleSignature,
} from "./obstacle-graph";

describe("obstacleSignature", () => {
  it("keeps English content words, drops stop words and LaTeX", () => {
    const sig = obstacleSignature(
      "**Resonances at weak disorder**: multi-scale analysis requires $\\lambda$ decay",
    );
    expect(sig.has("resonances")).toBe(true);
    expect(sig.has("multi-scale")).toBe(true);
    expect(sig.has("the")).toBe(false);
    expect(sig.has("lambda")).toBe(false); // LaTeX 内联已剔除
  });

  it("captures Chinese via bigrams", () => {
    const sig = obstacleSignature("**交互符号**: 非对称竞争矩阵使构造困难");
    expect(sig.has("非对")).toBe(true);
    expect(sig.has("对称")).toBe(true);
    expect(sig.has("竞争")).toBe(true);
  });
});

describe("buildObstacleLinks", () => {
  const problems = [
    { id: "mb-005", obstacles: ["**Overlapping cliques introduce dependence across generations** of infection"] },
    { id: "mb-010", obstacles: ["**Dependence across generations**: extinction meets recurrence across generations of infection"] },
    { id: "mp-001", obstacles: ["**Recollision control**: particle trajectories proliferate combinatorially"] },
  ];

  it("links genuinely similar obstacles across problems", () => {
    const links = buildObstacleLinks(problems);
    const pair = links.find(
      (l) =>
        [l.a.problem, l.b.problem].sort().join() === "mb-005,mb-010",
    );
    expect(pair).toBeDefined();
    expect(pair!.score).toBeGreaterThanOrEqual(0.1);
  });

  it("never links obstacles within the same problem", () => {
    const p = [
      {
        id: "x-001",
        obstacles: [
          "**Gap control**: positive mass gap and uniform gap bounds",
          "**Uniform gap control**: bounding a uniform positive gap",
        ],
      },
    ];
    expect(buildObstacleLinks(p, 0.05)).toEqual([]);
  });

  it("respects the threshold", () => {
    expect(buildObstacleLinks(problems, 0.9)).toEqual([]);
  });
});

describe("methodUnlocks", () => {
  const links = buildObstacleLinks([
    { id: "a-001", obstacles: ["**shared obstacle alpha beta gamma delta**"] },
    { id: "a-002", obstacles: ["**shared obstacle alpha beta gamma delta** epsilon"] },
    { id: "b-001", obstacles: ["**completely unrelated**: zeta eta theta iota kappa"] },
  ]);

  it("diffuses a method one hop along links, excluding already-touched problems", () => {
    const out = methodUnlocks(links, [
      { problemId: "a-001", method: "interval-arithmetic" },
      { problemId: "b-001", method: null },
      { problemId: "b-001", method: "" },
    ]);
    expect(out["interval-arithmetic"]).toEqual(["a-002"]);
    expect(out[""]).toBeUndefined();
  });

  it("builds the payload with stats and meta", () => {
    const payload = buildObstaclesPayload(
      [
        { id: "a-001", obstacles: ["x y z w v u"] },
        { id: "a-002", obstacles: [] },
      ],
      [],
    );
    expect(payload.stats.problems).toBe(2);
    expect(payload.stats.obstacles).toBe(1);
    expect(payload.unlocks).toEqual({});
    expect(payload.meta.threshold).toBeGreaterThan(0);
  });
});
