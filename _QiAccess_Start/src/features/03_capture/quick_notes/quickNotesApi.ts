import { supabase } from "../../../lib/supabase/client";
import type { QuickNoteInsert } from "./quickNotesTypes";

export async function createQuickNote(input: QuickNoteInsert) {
  const { data, error } = await supabase
    .from("quick_notes")
    .insert({
      capture_type: "general",
      source: "quick_capture",
      tags: [],
      ...input,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateQuickNote(
  id: string,
  input: Partial<Omit<QuickNoteInsert, "owner_id">>
) {
  const { data, error } = await supabase
    .from("quick_notes")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function listQuickNotes() {
  const { data, error } = await supabase
    .from("quick_notes")
    .select("*")
    .eq("is_archived", false)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function archiveQuickNote(id: string) {
  const { data, error } = await supabase
    .from("quick_notes")
    .update({ is_archived: true })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
