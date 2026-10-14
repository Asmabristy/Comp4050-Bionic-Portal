
import { supabase } from "../supabase.js";

/**
 * Supabase Auth issues access tokens.
 * The browser sends the token using:
 *
 * Authorization: Bearer <token>
 */

/**
 * Shape an authenticated user for the existing API contract.
 */
export function toPublicUser(authUser, profile) {
  return {
    id: authUser.id,
    email: authUser.email,
    name: profile?.name || authUser.user_metadata?.name || "",
    role: profile?.role || "operator",
  };
}

/**
 * Verify Supabase authentication, email confirmation,
 * and the existence of the user's database profile.
 */
export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        error: "Sign in to continue.",
      });
    }

    // Validate the token and retrieve the authenticated user.
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({
        error: "Your session expired. Sign in again.",
      });
    }

    const authUser = data.user;

    // Require email verification for all accounts.
    // Existing confirmed Supervisor accounts remain unaffected.
    if (!authUser.email_confirmed_at) {
      return res.status(403).json({
        error: "Please verify your email before continuing.",
      });
    }

    // Retrieve the user's trusted database role.
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("name, role")
      .eq("id", authUser.id)
      .maybeSingle();

    if (profileError) {
      console.error(
        "[auth] Could not retrieve user profile:",
        profileError.message
      );

      return res.status(503).json({
        error: "Unable to verify your account. Please try again.",
      });
    }

    if (!profile) {
      return res.status(401).json({
        error: "That account no longer exists.",
      });
    }

    req.user = toPublicUser(authUser, profile);
    req.accessToken = token;

    next();
  } catch (error) {
    console.error("[auth] Authentication error:", error);

    return res.status(503).json({
      error: "Authentication is temporarily unavailable.",
    });
  }
}

/*
 * Roles are ranked, not a set of unrelated labels.
 *
 * Operator   = 1
 * Supervisor = 2
 * Admin      = 3
 *
 * Supervisors can perform Operator actions.
 * Admins can perform both Supervisor and Operator actions.
 */
const RANK = {
  operator: 1,
  supervisor: 2,
  admin: 3,
};

export function hasAtLeast(role, minimum) {
  return (RANK[role] || 0) >= (RANK[minimum] || 0);
}

/**
 * Use after requireAuth.
 * Only Supervisors and Admins can run the packing algorithm.
 */
export function requireSupervisor(req, res, next) {
  if (!hasAtLeast(req.user?.role, "supervisor")) {
    return res.status(403).json({
      error: "Only supervisors can run the packing algorithm.",
    });
  }

  next();
}

/**
 * Use after requireAuth.
 * Reserved for Admin-only actions.
 */
export function requireAdmin(req, res, next) {
  if (!hasAtLeast(req.user?.role, "admin")) {
    return res.status(403).json({
      error: "That action needs an admin account.",
    });
  }

  next();
}
