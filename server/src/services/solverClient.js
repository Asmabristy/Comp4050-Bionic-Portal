import { config } from "../config.js";
import { mockPack } from "./mockSolver.js";

/**
 * Convert the Portal's order items into the format expected by FitSolver.
 *
 * The Solver currently has no quantity field, so quantity > 1 is expanded
 * into multiple physical item records.
 */
export function expandItems(items) {
  const expanded = [];

  for (const item of items) {
    const quantity = Math.max(1, item.quantity || 1);

    for (let i = 0; i < quantity; i++) {
      expanded.push({
        itemCode:
          quantity > 1
            ? `${item.itemCode}#${i + 1}`
            : item.itemCode,

        itemReference: item.itemReference,

        width: item.width,
        length: item.length,
        depth: item.depth,
        weight: item.weight,

        ...(item.boxGroup
          ? { boxGroup: item.boxGroup }
          : {}),
      });
    }
  }

  return expanded;
}

/**
 * Build the request expected by @bionic/solver.
 */
export function buildSolverRequest(order) {
  return {
    boxes: order.containers
      .filter((box) => box.active !== false)
      .map((box) => ({
        reference: box.reference,
        width: box.width,
        length: box.length,
        depth: box.depth,

        ...(box.maxWeight != null
          ? { maxWeight: box.maxWeight }
          : {}),

        ...(box.boxWeight != null
          ? { boxWeight: box.boxWeight }
          : {}),

        ...(box.active != null
          ? { active: box.active }
          : {}),

        ...(box.maximumBoxes != null
          ? { maximumBoxes: box.maximumBoxes }
          : {}),
      })),

    items: expandItems(order.items),
  };
}

/**
 * Convert FitSolver's result into the stable result format used by FitPortal
 * and later consumed by FitVisualizer.
 */
export function normaliseSolverResponse(result, order) {
  if (!result || typeof result !== "object") {
    throw new Error("Solver returned an invalid response.");
  }

  if (!Array.isArray(result.results)) {
    throw new Error("Solver response is missing the results array.");
  }

  if (!Array.isArray(result.failed)) {
    throw new Error("Solver response is missing the failed array.");
  }

  const containersByReference = new Map(
    order.containers.map((box) => [box.reference, box])
  );

  const boxes = result.results.map((resultBox, boxIndex) => {
    const container =
      containersByReference.get(resultBox.boxReference);

    return {
      boxId: resultBox.boxReference,

      dimensions: container
        ? {
            w: container.width,
            h: container.length,
            d: container.depth,
          }
        : null,

      items: (resultBox.placements || []).map(
        (placement, placementIndex) => ({
          /*
           * The current Solver placement response contains geometry but
           * does not include the item code. Keep a stable generated ID
           * for now so the Portal/Visualizer can still render it.
           */
          itemId: `placement-${boxIndex + 1}-${placementIndex + 1}`,

          position: {
            x: placement.x,
            y: placement.y,
            z: placement.z,
          },

          rotation: "XYZ",

          dimensions: {
            w: placement.width,
            h: placement.length,
            d: placement.depth,
          },
        })
      ),
    };
  });

  return {
    status: "success",

    message:
      result.failed.length > 0
        ? `${result.failed.length} item(s) could not be packed.`
        : "",

    boxes,

    unpacked: result.failed.map(
      (item) => item.itemCode
    ),
  };
}

/**
 * Send an order to either:
 * - the temporary mock Solver, or
 * - the real @bionic/solver package.
 */
export async function requestPacking(order) {
  const startedAt = Date.now();

  const request = buildSolverRequest(order);

  if (config.useMockSolver) {
    const result = mockPack(request);

    return {
      ...result,
      solverMs: Date.now() - startedAt,
      source: "mock",
    };
  }

 try {
  const { solve } = await import("@bionic/solver");

  console.log("[solver] REQUEST:");
  console.dir(request, { depth: null });

  const result = await solve(request);

  console.log("[solver] RAW RESPONSE:");
  console.dir(result, { depth: null });

  return {
    ...normaliseSolverResponse(result, order),
    solverMs: Date.now() - startedAt,
    source: "bionic-solver",
  };
} catch (err) {
    throw new Error(`FitSolver failed: ${err.message}`);
  }
}