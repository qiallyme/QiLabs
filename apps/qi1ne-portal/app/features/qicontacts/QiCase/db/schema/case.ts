import { sql, relations } from "drizzle-orm";
import { pgTable, text, timestamp, integer, uuid, boolean, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// 0. CASE METADATA (Singleton or Multi-case)
export const cases = pgTable("cases", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  caseName: text("case_name").notNull(),
  caseNumber: text("case_number"),
  court: text("court"),
  judge: text("judge"),
  opposingCounsel: text("opposing_counsel"),
  status: text("status", { enum: ["Active", "Closed", "Archived"] }).default("Active"),
  description: text("description"),
});

// 1. CASE_PHASES
export const casePhases = pgTable("case_phases", {
  phaseId: text("phase_id").primaryKey(), // Pattern like C-01
  phaseName: text("phase_name").notNull(),
  status: text("status", { enum: ["CLOSED", "ACTIVE", "PENDING", "OPTIONAL"] }).notNull(),
  purpose: text("purpose").notNull(),
  notes: text("notes"),
  order: integer("order").notNull(),
});

// 2. ISSUES
export const issues = pgTable("issues", {
  issueId: text("issue_id").primaryKey(), // Pattern like ISS-01-001
  phaseId: text("phase_id").notNull().references(() => casePhases.phaseId),
  lane: text("lane"), // nullable; REQUIRED for FCRA
  issueTitle: text("issue_title").notNull(),
  issueStatement: text("issue_statement").notNull(),
  elementsToProve: text("elements_to_prove").array(), // String array
  strength: integer("strength"), // 1-5
  status: text("status", { enum: ["Open", "Proved", "Dismissed", "Pending"] }).notNull(),
});

// 3. EVENTS
export const events = pgTable("events", {
  eventId: text("event_id").primaryKey(),
  phaseId: text("phase_id").notNull().references(() => casePhases.phaseId),
  lane: text("lane"),
  date: timestamp("date", { withTimezone: true, mode: "date" }).notNull(),
  eventType: text("event_type").notNull(),
  description: text("description").notNull(),
});

// 4. DOCUMENTS (Exhibits)
export const documents = pgTable("documents", {
  docId: text("doc_id").primaryKey(),
  docCode: text("doc_code").notNull().unique(), // Immutable key (D-####)
  phaseId: text("phase_id").notNull().references(() => casePhases.phaseId),
  lane: text("lane"),
  docType: text("doc_type").notNull(),
  date: timestamp("date", { withTimezone: true, mode: "date" }), // Date of the document itself
  originalFilename: text("original_filename"),
  drivePath: text("drive_path").notNull(),
  createdDateSource: text("created_date_source"), // EXTRACTED / FS_CREATED / UNKNOWN
  ocrAvailable: boolean("ocr_available").default(false),
  ocrTextPath: text("ocr_text_path"),
  confidenceScore: integer("confidence_score"),
  proofType: text("proof_type", { enum: ["Direct", "Circumstantial", "Corroborating"] }).notNull(),
});

// 5. LETTERS
export const letters = pgTable("letters", {
  letterId: text("letter_id").primaryKey(),
  phaseId: text("phase_id").notNull().references(() => casePhases.phaseId),
  lane: text("lane"),
  letterType: text("letter_type", { enum: ["Dispute", "Preservation", "Demand", "ADA Notice", "Other"] }).notNull(),
  direction: text("direction", { enum: ["Inbound", "Outbound"] }).notNull(),
  recipient: text("recipient").notNull(),
  method: text("method", { enum: ["Certified Mail", "Email", "Fax", "Process Server"] }).notNull(),
  dateSent: timestamp("date_sent", { withTimezone: true, mode: "date" }),
  proofOfService: boolean("proof_of_service").default(false).notNull(),
  status: text("status", { enum: ["Draft", "Sent", "Delivered", "Failed", "Responded"] }).notNull(),
});

// 6. DEADLINES
export const deadlines = pgTable("deadlines", {
  deadlineId: text("deadline_id").primaryKey(),
  phaseId: text("phase_id").notNull().references(() => casePhases.phaseId),
  lane: text("lane"),
  trigger: text("trigger").notNull(), // Refers to Event or Letter
  clockType: text("clock_type", { enum: ["Hard Statutory", "Procedural", "Administrative", "Soft"] }).notNull(),
  startDate: timestamp("start_date", { withTimezone: true, mode: "date" }).notNull(),
  dueDate: timestamp("due_date", { withTimezone: true, mode: "date" }).notNull(),
  status: text("status", { enum: ["Pending", "Met", "Missed", "Extended"] }).notNull(),
  consequence: text("consequence").notNull(),
});

// 7. FILINGS
export const filings = pgTable("filings", {
  filingId: text("filing_id").primaryKey(),
  phaseId: text("phase_id").notNull().references(() => casePhases.phaseId),
  title: text("title").notNull(),
  forum: text("forum").notNull(),
  dateFiled: timestamp("date_filed", { withTimezone: true, mode: "date" }),
  status: text("status", { enum: ["Filed", "Rejected", "Pending", "Accepted"] }).notNull(),
});

