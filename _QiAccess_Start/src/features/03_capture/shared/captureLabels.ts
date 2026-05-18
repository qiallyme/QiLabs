import type {
  CaptureTargetId,
  QiNexusBucketId,
} from "../../../data/captureModes";
import type {
  CaptureBucketPresentation,
  CaptureTargetPresentation,
} from "./captureTypes";

const bucketPresentation: Record<QiNexusBucketId, CaptureBucketPresentation> = {
  "00_inbox": {
    label: "Inbox",
    summary: "Fast intake for unsorted capture before the real route is confirmed.",
  },
  "01_workbench": {
    label: "Workbench",
    summary: "Active working material, next actions, and in-flight execution.",
  },
  "02_timeline": {
    label: "Timeline",
    summary: "Chronological events, logs, and dated factual records.",
  },
  "03_life": {
    label: "Life",
    summary: "Personal context, household operations, and day-to-day living material.",
  },
  "04_people": {
    label: "People",
    summary: "People-centered records, care context, and relationship-linked material.",
  },
  "05_business": {
    label: "Business",
    summary: "Operational business records, planning, and execution context.",
  },
  "06_finance": {
    label: "Finance",
    summary: "Money, billing, payment, and financial decision records.",
  },
  "07_legal": {
    label: "Legal",
    summary: "Legal records, deadlines, filings, and access-sensitive material.",
  },
  "08_tech": {
    label: "Tech",
    summary: "Technical references, system notes, and stack-specific material.",
  },
  "09_assets": {
    label: "Assets",
    summary: "Files, media, and reusable artifacts that should stay organized.",
  },
  "10_data": {
    label: "Data",
    summary: "Structured exports, datasets, and machine-oriented records.",
  },
  "11_reference": {
    label: "Reference",
    summary: "Reference material waiting to be promoted into a stronger home.",
  },
  "12_archive": {
    label: "Archive",
    summary: "Retained historical material that is no longer active.",
  },
  "13_system": {
    label: "System",
    summary: "System operations, configuration notes, and infrastructure context.",
  },
};

const targetPresentation: Record<CaptureTargetId, CaptureTargetPresentation> = {
  "qinexus-inbox": {
    label: "QiNexus Inbox",
    summary: "Primary intake lane for manual review, sorting, and later routing.",
  },
  paperless: {
    label: "Paperless",
    summary: "Document ingestion lane for scans, packets, and document-first captures.",
  },
  knowledge: {
    label: "Knowledge / Vector",
    summary: "Reusable reference material that should become knowledge or vector context.",
  },
  "system-storage": {
    label: "System Storage",
    summary: "Storage doctrine and bucket review before creating a deeper filing path.",
  },
};

export function formatSavedAt(updatedAt: string | null) {
  if (!updatedAt) {
    return "Local only";
  }

  return `Saved locally ${new Date(updatedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
}

export function getBucketPresentation(bucketId: QiNexusBucketId): CaptureBucketPresentation {
  return bucketPresentation[bucketId];
}

export function getTargetPresentation(targetId: CaptureTargetId): CaptureTargetPresentation {
  return targetPresentation[targetId];
}
