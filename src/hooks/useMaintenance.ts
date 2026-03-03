import { useEffect, useRef, useState } from "react";

export function useMaintenance() {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const failCountRef = useRef(0);

  useEffect(() => {
    const checkStatus = async () => {
      if (typeof document !== "undefined" && document.hidden) return;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/categories?limit=1`,
          {
            signal: controller.signal,
          },
        );

        clearTimeout(timeoutId);

        if (response.status === 503) {
          setIsMaintenanceMode(true);
        } else {
          failCountRef.current = 0;
          setIsMaintenanceMode(false);
        }
      } catch (error: any) {
        clearTimeout(timeoutId);
        if (error?.name === "AbortError") {
          return;
        }
        failCountRef.current++;
        if (failCountRef.current >= 3) {
          setIsMaintenanceMode(true);
        }
      } finally {
        setLoading(false);
      }
    };

    checkStatus();

    const interval = setInterval(checkStatus, 30000);

    const handleVisibility = () => {
      if (!document.hidden) {
        checkStatus();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return { isMaintenanceMode, loading };
}
