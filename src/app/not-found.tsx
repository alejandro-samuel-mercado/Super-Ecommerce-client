"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ChevronRight, Home, Search, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#010101]/70 p-4 relative overflow-hidden">
     
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 rounded-full blur-[120px] animate-pulse"
        style={{ animationDelay: "2s" }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full text-center relative z-10"
      >
        <div className=" backdrop-blur-2xl p-12 md:p-16 rounded-[3rem] overflow-hidden relative">
       
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative mb-8"
          >
            <h1 className="text-[8rem] md:text-[12rem] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center translate-y-4">
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="bg-primary/20 backdrop-blur-md p-6 rounded-3xl border border-primary/30"
              >
                <Search className="h-12 w-12 text-primary" />
              </motion.div>
            </div>
          </motion.div>

          <div className="space-y-4 py-8">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              ¡UH-OH! RUTA PERDIDA
            </h2>
            <p className="text-gray-400 text-lg max-w-md mx-auto leading-relaxed">
              Parece que has llegado a una dimensión desconocida. La página que
              buscas no existe o ha sido movida a otro universo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <Button
              asChild
              className="h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold transition-all group shadow-lg shadow-primary/25"
              size="lg"
            >
              <Link href="/">
                <Home className="mr-2 h-5 w-5" />
                <span>Volver al Inicio</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-14 rounded-2xl border-white/10 hover:bg-white/50 text-gray-700 font-bold transition-all group"
              size="lg"
            >
              <Link href="/products">
                <ShoppingBag className="mr-2 h-5 w-5" />
                <span>Explorar Tienda</span>
                <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          <div className="mt-12">
            <button
              onClick={() => (window.location.href = "/")}
              className="text-white hover:text-primary transition-colors text-xs font-medium uppercase tracking-[0.2em] opacity-50 hover:opacity-100"
            >
              Reiniciar Conexión con la Base
            </button>
          </div>

          <div className="absolute top-0 right-0 p-4 opacity-20">
            <div className="w-12 h-12 border-t-2 border-r-2 border-white rounded-tr-xl" />
          </div>
          <div className="absolute bottom-0 left-0 p-4 opacity-20">
            <div className="w-12 h-12 border-b-2 border-l-2 border-white rounded-bl-xl" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
