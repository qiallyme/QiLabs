// apps/qilauncher/api/client.ts
const API_BASE = import.meta.env.VITE_QIOS_LOCAL_CORE_URL || "http://localhost:7130";
import type {
  SystemStatus,
  HealthStats,
  QueueStats,
  WorkersStats,
  Deployment,
  ChatMessage,
  WorkerState,
} from '../types';

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

export const QiLauncherClient = {
  getHealth: async (): Promise<{ status: string; db_path: string }> => {
    return fetchAPI('/health');
  },

  getQueueStats: async (): Promise<QueueStats> => {
    // Backend returns flat object: { pending, processing, complete, error }
    const data = await fetchAPI<{ pending?: number; processing?: number; complete?: number; error?: number }>('/queue');
    return {
      pendingJobs: data.pending || 0,
      processedCount: data.complete || 0,
      failedCount: data.error || 0,
    };
  },

  getWorkers: async (): Promise<WorkersStats> => {
    const data = await fetchAPI<{ 
      workers: Array<{ 
        worker_id: string; 
        worker_name: string; 
        status: string; 
        last_heartbeat: string | null;
        meta?: any;
      }> 
    }>('/workers');
    
    // Defensive check: ensure workers is an array
    if (!data || !Array.isArray(data.workers)) {
      console.error('[getWorkers] Invalid workers data structure:', data);
      return {
        activeNodes: 0,
        totalNodes: 0,
        workers: [],
      };
    }
    
    const activeWorkers = data.workers.filter(w => {
      if (!w || !w.status) return false;
      const status = w.status.toLowerCase();
      
      // Filter out explicitly offline workers
      if (status === 'offline') return false;
      
      // Consider workers with recent heartbeats as active (even if status is "error")
      // Workers with "error" status are still running and trying to recover
      if (w.last_heartbeat) {
        const heartbeatTime = new Date(w.last_heartbeat).getTime();
        const now = Date.now();
        const ageMs = now - heartbeatTime;
        // Consider active if heartbeat is less than 2 minutes old
        if (ageMs < 2 * 60 * 1000) {
          return true;
        }
      }
      
      // If no heartbeat, only consider "idle" or "working" as active
      return status === 'idle' || status === 'working';
    });
    
    const result = {
      activeNodes: activeWorkers.length,
      totalNodes: data.workers.length,
      workers: data.workers.map(w => ({
        worker_id: w.worker_id || `local_${w.worker_name?.toLowerCase().replace(/\s+/g, '_') || 'unknown'}`,
        worker_name: w.worker_name || 'Unknown Worker',
        status: (w.status?.toLowerCase() || 'idle') as WorkerState,
        last_heartbeat: w.last_heartbeat || null,
        meta: w.meta || {},
      })),
    };
    
    return result;
  },

  getDeployments: async (): Promise<Deployment[]> => {
    // Placeholder - backend doesn't have /deployments yet
    try {
      return await fetchAPI<Deployment[]>('/deployments');
    } catch {
      return [];
    }
  },

  sendGinaMessage: async (messages: Array<{ role: string; content: string }>): Promise<{ reply: string; tool_suggestions?: Array<{ tool: string; label: string; args: Record<string, any> }> }> => {
    const data = await fetchAPI<{ reply: string; context?: any; tool_suggestions?: Array<{ tool: string; label: string; args: Record<string, any> }> }>('/gina/chat', {
      method: 'POST',
      body: JSON.stringify({ messages }),
    });
    return {
      reply: data.reply,
      tool_suggestions: data.tool_suggestions || [],
    };
  },

  invokeTool: async (tool: string, args: Record<string, any>): Promise<{ ok: boolean; result?: any; error?: string }> => {
    const data = await fetchAPI<{ ok: boolean; tool: string; result?: any; error?: string }>('/tools/invoke', {
      method: 'POST',
      body: JSON.stringify({ tool, args }),
    });
    return data;
  },

  getIntegrationsStatus: async (): Promise<{ integrations: Record<string, any> }> => {
    return fetchAPI('/integrations/status');
  },

  // Jobs API
  getJobs: async (limit: number = 20, jobType?: string): Promise<Job[]> => {
    const params = new URLSearchParams();
    params.set('limit', limit.toString());
    if (jobType) params.set('job_type', jobType);
    return fetchAPI(`/jobs?${params.toString()}`);
  },

  getJob: async (jobId: number): Promise<Job> => {
    return fetchAPI(`/jobs/${jobId}`);
  },

  createJob: async (jobType: string, params?: Record<string, any>): Promise<Job> => {
    return fetchAPI('/jobs', {
      method: 'POST',
      body: JSON.stringify({ job_type: jobType, params }),
    });
  },

  // Ingestion Queue API
  getIngestionQueue: async (limit: number = 50, status?: string): Promise<IngestionItem[]> => {
    const params = new URLSearchParams();
    params.set('limit', limit.toString());
    if (status) params.set('status', status);
    const data = await fetchAPI<{ items: IngestionItem[]; count: number }>(`/queue/items?${params.toString()}`);
    return data.items || [];
  },
};

// Types for Jobs
export interface Job {
  id: number;
  job_type: string;
  status: 'pending' | 'running' | 'complete' | 'failed' | 'cancelled';
  params?: Record<string, any>;
  result?: Record<string, any>;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
}

// Types for Ingestion Queue
export interface IngestionItem {
  id: string;
  file_path: string;
  slug: string;
  realm?: string;
  status: string;
  created_at: string;
  updated_at: string;
  error?: string;
}

