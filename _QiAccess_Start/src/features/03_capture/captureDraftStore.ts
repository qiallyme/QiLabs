import type { CaptureModeId } from "../../data/captureModes";

const STORAGE_KEY = "qiaccess.capture.drafts.v1";

type CaptureDraftEntry = {
  text: string;
  updatedAt: string;
};

type CaptureDraftMap = Partial<Record<CaptureModeId, CaptureDraftEntry>>;

export type CaptureDraftSnapshot = {
  text: string;
  updatedAt: string | null;
};

function emptySnapshot(): CaptureDraftSnapshot {
  return {
    text: "",
    updatedAt: null,
  };
}

function readDraftMap() {
  if (typeof window === "undefined") {
    return {};
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as CaptureDraftMap;
  } catch {
    return {};
  }
}

function writeDraftMap(drafts: CaptureDraftMap) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
}

export function readCaptureDraft(modeId: CaptureModeId): CaptureDraftSnapshot {
  const entry = readDraftMap()[modeId];
  if (!entry) {
    return emptySnapshot();
  }

  return {
    text: entry.text,
    updatedAt: entry.updatedAt,
  };
}

export function saveCaptureDraft(modeId: CaptureModeId, text: string): CaptureDraftSnapshot {
  const drafts = readDraftMap();

  const nextEntry = {
    text,
    updatedAt: new Date().toISOString(),
  };

  drafts[modeId] = nextEntry;
  writeDraftMap(drafts);

  return {
    text: nextEntry.text,
    updatedAt: nextEntry.updatedAt,
  };
}

export function clearCaptureDraft(modeId: CaptureModeId) {
  const drafts = readDraftMap();
  delete drafts[modeId];
  writeDraftMap(drafts);
}
