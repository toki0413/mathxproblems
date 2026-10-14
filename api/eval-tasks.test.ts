import { test, expect } from "vitest";
import { buildEvalTasks, evalTaskStats } from "./eval-tasks.json";

test("eval tasks: benchmark subset, all with machine-checkable anchors", () => {
  const tasks = buildEvalTasks();
  expect(tasks.length).toBeGreaterThan(0);
  for (const t of tasks) {
    expect(t.task_id).toMatch(/^(mp|mc|mb|me|cs)-\d+$/);
    expect(t.judgment.length).toBeGreaterThan(0);
    expect(typeof t.anchors.statement_anchor).toBe("boolean");
    expect(typeof t.anchors.failure_typology).toBe("boolean");
    if (t.anchors.certificate_record != null) {
      expect(typeof t.anchors.certificate_record.lo).toBe("number");
      expect(typeof t.anchors.certificate_record.hi).toBe("number");
      expect(t.anchors.certificate_record.hi).toBeGreaterThan(t.anchors.certificate_record.lo);
    }
  }
});

test("eval task stats aggregate correctly", () => {
  const tasks = buildEvalTasks();
  const stats = evalTaskStats();
  expect(stats.count).toBe(tasks.length);
  const sumByDomain = Object.values(stats.by_domain).reduce((s: number, n) => s + (n as number), 0);
  expect(sumByDomain).toBe(tasks.length);
  expect(stats.anchors.statement_anchor).toBe(tasks.filter((t) => t.anchors.statement_anchor).length);
  expect(stats.anchors.certificate_record).toBe(tasks.filter((t) => t.anchors.certificate_record).length);
  expect(stats.anchors.failure_typology).toBe(tasks.filter((t) => t.anchors.failure_typology).length);
});

test("eval tasks route serves over HTTP", async () => {
  const { app } = await import("./boot");
  const res = await app.request("/api/v1/benchmark/tasks.json");
  expect(res.status).toBe(200);
  const body = (await res.json()) as { task_id: string; anchors: { statement_anchor: boolean } }[];
  expect(Array.isArray(body)).toBe(true);
  expect(body.length).toBeGreaterThan(0);
  const statsRes = await app.request("/api/v1/benchmark/stats.json");
  expect(statsRes.status).toBe(200);
});
