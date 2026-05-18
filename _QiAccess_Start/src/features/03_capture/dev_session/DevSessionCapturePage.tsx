import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useFeedback } from "../../../components/feedback/FeedbackProvider";
import { formatSavedAt } from "../shared/captureLabels";
import { RecentDevHistoryList } from "./components/RecentDevHistoryList";
import { DevSessionArrayField } from "./components/DevSessionArrayField";
import {
  archiveDevHistoryRecord,
  createDevHistoryRecord,
  listRecentDevHistoryRecords,
  updateDevHistoryRecord,
} from "./devHistoryApi";
import type {
  DevHistoryRecord,
  DevHistoryRecordType,
  DevHistoryStatus,
  DevSessionDraft,
} from "./devHistoryTypes";
import {
  buildDevSessionId,
  buildMarkdownBody,
  createEmptyDevSessionDraft,
  draftToInsertInput,
  recordToDraft,
} from "./devSessionTemplate";
import { useDevSessionDraft } from "./hooks/useDevSessionDraft";

const recordTypeOptions: DevHistoryRecordType[] = [
  "dev_session",
  "bug_report",
  "codex_prompt",
  "architecture_decision",
  "schema_change",
  "tool_build",
  "research_note",
];

const statusOptions: DevHistoryStatus[] = [
  "draft",
  "planned",
  "in_progress",
  "blocked",
  "completed",
  "archived",
];

