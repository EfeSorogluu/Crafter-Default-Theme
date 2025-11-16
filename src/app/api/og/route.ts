import { NextRequest, NextResponse } from 'next/server';
import { generateSEOImage, svgToPng } from '@/lib/functions/ogImage';

// Helper function to check if an image exists and get its content type
async function checkImageExists(url: string): Promise<{ exists: boolean; contentType?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 saniye timeout
    
    const response = await fetch(url, { 
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    const exists = response.ok;
    const contentType = response.headers.get('content-type') || undefined;
    return { exists, contentType };
  } catch (error) { 
    return { exists: false };
  }
}

// Helper function to convert image to PNG and return as data URL
async function convertImageToPngDataUrl(imageUrl: string): Promise<string> {
  try {
    
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const imageBuffer = await response.arrayBuffer();
    const sharp = require("sharp");
    
    // Sharp ile PNG'ye dönüştür
    const pngBuffer = await sharp(Buffer.from(imageBuffer))
      .png()
      .toBuffer();
    
    // Base64'e çevir
    const base64 = Buffer.from(pngBuffer).toString("base64");
    const dataUrl = `data:image/png;base64,${base64}`;
    
    return dataUrl;
  } catch (error) {
    console.error("Resim dönüştürme hatası:", error);
    throw error;
  }
}

// Helper function to get the first available logo URL
async function getAvailableLogoUrl(): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const websiteId = process.env.NEXT_PUBLIC_WEBSITE_ID;
  
  // Try different formats for the logo
  const possiblePaths = [
    // PNG format
    `${baseUrl}/uploads/${websiteId}/website-${websiteId}.png`,
    `${baseUrl}/uploads/website-${websiteId}.png`,
    // WebP format (will be converted to PNG)
    `${baseUrl}/uploads/${websiteId}/website-${websiteId}.webp`,
    `${baseUrl}/uploads/website-${websiteId}.webp`,
    // JPG format
    `${baseUrl}/uploads/${websiteId}/website-${websiteId}.jpg`,
    `${baseUrl}/uploads/website-${websiteId}.jpg`,
    // JPEG format
    `${baseUrl}/uploads/${websiteId}/website-${websiteId}.jpeg`,
    `${baseUrl}/uploads/website-${websiteId}.jpeg`,
  ];
  
  // Check each path in order
  for (const path of possiblePaths) {
    const result = await checkImageExists(path);
    if (result.exists) {
      // Resmi PNG data URL'ine dönüştür
      try {
        const pngDataUrl = await convertImageToPngDataUrl(path);
        return pngDataUrl;
      } catch (error) {
        console.error(`Logo dönüştürme hatası: ${path}`, error);
        continue;
      }
    } else {
    }
  }
  
  // If none exists, return the first PNG path as fallback
  return possiblePaths[0];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // URL parametrelerini al
    const title = searchParams.get('title') || 'CRAFTER';
    const brandName = searchParams.get('brand') || 'CRAFTER';
    const description = searchParams.get('description') || 'Professional hosting solutions for websites, game servers, and applications with robust infrastructure and expert support.';
    const background = searchParams.get('background') || 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';
    
    // Custom logo URL parametresi varsa onu kullan
    const customLogo = searchParams.get('logo');
    let logo: string;
    
    if (customLogo) {
      // Custom logo'yu da PNG'ye dönüştür
      try {
        logo = await convertImageToPngDataUrl(customLogo);
      } catch (error) {
        console.error("Özel logo dönüştürme hatası:", error);
        logo = customLogo; // Hata durumunda orijinal URL'yi kullan
      }
    } else {
      // Get the first available logo URL
      logo = await getAvailableLogoUrl();
    }
    
    // SEO resmi oluştur
    const svg = await generateSEOImage({
      title: decodeURIComponent(title),
      description: description ? decodeURIComponent(description) : undefined,
      logo: logo,
      brandName: brandName,
      background: background,
      width: 1200, // Daha yüksek çözünürlük
      height: 630, // Daha yüksek çözünürlük
      fontFamily: 'Inter',
    });

    // SVG'yi PNG'ye dönüştür
    const pngBuffer = await svgToPng(svg);

    // PNG'yi döndür
    return new NextResponse(pngBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
      },
    });
  } catch (error) {
    console.error('OG resim oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Resim oluşturulamadı' },
      { status: 500 }
    );
  }
}
