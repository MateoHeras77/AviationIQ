import { createClient } from "./server";
import type { Profile, UserRole } from "./types";
import { meetsMinimumRole } from "./roles";

// =============================================================================
// Types
// =============================================================================

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  organizationId: string;
  profile: Profile;
}

export interface SessionResult {
  user: AuthenticatedUser | null;
  error: string | null;
}

// =============================================================================
// Server-side session helpers
// =============================================================================

/**
 * Get the current authenticated user with their profile and role information.
 * Returns null if not authenticated rather than throwing.
 */
export async function getAuthenticatedUser(): Promise<SessionResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { user: null, error: "Not authenticated" };
    }

    const role = (user.app_metadata?.user_role as UserRole) ?? "agent";
    const organizationId = user.app_metadata?.organization_id as
      | string
      | undefined;

    if (!organizationId) {
      return { user: null, error: "User has no organization_id" };
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profileData) {
      return { user: null, error: "Profile not found" };
    }

    const profile = profileData as Profile;

    return {
      user: {
        id: user.id,
        email: user.email ?? profile.email,
        role,
        organizationId,
        profile,
      },
      error: null,
    };
  } catch {
    return { user: null, error: "Failed to get authenticated user" };
  }
}

/**
 * Server-side guard that throws if the user doesn't have sufficient role.
 * Use this in Server Actions and API routes.
 *
 * @throws Error if not authenticated or insufficient role
 */
export async function requireRole(
  minimumRole: UserRole
): Promise<AuthenticatedUser> {
  const { user, error } = await getAuthenticatedUser();

  if (!user) {
    throw new Error(error ?? "Not authenticated");
  }

  if (!meetsMinimumRole(user.role, minimumRole)) {
    throw new Error(
      `Insufficient permissions. Required: ${minimumRole}, current: ${user.role}`
    );
  }

  return user;
}

/**
 * Server-side guard that throws if the user doesn't have one of the allowed roles.
 * More flexible than requireRole when the hierarchy doesn't apply cleanly.
 *
 * @throws Error if not authenticated or role not in allowed list
 */
export async function requireOneOfRoles(
  allowedRoles: UserRole[]
): Promise<AuthenticatedUser> {
  const { user, error } = await getAuthenticatedUser();

  if (!user) {
    throw new Error(error ?? "Not authenticated");
  }

  if (!allowedRoles.includes(user.role)) {
    throw new Error(
      `Insufficient permissions. Allowed: ${allowedRoles.join(", ")}, current: ${user.role}`
    );
  }

  return user;
}
