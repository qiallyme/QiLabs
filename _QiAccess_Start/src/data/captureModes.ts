export type CaptureTargetId =
  | "qinexus-inbox"
  | "paperless"
  | "knowledge"
  | "system-storage";

export type QiNexusBucketId =
  | "00_inbox"
  | "01_workbench"
  | "02_timeline"
  | "03_life"
  | "04_people"
  | "05_business"
  | "06_finance"
  | "07_legal"
  | "08_tech"
  | "09_assets"
  | "10_data"
  | "11_reference"
  | "12_archive"
  | "13_system";

export type CaptureModeId =
  | "quick-note"
  | "task-reminder"
  | "care-observation"
  | "legal-finance"
  | "link-save";

export type CaptureMode = {
  id: CaptureModeId;
  title: string;
  description: string;
  draftPlaceholder: string;
  coaching: string;

  /**
   * Canonical QiNexus destination bucket.
   *
   * This is not necessarily where the item permanently lives.
   * It is the first recommended organizational bucket after capture.
   */
  bucketId: QiNexusBucketId;

  /**
   * Human-readable explanation for why this mode points to that bucket.
   */
  bucketReason: string;

  /**
   * Recommended system destinations for this capture.
   *
   * These are routing suggestions, not automatic processing instructions.
   */
  recommendedTargets: CaptureTargetId[];

  /**
   * Optional warning or triage note for sensitive or high-friction captures.
   */
  triageNote?: string;

  /**
   * Whether this capture mode should be treated as needing later review
   * before being pushed into another system.
   */
  requiresTriage?: boolean;
};

export const captureModes: CaptureMode[] = [
  {
    id: "quick-note",
    title: "Quick note",
    description: "Dump a thought before it disappears.",
    draftPlaceholder:
      "Write the thought in one or two sentences while it is still fresh...",
    coaching: "Capture first. Sort later.",
    bucketId: "00_inbox",
    bucketReason:
      "Unsorted ideas belong in the inbox until you know where they actually go.",
    recommendedTargets: ["qinexus-inbox", "knowledge"],
    requiresTriage: false,
  },
  {
    id: "task-reminder",
    title: "Task / reminder",
    description: "Capture a next action or follow-up.",
    draftPlaceholder:
      "Write the task, who it belongs to, and the trigger or deadline...",
    coaching: "Include the action, owner, and trigger.",
    bucketId: "01_workbench",
    bucketReason:
      "Tasks and active project material belong in workbench after first capture.",
    recommendedTargets: ["qinexus-inbox", "system-storage"],
    requiresTriage: true,
    triageNote:
      "Confirm whether this is a task, project note, reminder, or calendar item before routing.",
  },
  {
    id: "care-observation",
    title: "Care observation",
    description: "Log a real-world care note or follow-up.",
    draftPlaceholder:
      "Note what happened, when it happened, and what needs follow-up...",
    coaching: "Keep the observation factual and time-bound.",
    bucketId: "04_people",
    bucketReason:
      "Care and household context belongs with people-centered records and timelines.",
    recommendedTargets: ["qinexus-inbox", "paperless", "knowledge"],
    requiresTriage: true,
    triageNote:
      "Review before routing. Care observations may become timeline notes, provider follow-ups, Paperless documents, or Mom’s Care records.",
  },
  {
    id: "legal-finance",
    title: "Legal / finance note",
    description: "Save a sensitive note that should not get lost.",
    draftPlaceholder:
      "Capture names, dates, amounts, documents, and the exact next step...",
    coaching: "Preserve the exact details while they are fresh.",
    bucketId: "07_legal",
    bucketReason:
      "Legal and finance material should be triaged carefully before routing to legal, finance, storage, or records.",
    recommendedTargets: ["qinexus-inbox", "system-storage", "paperless"],
    requiresTriage: true,
    triageNote:
      "Do not permanently blur legal and finance. Capture together if needed, then split into 06_finance or 07_legal during triage.",
  },
  {
    id: "link-save",
    title: "Link save",
    description: "Stash a URL for later classification.",
    draftPlaceholder:
      "Paste the link and why it matters so it does not become an orphaned bookmark...",
    coaching: "Always save the why, not just the URL.",
    bucketId: "11_reference",
    bucketReason:
      "Links are reference material until promoted into a project, knowledge page, or system record.",
    recommendedTargets: ["knowledge", "qinexus-inbox"],
    requiresTriage: true,
    triageNote:
      "Links without context become junk. Keep the reason, source, and possible destination attached.",
  },
];

export function resolveCaptureMode(
  modeId: string | null | undefined
): CaptureMode {
  return (
    captureModes.find((mode) => mode.id === modeId) ?? captureModes[0]
  );
}

export function isCaptureModeId(
  value: string | null | undefined
): value is CaptureModeId {
  return captureModes.some((mode) => mode.id === value);
}

export function getRecommendedTargetsForMode(
  modeId: string | null | undefined
): CaptureTargetId[] {
  return resolveCaptureMode(modeId).recommendedTargets;
}

export function getBucketForMode(
  modeId: string | null | undefined
): QiNexusBucketId {
  return resolveCaptureMode(modeId).bucketId;
}