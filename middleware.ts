import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import type { UserRole } from "@/lib/supabase/types";

const routeAccess: Record<string, UserRole[]> = {
  "/dashboard/settings": ["admin"],
  "/dashboard/turnaround": ["admin", "station_manager", "supervisor", "agent"],
  "/dashboard/grooming": ["admin", "station_manager", "supervisor", "agent"],
  "/dashboard/damage": ["admin", "station_manager", "supervisor", "agent"],
  "/dashboard/baggage": ["admin", "station_manager", "supervisor", "agent"],
  "/dashboard/workforce": ["admin", "station_manager", "supervisor"],
  "/dashboard/portal": ["admin", "airline_client"],
  "/dashboard/analytics": ["admin", "station_manager"],
};

export async function middleware(request: NextRequest) {
  const { user, supabaseResponse } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Redirect authenticated users away from auth pages
  if (user && (pathname === "/login" || pathname === "/register")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Protect all /dashboard routes — redirect unauthenticated users to /login
  if (pathname.startsWith("/dashboard") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // Role-based route access for authenticated users on /dashboard
  if (pathname.startsWith("/dashboard") && user) {
    const userRole =
      (user.app_metadata?.user_role as UserRole) ?? "agent";

    // Check role-based access for specific routes
    for (const [route, allowedRoles] of Object.entries(routeAccess)) {
      if (pathname === route || pathname.startsWith(route + "/")) {
        if (!allowedRoles.includes(userRole)) {
          const url = request.nextUrl.clone();
          url.pathname = "/dashboard";
          return NextResponse.redirect(url);
        }
        break;
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
