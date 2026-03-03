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
  };
  const locale = locales[realCurrencyCode] || "en-US";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: realCurrencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}
