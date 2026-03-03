import { profile } from "@/../content/profile";
import { ProductCard } from "@/components/shared/ProductCard";
import { Button } from "@/components/ui/button";
import { productService } from "@/services/products";
import { useFavoritesStore } from "@/store/favorites";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
export function FavoritesTab() {
  const { favorites, removeFavorite } = useFavoritesStore();

  const { data: favoriteProducts, isLoading } = useQuery({
    queryKey: ["profile-favorites", favorites],
    queryFn: async () => {
      if (favorites.length === 0) return [];

      const products = await Promise.all(
        favorites.map((id) => productService.getProduct(id).catch(() => null)),
      );
      return products.filter((p) => p !== null);
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="aspect-[3/4] bg-gray-100 animate-pulse rounded-2xl"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!favoriteProducts || favoriteProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {profile.favorites.noFavorites}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {favoriteProducts.map(
            (product) =>
              product && (
                <div key={product.id} className="relative">
                  <ProductCard product={product} />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2 h-8 w-8 p-0"
                    onClick={() => removeFavorite(product.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ),
          )}
        </div>
      )}
    </div>
  );
}
