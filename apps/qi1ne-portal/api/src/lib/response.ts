import { ApiEnvelope, Env } from '../types';

function getCorsHeaders(env: Env) {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-tenant-id',
  };
}

export const ok = <T>(env: Env, data: T, status = 200) => {
  const body: ApiEnvelope<T> = { data, error: null };
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...getCorsHeaders(env) },
  });
};

export const fail = (env: Env, message: string, code = 'INTERNAL_ERROR', status = 500) => {
  const body: ApiEnvelope<null> = { data: null, error: { message, code } };
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...getCorsHeaders(env) },
  });
};

export const corsOptions = (env: Env) => {
  return new Response(null, { status: 204, headers: getCorsHeaders(env) });
};
