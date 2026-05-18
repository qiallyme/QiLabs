import type {
  DevHistoryRecord,
  DevHistoryRecordInsertInput,
  DevSessionDraft,
} from "./devHistoryTypes";

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function slugifyTitle(title: string) {
  const normalized = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "untitled-session";
}

function normalizeArray(values: string[]) {
  return values.map((value) => value.trim()).filter(Boolean);
}

function nullableText(value: string) {
  const normalized = value.trim();
  return normalized ? normalized : null;
}

export function buildDevSessionId(date: string, title: string) {
  const normalizedDate = (date || getTodayDate()).slice(0, 10);
  return `${normalizedDate}-${slugifyTitle(title)}`;
}

export function createEmptyDevSessionDraft(): DevSessionDraft {
  return {
    id: null,
    session_id: "",
    record_type: "dev_session",
    schema_version: "1.0",
    session_date: getTodayDate(),
    title: "",
    project: "",
    repo: "",
    branch: "",
    feature_area: "",
    session_type: "",
    status: "draft",
    summary: "",
    purpose: "",
    context: "",
    final_outcome: "",
    restart_prompt: "",
    decisions: [],
    files_affected: [],
    folders_affected: [],
    database_notes: [],
    implementation_plan: [],
    code_artifacts: [],
    prompts: [],
    risks: [],
    validation_checklist: [],
    next_actions: [],
    markdown_body: "",
    tags: [],
    related_files: [],
    related_tables: [],
    related_tools: [],
    artifact_paths: [],
    artifact_urls: [],
    source: "qiaccess_capture",
    created_by: "QiAccess Start",
    metadata: {},
  };
}

export function buildMarkdownBody(recordDraft: DevSessionDraft) {
  const sessionId = recordDraft.session_id || buildDevSessionId(recordDraft.session_date, recordDraft.title);
  const title = recordDraft.title.trim() || "Untitled Session";
  const tags = JSON.stringify(normalizeArray(recordDraft.tags));

  return [
    "---",
    "record_type: dev_session",
    "schema_version: 1.0",
    `session_id: ${sessionId}`,
    `date: ${recordDraft.session_date}`,
    `project: ${recordDraft.project.trim()}`,
    `repo: ${recordDraft.repo.trim()}`,
    `branch: ${recordDraft.branch.trim()}`,
    `feature_area: ${recordDraft.feature_area.trim()}`,
    `status: ${recordDraft.status}`,
    "owner: QiLabs",
    `tags: ${tags}`,
    "---",
    "",
    `# Dev Session: ${title}`,
    "",
    "## 01. Purpose",
    "",
    recordDraft.purpose.trim() || "_Not captured yet._",
    "",
    "## 02. Context",
    "",
    recordDraft.context.trim() || "_Not captured yet._",
    "",
    "## 03. Decisions Made",
    "",
    formatSectionBody(recordDraft.decisions),
    "",
    "## 04. Files / Folders Affected",
    "",
    formatSectionBody([
      ...normalizeArray(recordDraft.files_affected),
      ...normalizeArray(recordDraft.folders_affected),
    ]),
    "",
    "## 05. Database / Schema Notes",
    "",
    formatSectionBody(recordDraft.database_notes),
    "",
    "## 06. Implementation Plan",
    "",
    formatSectionBody(recordDraft.implementation_plan),
    "",
    "## 07. Code / Prompt Artifacts",
    "",
    formatSectionBody([
      ...normalizeArray(recordDraft.code_artifacts),
      ...normalizeArray(recordDraft.prompts),
    ]),
    "",
    "## 08. Risks / Watch Items",
    "",
    formatSectionBody(recordDraft.risks),
    "",
    "## 09. Validation Checklist",
    "",
    formatSectionBody(recordDraft.validation_checklist),
    "",
    "## 10. Final Outcome",
    "",
    recordDraft.final_outcome.trim() || "_Not captured yet._",
    "",
    "## 11. Next Actions",
    "",
    formatSectionBody(recordDraft.next_actions),
    "",
    "## 12. Restart Prompt",
    "",
    recordDraft.restart_prompt.trim() || "_Not captured yet._",
  ].join("\n");
}

