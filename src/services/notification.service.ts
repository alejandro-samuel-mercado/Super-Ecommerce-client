import { http } from "@/adapters/http";

export interface Notification {
  id: number;
  type: "ORDER" | "PROMO" | "STOCK" | "POINTS" | "SYSTEM" | "ERROR";
  title: string;
  message: string;
  read: boolean;
  data?: any;
  createdAt: string;
}

export const notificationService = {
  getAll: async (): Promise<Notification[]> => {
    const response = await http<{ success: boolean; data: Notification[] }>(
      "/api/notifications",
    );
    return response.data;
  },

  markAsRead: async (id: number | "all"): Promise<void> => {
    await http(`/api/notifications/${id}/read`, { method: "PUT" });
  },

  delete: async (id: number): Promise<void> => {
    await http(`/api/notifications/${id}`, { method: "DELETE" });
  },
};
