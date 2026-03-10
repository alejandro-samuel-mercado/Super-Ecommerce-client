import { Notification, notificationService } from "@/services/notification.service";
import { create } from "zustand";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifications: Notification[]) => void;
  setUnreadCount: (count: number) => void;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) => set({ notifications }),
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  
  fetchNotifications: async () => {
    try {
      const data = await notificationService.getAll();
      set({ 
        notifications: data, 
        unreadCount: data.filter((n) => !n.read).length 
      });
    } catch (error) {}
  },

  markAsRead: async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) => 
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }));
    } catch (error) {}
  },

  markAllAsRead: async () => {
    try {
      await notificationService.markAsRead("all");
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0
      }));
    } catch (error) {}
  },

  deleteNotification: async (id: number) => {
    try {
      const isUnread = get().notifications.find((n) => n.id === id)?.read === false;
      await notificationService.delete(id);
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: isUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
      }));
    } catch (error) {}
  }
}));
