import { ArrowUpRightIcon, BookOpenIcon, CopyIcon, GithubIcon, PencilLineIcon } from "../icons/qi-icons";
import { useFeedback } from "../feedback/FeedbackProvider";
import type { Resource } from "../../types/resource";
import {
  ownerLabel,
  portalRoleDescription,
  portalRoleLabel,
  resolveDocsUrl,
  resolveLaunchUrl,
  verificationLabel,
  zoneLabel,
} from "../../lib/status/resource-status";
import { InfoTip } from "../ui/InfoTip";

type ResourceDetailPanelProps = {
  onEdit: (resource: Resource) => void;
  resource: Resource | null;
};

export function ResourceDetailPanel({ onEdit, resource }: ResourceDetailPanelProps) {
  const { notify } = useFeedback();

  if (!resource) {
    return (
      <aside className="panel flex min-h-[320px] items-center justify-center p-5 text-sm text-muted">
        Select a node to inspect relationships, docs, links, and notes.
      </aside>
    );
  }

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

  async function copyUrl() {
    if (!href) {
      return;
    }

    try {
      await navigator.clipboard.writeText(href);
      notify("URL copied", href);
    } catch {
      notify("Copy failed", "Clipboard access was blocked by the browser.");
    }
  }

  return (
    <aside className="panel h-full overflow-hidden xl:sticky xl:top-0">
      {/* Header */}
      <div className="border-b border-border bg-surface-2 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="eyebrow">Details</div>
              <InfoTip align="left" label={`${resource.name} summary`}>
                <div>{resource.description}</div>
                {resource.notes ? <div className="mt-2">{resource.notes}</div> : null}
              </InfoTip>
            </div>
            <h2 className="mt-1 text-xl font-bold text-heading">{resource.name}</h2>
          </div>
          <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide flex-shrink-0 ${badgeClass}`}>
            <span className={`dot ${dotClass}`} />
            {resource.status ?? "unknown"}
          </div>
        </div>
      </div>

      <div className="p-4">
        <dl className="grid gap-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-surface-2 p-3">
              <dt className="text-[10px] font-bold uppercase tracking-widest text-muted">Environment</dt>
              <dd className="mt-1 text-sm font-semibold text-heading">{zoneLabel(resource.zone)}</dd>
            </div>
            <div className="rounded-xl border border-border bg-surface-2 p-3">
              <dt className="text-[10px] font-bold uppercase tracking-widest text-muted">Owner</dt>
              <dd className="mt-1 text-sm font-semibold text-heading">{ownerLabel(resource)}</dd>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface-2 p-3">
            <dt className="text-[10px] font-bold uppercase tracking-widest text-muted">Portal Role</dt>
            <dd className="mt-1 text-sm font-semibold text-heading">{portalRoleLabel(resource.portalRole)}</dd>
            <dd className="mt-1 text-xs leading-5 text-muted">{portalRoleDescription(resource.portalRole)}</dd>
          </div>

          <div className="rounded-xl border border-border bg-surface-2 p-3">
            <dt className="text-[10px] font-bold uppercase tracking-widest text-muted">Launch URL</dt>
            <dd className="mt-1 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
              <span className="break-all font-mono text-[11px] text-body">{href ?? "No launch URL configured"}</span>
            </dd>
          </div>

          <div className="rounded-xl border border-border bg-surface-2 p-3">
            <dt className="text-[10px] font-bold uppercase tracking-widest text-muted">Link State</dt>
            <dd className="mt-1 text-sm font-semibold text-heading">{verificationLabel(resource.verificationState)}</dd>
          </div>

          <div className="rounded-xl border border-border bg-surface-2 p-3">
            <dt className="text-[10px] font-bold uppercase tracking-widest text-muted">Tags</dt>
            <dd className="mt-2 flex flex-wrap gap-1.5">
              {resource.tags.map((tag) => (
                <span className="chip" key={tag}>
                  {tag}
                </span>
              ))}
            </dd>
          </div>
        </dl>

        {/* Actions */}
        <div className="mt-4 grid gap-2">
          {href ? (
            <a className="button-primary" href={href} rel="noreferrer" target="_blank">
              <ArrowUpRightIcon className="h-4 w-4" />
              Open App
            </a>
          ) : null}
          {docsHref ? (
            <a className="button-secondary" href={docsHref} rel="noreferrer" target="_blank">
              <BookOpenIcon className="h-4 w-4" />
              View Docs
            </a>
          ) : null}
          {resource.repoUrl ? (
            <a className="button-secondary" href={resource.repoUrl} rel="noreferrer" target="_blank">
              <GithubIcon className="h-4 w-4" />
              View Repo
            </a>
          ) : null}
          <div className="flex gap-2">
            <button className="button-secondary flex-1" onClick={() => onEdit(resource)} type="button">
              <PencilLineIcon className="h-4 w-4" />
              Edit Entry
            </button>
            {href ? (
              <button className="button-secondary flex-1" onClick={copyUrl} type="button">
                <CopyIcon className="h-4 w-4" />
                Copy URL
              </button>
            ) : null}
          </div>
        </div>

        {/* Notes */}
        <div className="mt-4 rounded-xl border border-border bg-surface-2 p-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted">Notes</div>
          <div className="mt-2 whitespace-pre-wrap text-sm leading-6 text-body">
            {resource.notes ?? "No notes yet. Use Edit Entry to add runbooks, prompts, and operational context."}
          </div>
        </div>
      </div>
    </aside>
  );
}
