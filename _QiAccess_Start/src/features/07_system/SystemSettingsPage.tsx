import { useFeedback } from "../../components/feedback/FeedbackProvider";
import { DownloadIcon, RefreshCwIcon } from "../../components/icons/qi-icons";
import { AuthBoundary } from "../../components/layout/AuthBoundary";
import { useRegistry } from "../resources/registry-store";

export function SystemSettingsPage() {
  const { exportRegistry, resetRegistry } = useRegistry();
  const { notify } = useFeedback();

  function downloadRegistry() {
    const blob = new Blob([exportRegistry()], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = "qiaccess-registry.json";
    anchor.click();
    URL.revokeObjectURL(href);
    notify("Registry exported", "Downloaded the current merged QiAccess registry JSON.");
  }

  function handleResetRegistry() {
    const confirmed = window.confirm("Reset local QiAccess edits stored in this browser?");
    if (!confirmed) {
      return;
    }

    resetRegistry();
    notify("Local edits reset", "Seed resource data is active again.");
  }

  return (
    <div className="grid gap-4">
      <AuthBoundary>
        <div className="text-sm text-muted">
          Treat `web/`, `local/`, and `worker/` as frozen legacy surfaces until live deployment is verified.
        </div>
      </AuthBoundary>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <section className="panel p-6">
          <div className="eyebrow">Registry Controls</div>
          <h1 className="mt-2 text-3xl font-semibold text-heading">Local editing and export</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-body">
            This phase keeps the registry local and explicit. Export and reset are here so the static shell stays easy
            to tune without pretending there is backend persistence.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button className="button-primary" onClick={downloadRegistry} type="button">
              <DownloadIcon className="h-4 w-4" />
              Export registry JSON
            </button>
            <button className="button-secondary" onClick={handleResetRegistry} type="button">
              <RefreshCwIcon className="h-4 w-4" />
              Reset local edits
            </button>
          </div>
        </section>

        <section className="panel p-6">
          <div className="eyebrow">Surface Disposition</div>
          <h2 className="mt-2 text-2xl font-semibold text-heading">Frozen until live verification</h2>
          <div className="mt-4 grid gap-3 text-sm text-body">
            <div className="panel-muted p-4">`src/` is the active app.</div>
            <div className="panel-muted p-4">`web/` is the legacy static portal and stays in place.</div>
            <div className="panel-muted p-4">`local/` is the legacy Homepage/qiserver stack and stays in place.</div>
            <div className="panel-muted p-4">`worker/` is the legacy bookmarks API and stays in place.</div>
          </div>
        </section>
      </div>
    </div>
  );
}
