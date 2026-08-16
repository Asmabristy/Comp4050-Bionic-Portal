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
    const overWeight = container.maxWeight > 0 && weight + (item.weight || 0) > container.maxWeight;

    if (overWeight || item.w > container.w || item.h > container.h || item.d > container.d) {
      i++;
      continue;
    }

    // Next row along the depth axis.
    if (cursorX + item.w > container.w) {
      cursorX = 0;
      cursorZ += rowDepth;
      rowDepth = 0;
    }
    // Next layer up.
    if (cursorZ + item.d > container.d) {
      cursorZ = 0;
      cursorY += layerHeight;
      layerHeight = 0;
    }
    // Box is full.
    if (cursorY + item.h > container.h) break;

    placed.push({
      itemId: item.itemId,
      position: { x: cursorX, y: cursorY, z: cursorZ },
      rotation: "XYZ",
      dimensions: { w: item.w, h: item.h, d: item.d },
    });

    weight += item.weight || 0;
    cursorX += item.w;
    rowDepth = Math.max(rowDepth, item.d);
    layerHeight = Math.max(layerHeight, item.h);
    queue.splice(i, 1);
  }

  return placed;
}

export function mockPack({ orderId, items, containers }) {
  if (!containers?.length) {
    return {
      orderId,
      status: "error",
      message: "No container types available to pack into.",
      boxes: [],
      unpacked: items.map((i) => i.itemId),
    };
  }

  // Biggest first (first-fit-decreasing).
  const queue = [...items].sort((a, b) => b.w * b.h * b.d - a.w * a.h * a.d);
  const bySize = [...containers].sort((a, b) => b.w * b.h * b.d - a.w * a.h * a.d);
  const largest = bySize[0];

  const boxes = [];
  let guard = 0;

  while (queue.length > 0 && guard < 50) {
    guard++;
    const before = queue.length;

    // Prefer the smallest carton that actually takes something.
    let chosen = null;
    for (const container of [...bySize].reverse()) {
      const attempt = packIntoBox(container, [...queue]);
      if (attempt.length > 0) {
        chosen = container;
        break;
      }
    }

    if (!chosen) break;

    // Re-run on the live queue so the items actually get removed.
    const placed = packIntoBox(chosen, queue);
    if (placed.length === 0) break;

    boxes.push({
      boxId: chosen.boxId,
      dimensions: { w: chosen.w, h: chosen.h, d: chosen.d },
      items: placed,
    });

    if (queue.length === before) break; // no progress, bail out
  }

  const oversized = queue.filter(
    (i) => i.w > largest.w || i.h > largest.h || i.d > largest.d
  );

  return {
    orderId,
    status: "success",
    message: oversized.length ? "Some items do not fit any available carton." : "",
    boxes,
    unpacked: queue.map((i) => i.itemId),
  };
}
