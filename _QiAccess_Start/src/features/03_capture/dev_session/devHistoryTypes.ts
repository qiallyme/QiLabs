export type DevHistoryStatus =
  | "draft"
  | "planned"
  | "in_progress"
  | "blocked"
  | "completed"
  | "archived";

export type DevHistoryRecordType =
  | "dev_session"
  | "bug_report"
  | "codex_prompt"
  | "architecture_decision"
  | "schema_change"
  | "tool_build"
  | "research_note";

export type DevHistoryRecord = {
  id: string;
  owner_id: string;
  session_id: string;
  record_type: DevHistoryRecordType;
  schema_version: string;
  session_date: string;
  title: string;
  project: string | null;
  repo: string | null;
  branch: string | null;
  feature_area: string | null;
  session_type: string | null;
  status: DevHistoryStatus;
  summary: string | null;
  purpose: string | null;
  context: string | null;
  final_outcome: string | null;
  restart_prompt: string | null;
  decisions: unknown[];
  files_affected: unknown[];
  folders_affected: unknown[];
  database_notes: unknown[];
  implementation_plan: unknown[];
  code_artifacts: unknown[];
  prompts: unknown[];
  risks: unknown[];
  validation_checklist: unknown[];
  next_actions: unknown[];
  markdown_body: string | null;
  tags: string[];
  related_files: string[];
  related_tables: string[];
  related_tools: string[];
  artifact_paths: string[];
  artifact_urls: string[];
  source: string;
  created_by: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type DevHistoryRecordInsertInput = Omit<
  DevHistoryRecord,
  "id" | "owner_id" | "created_at" | "updated_at"
>;

export type DevHistoryRecordUpdateInput = Partial<DevHistoryRecordInsertInput>;

export type DevSessionDraft = {
  id: string | null;
  session_id: string;
  record_type: DevHistoryRecordType;
  schema_version: string;
  session_date: string;
  title: string;
  project: string;
  repo: string;
  branch: string;
  feature_area: string;
  session_type: string;
  status: DevHistoryStatus;
  summary: string;
  purpose: string;
  context: string;
  final_outcome: string;
  restart_prompt: string;
  decisions: string[];
  files_affected: string[];
  folders_affected: string[];
  database_notes: string[];
  implementation_plan: string[];
  code_artifacts: string[];
  prompts: string[];
  risks: string[];
  validation_checklist: string[];
  next_actions: string[];
  markdown_body: string;
  tags: string[];
  related_files: string[];
  related_tables: string[];
  related_tools: string[];
  artifact_paths: string[];
  artifact_urls: string[];
  source: string;
  created_by: string;
  metadata: Record<string, unknown>;
};
