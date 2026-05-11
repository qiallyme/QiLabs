import { z } from "zod";
import { protectedProcedure, router } from "../lib/trpc.js";
import { 
  casePhases, issues, events, documents, letters, 
  deadlines, filings, tasks, quickLinks, libraryDocuments,
  insertPhaseSchema, insertIssueSchema, insertEventSchema,
  insertDocSchema, insertLetterSchema, insertDeadlineSchema,
  insertFilingSchema, insertTaskSchema, insertQuickLinkSchema,
  insertLibraryDocumentSchema
} from "../../../db/schema";
import { eq, desc } from "drizzle-orm";

export const caseRouter = router({
  // --- PHASES ---
  getPhases: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(casePhases).orderBy(casePhases.order);
  }),
  createPhase: protectedProcedure
    .input(insertPhaseSchema)
    .mutation(async ({ input, ctx }) => {
      const [newPhase] = await ctx.db.insert(casePhases).values(input).returning();
      return newPhase;
    }),
  updatePhase: protectedProcedure
    .input(z.object({ id: z.string(), data: insertPhaseSchema.partial() }))
    .mutation(async ({ input, ctx }) => {
      const [updated] = await ctx.db
        .update(casePhases)
        .set(input.data)
        .where(eq(casePhases.phaseId, input.id))
        .returning();
      return updated;
    }),

  // --- ISSUES ---
  getIssues: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(issues);
  }),
  createIssue: protectedProcedure
    .input(insertIssueSchema)
    .mutation(async ({ input, ctx }) => {
      const [newIssue] = await ctx.db.insert(issues).values(input).returning();
      return newIssue;
    }),
  updateIssue: protectedProcedure
    .input(z.object({ id: z.string(), data: insertIssueSchema.partial() }))
    .mutation(async ({ input, ctx }) => {
      const [updated] = await ctx.db
        .update(issues)
        .set(input.data)
        .where(eq(issues.issueId, input.id))
        .returning();
      return updated;
    }),

  // --- EVENTS ---
  getEvents: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(events);
  }),
  createEvent: protectedProcedure
    .input(insertEventSchema)
    .mutation(async ({ input, ctx }) => {
      const [newEvent] = await ctx.db.insert(events).values(input).returning();
      return newEvent;
    }),
  updateEvent: protectedProcedure
    .input(z.object({ id: z.string(), data: insertEventSchema.partial() }))
    .mutation(async ({ input, ctx }) => {
      const [updated] = await ctx.db
        .update(events)
        .set(input.data)
        .where(eq(events.eventId, input.id))
        .returning();
      return updated;
    }),

  // --- DOCUMENTS ---
  getDocuments: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(documents);
  }),
  createDocument: protectedProcedure
    .input(insertDocSchema)
    .mutation(async ({ input, ctx }) => {
      const [newDoc] = await ctx.db.insert(documents).values(input).returning();
      return newDoc;
    }),
  updateDocument: protectedProcedure
    .input(z.object({ id: z.string(), data: insertDocSchema.partial() }))
    .mutation(async ({ input, ctx }) => {
      const [updated] = await ctx.db
        .update(documents)
        .set(input.data)
        .where(eq(documents.docId, input.id))
        .returning();
      return updated;
    }),

  // --- LETTERS ---
  getLetters: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(letters);
  }),
  createLetter: protectedProcedure
    .input(insertLetterSchema)
    .mutation(async ({ input, ctx }) => {
      const [newLetter] = await ctx.db.insert(letters).values(input).returning();
      return newLetter;
    }),
  updateLetter: protectedProcedure
    .input(z.object({ id: z.string(), data: insertLetterSchema.partial() }))
    .mutation(async ({ input, ctx }) => {
      const [updated] = await ctx.db
        .update(letters)
        .set(input.data)
        .where(eq(letters.letterId, input.id))
        .returning();
      return updated;
    }),

  // --- DEADLINES ---
  getDeadlines: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(deadlines);
  }),
  createDeadline: protectedProcedure
    .input(insertDeadlineSchema)
    .mutation(async ({ input, ctx }) => {
      const [newDeadline] = await ctx.db.insert(deadlines).values(input).returning();
      return newDeadline;
    }),
  updateDeadline: protectedProcedure
    .input(z.object({ id: z.string(), data: insertDeadlineSchema.partial() }))
    .mutation(async ({ input, ctx }) => {
      const [updated] = await ctx.db
        .update(deadlines)
        .set(input.data)
        .where(eq(deadlines.deadlineId, input.id))
        .returning();
      return updated;
    }),

  // --- FILINGS ---
  getFilings: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(filings);
  }),
  createFiling: protectedProcedure
    .input(insertFilingSchema)
    .mutation(async ({ input, ctx }) => {
      const [newFiling] = await ctx.db.insert(filings).values(input).returning();
      return newFiling;
    }),
  updateFiling: protectedProcedure
    .input(z.object({ id: z.string(), data: insertFilingSchema.partial() }))
    .mutation(async ({ input, ctx }) => {
      const [updated] = await ctx.db
        .update(filings)
        .set(input.data)
        .where(eq(filings.filingId, input.id))
        .returning();
      return updated;
    }),

  // --- TASKS ---
  getTasks: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(tasks);
  }),
  createTask: protectedProcedure
    .input(insertTaskSchema)
    .mutation(async ({ input, ctx }) => {
      const [newTask] = await ctx.db.insert(tasks).values(input).returning();
      return newTask;
    }),
  updateTask: protectedProcedure
    .input(z.object({ id: z.string(), data: insertTaskSchema.partial() }))
    .mutation(async ({ input, ctx }) => {
      const [updated] = await ctx.db
        .update(tasks)
        .set(input.data)
        .where(eq(tasks.taskId, input.id))
        .returning();
      return updated;
    }),

  // --- QUICK LINKS ---

  getQuickLinks: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(quickLinks).orderBy(quickLinks.order);
  }),
  createQuickLink: protectedProcedure
    .input(insertQuickLinkSchema)
    .mutation(async ({ input, ctx }) => {
      const [newLink] = await ctx.db.insert(quickLinks).values(input).returning();
      return newLink;
    }),
  deleteQuickLink: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      await ctx.db.delete(quickLinks).where(eq(quickLinks.id, input));
      return { success: true };
    }),

  // --- LIBRARY ---
  getLibrary: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(libraryDocuments).orderBy(desc(libraryDocuments.createdAt));
  }),
  createLibraryDocument: protectedProcedure
    .input(insertLibraryDocumentSchema)
    .mutation(async ({ input, ctx }) => {
      const [newDoc] = await ctx.db.insert(libraryDocuments).values(input).returning();
      return newDoc;
    }),
  deleteLibraryDocument: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      await ctx.db.delete(libraryDocuments).where(eq(libraryDocuments.id, input));
      return { success: true };
    }),
});
