import { test, expect } from "vitest";
import { buildProofTasks } from "./proof-tasks.json";

// 与 scripts/lib/catalog-checks.mjs 的 deriveProofTasks 同源（同一筛选谓词）。
// 数量锚点 = 38（formalization_potential=high 且有 lean_statement 的题数）；
// 目录扩库时若两侧不同步，deploy 的 check-proof-tasks 守卫或本测试会拦截。
const PROOF_TASK_COUNT = 38;

test("proof-tasks serves a non-trivial Vero-style task list", () => {
  const tasks = buildProofTasks();
  expect(tasks.length).toBe(PROOF_TASK_COUNT);
  // 全部来自 high + lean_statement 筛选：L0 锚点必须在场
  for (const t of tasks) {
    expect(t.task_id).toMatch(/^[a-z]{2}-\d+$/);
    expect(t.statement.length).toBeGreaterThan(0);
    expect(t.judgment.length).toBeGreaterThan(0);
    expect(t.target).toBe("Lean4/std");
    expect(t.anchor.statement_anchor).toBe(true);
    expect(["provable", "conjectured", "refuted", "open"]).toContain(t.status);
    expect(["analytical", "numerical", "experimental"]).toContain(t.verification_path);
  }
});

test("proof-tasks ids are unique and sorted", () => {
  const tasks = buildProofTasks();
  const ids = tasks.map((t) => t.task_id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(ids).toEqual([...ids].sort());
});
