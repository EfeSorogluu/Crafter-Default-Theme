"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface StorePreloaderProps {
  preloadPaths?: string[];
}

export function StorePreloader({ preloadPaths = [] }: StorePreloaderProps) {
  const router = useRouter();

  useEffect(() => {
    // Preload critical store paths
    const criticalPaths = [
      '/store',
      '/store/server',
      '/store/product',
      ...preloadPaths
    ];

    // Preload paths when component mounts
    criticalPaths.forEach(path => {
      router.prefetch(path);
    });

    // Preload images for better UX
    const preloadImages = () => {
      const imageUrls = [
        '/images/default-category.png',
        '/images/background.png',
        '/images/crafter.png'
      ];

      imageUrls.forEach(url => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = url;
        document.head.appendChild(link);
      });
    };

    preloadImages();
  }, [router, preloadPaths]);

  return null;
}

// Hook for preloading store data based on actual service endpoints
export function useStorePreload() {
  useEffect(() => {
    // Preload store API endpoints based on actual service URLs
    const preloadAPIs = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const websiteId = localStorage.getItem("websiteId") as string;
        const apiBase = `${baseUrl}/website/${websiteId}`;

        // Preload server list - from server.service.ts: getServers()
        fetch(`${apiBase}/config/servers`, { 
          method: 'HEAD',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        // Preload categories - from category.service.ts: getCategories()
        fetch(`${apiBase}/categories`, { 
          method: 'HEAD',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        // Preload products endpoint - from product.service.ts: getProductById()
        // We can't preload specific products without knowing IDs, but we can warm up the endpoint
        fetch(`${apiBase}/products`, { 
          method: 'HEAD',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        // Preload server status endpoints - used in store page for server status
        fetch('/api/status/minecraft', { 
          method: 'HEAD',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        // Preload DNS and connections for better performance
        const preloadConnections = () => {
          // Preconnect to backend
          const backendLink = document.createElement('link');
          backendLink.rel = 'preconnect';
          backendLink.href = baseUrl;
          document.head.appendChild(backendLink);

          // DNS prefetch for backend
          const dnsLink = document.createElement('link');
          dnsLink.rel = 'dns-prefetch';
          dnsLink.href = baseUrl;
          document.head.appendChild(dnsLink);
        };

        preloadConnections();

      } catch (error) {
        // Silently fail - this is just for optimization
        console.debug('Store preload failed:', error);
      }
    };

    preloadAPIs();
  }, []);
}

// Hook for preloading specific server data
export function useServerPreload(serverId?: string) {
  useEffect(() => {
    if (!serverId) return;

    const preloadServerData = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const websiteId = process.env.NEXT_PUBLIC_WEBSITE_ID;
        const apiBase = `${baseUrl}/website/${websiteId}`;

        // Preload specific server - from server.service.ts: getServer(server_id)
        fetch(`${apiBase}/config/servers/${serverId}`, { 
          method: 'HEAD',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        // Preload server categories
        fetch(`${apiBase}/categories`, { 
          method: 'HEAD',
          headers: {
            'Content-Type': 'application/json',
          }
        });

      } catch (error) {
        console.debug('Server preload failed:', error);
      }
    };

    preloadServerData();
  }, [serverId]);
}

// Hook for preloading specific category data
export function useCategoryPreload(categoryId?: string) {
  useEffect(() => {
    if (!categoryId) return;

    const preloadCategoryData = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const websiteId = process.env.NEXT_PUBLIC_WEBSITE_ID;
        const apiBase = `${baseUrl}/website/${websiteId}`;

        // Preload specific category - from category.service.ts: getCategory(category_id)
        fetch(`${apiBase}/categories/${categoryId}`, { 
          method: 'HEAD',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        // Preload products by category - from product.service.ts: getProductsByCategory(category_id)
        fetch(`${apiBase}/products/by-category/${categoryId}`, { 
          method: 'HEAD',
          headers: {
            'Content-Type': 'application/json',
          }
        });

      } catch (error) {
        console.debug('Category preload failed:', error);
      }
    };

    preloadCategoryData();
  }, [categoryId]);
}

// Hook for preloading specific product data
export function useProductPreload(productId?: string) {
  useEffect(() => {
    if (!productId) return;

    const preloadProductData = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const websiteId = process.env.NEXT_PUBLIC_WEBSITE_ID;
        const apiBase = `${baseUrl}/website/${websiteId}`;

        // Preload specific product - from product.service.ts: getProductById(product_id)
        fetch(`${apiBase}/products/${productId}`, { 
          method: 'HEAD',
          headers: {
            'Content-Type': 'application/json',
          }
        });

      } catch (error) {
        console.debug('Product preload failed:', error);
      }
    };

    preloadProductData();
  }, [productId]);
} 