// Use relative path in production (single-origin), full URL in development
const API_BASE = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? "/api" : "http://localhost:3001/api");

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || response.statusText);
  }

  return response.json();
}

export const api = {
  auth: {
    startMagicLink: (email: string) =>
      request("/auth/magic/start", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
    getMe: () => request("/auth/me"),
    signOut: () =>
      request("/auth/signout", { method: "POST" }),
  },
  spaces: {
    create: (data: { name: string; baseCurrency: string; icon?: string }) =>
      request("/spaces", { method: "POST", body: JSON.stringify(data) }),
    list: () => request("/spaces"),
    get: (id: string) => request(`/spaces/${id}`),
    createInvite: (spaceId: string, role: string) =>
      request(`/spaces/${spaceId}/invites`, {
        method: "POST",
        body: JSON.stringify({ role }),
      }),
    join: (token: string, displayName?: string) =>
      request("/spaces/join", {
        method: "POST",
        body: JSON.stringify({ token, displayName }),
      }),
    getMembers: (spaceId: string) => request(`/spaces/${spaceId}/members`),
  },
  expenses: {
    create: (spaceId: string, data: any) =>
      request(`/spaces/${spaceId}/expenses`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    list: (spaceId: string, limit?: number, cursor?: string) => {
      const params = new URLSearchParams();
      if (limit) params.set("limit", limit.toString());
      if (cursor) params.set("cursor", cursor);
      return request(`/spaces/${spaceId}/expenses?${params}`);
    },
    get: (expenseId: string) => request(`/expenses/${expenseId}`),
    update: (expenseId: string, data: any) =>
      request(`/expenses/${expenseId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
  },
  settlements: {
    create: (spaceId: string, data: any) =>
      request(`/spaces/${spaceId}/settlements`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    list: (spaceId: string) => request(`/spaces/${spaceId}/settlements`),
  },
  balances: {
    get: (spaceId: string) => request(`/spaces/${spaceId}/balances`),
    getSettlePlan: (spaceId: string) =>
      request(`/spaces/${spaceId}/settle-plan`, { method: "POST" }),
  },
  fx: {
    getRate: (base: string, to: string) =>
      request(`/fx/latest?base=${base}&to=${to}`),
  },
  exports: {
    downloadCSV: (spaceId: string) =>
      `${API_BASE}/spaces/${spaceId}/export.csv`,
    shareSettleSummary: (spaceId: string) =>
      request(`/spaces/${spaceId}/share-settle`, { method: "POST" }),
  },
};
