"use client";

import { NotificationWidget } from "@/components/notifications/NotificationWidget";
import { FloatingChat } from "./FloatingChat";
import { FloatingMenu } from "./FloatingMenu";
import { MusicPlayer } from "./MusicPlayer";

export function FloatingEssentials() {
  return (
    <>
      <FloatingChat />
      <div className="hidden sm:block">
        <FloatingMenu />
        <NotificationWidget />
        <MusicPlayer />
      </div>
    </>
  );
}
