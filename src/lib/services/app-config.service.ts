import { serverWebsiteService } from "@/lib/services/website.service";
import { DEFAULT_APPCONFIG } from "@/lib/constants/pwa";
import type { AppConfig } from "@/lib/types/app";
import { headers } from "next/headers";

export async function getAppConfigDirect(): Promise<AppConfig> {
  try {
    const headersList = await headers();
    const websiteId =
      headersList.get("x-website-id") || process.env.NEXT_PUBLIC_WEBSITE_ID;

    if (!websiteId) {
      return DEFAULT_APPCONFIG;
    }

    const { getWebsite } = serverWebsiteService();
    const website = await getWebsite({
      id: websiteId,
    });
    
    return {
      appName: website.name,
      shortName: website.name,
      description: website.description,
      themeColor: "black",
      backgroundColor: "white",
      url: website.url,
      icon192: `${website.url}${website?.image}`,
      icon512: `${website.url}${website?.image}`,
      favicon: `${website.url}${website?.favicon}`,
      gaId: website.google_analytics?.gaId || null,
      keywords: website.keywords || ["crafter", "minecraft", "cms"],
      tawkto: website.tawkto || null,
    };
  } catch {
    return DEFAULT_APPCONFIG;
  }
}
