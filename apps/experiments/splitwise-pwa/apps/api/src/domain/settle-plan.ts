import type { Balance, Transfer } from "@splitwise/types";

/**
 * Minimal transfers algorithm:
 * Greedy approach - match largest debtor with largest creditor
 */
export function generateSettlePlan(balances: Balance[]): Transfer[] {
  const transfers: Transfer[] = [];
  
  // Separate debtors (negative net) and creditors (positive net)
  let debtors = balances
    .filter((b) => b.netMinor < -1) // ignore dust
    .map((b) => ({ userId: b.userId, amount: -b.netMinor }))
    .sort((a, b) => b.amount - a.amount);
  
  let creditors = balances
    .filter((b) => b.netMinor > 1)
    .map((b) => ({ userId: b.userId, amount: b.netMinor }))
    .sort((a, b) => b.amount - a.amount);

  while (debtors.length > 0 && creditors.length > 0) {
    const debtor = debtors[0];
    const creditor = creditors[0];
    
    const transferAmount = Math.min(debtor.amount, creditor.amount);
    
    transfers.push({
      from: debtor.userId,
      to: creditor.userId,
      amountMinor: transferAmount,
    });
    
    debtor.amount -= transferAmount;
    creditor.amount -= transferAmount;
    
    if (debtor.amount <= 1) debtors.shift();
    if (creditor.amount <= 1) creditors.shift();
  }
  
  return transfers;
}
