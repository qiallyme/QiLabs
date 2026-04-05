interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  message?: string
}

export default function LoadingSpinner({ size = 'medium', message }: LoadingSpinnerProps) {
  const sizes = {
    small: '16px',
    medium: '24px',
    large: '32px',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <div
        style={{
          width: sizes[size],
          height: sizes[size],
          border: `3px solid #e0e0e0`,
          borderTop: `3px solid #2196F3`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
      {message && <span style={{ fontSize: '0.875rem', color: '#666' }}>{message}</span>}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  )
}

