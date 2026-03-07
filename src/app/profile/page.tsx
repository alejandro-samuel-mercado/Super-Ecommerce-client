"use client";

import { FavoritesTab } from "@/components/features/profile/FavoritesTab";
import { OrdersTab } from "@/components/features/profile/OrdersTab";
import { PointsTab } from "@/components/features/profile/PointsTab";
import { ProfileEditTab } from "@/components/features/profile/ProfileEditTab";
import { ReviewsTab } from "@/components/features/profile/ReviewsTab";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { PublicConfig, configService } from "@/services/config";
import { AnimatePresence, motion } from "framer-motion";
import {
      Gift,
      Heart,
      LogOut,
      Mail,
      MapPin,
      MessageSquare,
      Package,
      User as UserIcon
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>}>
      <ProfileContent />
    </Suspense>
  );
}

function ProfileContent() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "profile",
  );
  const [storeConfig, setStoreConfig] = useState<PublicConfig | null>(null);

  useEffect(() => {
    configService.getPublicConfig().then(setStoreConfig).catch(console.error);
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full"
        />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen  text-foreground pb-40 selection:bg-primary/30 pt-20 max-lg:pt-10 max-md:pt-0">
      {/* 1. Header */}
      <div className="relative h-[30vh] max-lg:h-[40vh] w-full overflow-hidden ">
        
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-secondary transition-all duration-700 "
          
        >
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        {/* Botón de cerrar sesión */}
        <div className="absolute top-6 right-6 max-md:top-10 max-md:right-3 z-20">
          <Button
            variant="ghost"
            onClick={logout}
            className="bg-white/20 hover:bg-destructive/20 hover:text-destructive-foreground backdrop-blur-md border border-white/20 rounded-2xl gap-2 transition-all group font-bold"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider">
              Cerrar Sesión
            </span>
          </Button>
        </div>
      </div>

      {/* 2. Información del usuario */}
      <div className="container mx-auto max-lg:px-20 max-md:px-10 max-sm:px-6 -mt-28 max-lg:-mt-24 relative z-10 max-sm:-mt-40">
        <div className="flex flex-col max-sm:flex-col lg:flex-row items-start gap-6 mb-12 ">
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative group max-sm:mx-auto"
          >
            <div className="h-40 w-40 md:h-48 md:w-48 rounded-[2.5rem] bg-gradient-to-br from-primary to-secondary p-1.5 shadow-2xl relative">
              <div className="h-full w-full rounded-[2.2rem] bg-card flex items-center justify-center text-6xl font-black overflow-hidden relative border-4 border-background">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-primary">{user.name?.charAt(0)}</span>
                )}
              </div>
            </div>
            <div
              className="absolute -bottom-2 -right-2 bg-emerald-500 h-8 w-8 rounded-full border-4 border-background animate-pulse"
              title="En línea"
            />
          </motion.div>


          <div className="flex-1 pb-4">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className=""
            >
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2 text-foreground max-sm:text-center">
                {user.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm font-medium max-sm:justify-center">
                <span className="flex items-center gap-1.5 bg-primary/5 px-3 py-1 rounded-full">
                  <Mail className="w-4 h-4 text-primary" /> {user.email}
                </span>
                <span className="flex items-center gap-1.5 bg-secondary/5 px-3 py-1 rounded-full">
                  <MapPin className="w-4 h-4 text-secondary" />{" "}
                  {user.city || "Ciudad no especificada"}
                </span>
                <span className="bg-card px-3 py-1 rounded-full text-[10px] border-4 border-secondary/30 uppercase font-black tracking-widest text-primary">
                  {(user.role as any).name==="CUSTOMER"?"Cliente":"Personal"}
                </span>
              </div>
            </motion.div>
          </div>

          <div className="flex gap-4 md:mb-4 max-sm:mx-auto">
            {storeConfig?.enablePoints && (
              <div className="bg-card backdrop-blur-md border-4 border-secondary/40 p-4 rounded-3xl text-center min-w-[100px] shadow-sm ">
                <p className="text-2xl font-black text-primary">
                  {user.points}
                </p>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">
                  Puntos
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 3. Navegación de pestañas sociales */}
        <Tabs
          defaultValue={activeTab}
          onValueChange={setActiveTab}
          className="w-full "
        >
          <div className="border-b border-secondary/40 mb-8 overflow-x-auto scrollbar-hide">
            <TabsList className="bg-transparent h-auto p-0 pb-2 flex justify-start gap-8">
              <TabsTrigger
                value="profile"
                className="social-tab-trigger data-[state=active]:bg-primary data-[state=active]:text-white hover:bg-secondary/40 hover:text-primary"
              >
                <UserIcon className="w-4 h-4" /> Principal
              </TabsTrigger>
              <TabsTrigger
                value="orders"
                className="social-tab-trigger data-[state=active]:bg-primary data-[state=active]:text-white hover:bg-secondary/40 hover:text-primary"
              >
                <Package className="w-4 h-4" /> Mis Pedidos
              </TabsTrigger>
              <TabsTrigger
                value="favorites"
                className="social-tab-trigger data-[state=active]:bg-primary data-[state=active]:text-white hover:bg-secondary/40 hover:text-primary"
              >
                <Heart className="w-4 h-4" /> Favoritos
              </TabsTrigger>
              <TabsTrigger
                value="comments"
                className="social-tab-trigger data-[state=active]:bg-primary data-[state=active]:text-white hover:bg-secondary/40 hover:text-primary"
              >
                <MessageSquare className="w-4 h-4" /> Reseñas
              </TabsTrigger>
              {storeConfig?.enablePoints && (
                <TabsTrigger
                  value="points"
                  className="social-tab-trigger data-[state=active]:bg-primary data-[state=active]:text-white hover:bg-secondary/40 hover:text-primary"
                >
                  <Gift className="w-4 h-4" /> Recompensas
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          {/* 4. Contenido del dashboard (Dos columnas) */}
          <div className="grid grid-cols-1  gap-8 items-start">
            
            <div className="lg:col-span-8 order-1 ">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="min-h-[500px]"
                >
                  <TabsContent
                    value="profile"
                    className="m-0 focus-visible:ring-0"
                  >
                    <div className="social-feed-card overflow-hidden">
                      <ProfileEditTab user={user} />
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="orders"
                    className="m-0 focus-visible:ring-0"
                  >
                    <div className="social-feed-card">
                      <h3 className="text-2xl font-black mb-6 text-primary tracking-tight">
                        Mis Compras
                      </h3>
                      <OrdersTab />
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="favorites"
                    className="m-0 focus-visible:ring-0"
                  >
                    <div className="social-feed-card">
                      <FavoritesTab />
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="comments"
                    className="m-0 focus-visible:ring-0"
                  >
                    <div className="social-feed-card">
                      <h3 className="text-2xl font-black mb-6 text-primary tracking-tight">
                        Mis Reseñas
                      </h3>
                      <ReviewsTab />
                    </div>
                  </TabsContent>

                  {storeConfig?.enablePoints && (
                    <TabsContent
                      value="points"
                      className="m-0 focus-visible:ring-0"
                    >
                      <div className="social-feed-card border-primary/20 ">
                        <PointsTab />
                      </div>
                    </TabsContent>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

          
          </div>
        </Tabs>
      </div>

      <style jsx global>{`
        .social-tab-trigger {
          @apply flex items-center gap-2 px-1 pb-4 text-xs font-black text-muted-foreground uppercase tracking-widest border-b-2 border-transparent transition-all hover:text-primary relative;
        }
        .social-tab-trigger[data-state="active"] {
          @apply text-primary border-primary border-b-2;
        }
        .social-feed-card {
          @apply bg-card border border-border rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-primary/5;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

function Separator({ className }: { className?: string }) {
  return <div className={`h-[1px] w-full ${className}`} />;
}
