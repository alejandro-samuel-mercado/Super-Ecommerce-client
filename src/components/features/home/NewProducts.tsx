"use client";

import { ProductCard } from "@/components/shared/ProductCard";
import { Button } from "@/components/ui/button";
import { productService } from "@/services/products";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export function NewProducts() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["products", "new"],
    queryFn: async () => {
      const result = await productService.getProducts({
        limit: 10,
        isNew: "true",
        sort: "newest",
      });
      return result;
    },
  });

  if (isLoading) {
    return (
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Nuevos Productos</h2>
            <p className="text-muted-foreground">
              Recién llegados a nuestra tienda
            </p>
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

  if (!data || data.data.length === 0) {
    return null;
  }

  return (
    <section className="py-16 relative overflow-hidden">
 
      <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-secondary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4">
        {/* Header*/}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-secondary" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                Nuevos Productos
              </h2>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 ml-[42px]">
              Recién llegados a nuestra tienda
            </p>
          </div>
          <Button
            variant="outline"
            asChild
            className="border-secondary/30 text-purple-600 dark:text-purple-400 hover:bg-secondary/10 hover:border-secondary/60 transition-all duration-300"
          >
            <Link href="/products?isNew=true">
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
