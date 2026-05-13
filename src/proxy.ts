import { NextRequest, NextResponse } from "next/server";
import { AUTH_ACCESS_COOKIE } from "@/lib/auth-cookies";

export const config = {
  matcher: ["/admin", "/admin/:path*"]
};

export function proxy(request: NextRequest) {
  if (request.cookies.has(AUTH_ACCESS_COOKIE)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  const lang = request.nextUrl.searchParams.get("lang");

  loginUrl.searchParams.set("next", nextPath);

  if (lang === "ja" || lang === "en") {
    loginUrl.searchParams.set("lang", lang);
  }

  return NextResponse.redirect(loginUrl);
}
