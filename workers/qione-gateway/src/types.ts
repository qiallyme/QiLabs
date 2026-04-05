export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  ALLOWED_ORIGIN?: string;
}

export interface AuthUser {
  id: string;
  email?: string;
}

export interface AuthContext {
  user: AuthUser;
}

export interface ApiEnvelope<T = any> {
  data: T | null;
  error: {
    message: string;
    code: string;
  } | null;
}
