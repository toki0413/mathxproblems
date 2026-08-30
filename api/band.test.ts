// contracts/band.ts 的单测：带宽解析与收窄比特计量。
import { describe, expect, it } from "vitest";
import { bandBits, bandWidth, parseBand } from "@contracts/band";

describe("parseBand", () => {
  it("parses bracketed and parenthesized intervals", () => {
    expect(parseBand("[1.52, 1.56]")).toEqual({ lo: 1.52, hi: 1.56 });
    expect(parseBand("(0, 1)")).toEqual({ lo: 0, hi: 1 });
    expect(parseBand(" [ -2.5e-3 , 4e-3 ] ")).toEqual({ lo: -2.5e-3, hi: 4e-3 });
  });

  it("rejects non-intervals and degenerate ranges", () => {
    expect(parseBand("候选核谱隙确认区间")).toBeNull();
    expect(parseBand("[1, 1]")).toBeNull();
    expect(parseBand("[2, 1]")).toBeNull();
    expect(parseBand("1.52-1.56")).toBeNull();
    expect(parseBand("")).toBeNull();
    expect(parseBand(null)).toBeNull();
  });
});

describe("bandBits", () => {
  it("counts one bit per halving of the band width", () => {
    expect(bandBits("[0, 1]", "[0.25, 0.75]")).toBeCloseTo(1, 10);
    expect(bandBits("[0, 1]", "[0.4, 0.65]")).toBeCloseTo(2, 10);
    expect(bandBits("[1.52, 1.56]", "[1.52, 1.56]")).toBeCloseTo(0, 10);
  });

  it("returns negative bits for a widening (audit signal, not clamped)", () => {
    expect(bandBits("[0.25, 0.75]", "[0, 1]")).toBeCloseTo(-1, 10);
  });

  it("returns null when either side is unparseable", () => {
    expect(bandBits(null, "[0, 1]")).toBeNull();
    expect(bandBits("[0, 1]", "see note")).toBeNull();
  });

  it("bandWidth is hi - lo", () => {
    expect(bandWidth({ lo: -1, hi: 2 })).toBe(3);
  });
});
