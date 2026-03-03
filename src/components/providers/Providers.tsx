"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorProvider } from "@/contexts/ErrorContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { CurrencyInitializer } from "./CurrencyInitializer";
import { GlobalErrorBoundary } from "./GlobalErrorBoundary";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ErrorProvider>
            <CurrencyInitializer />
            {children}
          </ErrorProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
}
