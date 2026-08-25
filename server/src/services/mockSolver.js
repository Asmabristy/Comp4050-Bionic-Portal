/**
 * Stand-in for FitSolver so we can demo the pipeline before Solver ships.
 * Shelf packing: fill a row, then a layer, then start a new box.
 * Not a real optimiser. Set USE_MOCK_SOLVER=false to use the real thing.
 */

function packIntoBox(container, queue) {
  const placed = [];

  let cursorX = 0;
  let cursorY = 0;
  let cursorZ = 0;

  let rowDepth = 0;
  let layerHeight = 0;
  let weight = 0;

  let i = 0;

  while (i < queue.length) {
    const item = queue[i];

    const overWeight =
      container.maxWeight != null &&
      container.maxWeight > 0 &&
      weight + (item.weight || 0) > container.maxWeight;

    const tooLarge =
      item.width > container.width ||
      item.length > container.length ||
      item.depth > container.depth;

    if (overWeight || tooLarge) {
      i++;
      continue;
    }

    // Start a new row along the depth axis.
    if (cursorX + item.width > container.width) {
      cursorX = 0;
      cursorZ += rowDepth;
      rowDepth = 0;
    }

    // Start a new layer.
    if (cursorZ + item.depth > container.depth) {
      cursorZ = 0;
      cursorY += layerHeight;
      layerHeight = 0;
    }

    // No more vertical space in this box.
    if (cursorY + item.length > container.length) {
      break;
    }

    placed.push({
      itemId: item.itemCode,

      position: {
        x: cursorX,
        y: cursorY,
        z: cursorZ,
      },

      rotation: "XYZ",

      dimensions: {
        w: item.width,
        h: item.length,
        d: item.depth,
      },
    });

    weight += item.weight || 0;

    cursorX += item.width;

    rowDepth = Math.max(
      rowDepth,
      item.depth
    );

    layerHeight = Math.max(
      layerHeight,
      item.length
    );

    // Remove successfully packed item.
    queue.splice(i, 1);
  }

  return placed;
}

export function mockPack({ boxes, items }) {
  if (!boxes?.length) {
    return {
      status: "error",
      message: "No carton types available to pack into.",
      boxes: [],
      unpacked: items.map((item) => item.itemCode),
    };
  }

  /*
   * Biggest items first.
   * This is still only a simple mock algorithm.
   */
  const queue = [...items].sort(
    (a, b) =>
      b.width * b.length * b.depth -
      a.width * a.length * a.depth
  );

  const bySize = [...boxes].sort(
    (a, b) =>
      b.width * b.length * b.depth -
      a.width * a.length * a.depth
  );

  const largest = bySize[0];

  const packedBoxes = [];

  let guard = 0;

  while (queue.length > 0 && guard < 50) {
    guard++;

    const before = queue.length;

    /*
     * Prefer the smallest carton that can pack
     * at least one remaining item.
     */
    let chosen = null;

    for (const box of [...bySize].reverse()) {
      const attempt = packIntoBox(
        box,
        [...queue]
      );

      if (attempt.length > 0) {
        chosen = box;
        break;
      }
    }

    if (!chosen) {
      break;
    }

    /*
     * Run again using the real queue so successfully
     * packed items are removed.
     */
    const placed = packIntoBox(
      chosen,
      queue
    );

    if (placed.length === 0) {
      break;
    }

    packedBoxes.push({
      boxId: chosen.reference,

      dimensions: {
        w: chosen.width,
        h: chosen.length,
        d: chosen.depth,
      },

      items: placed,
    });

    if (queue.length === before) {
      break;
    }
  }

  const oversized = queue.filter(
    (item) =>
      item.width > largest.width ||
      item.length > largest.length ||
      item.depth > largest.depth
  );

  return {
    status: "success",

    message:
      oversized.length > 0
        ? "Some items do not fit any available carton."
        : "",

    boxes: packedBoxes,

    unpacked: queue.map(
      (item) => item.itemCode
    ),
  };
}