import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const { pathname } = req.nextUrl;

    // ── Already logged in → redirect away from /login ─────────────────────
    if (pathname === "/login" && token) {
      if (token.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      if (token.role === "PROVIDER") {
        return NextResponse.redirect(new URL("/provider", req.url));
      }
      // CUSTOMER → home
      return NextResponse.redirect(new URL("/", req.url));
    }

    // ── Admin routes: ADMIN only ───────────────────────────────────────────
    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(
        new URL("/login?error=unauthorized", req.url)
      );
    }

    // ── Provider routes: PROVIDER only ────────────────────────────────────
    if (pathname.startsWith("/provider") && token?.role !== "PROVIDER") {
      return NextResponse.redirect(
        new URL("/login?error=unauthorized", req.url)
      );
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Allow public access to everything except /admin and /provider
      // (those require a valid JWT to even enter the middleware function)
      authorized: ({ req, token }) => {
        const pathname = req.nextUrl.pathname;
        if (
          pathname.startsWith("/admin") ||
          pathname.startsWith("/provider")
        ) {
          return !!token;
        }
        return true; // /login, /, and all other routes are public
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/provider/:path*",
    "/login",
  ],
};
