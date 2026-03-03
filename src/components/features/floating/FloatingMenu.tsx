"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { configService } from "@/services/config";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Plus, ShoppingBag, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function FloatingMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const { data: config } = useQuery({
    queryKey: ["publicConfig"],
    queryFn: configService.getPublicConfig,
    staleTime: 1000 * 60 * 60, // 1 hora
  });

  const whatsappNumber = config?.contactPhone?.replace(/\D/g, "") || "";

  const menuItems = [
    {
      icon: <MessageCircle className="w-5 h-5" />,
      label: "WhatsApp",
      color: "bg-green-500",
      action: () => {
        if (whatsappNumber) {
          window.open(`https://wa.me/${whatsappNumber}`, "_blank");
        }
      },
    },
    {
      icon: <ShoppingCart className="w-5 h-5" />,
      label: "Carrito",
      color: "bg-blue-500",
      action: () => (window.location.href = "/cart?reloaded=true"),
    },
    {
      icon: <ShoppingBag className="w-5 h-5" />,
      label: "Productos",
      color: "bg-secondary",
      action: () => router.push("/products"),
    },
  ];

  return (
    <div
      className={`fixed ${user ? "bottom-40" : "bottom-24"} right-6 z-40 flex flex-col items-end gap-3 pointer-events-none mb-2`}
    >
      <AnimatePresence>
        {isOpen && (
          <div className="flex flex-col gap-3 items-end pointer-events-auto pb-4">
            {menuItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-sm font-medium shadow-md">
                  {item.label}
                </div>
                <Button
                  size="icon"
                  className={`rounded-full h-10 w-10 shadow-lg ${item.color} hover:contrast-125 text-white`}
                  onClick={item.action}
                >
                  {item.icon}
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <Button
        size="lg"
        className={`rounded-full h-12 w-12 shadow-xl pointer-events-auto border-2 border-primary hover:border-secondary  transition-all duration-300  ${
          isOpen ? "bg-red-500 rotate-45" : "bg-black "
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Plus className="w-6 h-6 text-white" />
      </Button>
    </div>
  );
}
