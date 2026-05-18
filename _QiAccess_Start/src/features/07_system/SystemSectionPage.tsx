import { Link } from "react-router-dom";
import { systemSectionContent, type SystemModuleId } from "../../data/systemModules";
import {
  resolveDocsUrl,
  resolveLaunchUrl,
  verificationLabel,
} from "../../lib/status/resource-status";
import { useRegistry } from "../resources/registry-store";

type SystemSectionPageProps = {
  sectionId: SystemModuleId;
};

export function SystemSectionPage({ sectionId }: SystemSectionPageProps) {
  const { getResource } = useRegistry();
  const section = systemSectionContent[sectionId];

  return (
    <section className="panel p-6">
      <div className="eyebrow">{section.title}</div>
      <h2 className="mt-2 text-2xl font-semibold text-heading">{section.title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-body">{section.summary}</p>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {section.entries.map((entry) => {
          const resource = entry.resourceId ? getResource(entry.resourceId) ?? null : null;
          const href = entry.href ?? (resource ? resolveLaunchUrl(resource) : undefined);
          const docsHref = resource ? resolveDocsUrl(resource) : undefined;
          const note = entry.note ?? (resource?.notes ? resource.notes : null);

          return (
            <div className="panel-muted flex flex-col gap-3 p-5" key={`${sectionId}-${entry.title}`}>
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-base font-semibold text-heading">{entry.title}</div>
                {entry.privateOnly ? <span className="chip-brand">Private Only</span> : null}
                {resource ? <span className="chip">{verificationLabel(resource.verificationState)}</span> : null}
              </div>
              <div className="text-sm leading-6 text-body">{entry.description}</div>
              {note ? <div className="text-xs leading-5 text-muted">{note}</div> : null}
              <div className="mt-auto flex flex-wrap gap-2">
                {entry.to ? (
                  <Link className="button-secondary" to={entry.to}>
                    Open In App
                  </Link>
                ) : null}
                {href ? (
                  <a className="button-primary" href={href} rel="noreferrer" target="_blank">
                    Open Link
                  </a>
                ) : null}
                {docsHref ? (
                  <a className="button-secondary" href={docsHref} rel="noreferrer" target="_blank">
                    View Docs
                  </a>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
