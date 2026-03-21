"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { configService } from "@/services/config";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";

export function FloatingWhastappButton() {
    const { user } = useAuth();

    const { data: config } = useQuery({
        queryKey: ["publicConfig"],
        queryFn: configService.getPublicConfig,
        staleTime: 1000 * 60 * 60, // 1 hora
    });

    const whatsappNumber = config?.contactPhone?.replace(/\D/g, "") || "";


    return (
        <div
            className={`fixed ${user ? "bottom-40" : "bottom-24"} max-sm:bottom-20 max-sm:-right-5     -right-3 z-40 flex flex-col items-end gap-3 pointer-events-none mb-2`}
        >
            <Button
                size="lg"
                className={`rounded-full bg-transparent hover:bg-transparent h-auto w-auto  pointer-events-auto border-2 border-transparent  transition-all duration-300`}
                onClick={() => window.open(`https://wa.me/${whatsappNumber}`, "_blank")}
            >
                <Image src="/images/whatsapp.png" alt="WhatsApp" width={60} height={60} className="rounded-full border-4 border-secondary/50 hover:bg-white/70 hover:scale-110 transition-all duration-300" />
            </Button>
        </div>
    );
}
