import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  // Allow login/api routes unconditionally
  if (url.pathname.startsWith('/login') || url.pathname.startsWith('/api/login')) {
    return NextResponse.next();
  }
  // Check session
  const userCookie = req.cookies.get('user');
  if (!userCookie) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|login|api/login|api|static).*)"],
};
