import type { AppConfig } from "../types/app";

export const DEFAULT_APPCONFIG: AppConfig = {
  appName: "Crafter Minecraft CMS",
  shortName: "Crafter",
  description: "Crafter is extended Minecraft CMS Service",
  themeColor: "#000000",
  backgroundColor: "#ffffff",
  icon192: "https://crafter.net.tr/assets/favicon.ico",
  icon512: "https://crafter.net.tr/assets/favicon.ico",
  favicon: "https://crafter.net.tr/assets/favicon.ico",
  gaId: null,
  keywords: ["crafter", "website"],
  tawkto: null,
};

export const DEFAULT_MANIFEST = {
  name: "Crafter Minecraft CMS",
  short_name: "Crafter",
  description: "Crafter is extended Minecraft CMS Service",
  start_url: "/",
  display: "standalone",
  background_color: "#ffffff",
  theme_color: "#000000",
  orientation: "portrait-primary",
  url: "https://crafter.net.tr",
  icons: [
    {
      src: "https://crafter.net.tr/assets/favicon.ico",
      sizes: "192x192",
      type: "image/png",
      purpose: "maskable any",
    },
    {
      src: "https://crafter.net.tr/assets/favicon.ico",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable any",
    },
  ],
};
