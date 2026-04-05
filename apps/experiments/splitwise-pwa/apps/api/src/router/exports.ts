import { Router } from "express";
import { prisma } from "../db/prisma";
import { calculateBalances } from "../domain/postings";
import { getOrigin } from "../lib/origin";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

router.use(requireAuth);

// Export CSV
router.get("/:spaceId/export.csv", async (req, res) => {
  const userId = req.session.userId!;
  const spaceId = req.params.spaceId;
  
  const membership = await prisma.membership.findUnique({
    where: { userId_spaceId: { userId, spaceId } },
  });
  
  if (!membership) {
    return res.status(404).json({ error: "Space not found" });
  }
  
  const expenses = await prisma.expense.findMany({
    where: { spaceId },
    include: {
      revisions: true,
      postings: {
        include: {
          user: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  
  const settlements = await prisma.settlement.findMany({
    where: { spaceId },
    include: {
      fromUser: { select: { name: true } },
      toUser: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  
  let csv = "Type,Date,Payer,Amount,Currency,Note,Category\n";
  
  for (const expense of expenses) {
    const revision = expense.revisions.find((r: { id: string }) => r.id === expense.currentRevisionId);
    if (revision) {
      const payer = expense.postings.find((p: { userId: string; user: { name: string } }) => p.userId === revision.payerId)?.user.name || "Unknown";
      csv += `Expense,${revision.date},"${payer}",${revision.nativeAmountMinor / 100},${revision.nativeCurrency},"${revision.note || ""}","${revision.category || ""}"\n`;
    }
  }
  
  for (const settlement of settlements) {
    csv += `Settlement,${settlement.createdAt.toISOString().split("T")[0]},"${settlement.fromUser.name} → ${settlement.toUser.name}",${settlement.amountMinor / 100},${settlement.method || ""},"${settlement.note || ""}",""\n`;
  }
  
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="space-${spaceId}.csv"`);
  res.send(csv);
});

// Create shareable settle summary (stub - would store token)
router.post("/:spaceId/share-settle", async (req, res) => {
  const userId = req.session.userId!;
  const spaceId = req.params.spaceId;
  
  const membership = await prisma.membership.findUnique({
    where: { userId_spaceId: { userId, spaceId } },
  });
  
  if (!membership) {
    return res.status(404).json({ error: "Space not found" });
  }
  
  // In production, create a token and store it
  const token = `share_${Date.now()}`;
  const base = getOrigin(req);
  const publicUrl = `${base}/shared/${token}`;
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  
  res.json({ publicUrl, expiresAt });
});

export default router;
