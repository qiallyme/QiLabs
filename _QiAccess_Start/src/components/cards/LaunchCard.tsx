import { ArrowUpRightIcon, BookOpenIcon, GithubIcon, PencilLineIcon } from "../icons/qi-icons";
import type { Resource } from "../../types/resource";
import {
  resolveDocsUrl,
  resolveLaunchUrl,
  verificationLabel,
  zoneLabel,
} from "../../lib/status/resource-status";
import { InfoTip } from "../ui/InfoTip";

type LaunchCardProps = {
  onEdit: (resource: Resource) => void;
  resource: Resource;
};

export function LaunchCard({ onEdit, resource }: LaunchCardProps) {
  const href = resolveLaunchUrl(resource);
  const docsHref = resolveDocsUrl(resource);

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

  return (
    <article className="panel card-lift flex flex-col overflow-hidden">
      <div className="border-b border-border bg-gradient-to-r from-brand-50 to-violet-500/5 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="eyebrow">{resource.type}</div>
            <div className="mt-1.5 flex items-center gap-2">
              <h3 className="truncate text-base font-bold text-heading">{resource.name}</h3>
              <InfoTip align="right" label={`${resource.name} details`}>
                <div>{resource.description}</div>
                {resource.notes ? <div className="mt-2">{resource.notes}</div> : null}
                {href ? <div className="mt-2 font-mono text-[11px]">{href}</div> : null}
              </InfoTip>
            </div>
          </div>
          <div
            className={`flex flex-shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${badgeClass}`}
          >
            <span className={`dot ${dotClass}`} />
            {zoneLabel(resource.zone)}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap gap-1.5">
          <span className="chip">{zoneLabel(resource.zone)}</span>
          <span className="chip">{verificationLabel(resource.verificationState)}</span>
          {resource.tags.slice(0, 2).map((tag) => (
            <span className="chip" key={tag}>
              {tag}
            </span>
          ))}
          {resource.tags.length > 2 ? <span className="chip">+{resource.tags.length - 2}</span> : null}
        </div>

        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          {href ? (
            <a className="button-primary" href={href} rel="noreferrer" target="_blank">
              <ArrowUpRightIcon className="h-4 w-4" />
              Open App
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
          <button className="button-ghost ml-auto" onClick={() => onEdit(resource)} type="button">
            <PencilLineIcon className="h-4 w-4" />
            Edit
          </button>
        </div>
      </div>
    </article>
  );
}
