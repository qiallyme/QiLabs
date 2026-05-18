import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useFeedback } from "../../components/feedback/FeedbackProvider";
import {
  captureModes,
  resolveCaptureMode,
  type CaptureTargetId,
} from "../../data/captureModes";
import { resolveLaunchUrl, verificationLabel } from "../../lib/status/resource-status";
import { useRegistry } from "../resources/registry-store";
import { clearCaptureDraft, readCaptureDraft, saveCaptureDraft } from "./captureDraftStore";
import {
  formatSavedAt,
  getBucketPresentation,
  getTargetPresentation,
} from "./shared/captureLabels";
import { buildCapturePayload } from "./shared/captureRouting";

export function CapturePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getResource } = useRegistry();
  const { notify } = useFeedback();
  const activeMode = resolveCaptureMode(searchParams.get("mode"));
  const [draft, setDraft] = useState(() => readCaptureDraft(activeMode.id).text);
  const [savedAt, setSavedAt] = useState<string | null>(() => readCaptureDraft(activeMode.id).updatedAt);
  const capturePayload = buildCapturePayload({ body: draft, mode: activeMode });
  const bucket = getBucketPresentation(activeMode.bucketId);
  const paperless = getResource("paperless");
  const qinexus = getResource("qinexus");
  const knowledge = getResource("qinote") ?? getResource("wiki-js");

  useEffect(() => {
    const storedDraft = readCaptureDraft(activeMode.id);
    setDraft(storedDraft.text);
    setSavedAt(storedDraft.updatedAt);
  }, [activeMode.id]);

  const targetCards: Array<{
    id: CaptureTargetId;
    title: string;
    detail: string;
    note: string;
    badge: string;
    href?: string;
    hrefLabel?: string;
    to?: string;
    toLabel?: string;
  }> = [
    {
      id: "qinexus-inbox",
      title: getTargetPresentation("qinexus-inbox").label,
      detail: `Manual first-pass intake for the ${bucket.label} bucket before deeper routing.`,
      note: getTargetPresentation("qinexus-inbox").summary,
      badge: "Universal intake",
      href: qinexus ? resolveLaunchUrl(qinexus) : undefined,
      hrefLabel: qinexus?.verificationState === "docs-only" ? "Open Drive Anchor" : "Open QiNexus",
      to: "/system/storage",
      toLabel: "View Storage",
    },
    {
      id: "paperless",
      title: getTargetPresentation("paperless").label,
      detail: "Best fit when this capture becomes a real document, scan, packet, or document queue item.",
      note: paperless?.notes ?? "Paperless remains the first real ingestion target once the live path is verified.",
      badge: paperless ? verificationLabel(paperless.verificationState) : "Pending verification",
      href: paperless ? resolveLaunchUrl(paperless) : undefined,
      hrefLabel: "Open Paperless",
      to: "/system/storage",
      toLabel: "Storage Context",
    },
    {
      id: "knowledge",
      title: getTargetPresentation("knowledge").label,
      detail: "Use this when the capture should become reusable reference, vector context, or routed knowledge.",
      note:
        knowledge?.notes ??
        "The in-app docs module is now the primary documentation surface. External knowledge tools can stay reference-only.",
      badge: "In App Docs",
      href: knowledge ? resolveLaunchUrl(knowledge) : undefined,
      hrefLabel: `Open ${knowledge?.name ?? "Knowledge"}`,
      to: "/knowledge",
      toLabel: "Open Knowledge",
    },
    {
      id: "system-storage",
      title: getTargetPresentation("system-storage").label,
      detail: "Check storage doctrine before over-sorting, creating a new path, or inventing a one-off bucket.",
      note: "Storage stays under System so the portal stays a front door instead of becoming the filing system.",
      badge: "Doctrine",
      to: "/system/storage",
      toLabel: "Open Storage",
    },
  ];

  async function handleCopy() {
    if (!draft.trim()) {
      notify("Nothing to copy", "Write something first, then copy or move it into the next lane.");
      return;
    }

    const payload = [
      `[${activeMode.title}]`,
      `Capture mode: ${capturePayload.capture_mode}`,
      `Recommended destination: ${bucket.label} (${capturePayload.bucket_id})`,
      `Route targets: ${capturePayload.recommended_targets
        .map((target) => getTargetPresentation(target).label)
        .join(", ")}`,
      capturePayload.requires_triage ? "Triage required: yes" : "Triage required: no",
      "",
      draft,
    ].join("\n");

    try {
      await window.navigator.clipboard.writeText(payload);
      notify("Draft copied", "The current capture draft was copied to the clipboard.");
    } catch {
      notify("Copy failed", "Clipboard access was blocked in this browser.");
    }
  }

  function handleClear() {
    clearCaptureDraft(activeMode.id);
    setDraft("");
    setSavedAt(null);
    notify("Draft cleared", "The local browser draft for this capture mode was removed.");
  }

  return (
    <div className="grid gap-4">
      <section className="grid gap-3 md:grid-cols-2">
        <Link
          className="panel p-5 transition hover:border-brand-300 hover:bg-surface hover:shadow-card-hover"
          to={`/capture/quick?mode=${activeMode.id}`}
        >
          <div className="eyebrow">Quick Note Capture</div>
          <h2 className="mt-2 text-xl font-semibold text-heading">Fast universal intake</h2>
          <p className="mt-3 text-sm leading-6 text-body">
            Capture first. Route later. Use the quick lane for fast notes and draft-safe markdown capture.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="chip-brand">Universal intake</span>
            <span className="chip">Draft safety net</span>
          </div>
        </Link>

        <Link
          className="panel p-5 transition hover:border-brand-300 hover:bg-surface hover:shadow-card-hover"
          to="/capture/dev-session"
        >
          <div className="eyebrow">Dev Session Capture</div>
          <h2 className="mt-2 text-xl font-semibold text-heading">Structured build history and restart receipt</h2>
          <p className="mt-3 text-sm leading-6 text-body">
            Save development history, decisions, affected files, validation, and restart prompts into `dev_history`.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="chip-brand">Structured build history</span>
            <span className="chip">Restart receipt</span>
          </div>
        </Link>
      </section>

      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="panel p-5">
        <div className="eyebrow">Capture</div>
        <h1 className="mt-2 text-2xl font-semibold text-heading">Universal intake</h1>
        <p className="mt-3 text-sm leading-6 text-body">
          Capture first. Route later. This is the intake lane for quick notes now and document, knowledge, Paperless,
          vector, and graph routing later.
        </p>
        <div className="mt-4 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-700">
          Draft safety net. Browser-local only for now, with the shape prepared for future persistence and routing.
        </div>
        <div className="mt-5 grid gap-2">
          {captureModes.map((mode) => (
            <button
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                mode.id === activeMode.id
                  ? "border-brand-400 bg-brand-50 shadow-ring-brand"
                  : "border-border bg-surface hover:border-brand-200 hover:shadow-card-hover"
              }`}
              key={mode.id}
              onClick={() => setSearchParams({ mode: mode.id })}
              type="button"
            >
              <div className="text-sm font-semibold text-heading">{mode.title}</div>
              <div className="mt-1 text-xs leading-5 text-muted">{mode.description}</div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="chip">{getBucketPresentation(mode.bucketId).label}</span>
                {mode.requiresTriage ? <span className="chip-brand">Triage required</span> : null}
              </div>
            </button>
          ))}
        </div>
      </aside>

      <section className="grid gap-4">
        <div className="panel p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="eyebrow">Active Mode</div>
              <h2 className="mt-1 text-2xl font-bold text-heading">{activeMode.title}</h2>
              <p className="mt-2 text-sm leading-6 text-body">{activeMode.description}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="chip-brand">Capture first. Route later.</span>
                {activeMode.requiresTriage ? <span className="chip">Triage required</span> : null}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip-brand">{formatSavedAt(savedAt)}</span>
              <Link className="button-secondary" to={`/capture/quick?mode=${activeMode.id}`}>
                Open Quick Route
              </Link>
              <Link className="button-secondary" to="/capture/dev-session">
                Open Dev Session
              </Link>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="panel-muted p-4">
              <div className="text-[11px] font-bold uppercase tracking-widest text-subtle">Coaching</div>
              <div className="mt-2 text-sm font-semibold text-heading">{activeMode.coaching}</div>
            </div>
            <div className="panel-muted p-4">
              <div className="text-[11px] font-bold uppercase tracking-widest text-subtle">Recommended Destination</div>
              <div className="mt-2 text-sm font-semibold text-heading">{bucket.label}</div>
              <div className="mt-1 font-mono text-xs text-brand-600">{activeMode.bucketId}</div>
              <div className="mt-2 text-xs leading-5 text-muted">{bucket.summary}</div>
            </div>
            <div className="panel-muted p-4">
              <div className="text-[11px] font-bold uppercase tracking-widest text-subtle">Why That Bucket</div>
              <div className="mt-2 text-sm leading-6 text-body">{activeMode.bucketReason}</div>
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
              <div className="text-[11px] font-bold uppercase tracking-widest text-subtle">Triage</div>
              <div className="mt-2 text-sm font-semibold text-heading">
                {activeMode.requiresTriage ? "Triage required" : "Triage note"}
              </div>
              {activeMode.triageNote ? (
                <div className="mt-1 text-sm leading-6 text-body">{activeMode.triageNote}</div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
            <div className="grid gap-3">
              <div>
                <div className="text-sm font-semibold text-heading">Draft</div>
                <div className="mt-1 text-xs leading-5 text-muted">Markdown or plain text. Local only until a future save succeeds.</div>
              </div>
              <textarea
                className="field min-h-[260px]"
                onChange={(event) => {
                  const snapshot = saveCaptureDraft(activeMode.id, event.target.value);
                  setDraft(event.target.value);
                  setSavedAt(snapshot.updatedAt);
                }}
                placeholder={activeMode.draftPlaceholder}
                value={draft}
              />
              <div className="flex flex-wrap gap-3">
                <button className="button-primary" onClick={handleCopy} type="button">
                  Copy Draft
                </button>
                <button className="button-secondary" onClick={handleClear} type="button">
                  Clear Draft
                </button>
              </div>
            </div>
            <div className="grid gap-3">
              <div className="text-sm font-semibold text-heading">Preview</div>
              <div className="panel-muted min-h-[260px] whitespace-pre-wrap p-5 text-sm leading-7 text-body">
                {draft.trim()
                  ? draft
                  : "Nothing captured yet. Use this screen as the universal intake lane, then route the item into the right system."}
              </div>
            </div>
          </div>
        </div>

        <div className="panel p-6">
          <div className="eyebrow">Route Targets</div>
          <h2 className="mt-2 text-2xl font-semibold text-heading">Recommended route targets</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {targetCards.map((target) => (
              <div className="panel-muted flex flex-col p-5" key={target.id}>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-sm font-semibold text-heading">{target.title}</div>
                  <span className={activeMode.recommendedTargets.includes(target.id) ? "chip-brand" : "chip"}>
                    {activeMode.recommendedTargets.includes(target.id) ? "Recommended now" : target.badge}
                  </span>
                </div>
                <div className="mt-2 text-sm leading-6 text-body">{target.detail}</div>
                <div className="mt-3 text-xs leading-5 text-muted">{target.note}</div>
                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                  {target.to ? (
                    <Link className="button-secondary" to={target.to}>
                      {target.toLabel}
                    </Link>
                  ) : null}
                  {target.href ? (
                    <a className="button-primary" href={target.href} rel="noreferrer" target="_blank">
                      {target.hrefLabel}
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      </div>
    </div>
  );
}
