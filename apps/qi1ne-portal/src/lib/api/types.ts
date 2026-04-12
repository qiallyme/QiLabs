export type ApiEnvelope<T> = {
  data: T | null;
  error: { message: string; code: string } | null;
};

export type Role = "owner" | "admin" | "manager" | "member" | "viewer";
export type MemberStatus = "active" | "invited" | "disabled";

export interface UserSummary {
  id: string;
  email: string;
  displayName: string | null;
}

export interface TenantSummary {
  id: string;
  slug: string;
  name: string;
  role: Role;
  isActive?: boolean;
}

export interface MeResponse {
  user: UserSummary;
  activeTenant: TenantSummary | null;
  tenants: TenantSummary[];
}

export interface SetActiveTenantRequest {
  tenantId: string;
}

// Kept empty since it normally doesn't return data, or we just return ok: true.
// but based on API returning empty, we can just use ApiEnvelope<void>
export interface SetActiveTenantResponse {
  success: boolean;
}

export interface TenantMember {
  memberId: string;
  userId: string | null;
  email: string;
  displayName: string | null;
  role: Role;
  status: MemberStatus;
  invitedAt?: string | null;
  joinedAt?: string | null;
}

export interface ListTenantMembersResponse {
  items: TenantMember[];
}

export interface InviteTenantMemberRequest {
  email: string;
  role: Role;
}

export interface InviteTenantMemberResponse {
  success: boolean;
  member?: TenantMember;
}

export interface HealthResponse {
  status: string;
  timestamp: number;
}