function parseCommaSeparated(value: string) {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function formatCommaSeparated(value: string[]) {
  return value.join(", ");
}

export function DevSessionCapturePage() {
  const { draft, setDraft, resetDraft, savedAt } = useDevSessionDraft();
  const { notify } = useFeedback();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);
  const [recentRecords, setRecentRecords] = useState<DevHistoryRecord[]>([]);
  const [recentError, setRecentError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [autoSyncMarkdown, setAutoSyncMarkdown] = useState(true);
  const previousSuggestedSessionId = useRef(buildDevSessionId(draft.session_date, draft.title));

  useEffect(() => {
    void loadRecentRecords();
  }, []);

  useEffect(() => {
    const suggestedSessionId = buildDevSessionId(draft.session_date, draft.title);
    const previousSuggested = previousSuggestedSessionId.current;

    if ((!draft.session_id.trim() || draft.session_id === previousSuggested) && draft.session_id !== suggestedSessionId) {
      setDraft((currentDraft) => ({
        ...currentDraft,
        session_id: suggestedSessionId,
      }));
    }

    previousSuggestedSessionId.current = suggestedSessionId;
  }, [draft.session_date, draft.title, draft.session_id, setDraft]);

  useEffect(() => {
    if (!autoSyncMarkdown) {
      return;
    }

    const nextMarkdown = buildMarkdownBody(draft);
    if (nextMarkdown === draft.markdown_body) {
      return;
    }

    setDraft((currentDraft) => ({
      ...currentDraft,
      markdown_body: buildMarkdownBody(currentDraft),
    }));
  }, [autoSyncMarkdown, draft, setDraft]);

  async function loadRecentRecords() {
    setIsLoadingRecent(true);
    setRecentError(null);

    try {
      const records = await listRecentDevHistoryRecords();
      setRecentRecords(records);
    } catch (error) {
      setRecentError(error instanceof Error ? error.message : "Unable to load recent dev history.");
    } finally {
      setIsLoadingRecent(false);
    }
  }

  function updateDraft<K extends keyof DevSessionDraft>(key: K, value: DevSessionDraft[K]) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [key]: value,
    }));
  }

  function handleSelectRecord(record: DevHistoryRecord) {
    setAutoSyncMarkdown(false);
    resetDraft(recordToDraft(record));
    notify("Loaded record", "The selected dev history record was loaded into the form for editing.");
  }

  async function handleSave() {
    setIsSaving(true);
    setSaveError(null);

    try {
      const input = draftToInsertInput(draft);
      const savedRecord = draft.id
        ? await updateDevHistoryRecord(draft.id, input)
        : await createDevHistoryRecord(input);

      resetDraft(recordToDraft(savedRecord));
      await loadRecentRecords();
      notify(
        draft.id ? "Dev session updated" : "Dev session saved",
        "Structured build history was saved to dev_history."
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save dev session record.";
      setSaveError(message);
      notify("Save failed", message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleArchive() {
    if (!draft.id) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      await archiveDevHistoryRecord(draft.id);
      resetDraft(createEmptyDevSessionDraft());
      setAutoSyncMarkdown(true);
      await loadRecentRecords();
      notify("Record archived", "The current dev history record was marked as archived.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to archive dev history record.";
      setSaveError(message);
      notify("Archive failed", message);
    } finally {
      setIsSaving(false);
    }
  }

  function handleReset() {
    resetDraft(createEmptyDevSessionDraft());
    setAutoSyncMarkdown(true);
    setSaveError(null);
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
      <section className="grid gap-4">
        <div className="panel p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="eyebrow">Dev Session Capture</div>
              <h1 className="mt-2 text-2xl font-semibold text-heading">Structured build history and restart receipt</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-body">
                Capture first. Route later. Use this screen for real development-session history, decisions, risks,
                validation, and restart prompts that should survive context loss.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip-brand">{formatSavedAt(savedAt)}</span>
              <Link className="button-secondary" to="/capture">
                Back to Capture Hub
              </Link>
              <Link className="button-secondary" to="/capture/quick">
                Open Quick Capture
              </Link>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="panel-muted p-4">
              <div className="text-[11px] font-bold uppercase tracking-widest text-subtle">Purpose</div>
              <div className="mt-2 text-sm leading-6 text-body">
                Structured development history, not a generic notes page.
              </div>
            </div>
            <div className="panel-muted p-4">
              <div className="text-[11px] font-bold uppercase tracking-widest text-subtle">Route Target</div>
              <div className="mt-2 text-sm font-semibold text-heading">Dev session = structured build history</div>
              <div className="mt-1 text-xs leading-5 text-muted">
                Save to `public.dev_history` with authenticated ownership.
              </div>
            </div>
            <div className="panel-muted p-4">
              <div className="text-[11px] font-bold uppercase tracking-widest text-subtle">Draft Safety Net</div>
              <div className="mt-2 text-sm leading-6 text-body">
                Local draft recovery stays active until reset or a newer record is loaded.
              </div>
            </div>
            <div className="panel-muted p-4">
              <div className="text-[11px] font-bold uppercase tracking-widest text-subtle">Markdown Sync</div>
              <div className="mt-2 text-sm leading-6 text-body">
                Structured fields generate the restart receipt markdown body for export and future ingestion.
              </div>
            </div>
          </div>
        </div>

        <div className="panel p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <div className="text-sm font-semibold text-heading">Title</div>
              <input
                className="field"
                onChange={(event) => updateDraft("title", event.target.value)}
                placeholder="Audit capture routing for dev history"
                value={draft.title}
              />
            </label>
            <label className="grid gap-2">
              <div className="text-sm font-semibold text-heading">Session ID</div>
              <input
                className="field font-mono"
                onChange={(event) => updateDraft("session_id", event.target.value)}
                placeholder="2026-05-16-audit-capture-routing"
                value={draft.session_id}
              />
            </label>
            <label className="grid gap-2">
              <div className="text-sm font-semibold text-heading">Session Date</div>
              <input
                className="field"
                onChange={(event) => updateDraft("session_date", event.target.value)}
                type="date"
                value={draft.session_date}
              />
            </label>
            <label className="grid gap-2">
              <div className="text-sm font-semibold text-heading">Record Type</div>
              <select
                className="field"
                onChange={(event) => updateDraft("record_type", event.target.value as DevHistoryRecordType)}
                value={draft.record_type}
              >
                {recordTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2">
              <div className="text-sm font-semibold text-heading">Status</div>
              <select
                className="field"
                onChange={(event) => updateDraft("status", event.target.value as DevHistoryStatus)}
                value={draft.status}
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2">
              <div className="text-sm font-semibold text-heading">Session Type</div>
              <input
                className="field"
                onChange={(event) => updateDraft("session_type", event.target.value)}
                placeholder="audit, implementation, fix, research"
                value={draft.session_type}
              />
            </label>
            <label className="grid gap-2">
              <div className="text-sm font-semibold text-heading">Project</div>
              <input className="field" onChange={(event) => updateDraft("project", event.target.value)} value={draft.project} />
            </label>
            <label className="grid gap-2">
              <div className="text-sm font-semibold text-heading">Repo</div>
              <input className="field" onChange={(event) => updateDraft("repo", event.target.value)} value={draft.repo} />
            </label>
            <label className="grid gap-2">
              <div className="text-sm font-semibold text-heading">Branch</div>
              <input className="field" onChange={(event) => updateDraft("branch", event.target.value)} value={draft.branch} />
            </label>
            <label className="grid gap-2">
              <div className="text-sm font-semibold text-heading">Feature Area</div>
              <input
                className="field"
                onChange={(event) => updateDraft("feature_area", event.target.value)}
                value={draft.feature_area}
              />
            </label>
          </div>

          <div className="mt-4 grid gap-4">
            <label className="grid gap-2">
              <div className="text-sm font-semibold text-heading">Summary</div>
              <textarea className="field min-h-[88px]" onChange={(event) => updateDraft("summary", event.target.value)} value={draft.summary} />
            </label>
            <label className="grid gap-2">
              <div className="text-sm font-semibold text-heading">Purpose</div>
              <textarea className="field min-h-[88px]" onChange={(event) => updateDraft("purpose", event.target.value)} value={draft.purpose} />
            </label>
            <label className="grid gap-2">
              <div className="text-sm font-semibold text-heading">Context</div>
              <textarea className="field min-h-[112px]" onChange={(event) => updateDraft("context", event.target.value)} value={draft.context} />
            </label>
            <label className="grid gap-2">
              <div className="text-sm font-semibold text-heading">Final Outcome</div>
              <textarea
                className="field min-h-[88px]"
                onChange={(event) => updateDraft("final_outcome", event.target.value)}
                value={draft.final_outcome}
              />
            </label>
            <label className="grid gap-2">
              <div className="text-sm font-semibold text-heading">Restart Prompt</div>
              <textarea
                className="field min-h-[112px]"
                onChange={(event) => updateDraft("restart_prompt", event.target.value)}
                value={draft.restart_prompt}
              />
            </label>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <div className="text-sm font-semibold text-heading">Tags</div>
              <input
                className="field"
                onChange={(event) => updateDraft("tags", parseCommaSeparated(event.target.value))}
                placeholder="capture, qiaccess, routing"
                value={formatCommaSeparated(draft.tags)}
              />
            </label>
            <label className="grid gap-2">
              <div className="text-sm font-semibold text-heading">Related Tables</div>
              <input
                className="field"
                onChange={(event) => updateDraft("related_tables", parseCommaSeparated(event.target.value))}
                placeholder="dev_history, capture_items"
                value={formatCommaSeparated(draft.related_tables)}
              />
            </label>
            <label className="grid gap-2">
              <div className="text-sm font-semibold text-heading">Related Tools</div>
              <input
                className="field"
                onChange={(event) => updateDraft("related_tools", parseCommaSeparated(event.target.value))}
                placeholder="codex, supabase, vite"
                value={formatCommaSeparated(draft.related_tools)}
              />
            </label>
            <label className="grid gap-2">
              <div className="text-sm font-semibold text-heading">Artifact URLs</div>
              <input
                className="field"
                onChange={(event) => updateDraft("artifact_urls", parseCommaSeparated(event.target.value))}
                placeholder="https://..."
                value={formatCommaSeparated(draft.artifact_urls)}
              />
            </label>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <DevSessionArrayField
              description="One path per line."
              label="Related Files"
              onChange={(value) => updateDraft("related_files", value)}
              placeholder="src/features/03_capture/CapturePage.tsx"
              value={draft.related_files}
            />
            <DevSessionArrayField
              description="One path per line."
              label="Artifact Paths"
              onChange={(value) => updateDraft("artifact_paths", value)}
              placeholder="docs/dev_history/session-2026-05-16.md"
              value={draft.artifact_paths}
            />
          </div>
        </div>

        <div className="panel p-6">
          <div className="eyebrow">Structured Sections</div>
          <h2 className="mt-2 text-xl font-semibold text-heading">Session detail arrays</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <DevSessionArrayField label="Decisions" onChange={(value) => updateDraft("decisions", value)} value={draft.decisions} />
            <DevSessionArrayField
              label="Files Affected"
              onChange={(value) => updateDraft("files_affected", value)}
              value={draft.files_affected}
            />
            <DevSessionArrayField
              label="Folders Affected"
              onChange={(value) => updateDraft("folders_affected", value)}
              value={draft.folders_affected}
            />
            <DevSessionArrayField
              label="Database Notes"
              onChange={(value) => updateDraft("database_notes", value)}
              value={draft.database_notes}
            />
            <DevSessionArrayField
              label="Implementation Plan"
              onChange={(value) => updateDraft("implementation_plan", value)}
              value={draft.implementation_plan}
            />
            <DevSessionArrayField
              label="Code Artifacts"
              onChange={(value) => updateDraft("code_artifacts", value)}
              value={draft.code_artifacts}
            />
            <DevSessionArrayField label="Prompts" onChange={(value) => updateDraft("prompts", value)} value={draft.prompts} />
            <DevSessionArrayField label="Risks" onChange={(value) => updateDraft("risks", value)} value={draft.risks} />
            <DevSessionArrayField
              label="Validation Checklist"
              onChange={(value) => updateDraft("validation_checklist", value)}
              value={draft.validation_checklist}
            />
            <DevSessionArrayField
              label="Next Actions"
              onChange={(value) => updateDraft("next_actions", value)}
              value={draft.next_actions}
            />
          </div>
        </div>

        <div className="panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="eyebrow">Markdown Body</div>
              <h2 className="mt-2 text-xl font-semibold text-heading">Restart receipt markdown</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-body">
                <input
                  checked={autoSyncMarkdown}
                  onChange={(event) => setAutoSyncMarkdown(event.target.checked)}
                  type="checkbox"
                />
                Auto-sync
              </label>
              <button
                className="button-secondary"
                onClick={() => updateDraft("markdown_body", buildMarkdownBody(draft))}
                type="button"
              >
                Sync Markdown
              </button>
            </div>
          </div>

          <textarea
            className="field mt-4 min-h-[420px] font-mono text-sm"
            onChange={(event) => {
              setAutoSyncMarkdown(false);
              updateDraft("markdown_body", event.target.value);
            }}
            value={draft.markdown_body}
          />

          {saveError ? (
            <div className="mt-4 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
              {saveError}
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            <button className="button-primary" disabled={isSaving} onClick={handleSave} type="button">
              {isSaving ? "Saving…" : draft.id ? "Update Dev Session" : "Save Dev Session"}
            </button>
            <button className="button-secondary" onClick={handleReset} type="button">
              Reset Draft
            </button>
            {draft.id ? (
              <button className="button-secondary" disabled={isSaving} onClick={handleArchive} type="button">
                Archive Record
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <aside className="grid gap-4">
        <div className="panel p-5">
          <div className="eyebrow">Recent Dev History</div>
          <h2 className="mt-2 text-xl font-semibold text-heading">Recent records</h2>
          <p className="mt-2 text-sm leading-6 text-body">
            Click a recent record to load it into the form for editing. This is the structured build history lane, not a
            project tracker.
          </p>
          <div className="mt-4">
            <RecentDevHistoryList
              error={recentError}
              isLoading={isLoadingRecent}
              onSelect={handleSelectRecord}
              records={recentRecords}
            />
          </div>
        </div>
      </aside>
    </div>
  );
}
