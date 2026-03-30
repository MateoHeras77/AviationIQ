"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const settingsTabs = [
  { href: "/dashboard/settings/organization", label: "Organization" },
  { href: "/dashboard/settings/users", label: "Users" },
  { href: "/dashboard/settings/aircraft", label: "Aircraft Registry" },
  { href: "/dashboard/settings/sla", label: "SLA Configuration" },
  { href: "/dashboard/settings/notifications", label: "Notifications" },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const activeTab =
    settingsTabs.find(
      (tab) => pathname === tab.href || pathname.startsWith(tab.href + "/")
    )?.href ?? settingsTabs[0].href;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your organization settings and preferences
        </p>
      </div>

      <div className="overflow-x-auto">
        <nav className="flex gap-1 border-b">
          {settingsTabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition-colors",
                activeTab === tab.href
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground"
              )}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>

      <div>{children}</div>
    </div>
  );
}
