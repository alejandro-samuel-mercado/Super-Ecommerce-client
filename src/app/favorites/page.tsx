"use client";

import { ProductCard } from "@/components/shared/ProductCard";
import { ProductSkeleton } from "@/components/shared/ProductSkeleton";
import { Button } from "@/components/ui/button";
import { productService } from "@/services/products";
import { useFavoritesStore } from "@/store/favorites";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function FavoritesPage() {
  const { favorites } = useFavoritesStore();

  const { data: products, isLoading } = useQuery({
    queryKey: ["favorites", favorites],
    queryFn: async () => {
      if (favorites.length === 0) return [];

      const productPromises = favorites.map((id) =>
        productService.getProduct(id).catch(() => null),
      );
      const results = await Promise.all(productPromises);
      return results.filter((p) => p !== null);
    },
    enabled: favorites.length > 0,
  });

  useEffect(() => {
    if (!isLoading && products) {
      const validIds = products.map((p) => p?.id);

      if (validIds.length < favorites.length) {
        favorites.forEach((id) => {
          if (!validIds.includes(id)) {
          
          }
        });
      }
    }
  }, [isLoading, products, favorites]);

 
  const displayCount = isLoading ? favorites.length : (products?.length ?? 0);

  return (
    <main className="min-h-screen py-8 pt-28 max-md:pt-10 md:px-10 max-md:px-4 pb-40" >
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3 flex items-center gap-3">
            <Heart className="h-10 w-10 text-primary fill-primary" />
            Mis Favoritos
          </h1>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : favorites.length === 0 || (products && products.length === 0) ? (
          <div className="text-center py-16">
            <Heart className="h-24 w-24 mx-auto mb-6 text-muted-foreground/30" />
            <h2 className="text-2xl font-semibold mb-3">
              No tienes favoritos disponibles
            </h2>
            <p className="text-muted-foreground mb-6">
              {favorites.length > 0
                ? "Los productos que guardaste ya no están disponibles."
                : "Explora nuestros productos y guarda tus favoritos para verlos aquí"}
            </p>
            <Button asChild className="rounded-full">
              <Link href="/products">Ver Productos</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-4 md:grid-cols-2 max-md:grid-cols-1 gap-6">
            {products?.map(
              (product, idx) =>
                product && (
                  <ProductCard key={product.id || idx} product={product} />
                ),
            )}
          </div>
        )}
      </div>
    </main>
  );
}
