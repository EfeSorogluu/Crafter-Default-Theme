import type { Metadata, Viewport } from "next";
import { PWAProvider } from "@/lib/context/pwa-provider.context";
import "@/styles/globals.css";
import { DEFAULT_APPCONFIG } from "@/lib/constants/pwa";
import { GoogleAnalytics } from "@next/third-parties/google";
import type { AppConfig } from "@/lib/types/app";
import { ThemeProviderWrapper } from "@/components/ThemeProviderWrapper";
import { getAppConfigDirect } from "@/lib/services/app-config.service";
import Providers from "./providers";
import { headers } from "next/headers";

async function getAppConfig(): Promise<AppConfig> {
  try {
    // Server component'te her zaman direct çağrı yap
    return getAppConfigDirect();
  } catch (error) {
    console.error("getAppConfig error:", error);
    // Varsayılan değerler
    return DEFAULT_APPCONFIG;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const appConfig = await getAppConfig();

  return {
    title: {
      default: appConfig.appName,
      template: `%s | ${appConfig.appName}`,
    },
    description: appConfig.description,
    manifest: "/api/manifest",
    keywords: appConfig.keywords,
    authors: [{ name: appConfig.appName }],
    creator: appConfig.appName,
    publisher: appConfig.appName,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: "tr_TR",
      url: process.env.NEXT_PUBLIC_BASE_URL,
      title: appConfig.appName,
      description: appConfig.description,
      siteName: appConfig.appName,
      images: [
        {
          url: `/api/og?title=${appConfig.appName}&description=${appConfig.description}&logo=${appConfig.icon192}&brand=${appConfig.appName}`,
          width: 1200,
          height: 630,
          alt: appConfig.appName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: appConfig.appName,
      description: appConfig.description,
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/og?title=${appConfig.appName}&description=${appConfig.description}&logo=${appConfig.icon192}&brand=${appConfig.appName}`,
          width: 1200,
          height: 630,
          alt: appConfig.appName,
        },
      ],
    },
    icons: {
      icon: [
        {
          url: appConfig.favicon,
          sizes: "32x32",
          type: "image/x-icon",
        },
        {
          url: appConfig.icon192,
          sizes: "192x192",
          type: "image/png",
        },
      ],
      apple: [
        {
          url: appConfig.icon192,
          sizes: "192x192",
          type: "image/png",
        },
      ],
      shortcut: [appConfig.favicon],
    },
    appleWebApp: {
      capable: true,
      title: appConfig.appName,
      statusBarStyle: "default",
    },
    other: {
      "mobile-web-app-capable": "yes",
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "default",
      "format-detection": "telephone=no",
      "msapplication-TileColor": appConfig.themeColor,
      "msapplication-tap-highlight": "no",
    },
  };
}

export async function generateViewport(): Promise<Viewport> {
  const appConfig = await getAppConfig();

  return {
    themeColor: appConfig.themeColor,
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    minimumScale: 1,
    userScalable: true,
    viewportFit: "cover",
  };
}

interface RootLayoutProps {
  children: React.ReactNode;
}

// RootLayout component'i aynı kalıyor
export default async function RootLayout({ children }: RootLayoutProps) {
  const appConfig = await getAppConfig();
  const headersList = await headers();
  const websiteId = headersList.get("x-website-id") as string;

  return (
    <html lang="tr">
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_BACKEND_URL} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://minotar.net" />
        <link rel="preconnect" href="https://api.crafter.net.tr" />

        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="//api.crafter.net.tr" />
        <link rel="dns-prefetch" href="//minotar.net" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />

        {/* Performance optimizations */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      </head>
      <body>
        <ThemeProviderWrapper>
          <PWAProvider initialConfig={appConfig}>
            <Providers websiteId={websiteId}>{children}</Providers>
          </PWAProvider>
        </ThemeProviderWrapper>
        {appConfig.gaId && <GoogleAnalytics gaId={appConfig.gaId} />}
      </body>
    </html>
  );
}
