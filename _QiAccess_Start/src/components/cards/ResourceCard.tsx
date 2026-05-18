import { ArrowUpRightIcon, BookOpenIcon, GithubIcon, PencilLineIcon } from "../icons/qi-icons";
import type { Resource } from "../../types/resource";
import {
  portalRoleLabel,
  resolveDocsUrl,
  resolveLaunchUrl,
  verificationLabel,
  zoneLabel,
} from "../../lib/status/resource-status";
import { InfoTip } from "../ui/InfoTip";

type ResourceCardProps = {
  onEdit: (resource: Resource) => void;
  onSelect: (resource: Resource) => void;
  resource: Resource;
  selected: boolean;
};

export function ResourceCard({ onEdit, onSelect, resource, selected }: ResourceCardProps) {
  const href = resolveLaunchUrl(resource);
  const docsHref = resolveDocsUrl(resource);
  const isLaunchable = Boolean(href);

  const badgeClass =
    resource.status === "online"
      ? "badge-online"
      : resource.status === "offline"
        ? "badge-offline"
        : "badge-unknown";

  const dotClass =
    resource.status === "online"
      ? "status-online"
      : resource.status === "offline"
        ? "status-offline"
        : "status-unknown";
  const portalChipClass =
    resource.portalRole === "front-door"
      ? "chip-brand"
      : resource.portalRole === "bridge"
        ? "chip border-brand-400 text-brand-300"
        : resource.portalRole === "browser-run"
          ? "chip"
          : "chip border-dashed";

  return (
    <article
      className={`panel flex flex-col overflow-hidden transition ${
        selected ? "border-brand-400 shadow-ring-brand" : "card-lift"
      }`}
    >
      <button className="w-full text-left" onClick={() => onSelect(resource)} type="button">
        <div className={`border-b border-border px-4 py-4 ${selected ? "bg-surface-3" : "bg-surface-2"}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="truncate text-base font-bold text-heading">{resource.name}</div>
                <InfoTip align="right" interactive={false} label={`${resource.name} details`}>
                  <div>{resource.description}</div>
                  {resource.notes ? <div className="mt-2">{resource.notes}</div> : null}
                  {href ? <div className="mt-2 font-mono text-[11px]">{href}</div> : null}
                </InfoTip>
              </div>
              <div className="mt-1 flex flex-wrap gap-1.5">
                <span className={portalChipClass}>{portalRoleLabel(resource.portalRole)}</span>
                <span className="chip">{resource.type}</span>
                <span className="chip">{zoneLabel(resource.zone)}</span>
                <span className="chip">{verificationLabel(resource.verificationState)}</span>
              </div>
            </div>
            <div
              className={`flex flex-shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${badgeClass}`}
            >
              <span className={`dot ${dotClass}`} />
              {resource.status ?? "unknown"}
            </div>
          </div>
        </div>

        <div className="px-4 pb-1 pt-3">
          <div className="flex flex-wrap gap-1.5">
            {resource.tags.slice(0, 3).map((tag) => (
              <span className="chip" key={tag}>
                {tag}
              </span>
            ))}
            {resource.tags.length > 3 ? <span className="chip">+{resource.tags.length - 3}</span> : null}
          </div>
        </div>
      </button>

      <div className="mt-3 flex flex-wrap gap-2 border-t border-border bg-surface-2 px-4 py-3">
        {isLaunchable ? (
          <a className="button-primary" href={href} rel="noreferrer" target="_blank">
            <ArrowUpRightIcon className="h-4 w-4" />
            Open
          </a>
        ) : null}
        {docsHref ? (
          <a className="button-secondary" href={docsHref} rel="noreferrer" target="_blank">
            <BookOpenIcon className="h-4 w-4" />
            Docs
          </a>
        ) : null}
        {resource.repoUrl ? (
          <a className="button-secondary" href={resource.repoUrl} rel="noreferrer" target="_blank">
            <GithubIcon className="h-4 w-4" />
            Repo
          </a>
        ) : null}
        {!isLaunchable ? (
          <span className="chip border-dashed">
            {resource.verificationState === "placeholder" ? "Coming soon" : "No launch yet"}
          </span>
        ) : null}
        <button className="button-ghost ml-auto" onClick={() => onEdit(resource)} type="button">
          <PencilLineIcon className="h-4 w-4" />
          Edit
        </button>
      </div>
    </article>
  );
}
