
import { config } from "../config.js";
import { mockPack } from "./mockSolver.js";

/**
 * Expand order items into the format expected by FitSolver.
 *
 * FitSolver does not currently accept a quantity field.
 * Each physical item is therefore sent separately.
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
 *
 * Preserve the Portal's width, length and depth values.
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
 * Convert FitSolver's response into the format expected
 * by the embedded FitVisualizer component.
 *
 * FitSolver coordinate convention:
 *
 *   X = width
 *   Y = depth
 *   Z = length
 *
 * FitVisualizer coordinate convention:
 *
 *   w = width
 *   h = depth
 *   d = length
 *
 * Placement coordinates and dimensions are preserved.
 * We do not invent rotation information.
 */
export function normaliseSolverResponse(result, order) {
  if (!result || typeof result !== "object") {
    throw new Error("Solver returned an invalid response.");
  }

  if (!Array.isArray(result.results)) {
    throw new Error(
      "Solver response is missing the results array."
    );
  }

  if (!Array.isArray(result.failed)) {
    throw new Error(
      "Solver response is missing the failed array."
    );
  }

  const containersByReference = new Map(
    order.containers.map((box) => [
      box.reference,
      box,
    ])
  );

  const usedBoxIds = new Set();

  const boxes = result.results.map(
    (resultBox, boxIndex) => {
      const reference =
        resultBox.boxReference ??
        resultBox.box_reference ??
        `box-${boxIndex + 1}`;

      const container =
        containersByReference.get(reference);

      // Prefer carton dimensions returned by FitSolver.
      // Fall back to the original order configuration.
      const width =
        resultBox.width ?? container?.width;

      const length =
        resultBox.length ?? container?.length;

      const depth =
        resultBox.depth ?? container?.depth;

      if (
        ![width, length, depth].every(
          (value) =>
            typeof value === "number" &&
            Number.isFinite(value) &&
            value > 0
        )
      ) {
        throw new Error(
          `Missing or invalid carton dimensions for ${reference}.`
        );
      }

      // Ensure each packed carton has a unique ID.
      let boxId = reference;
      let suffix = 2;

      while (usedBoxIds.has(boxId)) {
        boxId = `${reference}-${suffix++}`;
      }

      usedBoxIds.add(boxId);

      const dimensions = {
        w: width,
        h: depth,
        d: length,
      };

      const items = (
        resultBox.placements ?? []
      ).map((placement, placementIndex) => {
        const itemId =
          placement.itemCode ??
          placement.item_code ??
          placement.itemReference ??
          placement.item_reference ??
          `placement-${boxIndex + 1}-${placementIndex + 1}`;

        // Preserve Solver placement coordinates.
        const position = {
          x: placement.x,
          y: placement.y,
          z: placement.z,
        };

        // Preserve actual placed dimensions.
        // These may differ from original dimensions
        // if the Solver rotated the item.
        const itemDimensions = {
          w: placement.width,
          h: placement.depth,
          d: placement.length,
        };

        const values = [
          position.x,
          position.y,
          position.z,
          itemDimensions.w,
          itemDimensions.h,
          itemDimensions.d,
        ];

        if (!values.every(Number.isFinite)) {
          throw new Error(
            `Invalid placement data for ${itemId}.`
          );
        }

        // Diagnostic boundary validation.
        // Does not modify Solver coordinates.
        const tolerance = 0.001;

        const outside =
          position.x < -tolerance ||
          position.y < -tolerance ||
          position.z < -tolerance ||
          position.x + itemDimensions.w >
            dimensions.w + tolerance ||
          position.y + itemDimensions.h >
            dimensions.h + tolerance ||
          position.z + itemDimensions.d >
            dimensions.d + tolerance;

        if (outside) {
          console.warn(
            "[solver] Placement outside carton:",
            {
              boxReference: reference,
              itemId,
              position,
              itemDimensions,
              cartonDimensions: dimensions,
            }
          );
        }

        return {
          itemId,

          itemCode:
            placement.itemCode ??
            placement.item_code ??
            null,

          itemReference:
            placement.itemReference ??
            placement.item_reference ??
            null,

          position,

          // No hardcoded rotation.
          // FitSolver already returns placed dimensions.
          dimensions: itemDimensions,
        };
      });

      return {
        boxId,
        dimensions,

        totalWeight:
          resultBox.totalWeight ??
          resultBox.total_weight ??
          null,

        utilization:
          resultBox.utilization ?? null,

        items,
      };
    }
  );

  return {
    status: "success",

    message:
      result.failed.length > 0
        ? `${result.failed.length} item(s) could not be packed.`
        : "",

    boxes,

    unpacked: result.failed
      .map((item) =>
        typeof item === "string"
          ? item
          : item.itemCode ??
            item.item_code ??
            null
      )
      .filter(Boolean),

    algorithmUs:
      result.algorithmUs ?? null,

    serverUs:
      result.serverUs ?? null,
  };
}

/**
 * Send an order to either:
 * - the temporary mock Solver, or
 * - the real @bionic/solver package.
 *
 * The original FitSolver response is preserved
 * for future raw-response PDF downloads.
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
    const { solve } = await import(
      "@bionic/solver"
    );

    console.log("[solver] REQUEST:");
    console.dir(request, { depth: null });

    const result = await solve(request);

    console.log("[solver] RAW RESPONSE:");
    console.dir(result, { depth: null });

    const normalisedResult =
      normaliseSolverResponse(result, order);

    console.log(
      "[solver] VISUALIZER RESPONSE:"
    );
    console.dir(normalisedResult, {
      depth: null,
    });

    return {
      ...normalisedResult,

      // Preserve the original FitSolver output
      // without modifying its properties or values.
      rawSolverResponse: result,

      solverMs: Date.now() - startedAt,
      source: "bionic-solver",
    };
  } catch (err) {
    throw new Error(
      `FitSolver failed: ${err.message}`
    );
  }
}