export function draftToInsertInput(draft: DevSessionDraft): DevHistoryRecordInsertInput {
  return {
    session_id: draft.session_id || buildDevSessionId(draft.session_date, draft.title),
    record_type: draft.record_type,
    schema_version: draft.schema_version,
    session_date: draft.session_date,
    title: draft.title.trim() || "Untitled Session",
    project: nullableText(draft.project),
    repo: nullableText(draft.repo),
    branch: nullableText(draft.branch),
    feature_area: nullableText(draft.feature_area),
    session_type: nullableText(draft.session_type),
    status: draft.status,
    summary: nullableText(draft.summary),
    purpose: nullableText(draft.purpose),
    context: nullableText(draft.context),
    final_outcome: nullableText(draft.final_outcome),
    restart_prompt: nullableText(draft.restart_prompt),
    decisions: normalizeArray(draft.decisions),
    files_affected: normalizeArray(draft.files_affected),
    folders_affected: normalizeArray(draft.folders_affected),
    database_notes: normalizeArray(draft.database_notes),
    implementation_plan: normalizeArray(draft.implementation_plan),
    code_artifacts: normalizeArray(draft.code_artifacts),
    prompts: normalizeArray(draft.prompts),
    risks: normalizeArray(draft.risks),
    validation_checklist: normalizeArray(draft.validation_checklist),
    next_actions: normalizeArray(draft.next_actions),
    markdown_body: draft.markdown_body.trim() ? draft.markdown_body : buildMarkdownBody(draft),
    tags: normalizeArray(draft.tags),
    related_files: normalizeArray(draft.related_files),
    related_tables: normalizeArray(draft.related_tables),
    related_tools: normalizeArray(draft.related_tools),
    artifact_paths: normalizeArray(draft.artifact_paths),
    artifact_urls: normalizeArray(draft.artifact_urls),
    source: draft.source,
    created_by: nullableText(draft.created_by),
    metadata: draft.metadata,
  };
}

export function recordToDraft(record: DevHistoryRecord): DevSessionDraft {
  return {
    id: record.id,
    session_id: record.session_id,
    record_type: record.record_type,
    schema_version: record.schema_version,
    session_date: record.session_date,
    title: record.title,
    project: record.project ?? "",
    repo: record.repo ?? "",
    branch: record.branch ?? "",
    feature_area: record.feature_area ?? "",
    session_type: record.session_type ?? "",
    status: record.status,
    summary: record.summary ?? "",
    purpose: record.purpose ?? "",
    context: record.context ?? "",
    final_outcome: record.final_outcome ?? "",
    restart_prompt: record.restart_prompt ?? "",
    decisions: toStringArray(record.decisions),
    files_affected: toStringArray(record.files_affected),
    folders_affected: toStringArray(record.folders_affected),
    database_notes: toStringArray(record.database_notes),
    implementation_plan: toStringArray(record.implementation_plan),
    code_artifacts: toStringArray(record.code_artifacts),
    prompts: toStringArray(record.prompts),
    risks: toStringArray(record.risks),
    validation_checklist: toStringArray(record.validation_checklist),
    next_actions: toStringArray(record.next_actions),
    markdown_body: record.markdown_body ?? "",
    tags: record.tags ?? [],
    related_files: record.related_files ?? [],
    related_tables: record.related_tables ?? [],
    related_tools: record.related_tools ?? [],
    artifact_paths: record.artifact_paths ?? [],
    artifact_urls: record.artifact_urls ?? [],
    source: record.source,
    created_by: record.created_by ?? "QiAccess Start",
    metadata: record.metadata ?? {},
  };
}

function toStringArray(values: unknown[]) {
  return values.map((value) => String(value)).filter(Boolean);
}

function formatSectionBody(values: string[]) {
  const normalized = normalizeArray(values);
  return normalized.length ? normalized.map((value) => `- ${value}`).join("\n") : "_None yet._";
}
