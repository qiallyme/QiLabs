import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

// These environment variables would be in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Helper to get the current user's case context.
 * Useful for verifying if a user owns the case they are trying to access.
 */
export async function getCaseContext(caseId: string, userId: string) {
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('id', caseId)
    .eq('user_id', userId)
    .single();

  if (error) throw new Error('Case not found or access denied');
  return data;
}