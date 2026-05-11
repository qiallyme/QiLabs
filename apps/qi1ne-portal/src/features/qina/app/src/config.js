// QiOS Launcher Configuration
// Default to local dev, override with environment variable or manual input

export const DEFAULT_ORCHESTRATOR_URL = 
  import.meta.env.VITE_ORCHESTRATOR_URL || 
  'http://localhost:8787'

export const REFRESH_INTERVAL = 5000 // 5 seconds

export const API_ENDPOINTS = {
  health: '/health',
  queue: '/queue',
  workers: '/workers',
  errors: '/errors',
  fileHistory: '/file_history',
  workflowGraph: '/workflow_graph',
}

