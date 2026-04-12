// QiOS Theme Configuration
export const themes = {
  dark: {
    name: 'Dark Electric Purple',
    // Sophisticated dark gradient - professional neon
    '--bg-primary': '#0d0d14',
    '--bg-secondary': '#151520',
    '--bg-gradient-start': '#0a0a12',
    '--bg-gradient-mid': '#1a1528',
    '--bg-gradient-end': '#0f0d1a',
    // Card with subtle neon glow
    '--card-bg': 'rgba(20, 15, 35, 0.6)',
    '--card-border': 'rgba(139, 92, 246, 0.25)',
    '--card-shadow': '0 8px 32px rgba(88, 28, 135, 0.15), 0 2px 8px rgba(139, 92, 246, 0.1)',
    '--card-shadow-hover': '0 12px 48px rgba(139, 92, 246, 0.2), 0 4px 16px rgba(88, 28, 135, 0.15)',
    // Text with subtle neon tint
    '--text-primary': '#e8e0f5',
    '--text-secondary': '#b8a5e8',
    '--text-muted': '#7c6fa8',
    // Accent with controlled neon
    '--accent-color': '#9d7ef0',
    '--accent-hover': '#b59af5',
    '--accent-glow': 'rgba(157, 126, 240, 0.3)',
    '--border-color': 'rgba(139, 92, 246, 0.15)',
    '--border-glow': 'rgba(139, 92, 246, 0.08)',
    // Inputs and items
    '--input-bg': 'rgba(25, 20, 40, 0.4)',
    '--input-border': 'rgba(139, 92, 246, 0.2)',
    '--item-bg': 'rgba(30, 25, 45, 0.4)',
    '--item-hover-bg': 'rgba(50, 40, 70, 0.5)',
    '--item-selected-bg': 'rgba(139, 92, 246, 0.2)',
    '--item-shadow': '0 4px 16px rgba(88, 28, 135, 0.1)',
    '--code-bg': 'rgba(10, 8, 18, 0.5)',
    // Status colors with subtle glow
    '--status-green': '#22d3a5',
    '--status-orange': '#f59e0b',
    '--status-red': '#f87171',
    '--status-gray': '#6b7280',
  },
  light: {
    name: 'Electric Blue Light',
    // Clean light with electric blue accents
    '--bg-primary': '#f8fafc',
    '--bg-secondary': '#f1f5f9',
    '--bg-gradient-start': '#ffffff',
    '--bg-gradient-mid': '#f0f4f8',
    '--bg-gradient-end': '#e8f0f7',
    // Cards with deeper shadows for contrast
    '--card-bg': '#ffffff',
    '--card-border': '#cbd5e1',
    '--card-shadow': '0 10px 40px rgba(30, 58, 138, 0.12), 0 4px 16px rgba(30, 58, 138, 0.08)',
    '--card-shadow-hover': '0 16px 64px rgba(30, 58, 138, 0.18), 0 8px 24px rgba(30, 58, 138, 0.12)',
    // Text with electric blue hints
    '--text-primary': '#0f172a',
    '--text-secondary': '#475569',
    '--text-muted': '#64748b',
    // Electric blue accents
    '--accent-color': '#3b82f6',
    '--accent-hover': '#2563eb',
    '--accent-glow': 'rgba(59, 130, 246, 0.15)',
    '--border-color': '#cbd5e1',
    '--border-glow': 'rgba(59, 130, 246, 0.1)',
    // Inputs and items
    '--input-bg': '#ffffff',
    '--input-border': '#cbd5e1',
    '--item-bg': '#f8fafc',
    '--item-hover-bg': '#f1f5f9',
    '--item-selected-bg': '#dbeafe',
    '--item-shadow': '0 4px 16px rgba(30, 58, 138, 0.08)',
    '--code-bg': '#f1f5f9',
    // Status colors
    '--status-green': '#10b981',
    '--status-orange': '#f59e0b',
    '--status-red': '#ef4444',
    '--status-gray': '#6b7280',
  },
}

export function applyTheme(themeName) {
  const theme = themes[themeName] || themes.dark
  const root = document.documentElement
  
  Object.entries(theme).forEach(([key, value]) => {
    if (key !== 'name') {
      root.style.setProperty(key, value)
    }
  })
  
  // Apply sophisticated gradient backgrounds
  if (themeName === 'dark') {
    // Multi-stop gradient for professional dark neon
    root.style.background = `radial-gradient(ellipse at top, ${theme['--bg-gradient-mid']} 0%, ${theme['--bg-gradient-start']} 40%, ${theme['--bg-primary']} 100%), linear-gradient(135deg, ${theme['--bg-gradient-start']} 0%, ${theme['--bg-gradient-mid']} 50%, ${theme['--bg-gradient-end']} 100%)`
    root.style.backgroundAttachment = 'fixed'
  } else {
    // Light mode with subtle electric blue gradient
    root.style.background = `linear-gradient(135deg, ${theme['--bg-gradient-start']} 0%, ${theme['--bg-gradient-mid']} 50%, ${theme['--bg-gradient-end']} 100%)`
    root.style.backgroundAttachment = 'fixed'
  }
  
  localStorage.setItem('qios-theme', themeName)
}

export function getStoredTheme() {
  return localStorage.getItem('qios-theme') || 'dark'
}

