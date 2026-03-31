"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plane,
  Sparkles,
  AlertTriangle,
  Package,
  Users,
  Settings,
  BarChart3,
  Menu,
  ChevronLeft,
  LogOut,
  User,
  LayoutDashboard,
  MapPin,
} from "lucide-react";

// =============================================================================
// Types
// =============================================================================

interface UserProfile {
  full_name: string;
  role: string;
  station_id: string | null;
}

interface StationInfo {
  id: string;
  airport_code: string;
  airport_name: string;
}

// =============================================================================
// Constants
// =============================================================================

const STATION_STORAGE_KEY = "aviationiq_current_station";

const navItems = [
  { href: "/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/turnaround", label: "Turnaround", icon: Plane },
  { href: "/grooming", label: "Grooming", icon: Sparkles },
  { href: "/damage", label: "Damage Reports", icon: AlertTriangle },
  { href: "/baggage", label: "Baggage", icon: Package },
  { href: "/workforce", label: "Workforce", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

function SidebarNav({
  collapsed,
  onLinkClick,
}: {
  collapsed: boolean;
  onLinkClick?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-2 py-2">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onLinkClick}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatRoleLabel(role: string): string {
  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stations, setStations] = useState<StationInfo[]>([]);
  const [currentStationId, setCurrentStationId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STATION_STORAGE_KEY) ?? "";
    }
    return "";
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loaded) return;
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;

      const orgId = data.user.app_metadata?.organization_id;
      const [profileRes, stationsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, role, station_id")
          .eq("id", data.user.id)
          .single(),
        orgId
          ? supabase
              .from("stations")
              .select("id, airport_code, airport_name")
              .eq("organization_id", orgId)
              .eq("is_active", true)
              .order("airport_code")
          : Promise.resolve({ data: [] as StationInfo[] }),
      ]);

      const profileData = profileRes.data;
      const stationData = stationsRes.data ?? [];

      // Batch all state updates together
      if (profileData) setProfile(profileData);
      setStations(stationData);

      if (!currentStationId && profileData?.station_id) {
        setCurrentStationId(profileData.station_id);
        localStorage.setItem(STATION_STORAGE_KEY, profileData.station_id);
      }

      setLoaded(true);
    });
  }, [loaded, currentStationId]);

  function handleStationChange(stationId: string) {
    setCurrentStationId(stationId);
    localStorage.setItem(STATION_STORAGE_KEY, stationId);
  }

  const currentStation = stations.find((s) => s.id === currentStationId);

  async function handleLogout() {
    localStorage.removeItem(STATION_STORAGE_KEY);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r bg-card transition-all duration-200",
          sidebarCollapsed ? "w-16" : "w-60"
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center justify-between px-3 border-b">
          {!sidebarCollapsed && (
            <Link href="/overview" className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-primary" />
              <span className="font-bold text-lg">AviationIQ</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform",
                sidebarCollapsed && "rotate-180"
              )}
            />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <SidebarNav collapsed={sidebarCollapsed} />
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header bar */}
        <header className="flex h-14 items-center justify-between border-b bg-card px-4">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden h-8 w-8">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-60 p-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex h-14 items-center px-4 border-b">
                  <Link
                    href="/overview"
                    className="flex items-center gap-2"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Plane className="h-5 w-5 text-primary" />
                    <span className="font-bold text-lg">AviationIQ</span>
                  </Link>
                </div>
                <SidebarNav
                  collapsed={false}
                  onLinkClick={() => setMobileOpen(false)}
                />
              </SheetContent>
            </Sheet>
            {/* Station name */}
            <div className="hidden sm:flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                {currentStation
                  ? `${currentStation.airport_code} - ${currentStation.airport_name}`
                  : "Select station"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Station selector (for multi-station users) */}
            {stations.length > 1 && (
              <Select
                value={currentStationId}
                onValueChange={handleStationChange}
              >
                <SelectTrigger
                  className="h-9 w-[180px] hidden sm:flex"
                  aria-label="Select station"
                >
                  <SelectValue placeholder="Select station" />
                </SelectTrigger>
                <SelectContent>
                  {stations.map((station) => (
                    <SelectItem key={station.id} value={station.id}>
                      {station.airport_code} - {station.airport_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 h-9 px-2"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs">
                      {profile ? getInitials(profile.full_name) : "..."}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm font-medium">
                    {profile?.full_name ?? ""}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {profile && (
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{profile.full_name}</p>
                    <Badge
                      variant="secondary"
                      className="mt-1 text-xs"
                    >
                      {formatRoleLabel(profile.role)}
                    </Badge>
                  </div>
                )}
                <DropdownMenuSeparator />
                {/* Mobile station selector */}
                {stations.length > 1 && (
                  <>
                    <div className="px-2 py-1.5 sm:hidden">
                      <p className="text-xs text-muted-foreground mb-1">
                        Station
                      </p>
                      {stations.map((station) => (
                        <DropdownMenuItem
                          key={station.id}
                          onClick={() => handleStationChange(station.id)}
                          className={cn(
                            "flex items-center gap-2 text-sm",
                            station.id === currentStationId && "font-semibold"
                          )}
                        >
                          <MapPin className="h-3 w-3" />
                          {station.airport_code} - {station.airport_name}
                        </DropdownMenuItem>
                      ))}
                    </div>
                    <DropdownMenuSeparator className="sm:hidden" />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
