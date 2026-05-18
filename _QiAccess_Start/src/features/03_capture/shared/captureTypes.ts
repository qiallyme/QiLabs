import type {
  CaptureMode,
  CaptureModeId,
  CaptureTargetId,
  QiNexusBucketId,
} from "../../../data/captureModes";

export type CaptureItemType =
  | "note"
  | "document"
  | "image"
  | "audio"
  | "link"
  | "task"
  | "care_log"
  | "legal_finance"
  | "system_note";

export type CapturePayload = {
  title: string | null;
  body_md: string | null;
  body_text: string | null;
  capture_mode: CaptureModeId;
  item_type: CaptureItemType;
  bucket_id: QiNexusBucketId;
  route_target: CaptureTargetId | null;
  recommended_targets: CaptureTargetId[];
  requires_triage: boolean;
  tags: string[];
  metadata: Record<string, unknown>;
};

export type CaptureBucketPresentation = {
  label: string;
  summary: string;
};

export type CaptureTargetPresentation = {
  label: string;
  summary: string;
};

export type BuildCapturePayloadInput = {
  body: string;
  mode: CaptureMode;
  title?: string | null;
  routeTarget?: CaptureTargetId | null;
  tags?: string[];
  metadata?: Record<string, unknown>;
};
