"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
      Notification,
      notificationService,
} from "@/services/notification.service";
import { AnimatePresence, motion } from "framer-motion";
import {
      AlertTriangle,
      Bell,
      Check,
      Info,
      ShoppingBag,
      Tag,
      Trash2,
      XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export const NotificationWidget = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const data = await notificationService.getAll();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch (error) {}
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Consultar cada 60 segundos
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user, fetchNotifications]);

  const handleMarkRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAsRead("all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {}
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      // Recalcular no leídas en caso de eliminar una no leída
      const isUnread = notifications.find((n) => n.id === id)?.read === false;
      if (isUnread) setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {}
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      handleMarkRead(notification.id);
    }
    if (notification.data?.url) {
      router.push(notification.data.url);
      setIsOpen(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "ORDER":
        return <ShoppingBag className="h-5 w-5 text-blue-500" />;
      case "PROMO":
        return <Tag className="h-5 w-5 text-secondary" />;
      case "STOCK":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "ERROR":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "points":
      case "POINTS":
        return <Check className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-24 right-6 z-[998]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-16 right-0 w-80 md:w-96 bg-background/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-10rem)]"
          >
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h3 className="font-bold text-lg">Notificaciones</h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllRead}
                  className="text-xs h-7"
                >
                  Marcar leídas
                </Button>
              )}
            </div>

            <ScrollArea className="flex-1 p-2 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground opacity-50">
                  <Bell className="h-12 w-12 mb-2 stroke-1" />
                  <p>Sin notificaciones</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        "p-3 rounded-xl flex gap-3 cursor-pointer transition-colors relative group",
                        notification.read
                          ? "bg-transparent hover:bg-white/5 opacity-70"
                          : "bg-white/10 hover:bg-white/15 border border-primary/20",
                      )}
                    >
                      <div className="mt-1 flex-shrink-0">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 pr-6">
                        <h4
                          className={cn(
                            "text-sm font-semibold leading-none mb-1",
                            !notification.read && "text-primary",
                          )}
                        >
                          {notification.title}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <span className="text-[10px] text-white/30 mt-1 block">
                          {new Date(
                            notification.createdAt,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handleDelete(notification.id, e)}
                      >
                        <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                      </Button>
                      {!notification.read && (
                        <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full bg-background/80 backdrop-blur-xl border border-primary/30 shadow-lg flex items-center justify-center relative hover:bg-white/10 transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-3 right-3 h-3 w-3 rounded-full bg-red-500 border-2 border-background animate-pulse" />
        )}
      </motion.button>
    </div>
  );
};
