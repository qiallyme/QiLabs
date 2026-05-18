import { createClient } from "@supabase/supabase-js";

export type SupabaseConfig = {
  url: string;
  anonKey: string;
};

export function getSupabaseConfig(): SupabaseConfig | null {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

const config = getSupabaseConfig();

if (!config) {
  console.warn("Missing Supabase environment variables. Features requiring a database will not work.");
}

export const supabase = config 
  ? createClient(config.url, config.anonKey) 
  : null as any; // Allow app to load even if misconfigured, though calls will fail
