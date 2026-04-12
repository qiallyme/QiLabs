// apps/qilauncher/api/adminClient.ts
const API_BASE = "http://localhost:7130";

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text().catch(() => 'Unknown error');
    throw new Error(`API error: ${response.status} ${error}`);
  }

  return response.json();
}

export interface SystemStatus {
  appVersion: string;
  uptimeSeconds: number;
  database: {
    status: 'Connected' | 'Disconnected';
    records: number;
    latencyMs: number;
    health: 'healthy' | 'degraded' | 'down';
  };
  disk: {
    usedPercent: number;
    label: string;
    totalBytes: number;
    freeBytes: number;
  };
  worker: {
    isActive: boolean;
    currentTask: string;
    queueDepth: number;
  };
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'INFO' | 'DEBUG' | 'SUCCESS' | 'WARN' | 'ERROR';
  message: string;
}

export type AdminActionType = 'REBUILD_INDEX' | 'RESCAN_VAULT' | 'CLEAR_LOGS';

export const AdminClient = {
  getSystemStatus: async (): Promise<SystemStatus> => {
    // Map /health to SystemStatus format
    const health = await fetchAPI<{ status: string; db_path: string }>('/health');
    // Queue returns: { pending, processing, complete, error }
    const queue = await fetchAPI<{ pending?: number; processing?: number; complete?: number; error?: number }>('/queue');
    // Workers returns: { workers: [...] }
    const workers = await fetchAPI<{ workers: Array<any> }>('/workers');
    
    // Calculate total queue items
    const queueTotal = (queue.pending || 0) + (queue.processing || 0) + (queue.complete || 0) + (queue.error || 0);
    
    return {
      appVersion: 'v1.0.0-local',
      uptimeSeconds: 0, // TODO: track uptime
      database: {
        status: health.status === 'ok' ? 'Connected' : 'Disconnected',
        records: queueTotal,
        latencyMs: 0,
        health: health.status === 'ok' ? 'healthy' : 'down',
      },
      disk: {
        usedPercent: 0,
        label: 'N/A',
        totalBytes: 0,
        freeBytes: 0,
      },
      worker: {
        isActive: (workers.workers?.length || 0) > 0,
        currentTask: 'idle',
        queueDepth: queueTotal,
      },
    };
  },

  getLogs: async (): Promise<LogEntry[]> => {
    try {
      return await fetchAPI<LogEntry[]>('/logs');
    } catch {
      return [];
    }
  },

  triggerAction: async (actionType: AdminActionType): Promise<{ success: boolean; message: string }> => {
    try {
      return await fetchAPI<{ success: boolean; message: string }>('/action', {
        method: 'POST',
        body: JSON.stringify({ action: actionType }),
      });
    } catch (error: any) {
      return { success: false, message: error.message || 'Action failed' };
    }
  },
};

