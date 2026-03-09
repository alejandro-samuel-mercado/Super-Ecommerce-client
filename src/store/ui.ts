import { create } from "zustand";

interface UIState {
  isCartOpen: boolean;
  isMobileMenuOpen: boolean;
  isChatOpen: boolean;
  toggleCart: () => void;
  toggleMobileMenu: () => void;
  toggleChat: () => void;
  closeCart: () => void;
  closeMobileMenu: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCartOpen: false,
  isMobileMenuOpen: false,
  isChatOpen: false,
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
  closeCart: () => set({ isCartOpen: false }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
}));
