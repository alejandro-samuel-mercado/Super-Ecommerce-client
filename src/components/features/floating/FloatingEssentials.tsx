"use client";

import { NotificationWidget } from "@/components/notifications/NotificationWidget";
import { FloatingChat } from "./FloatingChat";
import { FloatingMenu } from "./FloatingMenu";
import { MusicPlayer } from "./MusicPlayer";

export function FloatingEssentials() {
  return (
    <div className="hidden sm:block">
      <FloatingChat />
      <FloatingMenu />
      <NotificationWidget />
      <MusicPlayer />
    </div>
  );
}
