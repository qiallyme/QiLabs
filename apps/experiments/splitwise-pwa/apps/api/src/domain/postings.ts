import { prisma } from "../db/prisma";
import { ulid } from "ulid";
import type { Balance } from "@splitwise/types";

/**
 * Create postings for an expense:
 * - Payer gets negative posting (paid out)
 * - Each participant gets positive posting (owes)
 */
export async function createExpensePostings(
  spaceId: string,
  expenseId: string,
  payerId: string,
  splits: Array<{ userId: string; amountMinor: number }>,
  currency: string
) {
  const totalOwed = splits.reduce((acc, s) => acc + s.amountMinor, 0);
  
  // Payer's posting (negative = paid)
  await prisma.posting.create({
    data: {
      id: ulid(),
      spaceId,
      expenseId,
      userId: payerId,
      amountMinor: -totalOwed,
      currency,
    },
  });
  
  // Participants' postings (positive = owed)
  for (const split of splits) {
    await prisma.posting.create({
      data: {
        id: ulid(),
        spaceId,
        expenseId,
        userId: split.userId,
        amountMinor: split.amountMinor,
        currency,
      },
    });
  }
}

/**
 * Create postings for a settlement:
 * - From user gets negative posting (paid)
 * - To user gets positive posting (received)
 */
export async function createSettlementPostings(
  spaceId: string,
  settlementId: string,
  fromUserId: string,
  toUserId: string,
  amountMinor: number,
  currency: string
) {
  await prisma.posting.createMany({
    data: [
      {
        id: ulid(),
        spaceId,
        expenseId: settlementId, // use settlement ID as expense ID
        userId: fromUserId,
        amountMinor: -amountMinor,
        currency,
      },
      {
        id: ulid(),
        spaceId,
        expenseId: settlementId,
        userId: toUserId,
        amountMinor: amountMinor,
        currency,
      },
    ],
  });
}

/**
 * Calculate balances for a space
 */
export async function calculateBalances(spaceId: string): Promise<Balance[]> {
  const postings = await prisma.posting.findMany({
    where: { spaceId },
  });
  
  const balanceMap = new Map<string, number>();
  
  for (const posting of postings) {
    const current = balanceMap.get(posting.userId) || 0;
    balanceMap.set(posting.userId, current + posting.amountMinor);
  }
  
  return Array.from(balanceMap.entries()).map(([userId, netMinor]) => ({
    userId,
    netMinor,
  }));
}
