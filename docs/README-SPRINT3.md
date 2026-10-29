# Bionic Portal — Sprint 3

For the project overview, team roles and sprint plan, see [PROJECT-OVERVIEW.md](./PROJECT-OVERVIEW.md).

**Last updated: 28 October 2026.** This README describes the current Portal, its features, setup, usage and testing commands.

## Current version and deployment

The application snapshot reviewed for this document is **main at `ca297f9`** — `Configure Vercel API proxy for new Render backend`. This main version uses Supabase and includes the updated Solver and Visualiser integration.

- Frontend: <https://comp4050-bionic-portal-blush.vercel.app/>
- Backend: <https://comp4050-bionic-portal.onrender.com>
- Local frontend: normally `http://localhost:5173`
- Local API: normally `http://localhost:4000`

The deployed login page loaded successfully. Checks through the Vercel domain returned HTTP 200 for `/api/health`, HTTP 401 for unauthenticated protected requests, and HTTP 400 with an input-validation message for an empty login request. The earlier login-route 404 was not reproduced in these checks.

## Sprint 3 focus

Sprint 3 focuses on final integration, defect fixing, testing, deployment, documentation and the demonstration. It builds on the earlier sprint functionality. The features below describe the current implementation; they are not all new Sprint 3 features.

| Area | Current functionality |
| --- | --- |
| Accounts | Registration, sign-in/sign-out, password validation and session refresh. Supabase Auth manages credentials; new registrations receive the Operator role. |
| Database | Supabase PostgreSQL stores profiles, shared orders, carton records and packing results. MongoDB is not required for this version. |
| Access control | Signed-in users can create drafts and view orders/results. Supervisor and Admin accounts can edit order items, run packing and access Administration. |
| Orders | Dashboard totals, shared order register, reference search, status filtering and order details. |
| Item entry | Manual entry and JSON file import, including dimensions, weight, quantity and optional box group. The current New Order page uses JSON import rather than the Sprint 1 CSV workflow. |
| Editing and packing | Save as draft, Save and pack, Pack this order, Re-pack, item editing, cancellation and Save and Re-pack. Successful item edits invalidate the previous result before re-packing. |
| Results | Cartons used, placed/unpacked units, selected carton types, weight and volume-use summaries, plus unpacked-item messages. |
| Visualiser | Integrated 3D packing view, rotation, zoom, reset and item selection. The updated adapter supplies dimensions and positions to the component. |
| Export | PDF export is available from the order detail page. |
| Carton catalogue | Create/edit carton types, activate/deactivate cartons and import carton JSON. |
| Administration | User listing, search/filtering and role editing. |

### Roles and permissions

| Action | Operator | Supervisor / Admin |
| --- | --- | --- |
| Create a draft; view orders and results | Yes | Yes |
| Edit order items; run packing or re-packing | No | Yes |
| Access Administration and change roles | No | Yes, subject to route checks |
| Manage the carton catalogue | Currently permitted to authenticated users | Currently permitted |

## Installation

### 1. Prerequisites and checkout

Use **Node.js 24 LTS**, npm and Git. Some installed dependencies require a newer runtime than the server manifest's Node 20 minimum. Git is needed for the Solver and Visualiser dependencies.

For a fresh checkout:

```bash
git clone --branch main https://github.com/Asmabristy/Comp4050-Bionic-Portal.git
cd Comp4050-Bionic-Portal
```

For an existing checkout, preserve local changes and fetch the latest remote state before starting work. Create a task branch from the agreed current main; use a pull request to review and merge changes.

### 2. Install dependencies

From the repository root:

```bash
npm ci --prefix server
npm ci --prefix web
```

On Windows PowerShell, use `npm.cmd` in place of `npm` if script execution blocks `npm.ps1`.

These commands install the locked dependencies, including:

- `@bionic/solver`, from the FitSolver repository.
- `@bionic/visualiser`, from the FitVisualizer repository.

The Portal calls the installed Solver package's `solve()` function directly, and imports the Visualiser as a React component. **No separate Solver HTTP service or Visualiser development server is needed for this integration.** If the native Solver cannot load on a machine, check its package's platform/build requirements before demonstrating packing.

Keep both package lockfiles so dependency revisions are reproducible.

### 3. Configure Supabase and the API

For a new development database, initialise it using [server/supabase/schema.sql](./server/supabase/schema.sql). For the existing team database, obtain the approved configuration from the team; do not reinitialise shared data.

Create `server/.env` from [server/.env.example](./server/.env.example), then configure:

```env
PORT=4000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-server-side-service-role-key
USE_MOCK_SOLVER=false
WEB_ORIGIN=http://localhost:5173
```

The Supabase service-role key belongs on the backend only. Keep `.env` out of Git and frontend configuration. `WEB_ORIGIN` accepts a comma-separated list when multiple frontend origins are needed.

`USE_MOCK_SOLVER=false` selects the real Solver package integration used for packing demonstrations.

