/**
 * Decoration behind the dashboard header: an isometric carton, a soft wash of
 * colour, and the three-step caption.
 *
 * Purely presentational — aria-hidden and pointer-events:none so it never
 * catches a click or reaches a screen reader. It hides on narrow screens where
 * there isn't room for it beside the heading.
 */
export function HeroDecor() {
  return (
    <div className="herodecor" aria-hidden="true">
      <div className="herodecor__steps">
        <span>Streamline</span>
        <span>Pack</span>
        <span>Deliver</span>
        <i className="herodecor__rule" />
      </div>

      <svg
        className="herodecor__cube"
        viewBox="0 0 200 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="cubeTop" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#dbe4ff" />
            <stop offset="100%" stopColor="#eef2ff" />
          </linearGradient>
          <linearGradient id="cubeLeft" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c7d5fe" />
            <stop offset="100%" stopColor="#e6ecff" />
          </linearGradient>
          <linearGradient id="cubeRight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e8eeff" />
            <stop offset="100%" stopColor="#f6f8ff" />
          </linearGradient>
        </defs>

        {/* top face */}
        <path d="M100 12 190 62 100 112 10 62Z" fill="url(#cubeTop)" />
        {/* left face */}
        <path d="M10 62 100 112v98L10 160Z" fill="url(#cubeLeft)" />
        {/* right face */}
        <path d="M190 62 100 112v98l90-50Z" fill="url(#cubeRight)" />

        {/* edges, kept faint so it reads as a watermark */}
        <g stroke="#c3d0fb" strokeWidth="1.4" strokeLinejoin="round">
          <path d="M100 12 190 62 100 112 10 62Z" />
          <path d="M10 62v98l90 50 90-50V62" />
          <path d="M100 112v98" />
        </g>
      </svg>

      <span className="herodecor__glow herodecor__glow--a" />
      <span className="herodecor__glow herodecor__glow--b" />
    </div>
  );
}
