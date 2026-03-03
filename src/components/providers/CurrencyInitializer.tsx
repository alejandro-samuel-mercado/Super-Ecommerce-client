"use client";

import { useCurrencyStore } from "@/store/currency";
import { useEffect } from "react";

export function CurrencyInitializer() {
  const { setCurrency } = useCurrencyStore();

  useEffect(() => {
    const initializeCurrency = async () => {
      try {
        const { configService } = await import("@/services/config");
        const publicConfig = await configService.getPublicConfig();

        if (publicConfig.detectedCurrency) {
          setCurrency(publicConfig.detectedCurrency);
        }
      } catch (e) {}
    };

    initializeCurrency();
  }, [setCurrency]);

  return null;
}
