import { useEffect, useState } from "react";
import type { DevSessionDraft } from "../devHistoryTypes";
import { createEmptyDevSessionDraft } from "../devSessionTemplate";

const STORAGE_KEY = "qiaccess.capture.dev-session.draft.v1";

function readDraft() {
  if (typeof window === "undefined") {
    return createEmptyDevSessionDraft();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return createEmptyDevSessionDraft();
  }

  try {
    return {
      ...createEmptyDevSessionDraft(),
      ...(JSON.parse(raw) as DevSessionDraft),
    };
  } catch {
    return createEmptyDevSessionDraft();
  }
}

export function useDevSessionDraft() {
  const [draft, setDraft] = useState<DevSessionDraft>(() => readDraft());
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    setSavedAt(new Date().toISOString());
  }, [draft]);

  function resetDraft(nextDraft = createEmptyDevSessionDraft()) {
    setDraft(nextDraft);
  }

  return {
    draft,
    setDraft,
    resetDraft,
    savedAt,
  };
}
