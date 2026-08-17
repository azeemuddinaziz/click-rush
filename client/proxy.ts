import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const protectedRoutes = ["/hello"];
const authRoutes = ["/login", "/signup"];

export function proxy(req: NextRequest) {
  const hasToken = req.cookies.has("token");
  const { pathname } = req.nextUrl;

  if (
    protectedRoutes.some((route) => pathname.startsWith(route)) &&
    !hasToken
  ) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (authRoutes.includes(pathname) && hasToken) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/signup"],
};
