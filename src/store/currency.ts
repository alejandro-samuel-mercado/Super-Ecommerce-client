import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CurrencyState {
  currency: string | null;
  setCurrency: (currency: string) => void;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      currency: null,
      setCurrency: (currency: string) => set({ currency }),
    }),
    {
      name: "currency-storage",
    },
  ),
);
