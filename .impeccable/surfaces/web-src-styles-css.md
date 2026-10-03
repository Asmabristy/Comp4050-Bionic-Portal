---
version: 1
slug: "web-src-styles-css"
primary_target: "web/src/styles.css"
related_targets: ["web/src/App.jsx","web/src/components/Layout.jsx","web/src/pages"]
---

# Surface brief — FitPortal application UI

## Scope

Every authenticated page plus Login: Dashboard, Orders, Order Detail, New Order,
Cartons, Administration, Login. Visual design only. Routing, API calls, auth,
and the FitSolver / FitVisualizer integration logic are out of scope and must
not change. The Visualiser repository is not ours to edit.

## Visitor mode

**Operate.** A supervisor or operator completes a task; an assessor and the
client watch it happen on a laptop or a lecture-theatre projector in a bright
room. Expression may never obscure the task, the state, or a familiar
affordance. Navigation and controls stay standard web.

## Audience, job, task

- **Operator** raises an order: reference, items by hand or CSV, cartons, save.
- **Supervisor** does all of that, plus packs and re-packs, and manages access.
- The queue is shared, so the surface's hardest job is making another person's
  order legible at a glance: whose, what state, how full, what did not fit.
- Dimensions are millimetres, weight kilograms. Numbers are the content.

## Constraints

- Plain CSS, one file: `web/src/styles.css`. React + Vite.
- The names **Bionic Portal** and **Project Perfect Fit** stay.
- `result.boxes` keeps `{ w, h, d }`. Renaming breaks FitVisualizer.
- No invented data. Every figure on screen comes from the API.

## Direction contract

**THESIS** — Every carton, item and order in FitPortal is a specified part with
a number, a dimension table and a line drawing; the measurement is the design.
It refuses the arrangement this category always ships and the one this repo
currently has: white rounded cards floating on tinted grey, one blue accent, a
stat tile per metric, status as a coloured pill.

**OWN-WORLD** — Plate-white uncoated stock `#F4F4F1`, ink `#15171A`, and spruce
green `#13342B` as a committed field that owns whole regions: the topbar is a
solid green plate, Login is drenched in it, the load plan sits on it. Chrome
yellow `#F2C200` is the single action colour and appears only where something
can actually be done; a disabled control loses it entirely. Status carries in a
separate desaturated ink family — graphite, green rule, oxide red `#9E3A26` —
so informational never competes with actionable. Division is rule weight and
stock tint alone: hairlines at 1px, plate edges at 2px, zero border-radius,
zero gradient, zero shadow anywhere. Type is Archivo with Archivo Narrow
uppercase and tracked for every field label, column head and reference; all
figures tabular. No monospace. Boxes are drawn as 30-degree axonometric
wireframe, never as an icon or a photo.

**STORY** — The visitor understands that this is one system of record where
every object is measured and specified. They believe the numbers because the
surface shows which axis each one belongs to. They raise an order, pack it, and
read the result without asking anyone what a figure means.

**FIRST VIEWPORT** (Dashboard, 1440×900) — A full-bleed spruce-green topbar
plate: `BIONIC PORTAL` stencilled in tracked Archivo Narrow at the left, nav as
fixed cells divided by hairlines, the active cell marked with a chrome-yellow
bar, account and role at the far right. Below it the sheet opens with a 2px ink
plate edge. In the plate's top-left corner, a ruled title block — a real
specification table of field/value pairs: SHEET, ISSUED TO, ROLE, DATE. No
eyebrow, no plate number, no invented sheet count. Hard right on that same row,
the only chrome-yellow element above the fold: `RAISE ORDER`. Beneath the title
block, the page's one subject at full width — the capacity measure, drawn as a
drafting dimension: a horizontal rule with witness ticks at each end, the fill
in spruce green, the figure set on the line as an annotation, and the deficit
named on its own line (`NOT PACKED — n items`), never buried in a percentage.
Under it a four-cell specification strip on a single hairline: tabular figure
over tracked caps label, cells divided by vertical hairlines, no tiles. Then the
order register: a true ruled table, zebra as a 3% green stock wash, status as a
mark in a fixed cell, reference in tracked Narrow caps.

**SIGNATURE INTERACTION** — *Taking the measurement.* Any measured value in the
app renders as a dimension line: value on the rule, witness ticks at both ends.
On Cartons and the New Order preview the three axes draw as three labelled
dimension lines over the axonometric box, so W, D and H are never ambiguous —
the exact confusion this project just spent a week fixing. Hovering a dimension
line raises its witness ticks and its figure to full ink.

**MOTION GRAMMAR** — One authored moment: the measure is taken. On load and on
every data change, a capacity measure's fill and witness ticks draw from the
left over 520ms on an exponential ease-out, from an already-visible default
state. Nothing else animates on entry. Controls transition ink and rule weight
only, 120ms. `prefers-reduced-motion` parks the measure at its final value.

**FORM** — Standards Sheet: DIN/ISO parts-standard sheets and 1960s German
industrial catalogues. Candidate 3 of 7 on my grounded list, assigned by the
roll; seed key `3691f011`, mode `operate`, code-led (no image generation in this
session, so no comps — the ambition rides in FIRST VIEWPORT, the signature
interaction and the motion grammar, audited in behaviour at the finish).

**RAISES** — Action-colour discipline, from the warm consumer-app canon: yellow
only where something can be done, gone when disabled. Flat colour at region
scale, from the zoo guide map: no gradient, no shadow, colour owning regions
rather than accenting grey. One subject owns the viewport, from the vertical
feed: on Order Detail the load plan is a full-width plate at full scale, not a
card in a tile grid. The capacity budget always visible, from the cassette
j-card: fill against capacity as a measured figure with overflow named as a
deficit.

**FINISH** — unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, DESIGN.md, and every shipping raster carrying its
provenance

## Memorable moment

The three dimension lines over an axonometric carton on the Cartons page:
the one place in the product where width, depth and height can never be mixed up
again.

## Unresolved

- The user declined to pick a direction ("just change the UI man keep the
  features same"), so the assigned direction was built unattended. Alternates
  still on the table if they want them: Consignment Manifest, Split-Flap
  Concourse, Timetable Slide Rack, or the category standard.
- Open registration and unrestricted carton writes are known security holes,
  out of scope for a visual refactor.
