import { Router } from "express";
import { prisma } from "../db/prisma";
import { ulid } from "ulid";
import { createSettlementSchema } from "@splitwise/types";
import { createSettlementPostings } from "../domain/postings";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

router.use(requireAuth);

// Create settlement
router.post("/:spaceId/settlements", async (req, res) => {
  const userId = req.session.userId!;
  const spaceId = req.params.spaceId;
  
  const membership = await prisma.membership.findUnique({
    where: { userId_spaceId: { userId, spaceId } },
  });
  
  if (!membership || membership.role === "VIEWER") {
    return res.status(403).json({ error: "Insufficient permissions" });
  }
  
  const result = createSettlementSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  
  const data = result.data;
  
  // Check idempotency
  if (data.idempotencyKey) {
    const existing = await prisma.settlement.findUnique({
      where: { idempotencyKey: data.idempotencyKey },
    });
    
    if (existing) {
      return res.json({ settlementId: existing.id, duplicate: true });
    }
  }
  
  const settlementId = ulid();
  const space = await prisma.space.findUnique({ where: { id: spaceId } });
  
  await prisma.settlement.create({
    data: {
      id: settlementId,
      spaceId,
      fromUserId: data.fromUserId,
      toUserId: data.toUserId,
      amountMinor: data.amountMinor,
      method: data.method,
      note: data.note,
      attachmentUrl: data.attachmentUrl,
      createdBy: userId,
      idempotencyKey: data.idempotencyKey,
    },
  });
  
  // Create postings
  await createSettlementPostings(
    spaceId,
    settlementId,
    data.fromUserId,
    data.toUserId,
    data.amountMinor,
    space!.baseCurrency
  );
  
  res.json({ settlementId });
});

// Get settlements for space
router.get("/:spaceId/settlements", async (req, res) => {
  const userId = req.session.userId!;
  const spaceId = req.params.spaceId;
  
  const membership = await prisma.membership.findUnique({
    where: { userId_spaceId: { userId, spaceId } },
  });
  
  if (!membership) {
    return res.status(404).json({ error: "Space not found" });
  }
  
  const settlements = await prisma.settlement.findMany({
    where: { spaceId },
    include: {
      fromUser: {
        select: { id: true, name: true, avatarUrl: true },
      },
      toUser: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  
  res.json(settlements);
});

export default router;
