import { Router } from "express";
import { Container } from "../models/Container.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncRoute, HttpError } from "../middleware/errors.js";

export const containersRouter = Router();

containersRouter.use(requireAuth);

/** GET /api/containers — the carton types available to pack into. */
containersRouter.get(
  "/",
  asyncRoute(async (req, res) => {
    const containers = await Container.find({ active: true }).sort({ w: 1 });
    res.json({ containers: containers.map((c) => c.toPublic()) });
  })
);

/** POST /api/containers — add a carton type to the catalogue. */
containersRouter.post(
  "/",
  asyncRoute(async (req, res) => {
    const { boxId, label, w, h, d, maxWeight } = req.body || {};
    if (!boxId || !label) throw new HttpError(400, "Enter a box ID and a label.");
    if (![w, h, d].every((n) => typeof n === "number" && n > 0)) {
      throw new HttpError(400, "Width, height, and depth must all be above zero.");
    }

    const exists = await Container.findOne({ boxId });
    if (exists) throw new HttpError(409, `Box ID "${boxId}" is already in the catalogue.`);

    const container = await Container.create({ boxId, label, w, h, d, maxWeight: maxWeight || 0 });
    res.status(201).json({ container: container.toPublic() });
  })
);

/** DELETE /api/containers/:id — retire a carton type. */
containersRouter.delete(
  "/:id",
  asyncRoute(async (req, res) => {
    const container = await Container.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );
    if (!container) throw new HttpError(404, "That carton type doesn't exist.");
    res.json({ container: container.toPublic() });
  })
);
