"use client";

import { products as productsContent } from "@/../content/products";
import { ProductCard } from "@/components/shared/ProductCard";
import { ProductSkeleton } from "@/components/shared/ProductSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatPrice } from "@/lib/utils";
import { productService } from "@/services/products";
import { useCurrencyStore } from "@/store/currency";
import { Category } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Filter, Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface Filters {
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  brand?: string;
  freeShipping?: boolean;
  inStock?: boolean;
  search?: string;
}

export default function ProductsPage() {
  const { currency } = useCurrencyStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState<Record<string, any>>({});
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const searchDebounceRef = useRef<NodeJS.Timeout>();

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  // Cargar datos de filtros al montar el componente
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [cats, brnds] = await Promise.all([
          productService.getCategories(),
          productService.getBrands(),
        ]);
        setCategories(cats as any);
        setBrands(brnds);
      } catch (err) {}
    };
    fetchFilterData();
  }, []);

  // Inicializar filtros desde la URL (Leer TODOS los parámetros)
  useEffect(() => {
    const urlFilters: Record<string, any> = {};
    searchParams.forEach((value, key) => {
   
      if (value.includes(",")) {
        urlFilters[key] = value.split(",");
      } else if (value === "true") {
        urlFilters[key] = true;
      } else if (value === "false") {
        urlFilters[key] = false;
      } else if (key === "minPrice" || key === "maxPrice") {
        urlFilters[key] = Number(value);
      } else {
        urlFilters[key] = value;
      }
    });
    setFilters(urlFilters);
    // Sincronizar el input de búsqueda con la URL
    setSearchInput(urlFilters.search || "");
  }, [searchParams]);

  // Efecto de búsqueda con debounce - actualiza los filtros cuando cambia searchInput
  useEffect(() => {
    if (searchInput === (filters.search || "")) return;

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      const newFilters = { ...filters, search: searchInput || undefined };
      if (!searchInput) {
        delete newFilters.search;
      }

      const params = new URLSearchParams();
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (Array.isArray(value)) {
            params.set(key, value.join(","));
          } else {
            params.set(key, String(value));
          }
        }
      });

      router.push(`/products?${params.toString()}`, { scroll: false });
      setPage(1);
    }, 300);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchInput, router, filters]);

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ["products", page, filters],
    queryFn: () =>
      productService.getProducts({
        page,
        limit: productsContent.listing.itemsPerPage,
        ...filters,
      }),
  });

  const updateURL = (newFilters: Record<string, any>) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        value !== false
      ) {
        if (Array.isArray(value)) {
          params.set(key, value.join(","));
        } else {
          params.set(key, String(value));
        }
      }
    });
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    if (
      value === undefined ||
      value === null ||
      value === false ||
      value === "all"
    ) {
      delete newFilters[key];
    }
    setFilters(newFilters);
    updateURL(newFilters);
    setPage(1);
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    const newFilters = { ...filters, minPrice: min, maxPrice: max };
    setFilters(newFilters);
    updateURL(newFilters);
    setPage(1);
  };

  const clearAllFilters = () => {
    setFilters({});
    setSearchInput("");
    router.push("/products", { scroll: false });
    setPage(1);
  };

  const activeFilterCount = Object.keys(filters).length;

  const FilterSidebar = () => (
    <div className="space-y-6">i
      <div className="">
        <h3 className="font-semibold mb-3 text-foreground">Ordenar Por</h3>
        <Select
          value={filters.sort}
          onValueChange={(v) => handleFilterChange("sort", v)}
        >
          <SelectTrigger className="border-2 border-primary/40 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20">
            <SelectValue placeholder="Seleccionar" />
          </SelectTrigger>
          <SelectContent>
            {productsContent.listing.sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filtro de categoría */}
      <div>
        <h3 className="font-semibold mb-3 text-foreground">Categoría</h3>
        <Select
          value={filters.category || "all"}
          onValueChange={(v) =>
            handleFilterChange("category", v === "all" ? undefined : v)
          }
        >
          <SelectTrigger className="border-2 border-primary/40 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20">
            <SelectValue placeholder="Todas las categorías" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filtro de marca */}
      <div>
        <h3 className="font-semibold mb-3 text-foreground">Marca</h3>
        <Select
          value={filters.brand || "all"}
          onValueChange={(v) =>
            handleFilterChange("brand", v === "all" ? undefined : v)
          }
        >
          <SelectTrigger className="border-2 border-primary/40 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20">
            <SelectValue placeholder="Todas las marcas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las marcas</SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand} value={brand}>
                {brand}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold mb-3 text-foreground">Rango de Precio</h3>
        <div className="space-y-2">
          {productsContent.listing.filters.priceRanges.map((range) => (
            <button
              key={range.label}
              onClick={() => handlePriceRangeChange(range.min, range.max)}
              className={`block w-full text-left text-sm px-4 py-3 rounded-xl border-2 transition-all ${
                filters.minPrice === range.min && filters.maxPrice === range.max
                  ? "border-primary bg-primary/10 text-primary font-semibold"
                  : "border-primary/30 hover:border-primary/60 hover:bg-primary/5"
              }`}
            >
              {range.label
                .replace("{0}", formatPrice(range.min, currency))
                .replace("{1}", formatPrice(range.min, currency))
                .replace(/{(\d+)}/g, (match, number) => {
                  const val =
                    number === "0" ? range.min : number === "1" ? range.max : 0;
                  return formatPrice(val, currency);
                })}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold mb-3 text-foreground">Filtros Rápidos</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all">
            <Checkbox
              id="free-shipping"
              checked={filters.freeShipping}
              onCheckedChange={(checked) =>
                handleFilterChange("freeShipping", checked)
              }
              className="border-2 border-primary/60"
            />
            <Label
              htmlFor="free-shipping"
              className="cursor-pointer font-medium"
            >
              {productsContent.listing.filters.shipping.label}
            </Label>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all">
            <Checkbox
              id="in-stock"
              checked={filters.inStock}
              onCheckedChange={(checked) =>
                handleFilterChange("inStock", checked)
              }
              className="border-2 border-primary/60"
            />
            <Label htmlFor="in-stock" className="cursor-pointer font-medium">
              {productsContent.listing.filters.availability.label}
            </Label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <main className="  pb-40 pt-20 md:pt-32 max-md:pt-10 ">
      <div className="mx-auto max-w-[80%] max-md:max-w-[90%] max-lg:max-w-[95%] max-sm:max-w-[80%]">
        <div className="flex items-center justify-between mb-8">
          {/* Botón de filtros  */}
          <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                {activeFilterCount > 0 && (
                  <Badge className="ml-2" variant="secondary">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>{productsContent.listing.filters.title}</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterSidebar />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="w-full flex gap-10">
          {/* Barra de búsqueda */}
          <div className="mb-10 ">
            <div className="relative w-[50vw] md:w-[70vw] max-md:w-full ">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-xl"></div>
              <div className="relative bg-white/80 backdrop-blur-md border-2 border-white/60 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-primary" />
                <Input
                  type="search"
                  placeholder="Buscar productos..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-16 pr-16 h-12 text-lg rounded-full border-2 border-primary/30 bg-transparent focus:ring-0 focus:outline-none placeholder:text-gray-400"
                />
                {searchInput && (
                  <button
                    onClick={() => setSearchInput("")}
                    className="absolute right-6 top-1/2 -translate-y-1/2 bg-primary/10 hover:bg-primary/20 text-primary rounded-full p-2 transition-all"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filtros activos */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-6  w-full">
              {Object.entries(filters).map(([key, value]) => {
                if (!value) return null;

                let label = `${key}: ${value}`;
                if (key === "sort")
                  label = `Ordenar: ${productsContent.listing.sortOptions.find((o) => o.value === value)?.label || value}`;
                if (key === "minPrice")
                  label = `Precio Mín: ${formatPrice(Number(value), currency)}`;
                if (key === "maxPrice")
                  label = `Precio Máx: ${formatPrice(Number(value), currency)}`;
                if (key === "category") label = `Categoría: ${value}`;
                if (key === "subcategoria") label = `Subcategoría: ${value}`;
                if (key === "search") label = `Búsqueda: "${value}"`;
                if (key === "freeShipping") label = "Envío Gratis";
                if (key === "inStock") label = "Solo en Stock";

                return (
                  <motion.div
                    key={key}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-medium text-sm shadow-lg hover:shadow-xl transition-all h-9 "
                  >
                    {label}
                    <button
                      onClick={() => handleFilterChange(key, undefined)}
                      className="hover:bg-white/20 rounded-full p-1 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.div>
                );
              })}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="rounded-full border-2 border-destructive/40 hover:border-destructive hover:bg-destructive/10 text-destructive font-semibold"
              >
                {productsContent.listing.filters.clearAll}
              </Button>
            </div>
          )}
        </div>
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <motion.div
              animate={{
                rotate: [0.5, -0.5, 0.5],
                y: [0, -3, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="sticky top-24"
            >
              <div className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 border-4 border-gray-200 rounded-[2rem] p-6 shadow-2xl shadow-primary/70">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                    {productsContent.listing.filters.title}
                  </h2>
                  <div className="h-1 w-20 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
                </div>
                <div>
                  <FilterSidebar />
                </div>
              </div>
            </motion.div>
          </aside>

          {/* Grid de productos */}
          <div className="flex-1 ">
            {isLoading || isFetching ? (
              <div className="grid  md:grid-cols-3 grid-cols-4 max-md:grid-cols-1 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Error cargando productos. Por favor intenta de nuevo.
                </p>
              </div>
            ) : !data || data.data.length === 0 ? (
              <div className="text-center py-2">
                <p className="text-muted-foreground">
                  {productsContent.listing.noResults}
                </p>
                <Button className="mt-4" onClick={clearAllFilters}>
                  Limpiar Filtros
                </Button>
              </div>
            ) : (
              <>
                <div className="grid max-md:grid-cols-2 max-sm:grid-cols-1 max-xl:grid-cols-3  grid-cols-4 gap-6">
                  {data.data.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Paginación numerada */}
                {data && data.totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-16">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="rounded-full w-10 h-10 border-muted-foreground/20"
                    >
                      ←
                    </Button>

                    <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-full">
                      {Array.from({ length: Math.min(5, data.totalPages) }).map(
                        (_, i) => {
                          let pageNum = i + 1;
                          if (data.totalPages > 5) {
                            if (page > 3 && page < data.totalPages - 2) {
                              pageNum = page - 2 + i;
                            } else if (page >= data.totalPages - 2) {
                              pageNum = data.totalPages - 4 + i;
                            }
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={page === pageNum ? "default" : "ghost"}
                              size="sm"
                              onClick={() => setPage(pageNum)}
                              className={`rounded-full w-9 h-9 p-0 font-medium ${page === pageNum ? "shadow-md shadow-primary/20" : "text-muted-foreground hover:text-foreground"}`}
                            >
                              {pageNum}
                            </Button>
                          );
                        },
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      disabled={page === data.totalPages}
                      onClick={() =>
                        setPage((p) => Math.min(data.totalPages, p + 1))
                      }
                      className="rounded-full w-10 h-10 border-muted-foreground/20"
                    >
                      →
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
