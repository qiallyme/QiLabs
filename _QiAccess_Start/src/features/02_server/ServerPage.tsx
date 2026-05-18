import { Link, useParams } from "react-router-dom";
import { ArrowUpRightIcon } from "../../components/icons/qi-icons";
import { resolveLaunchUrl, verificationLabel } from "../../lib/status/resource-status";
import type { Resource } from "../../types/resource";
import { useRegistry } from "../resources/registry-store";

const serverGroups = [
  {
    title: "Open First",
    description: "Use the private launcher before jumping into lower-level tools.",
    resourceIds: ["gethomepage"],
  },
  {
    title: "Direct Local Tools",
    description: "Only the direct local tools that still add value from the web portal.",
    resourceIds: ["wiki-js", "paperless", "open-webui", "portainer", "cockpit", "nocodb", "n8n"],
  },
  {
    title: "Context Only",
    description: "Keep these visible for truth and status, not as daily front-door actions.",
    resourceIds: ["qiserver", "ollama", "anythingllm", "neo4j", "runbook"],
  },
] as const;

function cardTone(resource: Resource) {
  if (resource.status === "online") {
    return "chip-brand";
  }

  return "chip";
}

export function ServerPage() {
  const { resourceId } = useParams();
  const { getResource } = useRegistry();

  const groups = serverGroups.map((group) => ({
    ...group,
    resources: group.resourceIds
      .map((id) => getResource(id) ?? null)
      .filter((resource): resource is Resource => resource !== null),
  }));

  return (
    <div className="grid gap-4">
      <section className="panel p-6">
        <div className="eyebrow">Server</div>
        <h1 className="mt-2 text-2xl font-semibold text-heading">Local and private surfaces</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-body">
          This page is for local and private work only. Keep it focused on the launcher handoff, the few direct tools that matter, and honest status for anything still partial or broken.
        </p>
      </section>

      {groups.map((group) => (
        <section className="panel overflow-hidden" key={group.title}>
          <div className="border-b border-border bg-surface-2 px-4 py-3 sm:px-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="eyebrow">{group.title}</div>
                <h2 className="mt-1 text-xl font-semibold text-heading">{group.title}</h2>
              </div>
              <span className="chip">{group.resources.length}</span>
            </div>
            <div className="mt-2 text-sm text-muted">{group.description}</div>
          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
            {group.resources.map((resource) => {
              const href = resolveLaunchUrl(resource);
              const isSelected = resourceId === resource.id;

              return (
                <article
                  className={`panel-muted flex min-h-[220px] flex-col gap-3 p-5 ${isSelected ? "border border-brand-400" : ""}`}
                  key={resource.id}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-base font-semibold text-heading">{resource.name}</div>
                    <span className={cardTone(resource)}>{resource.status ?? "unknown"}</span>
                    <span className="chip">{verificationLabel(resource.verificationState)}</span>
                  </div>

                  <div className="text-sm leading-6 text-body">{resource.description}</div>

                  {resource.notes ? <div className="text-xs leading-5 text-muted">{resource.notes}</div> : null}

                  <div className="mt-auto flex flex-wrap gap-2 pt-1">
                    {href ? (
                      <a className="button-primary" href={href} rel="noreferrer" target="_blank">
                        <ArrowUpRightIcon className="h-4 w-4" />
                        Open
                      </a>
                    ) : (
                      <span className="chip border-dashed">No launch target</span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}

      <div className="rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm text-body">
        Need infrastructure categories rather than launch cards? Go to <Link className="text-brand-600 hover:text-brand-700" to="/system">System</Link>.
      </div>
    </div>
  );
}
