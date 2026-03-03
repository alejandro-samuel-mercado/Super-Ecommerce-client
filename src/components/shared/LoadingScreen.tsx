"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function LoadingScreen() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-r from-primary/20 to-purple-600/20">
      <motion.div
        animate={{ scale: [1, 1.2, 1], x: [0, 100, 0], y: [0, -50, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="
          absolute
          -left-24 -top-24
          max-md:w-[320px] max-md:h-[320px]
          md:w-[550px] md:h-[550px]
          rounded-full
          bg-primary/20
          blur-[120px]
        "
      />

      <motion.div
        animate={{ scale: [1, 1.3, 1], x: [0, -80, 0], y: [0, 60, 0] }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear",
          delay: 1,
        }}
        className="
          absolute
          -right-24 -bottom-24
          max-md:w-[340px] max-md:h-[340px]
          md:w-[650px] md:h-[650px]
          rounded-full
          bg-purple-500/20
          blur-[140px]
        "
      />

      <div className="relative flex flex-col items-center px-6 text-center w-full max-w-[90%] md:max-w-[600px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-10 relative"
        >
          <div
            className="
              relative z-10
              max-md:w-20 max-md:h-20
              md:w-28 md:h-28
              rounded-full
              flex items-center justify-center
              overflow-hidden
            "
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-primary/30 rounded-full blur-xl"
            />

            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="
                relative z-20
                max-md:w-10 max-md:h-10
                md:w-14 md:h-14
                border-[3px]
                md:border-4
                border-t-primary
                border-r-primary/30
                border-b-primary/10
                border-l-primary/50
                rounded-full
              "
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full"
        >
          <h2
            className="
              font-black
              bg-gradient-to-r from-primary to-purple-600
              bg-clip-text text-transparent
              uppercase
              tracking-[0.25em]
              max-md:text-lg
              md:text-2xl
              mb-6
            "
          >
            Cargando
          </h2>

          <div
            className="
              relative
              w-full
              max-md:h-1
              md:h-2
              bg-zinc-200
              rounded-full
              overflow-hidden
            "
          >
            <motion.div
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent"
            />
          </div>
        </motion.div>

        <motion.p
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="
            mt-8
            max-md:text-[11px]
            md:text-sm
            font-bold
            text-primary
            uppercase
            tracking-[0.3em]
          "
        >
          Preparando tu experiencia
        </motion.p>
      </div>
    </div>
  );
}
