"use client";

import { http } from "@/adapters/http";
import { Button } from "@/components/ui/button";
import { PublicConfig, configService } from "@/services/config";
import { useCartStore } from "@/store/cart";
import { motion } from "framer-motion";
import { Clock, Eye, Home, Loader2, QrCode } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

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
  const [saleData, setSaleData] = useState<any>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  const fetchSaleData = useCallback(async () => {
    if (!saleId) return;
    try {
      const data = await http<any>(`/api/sales/${saleId}`, { method: "GET" });
      const sale = data?.data || data;
      setSaleData(sale);
      if (sale?.qrPaymentUrl) {
        setQrUrl(sale.qrPaymentUrl);
      }
    } catch (err) {
      console.error("Error fetching sale:", err);
    }
  }, [saleId]);

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
      fetchSaleData();
    }
  }, [clearCart, searchParams, router, fetchSaleData]);

  // Polling para detectar cuando el admin sube el QR
  useEffect(() => {
    if (!saleData || saleData.paymentType !== 'QR' || qrUrl) return;
    
    const interval = setInterval(async () => {
      try {
        const data = await http<any>(`/api/sales/${saleId}`, { method: "GET" });
        const sale = data?.data || data;
        if (sale?.qrPaymentUrl) {
          setQrUrl(sale.qrPaymentUrl);
          clearInterval(interval);
        }
      } catch (err) {
        // silent fail
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [saleData, qrUrl, saleId]);

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground font-mono">
        <div className="h-12 w-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const isQrPayment = saleData?.paymentType === 'QR';

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 selection:bg-amber-500/20">
      {/* Hero Section */}
      <div className="relative h-[30vh] md:h-[40vh] w-full overflow-hidden px-10">
        <div className={`absolute inset-0 transition-all duration-1000 ${isQrPayment ? 'bg-gradient-to-br from-purple-500 via-purple-600 to-violet-700' : 'bg-gradient-to-br from-amber-500 via-amber-600 to-orange-700'}`} />
        <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        <div className="container mx-auto px-4 h-full flex items-end pb-8 relative z-10">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight mb-2 tracking-tighter text-primary/80 drop-shadow-2xl">
              {isQrPayment ? 'Pago por QR' : 'Pago en trámite'}
            </h1>
            <div className={`flex items-center gap-3 text-sm max-md:text-xs font-bold text-white border-4 border-white/20 px-6 max-md:px-3 py-2 w-max shadow-2xl rounded-2xl ${isQrPayment ? 'bg-purple-500' : 'bg-amber-500'}`}>
              {isQrPayment ? <QrCode size={20} strokeWidth={3} /> : <Clock size={20} strokeWidth={3} />}
              {isQrPayment ? 'Escanea el QR para pagar' : 'Estamos procesando tu validación'}
            </div>
          </motion.div>
        </div>
      </div>

      <main className="container mx-auto px-10 max-md:px-3 mt-8 relative z-20 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sección de información */}
          <div className="lg:col-span-8 space-y-12">
            {/* Sección QR */}
            {isQrPayment && (
              <div className="border-4 border-purple-500/20 bg-card p-8 md:p-12 rounded-[2.5rem] shadow-sm">
                <div className="space-y-8">
                  <p className="text-xs text-purple-700/60 font-black tracking-widest uppercase">
                    Código QR de Pago
                  </p>
                  {qrUrl ? (
                    <div className="space-y-6">
                      <p className="text-2xl font-black text-foreground tracking-tight">
                        Escanea este código con tu app bancaria para realizar el pago:
                      </p>
                      <div className="flex justify-center">
                        <div className="bg-white p-6 rounded-3xl border-4 border-purple-200 shadow-lg inline-block">
                          <img 
                            src={qrUrl} 
                            alt="QR de Pago" 
                            className="w-[280px] h-[280px] md:w-[350px] md:h-[350px] object-contain rounded-xl"
                          />
                        </div>
                      </div>
                      <p className="text-base font-medium text-muted-foreground text-center max-w-md mx-auto">
                        Una vez que realices el pago, nuestro equipo lo verificará y procesará tu pedido.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6 text-center py-8">
                      <Loader2 className="h-16 w-16 animate-spin text-purple-400 mx-auto" />
                      <p className="text-2xl font-black text-foreground tracking-tight">
                        Estamos preparando tu QR de pago
                      </p>
                      <p className="text-base font-medium text-muted-foreground max-w-md mx-auto">
                        En breve recibirás el código QR para escanear. También te notificaremos por email cuando esté listo.
                      </p>
                      <p className="text-xs text-purple-500 font-bold animate-pulse">
                        Actualizando automáticamente...
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sección info normal (no QR) */}
            {!isQrPayment && (
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
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {saleId && (
                <div className={`p-8 border-4 rounded-[2.5rem] space-y-3 ${isQrPayment ? 'border-purple-500/15 bg-purple-500/5' : 'border-amber-500/15 bg-amber-500/5'}`}>
                  <p className={`text-xs font-black tracking-widest uppercase ${isQrPayment ? 'text-purple-700/40' : 'text-amber-700/40'}`}>
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
                  Recibirás un email automático en cuanto el pago se acredite con éxito.
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className={`border-4 bg-card p-8 md:p-10 rounded-[2.5rem] shadow-lg sticky top-8 ${isQrPayment ? 'border-purple-500/40' : 'border-amber-500/40'}`}>
              <p className={`text-xs font-black tracking-widest uppercase mb-8 ${isQrPayment ? 'text-purple-700/40' : 'text-amber-700/40'}`}>
                Siguientes pasos
              </p>

              <div className="space-y-10">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 font-black text-xs ${isQrPayment ? 'bg-purple-500/10 text-purple-700' : 'bg-amber-500/10 text-amber-700'}`}>
                      !
                    </div>
                    <p className="text-sm font-bold text-foreground/80 leading-normal">
                      {isQrPayment 
                        ? 'Escanea el QR con tu aplicación bancaria y realiza el pago.'
                        : 'No intentes pagar nuevamente para evitar cargos duplicados.'}
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 font-black text-xs ${isQrPayment ? 'bg-purple-500/10 text-purple-700' : 'bg-amber-500/10 text-amber-700'}`}>
                      ?
                    </div>
                    <p className="text-sm font-bold text-foreground/80 leading-normal">
                      Tu pedido está registrado y será confirmado una vez que se acredite el pago.
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
