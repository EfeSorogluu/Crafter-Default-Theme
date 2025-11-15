"use client";

import { useEffect, useState, useContext } from 'react';
import { usePathname } from 'next/navigation';
import { WebsiteContext } from '@/lib/context/website.context';

interface PreloadConfig {
  path: string;
  priority: 'high' | 'medium' | 'low';
  endpoints: string[];
}

// Store sayfaları için preload konfigürasyonu
const STORE_PRELOAD_CONFIG: PreloadConfig[] = [
  {
    path: '/store',
    priority: 'high',
    endpoints: [
      '/config/servers',
      '/categories',
      '/api/status/minecraft'
    ]
  },
  {
    path: '/store/server',
    priority: 'medium',
    endpoints: [
      '/config/servers',
      '/categories'
    ]
  },
  {
    path: '/store/server/[server_id]',
    priority: 'medium',
    endpoints: [
      '/config/servers',
      '/categories'
    ]
  },
  {
    path: '/store/server/[server_id]/category',
    priority: 'medium',
    endpoints: [
      '/categories',
      '/products/by-category'
    ]
  },
  {
    path: '/store/product',
    priority: 'low',
    endpoints: [
      '/products'
    ]
  }
];

export function StorePreloadManager() {
  const pathname = usePathname();
  const { website } = useContext(WebsiteContext);
  const [preloadedPaths, setPreloadedPaths] = useState<Set<string>>(new Set());

  useEffect(() => {
    const preloadForCurrentPath = async () => {
      if (!website?.id) return;
      
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const apiBase = `${baseUrl}/website/${website.id}`;

      // Find matching preload config
      const matchingConfig = STORE_PRELOAD_CONFIG.find(config => {
        if (config.path === pathname) return true;
        
        // Handle dynamic routes
        if (config.path.includes('[') && config.path.includes(']')) {
          const pathPattern = config.path
            .replace(/\[.*?\]/g, '[^/]+')
            .replace(/\//g, '\\/');
          const regex = new RegExp(`^${pathPattern}$`);
          return regex.test(pathname);
        }
        
        return pathname.startsWith(config.path);
      });

      if (!matchingConfig) return;

      // Preload endpoints based on priority
      const preloadPromises = matchingConfig.endpoints.map(async (endpoint) => {
        const fullUrl = `${apiBase}${endpoint}`;
        
        // Skip if already preloaded
        if (preloadedPaths.has(fullUrl)) return;

        try {
          await fetch(fullUrl, {
            method: 'HEAD',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          setPreloadedPaths(prev => new Set([...prev, fullUrl]));
        } catch (error) {
          console.debug(`Preload failed for ${fullUrl}:`, error);
        }
      });

      // Execute preload based on priority
      if (matchingConfig.priority === 'high') {
        // Execute immediately
        Promise.all(preloadPromises);
      } else if (matchingConfig.priority === 'medium') {
        // Execute with small delay
        setTimeout(() => Promise.all(preloadPromises), 100);
      } else {
        // Execute with longer delay
        setTimeout(() => Promise.all(preloadPromises), 500);
      }
    };

    preloadForCurrentPath();
  }, [pathname, preloadedPaths]);

  return null;
}

// Hook for intelligent preloading based on user behavior
export function useIntelligentPreload() {
  const [userBehavior, setUserBehavior] = useState({
    visitedPaths: new Set<string>(),
    timeSpent: new Map<string, number>(),
    interactions: new Map<string, number>()
  });

  useEffect(() => {
    const trackUserBehavior = () => {
      const currentPath = window.location.pathname;
      const now = Date.now();

      // Track time spent on current path
      if (userBehavior.visitedPaths.has(currentPath)) {
        const timeSpent = userBehavior.timeSpent.get(currentPath) || 0;
        userBehavior.timeSpent.set(currentPath, timeSpent + 1000); // 1 second intervals
      } else {
        userBehavior.visitedPaths.add(currentPath);
        userBehavior.timeSpent.set(currentPath, 0);
      }

      // Track interactions (clicks, scrolls, etc.)
      const interactions = userBehavior.interactions.get(currentPath) || 0;
      userBehavior.interactions.set(currentPath, interactions + 1);

      setUserBehavior({ ...userBehavior });
    };

    const interval = setInterval(trackUserBehavior, 1000);

    return () => clearInterval(interval);
  }, [userBehavior]);

  // Preload based on user behavior patterns
  const preloadBasedOnBehavior = () => {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    const websiteId = process.env.NEXT_PUBLIC_WEBSITE_ID;
    const apiBase = `${baseUrl}/website/${websiteId}`;

    // Find most visited paths and preload their data
    const sortedPaths = Array.from(userBehavior.visitedPaths).sort((a, b) => {
      const timeA = userBehavior.timeSpent.get(a) || 0;
      const timeB = userBehavior.timeSpent.get(b) || 0;
      return timeB - timeA;
    });

    // Preload data for top 3 most visited paths
    sortedPaths.slice(0, 3).forEach(path => {
      if (path.includes('/store/server/') && path.includes('/category/')) {
        // Preload category products
        const categoryId = path.split('/').pop();
        if (categoryId) {
          fetch(`${apiBase}/products/by-category/${categoryId}`, { method: 'HEAD' });
        }
      } else if (path.includes('/store/server/')) {
        // Preload server categories
        fetch(`${apiBase}/categories`, { method: 'HEAD' });
      } else if (path === '/store') {
        // Preload server list
        fetch(`${apiBase}/config/servers`, { method: 'HEAD' });
      }
    });
  };

  useEffect(() => {
    // Preload based on behavior every 30 seconds
    const behaviorInterval = setInterval(preloadBasedOnBehavior, 30000);
    return () => clearInterval(behaviorInterval);
  }, [userBehavior]);

  return { userBehavior };
} 