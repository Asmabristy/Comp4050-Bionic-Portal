/**
 * A box, drawn the way a parts catalogue draws one: 30-degree axonometric
 * wireframe with a labelled dimension line on each of its three axes.
 *
 * The axes are labelled with the product's own field names — W for width,
 * L for length, D for depth — and each label sits on the edge it measures.
 * Width runs to the right, length runs back to the left, and depth is the
 * vertical one. That last fact is the whole reason this drawing exists: a
 * column of numbers headed "Depth" cannot tell you which way is up, and
 * getting that wrong is exactly the bug this project spent a week finding.
 */

const COS30 = Math.cos(Math.PI / 6);
const SIN30 = 0.5;

const num = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

const unit = (v) => {
  const len = Math.hypot(v[0], v[1]) || 1;
  return [v[0] / len, v[1] / len];
};

export function Axon({
  width,
  length,
  depth,
  span = 66,
  dimensions = true,
  title,
}) {
  const w = num(width);
  const l = num(length);
  const d = num(depth);

  const largest = Math.max(w, l, d);
  if (largest === 0) return null;

  const k = span / largest;
  const sw = Math.max(w * k, 7);
  const sl = Math.max(l * k, 7);
  const sh = Math.max(d * k, 7);

  // Front-bottom corner at the origin; y grows downward in SVG.
  const b0 = [0, 0];
  const b1 = [sw * COS30, -sw * SIN30];
  const b3 = [-sl * COS30, -sl * SIN30];
  const b2 = [b1[0] + b3[0], b1[1] + b3[1]];

  const lift = (p) => [p[0], p[1] - sh];
  const t0 = lift(b0);
  const t1 = lift(b1);
  const t2 = lift(b2);
  const t3 = lift(b3);

  const pts = [b0, b1, b2, b3, t0, t1, t2, t3];
  const poly = (list) => list.map((p) => p.join(",")).join(" ");

  /* --- dimension lines --------------------------------------------- */

  const lines = [];

  if (dimensions) {
    const dim = (from, to, normal, offset, label) => {
      const n = normal;
      const at = (p, o) => [p[0] + n[0] * o, p[1] + n[1] * o];

      const a = at(from, offset);
      const b = at(to, offset);

      // extension lines carry the feature out to the dimension line
      const ea = at(from, offset + 5);
      const eb = at(to, offset + 5);

      // oblique witness ticks, bisecting the line and its normal
      const u = unit([to[0] - from[0], to[1] - from[1]]);
      const slash = unit([u[0] + n[0], u[1] + n[1]]);
      const tick = (p) => [
        [p[0] - slash[0] * 3.5, p[1] - slash[1] * 3.5],
        [p[0] + slash[0] * 3.5, p[1] + slash[1] * 3.5],
      ];

      const mid = at(
        [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2],
        offset + 10
      );

      lines.push({ a, b, ea, eb, from, to, ticks: [tick(a), tick(b)], mid, label });

      pts.push(a, b, ea, eb, mid);
      pts.push(...tick(a), ...tick(b));
    };

    // width: outward from the bottom-right edge
    dim(b0, b1, [SIN30, COS30], 14, `W ${w}`);
    // length: outward from the bottom-left edge
    dim(b3, b0, [-SIN30, COS30], 14, `L ${l}`);
    // depth: outward from the right vertical edge
    dim(b1, t1, [1, 0], 16, `D ${d}`);
  }

  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);

  const padX = dimensions ? 26 : 4;
  const padY = dimensions ? 11 : 4;

  const minX = Math.min(...xs) - padX;
  const minY = Math.min(...ys) - padY;
  const boxW = Math.max(...xs) - Math.min(...xs) + padX * 2;
  const boxH = Math.max(...ys) - Math.min(...ys) + padY * 2;

  return (
    <svg
      className="axon axon-group"
      viewBox={`${minX.toFixed(1)} ${minY.toFixed(1)} ${boxW.toFixed(
        1
      )} ${boxH.toFixed(1)}`}
      preserveAspectRatio="xMidYMid meet"
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : "true"}
      focusable="false"
    >
      <polygon className="axon__face--top" points={poly([t0, t1, t2, t3])} />
      <polygon className="axon__face--right" points={poly([b0, b1, t1, t0])} />
      <polygon className="axon__face--left" points={poly([b0, b3, t3, t0])} />

      <g className="axon__edge" strokeLinecap="square" strokeLinejoin="miter">
        <polygon points={poly([t0, t1, t2, t3])} />
        <polyline points={poly([b1, b0, b3])} />
        <line x1={b0[0]} y1={b0[1]} x2={t0[0]} y2={t0[1]} />
        <line x1={b1[0]} y1={b1[1]} x2={t1[0]} y2={t1[1]} />
        <line x1={b3[0]} y1={b3[1]} x2={t3[0]} y2={t3[1]} />
      </g>

      {lines.map((line) => (
        <g key={line.label}>
          <g className="axon__dim" strokeLinecap="square">
            <line x1={line.a[0]} y1={line.a[1]} x2={line.b[0]} y2={line.b[1]} />
            <line
              x1={line.from[0]}
              y1={line.from[1]}
              x2={line.ea[0]}
              y2={line.ea[1]}
            />
            <line
              x1={line.to[0]}
              y1={line.to[1]}
              x2={line.eb[0]}
              y2={line.eb[1]}
            />
            {line.ticks.map((tick, index) => (
              <line
                key={index}
                x1={tick[0][0]}
                y1={tick[0][1]}
                x2={tick[1][0]}
                y2={tick[1][1]}
              />
            ))}
          </g>

          <text
            className="axon__text"
            x={line.mid[0]}
            y={line.mid[1]}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {line.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
