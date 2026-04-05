import { Router } from "express";
import { prisma } from "../db/prisma";
import { ulid } from "ulid";
import { createSpaceSchema, inviteSchema } from "@splitwise/types";
import { getOrigin } from "../lib/origin";

const router = Router();

// Auth middleware
function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

router.use(requireAuth);

// Create space
router.post("/", async (req, res) => {
  const result = createSpaceSchema.safeParse(req.body);
  
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  
  const { name, baseCurrency, icon } = result.data;
  const userId = req.session.userId!;
  
  const space = await prisma.space.create({
    data: {
      id: ulid(),
      name,
      baseCurrency,
      icon,
      createdBy: userId,
    },
  });
  
  // Create OWNER membership
  await prisma.membership.create({
    data: {
      id: ulid(),
      userId,
      spaceId: space.id,
      role: "OWNER",
    },
  });
  
  res.json(space);
});

// List user's spaces
router.get("/", async (req, res) => {
  const userId = req.session.userId!;
  
  const memberships = await prisma.membership.findMany({
    where: { userId },
    include: {
      space: {
        include: {
          memberships: {
            include: {
              user: {
                select: { id: true, name: true, avatarUrl: true },
              },
            },
          },
        },
      },
    },
  });
  
  res.json(memberships.map((m: { space: any }) => m.space));
});

// Get space details
router.get("/:id", async (req, res) => {
  const userId = req.session.userId!;
  
  const membership = await prisma.membership.findUnique({
    where: {
      userId_spaceId: {
        userId,
        spaceId: req.params.id,
      },
    },
    include: {
      space: {
        include: {
          memberships: {
            include: {
              user: {
                select: { id: true, name: true, avatarUrl: true, defaultCurrency: true },
              },
            },
          },
        },
      },
    },
  });
  
  if (!membership) {
    return res.status(404).json({ error: "Space not found" });
  }
  
  res.json(membership.space);
});

// Create invite token
router.post("/:id/invites", async (req, res) => {
  const userId = req.session.userId!;
  const spaceId = req.params.id;
  
  const membership = await prisma.membership.findUnique({
    where: { userId_spaceId: { userId, spaceId } },
  });
  
  if (!membership || membership.role === "VIEWER") {
    return res.status(403).json({ error: "Insufficient permissions" });
  }
  
  const result = inviteSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  
  const token = ulid();
  await prisma.inviteToken.create({
    data: {
      token,
      spaceId,
      role: result.data.role,
      createdBy: userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });
  
  const base = getOrigin(req);
  const inviteUrl = `${base}/join?token=${token}`;
  
  res.json({ token, inviteUrl });
});

// Join via invite
router.post("/join", async (req, res) => {
  const { token, displayName } = req.body;
  const userId = req.session.userId!;
  
  if (!token) {
    return res.status(400).json({ error: "Token required" });
  }
  
  const invite = await prisma.inviteToken.findUnique({
    where: { token },
  });
  
  if (!invite || invite.expiresAt < new Date()) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
  
  // Check if already a member
  const existing = await prisma.membership.findUnique({
    where: {
      userId_spaceId: {
        userId,
        spaceId: invite.spaceId,
      },
    },
  });
  
  if (existing) {
    return res.json({ message: "Already a member", spaceId: invite.spaceId });
  }
  
  // Update display name if provided
  if (displayName) {
    await prisma.user.update({
      where: { id: userId },
      data: { name: displayName },
    });
  }
  
  // Create membership
  await prisma.membership.create({
    data: {
      id: ulid(),
      userId,
      spaceId: invite.spaceId,
      role: invite.role,
    },
  });
  
  res.json({ message: "Joined space", spaceId: invite.spaceId });
});

// Get space members
router.get("/:id/members", async (req, res) => {
  const userId = req.session.userId!;
  const spaceId = req.params.id;
  
  const membership = await prisma.membership.findUnique({
    where: { userId_spaceId: { userId, spaceId } },
  });
  
  if (!membership) {
    return res.status(404).json({ error: "Space not found" });
  }
  
  const members = await prisma.membership.findMany({
    where: { spaceId },
    include: {
      user: {
        select: { id: true, name: true, avatarUrl: true, email: true },
      },
    },
  });
  
  res.json(members);
});

export default router;
