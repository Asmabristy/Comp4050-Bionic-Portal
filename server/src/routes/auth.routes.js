
import { Router } from "express";
import { supabase, signInClient, signUpClient } from "../supabase.js";
import { requireAuth, toPublicUser } from "../middleware/auth.js";
import { asyncRoute, HttpError } from "../middleware/errors.js";
import { isStrongPassword, PASSWORD_RULE } from "../passwordPolicy.js";

export const authRouter = Router();

/*
 * Supabase Auth manages user accounts, passwords and email confirmation.
 *
 * New Operators must verify their email before logging in.
 * Existing confirmed Supervisor accounts continue to log in normally.
 *
 * Successful login and refresh requests retain the existing API contract:
 * { token, refreshToken, user }
 */

function isEmailConfirmed(user) {
  return Boolean(user?.email_confirmed_at);
}

/**
 * POST /api/auth/register
 *
 * Register a new Operator and request email verification.
 *
 * The database trigger on auth.users automatically creates the
 * corresponding profile with the "operator" role.
 */
authRouter.post(
  "/register",
  asyncRoute(async (req, res) => {
    const { email, name, password } = req.body || {};

    if (!email || !name || !password) {
      throw new HttpError(
        400,
        "Enter a name, email, and password."
      );
    }

    if (!isStrongPassword(password)) {
      throw new HttpError(400, PASSWORD_RULE);
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const normalizedName = String(name).trim();

    if (!normalizedEmail || !normalizedName) {
      throw new HttpError(
        400,
        "Enter a valid name and email."
      );
    }

    const { data, error } = await signUpClient().auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          name: normalizedName,
        },
      },
    });

    if (error) {
      if (/already|exists|registered/i.test(error.message)) {
        throw new HttpError(
          409,
          "That email is already registered."
        );
      }

      throw new HttpError(400, error.message);
    }

    /*
     * Email confirmation must be enabled in Supabase.
     * With confirmation enabled, signUp returns no session.
     *
     * Do not expose the returned user ID, since Supabase
     * may return an obfuscated user for duplicate signups.
     */
    if (data?.session) {
      console.error(
        "[auth] Registration unexpectedly returned a session. " +
        "Check Supabase Confirm Email settings."
      );

      throw new HttpError(
        503,
        "Email verification is not configured correctly. " +
        "Please contact support."
      );
    }

    res.status(201).json({
      requiresEmailVerification: true,
      message:
        "If this email can be registered, a verification link will be sent. " +
        "Please check your inbox before signing in.",
    });
  })
);

/**
 * POST /api/auth/login
 *
 * Authenticate a confirmed user and return Supabase tokens.
 */
authRouter.post(
  "/login",
  asyncRoute(async (req, res) => {
    const { email, password } = req.body || {};

    if (!email || !password) {
      throw new HttpError(
        400,
        "Enter your email and password."
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const { data, error } =
      await signInClient().auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

    if (error || !data?.session || !data?.user) {
      throw new HttpError(
        401,
        "Invalid credentials or email not yet verified."
      );
    }

    if (!isEmailConfirmed(data.user)) {
      throw new HttpError(
        403,
        "Please verify your email before signing in."
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("name, role")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError || !profile) {
      throw new HttpError(
        401,
        "That account is not available."
      );
    }

    res.json({
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: toPublicUser(data.user, profile),
    });
  })
);

/**
 * POST /api/auth/refresh
 *
 * Exchange a refresh token for a new access token.
 *
 * Supabase access tokens expire periodically, so this endpoint
 * keeps valid users signed in without requiring another login.
 */
authRouter.post(
  "/refresh",
  asyncRoute(async (req, res) => {
    const { refreshToken } = req.body || {};

    if (!refreshToken) {
      throw new HttpError(
        400,
        "No refresh token supplied."
      );
    }

    const { data, error } =
      await signInClient().auth.refreshSession({
        refresh_token: refreshToken,
      });

    if (error || !data?.session || !data?.user) {
      throw new HttpError(
        401,
        "Your session expired. Sign in again."
      );
    }

    if (!isEmailConfirmed(data.user)) {
      throw new HttpError(
        403,
        "Please verify your email before continuing."
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("name, role")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError || !profile) {
      throw new HttpError(
        401,
        "That account no longer exists."
      );
    }

    res.json({
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: toPublicUser(data.user, profile),
    });
  })
);

/**
 * GET /api/auth/me
 *
 * Return the authenticated user.
 */
authRouter.get(
  "/me",
  requireAuth,
  asyncRoute(async (req, res) => {
    res.json({ user: req.user });
  })
);
