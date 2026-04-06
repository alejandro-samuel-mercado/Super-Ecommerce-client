"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface CartAnimationProps {
  invert?: boolean;
}

export default function CartAnimation({ invert = false }: CartAnimationProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const startX = invert ? 930 : 70;
  const endX = invert ? 70 : 930;

  return (
    <section className="py-10 md:py-20 overflow-hidden">
      <div className="w-full relative">
        <div className="relative w-full mx-auto">
          <div className="w-full aspect-[2.5/1]">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 1000 400"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient
                  id="trackGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#f0eaf7e0" />
                  <stop offset="50%" stopColor="hsl(var(--secondary))" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" />
                </linearGradient>

                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Plataforma */}
              <path
                d={`M${startX},170 L${endX},330`}
                stroke="url(#trackGradient)"
                strokeWidth="10"
                strokeLinecap="round"
                fill="none"
                className="opacity-30 max-md:[stroke-width:22px] md:[stroke-width:14px]"
              />

              {/* Línea animada */}
              <motion.path
                d={`M${startX},170 L${endX},330`}
                stroke="url(#trackGradient)"
                strokeWidth="10"
                strokeLinecap="round"
                fill="none"
                filter="url(#glow)"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 3, ease: "easeInOut", delay: 0.2 }}
                className="max-md:[stroke-width:22px] md:[stroke-width:14px]"
              />

              {/* Carrito */}
              <motion.g
                initial={{ x: startX, y: 170 }}
                whileInView={{ x: endX, y: 330 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 2.5, ease: "easeInOut", delay: 0.2 }}
                style={{ transformOrigin: "center" }}
              >
                <foreignObject x="-75" y="-115" width="150" height="150">
                  <div className="flex items-center justify-center w-full h-full overflow-visible">
                    <div
                      className="
                        relative
                        w-18 h-18
                        md:w-20 md:h-20
                        max-md:w-36 max-md:h-36
                      "
                      style={{
                        transform: invert
                          ? "scaleX(-1) rotate(12deg)"
                          : "rotate(12deg)",
                      }}
                    >
                      <Image
                        src="/images/cart.png"
                        alt="Cart"
                        fill
                        className="object-contain"
                      />

                      <motion.div
                        className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-sm"
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 15, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{
                          right: invert ? "auto" : "-1rem",
                          left: invert ? "-1rem" : "auto",
                        }}
                      >
                        <Sparkles className="w-6 h-6 max-md:w-10 max-md:h-10 text-yellow-400 fill-yellow-400 max-md:hidden" />
                      </motion.div>
                    </div>
                  </div>
                </foreignObject>
              </motion.g>

              {/* Puntos */}
              <circle
                cx={startX}
                cy="170"
                r="8"
                fill="hsl(var(--secondary))"
                className="max-md:[r:16px]"
              />
              <circle
                cx={endX}
                cy="330"
                r="8"
                fill="hsl(var(--primary))"
                className="max-md:[r:16px]"
              />

              {/* Texto separado del carrito */}
              <text
                x={invert ? startX-20 : startX + 20}
                y="50"
                textAnchor="middle"
                fill="hsl(var(--secondary))"
                fontSize="20"
                className="max-md:[font-size:44px] md:[font-size:26px]"
                style={{ fontWeight: "bold" }}
              >
                Inicio
              </text>

              <text
                x={invert ? endX +40: endX-40}
                y="420"
                textAnchor="middle"
                fill="hsl(var(--primary))"
                fontSize="20"
                className="max-md:[font-size:44px] md:[font-size:26px]"
                style={{ fontWeight: "bold" }}
              >
                Tu Casa
              </text>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
