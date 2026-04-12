import { Router, IRequest } from 'itty-router';
import { Env, AuthUser } from './types';
import { ok, fail, corsOptions } from './lib/response';
import { validateEnv } from './lib/env';
import { requireAuth } from './lib/auth';
import { requireTenantMembership, requireTenantAdmin } from './lib/tenant';
import { createAdminClient } from './lib/supabase';

const router = Router();

// --- CORS & HEALTH ---
router.options('*', (request: IRequest, env: Env) => corsOptions(env));

router.get('/health', (request: IRequest, env: Env) => {
  return ok(env, { status: 'ok', timestamp: Date.now() });
});

// --- AUTH / ME ---
router.get('/v1/me', async (request: IRequest, env: Env) => {
  const auth = await requireAuth(request, env);
  if (auth instanceof Response) return auth;
  
  return ok(env, { id: auth.id, email: auth.email });
});

// --- TENANTS ---
router.get('/v1/tenants', async (request: IRequest, env: Env) => {
  const auth = await requireAuth(request, env);
  if (auth instanceof Response) return auth;
  
  const supabase = createAdminClient(env);
  
  const { data, error: dbError } = await supabase
    .from('tenant_members')
    .select('tenant:tenant_id(id, name, slug)')
    .eq('user_id', auth.id);
    
  if (dbError) return fail(env, dbError.message, 'DB_ERROR');
  return ok(env, data?.map(d => d.tenant) || []);
});

router.post('/v1/tenants/active', async (request: IRequest, env: Env) => {
  const auth = await requireAuth(request, env);
  if (auth instanceof Response) return auth;

  const body = await request.json().catch(() => ({}));
  if (!body.tenantId) return fail(env, 'Missing tenantId', 'BAD_REQUEST', 400);

  const isMember = await requireTenantMembership(body.tenantId, auth.id, env);
  if (!isMember) return fail(env, 'Unauthorized for this tenant', 'FORBIDDEN', 403);

  // Use a user_profiles table if it exists, otherwise return a logic placeholder
  const supabase = createAdminClient(env);
  
  // Persist the active tenant conceptually (assuming table user_profiles exists)
  const { error: profileErr } = await supabase
    .from('user_profiles')
    .upsert({ id: auth.id, active_tenant_id: body.tenantId }, { onConflict: 'id' });

  if (profileErr) {
    if (profileErr.code === '42P01') { 
      // table doesn't exist yet, we still return OK conceptually
      return ok(env, { success: true, warning: 'user_profiles table missing, tenant session is volatile.' });
    }
    return fail(env, profileErr.message, 'DB_ERROR');
  }

  return ok(env, { success: true });
});


// --- ADMIN / MEMBERS ---
router.get('/v1/admin/tenants/:tenantId/members', async (request: IRequest, env: Env) => {
  const auth = await requireAuth(request, env);
  if (auth instanceof Response) return auth;
  
  const tenantId = request.params.tenantId;
  const isAdmin = await requireTenantAdmin(tenantId, auth.id, env);
  if (!isAdmin) return fail(env, 'Requires tenant admin or owner role', 'FORBIDDEN', 403);

  const supabase = createAdminClient(env);
  const { data, error: dbError } = await supabase
    .from('tenant_members')
    .select('*')
    .eq('tenant_id', tenantId);

  if (dbError) return fail(env, dbError.message, 'DB_ERROR');
  return ok(env, data);
});

router.post('/v1/admin/tenants/:tenantId/members/invite', async (request: IRequest, env: Env) => {
  const auth = await requireAuth(request, env);
  if (auth instanceof Response) return auth;
  
  const tenantId = request.params.tenantId;
  const isAdmin = await requireTenantAdmin(tenantId, auth.id, env);
  if (!isAdmin) return fail(env, 'Requires tenant admin or owner role', 'FORBIDDEN', 403);

  const body = await request.json().catch(() => ({}));
  if (!body.email || !body.role) {
    return fail(env, 'Missing email or role', 'BAD_REQUEST', 400);
  }

  if (!['admin', 'member', 'viewer'].includes(body.role)) {
    return fail(env, 'Invalid role assignment', 'BAD_REQUEST', 400);
  }

  const supabase = createAdminClient(env);
  const { data, error: rpcError } = await supabase.rpc('qione_admin_invite_tenant_member', { 
    p_tenant_id: tenantId,
    p_email: body.email,
    p_role: body.role,
    p_invited_by: auth.id
  });

  if (rpcError) {
    return fail(env, rpcError.message, 'RPC_ERROR');
  }

  return ok(env, data);
});


// 404 Fallback
router.all('*', (request: IRequest, env: Env) => fail(env, 'Route not found', 'NOT_FOUND', 404));

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      validateEnv(env);
      return await router.handle(request, env, ctx);
    } catch (err: any) {
      console.error('Gateway Error:', err);
      // Fallback manual Response to prevent crashes if `fail()` dependencies blow up
      return new Response(JSON.stringify({
        data: null,
        error: { message: err.message || 'Internal Gateway Error', code: 'GATEWAY_CRASH' }
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
  },
};
