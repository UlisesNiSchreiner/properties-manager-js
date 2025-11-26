import { describe, it, expect } from "vitest";

import { sum } from "../src/sum";

describe("sum", () => {
  it("adds two positive numbers", () => {
    expect(sum(2, 3)).toBe(5);
  });

  it("adds negatives", () => {
    expect(sum(-2, -3)).toBe(-5);
  });

  it("throws if any argument is not finite", () => {
    expect(() => sum(NaN, 1)).toThrow(TypeError);
    expect(() => sum(1, Infinity)).toThrow(TypeError);
  });
});
