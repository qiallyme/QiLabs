import { useState } from 'react'
import './Tooltip.css'

// Status code tooltips
export const STATUS_TOOLTIPS = {
  'ROT': 'Root Integrity - Validates canonical folder structure',
  'DM': 'Dark Matter - Protects system substrate (darkmatter/, workers/, rules/)',
  'RLM': 'Realm Schema - Validates realm folder structures',
  'FID': 'File Identity - Validates file legitimacy (type, MIME, placement)',
  'NAM': 'Naming - Enforces QiOS Naming Law (slug.ext or qidecimal_slug.ext)',
  'MTA': 'Metadata - Ensures all files have complete front matter',
  'SEM': 'Semantic Routing - Uses embeddings + RAG to place files in correct realms',
  'HEL': 'Self-Healing - Dedupe, versioning, quarantine invalid files',
  'green': 'Healthy - Worker is running normally',
  'orange': 'Degraded - Worker is running but has warnings or reduced functionality',
  'red': 'Error - Worker has failed or is down',
  'gray': 'Inactive - Worker is stopped or has not started',
  'healthy': 'Worker is running normally',
  'degraded': 'Worker is running but has warnings',
  'down': 'Worker has failed or is down',
}

export default function Tooltip({ text, children, code }) {
  const [show, setShow] = useState(false)
  const tooltipText = code ? STATUS_TOOLTIPS[code] || text : text

  if (!tooltipText) return children

  return (
    <span
      className="tooltip-wrapper"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="tooltip">
          {tooltipText}
        </div>
      )}
    </span>
  )
}

