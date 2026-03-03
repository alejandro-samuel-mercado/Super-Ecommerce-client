import { cartService } from "@/services/cart";
import { CartItem } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem, isLoggedIn?: boolean) => Promise<void>;
  removeItem: (skuId: string, isLoggedIn?: boolean) => Promise<void>;
  updateQuantity: (
    skuId: string,
    quantity: number,
    isLoggedIn?: boolean,
  ) => Promise<void>;
  clearCart: (isLoggedIn?: boolean) => Promise<void>;
  syncWithBackend: (currencyCode?: string) => Promise<void>;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: async (newItem, isLoggedIn = false) => {
        set((state) => {
          const existing = state.items.find((i) => i.skuId === newItem.skuId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.skuId === newItem.skuId
                  ? { ...i, qty: i.qty + newItem.qty }
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
          items: state.items.filter((i) => i.skuId !== skuId),
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
            i.skuId === skuId ? { ...i, qty: quantity } : i,
          ),
        }));
        if (isLoggedIn) {
          try {
            await cartService.updateItem(Number(skuId), quantity);
          } catch (e) {}
        }
      },

      clearCart: async (isLoggedIn = false) => {
        set({ items: [] });
        if (isLoggedIn) {
          try {
            await cartService.clearCart();
          } catch (e) {}
        }
      },

      syncWithBackend: async (currencyCode) => {
        try {
          const localItems = get().items.map((i) => ({
            skuId: Number(i.skuId),
            quantity: i.qty,
          }));
          const remoteCart = await cartService.mergeCart(
            localItems,
            currencyCode,
          );

          if (remoteCart && remoteCart.items) {
            const mergedItems = remoteCart.items.map((item: any) => ({
              productId: item.sku.productId,
              skuId: item.sku.id.toString(),
              productName: item.sku.product.name,
              price: Number(item.sku.price),
              productImage: item.sku.product.images?.[0] || "",
              qty: item.quantity,
              attributes:
                item.sku.variantOptions?.reduce(
                  (acc: any, opt: any) => ({ ...acc, [opt.name]: opt.value }),
                  {},
                ) || {},
              stock: item.sku.branchInventory?.[0]?.stock || 99,
              allowFractional: item.sku.product.allowFractional,
              measurementUnit: item.sku.product.measurementUnit,
            }));
            set({ items: mergedItems });
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
