
import { Router } from "express";
import { supabase } from "../supabase.js";
import * as profileStore from "../data/profiles.js";
import {
  requireAuth,
  requireSupervisor,
  requireAdmin,
} from "../middleware/auth.js";
import { asyncRoute, HttpError } from "../middleware/errors.js";

export const adminRouter = Router();

// Supervisors and Admins can access Administration.
// Individual operations may enforce stricter permissions.
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
      throw new HttpError(
        400,
        `Role must be one of: ${ROLES.join(", ")}.`
      );
    }

    const target = await profileStore.findById(req.params.id);

    if (!target) {
      throw new HttpError(404, "That user doesn't exist.");
    }

    // Prevent a supervisor from accidentally losing access
    // to the Administration page.
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

/**
 * DELETE /api/admin/users/:id
 *
 * Permanently delete a user account.
 * Admin-only operation.
 *
 * Existing orders are preserved because the orders.owner
 * foreign key uses ON DELETE SET NULL.
 */
adminRouter.delete(
  "/users/:id",
  requireAdmin,
  asyncRoute(async (req, res) => {
    const targetId = req.params.id;

    // Prevent deleting your own account.
    if (targetId === req.user.id) {
      throw new HttpError(
        400,
        "You cannot delete your own account."
      );
    }

    // Confirm that the target user exists.
    const target = await profileStore.findById(targetId);

    if (!target) {
      throw new HttpError(
        404,
        "That user doesn't exist."
      );
    }

    // Delete the user from Supabase Authentication.
    // The associated profile is removed automatically
    // through the profiles.id ON DELETE CASCADE relationship.
    //
    // Existing orders remain in the database because
    // orders.owner now uses ON DELETE SET NULL.
    const { error } = await supabase.auth.admin.deleteUser(
      targetId
    );

    if (error) {
      throw new HttpError(
        500,
        `Could not delete user: ${error.message}`
      );
    }

    res.json({
      deleted: true,
      userId: targetId,
    });
  })
);
