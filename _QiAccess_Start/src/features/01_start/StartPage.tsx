import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useRegistry } from "../resources/registry-store";
import { resolveLaunchUrl, resolveDocsUrl, verificationLabel } from "../../lib/status/resource-status";
import type { Resource } from "../../types/resource";

type LauncherView = "core" | "local" | "all";

const launcherViews: Array<{ id: LauncherView; label: string }> = [
  { id: "core", label: "Core" },
  { id: "local", label: "Local" },
  { id: "all", label: "All" },
];

const routeCards = [
  {
    title: "Capture",
    detail: "Quick intake",
    to: "/capture",
    badge: "Local",
  },
  {
    title: "Knowledge",
    detail: "Open Wiki.js",
    to: "/knowledge",
    badge: "Wiki.js",
  },
  {
    title: "Server",
    detail: "Local tools",
    to: "/server",
    badge: "Local",
  },
  {
    title: "System",
    detail: "Ops sections",
    to: "/system",
    badge: "Ops",
  },
] as const;

function matchesView(resource: Resource, view: LauncherView) {
  if (view === "all") {
    return true;
  }

  if (view === "local") {
    return resource.portalRole === "bridge" || resource.portalRole === "browser-run" || resource.zone !== "public";
  }

  return resource.portalRole === "front-door" || resource.portalRole === "bridge";
}

function resourceRank(resource: Resource) {
  if (resource.id === "gethomepage") return 0;
  if (resource.id === "wiki-js") return 1;
  if (resource.portalRole === "bridge") return 2;
  if (resource.portalRole === "front-door") return 3;
  if (resource.portalRole === "browser-run") return 4;
  return 5;
}

export function StartPage() {
  const { getResource, resources } = useRegistry();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const privateLauncher = getResource("gethomepage");
  const privateLauncherHref = privateLauncher ? resolveLaunchUrl(privateLauncher) : undefined;

  const activeView = (searchParams.get("view") as LauncherView | null) ?? "core";
  const normalizedQuery = query.trim().toLowerCase();

  const visibleResources = useMemo(() => {
    return resources
      .filter((resource) => resource.id !== "qiaccess")
      .filter((resource) => matchesView(resource, activeView))
      .filter((resource) => {
        if (!normalizedQuery) {
          return true;
        }

        const haystack = [
          resource.name,
          resource.description,
          resource.tags.join(" "),
          resource.notes ?? "",
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedQuery);
      })
      .sort((left, right) => resourceRank(left) - resourceRank(right) || left.name.localeCompare(right.name));
  }, [activeView, normalizedQuery, resources]);

  return (
    <div className="grid gap-4">
      <section className="panel p-5 sm:p-6">
        <div className="eyebrow">QiAccess Start</div>
        <h1 className="mt-2 text-2xl font-semibold text-heading sm:text-3xl">Open what you need.</h1>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Link className="button-primary h-12" to="/capture">
            Capture
          </Link>
          <Link className="button-secondary h-12" to="/knowledge">
            Wiki.js
          </Link>
          <Link className="button-secondary h-12" to="/server">
            Server
          </Link>
          {privateLauncherHref ? (
            <a className="button-secondary h-12" href={privateLauncherHref} rel="noreferrer" target="_blank">
              Private Launcher
            </a>
          ) : null}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {routeCards.map((card) => (
          <Link className="panel card-lift flex min-h-[128px] flex-col gap-2 p-5" key={card.title} to={card.to}>
            <div className="flex items-center justify-between gap-3">
              <div className="text-lg font-semibold text-heading">{card.title}</div>
              <span className="chip-brand">{card.badge}</span>
            </div>
            <div className="text-sm text-body">{card.detail}</div>
            <div className="mt-auto text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">Open route</div>
          </Link>
        ))}
      </section>

      <section className="panel overflow-hidden">
        <div className="border-b border-border bg-surface-2 px-4 py-3 sm:px-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="eyebrow">Launchers</div>
              <h2 className="mt-1 text-xl font-semibold text-heading">Click and go</h2>
            </div>
            <div className="chip">
              {visibleResources.length} visible
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-4 sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
            <input
              className="field"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search..."
              value={query}
            />
            <div className="flex flex-wrap gap-2">
              {launcherViews.map((view) => (
                <button
                  className={activeView === view.id ? "button-primary" : "button-secondary"}
                  key={view.id}
                  onClick={() => setSearchParams({ view: view.id })}
                  type="button"
                >
                  {view.label}
                </button>
              ))}
            </div>
          </div>

          {visibleResources.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {visibleResources.map((resource) => {
                const href = resolveLaunchUrl(resource);
                const docsHref = resolveDocsUrl(resource);

                return (
                  <article className="panel-muted flex min-h-[150px] flex-col gap-3 p-4" key={resource.id}>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-base font-semibold text-heading">{resource.name}</div>
                      <span className={resource.status === "online" ? "chip-brand" : "chip"}>{resource.status ?? "unknown"}</span>
                    </div>

                    <div className="text-sm text-body">{resource.description}</div>

                    <div className="mt-auto flex flex-wrap gap-2 pt-1">
                      {href ? (
                        <a className="button-primary" href={href} rel="noreferrer" target="_blank">
                          Open
                        </a>
                      ) : null}
                      {!href ? <span className="chip">{verificationLabel(resource.verificationState)}</span> : null}
                    </div>

                    {docsHref || resource.repoUrl ? (
                      <details className="mt-1">
                        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                          More
                        </summary>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {docsHref ? (
                            <a className="button-secondary" href={docsHref} rel="noreferrer" target="_blank">
                              Docs
                            </a>
                          ) : null}
                          {resource.repoUrl ? (
                            <a className="button-secondary" href={resource.repoUrl} rel="noreferrer" target="_blank">
                              Repo
                            </a>
                          ) : null}
                        </div>
                      </details>
                    ) : null}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-surface-2 p-4 text-sm text-muted">
              No launchers match the current search and view.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
