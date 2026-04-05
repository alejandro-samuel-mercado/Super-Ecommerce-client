"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface SplashScreenProps {
  logo?: string | null;
  storeName?: string;
  isLoading: boolean;
}

export function SplashScreen({
  logo,
  storeName,
  isLoading,
}: SplashScreenProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShow(false), 800);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.8, ease: "easeInOut" },
          }}
          className="fixed inset-0  w-screen overflow-hidden h-screen  z-[9999] flex flex-col items-center justify-center bg-white dark:bg-zinc-950"
        >
          <div className="sm:bg-gradient-to-r sm:from-slate-100 sm:to-slate-200 dark:sm:from-zinc-900 dark:sm:to-zinc-800 max-sm:bg-white/40 dark:max-sm:bg-black/40 w-full h-full flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-col items-center gap-6 "
            >
              <div className="flex relative w-24 h-24 md:w-32 md:h-32 justify-center items-center">
                {logo ? (
                  <img
                    src={logo}
                    alt={storeName || "Logo"}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-20 h-20 border-4 border-t-slate-500 border-r-slate-500/30 border-b-slate-500/10 border-l-slate-500/50 rounded-full"
                    />
                  </div>
                )}
                {/* Anillo Pulsante */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.1, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 bg-slate-500/20 rounded-full -z-10"
                />
              </div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-center"
              >
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  {storeName || "Cargando..."}
                </h1>
              </motion.div>
            </motion.div>
          </div>

          {/* Elementos Decorativos*/}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-400/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-slate-300/10 rounded-full blur-[120px]" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
