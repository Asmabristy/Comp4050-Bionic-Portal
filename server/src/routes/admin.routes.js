import { Router } from "express";
import * as profileStore from "../data/profiles.js";
import { requireAuth, requireSupervisor } from "../middleware/auth.js";
import { asyncRoute, HttpError } from "../middleware/errors.js";

export const adminRouter = Router();

// Everything here is supervisor-only, enforced on the server rather than
// relying on the Administration page being hidden in the UI.
adminRouter.use(requireAuth, requireSupervisor);

const ROLES = ["operator", "supervisor", "admin"];

/** GET /api/admin/users — everyone with an account. */
adminRouter.get(
  "/users",
  asyncRoute(async (req, res) => {
    const users = await profileStore.listAll();

    res.json({ users });
  })
);

/** PATCH /api/admin/users/:id — change someone's role. */
adminRouter.patch(
  "/users/:id",
  asyncRoute(async (req, res) => {
    const { role } = req.body || {};

    if (!ROLES.includes(role)) {
      throw new HttpError(400, `Role must be one of: ${ROLES.join(", ")}.`);
    }

    const target = await profileStore.findById(req.params.id);

    if (!target) {
      throw new HttpError(404, "That user doesn't exist.");
    }

    // Losing your own supervisor rights mid-session locks you out of this page,
    // and there may be no other supervisor left to undo it.
    if (target.id === req.user.id && role !== "supervisor") {
      throw new HttpError(
        400,
        "You can't remove your own supervisor access. Ask another supervisor."
      );
    }

    const user = await profileStore.setRole(req.params.id, role);

    res.json({ user });
  })
);
