export const ENDPOINTS = {
  HEALTH: "/health",
  ME: "/v1/me",
  TENANTS: "/v1/tenants",
  ACTIVE_TENANT: "/v1/tenants/active",

  TENANT_MEMBERS: (tenantId: string) => `/v1/admin/tenants/${tenantId}/members`,
  TENANT_MEMBER_INVITE: (tenantId: string) => `/v1/admin/tenants/${tenantId}/members/invite`,
  TENANT_MEMBER_DETAIL: (tenantId: string, memberId: string) =>
    `/v1/admin/tenants/${tenantId}/members/${memberId}`,

  WORKER_HEALTH: "/v1/admin/worker-health",
  QUEUE_STATUS: "/v1/admin/queue-status",
  FLEET_JOBS: "/v1/admin/fleet-jobs",
  DEVICES: "/v1/admin/devices",
  WATCH_ASSIGNMENTS: "/v1/admin/watch-assignments",

  ARCHIVE_REGISTER: "/v1/archive/register",
  DOCUMENT_SEARCH: "/v1/documents/search",
  ARCHIVE_UPLOAD: "/v1/archive/upload",
  ARCHIVE_FAILURES: "/v1/archive/failures",

  CASES: "/v1/cases",
  CASE_DETAIL: (caseId: string) => `/v1/cases/${caseId}`,
  CONTACTS: "/v1/cases/contacts",
  CLIENTS: "/v1/cases/clients",
} as const;