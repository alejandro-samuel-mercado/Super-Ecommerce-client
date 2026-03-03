"use client";

import { ProductCard } from "@/components/shared/ProductCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/lib/utils";
import { commentService } from "@/services/comments";
import { configService } from "@/services/config";
import { productService } from "@/services/products";
import { useCartStore } from "@/store/cart";
import { useCurrencyStore } from "@/store/currency";
import { useFavoritesStore } from "@/store/favorites";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight,
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Star,
  ZoomIn,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ProductDetailPage() {
  const params = useParams<{ slug: any }>();
  const slug = params.slug;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSku, setSelectedSku] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [showStickyCTA, setShowStickyCTA] = useState(false);

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [reviewPage, setReviewPage] = useState(1);
  const reviewsPerPage = 6;

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("accessToken"));
  }, []);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => productService.getProduct(slug),
  });

  const { data: config } = useQuery({
    queryKey: ["publicConfig"],
    queryFn: configService.getPublicConfig,
    staleTime: 1000 * 60 * 60, // 1 hora
  });

  const handleReviewSubmit = async () => {
    if (!product) return;
    setIsSubmittingReview(true);
    try {
      await commentService.createComment({
        productId: product.id,
        content: comment,
        rating,
      });
      toast.success("Reseña enviada con éxito");
      setIsReviewOpen(false);
      setComment("");
      setRating(5);
      queryClient.invalidateQueries({ queryKey: ["product", slug] });
    } catch (error) {
      toast.error("Error al enviar la reseña");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const { data: recommendations } = useQuery({
    queryKey: ["recommendations", product?.id],
    queryFn: () => productService.getRecommendations(product!.id.toString()),
    enabled: !!product,
  });

  const addItem = useCartStore((state) => state.addItem);
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const { currency } = useCurrencyStore();

  useEffect(() => {
    if (product?.skus && product.skus.length > 0 && !selectedSku) {
      setSelectedSku(product.skus[0].id);
    }
  }, [product, selectedSku]);

  useEffect(() => {
    const handleScroll = () => {
      const ctaElement = document.getElementById("main-cta");
      if (ctaElement) {
        const rect = ctaElement.getBoundingClientRect();
        setShowStickyCTA(rect.bottom < 0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Producto no encontrado</p>
      </div>
    );
  }

  const currentSku = product?.skus?.find((sku) => sku.id === selectedSku);
  const currentPrice = currentSku
    ? typeof currentSku.price === "number"
      ? currentSku.price
      : parseFloat(currentSku.price || "0")
    : product?.price || product?.basePrice || 0;

  const discount = product?.discountPercentage || 0;
  const hasDiscount = discount > 0;
  const discountedPrice = hasDiscount
    ? ((currentSku as any)?.discountedPrice ??
      currentPrice * (1 - discount / 100))
    : currentPrice;
  const savings = hasDiscount ? currentPrice - discountedPrice : 0;

  const totalStock =
    product?.skus?.reduce((acc, sku) => acc + Number(sku.stock || 0), 0) || 0;
  const isOutOfStock = totalStock === 0;
  const currentStock = currentSku ? Number(currentSku.stock || 0) : 0;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error("Producto agotado");
      return;
    }
    if (!currentSku) {
      toast.error("Selecciona una variante");
      return;
    }

    if (currentStock === 0) {
      toast.error("Esta variante no tiene stock");
      return;
    }

    addItem(
      {
        skuId: currentSku.id.toString(),
        productId: product.id,
        productName: product.name,
        productImage: product.images[0] || "/placeholder.jpg",
        price: currentPrice,
        qty: quantity,
        currencyCode: product.currencyCode || currency || undefined,
        attributes: currentSku.variantOptions.reduce(
          (acc, opt) => ({ ...acc, [opt.name]: opt.value }),
          {},
        ),
        allowFractional: product.allowFractional ?? false,
        measurementUnit: product.measurementUnit ?? "UNIDAD",
      },
      user !== null,
    );

    toast.success("Agregado al carrito");
  };

  const handleBuyNow = () => {
    handleAddToCart();

    window.dispatchEvent(new CustomEvent("open-cart"));
  };

  const isFav = isFavorite(product.id);
  const reviews = product?.comments || [];
  const totalReviews = product?.ratingCount || 0;
  const averageRating = product?.averageRating || 0;

  return (
    <main className="min-h-screen py-8 pb-40 relative overflow-hidden pt-28 max-md:pt-20 max-sm:pt-16">
      {/* Blobs decorativos */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2"></div>

      <div className="container mx-auto px-0 relative z-10">
        <nav className="flex items-center gap-2 text-sm mb-8 text-muted-foreground/80 font-medium px-4">
          <Link href="/" className="hover:text-primary transition-colors">
            Inicio
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link
            href="/products"
            className="hover:text-primary transition-colors"
          >
            Productos
          </Link>
          {product.category && (
            <>
              <ChevronRight className="h-4 w-4" />
              <Link
                href={`/products?categoria=${product.category.slug}`}
                className="hover:text-primary transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{product.name}</span>
        </nav>

        {isOutOfStock && (
          <div className=" mx-6 mb-8 p-6 max-sm:p-4 bg-destructive/10 border-4 border-destructive/30 rounded-[2rem] flex max-sm:flex-col items-center justify-between backdrop-blur-md animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-4">
              <div className="bg-destructive text-white p-3 rounded-2xl shadow-lg">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-destructive uppercase tracking-tight">
                  Producto Agotado
                </h2>
                <p className="text-destructive/70 font-medium italic">
                  Sentimos las molestias. Este producto no está disponible por
                  el momento.
                </p>
              </div>
            </div>
            <Link href="/products">
              <Button
                variant="outline"
                className="rounded-full border-destructive/40 hover:bg-destructive/10 text-destructive font-bold max-sm:mt-4"
              >
                Seguir Comprando
              </Button>
            </Link>
          </div>
        )}

        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-5 mb-16 items-start max-md:rounded-none    border-4 border-zinc-300 dark:border-zinc-600 shadow-[0_0_20px_rgba(0,0,0,0.2)] hover:shadow-[0_0_30px_rgba(0,0,0,0.2)] ${isOutOfStock ? "" : "hover:border-secondary"} hover:ring-4 hover:ring-zinc-500/10 transition-all duration-300 rounded-[2rem] overflow-hidden bg-gray-300/20 ${isOutOfStock ? "grayscale-[0.3] opacity-90" : ""}`}
        >
          {/* Gallery */}
          <div className="space-y-6 ">
            <div className="relative aspect-square rounded-[2rem] overflow-hidden  border-4 border-white/50 shadow-2xl shadow-primary/10 group m-5 max-lg:m-20 max-sm:m-8">
              {product.images[selectedImage] && (
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center pointer-events-none">
                <div className="bg-white/80 backdrop-blur-md p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 shadow-lg">
                  <ZoomIn className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto py-3  px-1 pl-20 max-sm:pl-6 bg-zinc-500/20 backdrop-blur-xl rounded-3xl mx-5 ">
                {product.images.map((image, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-24 h-24  flex-shrink-0 rounded-2xl overflow-hidden border-2  transition-all duration-300 ${
                      selectedImage === idx
                        ? "border-primary ring-4 ring-primary/10 scale-105 shadow-lg"
                        : "border-transparent hover:border-primary/50 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="bg-primary/20 backdrop-blur-xl border border-white/40 rounded-[2rem] p-8  max-md:p-16 max-sm:p-10 lg:p-10 shadow-xl shadow-primary/5 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-bl-[100px] rounded-tr-[2rem] -z-10"></div>

            <div className="flex items-start justify-between mb-6">
              <h1 className="text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent leading-tight">
                {product.name}
              </h1>
              <Button
                variant="outline"
                size="icon"
                className={`rounded-full border-2 h-12 w-12 transition-all ${isFav ? "border-red-200 bg-red-50 text-red-500 hover:bg-red-100 hover:border-red-300" : "hover:border-primary/50 hover:text-primary"}`}
                onClick={() => {
                  toggleFavorite(product.id);
                  
                }}
              >
                <Heart className={`h-6 w-6 ${isFav ? "fill-current" : ""}`} />
              </Button>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-8 bg-primary/50 w-fit px-3 py-1 rounded-full border border-white/40">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(averageRating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-foreground/80">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground">
                • {totalReviews} reseñas
              </span>
            </div>

            {/* Bloque de precio */}
            <div className="mb-8 p-4 rounded-2xl bg-secondary/20 border border-white/40 backdrop-blur-sm inline-block">
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-black text-foreground tracking-tight">
                  {formatPrice(
                    hasDiscount ? discountedPrice : currentPrice,
                    product.currencyCode || currency,
                  )}
                </span>
                {product.allowFractional &&
                  product.measurementUnit &&
                  product.measurementUnit !== "UNIDAD" && (
                    <span className="text-xl font-bold text-muted-foreground">
                      /
                      {product.measurementUnit === "KG"
                        ? "kg"
                        : product.measurementUnit === "LITRO"
                          ? "L"
                          : product.measurementUnit === "METRO"
                            ? "m"
                            : product.measurementUnit.toLowerCase()}
                    </span>
                  )}
                {hasDiscount && (
                  <div className="flex flex-col items-start">
                    <span className="text-lg text-muted-foreground line-through decoration-destructive decoration-2">
                      {formatPrice(
                        currentPrice,
                        product.currencyCode || currency,
                      )}
                    </span>
                    <Badge
                      variant="destructive"
                      className="rounded-full px-2 py-0.5 text-xs"
                    >
                      {discount}% OFF
                    </Badge>
                  </div>
                )}
              </div>
              {hasDiscount && savings > 0 && (
                <p className="text-sm text-emerald-600 font-medium mt-1 pl-1">
                  Ahorras{" "}
                  {formatPrice(savings, product.currencyCode || currency)}
                </p>
              )}
              {/* Conversión de unidades para productos fraccionados */}
              {product.allowFractional && product.measurementUnit === "KG" && (
                <p className="text-xs text-muted-foreground/70 mt-2 pl-1">
                  💡 Podés pedir fracciones: 0.500 = 500 g · 0.250 = 250 g
                </p>
              )}
              {product.allowFractional &&
                product.measurementUnit === "LITRO" && (
                  <p className="text-xs text-muted-foreground/70 mt-2 pl-1">
                    💡 Podés pedir fracciones: 0.500 = 500 mL · 1.500 = 1,5 L
                  </p>
                )}
              {product.allowFractional &&
                product.measurementUnit === "METRO" && (
                  <p className="text-xs text-muted-foreground/70 mt-2 pl-1">
                    💡 Podés pedir fracciones: 0.500 = 50 cm · 1.500 = 1,5 m
                  </p>
                )}
            </div>

            {/* Estado del stock */}
            <div className="mb-8">
              {currentStock === 0 ? (
                <Badge
                  variant="destructive"
                  className="rounded-full px-4 py-1 text-sm bg-gray-300"
                >
                  Agotado
                </Badge>
              ) : currentSku && currentStock < 10 ? (
                <Badge
                  variant="secondary"
                  className="rounded-full px-4 py-1 text-sm  bg-gray-300 text-amber-800  border-gray-300 hover:bg-amber-200"
                >
                  ¡Últimas {currentStock} unidades!
                </Badge>
              ) : (
                <Badge className="rounded-full px-4 py-1 text-sm bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-300">
                  Disponible
                </Badge>
              )}
            </div>

            <Separator className="my-8 bg-black/5" />

            {/* Selector de SKU */}
            {product.skus && product.skus.length > 1 && (
              <div className="mb-6">
                <Label className="mb-3 block font-bold text-foreground/90">
                  Seleccionar Variante
                </Label>
                <div className="flex flex-wrap gap-3">
                  {product.skus.map((sku) => {
                    const skuStock = Number(sku.stock || 0);
                    return (
                      <button
                        key={sku.id}
                        onClick={() => setSelectedSku(sku.id)}
                        disabled={skuStock === 0}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all duration-200 relative overflow-hidden ${
                          selectedSku === sku.id
                            ? "border-primary bg-primary/5 text-primary shadow-sm"
                            : "border-transparent bg-white hover:bg-white text-foreground/80 hover:border-black/5"
                        } ${skuStock === 0 ? "opacity-50 cursor-not-allowed grayscale" : ""}`}
                      >
                        {selectedSku === sku.id && (
                          <div className="absolute inset-0 bg-primary/5"></div>
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                          {sku.variantOptions.map((opt) => opt.name).join(" ")}{" "}
                          :
                          {sku.variantOptions.map((opt) => opt.value).join(" ")}
                          {skuStock === 0 && (
                            <span className="text-[10px] bg-black/10 px-1 rounded">
                              Agotado
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mb-8">
              <Label className="mb-3 block font-bold text-foreground/90">
                {product.allowFractional
                  ? `Cantidad (${product.measurementUnit === "KG" ? "kg" : product.measurementUnit === "LITRO" ? "L" : product.measurementUnit === "METRO" ? "m" : "u"})`
                  : "Cantidad"}
              </Label>
              {product.allowFractional ? (
                <div className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-700 w-[230px]">
                  <input
                    type="number"
                    min="0.001"
                    step="0.001"
                    value={quantity}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!isNaN(v) && v > 0 && v <= (currentStock || 9999))
                        setQuantity(v);
                    }}
                    className="flex-1 text-center font-bold text-lg bg-transparent border-none outline-none focus:ring-2 focus:ring-primary/30 rounded-xl px-2 py-1 w-[170px]"
                    disabled={!currentSku || currentStock === 0}
                  />
                  <span className="pr-3 font-semibold text-muted-foreground">
                    {product.measurementUnit === "KG"
                      ? "kg"
                      : product.measurementUnit === "LITRO"
                        ? "L"
                        : product.measurementUnit === "METRO"
                          ? "m"
                          : (product.measurementUnit?.toLowerCase() ?? "u")}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-700 w-[150px]">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-xl hover:bg-white dark:hover:bg-zinc-700 shadow-sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-bold text-lg">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-xl hover:bg-white dark:hover:bg-zinc-700 shadow-sm"
                    onClick={() =>
                      setQuantity(Math.min(currentStock || 1, quantity + 1))
                    }
                    disabled={!currentSku || quantity >= currentStock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Controles de compra */}
            <div id="main-cta" className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button
                size="lg"
                className="flex-1 max-sm:py-4 max-sm:w-60 max-sm:mx-auto rounded-full h-14 text-base font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
                onClick={handleAddToCart}
                disabled={!currentSku || currentStock === 0}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Agregar al Carrito
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="flex-1 rounded-full h-14 max-sm:py-4 max-sm:w-60 max-sm:mx-auto  text-base font-bold border-2 border-primary/10 hover:border-primary/30 bg-secondary/90 hover:bg-secondary/50 shadow-lg shadow-black/5 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                onClick={() => {
                  handleBuyNow();
                  window.location.href = "/cart?reloaded=true";
                }}
                disabled={!currentSku || currentStock === 0}
              >
                Comprar Ahora
              </Button>
            </div>

            {/* Información de envío */}
            <div className="space-y-3 text-sm font-medium text-foreground/70 bg-secondary/30 p-5 rounded-2xl border border-secondary/10">
              <div className="flex items-center gap-3">
                <div className=" p-1.5 rounded-full">
                  <Star className="w-4 h-4 text-secondary/80 " />
                </div>
                <span className="text-gray-700">
                  Garantía de calidad asegurada
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className=" p-1.5 rounded-full">
                  <ShoppingCart className="w-4 h-4 text-secondary/80" />
                </div>
                <span className="text-gray-700">
                  {config?.freeShippingThreshold
                    ? `Envío gratis en compras superiores a ${formatPrice(config.freeShippingThreshold, currency)}`
                    : "Envío gratis disponible (ver condiciones)"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-20 px-6">
          <Tabs defaultValue="description" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="bg-gray-500/10 backdrop-blur-md border border-zinc-500/40 p-1 rounded-full max-md:rounded-2xl  shadow-lg shadow-black/5 inline-flex h-auto  max-sm:grid max-sm:grid-cols-2 max-md:grid max-md:grid-cols-3 gap-3 max-xl:w-[70%] max-lg:w-[95%] max-md:w-[100%]">
                {[
                  "description",
                  "specifications",
                  "shipping",
                  "faqs",
                  "reviews",
                ].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="rounded-full max-md:rounded-xl px-6 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300"
                  >
                    {
                      {
                        description: "Descripción",
                        specifications: "Especificaciones",
                        shipping: "Envíos",
                        faqs: "Preguntas",
                        reviews: "Reseñas",
                      }[tab]
                    }
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="bg-secondary/10 backdrop-blur-md border-4 border-zinc-500/20 rounded-[2rem] p-8 lg:p-12 shadow-xl shadow-primary/5 min-h-[300px]">
              <TabsContent value="description" className="mt-0">
                <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-foreground prose-p:text-muted-foreground">
                  <h3 className="text-2xl mb-4">Sobre este producto</h3>
                  <p>
                    {product.description ||
                      "Sin descripción disponible por el momento."}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="specifications" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <table className="w-full text-left border-collapse">
                    <tbody>
                      <tr className="border-b border-black/30">
                        <td className="py-4 font-semibold text-foreground/70 w-1/3">
                          SKU
                        </td>
                        <td className="py-4 text-foreground">
                          {currentSku?.code || "-"}
                        </td>
                      </tr>
                      <tr className="border-b border-black/30">
                        <td className="py-4 font-semibold text-foreground/70">
                          Categoría
                        </td>
                        <td className="py-4 text-foreground">
                          {product.category?.name || "-"}
                        </td>
                      </tr>
                      {currentSku?.variantOptions &&
                        currentSku.variantOptions.map((variant, idx) => (
                          <tr key={idx} className="border-b border-black/30">
                            <td className="py-4 font-semibold text-foreground/70 capitalize">
                              {variant.name}
                            </td>
                            <td className="py-4 text-foreground">
                              {variant.value}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="shipping" className="mt-0">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white/50 p-6 rounded-2xl border border-white/50">
                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                      🚚 Tiempos de Envío
                    </h3>
                    <p className="text-muted-foreground">
                      Procesamos los pedidos dentro de las 24hs hábiles. <br />
                      <strong>Estándar:</strong> 3-5 días hábiles a todo el
                      país. <br />
                      <strong>Express:</strong> 1-2 días hábiles (CABA y GBA).
                    </p>
                  </div>
                  <div className="bg-white/50 p-6 rounded-2xl border border-white/50">
                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                      ↩️ Devoluciones
                    </h3>
                    <p className="text-muted-foreground">
                      Tenés 30 días desde que recibís el producto para realizar
                      cambios o devoluciones sin costo. El producto debe estar
                      en su packaging original.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="faqs" className="mt-0">
                <div className="space-y-4 max-w-3xl mx-auto">
                  {[
                    {
                      q: "¿Cómo realizo el seguimiento de mi pedido?",
                      a: "Una vez despachado, recibirás un correo electrónico con el número de seguimiento de Correo Argentino.",
                    },
                    {
                      q: "¿Los productos tienen garantía?",
                      a: "Sí, todos nuestros productos cuentan con garantía oficial de 12 meses por fallas de fabricación.",
                    },
                    {
                      q: "¿Hacen factura A?",
                      a: "Sí, realizamos factura A y B. Podés cargar tus datos fiscales en el checkout.",
                    },
                  ].map((faq, i) => (
                    <div
                      key={i}
                      className="bg-white/50 p-6 rounded-2xl border border-white/50"
                    >
                      <h4 className="font-bold text-lg mb-2">{faq.q}</h4>
                      <p className="text-muted-foreground">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-0">
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-6 max-sm:flex-col max-sm:items-start gap-4">
                    <h3 className="text-2xl font-bold">Reseñas de Clientes</h3>
                    <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="rounded-full"
                          onClick={() => {
                            if (!isLoggedIn) {
                              toast.error(
                                "Debes iniciar sesión para escribir una reseña",
                              );
                              router.push(`/login?redirect=/products/${slug}`);
                              return;
                            }
                          }}
                        >
                          Escribir una Reseña
                        </Button>
                      </DialogTrigger>
                      {isLoggedIn && (
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Escribir Reseña</DialogTitle>
                            <DialogDescription>
                              Comparte tu experiencia con este producto.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="flex justify-center gap-2">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <button
                                  key={i}
                                  onClick={() => setRating(i + 1)}
                                  className="focus:outline-none transition-transform hover:scale-110"
                                >
                                  <Star
                                    className={`h-8 w-8 ${
                                      i < rating
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-gray-300"
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                            <Textarea
                              placeholder="Escribe tu comentario aquí..."
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              className="min-h-[100px] border-4 border-gray-300"
                            />
                          </div>
                          <DialogFooter>
                            <Button
                              onClick={handleReviewSubmit}
                              disabled={isSubmittingReview || !comment.trim()}
                            >
                              {isSubmittingReview
                                ? "Enviando..."
                                : "Enviar Reseña"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      )}
                    </Dialog>
                  </div>

                  {reviews.length === 0 ? (
                    <div className="text-center py-16 bg-white/30 rounded-2xl border border-dashed border-black/10">
                      <div className="bg-primary/5 p-4 rounded-full w-fit mx-auto mb-4">
                        <Star className="w-8 h-8 text-primary/40" />
                      </div>
                      <p className="text-xl font-medium text-foreground mb-2">
                        Aún no hay reseñas para este producto
                      </p>
                      <p className="text-muted-foreground mb-6">
                        ¡Sé el primero en compartir tu experiencia!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reviews
                          .slice(
                            (reviewPage - 1) * reviewsPerPage,
                            reviewPage * reviewsPerPage,
                          )
                          .map((review: any) => (
                            <div
                              key={review.id}
                              className="bg-white/40 p-6 rounded-3xl border-4 border-primary/20 backdrop-blur-sm shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex justify-between items-start mb-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary font-bold shadow-inner border border-white/50">
                                      {review.user?.name?.charAt(0) || "U"}
                                    </div>
                                    <div>
                                      <p className="font-bold text-foreground text-sm">
                                        {review.user?.name || "Usuario"}
                                      </p>
                                      <div className="flex items-center gap-0.5">
                                        {Array.from({ length: 5 }).map(
                                          (_, i) => (
                                            <Star
                                              key={i}
                                              className={`h-3 w-3 ${
                                                i < (review.rating || 0)
                                                  ? "fill-amber-400 text-amber-400"
                                                  : "text-gray-300"
                                              }`}
                                            />
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <span className="text-xs text-muted-foreground/70 bg-white/50 px-2 py-1 rounded-full">
                                    {new Date(
                                      review.createdAt,
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-foreground/80 text-sm leading-relaxed italic">
                                  &quot;{review.content}&quot;
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>

                      {reviews.length > reviewsPerPage && (
                        <div className="flex justify-center items-center gap-2 mt-8">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              setReviewPage((p) => Math.max(1, p - 1))
                            }
                            disabled={reviewPage === 1}
                            className="rounded-full h-8 w-8"
                          >
                            <ChevronRight className="h-4 w-4 rotate-180" />
                          </Button>
                          <span className="text-sm font-medium">
                            Página {reviewPage} de{" "}
                            {Math.ceil(reviews.length / reviewsPerPage)}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              setReviewPage((p) =>
                                Math.min(
                                  Math.ceil(reviews.length / reviewsPerPage),
                                  p + 1,
                                ),
                              )
                            }
                            disabled={
                              reviewPage ===
                              Math.ceil(reviews.length / reviewsPerPage)
                            }
                            className="rounded-full h-8 w-8"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Recomendaciones */}
        <section className="space-y-16 px-6">
          {/* Productos Relacionados */}
          {recommendations?.related && recommendations.related.length > 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                    Productos Relacionados
                  </h2>
                  <div className="h-1.5 w-24 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
                </div>
                <Link href={`/products?categoria=${product.category?.slug}`}>
                  <Button
                    variant="ghost"
                    className="rounded-full hover:bg-white/50"
                  >
                    Ver Todo <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {recommendations.related.map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </div>
            </div>
          )}

          {/* Quienes compraron esto también llevaron */}
          {recommendations?.boughtTogether &&
            recommendations.boughtTogether.length > 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                      Quienes compraron esto también llevaron...
                    </h2>
                    <div className="h-1.5 w-24 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {recommendations.boughtTogether.map((item) => (
                    <ProductCard key={item.id} product={item} />
                  ))}
                </div>
              </div>
            )}
        </section>
      </div>

      {/* CTA Flotante */}
      <AnimatePresence>
        {showStickyCTA && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed max-sm:hidden bottom-6 right-[12vw]  w-[70%]  bg-white/80 backdrop-blur-xl border-4 border-primary/30 shadow-2xl shadow-primary/20 rounded-[2rem] z-50 p-2"
          >
            <div className="flex items-center justify-between px-6 py-2">
              <div className="hidden sm:block">
                <h3 className="font-bold text-foreground truncate max-w-[200px]">
                  {product.name}
                </h3>
                <p className="text-lg font-black text-primary">
                  {formatPrice(currentPrice, product.currencyCode || currency)}
                </p>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <Button
                  onClick={handleAddToCart}
                  disabled={!currentSku || currentSku.stock === 0}
                  className="flex-1 sm:flex-none rounded-full shadow-lg hover:shadow-primary/25 font-bold"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    handleBuyNow();
                    window.location.href = "/cart?reloaded=true";
                  }}
                  disabled={!currentSku || currentSku.stock === 0}
                  className="flex-1 sm:flex-none rounded-full border border-primary/10 shadow-md font-bold"
                >
                  Comprar
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
