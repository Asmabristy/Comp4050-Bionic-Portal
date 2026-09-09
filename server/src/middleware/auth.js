import { supabase } from "../supabase.js";

/**
 * Supabase Auth issues the tokens now, so there is nothing for us to sign.
 * The browser sends the access token from its Supabase session as a normal
 * `Authorization: Bearer <token>` header, exactly as before.
 */

/** Shape a profile row the way the API has always returned a user. */
export function toPublicUser(authUser, profile) {
  return {
    id: authUser.id,
    email: authUser.email,
    name: profile?.name || authUser.user_metadata?.name || "",
    role: profile?.role || "operator",
  };
}

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Sign in to continue." });
  }

  // Supabase verifies the token's signature and expiry for us.
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    return res.status(401).json({ error: "Your session expired. Sign in again." });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile) {
    return res.status(401).json({ error: "That account no longer exists." });
  }

  req.user = toPublicUser(data.user, profile);
  req.accessToken = token;
  next();
}

/** Use after requireAuth. */
export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "That action needs an admin account." });
  }
  next();
}

/** Use after requireAuth. */
export function requireSupervisor(req, res, next) {
  if (req.user?.role !== "supervisor") {
    return res.status(403).json({
      error: "Only supervisors can run the packing algorithm.",
    });
  }

  next();
}
