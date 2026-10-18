/**
 * A measured value, drawn as a drafting dimension.
 *
 * A centre rule with a witness tick at each end, a fill band along it, and the
 * figure annotated on the line where the measurement ends — so the number is
 * attached to the thing it measures instead of floating above a label. The
 * deficit gets its own line underneath: what did not fit is named, never
 * buried inside a percentage.
 */
export function Measure({
  label,
  ratio,
  percent,
  value,
  unit = "%",
  deficit,
  short = false,
  lead = false,
  failed = false,
}) {
  const pct = Number.isFinite(percent)
    ? Math.min(Math.max(percent, 0), 100)
    : 0;

  /*
   * The annotation sits at the end of the measurement, the way a dimension
   * figure does. Once the fill is wide enough to hold it, it reverses out
   * inside the band; below that it steps outside onto the stock, so a short
   * measure never hides its own figure.
   */
  const inside = pct >= 26;
  const at = Math.min(Math.max(pct, 2), 98);

  return (
    <div
      className={[
        "measure",
        lead ? "measure--lead" : "",
        failed ? "measure--failed" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="measure__head">
        <span className="measure__label">{label}</span>
        {ratio && <span className="measure__ratio">{ratio}</span>}
      </div>

      <div className="measure__track">
        <div className="measure__fill" style={{ width: `${pct}%` }} />

        <span className="measure__tick measure__tick--start" />
        <span className="measure__tick measure__tick--end" />

        <span
          className={`measure__value ${
            inside ? "measure__value--inside" : "measure__value--outside"
          }`}
          style={{ left: `${at}%` }}
        >
          {value}
          {unit && <span className="measure__unit">{unit}</span>}
        </span>
      </div>

      {deficit && (
        <p
          className={`measure__deficit ${
            short ? "measure__deficit--short" : ""
          }`.trim()}
        >
          {deficit}
        </p>
      )}
    </div>
  );
}
