"use client";

import { GlobalErrorModal } from "@/components/ui/GlobalErrorModal";
import { usePathname, useRouter } from "next/navigation";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

interface ErrorData {
  title: string;
  message: string;
  code?: string;
  referenceId?: string | null;
  stack?: string;
}

interface ErrorContextType {
  triggerError: (error: ErrorData) => void;
  isMaintenanceMode: boolean;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

let globalTriggerError: ((e: ErrorData) => void) | null = null;

export const setGlobalErrorHandler = (handler: (e: ErrorData) => void) => {
  globalTriggerError = handler;
};

export const triggerGlobalError = (e: ErrorData) => {
  if (globalTriggerError) globalTriggerError(e);
};

export const ErrorProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [error, setError] = useState<ErrorData | null>(null);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [errorHistory, setErrorHistory] = useState<number[]>([]);

  const router = useRouter();
  const pathname = usePathname();

  const triggerError = React.useCallback((newError: ErrorData) => {
    setError(newError);

    setErrorHistory((prev) => [...prev, Date.now()]);
  }, []);

  useEffect(() => {
    const now = Date.now();
    const recentErrors = errorHistory.filter((t) => now - t < 30000);

    if (recentErrors.length >= 3 && !isMaintenanceMode) {
      console.warn("🚨 AUTO-MAINTENANCE TRIGGERED: Too many critical errors.");
      setIsMaintenanceMode(true);
      router.push("/maintenance");
    }
  }, [errorHistory, isMaintenanceMode, router]);

  useEffect(() => {
    setGlobalErrorHandler(triggerError);
    return () => setGlobalErrorHandler(() => {});
  }, [triggerError]);

  useEffect(() => {
    if (
      isMaintenanceMode &&
      pathname !== "/maintenance" &&
      !pathname.startsWith("/admin")
    ) {
      router.push("/maintenance");
    }
  }, [isMaintenanceMode, pathname, router]);

  const handleRetry = () => {
    setError(null);
    window.location.reload();
  };

  const handleReport = async (userMessage: string) => {
    if (!error) return;

   
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      await fetch(`${baseUrl}/api/system/report-error`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          component: pathname,
          url: window.location.href,
          browserInfo: navigator.userAgent,
          userMessage: userMessage,
          originalCode: error.code,
        }),
      });
    } catch (e) {}
  };

  return (
    <ErrorContext.Provider value={{ triggerError, isMaintenanceMode }}>
      {children}
      <GlobalErrorModal
        isOpen={!!error}
        error={error}
        onRetry={handleRetry}
        onReport={handleReport}
        onClose={() => setError(null)}
      />
    </ErrorContext.Provider>
  );
};

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context)
    throw new Error("useError must be used within an ErrorProvider");
  return context;
};
