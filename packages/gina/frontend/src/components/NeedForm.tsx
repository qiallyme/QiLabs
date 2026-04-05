// frontend/src/components/NeedForm.tsx
import React, { useState } from "react";
import {
  matchResources,
  createResource,
  type MatchResult
} from "../api/resourceWorkerClient";
import { MatchList } from "./MatchList";

interface NeedFormProps {
  compact?: boolean;
  onMatches?: (matches: MatchResult[]) => void;
}

export const NeedForm: React.FC<NeedFormProps> = ({ compact, onMatches }) => {
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [tags, setTags] = useState("");
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demo, setDemo] = useState<boolean | undefined>(undefined);
  const [queueMessage, setQueueMessage] = useState<string | null>(null);

  const onSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    const query = description.trim();
    if (!query) return;

    setLoading(true);
    setError(null);
    setQueueMessage(null);

    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      // 1) Try to match existing offers
      const matchRes = await matchResources({
        query,
        type: "need",
        location: location.trim() || undefined,
        tags: tagList,
        limit: 10
      });

      setMatches(matchRes.matches);
      setDemo(matchRes.demo);
      onMatches?.(matchRes.matches);

      // 2) If nothing matches, add this as a new live need
      if (!matchRes.matches || matchRes.matches.length === 0) {
        const created = await createResource({
          type: "need",
          description: query,
          location: location.trim() || undefined,
          tags: tagList
        });

        setQueueMessage(
          created.demo
            ? "No match yet — this need was added to the live queue (demo)."
            : "No match yet — this need was added to the live Lumara queue."
        );
      } else {
        setQueueMessage(
          "Matches found. If the navigator still can’t connect the member, they can escalate this as a new queued need."
        );
      }
    } catch (err) {
      console.error(err);
      setError("We couldn’t reach the resource graph worker.");
      setMatches([]);
      setDemo(undefined);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} style={styles.wrap}>
      <h4 style={styles.title}>Member need</h4>
      <p style={styles.help}>
        Describe what the member is facing. We&apos;ll look for offers first.
        If nothing is found, this becomes a live need in the queue.
      </p>

      <textarea
        style={styles.textarea}
        rows={compact ? 3 : 4}
        placeholder="Example: A family of three needs a ride from the west side of Indy to downtown for a court hearing tomorrow morning."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        style={styles.input}
        placeholder="Location (optional, e.g. West side Indianapolis)"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />

      <input
        style={styles.input}
        placeholder="Tags (optional, comma-separated: transport, urgent, kids)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />

      <div style={styles.actions}>
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Checking & queuing…" : "Check for matches"}
        </button>
        {error && <span style={styles.error}>{error}</span>}
        {queueMessage && !error && (
          <span style={styles.queue}>{queueMessage}</span>
        )}
      </div>

      <MatchList
        matches={matches}
        loading={loading}
        emptyMessage="No matches yet. Submit the need to add it to the live queue."
        demo={demo}
      />
    </form>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    padding: 10,
    background: "#f9fafb",
    display: "flex",
    flexDirection: "column",
    gap: 6
  },
  title: {
    margin: 0,
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "#111827"
  },
  help: {
    margin: 0,
    fontSize: "0.78rem",
    color: "#6b7280"
  },
  textarea: {
    width: "100%",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    padding: 6,
    fontSize: "0.8rem",
    resize: "vertical"
  },
  input: {
    width: "100%",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    padding: "5px 6px",
    fontSize: "0.8rem"
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    gap: 4
  },
  button: {
    borderRadius: 999,
    border: "none",
    padding: "6px 10px",
    fontSize: "0.8rem",
    fontWeight: 600,
    cursor: "pointer",
    background: "#0ea5e9",
    color: "#ffffff",
    alignSelf: "flex-start"
  },
  error: {
    fontSize: "0.75rem",
    color: "#b91c1c"
  },
  queue: {
    fontSize: "0.75rem",
    color: "#059669"
  }
};
