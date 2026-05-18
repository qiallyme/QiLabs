import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useFeedback } from "../../../components/feedback/FeedbackProvider";
import {
  captureModes,
  isCaptureModeId,
  resolveCaptureMode,
} from "../../../data/captureModes";
import { clearCaptureDraft, readCaptureDraft, saveCaptureDraft } from "../captureDraftStore";
import {
  formatSavedAt,
  getBucketPresentation,
  getTargetPresentation,
} from "../shared/captureLabels";

export function QuickCapturePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedMode = searchParams.get("mode");
  const activeMode = resolveCaptureMode(requestedMode);
  const bucket = getBucketPresentation(activeMode.bucketId);
  const { notify } = useFeedback();
  const [draft, setDraft] = useState(() => readCaptureDraft(activeMode.id).text);
  const [savedAt, setSavedAt] = useState<string | null>(() => readCaptureDraft(activeMode.id).updatedAt);

  useEffect(() => {
    if (requestedMode && !isCaptureModeId(requestedMode)) {
      setSearchParams({ mode: activeMode.id }, { replace: true });
    }
  }, [activeMode.id, requestedMode, setSearchParams]);

  useEffect(() => {
    const storedDraft = readCaptureDraft(activeMode.id);
    setDraft(storedDraft.text);
    setSavedAt(storedDraft.updatedAt);
  }, [activeMode.id]);

  async function handleCopy() {
    if (!draft.trim()) {
      notify("Nothing to copy", "Add a quick draft first.");
      return;
    }

    try {
      await window.navigator.clipboard.writeText(draft);
      notify("Quick draft copied", "The quick capture text was copied to the clipboard.");
    } catch {
      notify("Copy failed", "Clipboard access was blocked in this browser.");
    }
  }

  function handleClear() {
    clearCaptureDraft(activeMode.id);
    setDraft("");
    setSavedAt(null);
    notify("Quick draft cleared", "The local browser draft for this mode was removed.");
  }

  return (
    <div className="grid gap-4">
      <section className="panel p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="eyebrow">Quick Capture</div>
            <h1 className="mt-2 text-3xl font-semibold text-heading">Universal intake</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-body">
              Capture first. Route later. This quick lane keeps the fastest possible draft flow while staying aligned to
              future document, Paperless, knowledge, vector, and graph routing.
            </p>
          </div>
          <Link className="button-secondary" to="/capture">
            Open full Capture
          </Link>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {captureModes.map((mode) => (
          <button
            className={`rounded-2xl border p-5 text-left transition ${
              mode.id === activeMode.id
                ? "border-brand-400 bg-brand-50 shadow-ring-brand"
                : "border-border bg-surface hover:border-brand-200 hover:shadow-card-hover"
            }`}
            key={mode.id}
            onClick={() => setSearchParams({ mode: mode.id })}
            type="button"
          >
            <div className="text-base font-semibold text-heading">{mode.title}</div>
            <div className="mt-2 text-xs leading-5 text-muted">{mode.description}</div>
          </button>
        ))}
      </section>

      <section className="panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="eyebrow">Current Quick Lane</div>
            <div className="mt-1 text-xl font-semibold text-heading">{activeMode.title}</div>
            <div className="mt-2 text-sm leading-6 text-body">{activeMode.description}</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip-brand">{bucket.label}</span>
            <span className="chip">{activeMode.bucketId}</span>
            <span className="chip">{formatSavedAt(savedAt)}</span>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="panel-muted p-4">
            <div className="text-[11px] font-bold uppercase tracking-widest text-subtle">Coaching</div>
            <div className="mt-2 text-sm font-semibold text-heading">{activeMode.coaching}</div>
          </div>
          <div className="panel-muted p-4">
            <div className="text-[11px] font-bold uppercase tracking-widest text-subtle">Recommended Destination</div>
            <div className="mt-2 text-sm font-semibold text-heading">{bucket.label}</div>
            <div className="mt-1 font-mono text-xs text-brand-600">{activeMode.bucketId}</div>
          </div>
          <div className="panel-muted p-4">
            <div className="text-[11px] font-bold uppercase tracking-widest text-subtle">Recommended Route Targets</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {activeMode.recommendedTargets.map((target) => (
                <span className="chip" key={target}>
                  {getTargetPresentation(target).label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {activeMode.requiresTriage || activeMode.triageNote ? (
          <div className="mt-4 rounded-xl border border-border bg-surface-2 px-4 py-3">
            <div className="text-[11px] font-bold uppercase tracking-widest text-subtle">
              {activeMode.requiresTriage ? "Triage Required" : "Triage Note"}
            </div>
            <div className="mt-2 text-sm leading-6 text-body">
              {activeMode.triageNote ?? "This mode should be reviewed before it is routed into a downstream system."}
            </div>
          </div>
        ) : null}

        <div className="mt-4 text-xs leading-5 text-muted">
          Draft safety net. Markdown or plain text stays local in this browser until an explicit clear or a future save
          succeeds.
        </div>

        <textarea
          className="field mt-4 min-h-[220px]"
          onChange={(event) => {
            const snapshot = saveCaptureDraft(activeMode.id, event.target.value);
            setDraft(event.target.value);
            setSavedAt(snapshot.updatedAt);
          }}
          placeholder={activeMode.draftPlaceholder}
          value={draft}
        />

        <div className="mt-4 flex flex-wrap gap-2">
          <button className="button-primary" onClick={handleCopy} type="button">
            Copy
          </button>
          <button className="button-secondary" onClick={handleClear} type="button">
            Clear
          </button>
          <Link className="button-secondary" to={`/capture?mode=${activeMode.id}`}>
            Continue in full Capture
          </Link>
          <Link className="button-secondary" to="/system/storage">
            Open Storage
          </Link>
        </div>
      </section>
    </div>
  );
}
