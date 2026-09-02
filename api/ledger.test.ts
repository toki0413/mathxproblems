// api/ledger.json.ts 的 bandVerdict 单测：协议账本「可核验导出」里参考核验器
// 对 verification 带证区间给出的判定，必须与 contracts/verifier.ts 一致。
import { describe, expect, it } from "vitest";
import { bandVerdict } from "./ledger.json";

describe("bandVerdict", () => {
  it("returns null when there is no band (non-verification events)", () => {
    expect(bandVerdict(null)).toBeNull();
    expect(bandVerdict(undefined)).toBeNull();
  });

  it("flags descriptive bands as unparseable", () => {
    const v = bandVerdict("候选核谱隙确认区间");
    expect(v).not.toBeNull();
    expect(v?.parseable).toBe(false);
    expect(v?.relative_width).toBeNull();
    expect(v?.note).toContain("not machine-parseable");
  });

  it("accepts a tight parseable band within the info gate", () => {
    const v = bandVerdict("[1.52, 1.56]");
    expect(v?.parseable).toBe(true);
    expect(v?.within_vacuous).toBe(true);
    expect(v?.within_info_gate).toBe(true);
    expect(v?.relative_width).toBeCloseTo(0.026, 3);
  });

  it("flags an unhelpfully wide band as vacuous", () => {
    const v = bandVerdict("[0, 10]");
    expect(v?.parseable).toBe(true);
    expect(v?.within_vacuous).toBe(false);
    expect(v?.note).toContain("vacuous");
  });

  it("keeps the same judgement as the reference verifier for a mid-gate band", () => {
    const v = bandVerdict("[0.4, 0.6]"); // 相对宽度 0.4
    expect(v?.within_vacuous).toBe(true);
    expect(v?.within_info_gate).toBe(false);
  });
});
