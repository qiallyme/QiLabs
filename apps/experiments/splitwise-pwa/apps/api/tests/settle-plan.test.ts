import { describe, it, expect } from "vitest";
import { generateSettlePlan } from "../src/domain/settle-plan";
import type { Balance } from "@splitwise/types";

describe("Settle Plan", () => {
  it("should generate minimal transfers for simple case", () => {
    const balances: Balance[] = [
      { userId: "alice", netMinor: 1000 }, // owed 10
      { userId: "bob", netMinor: -1000 }, // owes 10
    ];
    
    const plan = generateSettlePlan(balances);
    
    expect(plan).toHaveLength(1);
    expect(plan[0]).toEqual({
      from: "bob",
      to: "alice",
      amountMinor: 1000,
    });
  });

  it("should handle multiple debtors to one creditor", () => {
    const balances: Balance[] = [
      { userId: "alice", netMinor: 3000 },
      { userId: "bob", netMinor: -1000 },
      { userId: "charlie", netMinor: -2000 },
    ];
    
    const plan = generateSettlePlan(balances);
    
    expect(plan).toHaveLength(2);
    
    const totalTransferred = plan.reduce((sum, t) => sum + t.amountMinor, 0);
    expect(totalTransferred).toBe(3000);
    
    // Verify all transfers go to alice
    expect(plan.every((t) => t.to === "alice")).toBe(true);
  });

  it("should result in balanced net after settlements", () => {
    const balances: Balance[] = [
      { userId: "alice", netMinor: 5000 },
      { userId: "bob", netMinor: -3000 },
      { userId: "charlie", netMinor: -2000 },
    ];
    
    const plan = generateSettlePlan(balances);
    
    // Calculate net after settlements
    const nets = new Map<string, number>();
    balances.forEach((b) => nets.set(b.userId, b.netMinor));
    
    plan.forEach((t) => {
      nets.set(t.from, (nets.get(t.from) || 0) + t.amountMinor);
      nets.set(t.to, (nets.get(t.to) || 0) - t.amountMinor);
    });
    
    // All nets should be near zero (within 1 cent tolerance)
    Array.from(nets.values()).forEach((net) => {
      expect(Math.abs(net)).toBeLessThanOrEqual(1);
    });
  });

  it("should handle complex multi-party scenario", () => {
    const balances: Balance[] = [
      { userId: "alice", netMinor: 10000 },
      { userId: "bob", netMinor: 5000 },
      { userId: "charlie", netMinor: -7000 },
      { userId: "dave", netMinor: -8000 },
    ];
    
    const plan = generateSettlePlan(balances);
    
    // Verify sum is preserved
    const totalOut = plan.reduce((sum, t) => sum + t.amountMinor, 0);
    const totalPositive = balances
      .filter((b) => b.netMinor > 0)
      .reduce((sum, b) => sum + b.netMinor, 0);
    
    expect(totalOut).toBe(totalPositive);
  });

  it("should ignore dust amounts", () => {
    const balances: Balance[] = [
      { userId: "alice", netMinor: 1 }, // dust
      { userId: "bob", netMinor: -1 }, // dust
    ];
    
    const plan = generateSettlePlan(balances);
    
    expect(plan).toHaveLength(0);
  });
});
