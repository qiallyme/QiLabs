import { z } from "zod";

export const currencySchema = z.enum(["USD", "EUR", "INR", "IDR", "JPY"]);
export const roleSchema = z.enum(["OWNER", "EDITOR", "VIEWER"]);
export const splitMethodSchema = z.enum(["equal", "exact", "percent", "shares"]);

export const createSpaceSchema = z.object({
  name: z.string().min(1).max(100),
  baseCurrency: currencySchema,
  icon: z.string().optional(),
});

export const createExpenseSchema = z.object({
  payerId: z.string(),
  nativeAmountMinor: z.number().int().positive(),
  nativeCurrency: currencySchema,
  fxRateMicrosToBase: z.number().int().positive(),
  note: z.string().max(500).optional(),
  category: z.string().max(50).optional(),
  date: z.string(), // ISO date
  splitMethod: splitMethodSchema,
  exactMinor: z.record(z.number().int().nonnegative()).optional(),
  percent: z.record(z.number().nonnegative()).optional(),
  shares: z.record(z.number().int().positive()).optional(),
  participants: z.array(z.string()).min(1),
  attachments: z.array(z.string()).optional(),
});

export const createSettlementSchema = z.object({
  fromUserId: z.string(),
  toUserId: z.string(),
  amountMinor: z.number().int().positive(),
  method: z.enum(["cash", "venmo", "upi", "other"]).optional(),
  note: z.string().max(500).optional(),
  attachmentUrl: z.string().optional(),
  idempotencyKey: z.string().optional(),
});

export const inviteSchema = z.object({
  email: z.string().email().optional(),
  role: roleSchema,
});
