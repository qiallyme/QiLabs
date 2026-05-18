import { SaveIcon, XIcon } from "../icons/qi-icons";
import { useEffect, useState } from "react";
import type { Resource } from "../../types/resource";

type ResourceEditorDrawerProps = {
  onClose: () => void;
  onSave: (resourceId: string, values: Pick<Resource, "description" | "docsUrl" | "notes" | "repoUrl" | "status" | "tags">) => void;
  resource: Resource | null;
};

type DraftState = {
  description: string;
  docsUrl: string;
  notes: string;
  repoUrl: string;
  status: Resource["status"];
  tags: string;
};

export function ResourceEditorDrawer({ onClose, onSave, resource }: ResourceEditorDrawerProps) {
  const [draft, setDraft] = useState<DraftState>({
    description: "",
    docsUrl: "",
    notes: "",
    repoUrl: "",
    status: "unknown",
    tags: "",
  });

  useEffect(() => {
    if (!resource) {
      return;
    }

    setDraft({
      description: resource.description,
      docsUrl: resource.docsUrl ?? "",
      notes: resource.notes ?? "",
      repoUrl: resource.repoUrl ?? "",
      status: resource.status ?? "unknown",
      tags: resource.tags.join(", "),
    });
  }, [resource]);

  if (!resource) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-heading/30 backdrop-blur-sm">
      <div className="animate-slide-in flex h-full w-full max-w-xl flex-col border-l border-border bg-surface shadow-2xl">
        {/* Drawer header */}
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div>
            <div className="eyebrow">Edit Entry</div>
            <h2 className="mt-1 text-xl font-bold text-heading">{resource.name}</h2>
            <p className="mt-1 text-sm text-muted">Adjust local registry data. Supabase replaces this layer in v2.</p>
          </div>
          <button className="button-ghost" onClick={onClose} type="button">
            <XIcon className="h-4 w-4" />
            Close
          </button>
        </div>

        {/* Form body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid gap-5">
            <label className="grid gap-1.5">
              <span className="text-sm font-semibold text-body">Description</span>
              <textarea
                className="field min-h-28 resize-y"
                onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                value={draft.description}
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-1.5">
                <span className="text-sm font-semibold text-body">Docs URL</span>
                <input
                  className="field"
                  onChange={(event) => setDraft((current) => ({ ...current, docsUrl: event.target.value }))}
                  value={draft.docsUrl}
                />
              </label>
              <label className="grid gap-1.5">
                <span className="text-sm font-semibold text-body">Repo URL</span>
                <input
                  className="field"
                  onChange={(event) => setDraft((current) => ({ ...current, repoUrl: event.target.value }))}
                  value={draft.repoUrl}
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-[160px_minmax(0,1fr)]">
              <label className="grid gap-1.5">
                <span className="text-sm font-semibold text-body">Status</span>
                <select
                  className="field"
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      status: event.target.value as Resource["status"],
                    }))
                  }
                  value={draft.status}
                >
                  <option value="online">online</option>
                  <option value="offline">offline</option>
                  <option value="unknown">unknown</option>
                </select>
              </label>
              <label className="grid gap-1.5">
                <span className="text-sm font-semibold text-body">Tags</span>
                <input
                  className="field"
                  onChange={(event) => setDraft((current) => ({ ...current, tags: event.target.value }))}
                  placeholder="launch, ai, ops"
                  value={draft.tags}
                />
              </label>
            </div>

            <label className="grid gap-1.5">
              <span className="text-sm font-semibold text-body">Notes</span>
              <textarea
                className="field min-h-52 resize-y"
                onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))}
                placeholder="Markdown-style notes, runbooks, and reminders..."
                value={draft.notes}
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 border-t border-border bg-surface-2 px-6 py-4">
          <button
            className="button-primary"
            onClick={() =>
              onSave(resource.id, {
                description: draft.description,
                docsUrl: draft.docsUrl || undefined,
                notes: draft.notes,
                repoUrl: draft.repoUrl || undefined,
                status: draft.status,
                tags: draft.tags
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean),
              })
            }
            type="button"
          >
            <SaveIcon className="h-4 w-4" />
            Save changes
          </button>
          <span className="text-xs text-muted">Stored in localStorage for v1.</span>
        </div>
      </div>
    </div>
  );
}
