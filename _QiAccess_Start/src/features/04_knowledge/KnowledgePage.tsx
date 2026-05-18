import { Link } from "react-router-dom";
import { resolveLaunchUrl, verificationLabel } from "../../lib/status/resource-status";
import { useRegistry } from "../resources/registry-store";

export function KnowledgePage() {
  const { getResource } = useRegistry();
  const wiki = getResource("wiki-js");
  const href = wiki ? resolveLaunchUrl(wiki) : undefined;

  return (
    <div className="grid gap-4">
      <section className="panel p-6">
        <div className="eyebrow">Knowledge</div>
        <h1 className="mt-2 text-2xl font-semibold text-heading">Knowledge lives in Wiki.js</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-body">
          QiAccess no longer carries its own knowledge hub or patient archive surface. This route stays as a clean handoff into Wiki.js and related system context only.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {href ? (
            <a className="button-primary" href={href} rel="noreferrer" target="_blank">
              Open Wiki.js
            </a>
          ) : null}
          <Link className="button-secondary" to="/system/integrations">
            Open Integrations
          </Link>
          <Link className="button-secondary" to="/server/wiki-js">
            Open Server Context
          </Link>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="panel-muted p-5">
          <div className="text-[11px] font-bold uppercase tracking-widest text-subtle">Status</div>
          <div className="mt-2 text-lg font-semibold text-heading">{wiki ? verificationLabel(wiki.verificationState) : "Missing"}</div>
          <div className="mt-2 text-sm leading-6 text-body">Private Wiki.js route is the live knowledge surface for this app.</div>
        </div>

        <div className="panel-muted p-5">
          <div className="text-[11px] font-bold uppercase tracking-widest text-subtle">Public Route</div>
          <div className="mt-2 text-lg font-semibold text-heading">Degraded</div>
          <div className="mt-2 text-sm leading-6 text-body">Use the private route until the public Wiki.js tunnel is repaired.</div>
        </div>

        <div className="panel-muted p-5">
          <div className="text-[11px] font-bold uppercase tracking-widest text-subtle">Purpose</div>
          <div className="mt-2 text-lg font-semibold text-heading">Handoff only</div>
          <div className="mt-2 text-sm leading-6 text-body">QiAccess points to knowledge. It does not duplicate the knowledge base anymore.</div>
        </div>
      </section>
    </div>
  );
}
