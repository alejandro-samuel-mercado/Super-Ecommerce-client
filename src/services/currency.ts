import { http } from "@/adapters/http";

export interface Currency {
  id: number;
  code: string;
  symbol: string;
  exchangeRateToBase: number;
  isActive: boolean;
}

export const currencyService = {
  getCurrencies: async (): Promise<Currency[]> => {
    try {
      const response = await http<Currency[]>("/api/currencies");
      return response;
    } catch (error) {
      return [];
    }
  },
};
