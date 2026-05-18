import { Link } from "react-router-dom";
import { systemModules, systemSectionContent } from "../../data/systemModules";
import { resolveLaunchUrl } from "../../lib/status/resource-status";
import { useRegistry } from "../resources/registry-store";

export function SystemOverviewPage() {
  const { getResource } = useRegistry();

  return (
    <div className="grid gap-4">
      <section className="panel p-6">
        <div className="eyebrow">System</div>
        <h1 className="mt-2 text-2xl font-semibold text-heading">Operator launch pad</h1>
      </section>

      <section className="grid gap-3 xl:grid-cols-2">
        {systemModules.map((module) => {
          const section = systemSectionContent[module.id];

          return (
            <section className="panel-muted p-5" key={module.id}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="eyebrow">{module.eyebrow}</div>
                  <h2 className="mt-1 text-lg font-semibold text-heading">{module.title}</h2>
                </div>
                <Link className="button-secondary" to={module.to}>
                  Open
                </Link>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {section.entries.slice(0, 5).map((entry) => {
                  const resource = entry.resourceId ? getResource(entry.resourceId) ?? null : null;
                  const href = entry.href ?? (resource ? resolveLaunchUrl(resource) : undefined);
                  const to = entry.to;

                  if (href) {
                    return (
                      <a className="button-secondary" href={href} key={`${module.id}-${entry.title}`} rel="noreferrer" target="_blank">
                        {entry.title}
                      </a>
                    );
                  }

                  if (to) {
                    return (
                      <Link className="button-secondary" key={`${module.id}-${entry.title}`} to={to}>
                        {entry.title}
                      </Link>
                    );
                  }

                  return (
                    <span className="chip" key={`${module.id}-${entry.title}`}>
                      {entry.title}
                    </span>
                  );
                })}
              </div>
            </section>
          );
        })}
      </section>
    </div>
  );
}
