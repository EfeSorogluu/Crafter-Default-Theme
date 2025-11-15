import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set("x-current-path", request.nextUrl.pathname);
  const websiteId = headers.get("x-website-id");
  
  // _next isteklerini her zaman geçir
  if (request.nextUrl.pathname.startsWith("/_next")) {
    return NextResponse.next({ headers });
  }

  if (websiteId) {
    headers.set("x-website-id", websiteId);
  } else {
    return NextResponse.redirect("https://crafter.net.tr");
  }

  return NextResponse.next({ headers });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next (Next.js internals)
     * - favicon.ico (favicon file)
     * - Static files and images
     */
    "/((?!api/|_next/|.*\\..*).*)",
  ],
};