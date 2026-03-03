"use client";

import { configService } from "@/services/config";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function SecondaryAds() {
  const { data: config, isLoading } = useQuery({
    queryKey: ["publicConfig"],
    queryFn: configService.getPublicConfig,
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const ads = config?.secondaryAds || [];

  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [ads.length]);

  if (isLoading || ads.length === 0) return null;

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex(
      (prevIndex) => (prevIndex + newDirection + ads.length) % ads.length,
    );
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

   return (
     <section className=" px-0 py-12 ml-[-30px] w-[calc(100%+30px)] max-md:py-6 overflow-hidden ">
       <div className="relative group overflow-hidden shadow-2xl bg-zinc-100 max-md:aspect-[30/9] aspect-[30/6] ">
         <AnimatePresence initial={false} custom={direction}>
           <motion.div
             key={currentIndex}
             custom={direction}
             variants={variants}
             initial="enter"
             animate="center"
             exit="exit"
             transition={{
               x: { type: "spring", stiffness: 300, damping: 30 },
               opacity: { duration: 0.2 },
             }}
             className="absolute inset-0"
           >
             <img
               src={ads[currentIndex].url}
               alt=""
               className="hidden max-md:block absolute inset-0 w-full h-full object-cover scale-125 max-md:blur-sm "
             />

             <div className="absolute inset-0 max-md:bg-black/20" />

             <div className="relative z-10 flex items-center justify-center h-full">
               {ads[currentIndex].link ? (
                 <Link href={ads[currentIndex].link!} className="w-full">
                   <img
                     src={ads[currentIndex].url}
                     alt={`Anuncio ${currentIndex + 1}`}
                     className="w-full  max-h-[100%] max-md:max-h-[80%] object-cover transition-transform duration-700 hover:scale-105"
                   />
                 </Link>
               ) : (
                 <img
                   src={ads[currentIndex].url}
                   alt={`Anuncio ${currentIndex + 1}`}
                   className="w-full max-h-[100%] max-md:max-h-[80%]   max-md:object-cover"
                 />
               )}
             </div>
           </motion.div>
         </AnimatePresence>
       </div>
     </section>
   );
}
