import { createClient } from "@supabase/supabase-js";

export function sb(url: string, key: string) {
  return createClient(url, key);
}

export async function heartbeat(env: any, worker_id: string, state: string, meta: any = {}) {
  const supa = sb(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  await supa.from("worker_status").update({
    state,
    meta,
    last_heartbeat: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq("worker_id", worker_id);
}

export async function fail(env: any, worker_id: string, code: string, message: string, meta: any = {}) {
  const supa = sb(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  await supa.from("worker_status").update({
    state: "red",
    last_error_code: code,
    last_error_message: message,
    meta,
    updated_at: new Date().toISOString(),
  }).eq("worker_id", worker_id);
}

