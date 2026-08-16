import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { User } from "../models/User.js";

export function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Sign in to continue." });
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ error: "That account no longer exists." });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Your session expired. Sign in again." });
  }
}

/** Use after requireAuth. */
export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "That action needs an admin account." });
  }
  next();
}
