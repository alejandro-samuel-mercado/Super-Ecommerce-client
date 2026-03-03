"use client";

import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { Music, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTouchRef = useRef(false);

  const tracks = useMemo(() => [
    {
      title: "Ambient Flow",
      artist: "Free",
      src: "/tracks/track1.mp3",
    },
    {
      title: "Ambient Space",
      artist: "Free",
      src: "/tracks/track2.mp3",
    },
    {
      title: "Melody Cloud",
      artist: "Free",
      src: "/tracks/track3.mp3",
    },
  ], []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const track = tracks[currentIndex];

  useEffect(() => {
    audioRef.current = new Audio(tracks[0].src);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;

    return () => {
      audioRef.current?.pause();
    };
  }, [tracks]);

  useEffect(() => {
    if (!audioRef.current) return;

    audioRef.current.src = track.src;
    audioRef.current.load();

    if (isPlaying) {
      audioRef.current.play().catch(console.error);
    }
  }, [track, isPlaying]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current
        .play()
        .catch((e) => console.error("Error al reproducir audio", e));
    }
    setIsPlaying(!isPlaying);
  };

  const handleMouseEnter = () => {
    if (isTouchRef.current) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    if (isTouchRef.current) return;
    timeoutRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, 300);
  };

  const handleDiscClick = () => {
    isTouchRef.current = true;
    setIsExpanded((prev) => !prev);
  };

  return (
    <div className="fixed bottom-6 left-6 z-40 flex items-end">
      <motion.div
        initial={{ width: "3.5rem" }}
        animate={{ width: isExpanded ? "auto" : "3.5rem" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="bg-black/90 backdrop-blur-xl rounded-full shadow-2xl flex items-center p-1.5 border border-white/10 overflow-hidden cursor-pointer"
      >
        <div
          onClick={handleDiscClick}
          className={`relative flex items-center justify-center h-11 w-11 shrink-0 rounded-full ${isPlaying ? "animate-spin-slow" : ""}`}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-primary to-secondary rounded-full opacity-80"></div>
          <Music className="w-5 h-5 text-white relative z-10" />
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 pl-3 pr-4 whitespace-nowrap overflow-hidden"
            >
              <div className="flex flex-col justify-center">
                <span className="text-white text-sm font-bold leading-none">
                  {track.title}
                </span>
                <span className="text-white/60 text-xs">{track.artist}</span>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-white/70 hover:text-white rounded-full hover:bg-white/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(
                      (prev) => (prev - 1 + tracks.length) % tracks.length,
                    );
                  }}
                >
                  <SkipBack className="w-4 h-4" />
                </Button>

                <Button
                  size="icon"
                  className="h-8 w-8 bg-white text-black hover:bg-white/90 rounded-full shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                >
                  {isPlaying ? (
                    <Pause className="w-3 h-3 fill-current" />
                  ) : (
                    <Play className="w-3 h-3 ml-0.5 fill-current" />
                  )}
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-white/70 hover:text-white rounded-full hover:bg-white/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex((prev) => (prev + 1) % tracks.length);
                  }}
                >
                  <SkipForward className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Barras del visualizador (simuladas) */}
        {isPlaying && !isExpanded && (
          <div className="flex gap-0.5 items-end h-4 ml-2 mr-2">
            <motion.div
              animate={{ height: [4, 12, 6] }}
              transition={{ repeat: Infinity, duration: 0.4 }}
              className="w-1 bg-primary rounded-full"
            />
            <motion.div
              animate={{ height: [8, 16, 8] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="w-1 bg-secondary rounded-full"
            />
            <motion.div
              animate={{ height: [6, 10, 4] }}
              transition={{ repeat: Infinity, duration: 0.3 }}
              className="w-1 bg-primary rounded-full"
            />
          </div>
        )}
      </motion.div>
    </div>
  );
}
