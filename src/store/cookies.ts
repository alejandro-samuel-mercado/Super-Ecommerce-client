import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CookieConsentState {
  analytics: boolean;
  marketing: boolean;
  ads: boolean;
  hasConsented: boolean;

  setConsent: (type: "analytics" | "marketing" | "ads", value: boolean) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: () => void;
}

export const useCookieConsent = create<CookieConsentState>()(
  persist(
    (set) => ({
      analytics: false,
      marketing: false,
      ads: false,
      hasConsented: false,

      setConsent: (type, value) => {
        set((state) => ({ ...state, [type]: value }));
      },

      acceptAll: () => {
        set({
          analytics: true,
          marketing: true,
          ads: true,
          hasConsented: true,
        });
      },

      rejectAll: () => {
        set({
          analytics: false,
          marketing: false,
          ads: false,
          hasConsented: true,
        });
      },

      savePreferences: () => {
        set((state) => ({ ...state, hasConsented: true }));
      },
    }),
    {
      name: "cookie-consent",

      storage: {
        getItem: (name) => {
          if (typeof window === "undefined") return null;
          const cookies = document.cookie.split("; ");
          const cookie = cookies.find((c) => c.startsWith(`${name}=`));
          if (!cookie) return null;
          const value = cookie.split("=")[1];
          return value ? JSON.parse(decodeURIComponent(value)) : null;
        },
        setItem: (name, value) => {
          if (typeof window === "undefined") return;
          const expires = new Date();
          expires.setFullYear(expires.getFullYear() + 1);
          document.cookie = `${name}=${encodeURIComponent(
            JSON.stringify(value),
          )}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
        },
        removeItem: (name) => {
          if (typeof window === "undefined") return;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        },
      },
    },
  ),
);
