import { resolveLaunchUrl } from "../../lib/status/resource-status";
import { useRegistry } from "../../features/resources/registry-store";
import { TreeMenu } from "./TreeMenu";

export function Sidebar() {
  const { getResource } = useRegistry();
  const toolbox = getResource("qione-tools");
  const privateLauncher = getResource("gethomepage");
  const toolboxHref = toolbox ? resolveLaunchUrl(toolbox) : undefined;
  const privateLauncherHref = privateLauncher ? resolveLaunchUrl(privateLauncher) : undefined;

  return (
    <aside className="flex h-full flex-col border-r border-border bg-surface shadow-sidebar backdrop-blur">
      <div className="border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500 text-base font-bold text-white shadow-card-hover">
            Q
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-heading">QiAccess</div>
            <div className="text-xs text-muted">Launch pad</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <TreeMenu />
      </div>

      <div className="border-t border-border px-4 py-3">
        {privateLauncher && privateLauncherHref ? (
          <div className="mb-3 rounded-2xl border border-brand-400/40 bg-brand-500/10 p-3">
            <a className="button-primary w-full justify-center" href={privateLauncherHref}>
              Private Launcher
            </a>
          </div>
        ) : null}
        {toolbox && toolboxHref ? (
          <div className="mb-3 rounded-2xl border border-border bg-surface-2 p-3">
            <a className="button-secondary w-full justify-center" href={toolboxHref}>
              QiOne Tools
            </a>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
