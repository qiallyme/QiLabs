import { createClient } from '@supabase/supabase-js';
import { Env } from '../types';

/**
 * Creates a privileged Supabase client for admin operations.
 * DO NOT LEAK TO BROWSER.
 */
export const createAdminClient = (env: Env) => {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  });
};
