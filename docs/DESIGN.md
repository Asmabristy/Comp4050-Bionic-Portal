---
name: Bionic Portal
description: An industrial parts-standard sheet for a warehouse packing system, in Thomax's own two blues on white — flat ink on plate stock, a full-height field rail, and every millimetre set as a drafting dimension.
colors:
  ground: "#EDF1F8"
  stock: "#FFFFFF"
  stock-wash: "#F4F7FC"
  stock-deep: "#E6EBF4"
  ink: "#10141C"
  ink-2: "#454D5C"
  ink-3: "#5C657A"
  rule: "#C9D2E2"
  field: "#012DAE"
  field-deep: "#011C6E"
  field-ink: "#F2F6FF"
  field-ink-2: "#9FB4EC"
  field-rule: "#2A51C4"
  signal: "#049DCE"
  signal-hover: "#2FB4E2"
  field-alert: "#FF9A91"
  status-draft: "#5C657A"
  status-packing: "#03769E"
  status-packed: "#012DAE"
  status-failed: "#B3261E"
typography:
  plate-name:
    fontFamily: "Archivo, 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  figure:
    fontFamily: "Archivo, 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: "1.625rem"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Archivo, 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  data:
    fontFamily: "Archivo, 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "'Archivo Narrow', Archivo, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.14em"
  section:
    fontFamily: "'Archivo Narrow', Archivo, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.15em"
  reference:
    fontFamily: "'Archivo Narrow', Archivo, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "0.055em"
rounded:
  none: "0"
spacing:
  s1: "4px"
  s2: "8px"
  s3: "12px"
  s4: "16px"
  s5: "24px"
  s6: "32px"
  s7: "48px"
  s8: "64px"
components:
  button-primary:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.signal-deep}"
    textColor: "{colors.ink}"
  button-primary-disabled:
    backgroundColor: "{colors.stock-wash}"
    textColor: "{colors.ink-3}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "12px 24px"
  button-ghost-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.stock}"
  button-danger:
    backgroundColor: "transparent"
    textColor: "{colors.status-failed}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "8px 12px"
  input:
    backgroundColor: "{colors.stock}"
    textColor: "{colors.ink}"
    typography: "{typography.data}"
    rounded: "{rounded.none}"
    padding: "8px 12px"
  plate:
    backgroundColor: "{colors.stock}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "24px"
  navcell:
    backgroundColor: "{colors.field}"
    textColor: "{colors.field-ink-2}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "16px 24px"
  navcell-hover:
    backgroundColor: "{colors.field-deep}"
    textColor: "{colors.field-ink}"
  navcell-active:
    backgroundColor: "{colors.stock}"
    textColor: "{colors.ink}"
---

# Design System: Bionic Portal

## Overview

Bionic Portal is drawn as an industrial parts-standard sheet. Every carton, item
and order is treated as a specified part with a number, a dimension table and a
line drawing, and the page is the sheet those things are printed on. It refuses
the arrangement this category always ships — white rounded cards floating on
tinted grey, one blue accent, a stat tile per metric, status as a coloured pill.

The product's content is numbers in millimetres, read by two people handing work
between them and demonstrated on a projector in a bright room. So the system is
light, flat, and ruled. Nothing has a radius, nothing has a shadow, nothing has
a gradient. Separation is done entirely with rule weight and stock tint, which
means alignment carries the whole page: a hairline that fails to meet reads as a
defect, and that pressure is the point.

The palette is Thomax's own, sampled from their logo and pinned: deep blue
`#012DAE`, light blue `#049DCE`, white. Deep blue is a field that owns whole
regions — the full-height navigation rail, the load plan, the sign-in plate —
rather than an accent sprinkled on grey. Light blue is the action colour and
appears only where something can actually be done; a disabled control loses it
entirely, so scanning a page for light blue is the same as scanning it for what
you can press. Navigation lives in that rail down the left, and the sheet you
have open is pulled out of it: the active cell inverts to plate white.

## Colors

### Primary

- **Field** `#012DAE` — Thomax deep blue, sampled from the logo. A committed
  field, not an accent: it owns the full-height navigation rail, the order's
  load plan, and the whole left half of sign-in. Carries `field-ink` `#F2F6FF`
  for text and `field-ink-2` `#9FB4EC` for secondary text (tinted from the hue,
  never grey). White on it reads at 10.6:1.
- **Field deep** `#011C6E` — a hovered nav cell and the FitVisualizer stage.
- **Field alert** `#FF9A91` — a named deficit read on the field colour.

### Secondary

