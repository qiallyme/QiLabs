import { Env } from '../types';
import { createAdminClient } from './supabase';

/**
 * Validates a user belongs to a tenant in ANY capacity
 */
export async function requireTenantMembership(
  tenantId: string, 
  userId: string, 
  env: Env
): Promise<boolean> {
  const supabase = createAdminClient(env);
  
  const { data, error } = await supabase
    .from('tenant_members')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) {
    return false;
  }
  return true;
}

/**
 * Validates a user is owner/admin for a tenant
 */
export async function requireTenantAdmin(
  tenantId: string, 
  userId: string, 
  env: Env
): Promise<boolean> {
  const supabase = createAdminClient(env);
  
  const { data, error } = await supabase
    .from('tenant_members')
    .select('role')
    .eq('tenant_id', tenantId)
    .eq('user_id', userId)
    .in('role', ['admin', 'owner'])
    .maybeSingle();

  if (error || !data) {
    return false;
  }
  return true;
}
