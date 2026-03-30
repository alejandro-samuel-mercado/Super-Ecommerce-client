"use client";

export interface GuestOrder {
  id: string;
  date: string;
}

const STORAGE_KEY = "recent_guest_orders";

export const guestOrderPersistence = {
  saveOrder(id: string) {
    if (typeof window === "undefined") return;
    
    try {
      const orders: GuestOrder[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      
      // Evitar duplicados
      if (orders.some(o => o.id === id)) return;
      
      orders.unshift({ id, date: new Date().toISOString() });
      
      // Mantener solo los últimos 10 pedidos
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders.slice(0, 10)));
    } catch (e) {
      console.error("Error saving guest order to localStorage", e);
    }
  },

  getOrders(): GuestOrder[] {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (e) {
      return [];
    }
  },

  clearOrders() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
  }
};
