"use client";

import { navbar } from "@/../content/navbar";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import { configService } from "@/services/config";
import { productService } from "@/services/products";
import { useCartStore } from "@/store/cart";
import { useUIStore } from "@/store/ui";
import { Product } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Menu, ShoppingCart, User, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function Navbar() {
  const { data: config, isLoading } = useQuery({
    queryKey: ["publicConfig"],
    queryFn: configService.getPublicConfig,
    staleTime: 1000 * 60 * 60,
  });
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [categoriesTree, setCategoriesTree] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    productService.getCategoriesTree().then(setCategoriesTree);
  }, []);

  const CategoryColumn = ({ category }: { category: any }) => {
    const hasChildren = category.children && category.children.length > 0;

    return (
      <div className="break-inside-avoid mb-6">
        <Link
          href={`/products?categoria=${category.slug}`}
          className="font-bold mb-2 text-primary block hover:underline"
        >
          {category.name}
        </Link>
        {hasChildren && (
          <ul className="space-y-1 ml-1 pl-2 border-l border-muted">
            {category.children.map((child: any) => (
              <li key={child.id}>
                <Link
                  href={`/products?categoria=${category.slug}&subcategoria=${child.slug}`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors block py-0.5"
                >
                  {child.name}
                </Link>
                {child.children && child.children.length > 0 && (
                  <ul className="pl-2 mt-1 space-y-1">
                    {child.children.map((grandChild: any) => (
                      <li key={grandChild.id}>
                        <Link
                          href={`/products?categoria=${category.slug}&subcategoria=${child.slug}&subcategoria=${grandChild.slug}`}
                          className="text-xs text-muted-foreground/80 hover:text-primary transition-colors block"
                        >
                          - {grandChild.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  const pathname = usePathname();
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounce(searchQuery, 150);

  const { toggleCart, toggleMobileMenu, isMobileMenuOpen } = useUIStore();
  const { getTotalItems } = useCartStore();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 32);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (pathname === "/products") {
      return;
    }

    if (debouncedSearch.trim()) {
      productService
        .searchProducts(debouncedSearch as unknown as string)
        .then((res) => {
          setSearchResults(res.data.slice(0, navbar.search.sitewideLimit));
          setShowSearchResults(true);
        })
        .catch(() => setSearchResults([]));
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [debouncedSearch, pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
    setShowSearchResults(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowSearchResults(false);
      setActiveMegaMenu(null);
    }
  };

  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{
        backgroundColor: scrolled ? "" : "rgba(255, 255, 255, 0.95)",
      }}
      transition={{ duration: 0.3 }}
      className={`fixed z-50 transition-all duration-300 w-full lg:w-auto ${
        scrolled
          ? "top-2 lg:top-5 bg-secondary/60 backdrop-blur-md py-2 w-[95%] lg:w-[80%] left-1/2 right-1/2 -ml-[47.5%] lg:-ml-[40%] -mr-[47.5%] lg:-mr-[40%] rounded-[1.5rem] lg:rounded-full shadow-2xl shadow-primary/20"
          : "top-0 left-0 right-0 backdrop-blur-xl shadow-md"
      }`}
      onKeyDown={handleKeyDown}
    >
      <div className=" mx-auto px-4 lg:px-16 w-full ">
        <div
          className={`flex items-center justify-between transition-all ${scrolled ? "h-12" : "h-16 lg:h-20"}`}
        >
          <Link
            href="/"
            className={`flex items-center gap-2 font-bold text-2xl transition-colors ${scrolled ? "text-white" : "text-primary"}`}
          >
            {isLoading ? (
              <div
                className={`animate-pulse bg-zinc-200/50 rounded-md ${scrolled ? "h-6 w-24" : "h-8 w-32"}`}
              />
            ) : config?.logoUrl ? (
              <img
                src={config.logoUrl}
                alt={config.storeName || navbar.logo.alt}
                className={scrolled ? "h-8 w-auto" : "h-12 w-auto"}
              />
            ) : (
              navbar.logo.text
            )}
          </Link>

          <nav
            className={`hidden lg:flex items-center gap-2 transition-all ${scrolled ? "" : "bg-white/40 backdrop-blur-sm rounded-full px-3 py-2"}`}
          >
            <Link
              href="/"
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all  ${scrolled ? "text-white hover:bg-white hover:text-gray-700" : "text-foreground hover:bg-secondary/60 hover:text-white"}`}
            >
              Inicio
            </Link>

            {/* Dropdown de Categorías */}
            <div
              className="relative"
              onMouseEnter={() => setActiveMegaMenu("categories")}
              onMouseLeave={() => setActiveMegaMenu(null)}
            >
              <button
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${scrolled ? "text-white hover:bg-white hover:text-gray-700" : "text-foreground hover:bg-secondary/60 hover:text-white"} flex items-center gap-1`}
                onClick={() =>
                  setActiveMegaMenu(
                    activeMegaMenu === "categories" ? null : "categories",
                  )
                }
              >
                Categorías
              </button>

              <AnimatePresence>
                {activeMegaMenu === "categories" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-2 bg-white/95 backdrop-blur-md shadow-xl rounded-xl p-6 w-[800px] soft-shadow border border-muted z-50"
                  >
                    <div className="grid grid-cols-4 gap-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                      {categoriesTree.length > 0 ? (
                        categoriesTree.map((cat: any) => (
                          <CategoryColumn key={cat.id} category={cat} />
                        ))
                      ) : (
                        <div className="col-span-4 text-center text-muted-foreground py-8">
                          Cargando categorías...
                        </div>
                      )}
                    </div>
                    <div className="mt-6 pt-4 border-t text-center">
                      <Link
                        href="/categories"
                        className="text-primary font-bold hover:underline text-sm"
                      >
                        Ver Todas las Categorías
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/products?tendencia=true"
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${scrolled ? "text-white hover:bg-white hover:text-gray-700" : "text-foreground hover:bg-secondary/60 hover:text-white"}`}
            >
              Tendencias
            </Link>
            <Link
              href="/products?esNuevo=true"
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all  ${scrolled ? "text-white hover:bg-white hover:text-gray-700" : "text-foreground hover:bg-secondary/60 hover:text-white"}`}
            >
              Nuevos
            </Link>
            <Link
              href="/products"
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all  ${scrolled ? "text-white hover:bg-white hover:text-gray-700" : "text-foreground hover:bg-secondary/60 hover:text-white"}`}
            >
              Todos
            </Link>
          </nav>

          <div className="flex items-center gap-1 lg:gap-4" ref={searchRef}>
            <Button
              variant="ghost"
              className={`rounded-lg hover:bg-white/50 p-2 h-auto w-auto hidden sm:flex ${scrolled ? "text-white" : "hover:bg-secondary/60 hover:text-white"}`}
              onClick={() => router.push("/profile")}
            >
              <User className="!h-7 !w-7" />
            </Button>

            <Button
              variant="ghost"
              className={`rounded-lg hover:bg-white/50 p-2 h-auto w-auto hidden sm:flex ${scrolled ? "text-white" : "hover:bg-secondary/60 hover:text-white"}`}
              onClick={() => router.push("/favorites")}
            >
              <Heart className="!h-7 !w-7" />
            </Button>

            <Button
              variant="ghost"
              className={`relative rounded-lg hover:bg-white/50 p-2 h-auto w-auto ${scrolled ? "text-white" : "hover:bg-secondary/60 hover:text-white"}`}
              onClick={toggleCart}
            >
              <ShoppingCart className="!h-7 !w-7" />
              {mounted && getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold border-2 border-white">
                  {getTotalItems()}
                </span>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-lg flex items-center justify-center p-2"
              onClick={toggleMobileMenu}
            >
              {mounted && isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
