"use client";

import { useCartStore } from "@/store/cart";
import { useUIStore } from "@/store/ui";
import { motion } from "framer-motion";
import { LayoutGrid, MessageCircle, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { toggleCart, toggleChat, isCartOpen, isChatOpen, closeAll } = useUIStore();
  const { getTotalItems } = useCartStore();

  const isAnyOverlayOpen = isCartOpen || isChatOpen;

  const navItems = [
    {
      label: "Productos",
      icon: LayoutGrid,
      href: "/products",
      active: pathname === "/products" && !isAnyOverlayOpen,
    },
    {
      label: "Carrito",
      icon: ShoppingBag,
      onClick: toggleCart,
      active: isCartOpen,
      badge: getTotalItems(),
    },
    {
      label: "Chat",
      icon: MessageCircle,
      onClick: toggleChat,
      active: isChatOpen,
    },
    {
      label: "Perfil",
      icon: User,
      href: "/profile",
      active: pathname === "/profile" && !isAnyOverlayOpen,
    },
  ];

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-[1000]">
      {/* Wave Background */}
      <div className="absolute bottom-0 left-0 w-full h-32 pointer-events-none overflow-hidden translate-y-2">
        <svg
          viewBox="0 0 500 150"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <path
            d="M0,60 C150,100 350,45 500,60 L500,150 L0,150 Z"
            className="fill-background shadow-2xl"
          />
          <path
            d="M0,60 C150,100 350,45 500,60"
            fill="none"
            className="stroke-primary/30"
            strokeWidth="2"
          />
        </svg>
      </div>

      <nav className="relative flex justify-around items-end pt-12 pb-0 h-24">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = item.active;

          const content = (
            <motion.div
              whileTap={{ scale: 0.9 }}
              className={`flex flex-col items-center gap-1 p-2 transition-all duration-300 ${
                isActive ? "text-primary " : "text-muted-foreground"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 ${isActive ? "drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]" : ""}`}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold ring-2 ring-background">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {item.label}
              </span>
              
            </motion.div>
          );

          if (item.href) {
            return (
              <Link key={idx} href={item.href} onClick={() => closeAll()}>
                {content}
              </Link>
            );
          }

          return (
            <button key={idx} onClick={item.onClick} className="outline-none">
              {content}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