- **Signal** `#049DCE` — Thomax light blue, sampled from the logo. The action
  colour. Primary buttons and every focus ring, and nothing else. Ink on it
  reads at 5.8:1. Hover **lifts** to `signal-hover` `#2FB4E2` rather than
  deepening, because a darker fill would lose the ink text. It never appears on
  anything inert — not on the load plan's fill, which is plate white, and not
  on the active nav cell, which inverts instead.

### Tertiary — the status inks

Deliberately desaturated so informational never competes with actionable:
`status-draft` `#5C657A` (graphite), `status-packing` `#03769E` (deep sky),
`status-packed` `#012DAE` (the field blue), `status-failed` `#B3261E` (oxide
red — the one colour outside the brand three, kept because a failure has to
read as a failure).

### Neutral

- **Ground** `#E7E9E4` — the desk a sheet lies on.
- **Stock** `#F4F4F1` — the plate itself. Cool, slightly green-cast; not cream.
- **Stock wash** `#EDEFEA` — zebra rows, toolbars, section heads, action bands.
- **Stock deep** `#E1E4DD` — the third tint, used for the right face of a drawing.
- **Ink** `#15171A`, **ink-2** `#474E53` (7.0:1), **ink-3** `#5F676D` (5.0:1,
  the floor for placeholders), **rule** `#C7CBC4` (hairlines only, never text).

### Named Rules

- **The light-blue rule.** Light blue marks what can be done and nothing else.
  A disabled control drops to `stock-wash` on `rule` with `ink-3` text. If an
  element is light blue and cannot be clicked, it is a bug.
- **Status never borrows the action colour.** Status lives in its own ink family
  and is carried by a mark in a fixed cell, not by a tint on a pill.
- **Colour owns regions, not edges.** A field colour fills a whole topbar or a
  whole plate. There are no coloured side stripes and no tinted card borders.

## Typography

Two faces, both Archivo, loaded from Google Fonts.

- **Archivo** — everything that is read as language: plate names, figures, body,
  table data.
- **Archivo Narrow** — everything that is read as a label: field labels, column
  heads, section titles, order and item references, status words, legends. Always
  uppercase, always tracked, weight 600–700.

There is no monospace anywhere in the system. Alignment of numbers is handled by
`font-variant-numeric: tabular-nums`, which is applied to every table cell,
figure and measured value.

### Hierarchy

| Role | Face | Size | Weight | Tracking |
|---|---|---|---|---|
| Plate name | Archivo | 1.75rem | 600 | -0.02em |
| Figure (spec strip) | Archivo | 1.625rem | 600 | -0.02em |
| Measure annotation | Archivo | 1.125rem (1.75rem lead) | 700 | -0.01em |
| Section title | Archivo Narrow | 0.8125rem | 700 | 0.15em, caps |
| Body | Archivo | 0.875rem | 400 | normal |
| Table data | Archivo | 0.8125rem | 400 | normal |
| Label / column head | Archivo Narrow | 0.6875rem | 600 | 0.14em, caps |
| Reference / code | Archivo Narrow | 0.8125rem | 600 | 0.055em |

### Named Rules

- **Labels are narrow, tracked and capital. Content is not.** The moment a label
  is set in sentence case it stops reading as a field name.
- **Figures are tabular, always.** Numbers in a register must form a column.
- **A page name never carries a label above it.** The title block states the
  name first, then its field/value pairs underneath.

## Layout

- A two-column shell: a 240px navigation rail and the main column. Below
  1080px the rail lies down across the top as a strip.
- Content width `min(1420px, 100% - var(--gutter))`, gutter 48px → 32px at
  1080px → 24px at 600px. The top strip's contents sit on the sheet's own left
  edge at any width.
- Spacing scale is a 4px drafting grid: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64.
- Every page is a stack of plates separated by 24px of ground.
- Rule weights are the only dividers: **2px ink** closes a plate and its head;
  **1px ink** divides one ruled section from the next; **1px `rule`** divides
  rows and cells inside a section.
- Breakpoints: 1080px (two-column layouts collapse), 860px (spec strips go 2×2,
  the topbar wraps), 600px (phone).
- Registers scroll horizontally rather than squeezing; `table` carries a
  620px min-width inside its scroll container.

## Elevation & Depth

There is none, and that is a rule rather than an omission. No `box-shadow`
anywhere in the system, no blur, no translucency, no layering effects. Depth is
communicated by rule weight and stock tint alone: a 2px edge closes a sheet, a
1px ink rule separates sections, a wash tint recedes.

### Named Rules

- **No shadow, ever.** If something needs to separate, give it a rule or a tint.
- **No gradient, ever.** The one exception is a 45° `repeating-linear-gradient`
  used as a flat hatch inside the 10px "packing" status mark; it is a pattern,
  not a blend.

