export function SystemSecurityPage() {
  return (
    <div className="grid gap-4">
      <section className="panel p-6">
        <div className="eyebrow">Security</div>
        <h1 className="mt-2 text-2xl font-semibold text-heading">Security posture and surface boundaries</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-body">
          QiAccess should explain private versus public boundaries clearly. It should not expose secrets, collapse private admin tools into public launch paths, or blur tailnet-only services into public-safe surfaces.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="panel-muted p-5">
          <div className="eyebrow">Public</div>
          <div className="mt-2 text-lg font-semibold text-heading">Front door only</div>
          <p className="mt-3 text-sm leading-6 text-body">Public routes should stay explanatory and launch-safe, with no private infrastructure details exposed unnecessarily.</p>
        </div>

        <div className="panel-muted p-5">
          <div className="eyebrow">Private</div>
          <div className="mt-2 text-lg font-semibold text-heading">Tailnet and admin tools</div>
          <p className="mt-3 text-sm leading-6 text-body">Cockpit, Portainer, Paperless, NocoDB, and similar tools belong behind private-only or admin-only access labels.</p>
        </div>

        <div className="panel-muted p-5">
          <div className="eyebrow">Rule</div>
          <div className="mt-2 text-lg font-semibold text-heading">No fake safety</div>
          <p className="mt-3 text-sm leading-6 text-body">If a route, tunnel, or access mode is not verified, mark it honestly instead of implying a secure or public-ready state.</p>
        </div>
      </section>
    </div>
  );
}
