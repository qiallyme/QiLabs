// src/store/vaultStore.ts
import { create } from "zustand";

interface VaultState {
  vaultPath: string | null;
  setVaultPath: (path: string) => void;
}

export const useVaultStore = create<VaultState>((set) => {
  const initialPath =
    typeof window !== "undefined"
      ? window.localStorage.getItem("qinote:vaultPath")
      : null;

  return {
    vaultPath: initialPath,
    setVaultPath: (path: string) => {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("qinote:vaultPath", path);
      }
      set({ vaultPath: path });
    },
  };
});