## Shapes

`border-radius: 0` everywhere, including inputs, buttons, marks and avatars.
Icons are drawn SVG at 1.5 stroke with `stroke-linecap: square` and
`stroke-linejoin: miter`; rounded rectangles were removed from the icon set so
the drawing matches the page. Status marks are 10px squares: hollow for draft,
hatched for packing, filled for packed and failed.

## Components

### Buttons

Rectangular plates, 1px ink border, Archivo Narrow caps tracked 0.13em.
Primary is Thomax light blue with ink text. Ghost is transparent with an ink border and
inverts to ink-on-stock on hover. Danger is a `status-failed` outline that fills
on hover. `btn-small` drops to 8px/12px padding and 0.6875rem. Disabled drops the
action colour entirely.

### Inputs

1px `ink-3` border on stock, no radius, 8px/12px padding, tabular figures.
Hover darkens the border to ink; focus takes an ink border plus a 2px chrome
yellow outline at 1px offset. Inside a register, inputs lose their box and keep
only a bottom hairline, so the table stays a table while it is being edited.
`select` draws its own chevron; `checkbox` draws its own tick; `file` inputs get
a dashed border and a bordered file-selector button.

### Cards / Containers

**Plate** is the only container. A 2px ink border on stock, with a head divided
by a 2px rule and any number of ruled sections below it. Plates are never
nested, never shadowed, never rounded. A section head (`sectionhead`) sits on a
`stock-wash` band with a 1px `rule` under it, and takes a 1px ink rule above it
when it is not the first in the plate.

### Navigation

A full-height deep-blue rail down the left, 240px, sticky to the viewport: the
stencilled identity stacked at the top behind a `field-rule` divider, then nav
as stacked cells, each an icon and a tracked label, divided by hairlines.
Administration follows the list behind its own rule. A hovered cell darkens to
`field-deep`; **the active cell inverts to plate white with ink text**, so the
rail shows which sheet is currently on the desk. No accent stripe: a coloured
border down one edge of a list item is the side-tab tell, and it was removed.
Below 1080px the rail lies down across the top and the cells flow into rows; at
≤600px they sit two to a row at 46px tall.

### Top strip

A slim white band at the head of the main column, closed by a hairline: the
sheet's date at the left in tracked caps, the account block and sign-out at the
right. The date lives here once rather than in every title block.

### Title block

The page's provenance, notched into the top-left corner of its plate: the page
name at 1.75rem, a 1px rule, then field/value pairs divided by vertical
hairlines — ISSUED TO, ROLE, DATE on the dashboard; REFERENCE, ITEM ROWS, UNITS
on a form; STATUS, ITEMS, UNITS, CARTONS OFFERED, RAISED on an order. Every
field carries real data; nothing is invented to fill the block.

### Measure (signature component)

A measured value drawn as a drafting dimension: a 1px ink centre rule, a witness
tick at each end, a fill band in the field colour, and the figure annotated at
the point the measurement ends — reversed out of the fill once the fill is wide
enough to hold it, stepping outside onto the stock when it is not. Underneath,
the deficit on its own line with a 2px leader: what did not fit is named
(`NOT PACKED — 3 ITEMS`), never folded into the percentage. On a field-coloured
plate the fill becomes plate white and the annotation reverses to the field
blue — never the action colour, because nothing on that plate is clickable.

### Axon (signature component)

A 30° axonometric wireframe of a box with a labelled dimension line on each of
its three axes: extension lines from the feature, oblique witness ticks, and the
value set in Archivo Narrow. Faces are three flat stock tints, never shaded.
Labels use the product's own field names — W across, L back, D up — so a column
of numbers headed "Depth" can never again be mistaken for the horizontal one.

## Do's and Don'ts

### Do:

- Give every page a plate and a title block carrying real data.
- Set every field label, column head and reference in Archivo Narrow caps,
  tracked, and every figure in tabular numerals.
- Reserve light blue for things that can be done, and take it away when they
  cannot.
- Draw a measured value as a dimension, and name its deficit on its own line.
- Let a field colour own a whole region when a region deserves the weight.
- Theme the browser's own surfaces: selection, caret, scrollbars, focus rings.

### Don't:

- Don't add a radius, a shadow, a gradient or a translucent layer.
- Don't put a label above a heading.
- Don't use a status colour where an action colour belongs, or the reverse.
- Don't mark an active nav item with a coloured edge stripe; invert it instead.
- Don't use monospace to signal "technical"; use tabular figures.
- Don't put a Unicode glyph where an icon belongs.
- Don't let a register squeeze a column away; let it scroll.
