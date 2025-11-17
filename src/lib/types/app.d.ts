export interface AppConfig {
  appName: string;
  shortName: string;
  description: string;
  themeColor: string;
  backgroundColor: string;
  url?: string;
  icon192: string;
  icon512: string;
  favicon: string;
  gaId: string | null;
  keywords: string[];
  tawkto: {
    isActive: boolean;
    propertyId: string;
    chatId: string;
  } | null;
}

export interface ManifestIcon {
  src: string;
  sizes: string;
  type: string;
  purpose: string;
}

export interface PWAManifest {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  display: string;
  background_color: string;
  theme_color: string;
  orientation: string;
  icons: ManifestIcon[];
}
