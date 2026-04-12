/**
 * Database Client Configuration
 * 
 * This module provides database connections for the application.
 * 
 * CURRENT STACK:
 * - Supabase (Postgres) for existing implementations
 * 
 * TARGET STACK (Active Development):
 * - Railway Postgres (canonical metadata & system of record)
 * - Railway Redis (queues, cache, ephemeral state)
 * - Railway Neo4j (knowledge graph)
 * - NocoDB on Railway (admin & ops surface)
 * - pgvector in Postgres (vector retrieval)
 * 
 * This abstraction allows swapping implementations without changing consuming code.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export function createSupabaseClient(): SupabaseClient {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || (import.meta.env as any).NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || (import.meta.env as any).NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return createClient(supabaseUrl, supabaseAnonKey);
}

export const db = createSupabaseClient();
