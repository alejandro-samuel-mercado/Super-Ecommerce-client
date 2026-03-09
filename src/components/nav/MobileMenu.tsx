import { productService } from "@/services/products";
import { useUIStore } from "@/store/ui";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { configService } from "@/services/config";
import { useAuth } from "@/contexts/AuthContext";

export function MobileMenu() {
  const { isMobileMenuOpen, closeMobileMenu } = useUIStore();
  const [categories, setCategories] = useState<any[]>([]);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
const {user}= useAuth()

  const { data: config } = useQuery({
    queryKey: ["publicConfig"],
    queryFn: configService.getPublicConfig,
  });

  useEffect(() => {
    productService.getCategoriesTree().then(setCategories);
  }, []);

  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.4, y: -2000, x: 1000 }}
          animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -2000, x: 1000 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
     className="
  fixed
  top-0 left-0 right-0 pb-20
  z-[1000]
  lg:hidden
  flex flex-col
  bg-white/95 backdrop-blur-3xl
  overflow-y-auto
  w-full
  h-auto
"
        >
          <div className="flex items-center justify-between p-4 px-6 border-b border-gray-200/50">
            <Link className="h-10 w-14 m-2" href="/">
              {config?.logoUrl && (
                <img
                  src={config.logoUrl}
                  alt={config.storeName || ""}
                />
              )}
            </Link>

            <button
              onClick={closeMobileMenu}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          <div className="flex-1 px-8 py-0 flex flex-col gap-6 w-full max-w-lg mx-auto">

            <Link
              href="/"
              onClick={closeMobileMenu}
              className="flex justify-between items-center text-3xl max-sm:text-2xl font-semibold text-gray-800 hover:text-primary transition-all py-2 mt-4"
            >
              Inicio
              <ChevronRight className="w-6 h-6 text-gray-400" />
            </Link>

            <div className="">
              <button
                onClick={() => setIsCategoriesOpen((prev) => !prev)}
                className="w-full flex justify-between items-center text-3xl max-sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent py-2"
              >
                Categorías
                <motion.span
                  animate={{ rotate: isCategoriesOpen ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-primary"
                >
                  <ChevronRight className="w-6 h-6" />
                </motion.span>
              </button>

              <AnimatePresence>
                {isCategoriesOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col gap-3 pl-4 mt-4 border-l-2 border-primary/30">
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/products?categoria=${cat.slug}`}
                          onClick={closeMobileMenu}
                          className="text-xl font-medium text-gray-600 hover:text-primary hover:translate-x-2 transition-all"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/products?isTrending=true"
              onClick={closeMobileMenu}
              className="flex justify-between items-center text-3xl max-sm:text-2xl font-semibold text-gray-800 hover:text-primary transition-all py-2"
            >
              Tendencias
              <ChevronRight className="w-6 h-6 text-gray-400" />
            </Link>

            <Link
              href="/products?isNew=true"
              onClick={closeMobileMenu}
              className="flex justify-between items-center text-3xl max-sm:text-2xl font-semibold text-gray-800 hover:text-primary transition-all py-2"
            >
              Nuevos
              <ChevronRight className="w-6 h-6 text-gray-400" />
            </Link>

            <Link
              href="/products"
              onClick={closeMobileMenu}
              className="flex justify-between items-center text-3xl max-sm:text-2xl font-semibold text-gray-800 hover:text-primary transition-all py-2"
            >
              Todos los Productos
              <ChevronRight className="w-6 h-6 text-gray-400" />
            </Link>
              <Link
              href="/favorites"
              onClick={closeMobileMenu}
              className="flex sm:hidden justify-between items-center text-3xl max-sm:text-2xl font-semibold text-gray-800 hover:text-primary transition-all py-2"
            >
             Mis Favoritos
              <ChevronRight className="w-6 h-6 text-gray-400" />
            </Link>
               <Link
              href={user ? "/profile" : "/login"}
              onClick={closeMobileMenu}
              className="flex sm:hidden justify-between items-center text-3xl max-sm:text-2xl font-semibold text-gray-800 hover:text-primary transition-all py-2"
            >
              {user ? "Mi Cuenta" : "Iniciar Sesión"}
              <ChevronRight className="w-6 h-6 text-gray-400" />
            </Link>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}