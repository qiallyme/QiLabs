/**
 * Fair rounding algorithm:
 * 1. Calculate raw amounts (floor each)
 * 2. Distribute residual cents to those with highest fractional remainders
 * 3. Tiebreak by userId ascending for determinism
 */

export interface RoundingInput {
  userId: string;
  rawAmount: number; // in cents (can be fractional)
}

export interface RoundingResult {
  userId: string;
  amountMinor: number; // rounded to integer cents
}

export function fairRound(
  inputs: RoundingInput[],
  totalMinor: number
): RoundingResult[] {
  // Floor each amount and track fractional remainder
  const floored = inputs.map((inp) => ({
    userId: inp.userId,
    floored: Math.floor(inp.rawAmount),
    remainder: inp.rawAmount - Math.floor(inp.rawAmount),
  }));

  const sumFloored = floored.reduce((acc, x) => acc + x.floored, 0);
  const residual = totalMinor - sumFloored;

  if (residual < 0 || residual > inputs.length) {
    throw new Error("Invalid rounding state");
  }

  // Sort by remainder desc, then userId asc for determinism
  const sorted = [...floored].sort((a, b) => {
    if (Math.abs(a.remainder - b.remainder) > 1e-9) {
      return b.remainder - a.remainder;
    }
    return a.userId.localeCompare(b.userId);
  });

  // Give +1 cent to first `residual` users
  const result = floored.map((x) => ({
    userId: x.userId,
    amountMinor: x.floored,
  }));

  for (let i = 0; i < residual; i++) {
    const userId = sorted[i].userId;
    const entry = result.find((r) => r.userId === userId)!;
    entry.amountMinor += 1;
  }

  return result;
}

/**
 * Calculate split amounts based on method
 */
export function calculateSplit(
  totalMinor: number,
  splitMethod: string,
  participants: string[],
  exactMinor?: Record<string, number>,
  percent?: Record<string, number>,
  shares?: Record<string, number>
): RoundingResult[] {
  if (splitMethod === "equal") {
    const perPerson = totalMinor / participants.length;
    const inputs = participants.map((uid) => ({ userId: uid, rawAmount: perPerson }));
    return fairRound(inputs, totalMinor);
  }

  if (splitMethod === "exact") {
    if (!exactMinor) throw new Error("exactMinor required");
    return participants.map((uid) => ({
      userId: uid,
      amountMinor: exactMinor[uid] || 0,
    }));
  }

  if (splitMethod === "percent") {
    if (!percent) throw new Error("percent required");
    const inputs = participants.map((uid) => ({
      userId: uid,
      rawAmount: (totalMinor * (percent[uid] || 0)) / 100,
    }));
    return fairRound(inputs, totalMinor);
  }

  if (splitMethod === "shares") {
    if (!shares) throw new Error("shares required");
    const totalShares = participants.reduce((acc, uid) => acc + (shares[uid] || 0), 0);
    const inputs = participants.map((uid) => ({
      userId: uid,
      rawAmount: (totalMinor * (shares[uid] || 0)) / totalShares,
    }));
    return fairRound(inputs, totalMinor);
  }

  throw new Error("Unknown split method");
}
