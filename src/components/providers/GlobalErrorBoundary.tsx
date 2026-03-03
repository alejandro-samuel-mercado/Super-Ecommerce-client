"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {}

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-300">
            <div className="bg-red-50 dark:bg-red-900/20 p-6 flex flex-col items-center text-center border-b border-red-100 dark:border-red-900/50">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mb-4 text-red-600 dark:text-red-400">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                ¡Ups! Algo salió mal
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Ha ocurrido un error inesperado en la aplicación.
              </p>
            </div>

            <div className="p-6">
              <p className="text-zinc-600 dark:text-zinc-300 text-center mb-6 text-sm bg-zinc-100 dark:bg-zinc-800 p-3 rounded font-mono break-words">
                {this.state.error?.message || "Error desconocido"}
              </p>

              <Button
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Recargar Página
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
