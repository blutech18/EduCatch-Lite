import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/", "/login", "/register", "/setup"];

// Role-based route mapping
const ROLE_ROUTES: Record<string, string[]> = {
  student: ["/dashboard", "/lessons", "/plan"],
  teacher: ["/teacher"],
  admin: ["/admin"],
};

// Default home per role
const ROLE_HOME: Record<string, string> = {
  student: "/dashboard",
  teacher: "/teacher",
  admin: "/admin",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // Allow static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // static files like favicon, images
  ) {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionToken = request.cookies.get("session_token")?.value;
  const userRole = request.cookies.get("user_role")?.value;

  // No session → redirect to login
  if (!sessionToken || !userRole) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Check role-based access
  const allowedPrefixes = ROLE_ROUTES[userRole];
  if (allowedPrefixes) {
    const hasAccess = allowedPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
    );

    if (!hasAccess) {
      // Redirect to their role's home page
      const homeUrl = new URL(ROLE_HOME[userRole] || "/login", request.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
