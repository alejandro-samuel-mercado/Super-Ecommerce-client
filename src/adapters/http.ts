import { triggerGlobalError } from "@/contexts/ErrorContext";
import { ApiError } from "@/types";
import { toast } from "sonner";

let lastToastMessage = "";
let lastToastTime = 0;
const TOAST_THROTTLE = 2000;

function throttledToastError(message: string, description?: string) {
  const now = Date.now();
  if (message === lastToastMessage && now - lastToastTime < TOAST_THROTTLE)
    return;

  lastToastMessage = message;
  lastToastTime = now;
  toast.error(message, { description, duration: 5000 });
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface RequestOptions extends RequestInit {
  token?: string;
  skipRetry?: boolean;
  responseType?: 'json' | 'blob';
}

let refreshHandler: (() => Promise<string | null>) | null = null;
let logoutHandler: (() => void) | null = null;

export const setRefreshHandler = (handler: () => Promise<string | null>) => {
  refreshHandler = handler;
};

export const setLogoutHandler = (handler: () => void) => {
  logoutHandler = handler;
};

export async function http<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const headers = new Headers(options.headers);

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  } else {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("accessToken");
      if (storedToken) {
        headers.set("Authorization", `Bearer ${storedToken}`);
      }

      const currencyStorage = localStorage.getItem("currency-storage");
      if (currencyStorage) {
        try {
          const parsed = JSON.parse(currencyStorage);
          const currencyCode = parsed.state?.currency;
          if (currencyCode) {
            headers.set("x-currency", currencyCode);
          }
        } catch (e) {}
      }
    }
  }

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: "include",
  };

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, { ...config, signal: controller.signal });
    clearTimeout(id);

    const isAuthEndpoint =
      path.includes("/api/auth/login") || path.includes("/api/auth/register");
    if (
      response.status === 401 &&
      !options.skipRetry &&
      refreshHandler &&
      !isAuthEndpoint
    ) {
      try {
        const newToken = await refreshHandler();
        if (newToken) {
          return http<T>(path, {
            ...options,
            token: newToken,
            skipRetry: true,
          });
        } else {
          throw {
            status: 401,
            code: "UNAUTHORIZED",
            message: "Session expired",
          };
        }
      } catch (e) {
        throw e;
      }
    }

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const error: ApiError = {
        status: response.status,
        code: errorBody.code || errorBody.error_code || "UNKNOWN_ERROR",
        message: errorBody.message || response.statusText,
        details: errorBody.details,
        referenceId: errorBody.reference_id,
      };

      if (response.status >= 500) {
        triggerGlobalError({
          title: "Error del Servidor",
          message: error.message,
          code: error.code,
          referenceId: error.referenceId,
        });
      } else if (response.status !== 401 && typeof window !== "undefined") {
        throttledToastError(
          error.message ||
            "Ocurrió un error inesperado al conectar con el servidor.",
          "Revise los datos ingresados e intente nuevamente.",
        );
      }

      throw error;
    }

    if (response.status === 204) return {} as T;
    
    // Handle blob response type
    if (options.responseType === 'blob') {
      return (await response.blob()) as any;
    }

    const data = await response.json();

    if (
      typeof window !== "undefined" &&
      ["POST", "PUT", "PATCH", "DELETE"].includes(
        options.method?.toUpperCase() || "",
      )
    ) {
      if (!options.headers || !(options.headers as any)["x-silence-toast"]) {
        if (data?.message) {
          toast.success(data.message);
        }
      }
    }

    return data;
  } catch (error) {
    if ((error as ApiError).status) throw error;

    const err = error as any;
    const isInterrupted =
      err.name === "AbortError" ||
      err.message?.toLowerCase().includes("aborted") ||
      err.message
        ?.toLowerCase()
        .includes("networkerror when attempting to fetch resource") ||
      err.message?.toLowerCase().includes("failed to fetch") ||
      err.message?.toLowerCase().includes("load failed");

    if (isInterrupted) {
      console.warn("Fetch interrupted by navigation - silently ignoring.");
      return {} as T;
    }

    const netError = {
      status: 0,
      code: "NETWORK_ERROR",
      message:
        (error as Error).message || "No se pudo conectar con el servidor",
      title: "Problema de Conexión",
    };

    triggerGlobalError({
      title: netError.title,
      message: netError.message,
      code: netError.code,
    });

    throw {
      status: 500,
      code: "NETWORK_ERROR",
      message: (error as Error).message || "Network Error",
    };
  }
}
