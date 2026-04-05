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
            <div className="w-screen relative left-1/2 -translate-x-1/2 h-16 bg-gradient-to-r from-secondary/70 via-secondary/70 to-secondary/90 animate-pulse" />
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
    const baseItems = marqueeItems.map((item) =>
        item.replace(
            "{0}",
            formatPrice(config?.freeShippingThreshold || 0, currency),
        ),
    );


    const items = [...baseItems];
    const repeatedItems = [...items, ...items, ...items, ...items];

    return (
        <div className="w-screen relative left-1/2 -translate-x-1/2 overflow-hidden bg-gradient-to-r from-secondary/70 via-indigo-600/70 to-primary/70 pointer-events-none">

            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

            {/* Marquee */}
            <div className="relative py-10 pointer-events-auto">
                <motion.div
                    className="flex whitespace-nowrap items-center w-max"
                    animate={{ x: ["0%", "-25%"] }}
                    transition={{
                        duration: items.length * 3,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                >
                    {repeatedItems.map((item, idx) => (
                        <div
                            key={idx}
                            className="flex items-center px-8 text-lg sm:text-xl font-bold text-white tracking-widest uppercase"
                        >
                            <span>{item}</span>
                            <span className="ml-16 text-white/25 text-2xl select-none">
                                ★
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
