"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { useFavoritesStore } from "@/store/favorites";
import { Product } from "@/types";
import { Heart, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { toast } from "sonner";


interface ProductCardProps {
  product: Product;
}

import { useAuth } from "@/contexts/AuthContext";

export const ProductCard = memo(function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const isFav = isFavorite(product.id);
  const totalStock =
    product.skus?.reduce((acc, sku) => acc + Number(sku.stock || 0), 0) || 0;
  const isOutOfStock = totalStock <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      toast.error("Producto agotado");
      return;
    }

    if (!product.skus || product.skus.length === 0) {
      toast.error("Producto no disponible");
      return;
    }

    const defaultSku = product.skus[0];
    const defaultSkuPrice = typeof defaultSku?.price === "number" ? defaultSku.price : parseFloat(defaultSku?.price || "0");

    addItem(
      {
        skuId: defaultSku?.id?.toString() || `${product?.id}-unknown`,
        productId: product?.id || 0,
        productName: product?.name || "Producto",
        productImage: product?.images?.[0] || "/placeholder.jpg",
        price: defaultSkuPrice || product?.price || product?.basePrice || 0,
        qty: 1,
        currencyCode: product?.currencyCode,
        attributes:
          defaultSku?.variantOptions?.reduce(
            (acc, opt) => ({ ...acc, [opt.name]: opt.value }),
            {},
          ) || {},
        allowFractional: product?.allowFractional ?? false,
        measurementUnit: product?.measurementUnit ?? "UNIDAD",
      },
      user !== null,
    );

    toast.success("Agregado al carrito");
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (isOutOfStock) {
      e.preventDefault();
      toast.info("Este producto se encuentra agotado por el momento.");
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product?.id) toggleFavorite(product.id);
  };

  const displaySku = product.skus?.[0];
  const displayPrice = displaySku 
    ? (typeof displaySku.price === "number" ? displaySku.price : parseFloat(displaySku.price || "0")) || product.price || product.basePrice || 0
    : product.price || product.basePrice || 0;

  return (
    <Link
      href={isOutOfStock ? "#" : `/products/${product.id}`}
      className={`group block bg-card/30 max-sm:bg-card/80 sm:border-none shadow-2xl rounded-2xl p-2 max-sm:p-6 border-b border-primary pb-6 ${isOutOfStock ? "opacity-75 cursor-not-allowed" : ""}`}
      onClick={handleCardClick}
    >
      <div
        className={`relative aspect-square mb-3 overflow-hidden rounded-xl bg-card border-2 border-gray-200 dark:border-zinc-700
        group-hover:scale-[1.02] group-hover:-translate-y-1 group-hover:shadow-xl group-hover:border-primary/40
        transition-all duration-300 ease-out ${isOutOfStock ? "grayscale-[0.5]" : ""}`}
      >
        <Image
          src={product.images?.[0] || "/images/placeholder.png"}
          alt={product.name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
            <Badge
              variant="destructive"
              className="bg-red-600 text-white font-black text-sm px-4 py-1.5 shadow-xl rotate-[-5deg] border-2 border-white/40 uppercase tracking-widest animate-in fade-in zoom-in duration-300"
            >
              Agotado
            </Badge>
          </div>
        )}

        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {product.isNew && (
            <Badge className="bg-secondary/90 text-white border-none rounded-lg font-semibold shadow-sm">
              Nuevo
            </Badge>
          )}
          {Number(product.discountPercentage) > 0 && (
            <Badge className="bg-red-500/90 text-white border-none rounded-lg font-bold shadow-sm">
              -{product.discountPercentage}%
            </Badge>
          )}
        </div>

        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
          <Button
            size="icon"
            variant={isFav ? "default" : "secondary"}
            className={`h-8 w-8 rounded-full shadow-md ${isFav ? "bg-primary text-white" : "bg-white/90 dark:bg-zinc-800/90 hover:bg-primary/10"}`}
            onClick={handleToggleFavorite}
          >
            <Heart
              className={`h-4 w-4 ${isFav ? "fill-current" : "text-gray-600 dark:text-gray-300"}`}
            />
          </Button>
        </div>

        <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <Button
            size="sm"
            className="w-full rounded-lg bg-primary hover:bg-secondary text-white shadow-lg"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? (
              <>Agotado</>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Agregar
              </>
            )}
          </Button>
        </div>
      </div>

      <h3
        className={`font-medium mb-1 line-clamp-2 group-hover:text-primary transition-colors duration-300 ${isOutOfStock ? "text-muted-foreground" : "text-gray-800 dark:text-gray-100"}`}
      >
        {product?.name}
      </h3>

      {/* Rating */}
      <div className="flex items-center gap-1.5 mb-2">
        <div className="flex items-center">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${
                i < Math.round(product.averageRating || 0)
                  ? "fill-amber-400 text-amber-400"
                  : "text-gray-400"
              }`}
            />
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground font-medium">
          ({product.ratingCount || 0})
        </span>
      </div>

      <div className="flex items-baseline gap-2 flex-wrap">
        {Number(product.discountPercentage) > 0 &&
        (product as any).discountedPrice ? (
          <>
            <span
              className={`font-bold text-xl ${isOutOfStock ? "text-muted-foreground" : "text-primary"}`}
            >
              {formatPrice(
                (product as any).discountedPrice,
                product.currencyCode,
              )}
            </span>
            <span className="text-sm text-muted-foreground line-through opacity-60">
              {formatPrice(
                displayPrice,
                product.currencyCode,
              )}
            </span>
          </>
        ) : (
          <span
            className={`font-bold text-lg ${isOutOfStock ? "text-muted-foreground" : "text-primary"}`}
          >
            {formatPrice(
              displayPrice,
              product.currencyCode,
            )}
          </span>
        )}

        {product.allowFractional &&
          product.measurementUnit &&
          product.measurementUnit !== "UNIDAD" && (
            <span className="text-xs font-normal text-muted-foreground ml-0.5">
              (por {product.measurementUnit.toLowerCase()})
            </span>
          )}
      </div>

      {product?.category && (
        <p className="text-xs text-muted-foreground mt-1">
          {product.category.name}
        </p>
      )}
    </Link>
  );
});
