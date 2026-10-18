# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two confirmed roles, both working inside the same shared order queue:

- **Operators** raise orders — entering items manually or by CSV, choosing cartons,
  saving drafts, and reading packing results. They cannot run the packing
  algorithm or reach Administration.
- **Supervisors** do everything an operator can, plus run and re-run packing, and
  manage user access.

An `admin` role exists in the data model and ranks above supervisor, but no
behaviour is specific to it yet.

**Real usage scene:** this is a COMP4050 university project. It is assessed and
demonstrated, not deployed to a warehouse floor. The audience is assessors and
the client (Thomax), viewed on a laptop or projector. The README's "mobile-first"
line is an aspiration, not a description of how it is used.

## Product Purpose

FitPortal is the interface, API and integration layer for **Project Perfect Fit**.
It is the central access point that connects two sibling systems built by other
teams: orders go in, **FitSolver** computes how to pack them, and **FitVisualizer**
renders the result in 3D for inspection.

Success is an operator raising an order, a supervisor packing it, and both being
able to read and trust the result — including seeing it in three dimensions.

## Positioning

FitPortal is the only piece that holds the whole workflow. FitSolver is a packing
algorithm with no interface; FitVisualizer is a renderer with no data of its own.
FitPortal owns authentication, the order record, the carton catalogue, the
handover between roles, and the contract that lets the other two systems agree on
what a packed carton actually is.

## Operating Context

- Three teams build in parallel — FitPortal, FitSolver, FitVisualizer — each in
  its own repository, integrating through published packages and a shared JSON
  result shape.
- The packing workflow is a handover: an operator raises an order, a supervisor
  packs it. Orders are therefore a shared queue, not private documents.
- Cartons are a shared catalogue. Orders snapshot the cartons available when they
  are raised, but packing respects whether a carton is still active.
- Dimensions are in millimetres, weight in kilograms.

## Capabilities and Constraints

**Confirmed functionality**

- Email/password authentication with role-based access, enforced server-side
- Orders: manual entry, CSV import, drafts, shared listing, detail view, deletion
- Carton catalogue management
- Packing via FitSolver, with results stored on the order
- 3D packing inspection via FitVisualizer, behind a "View in 3D" control
- Administration: list accounts, change roles

**Technical constraints**

- React + Vite frontend, plain CSS in a single `web/src/styles.css`
- Express API, Supabase (Postgres) for data and auth
- FitSolver and FitVisualizer arrive as npm packages from other teams' GitHub
  repositories; their output shapes are not ours to change
- FitVisualizer reads `result.boxes` with `{ w, h, d }` dimensions. That shape is
  a contract — renaming those fields breaks their renderer.

**Terminology**

- *Carton* — a container type items are packed into (SML, MED, LRG)
- *Order* — a reference plus the items to be packed
- *Packing result* — cartons used, item placements, unpacked items, utilisation

## Brand Commitments

- The names **Bionic Portal** and **Project Perfect Fit** stay.
- **The palette is Thomax's own, sampled from their logo and pinned by the
  user:** deep blue `#012DAE`, light blue `#049DCE`, and white. These three are
  the scheme; any other colour in the interface must earn its place as a
  functional signal (a failure state, a hairline, a text tint) rather than as
  decoration. The deep blue is the structural field, the light blue is the
  action colour.
- **Navigation lives in a left sidebar**, pinned by the user against a reference
  dashboard they supplied. Not a top bar.
- Typography and layout are not locked. Archivo / Archivo Narrow and the
  standards-sheet layout are current work, open to change.

## Evidence on Hand

- Working integrations with both sibling systems, demonstrable live
- Real packing results computed by FitSolver, stored and rendered in 3D
- Role separation enforced on the server, not just hidden in the interface

## Open Decisions

- Whether the `admin` role ever gains behaviour distinct from supervisor
- Whether accounts can be disabled (the data model has no status field)
