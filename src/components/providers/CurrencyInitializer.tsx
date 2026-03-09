"use client";

import { useCurrencyStore } from "@/store/currency";
import { useEffect } from "react";

export function CurrencyInitializer() {
  const { currency, setCurrency } = useCurrencyStore();

  useEffect(() => {
    const initializeCurrency = async () => {
      // Si ya hay una moneda seleccionada (ej. en localStorage o guardada de sesión previa), NO sobreescribir
      if (currency) return;

      try {
        const { configService } = await import("@/services/config");
        const publicConfig = await configService.getPublicConfig();

        if (publicConfig.detectedCurrency) {
          setCurrency(publicConfig.detectedCurrency);
        }
      } catch (e) {}
    };

    initializeCurrency();
  }, [currency, setCurrency]);

  return null;
}
