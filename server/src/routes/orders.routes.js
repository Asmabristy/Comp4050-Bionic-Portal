import { Router } from "express";
import { Order } from "../models/Order.js";
import { Container } from "../models/Container.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncRoute, HttpError } from "../middleware/errors.js";
import { requestPacking } from "../services/solverClient.js";

export const ordersRouter = Router();

ordersRouter.use(requireAuth);

async function findOwnedOrder(req) {
  const order = await Order.findOne({ _id: req.params.id, owner: req.user._id });
  if (!order) throw new HttpError(404, "That order doesn't exist.");
  return order;
}

function validateItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new HttpError(400, "Add at least one item to the order.");
  }
  items.forEach((item, index) => {
    if (!item.itemId) throw new HttpError(400, `Item ${index + 1} needs an item ID.`);
    if (![item.w, item.h, item.d].every((n) => typeof n === "number" && n > 0)) {
      throw new HttpError(400, `Item ${item.itemId} needs width, height, and depth above zero.`);
    }
  });
}

/** GET /api/orders — this user's order history, newest first. */
ordersRouter.get(
  "/",
  asyncRoute(async (req, res) => {
    const orders = await Order.find({ owner: req.user._id }).sort({ createdAt: -1 }).limit(100);
    res.json({ orders: orders.map((o) => o.toPublic()) });
  })
);

/** POST /api/orders — save a new order. Does not pack it yet. */
ordersRouter.post(
  "/",
  asyncRoute(async (req, res) => {
    const { reference, items, containers } = req.body || {};
    if (!reference) throw new HttpError(400, "Give the order a reference.");
    validateItems(items);

    // No containers given, so send the whole catalogue and let Solver choose.
    let chosen = containers;
    if (!Array.isArray(chosen) || chosen.length === 0) {
      const catalogue = await Container.find({ active: true });
      if (catalogue.length === 0) {
        throw new HttpError(400, "No carton types in the catalogue. Add one first.");
      }
      chosen = catalogue.map((c) => ({
        boxId: c.boxId,
        label: c.label,
        w: c.w,
        h: c.h,
        d: c.d,
        maxWeight: c.maxWeight,
      }));
    }

    const order = await Order.create({
      reference,
      owner: req.user._id,
      items,
      containers: chosen,
      status: "draft",
    });

    res.status(201).json({ order: order.toPublic() });
  })
);

/** GET /api/orders/:id — one order with its stored result. */
ordersRouter.get(
  "/:id",
  asyncRoute(async (req, res) => {
    const order = await findOwnedOrder(req);
    res.json({ order: order.toPublic() });
  })
);

/** POST /api/orders/:id/pack — send to Solver, store what comes back. */
ordersRouter.post(
  "/:id/pack",
  asyncRoute(async (req, res) => {
    const order = await findOwnedOrder(req);

    order.status = "packing";
    await order.save();

    try {
      const solved = await requestPacking(order);

      order.result = {
        status: solved.status,
        message: solved.message || "",
        boxes: solved.boxes || [],
        unpacked: solved.unpacked || [],
        solvedAt: new Date(),
        solverMs: solved.solverMs || 0,
        source: solved.source || "solver",
      };
      order.status = solved.status === "success" ? "packed" : "failed";
      await order.save();

      res.json({ order: order.toPublic() });
    } catch (err) {
      order.status = "failed";
      order.result = {
        status: "error",
        message: err.message,
        boxes: [],
        unpacked: order.items.map((i) => i.itemId),
        solvedAt: new Date(),
        source: "solver",
      };
      await order.save();
      throw new HttpError(502, `Packing failed: ${err.message}`);
    }
  })
);

/** GET /api/orders/:id/result — the layout on its own. FitVisualizer reads this. */
ordersRouter.get(
  "/:id/result",
  asyncRoute(async (req, res) => {
    const order = await findOwnedOrder(req);
    if (!order.result) throw new HttpError(404, "This order hasn't been packed yet.");

    res.json({
      orderId: order._id.toString(),
      status: order.result.status,
      message: order.result.message,
      boxes: order.result.boxes,
      unpacked: order.result.unpacked,
    });
  })
);

/** DELETE /api/orders/:id */
ordersRouter.delete(
  "/:id",
  asyncRoute(async (req, res) => {
    const order = await Order.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!order) throw new HttpError(404, "That order doesn't exist.");
    res.json({ deleted: true });
  })
);
