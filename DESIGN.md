---
name: Bionic Portal
description: An industrial parts-standard sheet for a warehouse packing system — flat ink on plate stock, one committed field colour, and every millimetre set as a drafting dimension.
colors:
  ground: "#E7E9E4"
  stock: "#F4F4F1"
  stock-wash: "#EDEFEA"
  stock-deep: "#E1E4DD"
  ink: "#15171A"
  ink-2: "#474E53"
  ink-3: "#5F676D"
  rule: "#C7CBC4"
  field: "#13342B"
  field-deep: "#0C2017"
  field-ink: "#EAEFE8"
  field-ink-2: "#9FB6A7"
  field-rule: "#2C4F43"
  signal: "#F2C200"
  signal-deep: "#D4A900"
  status-draft: "#5F676D"
  status-packing: "#87670F"
  status-packed: "#1F5C3D"
  status-failed: "#9E3A26"
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
  nav-link:
    backgroundColor: "{colors.field}"
    textColor: "{colors.field-ink-2}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 24px"
  nav-link-active:
    backgroundColor: "{colors.field-deep}"
    textColor: "{colors.field-ink}"
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

Two colours do real work. Spruce green is a field that owns whole regions — the
topbar, the load plan, the sign-in plate — rather than an accent sprinkled on
grey. Chrome yellow is the action colour and appears only where something can
actually be done; a disabled control loses it entirely, so scanning a page for
yellow is the same as scanning it for what you can press.

## Colors

### Primary

- **Field** `#13342B` — spruce green. A committed field, not an accent: it owns
  the topbar, the order's load plan, and the whole left half of sign-in. Carries
  `field-ink` `#EAEFE8` for text and `field-ink-2` `#9FB6A7` for secondary text
  (tinted from the hue, never grey).
- **Field deep** `#0C2017` — the active nav cell and the FitVisualizer stage.

### Secondary

- **Signal** `#F2C200` — chrome yellow. The action colour. Primary buttons, the
  active nav cell's mark, every focus ring, and the load plan's fill. Hover goes
  to `signal-deep` `#D4A900`. It never appears on anything inert.

### Tertiary — the status inks

Deliberately desaturated so informational never competes with actionable:
`status-draft` `#5F676D`, `status-packing` `#87670F`, `status-packed` `#1F5C3D`,
`status-failed` `#9E3A26`.

### Neutral

- **Ground** `#E7E9E4` — the desk a sheet lies on.
- **Stock** `#F4F4F1` — the plate itself. Cool, slightly green-cast; not cream.
- **Stock wash** `#EDEFEA` — zebra rows, toolbars, section heads, action bands.
- **Stock deep** `#E1E4DD` — the third tint, used for the right face of a drawing.
- **Ink** `#15171A`, **ink-2** `#474E53` (7.0:1), **ink-3** `#5F676D` (5.0:1,
  the floor for placeholders), **rule** `#C7CBC4` (hairlines only, never text).

### Named Rules

- **The yellow rule.** Chrome yellow marks what can be done and nothing else. A
  disabled control drops to `stock-wash` on `rule` with `ink-3` text. If an
  element is yellow and cannot be clicked, it is a bug.
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

- Content width `min(1420px, 100% - var(--gutter))`, gutter 48px → 32px at
  1080px → 24px at 600px.
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
Primary is chrome yellow on ink. Ghost is transparent with an ink border and
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

A solid field plate across the top: the stencilled identity at the left behind a
`field-rule` divider, nav as fixed cells divided by hairlines, the account block
at the right. The active cell darkens to `field-deep` and takes a 3px chrome
yellow bar at its foot. At ≤600px the nav wraps into a two-column grid of 44px
cells so every destination stays reachable.

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
plate the fill becomes chrome yellow and the annotation reverses to ink.

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
- Reserve chrome yellow for things that can be done, and take it away when they
  cannot.
- Draw a measured value as a dimension, and name its deficit on its own line.
- Let a field colour own a whole region when a region deserves the weight.
- Theme the browser's own surfaces: selection, caret, scrollbars, focus rings.

### Don't:

- Don't add a radius, a shadow, a gradient or a translucent layer.
- Don't put a label above a heading.
- Don't use a status colour where an action colour belongs, or the reverse.
- Don't use monospace to signal "technical"; use tabular figures.
- Don't put a Unicode glyph where an icon belongs.
- Don't let a register squeeze a column away; let it scroll.
