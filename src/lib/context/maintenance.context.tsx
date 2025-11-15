"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useWebsiteContext } from "./website.context";
import { AuthContext } from "./auth.context";
import Loading from "@/components/loading";

interface MaintenanceContextType {
  isMaintenanceActive: boolean;
  canAccessDuringMaintenance: boolean;
  redirectToMaintenance: () => void;
}

const MaintenanceContext = createContext<MaintenanceContextType>({
  isMaintenanceActive: false,
  canAccessDuringMaintenance: false,
  redirectToMaintenance: () => {},
});

export const useMaintenanceContext = () => {
  return useContext(MaintenanceContext);
};

export const MaintenanceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { website } = useWebsiteContext();
  const authContext = useContext(AuthContext);
  const { user, isAuthenticated } = authContext;
  const [isMaintenanceActive, setIsMaintenanceActive] = useState(false);
  const [canAccessDuringMaintenance, setCanAccessDuringMaintenance] =
    useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();


  
  const redirectToMaintenance = () => {
    router.push("/maintenance");
  };

  useEffect(() => {
    if (!website) {
      setIsLoading(false);
      return;
    }

    const maintenanceActive = website.maintenance;
    setIsMaintenanceActive(maintenanceActive);

    if (maintenanceActive) {
      // Sadece /auth/sign-in sayfasına izin ver
      const allowedPages = ["/auth/sign-in", "/maintenance"];
      const isOnAllowedPage = allowedPages.includes(pathname);
      
      // Check if user can access during maintenance (sadece yetkili kullanıcılar)
      const hasAccess =
        isAuthenticated &&
        user &&
        user.role &&
        user.role.permissions &&
        user.role.permissions.length > 0;

      setCanAccessDuringMaintenance(hasAccess as boolean);

      // Eğer izin verilen sayfalarda değilse ve yetkili değilse maintenance sayfasına yönlendir
      if (!isOnAllowedPage && !hasAccess) {
        redirectToMaintenance();
      }
    } else {
      setCanAccessDuringMaintenance(true);
      
      // Eğer maintenance sayfasındaysa ve maintenance aktif değilse ana sayfaya yönlendir
      if (pathname === "/maintenance") {
        router.push('/');
        return;
      }
    }

    setIsLoading(false);
  }, [website, user, isAuthenticated, pathname, router]);

  // Show loading while checking maintenance status
  if (isLoading) {
    return (
      <Loading show={true} message="Yükleniyor..." fullScreen={true} />
    );
  }

  // If maintenance is active and user can't access, don't render children
  // But always render children if we're on maintenance page or allowed pages
  if (isMaintenanceActive && !canAccessDuringMaintenance) {
    const allowedPages = ["/auth/sign-in", "/maintenance"];
    const isOnAllowedPage = allowedPages.includes(pathname);
    
    if (!isOnAllowedPage) {
      return null;
    }
  }

  return (
    <MaintenanceContext.Provider
      value={{
        isMaintenanceActive,
        canAccessDuringMaintenance,
        redirectToMaintenance,
      }}
    >
      {children}
    </MaintenanceContext.Provider>
  );
};
