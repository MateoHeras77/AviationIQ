import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, UserRole } from "./types";

// =============================================================================
// Permission actions that can be checked against roles
// =============================================================================

export type PermissionAction =
  | "full_access"
  | "manage_station"
  | "manage_grooming"
  | "approve_damage_final"
  | "approve_damage_first"
  | "assign_agents"
  | "log_events"
  | "submit_damage_report"
  | "view_assignments"
  | "read_only"
  | "view_analytics"
  | "view_portal"
  | "manage_settings"
  | "manage_users";

// =============================================================================
// Role permission matrix
// =============================================================================

const rolePermissions: Record<UserRole, PermissionAction[]> = {
  admin: [
    "full_access",
    "manage_station",
    "manage_grooming",
    "approve_damage_final",
    "approve_damage_first",
    "assign_agents",
    "log_events",
    "submit_damage_report",
    "view_assignments",
    "read_only",
    "view_analytics",
    "view_portal",
    "manage_settings",
    "manage_users",
  ],
  station_manager: [
    "manage_station",
    "manage_grooming",
    "approve_damage_final",
    "assign_agents",
    "log_events",
    "submit_damage_report",
    "view_assignments",
    "view_analytics",
    "manage_users",
  ],
  supervisor: [
    "approve_damage_first",
    "assign_agents",
    "log_events",
    "submit_damage_report",
    "view_assignments",
  ],
  agent: [
    "log_events",
    "submit_damage_report",
    "view_assignments",
  ],
  airline_client: [
    "read_only",
    "view_portal",
  ],
};

// =============================================================================
// Role hierarchy (higher index = more permissions)
// =============================================================================

const roleHierarchy: UserRole[] = [
  "airline_client",
  "agent",
  "supervisor",
  "station_manager",
  "admin",
];

// =============================================================================
// Helper functions
// =============================================================================

/**
 * Extract user_role from Supabase JWT claims (app_metadata).
 * Falls back to "agent" if not set.
 */
export async function getUserRole(
  supabase: SupabaseClient<Database>
): Promise<UserRole> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Not authenticated");
  }

  return (user.app_metadata?.user_role as UserRole) ?? "agent";
}

/**
 * Extract organization_id from Supabase JWT claims (app_metadata).
 */
export async function getUserOrgId(
  supabase: SupabaseClient<Database>
): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Not authenticated");
  }

  const orgId = user.app_metadata?.organization_id as string | undefined;

  if (!orgId) {
    throw new Error("User has no organization_id in JWT claims");
  }

  return orgId;
}

/**
 * Check if a role has permission for a given action.
 */
export function hasPermission(
  role: UserRole,
  action: PermissionAction
): boolean {
  const permissions = rolePermissions[role];
  return permissions.includes(action) || permissions.includes("full_access");
}

/**
 * Check if a role meets a minimum role level in the hierarchy.
 */
export function meetsMinimumRole(
  userRole: UserRole,
  minimumRole: UserRole
): boolean {
  const userIndex = roleHierarchy.indexOf(userRole);
  const minimumIndex = roleHierarchy.indexOf(minimumRole);
  return userIndex >= minimumIndex;
}

/**
 * Get display label for a role.
 */
export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    admin: "Administrator",
    station_manager: "Station Manager",
    supervisor: "Supervisor",
    agent: "Agent",
    airline_client: "Airline Client",
  };
  return labels[role];
}
