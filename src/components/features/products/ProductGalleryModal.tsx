"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface ProductGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex: number;
  productName: string;
}

export function ProductGalleryModal({
  isOpen,
  onClose,
  images,
  initialIndex,
  productName,
}: ProductGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setZoom(1);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setZoom(1);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.5, 1));
  const handleReset = () => setZoom(1);

  const dragConstraints = {
    left: -(window?.innerWidth * 0.85 * (zoom - 1)) / 2,
    right: (window?.innerWidth * 0.85 * (zoom - 1)) / 2,
    top: -(window?.innerHeight * 0.9 * (zoom - 1)) / 2,
    bottom: (window?.innerHeight * 0.9 * (zoom - 1)) / 2,
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="lg:max-w-[80vw] sm:max-w-[85vw] h-[90vh] p-2 bg-background/10 backdrop-blur-sm border-white/20 shadow-2xl rounded-[2rem] flex flex-col overflow-hidden ring-1 ring-white/20">
        <VisuallyHidden>
          <DialogTitle>Galería de {productName}</DialogTitle>
        </VisuallyHidden>

        <div className="absolute top-2 right-6 sm:right-16  flex items-center gap-2 z-50">
          <div className="flex items-center gap-1 bg-white/10  rounded-full p-1 border border-white/20 shadow-2xl">
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
              title="Alejar"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold w-12 text-center text-white">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
              title="Acercar"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <div className="w-px h-4 bg-white/20 mx-1" />
            <button
              onClick={handleReset}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
              title="Restablecer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 relative flex items-center justify-center overflow-hidden ">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full h-full flex items-center justify-center"
            >
              <motion.div
                drag={zoom > 1}
                dragConstraints={dragConstraints}
                dragElastic={0.1}
                animate={zoom === 1 ? { scale: 1, x: 0, y: 0 } : { scale: zoom }}
                transition={{ type: "spring", damping: 25, stiffness: 200, mass: 1 }}
                className="relative w-full h-full p-12 cursor-grab active:cursor-grabbing flex items-center justify-center"
              >
                <div className="relative w-full h-full max-w-5xl max-h-5xl  ">
                  <Image
                    src={images[currentIndex]}
                    alt={`${productName} - Imagen ${currentIndex + 1}`}
                    fill
                    className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] select-none pointer-events-none"
                    priority
                    draggable={false}
                  />
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-6 p-4 rounded-full bg-white/30 hover:bg-white/50 backdrop-blur-md border border-white/50 transition-all text-primary shadow-lg hover:scale-110"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-6 p-4 rounded-full bg-white/30 hover:bg-white/50 backdrop-blur-md border border-white/50 transition-all text-primary shadow-lg hover:scale-110"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails Footer */}
        {images.length > 1 && (
          <div className="p-6 bg-white/20 backdrop-blur-sm border-t border-white/20 flex justify-center gap-3 overflow-x-auto">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentIndex(idx);
                  setZoom(1);
                }}
                className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                  currentIndex === idx
                    ? "border-primary ring-4 ring-primary/20 scale-110"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={img}
                  alt={`Miniatura ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
