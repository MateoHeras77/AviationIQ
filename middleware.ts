import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import type { UserRole } from "@/lib/supabase/types";

// =============================================================================
// Protected routes and their allowed roles
// =============================================================================

const routeAccess: Record<string, UserRole[]> = {
  "/overview": ["admin", "station_manager", "supervisor", "agent"],
  "/settings": ["admin", "station_manager"],
  "/analytics": ["admin", "station_manager", "airline_client"],
  "/portal": ["admin", "airline_client"],
  "/turnaround": ["admin", "station_manager", "supervisor", "agent"],
  "/grooming": ["admin", "station_manager", "supervisor", "agent"],
  "/damage": ["admin", "station_manager", "supervisor", "agent"],
  "/baggage": ["admin", "station_manager", "supervisor", "agent"],
  "/workforce": ["admin", "station_manager", "supervisor"],
};

// All protected route prefixes
const protectedPrefixes = Object.keys(routeAccess);

function isProtectedRoute(pathname: string): boolean {
  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );
}

function getDefaultRoute(role: UserRole): string {
  return role === "airline_client" ? "/portal" : "/overview";
}

// =============================================================================
// Middleware
// =============================================================================

export async function middleware(request: NextRequest) {
  const { user, supabaseResponse } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Redirect authenticated users away from login
  if (user && pathname === "/login") {
    const userRole = (user.app_metadata?.user_role as UserRole) ?? "agent";
    const url = request.nextUrl.clone();
    url.pathname = getDefaultRoute(userRole);
    return NextResponse.redirect(url);
  }

  // Protect app routes — redirect unauthenticated users to /login
  if (isProtectedRoute(pathname) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // Role-based access for authenticated users
  if (isProtectedRoute(pathname) && user) {
    const userRole = (user.app_metadata?.user_role as UserRole) ?? "agent";

    for (const [route, allowedRoles] of Object.entries(routeAccess)) {
      if (pathname === route || pathname.startsWith(route + "/")) {
        if (!allowedRoles.includes(userRole)) {
          const url = request.nextUrl.clone();
          url.pathname = getDefaultRoute(userRole);
          return NextResponse.redirect(url);
        }
        break;
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/overview/:path*",
    "/turnaround/:path*",
    "/grooming/:path*",
    "/damage/:path*",
    "/baggage/:path*",
    "/workforce/:path*",
    "/settings/:path*",
    "/analytics/:path*",
    "/portal/:path*",
    "/login",
  ],
};
