import { Router } from "express";
import * as containers from "../data/containers.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncRoute, HttpError } from "../middleware/errors.js";

export const containersRouter = Router();

containersRouter.use(requireAuth);

/**
 * GET /api/containers
 *
 * Default:
 * returns only active cartons for normal packing use.
 *
 * Management page:
 * /api/containers?includeInactive=true
 * returns the complete catalogue.
 */
containersRouter.get(
  "/",
  asyncRoute(async (req, res) => {
    const includeInactive =
      req.query.includeInactive === "true";

    const list = includeInactive
      ? await containers.listAll()
      : await containers.listActive();

    res.json({
      containers: list,
    });
  })
);

/**
 * POST /api/containers
 * Add a new carton type.
 */
containersRouter.post(
  "/",
  asyncRoute(async (req, res) => {
    const {
      reference,
      width,
      length,
      depth,
      maxWeight,
      boxWeight,
      active,
      maximumBoxes,
    } = req.body || {};

    if (!reference || !String(reference).trim()) {
      throw new HttpError(
        400,
        "Enter a box reference."
      );
    }

    if (
      ![width, length, depth].every(
        (value) =>
          typeof value === "number" &&
          Number.isFinite(value) &&
          value > 0
      )
    ) {
      throw new HttpError(
        400,
        "Width, length, and depth must all be above zero."
      );
    }

    const normalizedReference =
      String(reference).trim();

    const exists = await containers.referenceTaken(normalizedReference);

    if (exists) {
      throw new HttpError(
        409,
        `Box reference "${normalizedReference}" is already in the catalogue.`
      );
    }

    const container = await containers.create({
      reference: normalizedReference,
      width,
      length,
      depth,
      maxWeight: maxWeight ?? null,
      boxWeight: boxWeight ?? null,
      active: active ?? true,
      maximumBoxes: maximumBoxes ?? null,
    });

    res.status(201).json({
      container,
    });
  })
);

/**
 * PATCH /api/containers/:id
 * Update an existing carton type.
 */
containersRouter.patch(
  "/:id",
  asyncRoute(async (req, res) => {
    const container = await containers.findById(req.params.id);

    // Collected here, then written once at the end.
    const patch = {};

    if (!container) {
      throw new HttpError(
        404,
        "That carton type doesn't exist."
      );
    }

    const {
      reference,
      width,
      length,
      depth,
      maxWeight,
      boxWeight,
      maximumBoxes,
      active,
    } = req.body || {};

    if (reference !== undefined) {
      const normalizedReference =
        String(reference).trim();

      if (!normalizedReference) {
        throw new HttpError(
          400,
          "Enter a box reference."
        );
      }

      const duplicate = await containers.referenceTaken(
        normalizedReference,
        container.id
      );

      if (duplicate) {
        throw new HttpError(
          409,
          `Box reference "${normalizedReference}" is already in the catalogue.`
        );
      }

      patch.reference = normalizedReference;
    }

    const dimensions = {
      width,
      length,
      depth,
    };

    for (const [field, value] of Object.entries(
      dimensions
    )) {
      if (value !== undefined) {
        if (
          typeof value !== "number" ||
          !Number.isFinite(value) ||
          value <= 0
        ) {
          throw new HttpError(
            400,
            `${field} must be above zero.`
          );
        }

        patch[field] = value;
      }
    }

    if (maxWeight !== undefined) {
      if (
        maxWeight !== null &&
        (typeof maxWeight !== "number" ||
          !Number.isFinite(maxWeight) ||
          maxWeight < 0)
      ) {
        throw new HttpError(
          400,
          "Maximum weight must be zero or above."
        );
      }

      patch.maxWeight = maxWeight;
    }

    if (boxWeight !== undefined) {
      if (
        boxWeight !== null &&
        (typeof boxWeight !== "number" ||
          !Number.isFinite(boxWeight) ||
          boxWeight < 0)
      ) {
        throw new HttpError(
          400,
          "Box weight must be zero or above."
        );
      }

      patch.boxWeight = boxWeight;
    }

    if (maximumBoxes !== undefined) {
      if (
        maximumBoxes !== null &&
        (!Number.isInteger(maximumBoxes) ||
          maximumBoxes < 0)
      ) {
        throw new HttpError(
          400,
          "Maximum boxes must be a whole number of zero or above."
        );
      }

      patch.maximumBoxes = maximumBoxes;
    }

    if (active !== undefined) {
      if (typeof active !== "boolean") {
        throw new HttpError(
          400,
          "Active must be true or false."
        );
      }

      patch.active = active;
    }

    const updated = await containers.update(container.id, patch);

    res.json({
      container: updated,
    });
  })
);

/**
 * DELETE /api/containers/:id
 * Soft-delete / deactivate a carton.
 */
containersRouter.delete(
  "/:id",
  asyncRoute(async (req, res) => {
    const container = await containers.update(req.params.id, {
      active: false,
    });

    if (!container) {
      throw new HttpError(
        404,
        "That carton type doesn't exist."
      );
    }

    res.json({
      container,
    });
  })
);