// frontend/src/components/NavigatorMediationPanel.tsx
import React, { useState } from "react";
import type { MatchResult } from "../api/resourceWorkerClient";

interface NavigatorMediationPanelProps {
  matches: MatchResult[];
  selectedId?: string | null;
  onSelectMatch?: (id: string) => void;
}

export const NavigatorMediationPanel: React.FC<NavigatorMediationPanelProps> = ({
  matches,
  selectedId,
  onSelectMatch
}) => {
  const [notes, setNotes] = useState("");
  const [decision, setDecision] = useState<"hold" | "proceed" | "decline" | "">(
    ""
  );

  const selected =
    matches.find((m) => m.id === selectedId) || matches[0] || null;

  return (
    <div style={styles.wrap}>
      <h3 style={styles.heading}>Navigator mediation</h3>
      <p style={styles.subtitle}>
        This panel is for human navigators to review suggested matches, document
        judgment calls, and record next steps.
      </p>

      {matches.length === 0 && (
        <p style={styles.muted}>No matches to mediate yet.</p>
      )}

      {selected && (
        <div style={styles.selectedCard}>
          <div style={styles.badgeRow}>
            <span style={styles.badge}>
              {selected.type === "need" ? "Member need" : "Community offer"}
            </span>
            {typeof selected.similarity_score === "number" && (
              <span style={styles.score}>
                Match {(selected.similarity_score * 100).toFixed(0)}%
              </span>
            )}
          </div>
          <div style={styles.selTitle}>{selected.title}</div>
          {selected.summary && (
            <p style={styles.selSummary}>{selected.summary}</p>
          )}
        </div>
      )}

      {matches.length > 1 && (
        <div style={styles.altList}>
          <span style={styles.altLabel}>Other options:</span>
          <div style={styles.altTags}>
            {matches.map((m) => (
              <button
                key={m.id}
                type="button"
                style={{
                  ...styles.altTag,
                  ...(selected && selected.id === m.id ? styles.altTagActive : {})
                }}
                onClick={() => onSelectMatch?.(m.id)}
              >
                {m.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={styles.fieldBlock}>
        <label style={styles.label}>
          Navigator notes
          <textarea
            style={styles.textarea}
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Risk flags, trauma considerations, consent, preferences, safety checks…"
          />
        </label>
      </div>

      <div style={styles.fieldBlock}>
        <span style={styles.labelTitle}>Decision (internal)</span>
        <div style={styles.pills}>
          {["hold", "proceed", "decline"].map((opt) => (
            <button
              key={opt}
              type="button"
              style={{
                ...styles.pill,
                ...(decision === opt ? styles.pillActive : {})
              }}
              onClick={() =>
                setDecision((current) => (current === opt ? "" : (opt as any)))
              }
            >
              {opt === "hold" && "Hold & monitor"}
              {opt === "proceed" && "Proceed with this match"}
              {opt === "decline" && "Decline – not appropriate"}
            </button>
          ))}
        </div>
      </div>

      <p style={styles.footerText}>
        In production, this panel would sync to the member’s case file, decision
        logs, and partner communication history.
      </p>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    borderRadius: 14,
    border: "1px solid #e5e7eb",
    padding: 12,
    background: "#f9fafb",
    display: "flex",
    flexDirection: "column",
    gap: 8
  },
  heading: {
    fontSize: "0.95rem",
    margin: 0,
    fontWeight: 600
  },
  subtitle: {
    fontSize: "0.8rem",
    color: "#6b7280",
    margin: 0
  },
  muted: {
    fontSize: "0.78rem",
    color: "#6b7280",
    margin: 0
  },
  selectedCard: {
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    padding: 8,
    background: "#ffffff"
  },
  badgeRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 4
  },
  badge: {
    fontSize: "0.7rem",
    padding: "2px 8px",
    borderRadius: 999,
    background: "#fef3c7",
    color: "#92400e"
  },
  score: {
    fontSize: "0.7rem",
    padding: "2px 8px",
    borderRadius: 999,
    background: "#ecfdf3",
    color: "#15803d"
  },
  selTitle: {
    fontSize: "0.85rem",
    fontWeight: 600,
    marginBottom: 2,
    color: "#111827"
  },
  selSummary: {
    fontSize: "0.78rem",
    color: "#4b5563",
    margin: 0
  },
  altList: {
    fontSize: "0.78rem",
    color: "#4b5563"
  },
  altLabel: {
    marginRight: 4
  },
  altTags: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4
  },
  altTag: {
    borderRadius: 999,
    border: "1px solid #d1d5db",
    padding: "3px 8px",
    fontSize: "0.75rem",
    background: "#ffffff",
    cursor: "pointer"
  },
  altTagActive: {
    borderColor: "#4f46e5",
    background: "#eef2ff",
    color: "#312e81"
  },
  fieldBlock: {
    marginTop: 6
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    fontSize: "0.78rem",
    color: "#374151"
  },
  labelTitle: {
    fontSize: "0.78rem",
    color: "#374151",
    marginBottom: 4
  },
  textarea: {
    resize: "vertical",
    minHeight: 60,
    borderRadius: 8,
    border: "1px solid #d1d5db",
    padding: "6px 8px",
    fontSize: "0.8rem",
    fontFamily: "inherit"
  },
  pills: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6
  },
  pill: {
    borderRadius: 999,
    border: "1px solid #d1d5db",
    padding: "4px 8px",
    fontSize: "0.75rem",
    background: "#ffffff",
    cursor: "pointer"
  },
  pillActive: {
    borderColor: "#4f46e5",
    background: "#eef2ff",
    color: "#312e81"
  },
  footerText: {
    fontSize: "0.75rem",
    color: "#6b7280",
    margin: 0,
    marginTop: 4
  }
};
