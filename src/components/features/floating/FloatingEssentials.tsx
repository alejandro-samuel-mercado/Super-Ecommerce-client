"use client";

import { NotificationWidget } from "@/components/notifications/NotificationWidget";
import { FloatingChat } from "./FloatingChat";
import { FloatingMenu } from "./FloatingMenu";
import { MusicPlayer } from "./MusicPlayer";
import { FloatingWhastappButton } from "./WhatsAppButton";

export function FloatingEssentials() {
    return (
        <>
            <FloatingChat />
            <NotificationWidget />
            <div className="hidden sm:block">
                {/*<FloatingMenu />*/}

                <MusicPlayer />
            </div>
        </>
    );
}
