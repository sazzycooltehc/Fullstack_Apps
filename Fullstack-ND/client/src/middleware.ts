// middleware.ts (in root)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  console.log("Middleware triggered for:", request.nextUrl.pathname);
  const isFormSubmitted = request.cookies.get("form_submitted");

  if (!isFormSubmitted && request.nextUrl.pathname.startsWith("/result")) {
    return NextResponse.redirect(new URL("/data", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/result/:path*"],
};
