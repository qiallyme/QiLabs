import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import Toast, { setToastHandler } from './Toast'

interface ToastMessage {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
}

interface ToastContextType {
  addToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    // Fallback if used outside provider
    return {
      addToast: (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
        console.log(`[${type.toUpperCase()}] ${message}`)
      },
    }
  }
  return context
}

export default function ToastContainer({ children }: { children?: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    const id = Math.random().toString(36).substring(7)
    setToasts((prev) => [...prev, { id, message, type }])
  }

  useEffect(() => {
    setToastHandler((message: string, type: 'success' | 'error' | 'info' | 'warning') => {
      addToast(message, type)
    })
  }, [])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div style={{ position: 'fixed', top: 0, right: 0, zIndex: 10000 }}>
        {toasts.map((toast, index) => (
          <div key={toast.id} style={{ marginBottom: index > 0 ? '0.5rem' : 0 }}>
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

