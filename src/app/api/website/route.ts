import { NextResponse } from "next/server";
import { serverWebsiteService } from "@/lib/services/website.service";
import { headers } from "next/headers";

export async function GET() {
  const { getWebsiteById } = serverWebsiteService();
  const headersList = await headers();
  const websiteId = headersList.get("x-website-id") || "";
  console.log("Website ID in API Route:", websiteId);
  try {
    const website = await getWebsiteById(websiteId);

    let secureWebsite = {
      id: website.id,
      name: website.name,
      url: website.url,
      description: website.description,
      favicon: website.favicon,
      image: website.image,
      keywords: website.keywords,
      google_analytics: website.google_analytics,
      sliders: website.sliders,
      discord: website.discord,
      servers: website.servers,
      broadcast_items: website.broadcast_items,
      social_media: website.social_media,
      server_info: website.server_info,
      security: website.security,
      theme: website.theme,
      maintenance: website.maintenance,
      createdAt: website.createdAt,
      updatedAt: website.updatedAt,
    };

    return NextResponse.json({
      success: true,
      website: secureWebsite,
      isExpired: false,
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      error && error.status
        ? error
        : {
            success: false,
            message:
              "Website bilgileri alınamadı, lütfen https://crafter.net.tr/ adresini ziyaret edin.",
          },
      { status: error?.status || 500 }
    );
  }
}
