import { Router } from "express";
import { Order } from "../models/Order.js";
import { Container } from "../models/Container.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncRoute, HttpError } from "../middleware/errors.js";
import { requestPacking } from "../services/solverClient.js";

export const ordersRouter = Router();

ordersRouter.use(requireAuth);

async function findOwnedOrder(req) {
  const order = await Order.findOne({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!order) {
    throw new HttpError(404, "That order doesn't exist.");
  }

  return order;
}

/**
 * Validate items received from either:
 * - the manual Portal form
 * - the external Portal API
 */
function validateItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new HttpError(400, "Add at least one item to the order.");
  }

  items.forEach((item, index) => {
    const itemNumber = index + 1;

    if (!item.itemCode || !String(item.itemCode).trim()) {
      throw new HttpError(
        400,
        `Item ${itemNumber} needs an item code.`
      );
    }

    if (!item.itemReference || !String(item.itemReference).trim()) {
      throw new HttpError(
        400,
        `Item ${itemNumber} needs an item reference.`
      );
    }

    if (
      ![item.width, item.length, item.depth].every(
        (n) => typeof n === "number" && Number.isFinite(n) && n > 0
      )
    ) {
      throw new HttpError(
        400,
        `Item ${item.itemCode} needs width, length, and depth above zero.`
      );
    }

    if (
      typeof item.weight !== "number" ||
      !Number.isFinite(item.weight) ||
      item.weight < 0
    ) {
      throw new HttpError(
        400,
        `Item ${item.itemCode} needs a valid weight.`
      );
    }

    if (
      item.quantity !== undefined &&
      (!Number.isInteger(item.quantity) || item.quantity < 1)
    ) {
      throw new HttpError(
        400,
        `Item ${item.itemCode} needs a quantity of at least 1.`
      );
    }
  });
}

function validateContainers(containers) {
  if (!Array.isArray(containers)) {
    throw new HttpError(400, "Containers must be provided as an array.");
  }

  containers.forEach((container, index) => {
    const containerNumber = index + 1;

    if (!container.reference || !String(container.reference).trim()) {
      throw new HttpError(
        400,
        `Container ${containerNumber} needs a reference.`
      );
    }

    if (
      ![container.width, container.length, container.depth].every(
        (n) => typeof n === "number" && Number.isFinite(n) && n > 0
      )
    ) {
      throw new HttpError(
        400,
        `Container ${container.reference} needs width, length, and depth above zero.`
      );
    }

    if (
      container.maxWeight != null &&
      (typeof container.maxWeight !== "number" ||
        !Number.isFinite(container.maxWeight) ||
        container.maxWeight < 0)
    ) {
      throw new HttpError(
        400,
        `Container ${container.reference} has an invalid maximum weight.`
      );
    }

    if (
      container.boxWeight != null &&
      (typeof container.boxWeight !== "number" ||
        !Number.isFinite(container.boxWeight) ||
        container.boxWeight < 0)
    ) {
      throw new HttpError(
        400,
        `Container ${container.reference} has an invalid box weight.`
      );
    }

    if (
      container.maximumBoxes != null &&
      (!Number.isInteger(container.maximumBoxes) ||
        container.maximumBoxes < 0)
    ) {
      throw new HttpError(
        400,
        `Container ${container.reference} has an invalid maximum box count.`
      );
    }
  });
}

/** GET /api/orders — this user's order history, newest first. */
ordersRouter.get(
  "/",
  asyncRoute(async (req, res) => {
    const orders = await Order.find({
      owner: req.user._id,
    })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      orders: orders.map((o) => o.toPublic()),
    });
  })
);

/**
 * POST /api/orders
 *
 * Save a new order.
 * This does not pack the order yet.
 */
ordersRouter.post(
  "/",
  asyncRoute(async (req, res) => {
    const { reference, items, containers } = req.body || {};

    if (!reference || !String(reference).trim()) {
      throw new HttpError(400, "Give the order a reference.");
    }

    validateItems(items);

    /*
     * If the request does not explicitly provide boxes,
     * use the active reusable carton catalogue.
     */
    let chosenContainers = containers;

    if (
      !Array.isArray(chosenContainers) ||
      chosenContainers.length === 0
    ) {
      const catalogue = await Container.find({
        active: true,
      });

      if (catalogue.length === 0) {
        throw new HttpError(
          400,
          "No active carton types are available. Add one first."
        );
      }

      chosenContainers = catalogue.map((container) => ({
        reference: container.reference,
        width: container.width,
        length: container.length,
        depth: container.depth,
        maxWeight: container.maxWeight,
        boxWeight: container.boxWeight,
        active: container.active,
        maximumBoxes: container.maximumBoxes,
      }));
    } else {
      validateContainers(chosenContainers);
    }

    const order = await Order.create({
      reference: String(reference).trim(),
      owner: req.user._id,
      items,
      containers: chosenContainers,
      status: "draft",
    });

    res.status(201).json({
      order: order.toPublic(),
    });
  })
);

/** GET /api/orders/:id — one order with its stored result. */
ordersRouter.get(
  "/:id",
  asyncRoute(async (req, res) => {
    const order = await findOwnedOrder(req);

    res.json({
      order: order.toPublic(),
    });
  })
);

/**
 * POST /api/orders/:id/pack
 *
 * Send the stored order to Solver and save the result.
 */
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

      order.status =
        solved.status === "success" ? "packed" : "failed";

      await order.save();

      res.json({
        order: order.toPublic(),
      });
    } catch (err) {
      order.status = "failed";

      order.result = {
        status: "error",
        message: err.message,
        boxes: [],
        unpacked: order.items.map((item) => item.itemCode),
        solvedAt: new Date(),
        solverMs: 0,
        source: "solver",
      };

      await order.save();

      throw new HttpError(
        502,
        `Packing failed: ${err.message}`
      );
    }
  })
);

/**
 * GET /api/orders/:id/result
 *
 * FitVisualizer can read the packing result from here.
 */
ordersRouter.get(
  "/:id/result",
  asyncRoute(async (req, res) => {
    const order = await findOwnedOrder(req);

    if (!order.result) {
      throw new HttpError(
        404,
        "This order hasn't been packed yet."
      );
    }

    res.json({
      orderId: order._id.toString(),
      reference: order.reference,
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
    const order = await Order.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!order) {
      throw new HttpError(404, "That order doesn't exist.");
    }

    res.json({
      deleted: true,
    });
  })
);