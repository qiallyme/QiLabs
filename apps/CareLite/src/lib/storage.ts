import { initialStore } from "../data/seed";
import type { CareLiteStore } from "../types";

const STORAGE_KEY = "carelite.store.v1";

export function loadStore(): CareLiteStore {
  if (typeof window === "undefined") {
    return initialStore;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return initialStore;
  }

  try {
    const parsed = JSON.parse(raw) as CareLiteStore;
    return {
      items: parsed.items?.length ? parsed.items : initialStore.items,
      entries: parsed.entries ?? [],
      oxygenProfiles: parsed.oxygenProfiles?.length
        ? parsed.oxygenProfiles
        : initialStore.oxygenProfiles,
      oxygenSessions: parsed.oxygenSessions ?? [],
    };
  } catch {
    return initialStore;
  }
}

export function saveStore(store: CareLiteStore) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}
