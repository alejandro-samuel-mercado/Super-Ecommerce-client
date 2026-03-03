"use client";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Clock, Download, Eye, RefreshCcw, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type DemoState = "success" | "failure" | "pending";

export default function CheckoutDemoDashboard() {
  const [state, setState] = useState<DemoState>("success");

  const mockSale = {
    id: "DEMO-12345",
    uuid: "demo-uuid-6789",
    total: 15450.5,
    subtotal: 14000.0,
    discount: 1500.0,
    tax: 2940.5,
    currencyCode: "ARS",
    paymentType: "MERCADO_PAGO",
    deliveryType: "DELIVERY",
    deliveryAddress: "Av. Corrientes 1234, CABA",
    customerName: "Usuario de Prueba",
    customerEmail: "tester@ejemplo.com",
    user: {
      name: "Usuario de Prueba",
      email: "tester@ejemplo.com",
    },
    items: [
      {
        productName: "Producto de Ejemplo A",
        quantity: 2,
        unitPrice: 5000,
        subtotal: 10000,
      },
      {
        productName: "Producto de Ejemplo B",
        quantity: 1,
        unitPrice: 4000,
        subtotal: 4000,
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col font-mono selection:bg-primary/20 pt-10">
      {/* Hub de cambio de estado */}
      <div className="bg-card/70 border-b border-primary/10 p-4 pt-10 sticky top-0 z-50 shadow-sm backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white font-black shadow-lg">
              D
            </div>
            <div>
              <h2 className="font-black text-xs uppercase tracking-[0.2em] text-primary">
                Checkout Hub Premium
              </h2>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                Modo: {state}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-primary/5 p-1 rounded-2xl border border-primary/20">
            <button
              onClick={() => setState("success")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${state === "success" ? "bg-primary text-white shadow-md" : "text-primary"}`}
            >
              <Check size={14} strokeWidth={4} /> ÉXITO
            </button>
            <button
              onClick={() => setState("failure")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${state === "failure" ? "bg-destructive text-white shadow-md" : "text-primary"}`}
            >
              <X size={14} strokeWidth={4} /> ERROR
            </button>
            <button
              onClick={() => setState("pending")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${state === "pending" ? "bg-amber-500 text-white shadow-md" : "text-primary"}`}
            >
              <Clock size={14} strokeWidth={4} /> ESPERA
            </button>
          </div>

          <Button
            asChild
            variant="ghost"
            className="rounded-xl font-black gap-2 text-[10px] tracking-widest hover:bg-primary/5  border-2 border-primary/30 text-primary"
          >
            <Link href="/products">SALIR</Link>
          </Button>
        </div>
      </div>

      {/* Estado seleccionado */}
      <div className="flex-1 relative overflow-auto">
        <AnimatePresence mode="wait">
          {state === "success" && <SuccessView sale={mockSale} key="success" />}
          {state === "failure" && <FailureView key="failure" />}
          {state === "pending" && (
            <PendingView saleId={mockSale.id} key="pending" />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* --- Internal Components for Demo --- */

function SuccessView({ sale }: { sale: any }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-full bg-background text-foreground pb-24 uppercase tracking-tight"
    >
      <div className="relative h-[40vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-secondary transition-all shadow-inner" />
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="container mx-auto px-4 h-full flex items-end pb-12 relative z-10">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h1 className="text-7xl md:text-9xl font-black leading-[0.8] mb-4 tracking-tighter text-white drop-shadow-2xl">
              PAGO
              <br />
              <span className="text-secondary italic">EXITOSO</span>
            </h1>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border border-primary/40 bg-card/70 backdrop-blur-3xl shadow-2xl rounded-[3rem] overflow-hidden">
          <div className="lg:col-span-8 p-8 md:p-14 border-b lg:border-b-0 lg:border-r border-primary/5 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <p className="text-[10px] text-primary/60 font-black tracking-[0.4em]">
                  CLIENTE
                </p>
                <p className="text-3xl font-black">{sale.user.name}</p>
                <p className="text-sm normal-case font-bold text-foreground/50">
                  {sale.user.email}
                </p>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] text-primary/60 font-black tracking-[0.4em]">
                  DETALLES ENVÍO
                </p>
                <p className="text-sm font-black">{sale.deliveryType}</p>
                <p className="text-sm normal-case font-bold italic text-foreground/50">
                  {sale.deliveryAddress}
                </p>
              </div>
            </div>
          </div>
          <div className="lg:col-span-4 bg-primary/5 p-8 md:p-14 space-y-8 flex flex-col justify-center">
            <div>
              <p className="text-[10px] text-primary/40 font-black tracking-[0.4em] mb-2">
                TOTAL PAGADO
              </p>
              <p className="text-5xl md:text-6xl font-black text-primary tracking-tighter">
                {formatPrice(sale.total, sale.currencyCode)}
              </p>
            </div>
            <Button className="w-full h-20 bg-primary text-white font-black hover:bg-secondary rounded-[1.5rem] gap-4 shadow-lg group">
              <Download
                size={24}
                className="group-hover:translate-y-1 transition-transform"
              />{" "}
              FACTURA.PDF
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function FailureView() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-full bg-background text-foreground pb-24 uppercase tracking-tight"
    >
      <div className="relative h-[40vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-destructive via-destructive/90 to-red-600 transition-all" />
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="container mx-auto px-4 h-full flex items-end pb-12 relative z-10">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h1 className="text-7xl md:text-9xl font-black leading-[0.8] mb-4 tracking-tighter text-white drop-shadow-2xl">
              ERROR EN
              <br />
              <span className="text-zinc-900/40 italic">EL PAGO</span>
            </h1>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-10 relative z-20">
        <div className="max-w-4xl mx-auto border border-destructive/10 bg-card/70 backdrop-blur-3xl shadow-2xl rounded-[3rem] overflow-hidden grid grid-cols-1 md:grid-cols-2">
          <div className="p-12 border-b md:border-b-0 md:border-r border-destructive/5">
            <p className="text-[10px] text-destructive/60 font-black tracking-[0.4em] mb-8">
              PAGO RECHAZADO
            </p>
            <p className="text-xl normal-case font-bold text-foreground/60 leading-relaxed italic">
              No hemos podido procesar la transacción. Verifica tus datos de
              pago o intenta con un método diferente.
            </p>
          </div>
          <div className="p-12 space-y-4 flex flex-col justify-center">
            <Button className="h-20 bg-destructive text-white font-black hover:bg-red-700 rounded-[1.5rem] gap-4 shadow-lg">
              <RefreshCcw size={22} /> REINTENTAR
            </Button>
            <Button
              variant="outline"
              className="h-16 bg-card/50 border-primary/10 text-primary font-black rounded-full"
            >
              TIENDA
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PendingView({ saleId }: { saleId: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-full bg-background text-foreground pb-24 uppercase tracking-tight"
    >
      <div className="relative h-[40vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 transition-all" />
        <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="container mx-auto px-4 h-full flex items-end pb-12 relative z-10">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h1 className="text-7xl md:text-9xl font-black leading-[0.8] mb-4 tracking-tighter text-white drop-shadow-2xl">
              PAGO EN
              <br />
              <span className="text-black/30 italic">ESPERA</span>
            </h1>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-10 relative z-20">
        <div className="max-w-4xl mx-auto border border-amber-500/10 bg-card/70 backdrop-blur-3xl shadow-2xl rounded-[3rem] overflow-hidden grid grid-cols-1 md:grid-cols-2">
          <div className="p-12 border-b md:border-b-0 md:border-r border-amber-500/5">
            <p className="text-[10px] text-amber-700/60 font-black tracking-[0.4em] mb-8">
              VERIFICANDO...
            </p>
            <p className="text-xl normal-case font-bold text-foreground/60 leading-relaxed italic">
              Tu pago está siendo verificado. Esto puede demorar unos minutos.
              Te avisaremos al confirmar.
            </p>
          </div>
          <div className="p-12 space-y-4 flex flex-col justify-center">
            <Button className="h-20 bg-amber-500 text-white font-black hover:bg-amber-600 rounded-[1.5rem] gap-4 shadow-lg">
              <Eye size={22} /> VER PEDIDO
            </Button>
            <Button
              variant="outline"
              className="h-16 bg-card/50 border-primary/10 text-primary font-black rounded-full"
            >
              CONTINUAR SHOPPING
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
