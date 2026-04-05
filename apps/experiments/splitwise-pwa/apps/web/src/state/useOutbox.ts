import { create } from "zustand";

interface OutboxState {
  pending: number;
  errors: number;
  setPending: (count: number) => void;
  setErrors: (count: number) => void;
}

export const useOutbox = create<OutboxState>((set) => ({
  pending: 0,
  errors: 0,
  setPending: (pending) => set({ pending }),
  setErrors: (errors) => set({ errors }),
}));
