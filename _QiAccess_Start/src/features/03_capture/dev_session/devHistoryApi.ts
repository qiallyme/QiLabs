import { supabase } from "../../../lib/supabase/client";
import type {
  DevHistoryRecord,
  DevHistoryRecordInsertInput,
  DevHistoryRecordUpdateInput,
} from "./devHistoryTypes";

function getSupabaseClient() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  return supabase;
}

async function requireAuthenticatedUserId() {
  const client = getSupabaseClient();
  const { data, error } = await client.auth.getUser();

  if (error) {
    throw new Error(`Unable to resolve authenticated user: ${error.message}`);
  }

  const userId = data.user?.id;
  if (!userId) {
    throw new Error("You must be signed in to save dev session history.");
  }

  return userId;
}

export async function createDevHistoryRecord(
  input: DevHistoryRecordInsertInput
): Promise<DevHistoryRecord> {
  const client = getSupabaseClient();
  const ownerId = await requireAuthenticatedUserId();

  const { data, error } = await client
    .from("dev_history")
    .insert({
      ...input,
      owner_id: ownerId,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to create dev history record: ${error.message}`);
  }

  return data as DevHistoryRecord;
}

export async function updateDevHistoryRecord(
  id: string,
  input: DevHistoryRecordUpdateInput
): Promise<DevHistoryRecord> {
  const client = getSupabaseClient();
  await requireAuthenticatedUserId();

  const { data, error } = await client
    .from("dev_history")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to update dev history record: ${error.message}`);
  }

  return data as DevHistoryRecord;
}

export async function listRecentDevHistoryRecords(limit = 12): Promise<DevHistoryRecord[]> {
  const client = getSupabaseClient();
  const ownerId = await requireAuthenticatedUserId();

  const { data, error } = await client
    .from("dev_history")
    .select("*")
    .eq("owner_id", ownerId)
    .neq("status", "archived")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Unable to load recent dev history: ${error.message}`);
  }

  return (data ?? []) as DevHistoryRecord[];
}

export async function archiveDevHistoryRecord(id: string): Promise<DevHistoryRecord> {
  return updateDevHistoryRecord(id, { status: "archived" });
}
