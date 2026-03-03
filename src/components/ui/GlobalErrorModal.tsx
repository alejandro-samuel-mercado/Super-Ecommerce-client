"use client";

import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, MessageSquare, RefreshCw, X } from "lucide-react";
import React, { useState } from "react";

interface GlobalErrorModalProps {
  isOpen: boolean;
  error: {
    title: string;
    message: string;
    code?: string;
    referenceId?: string | null;
  } | null;
  onRetry: () => void;
  onReport: (userMessage: string) => Promise<void>;
  onClose: () => void;
}

export const GlobalErrorModal: React.FC<GlobalErrorModalProps> = ({
  isOpen,
  error,
  onRetry,
  onReport,
  onClose,
}) => {
  const [isReporting, setIsReporting] = useState(false);
  const [userMessage, setUserMessage] = useState("");
  const [reportState, setReportState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  if (!isOpen || !error) return null;

  const handleReportSubmit = async () => {
    setReportState("submitting");
    try {
      await onReport(userMessage);
      setReportState("success");
      setTimeout(() => {
        setReportState("idle");
        setIsReporting(false);
        onClose();
      }, 2000);
    } catch (e) {
      setReportState("error");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, type: "spring" }}
            className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800"
          >
            {/* Header */}
            <div className="bg-red-50 dark:bg-red-900/20 p-6 flex flex-col items-center text-center border-b border-red-100 dark:border-red-900/50">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mb-4 text-red-600 dark:text-red-400">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {error.title || "Algo salió mal"}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Código: {error.code || "UNKNOWN"}
              </p>
            </div>

            {/* Body */}
            <div className="p-6">
              {!isReporting ? (
                <>
                  <p className="text-zinc-600 dark:text-zinc-300 text-center mb-6">
                    {error.message}
                  </p>

                  {error.referenceId && (
                    <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg text-xs font-mono text-center text-zinc-500 mb-6 select-all">
                      Ref ID: {error.referenceId}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 border-2 border-gray-400 dark:border-gray-700"
                      onClick={() => setIsReporting(true)}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Reportar
                    </Button>
                    <Button
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white border-2 border-gray-400 dark:border-gray-700"
                      onClick={onRetry}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reintentar
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-sm">Reportar Problema</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setIsReporting(false)}
                    >
                      <X size={14} />
                    </Button>
                  </div>

                  {reportState === "success" ? (
                    <div className="text-green-600 text-center py-8 font-medium animate-in zoom-in">
                      ¡Reporte enviado! Gracias por ayudarnos.
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-muted-foreground">
                        Describe brevemente qué estabas haciendo cuando ocurrió
                        el error.
                      </p>
                      <textarea
                        className="w-full h-24 p-3 rounded-lg border border-zinc-400  dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none"
                        placeholder="Ej: Intenté pagar con tarjeta y..."
                        value={userMessage}
                        onChange={(e) => setUserMessage(e.target.value)}
                        maxLength={500}
                      />
                      <Button
                        className="w-full"
                        onClick={handleReportSubmit}
                        disabled={
                          reportState === "submitting" || !userMessage.trim()
                        }
                      >
                        {reportState === "submitting"
                          ? "Enviando..."
                          : "Enviar Reporte"}
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>

            {!isReporting && (
              <div className="bg-zinc-50 dark:bg-zinc-900/50 px-6 py-3 text-center">
                <button
                  onClick={onClose}
                  className="text-xs text-black hover:text-zinc-600 underline"
                >
                  Cerrar y descartar
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
