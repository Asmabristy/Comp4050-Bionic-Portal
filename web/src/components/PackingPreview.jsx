/**
 * Top-down 2D plan of one packed carton. The 3D view is FitVisualizer's job;
 * this is just our own check that Solver's coordinates look sane.
 */

const PAD = 34;
const CANVAS_W = 300;
const CANVAS_H = 200;

export function PackingPreview({ box }) {
  const { dimensions, items = [], boxId } = box;
  const scale = Math.min(
    (CANVAS_W - PAD * 2) / dimensions.w,
    (CANVAS_H - PAD * 2) / dimensions.d
  );

  const planW = dimensions.w * scale;
  const planD = dimensions.d * scale;
  const originX = PAD;
  const originY = PAD;

  return (
    <svg
      viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
      width="100%"
      role="img"
      aria-label={`Top-down plan of carton ${boxId} holding ${items.length} items`}
    >
      {/* carton footprint */}
      <rect
        x={originX}
        y={originY}
        width={planW}
        height={planD}
        fill="var(--kraft-soft)"
        stroke="var(--kraft)"
        strokeWidth="1.5"
      />

      {/* items, placed from Solver's x/z */}
      {items.map((item, i) => (
        <g key={`${item.itemId}-${i}`}>
          <rect
            x={originX + item.position.x * scale}
            y={originY + item.position.z * scale}
            width={Math.max(item.dimensions.w * scale, 1)}
            height={Math.max(item.dimensions.d * scale, 1)}
            fill="var(--card)"
            stroke="var(--ink)"
            strokeWidth="1"
            fillOpacity="0.85"
          />
          <title>
            {item.itemId} — {item.dimensions.w}×{item.dimensions.h}×{item.dimensions.d} at (
            {item.position.x}, {item.position.y}, {item.position.z}) rot {item.rotation}
          </title>
        </g>
      ))}

      {/* width callout */}
      <g stroke="var(--slate)" strokeWidth="0.75" fontFamily="var(--mono)" fontSize="7">
        <line x1={originX} y1={originY - 12} x2={originX + planW} y2={originY - 12} />
        <line x1={originX} y1={originY - 16} x2={originX} y2={originY - 8} />
        <line x1={originX + planW} y1={originY - 16} x2={originX + planW} y2={originY - 8} />
        <text
          x={originX + planW / 2}
          y={originY - 16}
          textAnchor="middle"
          fill="var(--slate)"
          stroke="none"
        >
          {dimensions.w}
        </text>

        {/* depth callout */}
        <line x1={originX - 12} y1={originY} x2={originX - 12} y2={originY + planD} />
        <line x1={originX - 16} y1={originY} x2={originX - 8} y2={originY} />
        <line x1={originX - 16} y1={originY + planD} x2={originX - 8} y2={originY + planD} />
        <text
          x={originX - 16}
          y={originY + planD / 2}
          textAnchor="middle"
          fill="var(--slate)"
          stroke="none"
          transform={`rotate(-90 ${originX - 16} ${originY + planD / 2})`}
        >
          {dimensions.d}
        </text>
      </g>
    </svg>
  );
}

/** Rough volume utilisation, for the fill bar. */
export function volumeFill(box) {
  const capacity = box.dimensions.w * box.dimensions.h * box.dimensions.d;
  if (!capacity) return 0;
  const used = box.items.reduce(
    (sum, i) => sum + i.dimensions.w * i.dimensions.h * i.dimensions.d,
    0
  );
  return Math.min(100, Math.round((used / capacity) * 100));
}
