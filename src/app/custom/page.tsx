"use client";

import { configService } from "@/services/config";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function CustomPage() {
    const { data: config, isLoading } = useQuery({
        queryKey: ["publicConfig"],
        queryFn: configService.getPublicConfig,
        staleTime: 1000 * 60 * 5,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!config || !config.navItemName) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24">
                <p className="text-xl text-muted-foreground">Página no encontrada.</p>
            </div>
        );
    }

    const formatVideoUrl = (rawUrl: string) => {
        let videoUrl = rawUrl || "";
        if (videoUrl.includes("youtube.com/watch?v=")) {
            videoUrl = videoUrl.replace("watch?v=", "embed/");
        } else if (videoUrl.includes("youtu.be/")) {
            videoUrl = videoUrl.replace("youtu.be/", "youtube.com/embed/");
        }
        return videoUrl;
    };

    const buildMasonryItems = () => {
        const result = [];

        if (config.customPageDescription) {
            result.push({ type: 'text', content: config.customPageDescription, id: 'main-desc' });
        }
        if (config.customPageImage) {
            result.push({ type: 'image', content: config.customPageImage, id: 'main-img' });
        }
        if (config.customPageVideo) {
            result.push({ type: 'video', content: config.customPageVideo, id: 'main-vid' });
        }

        const texts = [...(config.customPageTexts || [])];
        const imgs = [...(config.customPageImages || [])];
        const vids = [...(config.customPageVideos || [])];

        const maxLen = Math.max(texts.length, imgs.length, vids.length);
        for(let i = 0; i < maxLen; i++) {
             if (texts[i]) result.push({ type: 'text', content: texts[i], id: `t-${i}` });
             if (imgs[i]) result.push({ type: 'image', content: imgs[i], id: `i-${i}` });
             if (vids[i]) result.push({ type: 'video', content: vids[i], id: `v-${i}` });
        }
        return result;
    };

    return (
        <main className="min-h-screen pt-32 pb-40 bg-background">
            <div className="container mx-auto px-4 max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-16 mt-8"
                >
                    {/* Header Principal */}
                    <div className="text-center space-y-6 max-w-4xl mx-auto">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight drop-shadow-sm">
                            {config.customPageTitle}
                        </h1>
                        <div className="w-24 h-1.5 bg-primary mx-auto rounded-full" />
                        
                        {config.customPageDescription && (
                            <p className="text-xl text-muted-foreground leading-relaxed whitespace-pre-wrap mt-8">
                                {config.customPageDescription}
                            </p>
                        )}
                    </div>

                    {/* Media Principal */}
                    {(config.customPageImage || config.customPageVideo) && (
                        <div className={`grid grid-cols-1 ${config.customPageImage && config.customPageVideo ? 'lg:grid-cols-2' : ''} gap-8 items-center max-w-5xl mx-auto`}>
                            {config.customPageImage && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-white/10"
                                >
                                    <img
                                        src={config.customPageImage}
                                        alt={config.customPageTitle || "Imagen Principal"}
                                        className="w-full h-auto object-cover max-h-[600px]"
                                    />
                                </motion.div>
                            )}

                            {config.customPageVideo && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-white/10"
                                >
                                    <iframe
                                        src={formatVideoUrl(config.customPageVideo)}
                                        title="Video Principal"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="absolute top-0 left-0 w-full h-full"
                                    />
                                </motion.div>
                            )}
                        </div>
                    )}

                    {/* Textos Extra (Masonry) */}
                    {config.customPageTexts && config.customPageTexts.length > 0 && (
                        <div className="space-y-8 pt-8 border-t border-border/50">
                            <h2 className="text-3xl font-bold tracking-tight">
                                {config.customPageTextsSubtitle || "Más Información"}
                            </h2>
                            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                                {config.customPageTexts.map((txt, i) => (
                                    <motion.div
                                        key={`txt-${i}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1, duration: 0.5 }}
                                        className="break-inside-avoid bg-secondary/5 dark:bg-secondary/10 p-8 rounded-3xl border border-secondary/20 shadow-sm"
                                    >
                                        <p className="text-lg text-foreground/80 leading-relaxed whitespace-pre-wrap">
                                            {txt}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Galería de Imágenes (Masonry Orgánico) */}
                    {config.customPageImages && config.customPageImages.length > 0 && (
                        <div className="space-y-8 pt-8 border-t border-border/50">
                            <h2 className="text-3xl font-bold tracking-tight">
                                {config.customPageImagesSubtitle || "Galería de Imágenes"}
                            </h2>
                            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                                {config.customPageImages.map((img, i) => (
                                    <motion.div
                                        key={`img-${i}`}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1, duration: 0.5 }}
                                        className="break-inside-avoid rounded-2xl overflow-hidden shadow-md group border border-white/10 relative"
                                    >
                                        <img
                                            src={img}
                                            alt={`Galería ${i + 1}`}
                                            className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Galería de Videos (Masonry Grid) */}
                    {config.customPageVideos && config.customPageVideos.length > 0 && (
                        <div className="space-y-8 pt-8 border-t border-border/50">
                            <h2 className="text-3xl font-bold tracking-tight">
                                {config.customPageVideosSubtitle || "Videos Destacados"}
                            </h2>
                            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                                {config.customPageVideos.map((vid, i) => {
                                    const url = formatVideoUrl(vid);
                                    if (!url) return null;
                                    return (
                                        <motion.div
                                            key={`vid-${i}`}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: i * 0.1, duration: 0.5 }}
                                            className="break-inside-avoid relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg border border-white/10"
                                        >
                                            <iframe
                                                src={url}
                                                title={`Video ${i + 1}`}
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                className="absolute top-0 left-0 w-full h-full"
                                            />
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </main>
    );
}

