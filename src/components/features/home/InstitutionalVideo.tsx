"use client";

import { configService } from "@/services/config";
import { useQuery } from "@tanstack/react-query";

export function InstitutionalVideo() {
    const { data: config, isLoading } = useQuery({
        queryKey: ["publicConfig"],
        queryFn: configService.getPublicConfig,
        staleTime: 1000 * 60 * 60,
    });

    if (isLoading || !config?.institutionalVideo) {
        return null;
    }


    let videoUrl = config.institutionalVideo;
    if (videoUrl.includes("youtube.com/watch?v=")) {
        videoUrl = videoUrl.replace("watch?v=", "embed/");
    } else if (videoUrl.includes("youtu.be/")) {
        videoUrl = videoUrl.replace("youtu.be/", "youtube.com/embed/");
    }

    return (
        <section className="container mx-auto px-4 py-8 mb-8 mt-16 max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-8 text-foreground drop-shadow-sm">
                {config.institutionalVideoTitle || "Conoce Más Sobre Nosotros"}
            </h2>
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white/40 dark:border-white/10">
                <iframe
                    src={videoUrl}
                    title="Video Institucional"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute top-0 left-0 w-full h-full"
                />
            </div>
        </section>
    );
}
