import { motion } from "framer-motion";
import { Hammer, Settings, Wrench } from "lucide-react";

export function MaintenancePage() {
  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-200 flex flex-col items-center justify-center p-4 text-center">
      {/* Blobs Animados de Fondo */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
          x: [0, 50, 0],
          y: [0, -50, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] left-[-10%] w-[50vh] h-[50vh] bg-primary/20 rounded-full blur-[100px] pointer-events-none "
      />
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          rotate: [0, -90, 0],
          x: [0, -30, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
          delay: 2,
        }}
        className="absolute bottom-[-10%] right-[-10%] w-[60vh] h-[60vh] bg-blue-300/20 rounded-full blur-[100px] pointer-events-none "
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative max-w-lg w-full bg-white/60 backdrop-blur-2xl rounded-[2.5rem] p-10 shadow-2xl border border-gray-300 ring-1 ring-gray-100 "
      >
        <div className="flex justify-center items-center gap-6 mb-8 relative">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.2,
            }}
            className="w-20 h-20 bg-gradient-to-tr from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center shadow-inner"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Settings className="w-10 h-10 text-primary" />
            </motion.div>
          </motion.div>

          <motion.div
            className="absolute -top-2 -right-2"
            animate={{ y: [0, -10, 0], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Wrench className="w-8 h-8 text-blue-500 drop-shadow-lg" />
          </motion.div>

          <motion.div
            className="absolute -bottom-2 -left-2"
            animate={{ y: [0, 10, 0], rotate: [0, -10, 10, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          >
            <Hammer className="w-8 h-8 text-orange-500 drop-shadow-lg" />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4 tracking-tight">
            En Mantenimiento
          </h1>

          <p className="text-gray-600 mb-8 text-lg leading-relaxed">
            Estamos trabajando entre bastidores para mejorar tu experiencia.
            <br className="hidden sm:block" />
            Volveremos a estar en línea pronto.
          </p>
        </motion.div>

        <div className="relative w-full bg-gray-100 h-3 rounded-full overflow-hidden shadow-inner mb-6">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-blue-500 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%", x: ["-100%", "100%"] }}
            transition={{
              width: { duration: 1, ease: "easeOut" },
              x: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                repeatDelay: 0.5,
              },
            }}
          />
        </div>

        <motion.p
          className="text-sm text-gray-400 font-medium mb-6"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          Gracias por tu paciencia &bull;
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-full text-sm font-semibold transition-colors border border-primary/20"
          >
            Reintentar conexión
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
