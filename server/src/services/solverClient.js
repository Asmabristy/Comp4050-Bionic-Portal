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
/*
 * Axis convention, confirmed against the solver binary.
 *
 * Solver returns width/length/depth and positions x/y/z. Packing 60 items of
 * 10 x 40 x 20 into a carton showed which field belongs to which axis:
 *
 *   x steps by 10  -> x = width
 *   y steps by 20  -> y = depth
 *   z steps by 40  -> z = length
 *
 * FitVisualizer renders with y up, so the height of anything is its `depth`.
 * Mapping h from `length` made items render at the wrong size for the space
 * they were given — each one overlapping the next, and boxes poking through
 * the carton. FitVisualizer's own adapter already maps h from depth; this
 * brings Portal in line with it.
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
            h: container.depth,
            d: container.length,
          }
        : null,

      totalWeight: resultBox.totalWeight ?? null,

      utilization: resultBox.utilization ?? null,

      items: (resultBox.placements || []).map(
        (placement, placementIndex) => ({
          itemId:
            placement.itemReference ||
            placement.itemCode ||
            `placement-${boxIndex + 1}-${placementIndex + 1}`,

          itemCode: placement.itemCode ?? null,

          itemReference:
            placement.itemReference ?? null,

          position: {
            x: placement.x,
            y: placement.y,
            z: placement.z,
          },

          rotation: "XYZ",

          dimensions: {
            w: placement.width,
            h: placement.depth,
            d: placement.length,
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

    algorithmUs: result.algorithmUs ?? null,
    serverUs: result.serverUs ?? null,
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