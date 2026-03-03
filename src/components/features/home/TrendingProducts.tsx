"use client";

import { home } from "@/../content/home";
import { ProductCard } from "@/components/shared/ProductCard";
import { Button } from "@/components/ui/button";
import { productService } from "@/services/products";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Flame } from "lucide-react";
import Link from "next/link";

export function TrendingProducts() {
  const { data, isLoading } = useQuery({
    queryKey: ["products", "trending"],
    queryFn: async () => {
      const result = await productService.getProducts({
        limit: home.trending.limit,
        isTrending: "true",
      });
      return result;
    },
  });

  if (isLoading) {
    return (
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">{home.trending.title}</h2>
            <p className="text-muted-foreground">{home.trending.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="h-80 bg-muted animate-pulse rounded-xl"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 relative overflow-hidden">
     
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-secondary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4">
        {/* Encabezado de la Sección */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Flame className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                {home.trending.title}
              </h2>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 ml-[42px]">
              {home.trending.subtitle}
            </p>
          </div>
          <Button
            variant="outline"
            asChild
            className="border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/60 transition-all duration-300"
          >
            <Link href={home.trending.viewAllHref}>
              Ver Todos <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Grid de Productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {data?.data.slice(0, 10).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
