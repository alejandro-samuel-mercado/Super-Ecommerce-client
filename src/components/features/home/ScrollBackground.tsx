"use client";

import { motion, useScroll, useTransform } from "framer-motion";

export function ScrollBackground() {
  const { scrollYProgress } = useScroll();

  // Transformar el progreso de scroll en diferentes valores para varios efectos
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.3, 0.7, 1],
    [0.4, 0.6, 0.5, 0.7],
  );
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.3, 1.1]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Gradiente de Fondo */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-100/80 via-purple-100/80 to-pink-100/80"
        style={{ opacity }}
      />

      {/* Blob Animado 1 */}
      <motion.div
        className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gradient-to-br from-primary/40 to-blue-400/40 rounded-full blur-3xl"
        style={{
          scale,
          y,
          opacity: useTransform(scrollYProgress, [0, 0.5], [0.6, 0.3]),
        }}
      />

      {/* Blob Animado 2 */}
      <motion.div
        className="absolute top-1/4 -right-40 w-[700px] h-[700px] bg-gradient-to-tl from-purple-400/35 to-pink-400/35 rounded-full blur-3xl"
        style={{
          rotate,
          opacity: useTransform(
            scrollYProgress,
            [0, 0.3, 0.7],
            [0.5, 0.7, 0.4],
          ),
        }}
      />

      {/* Blob Animado 3 */}
      <motion.div
        className="absolute bottom-0 left-1/4 w-[800px] h-[800px] bg-gradient-to-tr from-blue-300/35 to-cyan-400/35 rounded-full blur-3xl"
        style={{
          y: useTransform(scrollYProgress, [0, 1], ["100%", "-20%"]),
          opacity: useTransform(scrollYProgress, [0.5, 1], [0.3, 0.6]),
        }}
      />

    
      <motion.div
        className="absolute inset-0"
        style={{
          opacity: useTransform(
            scrollYProgress,
            [0, 0.2, 0.8, 1],
            [0.05, 0.08, 0.06, 0.07],
          ),
          backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />
    </div>
  );
}
