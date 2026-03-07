"use client";

import { Button } from "@/components/ui/button";
import { PublicConfig, configService } from "@/services/config";
import { useCartStore } from "@/store/cart";
import { motion } from "framer-motion";
import { Clock, Eye } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

export default function CheckoutPendingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background text-foreground font-mono"><div className="h-12 w-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>}>
      <CheckoutPendingContent />
    </Suspense>
  );
}

function CheckoutPendingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const saleId =
    searchParams.get("saleId") || searchParams.get("external_reference");
  const clearCart = useCartStore((state) => state.clearCart);
  const [config, setConfig] = useState<PublicConfig | null>(null);

  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const hasPaymentParams =
      searchParams.has("saleId") ||
      searchParams.has("payment_id") ||
      searchParams.has("status") ||
      searchParams.has("external_reference");

   
    if (!hasPaymentParams) {
      router.replace("/");
    } else {
      setIsValidating(false);
      clearCart();
      configService.getPublicConfig().then(setConfig).catch(console.error);
  }
  }, [clearCart, searchParams, router]);

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground font-mono">
        <div className="h-12 w-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 selection:bg-amber-500/20">
      {/* 1.  Hero Section */}
      <div className="relative h-[30vh] md:h-[40vh] w-full overflow-hidden px-10">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-amber-600 to-orange-700 transition-all duration-1000" />
        <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        <div className="container mx-auto px-4 h-full flex items-end pb-8 relative z-10">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight mb-2 tracking-tighter text-primary/80 drop-shadow-2xl">
              Pago en trámite
            </h1>
            <div className="flex items-center gap-3 text-sm max-md:text-xs font-bold bg-amber-500 text-white border-4 border-white/20 px-6 max-md:px-3 py-2 w-max shadow-2xl rounded-2xl">
              <Clock size={20} strokeWidth={3} /> Estamos procesando tu
              validación
            </div>
          </motion.div>
        </div>
      </div>

      <main className="container mx-auto px-10 max-md:px-3 mt-8 relative z-20 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sección de información */}
          <div className="lg:col-span-8 space-y-12">
            <div className="border-4 border-amber-500/20 bg-card p-8 md:p-12 rounded-[2.5rem] shadow-sm">
              <div className="space-y-8">
                <p className="text-xs text-amber-700/60 font-black tracking-widest uppercase">
                  Estado del proceso
                </p>
                <div className="space-y-6">
                  <p className="text-4xl font-black text-foreground tracking-tight leading-tight">
                    Tu pago está pendiente de aprobación.
                  </p>
                  <p className="text-lg font-medium text-muted-foreground max-w-2xl leading-relaxed">
                    Si elegiste <strong className="text-amber-600">Pago Fácil</strong> o <strong className="text-amber-600">Rapipago</strong>, recuerda que debes enviar el comprobante de pago para que procesemos tu envío.
                  </p>

                  <div className="bg-amber-500/10 border-2 border-amber-500/20 p-6 rounded-3xl space-y-4">
                    <p className="text-sm font-black text-amber-700 uppercase tracking-widest">Vías de envío de comprobante:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-green-500/20 text-green-600 flex items-center justify-center font-bold">W</div>
                        <div>
                          <p className="text-[10px] font-black text-muted-foreground uppercase">WhatsApp</p>
                          <p className="text-sm font-bold">{config?.contactPhone || ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-500/20 text-blue-600 flex items-center justify-center font-bold">@</div>
                        <div>
                          <p className="text-[10px] font-black text-muted-foreground uppercase">Email</p>
                          <p className="text-sm font-bold">{config?.contactEmail || ''}</p>
                        </div>
                      </div>
                      
                    </div>
                  </div>

                  <p className="text-base font-medium text-muted-foreground max-w-2xl leading-relaxed">
                    Una vez que recibamos tu comprobante, validaremos el pago en el sistema. Recibirás un correo automático cuando tu pedido sea confirmado.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {saleId && (
                <div className="p-8 border-4 border-amber-500/15 bg-amber-500/5 rounded-[2.5rem] space-y-3">
                  <p className="text-xs font-black text-amber-700/40 tracking-widest uppercase">
                    Referencia
                  </p>
                  <p className="text-xl font-bold text-foreground italic">
                    #{saleId}
                  </p>
                </div>
              )}
              <div className="p-8 border-4 border-primary/30 bg-primary/10 rounded-[2.5rem] space-y-3">
                <p className="text-xs font-black text-primary/40 tracking-widest uppercase">
                  Aviso importante
                </p>
                <p className="text-base font-bold text-foreground">
                  Recibirás un email automático en cuanto el pago se acredite
                  con éxito.
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="border-4 border-amber-500/40 bg-card p-8 md:p-10 rounded-[2.5rem] shadow-lg sticky top-8">
              <p className="text-xs text-amber-700/40 font-black tracking-widest uppercase mb-8">
                Siguientes pasos
              </p>

              <div className="space-y-10">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-full bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0 font-black text-xs">
                      !
                    </div>
                    <p className="text-sm font-bold text-foreground/80 leading-normal">
                      No intentes pagar nuevamente para evitar cargos
                      duplicados.
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-full bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0 font-black text-xs">
                      ?
                    </div>
                    <p className="text-sm font-bold text-foreground/80 leading-normal">
                      Tu pedido está registrado y será confirmado una vez que
                      se acredite el pago.
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex flex-col gap-4">
                  <Button
                    asChild
                    className="w-full h-20 bg-primary text-white text-lg font-black hover:bg-secondary transition-all rounded-2xl gap-3 shadow-md border-4 border-white/10"
                  >
                    <Link href="/profile">
                      <Eye size={24} strokeWidth={3} />
                      Ver mi pedido
                    </Link>
                  </Button>
                  <div className="grid grid-cols-1">
                    <Button
                      asChild
                      variant="outline"
                      className="h-16 border-4 border-secondary/20 text-primary font-black hover:bg-primary/5 rounded-2xl flex flex-col items-center justify-center p-0"
                    >
                      <Link href="/">
                        <Home size={20} className="mb-0.5" />
                        <span className="text-[10px] tracking-widest uppercase">
                          Volver al inicio
                        </span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col md:flex-row justify-between items-center gap-6 text-primary/20 text-[11px] font-black tracking-widest uppercase">
          
        </div>
      </main>
    </div>
  );
}

import { Home } from "lucide-react";
