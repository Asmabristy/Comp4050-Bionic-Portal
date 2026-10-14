
import { Router } from "express";
import * as orderStore from "../data/orders.js";
import * as containerStore from "../data/containers.js";
import { requireAuth, requireSupervisor } from "../middleware/auth.js";
import { asyncRoute, HttpError } from "../middleware/errors.js";
import { requestPacking } from "../services/solverClient.js";

export const ordersRouter = Router();

ordersRouter.use(requireAuth);

async function findOrder(req) {
  const order = await orderStore.findById(req.params.id);

  if (!order) {
    throw new HttpError(404, "That order doesn't exist.");
  }

  return order;
}

/*
 * Upper bounds. Without these a single request can take the API down: quantity
 * is expanded into one record per unit before the order reaches Solver, so
 * quantity 999999 becomes ~85MB of JSON. These are generous for real orders and
 * still small enough to stay safe.
 */
const MAX_REFERENCE_LENGTH = 120;
const MAX_ITEM_ROWS = 500;
const MAX_QUANTITY = 10000;
const MAX_TOTAL_UNITS = 20000;

/**
 * Validate items received from either:
 * - the manual Portal form
 * - the external Portal API
 */
function validateItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new HttpError(400, "Add at least one item to the order.");
  }

  if (items.length > MAX_ITEM_ROWS) {
    throw new HttpError(
      400,
      `An order can have at most ${MAX_ITEM_ROWS} item rows.`
    );
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

    if (item.quantity !== undefined && item.quantity > MAX_QUANTITY) {
      throw new HttpError(
        400,
        `Item ${item.itemCode} has a quantity above the ${MAX_QUANTITY} limit.`
      );
    }
  });

  // Each unit becomes its own record for Solver, so the total is what matters.
  const totalUnits = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 1),
    0
  );

  if (totalUnits > MAX_TOTAL_UNITS) {
    throw new HttpError(
      400,
      `This order has ${totalUnits} units in total, above the ${MAX_TOTAL_UNITS} limit.`
    );
  }
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

/** GET /api/orders — shared order history, newest first. */
ordersRouter.get(
  "/",
  asyncRoute(async (req, res) => {
    const list = await orderStore.listAll();

    res.json({
      orders: list.slice(0, 100),
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

    if (String(reference).trim().length > MAX_REFERENCE_LENGTH) {
      throw new HttpError(
        400,
        `The order reference can be at most ${MAX_REFERENCE_LENGTH} characters.`
      );
    }

    // References identify orders to people, so two orders sharing one is a
    // problem however it happened — a typo, or a double-submitted form.
    if (await orderStore.referenceTaken(String(reference).trim())) {
      throw new HttpError(
        409,
        `An order with reference "${String(reference).trim()}" already exists.`
      );
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
      const catalogue = await containerStore.listActive();

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

    const order = await orderStore.create({
      reference: String(reference).trim(),
      ownerId: req.user.id,
      items,
      containers: chosenContainers,
      status: "draft",
    });

    res.status(201).json({
      order,
    });
  })
);

/** GET /api/orders/:id — one order with its stored result. */
ordersRouter.get(
  "/:id",
  asyncRoute(async (req, res) => {
    const order = await findOrder(req);

    res.json({
      order,
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
  requireSupervisor,
  asyncRoute(async (req, res) => {
    const order = await findOrder(req);

    /*
     * The order carries a snapshot of the cartons taken when it was raised, so
     * its dimensions stay reproducible. But a carton deactivated since then —
     * out of stock, withdrawn — must not be packed into, and the snapshot alone
     * would happily keep using it.
     */
    const stillActive = new Set(
      (await containerStore.listActive()).map((c) => c.reference)
    );

    const usableContainers = (order.containers || []).filter((c) =>
      stillActive.has(c.reference)
    );

    if (usableContainers.length === 0) {
      throw new HttpError(
        400,
        "None of this order's carton types are active any more. Reactivate one, or raise the order again."
      );
    }

    await orderStore.update(order.id, { status: "packing" });

    try {
      const solved = await requestPacking({
        ...order,
        containers: usableContainers,
      });

      const updated = await orderStore.update(order.id, {
        status: solved.status === "success" ? "packed" : "failed",
        result: {
          status: solved.status,
          message: solved.message || "",
          boxes: solved.boxes || [],
          unpacked: solved.unpacked || [],
          solvedAt: new Date().toISOString(),
          solverMs: solved.solverMs || 0,
          source: solved.source || "solver",
        },
      });

      res.json({
        order: updated,
      });
    } catch (err) {
      await orderStore.update(order.id, {
        status: "failed",
        result: {
          status: "error",
          message: err.message,
          boxes: [],
          unpacked: order.items.map((item) => item.itemCode),
          solvedAt: new Date().toISOString(),
          solverMs: 0,
          source: "solver",
        },
      });

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
    const order = await findOrder(req);

    if (!order.result) {
      throw new HttpError(
        404,
        "This order hasn't been packed yet."
      );
    }

    res.json({
      orderId: order.id,
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
    const existing = await orderStore.findById(req.params.id);

    if (!existing) {
      throw new HttpError(404, "That order doesn't exist.");
    }

    // Reading is shared, but deleting someone else's order is not.
    // Supervisors and Admins may delete any order, including historical
    // orders whose original creator's account has been deleted.
    const isOwner = existing.ownerId === req.user.id;
    const hasManagementAccess = ["supervisor", "admin"].includes(
      req.user.role
    );

    if (!isOwner && !hasManagementAccess) {
      throw new HttpError(
        403,
        "Only the person who raised this order, a supervisor, or an admin can delete it."
      );
    }

    await orderStore.remove(req.params.id);

    res.json({
      deleted: true,
    });
  })
);
