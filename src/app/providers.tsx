"use client";

import { MainLayout } from "@/components/main-layout";
import PWAInstaller from "@/components/pwa-installer";
import { StorePreloadManager } from "@/components/store/StorePreloadManager";
import { AuthProvider } from "@/lib/context/auth.context";
import { CartProvider } from "@/lib/context/cart.context";
import { MaintenanceProvider } from "@/lib/context/maintenance.context";
import { WebsiteProvider } from "@/lib/context/website.context";
import { useEffect } from "react";

export default function Providers({
  children,
  websiteId,
}: {
  children: React.ReactNode;
  websiteId?: string;
}) {
  useEffect(() => {
    // websiteId'yi localStorage'a kaydet
    if (websiteId) {
      localStorage.setItem("websiteId", websiteId);
    }
  }, [websiteId]);

  return (
    <WebsiteProvider>
      <AuthProvider>
        <MaintenanceProvider>
          <CartProvider>
            <MainLayout>{children}</MainLayout>
            <PWAInstaller />
            <StorePreloadManager />
          </CartProvider>
        </MaintenanceProvider>
      </AuthProvider>
    </WebsiteProvider>
  );
}
