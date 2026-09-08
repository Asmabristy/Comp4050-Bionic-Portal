import { Router } from "express";
import { User } from "../models/User.js";
import { signToken, requireAuth } from "../middleware/auth.js";
import { asyncRoute, HttpError } from "../middleware/errors.js";

export const authRouter = Router();

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

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw new HttpError(409, "That email is already registered.");

    const user = await User.create({
      email,
      name,
      passwordHash: await User.hashPassword(password),
    });

    res.status(201).json({ token: signToken(user), user: user.toPublic() });
  })
);

/** POST /api/auth/login — exchange credentials for a token. */
authRouter.post(
  "/login",
  asyncRoute(async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) throw new HttpError(400, "Enter your email and password.");

    const user = await User.findOne({ email: email.toLowerCase() });
    // Same message either way so this can't be used to find valid emails.
    if (!user || !(await user.checkPassword(password))) {
      throw new HttpError(401, "That email and password don't match.");
    }

    res.json({ token: signToken(user), user: user.toPublic() });
  })
);

/** GET /api/auth/me — who is this token for. */
authRouter.get(
  "/me",
  requireAuth,
  asyncRoute(async (req, res) => {
    res.json({ user: req.user.toPublic() });
  })
);
