interface StatusBadgeProps {
  status: 'proposed' | 'approved' | 'locked' | 'drafted' | 'revised'
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    proposed: { bg: '#e0e0e0', text: '#333', label: 'Proposed' },
    approved: { bg: '#2196F3', text: 'white', label: 'Approved' },
    locked: { bg: '#4CAF50', text: 'white', label: '🔒 Locked' },
    drafted: { bg: '#ff9800', text: 'white', label: 'Drafted' },
    revised: { bg: '#9c27b0', text: 'white', label: 'Revised' },
  }

  const { bg, text, label } = config[status] || config.proposed

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.25rem 0.5rem',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        background: bg,
        color: text,
      }}
    >
      {label}
    </span>
  )
}

