import { Router } from "express";
import { prisma } from "../db/prisma";
import { Prisma } from "@prisma/client";
import { ulid } from "ulid";
import { createExpenseSchema } from "@splitwise/types";
import { calculateSplit } from "../domain/rounding";
import { createExpensePostings } from "../domain/postings";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

router.use(requireAuth);

// Create expense
router.post("/:spaceId/expenses", async (req, res) => {
  const userId = req.session.userId!;
  const spaceId = req.params.spaceId;
  
  // Check membership
  const membership = await prisma.membership.findUnique({
    where: { userId_spaceId: { userId, spaceId } },
  });
  
  if (!membership || membership.role === "VIEWER") {
    return res.status(403).json({ error: "Insufficient permissions" });
  }
  
  const result = createExpenseSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  
  const data = result.data;
  
  // Calculate base amount
  const baseAmountMinor = Math.round(
    (data.nativeAmountMinor * data.fxRateMicrosToBase) / 1_000_000
  );
  
  // Calculate splits
  const splits = calculateSplit(
    baseAmountMinor,
    data.splitMethod,
    data.participants,
    data.exactMinor,
    data.percent,
    data.shares
  );
  
  // Create expense
  const expenseId = ulid();
  const revisionId = ulid();
  
  const space = await prisma.space.findUnique({ where: { id: spaceId } });
  
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.expense.create({
      data: {
        id: expenseId,
        spaceId,
        currentRevisionId: revisionId,
      },
    });
    
    await tx.expenseRevision.create({
      data: {
        id: revisionId,
        expenseId,
        revision: 1,
        createdBy: userId,
        payerId: data.payerId,
        note: data.note,
        category: data.category,
        date: data.date,
        attachments: data.attachments ? JSON.stringify(data.attachments) : null,
        nativeAmountMinor: data.nativeAmountMinor,
        nativeCurrency: data.nativeCurrency,
        fxRateMicrosToBase: data.fxRateMicrosToBase,
        baseAmountMinor,
        splitMethod: data.splitMethod,
        exactMinor: data.exactMinor ? JSON.stringify(data.exactMinor) : null,
        percent: data.percent ? JSON.stringify(data.percent) : null,
        shares: data.shares ? JSON.stringify(data.shares) : null,
        participants: JSON.stringify(data.participants),
      },
    });
  });
  
  // Create postings
  await createExpensePostings(
    spaceId,
    expenseId,
    data.payerId,
    splits,
    space!.baseCurrency
  );
  
  res.json({ expenseId, revisionId });
});

// Get expenses for space
router.get("/:spaceId/expenses", async (req, res) => {
  const userId = req.session.userId!;
  const spaceId = req.params.spaceId;
  
  const membership = await prisma.membership.findUnique({
    where: { userId_spaceId: { userId, spaceId } },
  });
  
  if (!membership) {
    return res.status(404).json({ error: "Space not found" });
  }
  
  const limit = parseInt(req.query.limit as string) || 50;
  const cursor = req.query.cursor as string | undefined;
  
  const expenses = await prisma.expense.findMany({
    where: { spaceId },
    include: {
      revisions: {
        where: {
          id: { in: await prisma.expense.findMany({ where: { spaceId } }).then((e: { currentRevisionId: string }[]) => e.map((x: { currentRevisionId: string }) => x.currentRevisionId)) }
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });
  
  res.json(expenses);
});

// Get expense detail
router.get("/expenses/:id", async (req, res) => {
  const userId = req.session.userId!;
  const expenseId = req.params.id;
  
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: {
      revisions: {
        orderBy: { revision: "desc" },
      },
      postings: true,
    },
  });
  
  if (!expense) {
    return res.status(404).json({ error: "Expense not found" });
  }
  
  // Check membership
  const membership = await prisma.membership.findUnique({
    where: { userId_spaceId: { userId, spaceId: expense.spaceId } },
  });
  
  if (!membership) {
    return res.status(403).json({ error: "Access denied" });
  }
  
  res.json(expense);
});

// Edit expense (creates new revision)
router.patch("/expenses/:id", async (req, res) => {
  const userId = req.session.userId!;
  const expenseId = req.params.id;
  
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: { revisions: true },
  });
  
  if (!expense) {
    return res.status(404).json({ error: "Expense not found" });
  }
  
  const membership = await prisma.membership.findUnique({
    where: { userId_spaceId: { userId, spaceId: expense.spaceId } },
  });
  
  if (!membership || membership.role === "VIEWER") {
    return res.status(403).json({ error: "Insufficient permissions" });
  }
  
  const result = createExpenseSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  
  const data = result.data;
  const newRevision = expense.revisions.length + 1;
  const revisionId = ulid();
  
  const baseAmountMinor = Math.round(
    (data.nativeAmountMinor * data.fxRateMicrosToBase) / 1_000_000
  );
  
  const splits = calculateSplit(
    baseAmountMinor,
    data.splitMethod,
    data.participants,
    data.exactMinor,
    data.percent,
    data.shares
  );
  
  const space = await prisma.space.findUnique({ where: { id: expense.spaceId } });
  
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.expenseRevision.create({
      data: {
        id: revisionId,
        expenseId,
        revision: newRevision,
        createdBy: userId,
        payerId: data.payerId,
        note: data.note,
        category: data.category,
        date: data.date,
        attachments: data.attachments ? JSON.stringify(data.attachments) : null,
        nativeAmountMinor: data.nativeAmountMinor,
        nativeCurrency: data.nativeCurrency,
        fxRateMicrosToBase: data.fxRateMicrosToBase,
        baseAmountMinor,
        splitMethod: data.splitMethod,
        exactMinor: data.exactMinor ? JSON.stringify(data.exactMinor) : null,
        percent: data.percent ? JSON.stringify(data.percent) : null,
        shares: data.shares ? JSON.stringify(data.shares) : null,
        participants: JSON.stringify(data.participants),
      },
    });
    
    await tx.expense.update({
      where: { id: expenseId },
      data: { currentRevisionId: revisionId },
    });
    
    // Delete old postings
    await tx.posting.deleteMany({
      where: { expenseId },
    });
  });
  
  // Create new postings
  await createExpensePostings(
    expense.spaceId,
    expenseId,
    data.payerId,
    splits,
    space!.baseCurrency
  );
  
  res.json({ revisionId });
});

export default router;
