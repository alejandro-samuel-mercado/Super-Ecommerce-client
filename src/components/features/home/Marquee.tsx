"use client";

import { home } from "@/../content/home";
import { formatPrice } from "@/lib/utils";
import { configService } from "@/services/config";
import { useCurrencyStore } from "@/store/currency";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

export function Marquee() {
  const { currency } = useCurrencyStore();
  const { data: config, isLoading } = useQuery({
    queryKey: ["publicConfig"],
    queryFn: configService.getPublicConfig,
    staleTime: 1000 * 60 * 60,
  });

  if (isLoading) {
    return (
      <div className="w-screen relative left-1/2 -translate-x-1/2 h-16 bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-700 animate-pulse" />
    );
  }

  const getMarqueeItems = () => {
    if (!config?.marqueeText) return home.marquee.items;
    if (Array.isArray(config.marqueeText)) {
      return config.marqueeText.length > 0
        ? config.marqueeText
        : home.marquee.items;
    }
    const legacyText = config.marqueeText as any;
    if (typeof legacyText === "string" && legacyText.trim()) {
      return [legacyText];
    }
    return home.marquee.items;
  };

  const marqueeItems = getMarqueeItems();
  const items = marqueeItems.map((item) =>
    item.replace(
      "{0}",
      formatPrice(config?.freeShippingThreshold || 0, currency),
    ),
  );

  const repeatedItems = [...items, ...items, ...items, ...items];

  return (
    <div className="w-screen relative left-1/2 -translate-x-1/2 overflow-hidden bg-gradient-to-r from-purple-700/70 via-indigo-600/70 to-primary/70 pointer-events-none">
     
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      {/* Marquee */}
      <div className="relative py-10 pointer-events-auto">
        <motion.div
          className="flex whitespace-nowrap items-center"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: home.marquee.speed ,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {repeatedItems.map((item, idx) => (
            <span
              key={idx}
              className="inline-flex items-center mx-12 text-lg sm:text-xl font-bold text-white tracking-widest uppercase"
            >
              {item}
              <span className="ml-12 text-white/25 text-2xl select-none">
                ★
              </span>
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
