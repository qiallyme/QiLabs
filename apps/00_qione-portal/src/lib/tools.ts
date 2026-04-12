export interface Tool {
  id: string
  name: string
  description: string
  icon: string
  url: string
  color: string
  category: 'productivity' | 'development' | 'database' | 'ai' | 'admin' | 'storage'
  external?: boolean
}

export const tools: Tool[] = [
  // Productivity
  {
    id: 'notion',
    name: 'Notion',
    description: 'Notes & Docs',
    icon: 'book',
    url: 'https://notion.so',
    color: 'bg-black',
    category: 'productivity',
    external: true,
  },
  {
    id: 'linear',
    name: 'Linear',
    description: 'Issue Tracking',
    icon: 'check-circle',
    url: 'https://linear.app',
    color: 'bg-purple-600',
    category: 'productivity',
    external: true,
  },
  {
    id: 'calendar',
    name: 'Calendar',
    description: 'Schedule & Events',
    icon: 'calendar',
    url: '/calendar',
    color: 'bg-blue-500',
    category: 'productivity',
  },
  
  // Development
  {
    id: 'github',
    name: 'GitHub',
    description: 'Code Repository',
    icon: 'git-branch',
    url: 'https://github.com',
    color: 'bg-gray-800',
    category: 'development',
    external: true,
  },
  {
    id: 'vscode',
    name: 'VS Code',
    description: 'Code Editor',
    icon: 'code',
    url: 'vscode://file',
    color: 'bg-blue-600',
    category: 'development',
    external: true,
  },
  {
    id: 'terminal',
    name: 'Terminal',
    description: 'Command Line',
    icon: 'terminal',
    url: 'terminal://',
    color: 'bg-gray-700',
    category: 'development',
    external: true,
  },
  
  // Database & Storage
  {
    id: 'supabase',
    name: 'Supabase',
    description: 'Database & Auth',
    icon: 'database',
    url: 'https://supabase.com/dashboard',
    color: 'bg-green-500',
    category: 'database',
    external: true,
  },
  {
    id: 'railway',
    name: 'Railway',
    description: 'Backend Hosting',
    icon: 'train',
    url: 'https://railway.app/dashboard',
    color: 'bg-gray-900',
    category: 'database',
    external: true,
  },
  {
    id: 'neon',
    name: 'Neon',
    description: 'Serverless Postgres',
    icon: 'database',
    url: 'https://neon.tech',
    color: 'bg-teal-500',
    category: 'database',
    external: true,
  },
  
  // AI
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'AI Models',
    icon: 'cpu',
    url: 'https://platform.openai.com',
    color: 'bg-green-600',
    category: 'ai',
    external: true,
  },
  {
    id: 'claude',
    name: 'Claude',
    description: 'Anthropic AI',
    icon: 'bot',
    url: 'https://claude.ai',
    color: 'bg-orange-500',
    category: 'ai',
    external: true,
  },
  {
    id: 'groq',
    name: 'Groq',
    description: 'Fast AI Inference',
    icon: 'zap',
    url: 'https://console.groq.com',
    color: 'bg-pink-600',
    category: 'ai',
    external: true,
  },
  
  // Admin
  {
    id: 'cloudflare',
    name: 'Cloudflare',
    description: 'DNS & CDN',
    icon: 'cloud',
    url: 'https://dash.cloudflare.com',
    color: 'bg-orange-400',
    category: 'admin',
    external: true,
  },
  {
    id: 'vercel',
    name: 'Vercel',
    description: 'Frontend Hosting',
    icon: 'triangle',
    url: 'https://vercel.com/dashboard',
    color: 'bg-black',
    category: 'admin',
    external: true,
  },
  {
    id: 'aws',
    name: 'AWS',
    description: 'Cloud Platform',
    icon: 'server',
    url: 'https://aws.amazon.com',
    color: 'bg-orange-500',
    category: 'admin',
    external: true,
  },
  
  // Storage
  {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'File Storage',
    icon: 'folder',
    url: 'https://dropbox.com',
    color: 'bg-blue-400',
    category: 'storage',
    external: true,
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    description: 'Cloud Storage',
    icon: 'hard-drive',
    url: 'https://drive.google.com',
    color: 'bg-yellow-500',
    category: 'storage',
    external: true,
  },
]

export const categories = [
  { id: 'productivity', name: 'Productivity', icon: 'zap' },
  { id: 'development', name: 'Development', icon: 'code' },
  { id: 'database', name: 'Database', icon: 'database' },
  { id: 'ai', name: 'AI', icon: 'cpu' },
  { id: 'admin', name: 'Admin', icon: 'settings' },
  { id: 'storage', name: 'Storage', icon: 'hard-drive' },
] as const

export type CategoryId = typeof categories[number]['id']
