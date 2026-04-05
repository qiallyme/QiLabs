import { Router } from "express";
import { prisma } from "../db/prisma";
import { ulid } from "ulid";
import { getOrigin } from "../lib/origin";

const router = Router();

// Magic link stub - in production, send email
router.post("/magic/start", async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: "Email required" });
  }
  
  // Find or create user
  let user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: ulid(),
        email,
        name: email.split("@")[0],
        defaultCurrency: "USD",
      },
    });
  }
  
  // Create magic link token
  const token = ulid();
  await prisma.magicLink.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min
    },
  });
  
  // In production: send email with link
  const base = getOrigin(req);
  const magicUrl = `${base}/auth/verify?token=${token}`;
  
  res.json({
    message: "Magic link created (check console in dev)",
    magicUrl, // dev only
  });
});

router.get("/magic/verify", async (req, res) => {
  const { token } = req.query;
  
  if (!token || typeof token !== "string") {
    return res.status(400).send("Invalid token");
  }
  
  const link = await prisma.magicLink.findUnique({
    where: { token },
  });
  
  if (!link || link.expiresAt < new Date()) {
    return res.status(401).send("Token expired or invalid");
  }
  
  // Set session
  (req.session as any).userId = link.userId;
  
  // Delete used token
  await prisma.magicLink.delete({ where: { token } });
  
  res.redirect(getOrigin(req));
});

router.get("/me", async (req, res) => {
  const userId = (req.session as any)?.userId;
  
  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      memberships: {
        include: {
          space: true,
        },
      },
    },
  });
  
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  
  res.json(user);
});

router.post("/signout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Signed out" });
  });
});

export default router;
