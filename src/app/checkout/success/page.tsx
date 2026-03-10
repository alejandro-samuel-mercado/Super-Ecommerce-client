"use client";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { orderService } from "@/services/orders";
import { useCartStore } from "@/store/cart";
import { motion } from "framer-motion";
import { Check, Download, Home, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background text-foreground font-mono"><div className="flex flex-col items-center gap-4"><div className="h-12 w-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /><p className="tracking-[0.2em] uppercase text-xs text-primary font-bold">Cargando...</p></div></div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const clearCart = useCartStore((state) => state.clearCart);

  const [sale, setSale] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);


  const handleDownloadInvoice = useCallback(async (id?: string) => {
    const saleId = id || sale?.id || sale?.uuid;
    if (!saleId) return;

    setIsDownloading(true);
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${baseUrl}/api/sales/${saleId}/invoice`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to download invoice");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `factura-${saleId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Factura descargada");
    } catch (error) {
      toast.error("Error al descargar factura");
    } finally {
      setIsDownloading(false);
    }
  }, [sale]);

  
  useEffect(() => {
    const isMP =
      searchParams.has("collection_id") ||
      searchParams.has("preference_id") ||
      searchParams.has("payment_id") ||
      searchParams.has("merchant_order_id");
    const isStripe = searchParams.has("session_id");
    const isPayPal =
      (searchParams.has("token") && searchParams.has("PayerID")) ||
      searchParams.has("paymentId");

    const saleId =
      searchParams.get("saleId") || searchParams.get("external_reference");
    const isValidRedirect = isMP || isStripe || isPayPal;

    if (!isValidRedirect && !saleId) {
      router.replace("/");
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        if (saleId) {
          const data = await orderService.getById(saleId);
          const mappedData = {
            ...data,
            tax: data.taxAmount || 0,
            shipping: data.shippingCost || 0,
          };
          setSale(mappedData);
          clearCart();
          if (data.paymentStatus === 'PAID') {
            setTimeout(() => handleDownloadInvoice(data.id), 2000);
          }
        }
      } catch (error) {
        toast.error("Error al cargar detalles de la orden");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [searchParams, clearCart, router, handleDownloadInvoice]);


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground font-mono">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="tracking-[0.2em] uppercase text-xs text-primary font-bold">
            Confirmando Pago...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground pb-24 selection:bg-primary/20 ">
    
      <div className="relative h-[30vh] md:h-[40vh] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-secondary transition-all duration-700"
          style={{
            backgroundImage: `url('/api/brain/profile_cover_gradient_1771964596671.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        <div className="container mx-auto px-4 h-full flex items-end pb-8 relative z-10">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight mb-2 tracking-tighter text-primary/80  drop-shadow-2xl">
              ¡Pedido confirmado!
            </h1>
            <div className="flex items-center gap-3 text-sm font-bold bg-primary text-white border-4 border-gray-300/30 px-6 py-2 w-max shadow-2xl rounded-2xl">
              <Check size={20} strokeWidth={3} /> Tu pago ha sido procesado con
              éxito
            </div>
          </motion.div>
        </div>
      </div>

      <main className="container mx-auto px-4 mt-8 relative z-20 pb-20 max-lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-8 space-y-12">
            <div className="border-4 border-primary/30 bg-card p-8 md:p-12 rounded-[2.5rem] shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <p className="text-xs text-primary/60 font-black tracking-widest uppercase">
                    Cliente
                  </p>
                  <div className="space-y-1">
                    <p className="text-3xl font-black text-foreground tracking-tight">
                      {sale?.user?.name || sale?.customerName}
                    </p>
                    <p className="text-base text-muted-foreground font-medium">
                      {sale?.user?.email || sale?.customerEmail}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-xs text-primary/60 font-black tracking-widest uppercase">
                    Envío
                  </p>
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-foreground flex items-center gap-2">
                      <span
                        className={`h-3 w-3 rounded-full ${sale?.deliveryType === "DELIVERY" ? "bg-secondary animate-pulse" : "bg-primary"}`}
                      />
                      {sale?.deliveryType === "DELIVERY"
                        ? "Domicilio"
                        : "Retiro en punto"}
                    </p>
                    <p className="text-base text-muted-foreground font-medium italic">
                      {sale?.deliveryAddress || "Pendiente de coordinación"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-4 border-secondary/20 bg-card p-8 md:p-12 rounded-[2.5rem] shadow-sm">
              <p className="text-xs text-primary/60 font-black tracking-widest uppercase mb-10 pb-4 border-b-4 border-secondary/10">
                Detalle de tu compra ({sale?.items?.length || 0} artículos)
              </p>
              <div className="space-y-10">
                {sale?.items?.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center pb-6 border-b-2 border-primary/5 hover:translate-x-1 transition-transform group"
                  >
                    <div className="space-y-1">
                      <p className="text-xs text-primary/40 font-black tracking-widest">
                        Item 0{idx + 1} —{" "}
                        {Number(item.quantity).toFixed(
                          item.measurementUnit &&
                            item.measurementUnit !== "UNIDAD"
                            ? 3
                            : 0,
                        )}{" "}
                        un.
                      </p>
                      <p className="text-2xl font-black text-foreground tracking-tight">
                        {item.productName}
                      </p>
                    </div>
                    <p className="text-2xl font-black text-primary">
                      {formatPrice(item.subtotal, sale.currencyCode)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Totales y acciones  */}
          <div className="lg:col-span-4 space-y-8">
            <div className="border-4 border-primary/40 bg-card p-8 md:p-10 rounded-[2.5rem] shadow-lg sticky top-8">
              <p className="text-xs text-primary/40 font-black tracking-widest uppercase mb-8">
                Resumen de transacción
              </p>

              <div className="space-y-6">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-muted-foreground uppercase tracking-wider text-[10px]">
                    Referencia
                  </span>
                  <span className="text-foreground">#{sale?.id}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-muted-foreground uppercase tracking-wider text-[10px]">
                    Pago
                  </span>
                  <span className="bg-primary/10 border-2 border-secondary/30 px-3 py-1 rounded-xl text-primary text-[11px] font-black uppercase">
                    {sale?.paymentType?.replace("_", " ")}
                  </span>
                </div>

                <div className="h-[1px] w-full bg-primary/10 my-4" />

                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-muted-foreground">
                    Subtotal
                  </span>
                  <span className="text-xl font-bold text-foreground">
                    {formatPrice(sale?.subtotal, sale?.currencyCode)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-muted-foreground">
                    Logística
                  </span>
                  <span className="text-xl font-bold text-foreground">
                    {formatPrice(sale?.shipping || 0, sale?.currencyCode)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-muted-foreground">
                    Impuestos
                  </span>
                  <span className="text-xl font-bold text-foreground">
                    {formatPrice(sale?.tax || 0, sale?.currencyCode)}
                  </span>
                </div>

                {sale?.discount > 0 && (
                  <div className="flex justify-between items-center text-secondary py-3 px-4 bg-secondary/5 rounded-2xl border-2 border-secondary/20 border-dashed">
                    <span className="text-sm font-black">Descuento</span>
                    <span className="text-xl font-black">
                      -{formatPrice(sale.discount, sale.currencyCode)}
                    </span>
                  </div>
                )}

                <div className="pt-8 mt-4 border-t-8 border-primary">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-primary uppercase tracking-widest mb-1">
                      Total abonado
                    </span>
                    <span className="text-5xl font-black text-primary tracking-tighter">
                      {formatPrice(sale?.total, sale?.currencyCode)}
                    </span>
                  </div>
                </div>

                <div className="pt-10 flex flex-col gap-4">
                  <Button
                    onClick={() => handleDownloadInvoice()}
                    disabled={isDownloading}
                    className="w-full h-20 bg-primary text-white text-lg font-black hover:bg-secondary transition-all rounded-2xl gap-3 shadow-md border-4 border-white/10"
                  >
                    {isDownloading ? (
                      <div className="animate-spin h-5 w-5 border-3 border-white border-t-transparent" />
                    ) : (
                      <Download size={24} strokeWidth={3} />
                    )}
                    Descargar factura
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      asChild
                      variant="outline"
                      className="h-16 border-4 border-secondary/20 text-primary font-black hover:bg-primary/5 rounded-2xl flex flex-col items-center justify-center p-0"
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
                      className="h-16 border-4 border-secondary/20 text-primary font-black hover:bg-primary/5 rounded-2xl flex flex-col items-center justify-center p-0"
                    >
                      <Link href="/profile">
                        <ShoppingBag size={20} className="mb-0.5" />
                        <span className="text-[10px] tracking-widest uppercase">
                          Perfil
                        </span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col md:flex-row justify-between items-center gap-6 text-muted-foreground/30 text-[11px] font-black tracking-widest uppercase">
          
        </div>
      </main>
    </div>
  );
}
