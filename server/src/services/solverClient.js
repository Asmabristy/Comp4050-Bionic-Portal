import { config } from "../config.js";
import { mockPack } from "./mockSolver.js";

/**
 * The only place we talk to FitSolver (POST {SOLVER_URL}/pack).
 * If the agreed interface changes, it changes here and nowhere else.
 */

/** Solver has no concept of quantity, so 3x of item A becomes A#1, A#2, A#3. */
export function expandItems(items) {
  const expanded = [];
  for (const item of items) {
    const qty = Math.max(1, item.quantity || 1);
    for (let i = 0; i < qty; i++) {
      expanded.push({
        itemId: qty > 1 ? `${item.itemId}#${i + 1}` : item.itemId,
        w: item.w,
        h: item.h,
        d: item.d,
        weight: item.weight || 0,
      });
    }
  }
  return expanded;
}

export function buildPackRequest(order) {
  return {
    orderId: order._id.toString(),
    items: expandItems(order.items),
    containers: order.containers.map((c) => ({
      boxId: c.boxId,
      w: c.w,
      h: c.h,
      d: c.d,
      maxWeight: c.maxWeight || 0,
    })),
  };
}

/** Catch a malformed reply here rather than storing junk Visualizer can't render. */
export function validatePackResponse(body) {
  if (!body || typeof body !== "object") {
    throw new Error("Solver returned a non-object response.");
  }
  if (body.status !== "success" && body.status !== "error") {
    throw new Error(`Solver returned an unknown status: ${JSON.stringify(body.status)}`);
  }
  if (body.status === "error") return body;

  if (!Array.isArray(body.boxes)) {
    throw new Error("Solver response is missing a 'boxes' array.");
  }
  for (const box of body.boxes) {
    if (!box.dimensions) throw new Error(`Box ${box.boxId} is missing 'dimensions'.`);
    if (!Array.isArray(box.items)) throw new Error(`Box ${box.boxId} is missing an 'items' array.`);
    for (const placed of box.items) {
      // Visualizer can't place an item without these.
      if (!placed.position) throw new Error(`Item ${placed.itemId} is missing 'position'.`);
      if (!placed.dimensions) throw new Error(`Item ${placed.itemId} is missing 'dimensions'.`);
      if (placed.rotation == null) placed.rotation = "XYZ";
    }
  }
  if (!Array.isArray(body.unpacked)) body.unpacked = [];
  return body;
}

export async function requestPacking(order) {
  const payload = buildPackRequest(order);
  const startedAt = Date.now();

  if (config.useMockSolver) {
    const result = mockPack(payload);
    return { ...validatePackResponse(result), solverMs: Date.now() - startedAt, source: "mock" };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.solverTimeoutMs);

  try {
    const res = await fetch(`${config.solverUrl}/pack`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Solver replied ${res.status}. ${text.slice(0, 200)}`);
    }

    const body = await res.json();
    return { ...validatePackResponse(body), solverMs: Date.now() - startedAt, source: "solver" };
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error(`Solver did not respond within ${config.solverTimeoutMs}ms.`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
