import { useEffect, useState } from "react";

export function useMaintenance() {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/categories?limit=1`,
          {
            signal: controller.signal,
          },
        );

        if (response.status === 503) {
          setIsMaintenanceMode(true);
        } else {
          setIsMaintenanceMode(false);
        }
      } catch (error: any) {
        setIsMaintenanceMode(true);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    checkStatus();

    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return { isMaintenanceMode, loading };
}
