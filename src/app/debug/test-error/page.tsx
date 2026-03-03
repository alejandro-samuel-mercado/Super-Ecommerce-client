"use client";

import { Button } from "@/components/ui/button";
import { useError } from "@/contexts/ErrorContext";
import { AlertTriangle, Bug, WifiOff } from "lucide-react";
import { useState } from "react";

export default function TestErrorPage() {
  const { triggerError } = useError();
  const [shouldCrash, setShouldCrash] = useState(false);

  if (shouldCrash) {
    throw new Error("💥 Crash de prueba intencional (React Render Error)");
  }

  return (
    <div className="container mx-auto py-20 px-4 text-center max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">🛠️ Debug: Probador de Errores</h1>
      <p className="text-muted-foreground mb-12">
        Usa estos botones para verificar que el sistema de manejo de errores
        (&quot;Modal Elegante&quot;) está funcionando correctamente.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <Button
          className="h-24 text-lg bg-orange-600 hover:bg-orange-700"
          onClick={() =>
            triggerError({
              title: "Error 500 Simulado",
              message: "El servidor encontró una condición inesperada.",
              code: "INTERNAL_SERVER_ERROR",
              referenceId: "TEST-LOG-123",
            })
          }
        >
          <Bug className="mr-3 h-6 w-6" />
          Simular Error 500
        </Button>

        <Button
          className="h-24 text-lg bg-blue-600 hover:bg-blue-700"
          onClick={() =>
            triggerError({
              title: "Problema de Conexión",
              message:
                "No se pudo conectar con el servidor. Verifique su internet.",
              code: "NETWORK_ERROR",
            })
          }
        >
          <WifiOff className="mr-3 h-6 w-6" />
          Simular Error de Red
        </Button>

        <Button
          variant="destructive"
          className="h-24 text-lg md:col-span-2"
          onClick={() => setShouldCrash(true)}
        >
          <AlertTriangle className="mr-3 h-6 w-6" />
          Simular Crash de React (Pantalla Blanca)
        </Button>
      </div>

      <p className="mt-8 text-xs text-zinc-400">
        Nota: El &quot;Crash de React&quot; activará el `GlobalErrorBoundary`,
        mientras que los otros dos activan el `GlobalErrorModal` vía Contexto.
      </p>
    </div>
  );
}
