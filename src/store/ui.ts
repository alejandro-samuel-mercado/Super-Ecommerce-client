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
  closeAll: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCartOpen: false,
  isMobileMenuOpen: false,
  isChatOpen: false,
  toggleCart: () =>
    set((state) => ({
      isCartOpen: !state.isCartOpen,
      isChatOpen: false,
      isMobileMenuOpen: false,
    })),
  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  toggleChat: () =>
    set((state) => ({
      isChatOpen: !state.isChatOpen,
      isCartOpen: false,
      isMobileMenuOpen: false,
    })),
  closeCart: () => set({ isCartOpen: false }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  closeAll: () => set({ isCartOpen: false, isChatOpen: false, isMobileMenuOpen: false }),
}));
