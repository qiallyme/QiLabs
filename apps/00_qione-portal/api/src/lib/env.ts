import { Env } from '../types';

export function validateEnv(env: Env) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing critical Supabase environment variables in Gateway.');
  }
}