`SOLVER_URL` and `SOLVER_TIMEOUT_MS` remain in the configuration, but the current real integration calls the package directly. A health response mentioning `localhost:5000` does not establish that an external Solver service is being used.

### 4. Demo data, only when needed

For an agreed development database that needs demonstration data:

```bash
npm run seed --prefix server
```

The seed defines Supervisor and Operator demo accounts plus starter cartons. **Re-running it resets those accounts' passwords and roles and updates matching cartons.** Do not run it against the shared database merely to troubleshoot a login. Use the team's confirmed test accounts; the defaults in [seed.js](./server/src/seed.js) may differ from current deployed credentials.

## Run the application

Keep two terminals open at the repository root.

**Terminal 1 — API**

```bash
npm run dev --prefix server
```

**Terminal 2 — frontend**

```bash
npm run dev --prefix web
```

Open the address printed by Vite, normally **http://localhost:5173**. Vite forwards `/api` requests to port 4000. If Vite uses another port, include the actual frontend origin in the backend configuration.

## Using the current Portal

1. Sign in as an Operator to create a draft, or as a Supervisor/Admin to demonstrate packing.
2. Open **New Order**, enter a unique order reference and add items manually or through **JSON import**.
3. Enter dimensions in **millimetres (mm)**, weight in **kilograms (kg)** and quantity as a positive whole number.
4. Choose **Save as draft**, or **Save and pack** when the account has packing permission.
5. Open the saved order and inspect the summary. Use **Pack this order** for a draft or **Re-pack** for an existing result.
6. Use **Edit items** to change values, **Cancel changes** to discard edits, or **Save and Re-pack** to save and calculate again.
7. Inspect the 3D view and select items to review their dimensions.

The manifest's item count represents item rows. Units and placed-item counts represent physical items after quantity expansion: two rows with quantities two and one represent three units.

### JSON item import

Save the following as a `.json` file and select it in **JSON import**:

```json
{
  "items": [
    {
      "itemCode": "SPRINT3-A",
      "itemReference": "JSON test A",
      "width": 50,
      "depth": 30,
      "length": 80,
      "weight": 0.2,
      "quantity": 2,
      "boxGroup": "GROUP-A"
    },
    {
      "itemCode": "SPRINT3-B",
      "itemReference": "JSON test B",
      "width": 40,
      "depth": 20,
      "length": 60,
      "weight": 0.3,
      "quantity": 1,
      "boxGroup": "GROUP-A"
    }
  ]
}
```

Enter the order reference separately in the form. Inspect the imported values before saving. JSON import rejects malformed input, a missing required width and non-positive quantity.

### API order creation

Send JSON to `POST /api/orders` with `Content-Type: application/json` and `Authorization: Bearer <access-token>` from Portal login. Use the same `items` array above and add a top-level unique `reference`, for example `"reference": "SPRINT3-API-001"`.

Creation returns a draft and uses the active carton catalogue when cartons are omitted. A Supervisor/Admin can call `POST /api/orders/:id/pack`. Signed-in users can read `GET /api/orders/:id` and `GET /api/orders/:id/result`. Item changes use `PUT /api/orders/:id/items` with an `items` array.

The order API enforces a maximum of 500 item rows, 10,000 units per row and 20,000 total units.

## Integration and deployment notes

The current flow is **React Portal → Express API → Supabase / FitSolver → stored result → FitVisualizer**.

- Supabase Auth validates tokens; profile records provide application roles.
- `server/src/services/solverClient.js` expands quantities, builds Solver input and normalises the response.
- The current Visualiser contract uses `{ width, depth, length }`, mapped to **X = width, Y = depth, Z = length**, plus `{ x, y, z }` placement coordinates.
- The raw Solver response is retained for export functionality.
- The browser uses relative `/api` requests. In production, [web/vercel.json](./web/vercel.json) forwards them to the Render backend before the SPA fallback.

For deployment, Vercel must use the frontend configuration/build, and Render must have the backend's Supabase settings and intended allowed origins. Updating Supabase Site URL or redirect URLs alone does not configure the Express proxy.

Use this README and the current source for the reviewed Sprint 3 snapshot. The Sprint 1 README is retained as a historical record.

## Testing and build commands

The existing frontend suite on the reviewed main snapshot completed with **17 passing tests**, covering signed-out routing, role-based navigation and route access. The frontend production build also completed successfully.

From the repository root:

```bash
npm run test:run --prefix web
npm run build --prefix web
```

To check dependency advisories:

```bash
npm audit --prefix web
npm audit --prefix server
npm audit --prefix web --omit=dev
npm audit --prefix server --omit=dev
```

The local manual testing work covered login, role restrictions, draft creation, packing, 3D interaction, item editing and cancellation, validation, JSON import, oversized items and deletion. Detailed case outcomes and screenshots are maintained in the separate testing report.

## Recent updates in main

- `2c8cc6e` — updated dependency lockfiles.
- `ca297f9` — updated the Vercel API proxy to the current Render backend.

The deployed checks described above confirm that the frontend domain reaches the API and its login validation route.
