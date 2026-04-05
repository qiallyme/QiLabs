import { describe, it, expect } from "vitest";
import { fairRound, calculateSplit } from "../src/domain/rounding";

describe("Fair Rounding", () => {
  it("should distribute residual deterministically", () => {
    const result = fairRound(
      [
        { userId: "u1", rawAmount: 33.333333 },
        { userId: "u2", rawAmount: 33.333333 },
        { userId: "u3", rawAmount: 33.333333 },
      ],
      100
    );

    expect(result.reduce((sum, r) => sum + r.amountMinor, 0)).toBe(100);
    
    // Sort by userId for deterministic assertion
    const sorted = [...result].sort((a, b) => a.userId.localeCompare(b.userId));
    
    // One user should get 34, two should get 33
    const amounts = sorted.map((r) => r.amountMinor).sort((a, b) => b - a);
    expect(amounts).toEqual([34, 33, 33]);
  });

  it("should handle equal split correctly", () => {
    const result = calculateSplit(10000, "equal", ["u1", "u2", "u3"]);
    
    expect(result.reduce((sum, r) => sum + r.amountMinor, 0)).toBe(10000);
    
    // With 10000 / 3 = 3333.33..., one user gets 3334, two get 3333
    const amounts = result.map((r) => r.amountMinor).sort((a, b) => b - a);
    expect(amounts).toEqual([3334, 3333, 3333]);
  });

  it("should handle percent split correctly", () => {
    const result = calculateSplit(
      10000,
      "percent",
      ["u1", "u2", "u3"],
      undefined,
      { u1: 50, u2: 30, u3: 20 }
    );
    
    expect(result.reduce((sum, r) => sum + r.amountMinor, 0)).toBe(10000);
    
    const u1 = result.find((r) => r.userId === "u1")!;
    const u2 = result.find((r) => r.userId === "u2")!;
    const u3 = result.find((r) => r.userId === "u3")!;
    
    expect(u1.amountMinor).toBe(5000);
    expect(u2.amountMinor).toBe(3000);
    expect(u3.amountMinor).toBe(2000);
  });

  it("should handle shares split correctly", () => {
    const result = calculateSplit(
      10000,
      "shares",
      ["u1", "u2", "u3"],
      undefined,
      undefined,
      { u1: 2, u2: 2, u3: 1 }
    );
    
    expect(result.reduce((sum, r) => sum + r.amountMinor, 0)).toBe(10000);
    
    // 5 shares total: u1 gets 4000, u2 gets 4000, u3 gets 2000
    const u1 = result.find((r) => r.userId === "u1")!;
    const u2 = result.find((r) => r.userId === "u2")!;
    const u3 = result.find((r) => r.userId === "u3")!;
    
    expect(u1.amountMinor).toBe(4000);
    expect(u2.amountMinor).toBe(4000);
    expect(u3.amountMinor).toBe(2000);
  });

  it("should be deterministic across runs", () => {
    const input = [
      { userId: "alice", rawAmount: 33.333333 },
      { userId: "bob", rawAmount: 33.333333 },
      { userId: "charlie", rawAmount: 33.333333 },
    ];
    
    const run1 = fairRound(input, 100);
    const run2 = fairRound(input, 100);
    
    expect(run1).toEqual(run2);
  });
});
