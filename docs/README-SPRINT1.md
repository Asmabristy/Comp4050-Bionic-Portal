# Bionic Portal — Sprint 1

For the project overview, team roles and sprint plan, see [PROJECT-OVERVIEW.md](./PROJECT-OVERVIEW.md).

## Current working branch

**`supabase-integration` is the current updated and tested Sprint 1 working branch. Use this branch to run the application and demonstrate the integrated system.**

- [Open the working branch](https://github.com/Asmabristy/Comp4050-Bionic-Portal/tree/supabase-integration).
- Version covered: [`773d470`](https://github.com/Asmabristy/Comp4050-Bionic-Portal/commit/773d4707592e09df3f020af4d1b2ed5def82707d) — `Refine portal UI and page layouts`.
- This separate Sprint 1 README is intended for `main`. Its presence on `main` does not mean the application changes have been merged there.

The core workflows below were tested in the local development environment. The recorded checks cover this Sprint 1 snapshot; broader validation is planned for Sprint 2.

## Sprint 1 completed work

| Area | Implemented functionality |
| --- | --- |
| Accounts | Registration, sign-in/sign-out, password show/hide, password requirements, validation messages and session refresh logic. New accounts default to Operator. |
| Supabase migration | Supabase Auth manages accounts and passwords; PostgreSQL stores profiles, orders and cartons. MongoDB is not required for this branch. |
| Access control | Signed-in users can view orders and results. Operators can create drafts. Supervisors and Admins can run packing and access Administration; packing is guarded in both the UI and API. |
| Dashboard and orders | Order totals, recent orders, packing status, reference search, status filters and order details. |
| Data entry | Manual item entry, authenticated API order creation and CSV import with editable item values. |
| Packing | Save as draft, Save and pack, Pack this order, Re-pack and stored packing results. |
| Results and 3D | Cartons used, packed/unpacked counts, utilisation and an integrated 3D view with rotation, zoom and item selection. |
| Cartons and users | Carton catalogue editing, activation/deactivation and JSON import; user listing, search/filtering and role editing in Administration. |
| Interface | Updated layout, navigation, dashboard, order pages and styling. |

## Installation

### 1. Prerequisites and checkout

Use **Node.js 22 or later**, npm and Git. Although `server/package.json` declares Node 20+, the locked `@supabase/supabase-js` dependency requires Node 22+. Git is needed because the Solver and Visualiser are GitHub dependencies.

For a new checkout:

```bash
git clone --branch supabase-integration https://github.com/Asmabristy/Comp4050-Bionic-Portal.git
cd Comp4050-Bionic-Portal
```

For an existing checkout, preserve any uncommitted work first, then run from the repository root:

```bash
git fetch origin
git switch supabase-integration
git pull --ff-only origin supabase-integration
git log -1 --oneline
```

### 2. Install the API and Solver

From the repository root:

```bash
cd server
npm install
```

This installs the API dependencies and `@bionic/solver`, already listed in `server/package.json`:

```text
git+https://github.com/cammo1123/COMP4050-Solvers.git
```

The Portal calls the installed package's `solve()` function directly. **No separate Solver service needs to be started for this version.**

### 3. Configure Supabase

Before starting the server, configure `server/.env` using `.env.example` and the [Supabase setup guide](https://github.com/Asmabristy/Comp4050-Bionic-Portal/blob/supabase-integration/docs/SUPABASE.md).

### 4. Install the frontend and Visualiser

Open another terminal at the repository root:

```bash
cd web
npm install
```

This installs the frontend dependencies and `@bionic/visualiser`, already listed in `web/package.json`:

```text
git+https://github.com/subham-dahal/visualiser-bionic-.git#integration/portal-api
```

The Visualiser is imported into `OrderDetail.jsx` as a React component. **No separate Visualiser server is needed.** Keep both package lockfiles so the recorded dependency revisions can be reproduced.

## Run the application

Keep two terminals running, each initially opened at the repository root.

**Terminal 1 — API**

```bash
cd server
npm run dev
```

The API runs at `http://localhost:4000` after connecting to Supabase.

**Terminal 2 — frontend**

```bash
cd web
npm run dev
```

Open the address printed by Vite, normally **http://localhost:5173**. The frontend forwards `/api` requests to port 4000 through `web/vite.config.js`.

## Using the Sprint 1 MVP

1. Sign in as a Supervisor to demonstrate packing, or as an Operator to demonstrate draft creation and result access.
2. Open **New Order**. Enter a unique order reference and add items manually, or select **CSV Import**.
3. Enter dimensions in **millimetres (mm)**, weights in **kilograms (kg)** and quantity as a positive integer. These are the current Portal UI units.
4. Choose **Save as draft**, or **Save and pack** with a Supervisor-level account.
5. Open the order to inspect its status and packing summary. Use **Pack this order** for a draft or **Re-pack** to run packing again.
6. Open the 3D view to rotate, zoom and select items.

The manifest's item count represents item rows; packed-item counts represent physical units after quantity expansion. An order with one item row and quantity four can therefore show one manifest item and four packed items.

### CSV input

Use the following header and a simple item row:

```csv
itemCode,itemReference,width,length,depth,weight,quantity,boxGroup
MOUSE-001,Wireless Mouse,70,110,40,0.12,2,OFFICE-A
```

Enter the order reference separately in the form. For Sprint 1, use field values without embedded commas and inspect imported values before saving. Support for quoted fields containing commas is planned for Sprint 2.

### API input

Send JSON to `POST /api/orders` with `Content-Type: application/json` and `Authorization: Bearer <access-token>`, using the access token returned by Portal login:

```json
{
  "reference": "SPRINT1-API-001",
  "items": [{
    "itemCode": "MOUSE-001",
    "itemReference": "Wireless Mouse",
    "width": 70,
    "length": 110,
    "depth": 40,
    "weight": 0.12,
    "quantity": 2,
    "boxGroup": "OFFICE-A"
  }]
}
```

Creation returns a draft order and uses the active carton catalogue when no cartons are supplied. A Supervisor-level account can then call `POST /api/orders/:id/pack`. Signed-in users can read the order with `GET /api/orders/:id` or its packing layout with `GET /api/orders/:id/result`. Change the example reference for each new order.

## Planned improvements for Sprint 2

Building on the tested Sprint 1 workflows, we plan to:

- Strengthen quantity validation so users receive clear feedback when entering zero or other invalid quantities.
- Extend CSV parsing to support quoted fields containing commas and preserve column alignment.
- Review carton-editing permissions and role-assignment rules with the team, then apply the agreed access controls consistently.
- Extend Administration with account-deletion functionality and appropriate permission checks.
- Improve registration error handling and packing retry behaviour.
- Make order-deletion permissions consistent for Supervisor and Admin accounts.
- Expand validation and regression testing across these workflows.
