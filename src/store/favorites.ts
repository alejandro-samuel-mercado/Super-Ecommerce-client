import { http } from "@/adapters/http";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesState {
  favorites: number[];
  addFavorite: (productId: number) => Promise<void>;
  removeFavorite: (productId: number) => Promise<void>;
  isFavorite: (productId: number) => boolean;
  toggleFavorite: (productId: number) => Promise<void>;
  syncFavorites: () => Promise<void>;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],

      clearFavorites: () => set({ favorites: [] }),

      addFavorite: async (productId) => {
        set((state) => ({
          favorites: [...new Set([...state.favorites, productId])],
        }));
        try {
          await http(`/api/users/favorites/${productId}`, { method: "POST" });
        } catch (e) {
        
        }
      },

      removeFavorite: async (productId) => {
        set((state) => ({
          favorites: state.favorites.filter((id) => id !== productId),
        }));
        try {
          await http(`/api/users/favorites/${productId}`, { method: "DELETE" });
        } catch (e) {
        
        }
      },

      isFavorite: (productId) => {
        return get().favorites.includes(productId);
      },

      toggleFavorite: async (productId) => {
        const { isFavorite, addFavorite, removeFavorite } = get();
        if (isFavorite(productId)) {
          await removeFavorite(productId);
        } else {
          await addFavorite(productId);
        }
      },

      syncFavorites: async () => {
        try {
          const res = await http<{ success: boolean; data: { id: number }[] }>(
            "/api/users/favorites",
          );
          if (res.success && Array.isArray(res.data)) {
            const serverIds = res.data.map((p) => p.id);
            
            const localIds = get().favorites;
            const merged = [...new Set([...localIds, ...serverIds])];
            set({ favorites: merged });
          }
        } catch (e) {
         
        }
      },
    }),
    {
      name: "favorites-storage",
    },
  ),
);
