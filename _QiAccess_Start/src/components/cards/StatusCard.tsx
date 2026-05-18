import type { ResourceStatus } from "../../types/resource";
import { statusLabel } from "../../lib/status/resource-status";
import { InfoTip } from "../ui/InfoTip";

type StatusCardProps = {
  label: string;
  value: string;
  status: ResourceStatus | undefined;
  detail: string;
};

export function StatusCard({ detail, label, status, value }: StatusCardProps) {
  const badgeClass =
    status === "online"
      ? "badge-online"
      : status === "offline"
        ? "badge-offline"
        : "badge-unknown";

  const dotClass =
    status === "online"
      ? "status-online"
      : status === "offline"
        ? "status-offline"
        : "status-unknown";

  const accentBar =
    status === "online"
      ? "bg-online"
      : status === "offline"
        ? "bg-offline"
        : "bg-unknown";

  return (
    <div className="panel relative overflow-hidden transition hover:shadow-card-hover">
      {/* Colored top accent bar */}
      <div className={`h-1 w-full rounded-t-2xl ${accentBar}`} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="eyebrow">{label}</div>
              <InfoTip label={`${label} details`}>{detail}</InfoTip>
            </div>
            <div className="mt-1.5 text-xl font-bold text-heading">{value}</div>
          </div>
          <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${badgeClass}`}>
            <span className={`dot ${dotClass}`} />
            {statusLabel(status)}
          </div>
        </div>
      </div>
    </div>
  );
}
