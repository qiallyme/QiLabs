import { IRequest } from 'itty-router';
import { Env, AuthUser } from '../types';
import { createAdminClient } from './supabase';
import { fail } from './response';

export function extractBearerToken(request: IRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
}

/**
 * Returns an authenticated user or a fail response.
 */
export async function requireAuth(request: IRequest, env: Env): Promise<AuthUser | Response> {
  const token = extractBearerToken(request);
  if (!token) {
    return fail(env, 'Missing or invalid Authorization header', 'UNAUTHORIZED', 401);
  }

  const supabase = createAdminClient(env);
  
  // Actually validates JWT via Supabase endpoint or decoded payload
  // getUser() sends the JWT to Supabase to guarantee authenticity 
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  
  if (authErr || !user) {
    return fail(env, 'Invalid session', 'UNAUTHORIZED', 401);
  }

  return { id: user.id, email: user.email };
}
