import { useEffect } from 'react'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  onClose: () => void
  duration?: number
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const colors = {
    success: { bg: '#4CAF50', text: 'white' },
    error: { bg: '#f44336', text: 'white' },
    info: { bg: '#2196F3', text: 'white' },
    warning: { bg: '#ff9800', text: 'white' },
  }

  const color = colors[type]

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: color.bg,
        color: color.text,
        padding: '1rem 1.5rem',
        borderRadius: '4px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        zIndex: 10000,
        minWidth: '300px',
        maxWidth: '500px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
      }}
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: color.text,
          cursor: 'pointer',
          fontSize: '1.2rem',
          padding: '0',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ×
      </button>
    </div>
  )
}

// Toast context/hook for easy usage
let toastHandler: ((message: string, type: 'success' | 'error' | 'info' | 'warning') => void) | null = null

export function setToastHandler(handler: typeof toastHandler) {
  toastHandler = handler
}

export function showToast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
  if (toastHandler) {
    toastHandler(message, type)
  } else {
    console.log(`[${type.toUpperCase()}] ${message}`)
  }
}