// 8. TASKS
export const tasks = pgTable("tasks", {
  taskId: text("task_id").primaryKey(),
  phaseId: text("phase_id").notNull().references(() => casePhases.phaseId),
  lane: text("lane"),
  taskTitle: text("task_title").notNull(),
  date: timestamp("date", { withTimezone: true, mode: "date" }), // Due date or scheduled date
  produces: text("produces").notNull(), // File / Letter / Filing
  servesDeadlineId: text("serves_deadline_id"), // FK to deadlines
  status: text("status", { enum: ["To Do", "In Progress", "Blocked", "Done"] }).notNull(),
});

// 9. MASTER INDEX (qidcli)
export const masterIndex = pgTable("master_index", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`), // Internal UUID
  qid: text("qid").notNull().unique(), // The CLI ID (User Facing)
  category: text("category").notNull(), 
  title: text("title").notNull(),
  description: text("description"),
  
  // Polymorphic Relationships
  relatedId: text("related_id"), // Corresponds to UUID from other tables
  relatedTable: text("related_table"), // Table name reference
  
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
});

// 10. JUNCTION TABLES
export const documentIssues = pgTable("document_issues", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  docCode: text("doc_code").notNull().references(() => documents.docCode),
  issueId: text("issue_id").notNull().references(() => issues.issueId),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
});

export const documentEvents = pgTable("document_events", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  docCode: text("doc_code").notNull().references(() => documents.docCode),
  eventId: text("event_id").notNull().references(() => events.eventId),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
});

export const quickLinks = pgTable("quick_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  category: text("category").default("General"),
  icon: text("icon"), 
  description: text("description"),
  order: integer("order").default(0),
});

export const libraryDocuments = pgTable("library_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  source: text("source"), 
  documentType: text("document_type").default("PDF"), 
  content: text("content"), 
  filePath: text("file_path"),
  url: text("url"),
  tags: text("tags").array(), 
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
});

// Relations
export const casePhaseRelations = relations(casePhases, ({ many }) => ({
  issues: many(issues),
  events: many(events),
  documents: many(documents),
  letters: many(letters),
  deadlines: many(deadlines),
  filings: many(filings),
  tasks: many(tasks),
}));

export const issueRelations = relations(issues, ({ one, many }) => ({
  phase: one(casePhases, {
    fields: [issues.phaseId],
    references: [casePhases.phaseId],
  }),
  documentIssues: many(documentIssues),
}));

export const eventRelations = relations(events, ({ one, many }) => ({
  phase: one(casePhases, {
    fields: [events.phaseId],
    references: [casePhases.phaseId],
  }),
  documentEvents: many(documentEvents),
}));

export const documentRelations = relations(documents, ({ one, many }) => ({
  phase: one(casePhases, {
    fields: [documents.phaseId],
    references: [casePhases.phaseId],
  }),
  documentIssues: many(documentIssues),
  documentEvents: many(documentEvents),
}));

// ZOD SCHEMAS
export const insertPhaseSchema = createInsertSchema(casePhases);
export const insertIssueSchema = createInsertSchema(issues);
export const insertEventSchema = createInsertSchema(events);
export const insertDocSchema = createInsertSchema(documents);
export const insertLetterSchema = createInsertSchema(letters);
export const insertDeadlineSchema = createInsertSchema(deadlines);
export const insertFilingSchema = createInsertSchema(filings);
export const insertTaskSchema = createInsertSchema(tasks);
export const insertCaseSchema = createInsertSchema(cases);
export const insertMasterIndexSchema = createInsertSchema(masterIndex);
export const insertQuickLinkSchema = createInsertSchema(quickLinks);
export const insertLibraryDocumentSchema = createInsertSchema(libraryDocuments);

// TYPES
export type Case = typeof cases.$inferSelect;
export type InsertCase = z.infer<typeof insertCaseSchema>;

export type CasePhase = typeof casePhases.$inferSelect;
export type InsertPhase = z.infer<typeof insertPhaseSchema>;

export type Issue = typeof issues.$inferSelect;
export type InsertIssue = z.infer<typeof insertIssueSchema>;

export type CaseEvent = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDoc = z.infer<typeof insertDocSchema>;

export type Letter = typeof letters.$inferSelect;
export type InsertLetter = z.infer<typeof insertLetterSchema>;

export type Deadline = typeof deadlines.$inferSelect;
export type InsertDeadline = z.infer<typeof insertDeadlineSchema>;

export type Filing = typeof filings.$inferSelect;
export type InsertFiling = z.infer<typeof insertFilingSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type MasterIndex = typeof masterIndex.$inferSelect;
export type InsertMasterIndex = z.infer<typeof insertMasterIndexSchema>;

export type DocIssue = typeof documentIssues.$inferSelect;
export type DocEvent = typeof documentEvents.$inferSelect;

export type QuickLink = typeof quickLinks.$inferSelect;
export type InsertQuickLink = z.infer<typeof insertQuickLinkSchema>;

export type LibraryDocument = typeof libraryDocuments.$inferSelect;
export type InsertLibraryDocument = z.infer<typeof insertLibraryDocumentSchema>;
