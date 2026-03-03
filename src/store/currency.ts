import { create } from "zustand";

interface CurrencyState {
  currency: string | null;
  setCurrency: (currency: string) => void;
}

export const useCurrencyStore = create<CurrencyState>((set) => ({
  currency: null,
  setCurrency: (currency: string) => set({ currency }),
}));
