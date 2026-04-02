"use client";

import { home } from "@/../content/home";
import { navbar } from "@/../content/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/lib/utils";
import { configService } from "@/services/config";
import { productService } from "@/services/products";
import { useCartStore } from "@/store/cart";
import { useCurrencyStore } from "@/store/currency";
import { useUIStore } from "@/store/ui";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
      Bell,
      Headphones,
      Heart,
      Menu,
      Package,
      Search,
      ShieldCheck,
      ShoppingCart,
      Truck,
      User,
      X
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    truck: Truck,
    "shield-check": ShieldCheck,
    package: Package,
    headphones: Headphones,
};

export function Hero() {
    const { data: config, isLoading: isConfigLoading } = useQuery({
        queryKey: ["publicConfig"],
        queryFn: configService.getPublicConfig,
        staleTime: 1000 * 60 * 60,
    });
    const { carousel, featureBadges } = home.hero;
    const { user } = useAuth();
    const {
        toggleCart,
        toggleNotifications,
        toggleMobileMenu,
        isMobileMenuOpen
    } = useUIStore();
    const { currency } = useCurrencyStore();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
    const [categoriesTree, setCategoriesTree] = useState<any[]>([]);

    const [mounted, setMounted] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const router = useRouter();
    const { getTotalItems } = useCartStore();

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const searchContainerRef = useRef<HTMLFormElement>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length > 0) {
                setIsSearching(true);
                setShowSearchResults(true);
                try {
                    const results = await productService.searchProducts(
                        searchQuery as any,
                    );
                    setSearchResults(results.data || []);
                } catch (error) {
                    setSearchResults([]);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
                setShowSearchResults(false);
                setIsSearching(false);
            }
        }, 90);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    useEffect(() => {
        setMounted(true);
        productService.getCategoriesTree().then(setCategoriesTree);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                searchContainerRef.current &&
                !searchContainerRef.current.contains(event.target as Node)
            ) {
                setShowSearchResults(false);
            }
        };

        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
            setShowSearchResults(false);
        };

        if (showSearchResults) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        window.addEventListener("scroll", handleScroll);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", handleScroll);
        };
    }, [showSearchResults]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
        setShowSearchResults(false);
    };

    const getBannerSlides = () => {
        if (!config?.bannerImage) return carousel.slides;

        if (Array.isArray(config.bannerImage)) {
            return config.bannerImage.length > 0
                ? config.bannerImage
                : carousel.slides;
        }

        const legacyBanner = config.bannerImage as any;
        if (typeof legacyBanner === "string" && legacyBanner.trim()) {
            return [
                {
                    image: legacyBanner,
                    imageAlt: "Store Banner",
                    backgroundColor: "#f3f4f6",
                    title: config.storeName || "Bienvenidos",
                    subtitle: "Nuestra selección para ti",
                },
            ];
        }

        return carousel.slides;
    };

    const bannerSlides = getBannerSlides();

    const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, [bannerSlides.length]);

    const prevSlide = useCallback(() => {
        setCurrentSlide(
            (prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length,
        );
    }, [bannerSlides.length]);

    const goToSlide = useCallback((index: number) => {
        setCurrentSlide(index);
    }, []);

    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(() => {
            nextSlide();
        }, carousel.autoPlayInterval);

        return () => clearInterval(interval);
    }, [isAutoPlaying, nextSlide, carousel.autoPlayInterval]);

    if (isConfigLoading) {
        return (
            <section className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mb-[25vh] pt-6 max-md:pt-0 pb-12">
                <div className="px-40 mx-auto px-4 ">
                    <div className="bg-zinc-50 borde">
                        {/* Barra de búsqueda Skeleton */}
                        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-xl h-14 bg-white/50 rounded-full animate-pulse" />

                        {/* Contenido Skeleton */}
                        <div className="absolute left-20 top-1/2 -translate-y-1/2 space-y-6">
                            <div className="h-4 w-32 bg-zinc-200 rounded animate-pulse" />
                            <div className="h-16 w-[500px] bg-zinc-200 rounded-2xl animate-pulse" />
                            <div className="h-16 w-[400px] bg-zinc-200 rounded-2xl animate-pulse" />
                            <div className="h-10 w-48 bg-zinc-200 rounded-full animate-pulse mt-8" />
                        </div>

                        {/* Badges Skeleton */}
                        <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="h-24 w-48 bg-white/50 rounded-2xl animate-pulse"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    const currentSlideData = bannerSlides[currentSlide];
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
                    <ul className="space-y-1 ml-1 pl-2 border-l border-border">
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

    return (
        <section className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mb-[25vh] max-lg:mb-[15vh] max-md:mb-[25vh] pt-6 max-md:pt-0 pb-12 max-sm:pb-28">
            {/* Navbar */}
            <div
                className={`fixed lg:top-5 z-50 transition-all duration-300 max-sm:w-full   left-0 right-0 ${scrolled
                        ? "flex max-sm:max-w-[90%] max-sm:left-0 max-sm:right-0 max-sm:mx-auto   bg-secondary/60 backdrop-blur-md shadow-sm py-3 max-md:py-2 max-sm:py-1 w-[95%] lg:w-[80%] left-1/2 right-1/2 -ml-[47.5%] lg:-ml-[40%] -mr-[47.5%] lg:-mr-[40%] rounded-[1.5rem] lg:rounded-full top-2 max-sm:top-6"
                        : "max-lg:py-3 max-sm:py-2 max-lg:px-4 max-sm:px-1 py-4 max-lg:bg-gradient-to-r from-secondary to-primary lg:left-1/2 lg:right-1/2 lg:-ml-[40%] lg:-mr-[40%] lg:w-[80%]  w-full left-0 right-0 shadow-md lg:shadow-none top-0"
                    }`}
            >
                <div className="container mx-auto px-4 lg:px-6 w-full">
                    <div className="flex items-center justify-between ">
                        {/* Logo */}
                        <Link
                            href="/"
                            className="lg:ml-6 flex items-center gap-2 font-bold text-xl text-white"
                        >
                            {config?.logoUrl ? (
                                <img
                                    src={config.logoUrl}
                                    alt={config.storeName || navbar.logo.alt}
                                    className={scrolled ? "h-8 w-auto" : "h-7 md:h-8 w-auto max-lg:h-10 max-sm:h-8 "}
                                />
                            ) : (
                                navbar.logo.text
                            )}
                        </Link>


                        <nav
                            className={`hidden lg:flex items-center gap-2 transition-all duration-300 ${scrolled
                                    ? ""
                                    : "bg-white/40 backdrop-blur-sm rounded-full px-3 py-2 "
                                }`}
                        >
                            <Link
                                href="/"
                                className="px-5 py-2 rounded-full text-sm font-medium transition-all hover:bg-white bg-white/80 text-black"
                            >
                                Inicio
                            </Link>
                            <div
                                className="relative"
                                onMouseEnter={() => setActiveMegaMenu("categories")}
                                onMouseLeave={() => setActiveMegaMenu(null)}
                            >
                                <button
                                    className="px-5 py-2.5 rounded-full text-sm font-medium transition-all  text-white hover:text-black hover:bg-white flex items-center gap-1"
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
                                            className="absolute top-full left-0 mt-2 bg-white/95 backdrop-blur-md shadow-xl rounded-xl p-6 w-[800px] soft-shadow border border-border z-50"
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

                            <form
                                ref={searchContainerRef}
                                onSubmit={handleSearchSubmit}
                                className="relative hidden lg:block"
                            >
                                <Input
                                    type="search"
                                    placeholder={navbar.search.placeholder}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => setShowSearchResults(true)}
                                    className="w-64 pr-10 rounded-lg bg-white/30 focus:bg-white text-gray-700 placeholder:text-gray-500"
                                />
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />

                                {showSearchResults && searchQuery.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-md shadow-xl rounded-xl p-2 max-h-80 w-80 overflow-auto z-50">
                                        {isSearching ? (
                                            <div className="p-4 text-center text-muted-foreground text-sm">
                                                Buscando...
                                            </div>
                                        ) : searchResults.length > 0 ? (
                                            <>
                                                {searchResults.map((product) => (
                                                    <Link
                                                        key={product.id}
                                                        href={`/products/${product.qr || product.id}`}
                                                        className="flex items-center justify-between gap-3 p-2 hover:bg-primary/5 rounded-lg transition-colors w-full"
                                                        onClick={() => setShowSearchResults(false)}
                                                    >
                                                        <div className="flex items-center gap-3 w-full">
                                                            <div className="relative w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
                                                                {product.images && product.images[0] ? (
                                                                    <Image
                                                                        src={
                                                                            product.images[0].url || product.images[0]
                                                                        }
                                                                        alt={product.name}
                                                                        fill
                                                                        className="object-cover"
                                                                    />
                                                                ) : (
                                                                    <Package className="w-5 h-5 text-gray-400" />
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col flex-grow min-w-0">
                                                                <span className="font-semibold text-sm truncate text-gray-900 block">
                                                                    {product.name}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground truncate block">
                                                                    {product.brand || "Sin marca"}
                                                                </span>
                                                                <span className="text-sm text-primary font-bold mt-0.5 block">
                                                                    {formatPrice(
                                                                        product.basePrice || product.price,
                                                                        product.currencyCode || currency,
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                                <div className="mt-2 text-center border-t pt-2">
                                                    <Link
                                                        href={`/products?search=${encodeURIComponent(searchQuery)}`}
                                                        className="text-xs text-primary hover:underline font-semibold block w-full py-1"
                                                        onClick={() => setShowSearchResults(false)}
                                                    >
                                                        Ver todos los resultados para &quot;{searchQuery}&quot;
                                                    </Link>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="p-4 text-center text-muted-foreground text-sm">
                                                No se encontraron productos.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </form>
                        </nav>


                        <div className="hidden lg:flex items-center gap-6">
                            <Link
                                href="/products"
                                className="text-sm font-semibold text-white hover:bg-white px-2 py-2 rounded-full hover:text-gray-900 transition-all"
                            >
                                Productos
                            </Link>
                            <Link
                                href="/products?isTrending=true"
                                className="text-sm font-semibold text-white hover:bg-white px-2 py-2 rounded-full hover:text-gray-900 transition-all"
                            >
                                Tendencias
                            </Link>

                            {config?.navItemName && (
                                <Link
                                    href="/custom"
                                    className="text-sm font-semibold text-white hover:bg-white px-2 py-2 rounded-full hover:text-gray-900 transition-all"
                                >
                                    {config.navItemName}
                                </Link>
                            )}


                        </div>

                        {/* Iconos - Lado Derecho */}
                        <div className="flex items-center gap-1 max-lg:gap-4 mr-0 max-lg:mr-2 max-sm:mr-0 pl-2">
                            <AnimatePresence>
                                {isMobileSearchExpanded && (
                                    <motion.form
                                        initial={{ width: 0, opacity: 0 }}
                                        animate={{ width: "120px", opacity: 1 }}
                                        exit={{ width: 0, opacity: 0 }}
                                        onSubmit={handleSearchSubmit}
                                        className="sm:hidden flex items-center relative"
                                    >
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="Buscar..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full h-9 px-3 pr-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs text-white placeholder:text-white/70 focus:outline-none focus:ring-1 focus:ring-white/50"
                                        />
                                        <button type="submit" className="absolute right-2 text-white">
                                            <Search className="h-4 w-4" />
                                        </button>
                                    </motion.form>
                                )}
                            </AnimatePresence>

                            <div className="flex items-center sm:hidden -mr-3">
                                <Button
                                    variant="ghost"
                                    className="rounded-lg hover:bg-white/30 p-2 h-auto w-auto text-white"
                                    onClick={() => setIsMobileSearchExpanded(!isMobileSearchExpanded)}
                                >
                                    {isMobileSearchExpanded ? (
                                        <X className="!h-6 !w-6" />
                                    ) : (
                                        <Search className="!h-6 !w-6" />
                                    )}
                                </Button>

                                {user && (
                                    <Button
                                        variant="ghost"
                                        className="relative rounded-lg hover:bg-white/30 p-2 h-auto w-auto text-white"
                                        onClick={toggleNotifications}
                                    >
                                        <Bell className="!h-6 !w-6" />

                                    </Button>
                                )}
                            </div>

                            <Button
                                variant="ghost"
                                className="rounded-lg hover:bg-white/30 hidden sm:flex p-2 h-auto w-auto"
                                onClick={() => router.push("/profile?tab=orders")}
                                title="Mis Pedidos"
                            >
                                <Package className="!h-6 !w-6 max-lg:!h-10 max-lg:!w-10 text-white font-bold" />
                            </Button>

                            <Button
                                variant="ghost"
                                className="rounded-lg hover:bg-white/30 hidden sm:flex p-2 h-auto w-auto"
                                onClick={() => router.push(user ? "/profile" : "/login")}
                            >
                                <User className="!h-6 !w-6 max-lg:!h-10 max-lg:!w-10  text-white font-bold" />
                            </Button>

                            <Button
                                variant="ghost"
                                className="rounded-lg hover:bg-white/30 hidden sm:flex p-2 h-auto w-auto"
                                onClick={() => router.push("/favorites")}
                            >
                                <Heart className="!h-6 !w-6  max-lg:!h-10 max-lg:!w-10  text-white font-bold" />
                            </Button>

                            <Button
                                variant="ghost"
                                className="relative rounded-lg hover:bg-white/30 hidden sm:flex p-2 h-auto w-auto"
                                onClick={toggleCart}
                            >
                                <ShoppingCart className="!h-6 !w-6 max-lg:!h-10 max-lg:!w-10  text-white font-bold" />
                                {mounted && getTotalItems() > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 md:h-6 md:w-6 flex items-center justify-center font-bold border-2 border-white">
                                        {getTotalItems()}
                                    </span>
                                )}
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="lg:hidden rounded-lg hover:bg-white/20 p-2 h-auto w-auto text-white"
                                onClick={toggleMobileMenu}
                            >
                                {mounted && isMobileMenuOpen ? (
                                    <X className="h-6 w-6  max-lg:!h-10 max-lg:!w-10 max-sm:!h-8 max-sm:!w-8" />
                                ) : (
                                    <Menu className="h-6 w-6  max-lg:!h-10 max-lg:!w-10 max-sm:!h-8 max-sm:!w-8" />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
                {!scrolled && (
                    <div className="sm:hidden absolute top-full left-0 w-full h-6 -mt-1 pointer-events-none -translate-y-1">
                        <svg
                            viewBox="0 0 500 150"
                            preserveAspectRatio="none"
                            className="h-full w-full rotate-180"
                        >
                            {/* fondo */}
                            <path
                                d="M0,50 C150,150 350,-50 500,50 L500,150 L0,150 Z"
                                fill="url(#hero-nav-gradient)"
                            />

                            {/* borde */}
                            <path
                                d="M0,50 C150,150 350,-50 500,50"
                                fill="none"
                                stroke="#ffffff"
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            <defs>
                                <linearGradient id="hero-nav-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                                    <stop offset="100%" stopColor="hsl(var(--secondary))" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                )}
            </div>

            {/* Tarjeta de Calificación Flotante - Lado Izquierdo */}
            <div className="px-20 mx-auto max-xl:px-10 max-lg:px-5 max-md:px-0 max-md:mt-12 max-sm:pt-4 ">
                <motion.div
                    animate={{
                        rotate: [1, -1, 1],
                        y: [0, -5, 0],
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="bg-white rounded-[2.5rem] max-md:rounded-none shadow-xl overflow-hidden relative "
                >
                    {/* Contenido del Hero con Fondo */}
                    <div className="relative min-h-[85vh] max-md:min-h-[35vh] max-sm:min-h-[28vh] max-lg:min-h-[45vh] ">

                        <div
                            className="absolute inset-0 rounded-[2.5rem] max-md:rounded-none overflow-hidden "
                            onMouseEnter={() => setIsAutoPlaying(false)}
                            onMouseLeave={() => setIsAutoPlaying(true)}
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentSlide}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: carousel.transitionDuration / 1000 }}
                                    className="absolute inset-0 "
                                    style={{ backgroundColor: currentSlideData.backgroundColor }}
                                >
                                    <Image
                                        src={currentSlideData.url || currentSlideData.image}
                                        alt={currentSlideData.title || currentSlideData.imageAlt}
                                        fill
                                        className="object-cover "
                                        priority={currentSlide === 0}
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Contenido Principal */}
                        <div className="container mx-auto px-4 h-[75vh] max-md:h-[30vh] max-sm:h-[20vh] max-lg:mh-[40vh] flex items-center justify-start relative z-10 pointer-events-none ">
                            <div className="max-w-2xl pl-0 lg:pl-8 pointer-events-auto">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentSlide}
                                        initial={{ opacity: 0, x: -30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 30 }}
                                        transition={{ duration: 0.5 }}
                                        className="text-left py-12"
                                    >
                                        <div className="text-white">
                                            <motion.h1
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                                className="text-5xl md:text-7xl font-bold mb-2 leading-tight drop-shadow-lg"
                                            >
                                                {currentSlideData.title}
                                            </motion.h1>
                                            {currentSlideData.titleLine2 && (
                                                <motion.h1
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.3 }}
                                                    className="text-5xl md:text-7xl font-bold mb-6 leading-tight drop-shadow-lg"
                                                >
                                                    {currentSlideData.titleLine2}
                                                </motion.h1>
                                            )}
                                            <motion.p
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.4 }}
                                                className="text-xl md:text-2xl opacity-90 mb-10 max-w-xl drop-shadow-md"
                                            >
                                                {currentSlideData.subtitle}
                                            </motion.p>
                                          
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Indicadores del Carousel */}
                        <div className="absolute bottom-10 left-0 right-0 z-30 flex justify-center gap-3">
                            {bannerSlides.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    onMouseEnter={() => setIsAutoPlaying(false)}
                                    onMouseLeave={() => setIsAutoPlaying(true)}
                                    className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 hover:cursor-pointer ${currentSlide === index
                                            ? "bg-white w-8 shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                                            : "bg-white/40 hover:bg-white/60"
                                        }`}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Badges de Características - Sobresaliendo del fondo */}
            <div className=" absolute lg:-bottom-16 max-sm:-bottom-[80%]  z-40 w-full max-md:-bottom-10  max-md:h-full ">
                <div className="md:container flex mx-auto  w-full justify-center    max-sm:h-46 max-md:h-48 lg:h-46 ">
                    <div className="flex gap-60 max-lg:gap-36 justify-center max-md:justify-between w-[40vw] md:w-[65vw] max-md:gap-28 max-sm:gap-4 max-md:w-[100%] max-sm:mx-6 max-sm:w-[100%]  max-md:mx-10    h-full">
                        {featureBadges.map((badge, index) => {
                            const Icon = iconMap[badge.icon];
                            return (
                                <motion.div
                                    key={badge.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.1 * index }}
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    className="border-2 border-gray-400 bg-background/20 backdrop-blur-xl shadow-sm rounded-2xl p-6 w-50 "
                                >
                                    <div className="flex flex-col items-center text-center gap-3">
                                        <div
                                            className="w-14 h-14 rounded-full flex items-center justify-center"
                                            style={{
                                                backgroundColor: `${badge.color}`,
                                                color: "white",
                                            }}
                                        >
                                            {Icon && <Icon className="w-7 h-7 [color:inherit]" />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-600  text-sm md:text-base mb-1">
                                                {badge.title}
                                            </h3>
                                            <p className="text-xs text-gray-400  font-semibold">
                                                {badge.subtitle}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
