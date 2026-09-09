import { Router } from "express";
import { supabase, signInClient } from "../supabase.js";
import { requireAuth, toPublicUser } from "../middleware/auth.js";
import { asyncRoute, HttpError } from "../middleware/errors.js";

export const authRouter = Router();

/*
 * Supabase Auth owns accounts and passwords now, but the API contract is
 * unchanged: the browser still posts { email, password } and gets back
 * { token, user }. The token is Supabase's access token instead of one we
 * signed ourselves, so the web app and FitVisualizer need no changes.
 */

/** POST /api/auth/register — create an account. */
authRouter.post(
  "/register",
  asyncRoute(async (req, res) => {
    const { email, name, password } = req.body || {};

    if (!email || !name || !password) {
      throw new HttpError(400, "Enter a name, email, and password.");
    }

    const strongPassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,}$/;

    if (!strongPassword.test(password)) {
      throw new HttpError(
        400,
        "Password must be at least 8 characters and include an uppercase letter, lowercase letter, number, and special character."
      );
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: String(email).toLowerCase().trim(),
      password,
      email_confirm: true,
      user_metadata: { name: String(name).trim() },
    });

    if (error) {
      if (/already|exists|registered/i.test(error.message)) {
        throw new HttpError(409, "That email is already registered.");
      }
      throw new HttpError(400, error.message);
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      email: data.user.email,
      name: String(name).trim(),
      role: "operator",
    });

    if (profileError) {
      // Don't leave an auth user with no profile behind.
      await supabase.auth.admin.deleteUser(data.user.id);
      throw new HttpError(500, `Could not create profile: ${profileError.message}`);
    }

    const session = await signInClient().auth.signInWithPassword({
      email: data.user.email,
      password,
    });

    res.status(201).json({
      token: session.data?.session?.access_token,
      user: toPublicUser(data.user, { name: String(name).trim(), role: "operator" }),
    });
  })
);

/** POST /api/auth/login — exchange credentials for a token. */
authRouter.post(
  "/login",
  asyncRoute(async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) throw new HttpError(400, "Enter your email and password.");

    const { data, error } = await signInClient().auth.signInWithPassword({
      email: String(email).toLowerCase().trim(),
      password,
    });

    // Same message either way so this can't be used to find valid emails.
    if (error || !data?.session) {
      throw new HttpError(401, "That email and password don't match.");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("name, role")
      .eq("id", data.user.id)
      .maybeSingle();

    res.json({
      token: data.session.access_token,
      user: toPublicUser(data.user, profile),
    });
  })
);

/** GET /api/auth/me — who is this token for. */
authRouter.get(
  "/me",
  requireAuth,
  asyncRoute(async (req, res) => {
    res.json({ user: req.user });
  })
);
