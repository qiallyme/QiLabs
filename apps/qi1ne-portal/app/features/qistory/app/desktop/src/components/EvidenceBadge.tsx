interface EvidenceBadgeProps {
  count: number
  isThin?: boolean
}

export default function EvidenceBadge({ count, isThin }: EvidenceBadgeProps) {
  const getColor = () => {
    if (count === 0) return { bg: '#f44336', text: 'white' } // Red - missing
    if (isThin || count < 3) return { bg: '#ff9800', text: 'white' } // Yellow - thin
    return { bg: '#4CAF50', text: 'white' } // Green - OK
  }

  const getLabel = () => {
    if (count === 0) return 'No evidence'
    if (isThin || count < 3) return 'Thin evidence'
    return 'Evidence OK'
  }

  const color = getColor()

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.25rem 0.5rem',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        background: color.bg,
        color: color.text,
      }}
      title={`${count} evidence chunks${isThin ? ' (thin - add more sources)' : ''}`}
    >
      {count} {getLabel()}
    </span>
  )
}

