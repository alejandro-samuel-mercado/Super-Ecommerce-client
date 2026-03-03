"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Home, RefreshCcw, ShoppingCart, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

export default function CheckoutFailurePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background text-foreground font-mono"><div className="h-12 w-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>}>
      <CheckoutFailureContent />
    </Suspense>
  );
}

function CheckoutFailureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const hasPaymentParams =
      searchParams.has("saleId") ||
      searchParams.has("payment_id") ||
      searchParams.has("status") ||
      searchParams.has("collection_status");


   if (!hasPaymentParams) {
      router.replace("/");
    } else {
      setIsValidating(false);
  }


  }, [searchParams, router]);

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground font-mono">
        <div className="h-12 w-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24  selection:bg-destructive/20">
      {/* 1.  Hero Section */}
      <div className="relative h-[30vh] md:h-[40vh] w-full overflow-hidden px-5">
        <div className="absolute inset-0 bg-gradient-to-br from-destructive via-red-600 to-rose-700 transition-all duration-1000" />
        <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        <div className="container mx-auto px-4 h-full flex items-end pb-8 relative z-10 max-lg:-mt-28 max-md:mt-5">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight mb-2 tracking-tighter text-primary/80drop-shadow-2xl">
              Operación rechazada
            </h1>
            <div className="flex items-center gap-3 text-sm max-md:text-xs font-bold bg-destructive text-white border-4 border-white/20 px-6 py-2 max-md:px-2 w-max shadow-2xl rounded-2xl">
              <X size={20} strokeWidth={3} /> Lo sentimos, tu pago no pudo ser
              procesado
            </div>
          </motion.div>
        </div>
      </div>

      <main className="container mx-auto px-4 mt-8 relative z-20 pb-20 max-lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sección de información */}
          <div className="lg:col-span-8 space-y-12">
            <div className="border-4 border-destructive/20 bg-card p-8 md:p-12 rounded-[2.5rem] shadow-sm">
              <div className="space-y-8">
                <p className="text-xs text-destructive/60 font-black tracking-widest uppercase">
                  Informe de error
                </p>
                <div className="space-y-6">
                  <p className="text-4xl font-black text-foreground tracking-tight leading-tight">
                    Algo salió mal con la transacción.
                  </p>
                  <p className="text-lg font-medium text-muted-foreground max-w-2xl leading-relaxed">
                    La transacción ha sido declinada o cancelada. Lo más común
                    es que se trate de una restricción de tu tarjeta, fondos
                    insuficientes o un error en la comunicación con el banco.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 border-4 border-destructive/40 bg-destructive/5 rounded-[2.5rem] space-y-3">
                <p className="text-xs font-black text-destructive/40 tracking-widest uppercase">
                  Código sistema
                </p>
                <p className="text-xl font-bold text-foreground italic">
                  ERR_GATEWAY_REJECTED
                </p>
              </div>
              <div className="p-8 border-4 border-secondary/30 bg-primary/5 rounded-[2.5rem] space-y-3">
                <p className="text-xs font-black text-primary/40 tracking-widest uppercase">
                  ¿Necesitas ayuda?
                </p>
                <p className="text-base font-bold text-foreground">
                  Nuestro equipo está listo para ayudarte a finalizar tu compra.
                </p>
              </div>
            </div>
          </div>

          {/*  Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="border-4 border-destructive/40 bg-card p-8 md:p-10 rounded-[2.5rem] shadow-lg sticky top-8">
              <p className="text-xs text-destructive/40 font-black tracking-widest uppercase mb-8">
                Acciones recomendadas
              </p>

              <div className="space-y-10">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shrink-0 font-black text-xs">
                      01
                    </div>
                    <p className="text-sm font-bold text-foreground/80 leading-normal">
                      Verifica el límite de tu tarjeta o el saldo disponible en
                      tu cuenta.
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shrink-0 font-black text-xs">
                      02
                    </div>
                    <p className="text-sm font-bold text-foreground/80 leading-normal">
                      Asegúrate de que la dirección de facturación ingresada sea
                      la correcta.
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex flex-col gap-4">
                  <Button
                    asChild
                    className="w-full h-20 bg-destructive text-white text-lg font-black hover:bg-red-700 transition-all rounded-2xl gap-3 shadow-md border-4 border-white/10"
                  >
                    <a href="/cart?reloaded=true">
                      <RefreshCcw size={24} strokeWidth={3} />
                      Reintentar pago
                    </a>
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      asChild
                      variant="outline"
                      className="h-16 border-4 border-secondary/20 text-destructive font-black hover:bg-destructive/5 rounded-2xl flex flex-col items-center justify-center p-0"
                    >
                      <Link href="/">
                        <Home size={20} className="mb-0.5" />
                        <span className="text-[10px] tracking-widest uppercase">
                          Inicio
                        </span>
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="h-16 border-4 border-secondary/20 text-destructive font-black hover:bg-destructive/5 rounded-2xl flex flex-col items-center justify-center p-0"
                    >
                      <Link href="/products">
                        <ShoppingCart size={20} className="mb-0.5" />
                        <span className="text-[10px] tracking-widest uppercase">
                          Tienda
                        </span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col md:flex-row justify-between items-center gap-6 text-destructive/20 text-[11px] font-black tracking-widest uppercase">
        
        </div>
      </main>
    </div>
  );
}
