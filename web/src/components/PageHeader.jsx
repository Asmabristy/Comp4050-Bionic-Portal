/**
 * The header every page opens with: small eyebrow, big title, one line of
 * explanation, and an optional action on the right.
 *
 * Pages were each rolling their own heading markup, which is why Orders looked
 * nothing like Dashboard. One component keeps them in step.
 */
export function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <div className="pagehead">
      <div className="pagehead__text">
        {eyebrow && <div className="pagehead__eyebrow">{eyebrow}</div>}

        <h1 className="pagehead__title">{title}</h1>

        {subtitle && <p className="pagehead__subtitle">{subtitle}</p>}
      </div>

      {actions && <div className="pagehead__actions">{actions}</div>}
    </div>
  );
}

/**
 * Header for a card: a tinted icon tile, a title, a supporting line, and an
 * optional link or control on the right.
 */
export function SectionHeader({ icon, title, subtitle, actions, tone = "blue" }) {
  return (
    <div className="sectionhead">
      {icon && <div className={`sectionhead__icon tone-${tone}`}>{icon}</div>}

      <div className="sectionhead__text">
        <h2 className="sectionhead__title">{title}</h2>
        {subtitle && <p className="sectionhead__subtitle">{subtitle}</p>}
      </div>

      {actions && <div className="sectionhead__actions">{actions}</div>}
    </div>
  );
}
