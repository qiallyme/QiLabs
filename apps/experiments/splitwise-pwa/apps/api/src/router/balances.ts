import { Router } from "express";
import { prisma } from "../db/prisma";
import { calculateBalances } from "../domain/postings";
import { generateSettlePlan } from "../domain/settle-plan";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

router.use(requireAuth);

// Get balances for space
router.get("/:spaceId/balances", async (req, res) => {
  const userId = req.session.userId!;
  const spaceId = req.params.spaceId;
  
  const membership = await prisma.membership.findUnique({
    where: { userId_spaceId: { userId, spaceId } },
  });
  
  if (!membership) {
    return res.status(404).json({ error: "Space not found" });
  }
  
  const balances = await calculateBalances(spaceId);
  
  // Include user details
  const users = await prisma.user.findMany({
    where: { id: { in: balances.map((b) => b.userId) } },
    select: { id: true, name: true, avatarUrl: true },
  });
  
  const result = balances.map((b) => ({
    ...b,
    user: users.find((u: { id: string; name: string; avatarUrl: string | null }) => u.id === b.userId),
  }));
  
  res.json(result);
});

// Generate settle plan
router.post("/:spaceId/settle-plan", async (req, res) => {
  const userId = req.session.userId!;
  const spaceId = req.params.spaceId;
  
  const membership = await prisma.membership.findUnique({
    where: { userId_spaceId: { userId, spaceId } },
  });
  
  if (!membership) {
    return res.status(404).json({ error: "Space not found" });
  }
  
  const balances = await calculateBalances(spaceId);
  const plan = generateSettlePlan(balances);
  
  // Include user details
  const userIds = [...new Set(plan.flatMap((t) => [t.from, t.to]))];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, avatarUrl: true },
  });
  
  const result = plan.map((t) => ({
    ...t,
    fromUser: users.find((u: { id: string; name: string; avatarUrl: string | null }) => u.id === t.from),
    toUser: users.find((u: { id: string; name: string; avatarUrl: string | null }) => u.id === t.to),
  }));
  
  res.json(result);
});

export default router;
