import type { CaptureModeId } from "../../../data/captureModes";
import type {
  BuildCapturePayloadInput,
  CaptureItemType,
  CapturePayload,
} from "./captureTypes";

export function buildCapturePayload({
  body,
  mode,
  title = null,
  routeTarget = null,
  tags = [],
  metadata = {},
}: BuildCapturePayloadInput): CapturePayload {
  const normalizedBody = body.trim() ? body : null;
  const normalizedTitle = title?.trim() ? title.trim() : null;

  return {
    title: normalizedTitle,
    body_md: normalizedBody,
    body_text: normalizedBody,
    capture_mode: mode.id,
    item_type: getItemTypeForMode(mode.id),
    bucket_id: mode.bucketId,
    route_target: routeTarget,
    recommended_targets: [...mode.recommendedTargets],
    requires_triage: Boolean(mode.requiresTriage),
    tags: normalizeTags(tags),
    metadata: { ...metadata },
  };
}

function getItemTypeForMode(modeId: CaptureModeId): CaptureItemType {
  switch (modeId) {
    case "task-reminder":
      return "task";
    case "care-observation":
      return "care_log";
    case "legal-finance":
      return "legal_finance";
    case "link-save":
      return "link";
    case "quick-note":
    default:
      return "note";
  }
}

function normalizeTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const tag of tags) {
    const nextTag = tag.trim();
    if (!nextTag || seen.has(nextTag)) {
      continue;
    }

    seen.add(nextTag);
    normalized.push(nextTag);
  }

  return normalized;
}
