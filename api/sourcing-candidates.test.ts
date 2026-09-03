import { test, expect } from "vitest";
import { sourcingProposals } from "../src/data/sourcingCandidates";
import { ENGINEERING_NEEDS } from "../src/data/engineeringNeeds";

test("sourcing pipeline: every new item becomes exactly one stable candidate-pool proposal", () => {
  const proposals = sourcingProposals();
  // 预期：每条需求缺口（sourcing.kind='new'）落为一条提案。
  const newCount = ENGINEERING_NEEDS.reduce(
    (acc, n) => acc + (n.sourcing ?? []).filter((s) => s.kind === "new").length,
    0,
  );
  expect(proposals.length).toBe(newCount);
  expect(proposals.length).toBeGreaterThan(0);

  // id 稳定且唯一（cn-001…）。
  const ids = proposals.map((p) => p.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(proposals[0].id).toBe("cn-001");

  // 每条提案挂真实来源需求，字段非空。
  const needIds = new Set(ENGINEERING_NEEDS.map((n) => n.id));
  for (const p of proposals) {
    expect(needIds.has(p.needId)).toBe(true);
    expect(p.area).toBeTruthy();
    expect(p.title).toBeTruthy();
    expect(p.what).toBeTruthy();
    expect(p.status).toBe("proposal");
  }
});
