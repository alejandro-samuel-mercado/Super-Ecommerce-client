"use client";

import { CookieBanner } from "@/components/CookieBanner";
import { Footer } from "@/components/footer/Footer";
import { MobileMenu } from "@/components/nav/MobileMenu";
import { Navbar } from "@/components/nav/Navbar";
import { CartDrawer } from "@/components/shared/CartDrawer";
import { Toaster } from "@/components/ui/sonner";

import { FloatingEssentials } from "@/components/features/floating/FloatingEssentials";
import { ScrollBackground } from "@/components/features/home/ScrollBackground";
import { MaintenancePage } from "@/components/maintenance/MaintenancePage";
import { useMaintenance } from "@/hooks/useMaintenance";
import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";
import "./globals.css";

import { Providers } from "@/components/providers/Providers";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          <LayoutContent>
            <ScrollBackground />
            {children}
          </LayoutContent>
        </Providers>
      </body>
    </html>
  );
}

import { SplashScreen } from "@/components/ui/SplashScreen";
import { configService } from "@/services/config";
import { useQuery } from "@tanstack/react-query";
import { MobileBottomNav } from "@/components/nav/MobileBottomNav";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const { isMaintenanceMode, loading: maintenanceLoading } = useMaintenance();

  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ["publicConfig"],
    queryFn: configService.getPublicConfig,
    staleTime: 1000 * 60 * 60,
  });

  const isLoading = maintenanceLoading || (isHomePage && configLoading);

  if (isMaintenanceMode && !maintenanceLoading) {
    return <MaintenancePage />;
  }

  return (
    <>
      <SplashScreen
        isLoading={isLoading}
        logo={config?.logoUrl}
        storeName={config?.storeName}
      />

      {!isHomePage && <Navbar />}
      <div className={!isHomePage ? "pt-16  md:pt-2  " : "max-sm:px-2 max-md:px-6 max-xl:px-10 overflow-x-hidden"}>
        {children}
      </div>
      <Footer />
      <MobileMenu />
      <CartDrawer />
      <CookieBanner />
      <Toaster expand={true} richColors closeButton />
      <FloatingEssentials />
      <MobileBottomNav />
    </>
  );
}
