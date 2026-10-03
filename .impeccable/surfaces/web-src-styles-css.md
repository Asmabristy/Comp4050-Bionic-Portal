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

**OWN-WORLD** — Pinned by the user to Thomax's own identity, sampled from
their logo: deep blue `#012DAE`, light blue `#049DCE`, white. *Material
translation, named:* the direction's spruce-green field becomes Thomax deep
blue and its chrome-yellow signal becomes Thomax light blue; the roll's
topology, controls, state vocabulary and ritual are untouched. White `#FFFFFF`
plates sit on a blue-tinted desk `#EDF1F8`, ink is `#10141C`. Deep blue is a
committed field that owns whole regions — the full-height left sidebar, the
load plan, the sign-in plate. Light blue is the single action colour and
appears only where something can be done; a disabled control loses it. Status
carries in marks — hollow graphite for draft, hatched for packing, filled deep
blue for packed, oxide red `#B3261E` for failed — so informational never
competes with actionable. Division is rule weight and stock tint alone:
hairlines at 1px, plate edges at 2px, zero radius, zero gradient, zero shadow.
Type is Archivo with Archivo Narrow uppercase and tracked for every field
label, column head and reference; all figures tabular. No monospace. Boxes are
drawn as 30-degree axonometric wireframe.

**STORY** — The visitor understands that this is one system of record where
every object is measured and specified. They believe the numbers because the
surface shows which axis each one belongs to. They raise an order, pack it, and
read the result without asking anyone what a figure means.

**FIRST VIEWPORT** (Dashboard, 1440x900) — *Topology pinned by the user to a
left sidebar.* A full-height deep-blue rail at the left, 240px: `BIONIC
PORTAL` stencilled at the top behind a hairline, then nav as stacked cells,
each an icon and a tracked Archivo Narrow caps label, divided by hairlines. The
active cell inverts to plate stock with ink text, so the rail shows which
sheet is on the desk; an accent bar was tried first and dropped, because a
coloured stripe down one edge of a list item is the side-tab tell the craft
floor bans and the detector flagged.
Administration sits below a rule at the foot of the list. The main column opens
with a slim white strip carrying the sheet date at the left and the account
block with sign-out at the right, closed by a hairline. Below it the sheet
opens with a 2px ink plate edge: a corner title block as a real specification
table (SHEET, ISSUED TO, ROLE), hard right on that row the only light-blue
element above the fold, `RAISE ORDER`. Beneath it the page's one subject at
full width, the capacity measure drawn as a drafting dimension: horizontal
rule, witness ticks at each end, deep-blue fill, the figure set on the line
where the measurement ends, and the deficit named on its own line (`NOT PACKED
- n items`). Under it a four-cell specification strip on a single hairline,
then the order register as a true ruled table, zebra as a pale blue stock wash,
status as a mark in a fixed cell.

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
