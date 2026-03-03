import { http } from "@/adapters/http";
import { Product, SearchResult } from "@/types";

export const productService = {
  /**
   * Obtener árbol de categorías
   */
  getCategoriesTree: async (): Promise<any[]> => {
    try {
      const response = await http<{ success: boolean; data: any[] }>(
        "/api/categories/tree",
      );
      return response.data;
    } catch (error) {
      return [];
    }
  },

  getProducts: async (
    params: Record<string, any> = {},
  ): Promise<SearchResult<Product>> => {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v) => query.append(key, v));
        } else {
          query.append(key, String(value));
        }
      }
    });

    const response = await http<{
      success: boolean;
      data: SearchResult<Product>;
    }>(`/api/products?${query.toString()}`);
    return response.data;
  },

  getProduct: async (slugOrId: string | number) => {
    const response: any = await http(`/api/products/${slugOrId}`);
    const producto: Product = response.data;
    return producto;
  },

  searchProducts: async (q: string): Promise<SearchResult<Product>> => {
    const response = await http<{
      success: boolean;
      data: SearchResult<Product>;
    }>(`/api/products/search?q=${encodeURIComponent(q)}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await http<{ success: boolean; data: string[] }>(
      "/api/categories",
    );
    return response.data;
  },

  getBrands: async (): Promise<string[]> => {
    try {
      const response = await http<{
        success: boolean;
        data: SearchResult<Product>;
      }>(`/api/products?limit=1000`);
      const products = response.data.data;

      const brands = Array.from(
        new Set(products.map((p) => p.brand).filter(Boolean)),
      );
      return brands.sort();
    } catch (error) {
      return [];
    }
  },

  getRecommendations: async (
    id: string | number,
    branchId?: string,
  ): Promise<{ related: Product[]; boughtTogether: Product[] }> => {
    try {
      const query = branchId ? `?branchId=${branchId}` : "";
      const response = await http<{
        success: boolean;
        data: { related: Product[]; boughtTogether: Product[] };
      }>(`/api/products/${id}/recommendations${query}`);
      return response.data;
    } catch (error) {
      return { related: [], boughtTogether: [] };
    }
  },
};
