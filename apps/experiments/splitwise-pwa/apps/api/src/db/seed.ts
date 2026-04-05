import { prisma } from "./prisma";
import { ulid } from "ulid";

async function seed() {
  console.log("Seeding database...");

  // Create users
  const alice = await prisma.user.create({
    data: {
      id: ulid(),
      name: "Alice",
      email: "alice@example.com",
      defaultCurrency: "USD",
    },
  });

  const bob = await prisma.user.create({
    data: {
      id: ulid(),
      name: "Bob",
      email: "bob@example.com",
      defaultCurrency: "USD",
    },
  });

  const charlie = await prisma.user.create({
    data: {
      id: ulid(),
      name: "Charlie",
      email: "charlie@example.com",
      defaultCurrency: "EUR",
    },
  });

  const diana = await prisma.user.create({
    data: {
      id: ulid(),
      name: "Diana",
      email: "diana@example.com",
      defaultCurrency: "INR",
    },
  });

  // Create space
  const space = await prisma.space.create({
    data: {
      id: ulid(),
      name: "Weekend Trip",
      baseCurrency: "USD",
      icon: "✈️",
      createdBy: alice.id,
    },
  });

  // Create memberships
  await prisma.membership.createMany({
    data: [
      { id: ulid(), userId: alice.id, spaceId: space.id, role: "OWNER" },
      { id: ulid(), userId: bob.id, spaceId: space.id, role: "EDITOR" },
      { id: ulid(), userId: charlie.id, spaceId: space.id, role: "EDITOR" },
      { id: ulid(), userId: diana.id, spaceId: space.id, role: "EDITOR" },
    ],
  });

  // Create sample expense
  const expenseId = ulid();
  const revisionId = ulid();

  await prisma.expense.create({
    data: {
      id: expenseId,
      spaceId: space.id,
      currentRevisionId: revisionId,
    },
  });

  await prisma.expenseRevision.create({
    data: {
      id: revisionId,
      expenseId,
      revision: 1,
      createdBy: alice.id,
      payerId: alice.id,
      note: "Hotel booking",
      category: "Accommodation",
      date: new Date().toISOString().split("T")[0],
      nativeAmountMinor: 24000, // $240
      nativeCurrency: "USD",
      fxRateMicrosToBase: 1000000,
      baseAmountMinor: 24000,
      splitMethod: "equal",
      participants: JSON.stringify([alice.id, bob.id, charlie.id, diana.id]),
    },
  });

  // Create postings
  await prisma.posting.createMany({
    data: [
      {
        id: ulid(),
        spaceId: space.id,
        expenseId,
        userId: alice.id,
        amountMinor: -24000,
        currency: "USD",
      },
      {
        id: ulid(),
        spaceId: space.id,
        expenseId,
        userId: alice.id,
        amountMinor: 6000,
        currency: "USD",
      },
      {
        id: ulid(),
        spaceId: space.id,
        expenseId,
        userId: bob.id,
        amountMinor: 6000,
        currency: "USD",
      },
      {
        id: ulid(),
        spaceId: space.id,
        expenseId,
        userId: charlie.id,
        amountMinor: 6000,
        currency: "USD",
      },
      {
        id: ulid(),
        spaceId: space.id,
        expenseId,
        userId: diana.id,
        amountMinor: 6000,
        currency: "USD",
      },
    ],
  });

  console.log("Seed complete!");
  console.log(`Space ID: ${space.id}`);
  console.log(`Users: Alice (${alice.email}), Bob (${bob.email}), Charlie (${charlie.email}), Diana (${diana.email})`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
