import { cartService } from "@/services/cart";
import { CartItem } from "@/types";
import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartState {
  items: CartItem[];
  lastSyncedCurrency: string | null;
  addItem: (item: CartItem, isLoggedIn?: boolean) => Promise<void>;
  removeItem: (skuId: string, isLoggedIn?: boolean) => Promise<void>;
  updateQuantity: (
    skuId: string,
    quantity: number,
    isLoggedIn?: boolean,
  ) => Promise<void>;
  clearCart: (isLoggedIn?: boolean) => Promise<void>;
  syncWithBackend: (currencyCode?: string, mergeLocal?: boolean) => Promise<void>;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      lastSyncedCurrency: null,

      addItem: async (newItem, isLoggedIn = false) => {
        set((state) => {
          const existing = state.items.find((i) => String(i.skuId) === String(newItem.skuId));
          if (existing) {
            return {
              items: state.items.map((i) =>
                String(i.skuId) === String(newItem.skuId)
                  ? { ...i, qty: Number(i.qty) + Number(newItem.qty) }
                  : i,
              ),
            };
          }
          return { items: [...state.items, newItem] };
        });

        if (isLoggedIn) {
          try {
            await cartService.addItem(Number(newItem.skuId), newItem.qty);
          } catch (e) {}
        }
      },

      removeItem: async (skuId, isLoggedIn = false) => {
        set((state) => ({
          items: state.items.filter((i) => String(i.skuId) !== String(skuId)),
        }));
        if (isLoggedIn) {
          try {
            await cartService.removeItem(Number(skuId));
          } catch (e) {}
        }
      },

      updateQuantity: async (skuId, quantity, isLoggedIn = false) => {
        set((state) => ({
          items: state.items.map((i) =>
            String(i.skuId) === String(skuId) ? { ...i, qty: quantity } : i,
          ),
        }));
        if (isLoggedIn) {
          try {
            await cartService.updateItem(Number(skuId), quantity);
          } catch (e) {}
        }
      },

      clearCart: async (isLoggedIn = false) => {
        set({ items: [], lastSyncedCurrency: null });
        if (isLoggedIn) {
          try {
            await cartService.clearCart();
          } catch (e) {}
        }
      },

      syncWithBackend: async (currencyCode, mergeLocal = false) => {
        try {
          let remoteCart;

          // Merge local anonymous items ONLY if mergeLocal is true
          if (mergeLocal) {
            const localItems = get().items.map((i) => ({
              skuId: Number(i.skuId),
              quantity: i.qty,
            }));
            remoteCart = await cartService.mergeCart(localItems, currencyCode);
          } else {
            // Otherwise, we just fetch the true cart from the backend DB directly
            remoteCart = await cartService.getCart(currencyCode);
          }

          if (remoteCart && remoteCart.items) {
            const mergedItems = remoteCart.items.map((item: any) => ({
              productId: item.sku.productId,
              skuId: item.sku.id.toString(),
              productName: item.sku.product.name,
              price: item.convertedPrice != null ? Number(item.convertedPrice) : Number(item.sku.price),
              productImage: item.sku.product.images?.[0] || "",
              qty: item.quantity,
              attributes:
                item.sku.variantOptions?.reduce(
                  (acc: any, opt: any) => ({ ...acc, [opt.name]: opt.value }),
                  {},
                ) || {},
              stock: item.sku.stock || 99,
              allowFractional: item.sku.product.allowFractional,
              measurementUnit: item.sku.product.measurementUnit,
            }));
            set({ items: mergedItems, lastSyncedCurrency: currencyCode || null });

            if (remoteCart.stockAdjustments && remoteCart.stockAdjustments.length > 0) {
              for (const adj of remoteCart.stockAdjustments) {
                toast.warning(`Stock ajustado: ${adj.productName}`, {
                  description: `Solo hay ${adj.availableStock} unidades disponibles. Tu carrito se ajustó de ${adj.requestedQty} a ${adj.adjustedQty}.`
                });
              }
            }
          }
        } catch (e) {}
      },

      getTotalItems: () => get().items.length,
      getSubtotal: () =>
        get().items.reduce((acc, item) => acc + item.price * item.qty, 0),
    }),
    {
      name: "cart-storage-v3",
    },
  ),
);
