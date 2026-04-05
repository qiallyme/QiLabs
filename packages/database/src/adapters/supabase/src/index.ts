import { createClient } from '@supabase/supabase-js';
import type { Database } from '@q1/schemas';

/**
 * The Centralized Supabase Client.
 * Automatically typed with the Monorepo's shared database schema.
 */
export const createQiondriaClient = (url: string, key: string) => {
    return createClient<Database>(url, key);
};

export type { Database };
