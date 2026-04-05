// Domain types (all money in minor units)

export type Currency = "USD" | "EUR" | "INR" | "IDR" | "JPY";

export interface User {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  defaultCurrency: Currency;
  createdAt: string;
}

export interface Space {
  id: string;
  name: string;
  baseCurrency: Currency;
  icon?: string;
  createdBy: string;
  createdAt: string;
}

export type Role = "OWNER" | "EDITOR" | "VIEWER";

export interface Membership {
  id: string;
  userId: string;
  spaceId: string;
  role: Role;
  createdAt: string;
}

export type SplitMethod = "equal" | "exact" | "percent" | "shares";

export interface ExpenseRevision {
  id: string;
  expenseId: string;
  revision: number;
  createdBy: string;
  createdAt: string;
  payerId: string;
  note?: string;
  category?: string;
  date: string;
  attachments?: string[];
  nativeAmountMinor: number;
  nativeCurrency: Currency;
  fxRateMicrosToBase: number; // 1,000,000 = 1.0
  baseAmountMinor: number;
  splitMethod: SplitMethod;
  exactMinor?: Record<string, number>;
  percent?: Record<string, number>;
  shares?: Record<string, number>;
  participants: string[];
}

export interface Expense {
  id: string;
  spaceId: string;
  currentRevisionId: string;
  createdAt: string;
}

export interface Posting {
  id: string;
  spaceId: string;
  expenseId: string;
  userId: string;
  amountMinor: number; // positive = owed, negative = paid
  currency: Currency;
  createdAt: string;
}

export interface Settlement {
  id: string;
  spaceId: string;
  fromUserId: string;
  toUserId: string;
  amountMinor: number;
  method?: "cash" | "venmo" | "upi" | "other";
  note?: string;
  attachmentUrl?: string;
  createdBy: string;
  createdAt: string;
  idempotencyKey?: string;
}

export interface Balance {
  userId: string;
  netMinor: number; // positive = owed to you, negative = you owe
}

export interface Transfer {
  from: string;
  to: string;
  amountMinor: number;
}

export interface OutboxItem {
  id: string;
  op: "create_expense" | "edit_expense" | "create_settlement";
  payload: any;
  clientId: string;
  createdAt: string;
  retries: number;
}
