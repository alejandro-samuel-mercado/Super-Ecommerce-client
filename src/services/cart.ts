import { http } from "@/adapters/http";

export const cartService = {
  getCart: async (currencyCode?: string) => {
    return await http<any>(
      `/api/cart${currencyCode ? `?currency=${currencyCode}` : ""}`,
    );
  },

  addItem: async (skuId: number, quantity: number) => {
    return await http<any>("/api/cart/add", {
      method: "POST",
      body: JSON.stringify({ skuId, quantity }),
    });
  },

  updateItem: async (skuId: number, quantity: number) => {
    return await http<any>("/api/cart/update", {
      method: "POST",
      body: JSON.stringify({ skuId, quantity }),
    });
  },

  removeItem: async (skuId: number) => {
    return await http<any>(`/api/cart/${skuId}`, {
      method: "DELETE",
    });
  },

  mergeCart: async (
    items: { skuId: number; quantity: number }[],
    currencyCode?: string,
  ) => {
    return await http<any>("/api/cart/merge", {
      method: "POST",
      body: JSON.stringify({ items, currency: currencyCode }),
    });
  },

  clearCart: async () => {
    return await http<any>("/api/cart/clear", {
      method: "DELETE",
    });
  },
};
