// frontend/src/components/MatchList.tsx
import React from "react";
import type { MatchResult } from "../api/resourceWorkerClient";

export interface MatchListProps {
  matches: MatchResult[];
  loading?: boolean;
  emptyMessage?: string;
  demo?: boolean;
}

export const MatchList: React.FC<MatchListProps> = ({
  matches,
  loading,
  emptyMessage = "No matches yet. Submit the form above to see potential matches.",
  demo
}) => {
  if (loading) {
    return (
      <div style={styles.wrap}>
        <p style={styles.heading}>Searching the Lumara resource graph…</p>
        <p style={styles.muted}>This may take a moment.</p>
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <div style={styles.wrap}>
        <p style={styles.heading}>Matches</p>
        <p style={styles.muted}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div style={styles.wrap}>
      <p style={styles.heading}>
        ✅ Found {matches.length} match{matches.length === 1 ? "" : "es"} from the
        worker
      </p>
      {demo && (
        <p style={{ ...styles.muted, marginBottom: 6 }}>
          (Demo data from the resource graph worker — not live resources yet.)
        </p>
      )}
      <ul style={styles.list}>
        {matches.map((m) => (
          <li key={m.id} style={styles.card}>
            <div style={styles.badgeRow}>
              <span style={styles.badgeType}>
                {m.type === "need" ? "Member need" : "Community offer"}
              </span>
              {typeof m.similarity_score === "number" && (
                <span style={styles.badgeScore}>
                  Match {(m.similarity_score * 100).toFixed(0)}%
                </span>
              )}
            </div>
            <div style={styles.title}>{m.title}</div>
            {m.summary && <p style={styles.summary}>{m.summary}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    borderRadius: 12,
    border: "2px solid #0ea5e9",
    padding: 10,
    background: "#ecfeff",
    marginTop: 6
  },
  heading: {
    fontSize: "0.9rem",
    fontWeight: 600,
    margin: "0 0 4px",
    color: "#0f172a"
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: 8
  },
  card: {
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    padding: 8,
    background: "#ffffff"
  },
  badgeRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 4,
    gap: 6
  },
  badgeType: {
    fontSize: "0.7rem",
    padding: "2px 8px",
    borderRadius: 999,
    background: "#eef2ff",
    color: "#4338ca"
  },
  badgeScore: {
    fontSize: "0.7rem",
    padding: "2px 8px",
    borderRadius: 999,
    background: "#ecfdf5",
    color: "#16a34a"
  },
  title: {
    fontSize: "0.85rem",
    fontWeight: 600,
    marginBottom: 2,
    color: "#111827"
  },
  summary: {
    fontSize: "0.78rem",
    color: "#4b5563",
    margin: 0
  },
  muted: {
    fontSize: "0.78rem",
    color: "#6b7280",
    margin: 0
  }
};
