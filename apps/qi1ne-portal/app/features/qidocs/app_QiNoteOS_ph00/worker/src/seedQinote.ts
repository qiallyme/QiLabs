/**
 * QiNote Sample Data Seeder
 * 
 * Creates sample QiNodes for testing and demonstration
 * Run this via a worker endpoint or as a one-time script
 */

import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabaseMind";
import { createNote } from "./qinoteApi";

export interface SeedOptions {
  workspace_id?: string | null;
  overwrite?: boolean; // If true, will delete existing sample notes first
}

/**
 * Seed sample data for QiNote
 */
export async function seedQinote(
  supabase: SupabaseClient<Database>,
  options: SeedOptions = {}
): Promise<{ created: number; errors: string[] }> {
  const { workspace_id, overwrite = false } = options;
  const errors: string[] = [];
  let created = 0;

  // Sample notes to create
  const sampleNotes = [
    {
      qid: "1.01.03.001",
      title: "Welcome to QiNote",
      body: `Welcome to QiNote! This is your personal knowledge base and note-taking system.

QiNote helps you:
- Organize your thoughts across different realms (QiOne, QiClients, QiProjects)
- Create interconnected notes with QiDecimal IDs
- Use Gina (AI assistant) to create and query notes
- Build a graph of knowledge that grows with you

This note is in the **QiOne** realm, which is your personal universe.`,
      realm: "QiOne" as const,
      orbit: "01",
      system: "Docs",
      tags: ["welcome", "getting-started"],
      meta: {
        is_sample: true,
        seed_version: "1.0.0",
      },
    },
    {
      qid: "5.01.03.001",
      title: "How QiNote Works",
      body: `QiNote is built on a few core concepts:

## Realms
- **QiOne**: Your personal universe
- **QiClients**: Client work and relationships
- **QiProjects**: Projects, apps, and builds
- **QiSystem**: Internal schemas and configs
- **QiArchive**: Archived notes
- **QiExternal**: External imports

## QiDecimal IDs (QiD)
Every note has a unique QiD like \`1.01.03.001\`:
- First digit: Realm (1=QiOne, 2=QiClients, etc.)
- Next two: Orbit (category within realm)
- Next two: System (type: Docs, Journal, Tasks, etc.)
- Last three: Sequence number

## Systems
- **Docs**: Regular notes and documents
- **Journal**: Personal journal entries
- **Tasks**: Todo items and reminders
- **Knowledge**: Reference material
- **Memory-***: Gina's AI memories

## Gina Integration
Gina can:
- Create notes from chat
- Search your notes semantically
- Classify notes into realms and systems
- Update existing notes

Try asking Gina: "Create a note about my morning routine"`,
      realm: "QiSystem" as const,
      orbit: "01",
      system: "Docs",
      tags: ["system", "documentation", "how-to"],
      meta: {
        is_sample: true,
        seed_version: "1.0.0",
      },
    },
    {
      qid: "2.01.03.001",
      title: "Sample Client Note",
      body: `This is a sample note in the **QiClients** realm.

Client notes are for:
- Client communications
- Case files
- Invoices and billing
- Legal documents
- CRM data

This note demonstrates how client-related content is organized separately from personal notes.`,
      realm: "QiClients" as const,
      orbit: "01",
      system: "Docs",
      tags: ["client", "sample"],
      meta: {
        is_sample: true,
        seed_version: "1.0.0",
        client_name: "Sample Client",
      },
    },
  ];

  // Delete existing sample notes if overwrite is true
  if (overwrite) {
    for (const note of sampleNotes) {
      try {
        await supabase
          .from("qi_nodes")
          .delete()
          .eq("qid", note.qid);
      } catch (error) {
        // Ignore errors - note might not exist
      }
    }
  }

  // Create sample notes
  for (const noteData of sampleNotes) {
    try {
      // Check if note already exists
      const { data: existing } = await supabase
        .from("qi_nodes")
        .select("qid")
        .eq("qid", noteData.qid)
        .single();

      if (existing && !overwrite) {
        // Note already exists, skipping
        continue;
      }

      // Create the note
      await createNote(supabase, {
        title: noteData.title,
        body: noteData.body,
        realm: noteData.realm,
        orbit: noteData.orbit,
        system: noteData.system,
        tags: noteData.tags,
        meta: noteData.meta,
        qid: noteData.qid, // Use explicit QiD
      }, workspace_id, "QiNote");

      created++;
      // Note created successfully
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      errors.push(`Failed to create ${noteData.qid}: ${errorMsg}`);
      console.error(`Error creating ${noteData.qid}:`, error);
    }
  }

  return { created, errors };
}

/**
 * Seed realms (if stored in DB - currently realms are hardcoded)
 * This is a placeholder for future realm management
 */
export async function seedRealms(
  supabase: SupabaseClient<Database>
): Promise<void> {
  // Realms are currently hardcoded in the classification system
  // If you add a qirealms table later, seed it here
  // Realms are currently hardcoded - no seeding needed
}

