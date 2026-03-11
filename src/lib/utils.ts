import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function formatPrice(
  price: number | undefined,
  currencyCode: string | null = "USD",
) {
  if (price === undefined) return "";
  const realCurrencyCode = currencyCode || "USD";

  const locales: Record<string, string> = {
    ARS: "es-AR",
    MXN: "es-MX",
    USD: "en-US",
    EUR: "es-ES",
    CLP: "es-CL",
    COP: "es-CO",
    UYU: "es-UY",
    BRL: "pt-BR",
    PEN: "es-PE",
    BOB: "es-BO",
    PYG: "es-PY",
    GBP: "en-GB",
    VES: "es-VE",
    CRC: "es-CR",
    DOP: "es-DO",
    GTQ: "es-GT",
    HNL: "es-HN",
    NIO: "es-NI",
    PAB: "es-PA",
    CAD: "en-CA",
    CHF: "de-CH",
  };
  const locale = locales[realCurrencyCode] || "en-US";

  const zeroDecimalCurrencies = ["CLP", "COP", "PYG", "JPY", "VES"];
  const hasDecimals = !zeroDecimalCurrencies.includes(realCurrencyCode);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: realCurrencyCode,
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  }).format(price);
}
