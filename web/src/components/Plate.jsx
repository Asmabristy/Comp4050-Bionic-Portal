/**
 * The sheet every page is drawn on.
 *
 * A plate is a bordered sheet with a title block notched into its top-left
 * corner. The title block is a real specification table — the page's name,
 * then field/value pairs carrying who it was issued to, their role, and the
 * date — so the page states its own provenance the way a drawing does.
 */
export function Plate({ children, className = "" }) {
  return (
    <section className={`plate ${className}`.trim()}>{children}</section>
  );
}

/**
 * Title block. `fields` is a list of { label, value }; nothing is invented,
 * so a page with no record reference simply shows fewer fields.
 */
export function TitleBlock({ name, fields = [], actions }) {
  return (
    <div className="plate__head">
      <div className="titleblock">
        <h1 className="titleblock__name">{name}</h1>

        {fields.length > 0 && (
          <dl className="titleblock__fields">
            {fields.map((field) => (
              <div key={field.label}>
                <dt>{field.label}</dt>
                <dd>{field.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      {actions && <div className="plate__actions">{actions}</div>}
    </div>
  );
}

/** A ruled section head inside a plate. */
export function SectionHead({ title, note, actions, icon }) {
  return (
    <div className="sectionhead">
      {icon && <div className="sectionhead__icon">{icon}</div>}

      <div className="sectionhead__text">
        <h2 className="sectionhead__title">{title}</h2>
        {note && <p className="sectionhead__subtitle">{note}</p>}
      </div>

      {actions && <div className="sectionhead__actions">{actions}</div>}
    </div>
  );
}

/** Today, set the way a title block sets a date. */
export function plateDate(value = new Date()) {
  return new Date(value)
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();
}
