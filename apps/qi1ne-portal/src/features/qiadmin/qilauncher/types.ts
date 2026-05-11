// apps/qilauncher/types.ts

export type SystemStatus = 'operational' | 'degraded' | 'down';

export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
}

export type WorkerState = 'idle' | 'working' | 'error' | 'offline' | 'processing';

export interface WorkerInfo {
  worker_id: string;
  worker_name: string;
  status: WorkerState;
  last_heartbeat: string | null;
  meta?: {
    current_task?: string;
    load_percent?: number;
    queue_depth?: number;
    [key: string]: any;
  };
}

export interface HealthStats {
  uptimePercent: number;
  cpuLoadPercent: number;
  memoryLoadPercent: number;
}

export interface QueueStats {
  pendingJobs: number;
  processedCount: number;
  failedCount: number;
}

export interface WorkersStats {
  activeNodes: number;
  totalNodes: number;
  workers: WorkerInfo[];
}

export type DeploymentStatus = 'processing' | 'completed' | 'failed';

export interface Deployment {
  id: string;
  pipeline: string;
  initiatorName: string;
  initiatorInitials: string;
  initiatorColor: 'blue' | 'amber' | 'rose';
  status: DeploymentStatus;
  duration: string;
}

export type Sender = 'user' | 'gina';

export type MessageType = 'text' | 'receipt';

export interface ChatMessage {
  id: string;
  sender: Sender;
  text: string;
  timestamp: string;
  type: MessageType;
  toolSuggestions?: ToolSuggestion[];
}

export interface ToolSuggestion {
  tool: string;
  label: string;
  args: Record<string, any>;
}

export interface GinaChatResponse {
  reply: string;
  context?: any;
  tool_suggestions?: ToolSuggestion[];
}

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

