import { ENDPOINTS } from "../contracts/qione-endpoints";
import { supabase } from "../supabase/supabase";
import type {
  ApiEnvelope,
  HealthResponse,
  InviteTenantMemberRequest,
  InviteTenantMemberResponse,
  ListTenantMembersResponse,
  MeResponse,
  SetActiveTenantRequest,
  SetActiveTenantResponse,
  TenantSummary,
} from "./types";

const API_BASE =
  (import.meta as any).env?.VITE_QIONE_GATEWAY_URL || "/api/gateway";

/**
 * Core fetcher to enforce Bearer token + normalized response envelope.
 */
async function request<T>(
  path: string,
  init: RequestInit = {}
): Promise<ApiEnvelope<T>> {
  // Fetch Supabase session token to send as Bearer authenticating payload
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;

  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers,
    });

    // Cloudflare Worker gateway is expected to always return ApiEnvelope format
    // even on HTTP error statuses, as long as it's a valid gateway response.
    const body = await res.json();
    
    // In scenarios where it's not wrapped by gateway (e.g. 502 bad gateway), catch it.
    if (!res.ok && !body.error) {
      return { data: null, error: { message: `HTTP Error ${res.status}`, code: "HTTP_ERROR" } };
    }

    return body as ApiEnvelope<T>;
  } catch (err: any) {
    return { data: null, error: { message: err.message, code: "NETWORK_ERROR" } };
  }
}

/**
 * Standard Gateway Contract API Client.
 * Implements the verified safe routes for the first integration wave.
 */
export const apiClient = {
  getHealth: () => 
    request<HealthResponse>(ENDPOINTS.HEALTH),

  getMe: () => 
    request<MeResponse>(ENDPOINTS.ME),

  listTenants: () => 
    request<TenantSummary[]>(ENDPOINTS.TENANTS),

  setActiveTenant: (body: SetActiveTenantRequest) =>
    request<SetActiveTenantResponse>(ENDPOINTS.ACTIVE_TENANT, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  listTenantMembers: (tenantId: string) =>
    request<ListTenantMembersResponse>(ENDPOINTS.TENANT_MEMBERS(tenantId)),

  inviteTenantMember: (tenantId: string, body: InviteTenantMemberRequest) =>
    request<InviteTenantMemberResponse>(ENDPOINTS.TENANT_MEMBER_INVITE(tenantId), {
      method: "POST",
      body: JSON.stringify(body),
    }),
};