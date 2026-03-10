"use client";

import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useDebounce } from "@/hooks/useDebounce";
import { formatPrice } from "@/lib/utils";
import { OrderPreviewResponse, orderService } from "@/services/orders";
import { useCartStore } from "@/store/cart";
import { useCurrencyStore } from "@/store/currency";
import { useUIStore } from "@/store/ui";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, Loader2, Minus, Plus, ShoppingCart, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export function CartDrawer() {
  const { isCartOpen, closeCart } = useUIStore();
  const { items, removeItem, updateQuantity, getSubtotal, getTotalItems } =
    useCartStore();
  const { user } = useAuth();
  const { currency } = useCurrencyStore();

  const [preview, setPreview] = useState<OrderPreviewResponse | null>(null);
  const debouncedItems = useDebounce(items, 300);

  const previewMutation = useMutation({
    mutationFn: async () => {
      return orderService.preview({
        items: debouncedItems.map((item) => ({
          skuId: item.skuId.toString(),
          quantity: item.qty,
        })),
        paymentType: "MERCADO_PAGO",
        branchId: "1", 
      });
    },
    onSuccess: (data) => {
      setPreview(data);
    },
  });

  const triggerPreview = useCallback(() => {
    previewMutation.mutate();
 
  }, [debouncedItems]);

  useEffect(() => {
    if (isCartOpen && debouncedItems.length > 0) {
      triggerPreview();
    }
  }, [debouncedItems, isCartOpen, triggerPreview]);

  const stockIssues = preview?.stockIssues || [];
  const hasStockError = preview?.hasStockError || stockIssues.length > 0;
  const isUpdating = previewMutation.isPending || debouncedItems !== items;

  return (
    <Sheet open={isCartOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="flex flex-col h-full w-full sm:max-w-md border-l-0 bg-white/95 backdrop-blur-xl p-0 z-[2000]">
        <SheetHeader className="p-6 border-b bg-white">
          <SheetTitle className="text-2xl font-black bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Mi Carrito ({getTotalItems()})
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-auto p-6 custom-scrollbar">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <p className="text-muted-foreground font-medium mb-6">
                Tu carrito está vacío
              </p>
              <Button onClick={closeCart} asChild className="rounded-full px-8">
                <Link href="/products">Explorar Productos</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {hasStockError && (
                <div className={`p-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 transition-all ${isUpdating ? "bg-amber-100 border border-amber-200" : "bg-destructive/10 border border-destructive/20"}`}>
                  {isUpdating ? (
                    <Loader2 className="h-5 w-5 text-amber-600 shrink-0 animate-spin" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                  )}
                  <p className={`text-xs font-bold ${isUpdating ? "text-amber-800" : "text-destructive"}`}>
                    {isUpdating ? "Validando cambios..." : "Hay problemas de stock. Ajusta las cantidades."}
                  </p>
                </div>
              )}

              {items.map((item, idx) => {
                const stockIssue = stockIssues.find(
                  (s) => s.skuId === parseInt(item.skuId),
                );
                const previewItem = preview?.items?.find(
                  (p) => p.skuId === parseInt(item.skuId),
                );
                const stockLimit = previewItem?.availableStock;

                return (
                  <div
                    key={`${item.skuId}-${idx}`}
                    className={`group relative flex gap-4 p-3 rounded-2xl border transition-all ${
                      stockIssue
                        ? "bg-destructive/5 border-destructive/30"
                        : "bg-zinc-50 border-zinc-100 hover:border-primary/20 hover:shadow-sm"
                    }`}
                  >
                    <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-white shadow-sm border border-zinc-100">
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-sm truncate pr-6">
                          {item.productName}
                        </h3>
                        {item.attributes &&
                          Object.keys(item.attributes).length > 0 && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                              {Object.entries(item.attributes)
                                .map(([key, value]) => `${key}: ${value}`)
                                .join(" / ")}
                            </p>
                          )}
                        <p className="text-sm font-black text-primary mt-1">
                          {formatPrice(item.price, currency)}
                        </p>
                        {stockIssue && (
                          <p className="text-[10px] font-bold text-destructive flex items-center gap-1 mt-1 uppercase">
                            <AlertCircle className="h-3 w-3" />
                            Máx disp: {stockIssue.available}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-2 bg-white rounded-lg p-1 w-fit shadow-sm border">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-md hover:bg-zinc-100"
                          onClick={() => {
                            const step = item.allowFractional
                              ? item.measurementUnit === "KG" ? 0.1 : item.measurementUnit === "LITRO" ? 0.25 : 0.5
                              : 1;
                            const newVal = Math.max(
                              item.allowFractional ? step : 0,
                              parseFloat((Number(item.qty) - step).toFixed(3))
                            );
                            updateQuantity(item.skuId, newVal, user !== null);
                          }}
                          disabled={Number(item.qty) <= (item.allowFractional ? (item.measurementUnit === "KG" ? 0.1 : item.measurementUnit === "LITRO" ? 0.25 : 0.5) : 0)}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>

                        <div className="flex items-center">
                          <input
                            key={`input-${item.skuId}-${item.qty}`}
                            type="text"
                            inputMode="decimal"
                            defaultValue={item.qty}
                            onBlur={(e) => {
                              const v = parseFloat(e.target.value.replace(",", "."));
                              const maxVal = stockLimit ?? 9999;
                              if (!isNaN(v)) {
                                const clampedVal = Math.min(maxVal, Math.max(0, v));
                                updateQuantity(item.skuId, item.allowFractional ? clampedVal : Math.floor(clampedVal), user !== null);
                              } else {
                                e.target.value = String(item.qty);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                (e.target as HTMLInputElement).blur();
                              }
                            }}
                            className="w-10 text-center text-xs font-bold bg-transparent border-none outline-none focus:ring-1 focus:ring-primary/30 rounded px-1 py-0.5"
                          />
                          {item.allowFractional && (
                            <span className="text-[10px] text-muted-foreground pr-1 font-semibold lowercase">
                              {item.measurementUnit === "KG"
                                ? "kg"
                                : item.measurementUnit === "LITRO"
                                  ? "L"
                                  : item.measurementUnit === "METRO"
                                    ? "m"
                                    : (item.measurementUnit?.toLowerCase() ??
                                      "u")}
                            </span>
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-md hover:bg-zinc-100"
                          onClick={() => {
                            const step = item.allowFractional
                              ? item.measurementUnit === "KG" ? 0.1 : item.measurementUnit === "LITRO" ? 0.25 : 0.5
                              : 1;
                            const maxVal = stockLimit ?? 9999;
                            const newVal = Math.min(maxVal, parseFloat((Number(item.qty) + step).toFixed(3)));
                            updateQuantity(item.skuId, newVal, user !== null);
                          }}
                          disabled={
                            stockLimit !== undefined &&
                            Number(item.qty) >= stockLimit
                          }
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-10 w-10 rounded-full p-2 
                      max-md:bg-primary/70
                      text-muted-foreground hover:text-destructive hover:bg-primary/70 opacity-100  transition-all"
                      onClick={() => removeItem(item.skuId, user !== null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="space-y-4 p-6 mt-auto border-t bg-white">
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                Subtotal Estimado
              </span>
              <span className="text-2xl font-black text-foreground">
                {formatPrice(getSubtotal(), currency)}
              </span>
            </div>

            <Button
              className={`w-full h-14 rounded-2xl text-base font-black shadow-lg transition-all ${
                hasStockError
                  ? "bg-destructive/20 text-destructive border-2 border-destructive/20 hover:bg-destructive/30 grayscale shadow-none"
                  : "shadow-primary/20 hover:shadow-xl"
              }`}
              size="lg"
              asChild
              disabled={hasStockError}
            >
              <a
                href="/cart?reloaded=true"
                onClick={closeCart}
                className={hasStockError ? "pointer-events-none" : ""}
              >
                {hasStockError ? "Error de Stock" : "Continuar Compra"}
              </a>
            </Button>

            <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-bold opacity-60">
              Envío e impuestos calculados en el checkout
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
