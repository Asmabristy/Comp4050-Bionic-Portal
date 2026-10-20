
import { config } from "../config.js";
import { mockPack } from "./mockSolver.js";

/**
 * Expand Portal order quantities into individual physical items.
 *
 * FitSolver expects each physical item separately.
 * Each item receives a unique itemCode when quantity > 1.
 * The original itemReference is preserved.
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
 * Portal and Solver dimensions:
 * X = width
 * Y = depth (vertical)
 * Z = length
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
 * Convert the updated FitSolver response into the
 * new FitVisualizer packing-result structure.
 *
 * FitSolver returns item details inside placement.item.
 *
 * Updated Visualizer dimensions:
 * width  = X
 * depth  = Y (vertical)
 * length = Z
 *
 * Solver coordinates are preserved without translation.
 * No artificial rotation is introduced.
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

      // Prefer actual dimensions returned by FitSolver.
      // Fall back to the Portal's carton configuration.
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

      // Multiple packed cartons can share one carton type.
      // Give every packed carton a unique identifier.
      let boxId = reference;
      let suffix = 2;

      while (usedBoxIds.has(boxId)) {
        boxId = `${reference}-${suffix++}`;
      }

      usedBoxIds.add(boxId);

      // Updated Visualizer dimension format.
      const dimensions = {
        width,
        length,
        depth,
      };

      if (!Array.isArray(resultBox.placements)) {
        throw new Error(
          `Solver returned invalid placements for ${reference}.`
        );
      }

      const items = resultBox.placements.map(
        (placement, placementIndex) => {
          // Updated FitSolver response:
          // placement.item contains the item's details.
          const placedItem = placement?.item;

          if (
            !placedItem ||
            typeof placedItem !== "object"
          ) {
            throw new Error(
              `Solver placement ${placementIndex + 1} in ${reference} is missing item details.`
            );
          }

          // Prefer unique itemCode for physical item tracking.
          // itemReference may be shared across quantities.
          const itemId =
            placedItem.itemCode ||
            placedItem.itemReference ||
            `placement-${boxIndex + 1}-${placementIndex + 1}`;

          // Preserve Solver XYZ coordinates.
          const position = {
            x: placement.x,
            y: placement.y,
            z: placement.z,
          };

          // Updated Visualizer dimension format.
          // Values come directly from placement.item.
          const itemDimensions = {
            width: placedItem.width,
            length: placedItem.length,
            depth: placedItem.depth,
          };

          const values = [
            position.x,
            position.y,
            position.z,
            itemDimensions.width,
            itemDimensions.length,
            itemDimensions.depth,
          ];

          if (
            !values.every(
              (value) =>
                typeof value === "number" &&
                Number.isFinite(value)
            )
          ) {
            throw new Error(
              `Invalid placement data for ${itemId}.`
            );
          }

          if (
            itemDimensions.width <= 0 ||
            itemDimensions.length <= 0 ||
            itemDimensions.depth <= 0
          ) {
            throw new Error(
              `Invalid item dimensions for ${itemId}.`
            );
          }

          // Diagnostic validation only.
          // Do not change the Solver's coordinates.
          const tolerance = 0.001;

          const outside =
            position.x < -tolerance ||
            position.y < -tolerance ||
            position.z < -tolerance ||
            position.x + itemDimensions.width >
              dimensions.width + tolerance ||
            position.y + itemDimensions.depth >
              dimensions.depth + tolerance ||
            position.z + itemDimensions.length >
              dimensions.length + tolerance;

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
              placedItem.itemCode ?? null,

            itemReference:
              placedItem.itemReference ?? null,

            position,

            // No hardcoded rotation.
            // Dimensions come from the Solver response.
            dimensions: itemDimensions,
          };
        }
      );

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

    // The updated Solver can return nested failed items.
    unpacked: result.failed
      .map((entry) => {
        if (typeof entry === "string") {
          return entry;
        }

        const item = entry?.item ?? entry;

        return (
          item?.itemCode ??
          item?.itemReference ??
          null
        );
      })
      .filter(Boolean),

    algorithmUs:
      result.algorithmUs ?? null,

    serverUs:
      result.serverUs ?? null,
  };
}

/**
 * Send an order to the mock or real FitSolver.
 *
 * The complete raw Solver response is preserved
 * for the existing PDF export functionality.
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
    const { solve, SolveAlgorithm } = await import(
      "@bionic/solver"
    );

    console.log("[solver] REQUEST:");
    console.dir(request, { depth: null });

    const result = await solve({
      ...request,
      algorithm: SolveAlgorithm.ExtremePoint,
      options: {},
    });

    console.log("[solver] RAW RESPONSE:");
    console.dir(result, { depth: null });

    const normalisedResult =
      normaliseSolverResponse(result, order);

    console.log("[solver] VISUALIZER RESPONSE:");
    console.dir(normalisedResult, {
      depth: null,
    });

    return {
      ...normalisedResult,

      // Preserve the original FitSolver response.
      // Used by the raw-response PDF export.
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
