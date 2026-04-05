import Dexie, { Table } from "dexie";
import type {
  Space,
  Membership,
  Expense,
  ExpenseRevision,
  Settlement,
  Balance,
  OutboxItem,
} from "@splitwise/types";

export class AppDatabase extends Dexie {
  spaces!: Table<Space>;
  memberships!: Table<Membership>;
  expenses!: Table<Expense>;
  revisions!: Table<ExpenseRevision>;
  settlements!: Table<Settlement>;
  balances!: Table<Balance & { spaceId: string }>;
  outbox!: Table<OutboxItem>;

  constructor() {
    super("splitwise");
    
    this.version(1).stores({
      spaces: "id, createdAt",
      memberships: "id, userId, spaceId, [userId+spaceId]",
      expenses: "id, spaceId, createdAt",
      revisions: "id, expenseId, [expenseId+revision]",
      settlements: "id, spaceId, createdAt",
      balances: "[spaceId+userId], spaceId",
      outbox: "id, op, createdAt",
    });
  }
}

export const db = new AppDatabase();
