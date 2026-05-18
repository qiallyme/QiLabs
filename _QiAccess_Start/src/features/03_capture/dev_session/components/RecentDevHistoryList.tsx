import type { DevHistoryRecord } from "../devHistoryTypes";

type RecentDevHistoryListProps = {
  records: DevHistoryRecord[];
  isLoading: boolean;
  error: string | null;
  onSelect: (record: DevHistoryRecord) => void;
};

function formatUpdatedAt(value: string) {
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function RecentDevHistoryList({
  records,
  isLoading,
  error,
  onSelect,
}: RecentDevHistoryListProps) {
  if (isLoading) {
    return <div className="panel-muted p-4 text-sm text-body">Loading recent dev history…</div>;
  }

  if (error) {
    return <div className="panel-muted p-4 text-sm text-danger">{error}</div>;
  }

  if (!records.length) {
    return (
      <div className="panel-muted p-4 text-sm text-body">
        No recent dev session records yet. Save the first structured restart receipt from this page.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {records.map((record) => (
        <button
          className="panel-muted flex flex-col gap-3 p-4 text-left transition hover:border-brand-300 hover:bg-surface hover:shadow-card-hover"
          key={record.id}
          onClick={() => onSelect(record)}
          type="button"
        >
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm font-semibold text-heading">{record.title}</div>
            <span className="chip">{record.status}</span>
            {record.tags.slice(0, 3).map((tag) => (
              <span className="chip-brand" key={`${record.id}-${tag}`}>
                {tag}
              </span>
            ))}
          </div>
          <div className="grid gap-1 text-xs leading-5 text-muted md:grid-cols-2">
            <div>Session date: {record.session_date}</div>
            <div>Updated: {formatUpdatedAt(record.updated_at)}</div>
            <div>Project: {record.project ?? "Unspecified"}</div>
            <div>Feature area: {record.feature_area ?? "Unspecified"}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
