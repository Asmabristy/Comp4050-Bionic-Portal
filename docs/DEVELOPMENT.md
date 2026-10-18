# FitPortal

The Portal subsystem for **Project Perfect Fit** (COMP4050, Division Bionic).

FitPortal is the hub of the division. It handles users and sign-in, takes orders from
operational staff, stores everything in Supabase, calls **FitSolver** to compute the
packing, and serves the result to **FitVisualizer** for 3D rendering.

```
                    ┌──────────────────┐
                    │  FitVisualizer   │  reads GET /api/orders/:id/result
                    └────────▲─────────┘
                             │ packing result (JSON)
                    ┌────────┴─────────┐
   operator ───────▶│    FitPortal     │  ◀── you are here
                    │  API + DB + auth │
                    └────────▲─────────┘
                             │ POST /pack (JSON)
                    ┌────────┴─────────┐
                    │    FitSolver     │
                    └──────────────────┘
```

---

## Stack

| Layer     | Choice                          |
| --------- | ------------------------------- |
| API       | Node.js + Express               |
| Database  | Supabase (Postgres)             |
| Auth      | JWT bearer tokens, bcrypt hashes |
| Front end | React 18 + Vite + React Router  |

---

## Running it

Short version in [`RUNNING.md`](RUNNING.md).

You need Node 20+ and a Supabase project. See [SUPABASE.md](SUPABASE.md) for
the one-time setup: run the schema, then copy your keys into `server/.env`.

### 1. API

```bash
cd server
npm install
cp .env.example .env        # then add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
npm run seed                # creates a demo user + carton catalogue
npm run dev                 # http://localhost:4000
```

The seed creates `operator@thomax.test` / `perfectfit`.

### 2. Front end

```bash
cd web
npm install
npm run dev                 # http://localhost:5173
```

Vite proxies `/api` to the Express server, so the browser sees one origin and
there are no CORS surprises in development.

---

## Working before FitSolver exists

`USE_MOCK_SOLVER=true` in `.env` (the default) makes the Portal use a built-in
stand-in solver instead of calling the real service. It's a crude shelf-packing
heuristic — **not** a real optimiser — but it returns data in the exact agreed
shape, so the whole pipeline runs end to end today.

When FitSolver is up:

```env
USE_MOCK_SOLVER=false
SOLVER_URL=http://localhost:5000
```

Nothing else changes. That's the point of having a contract.

---

## Endpoints

| Method   | Path                     | Purpose                                    |
| -------- | ------------------------ | ------------------------------------------ |
| `GET`    | `/api/health`            | Liveness check, reports solver mode        |
| `POST`   | `/api/auth/register`     | Create an account                          |
| `POST`   | `/api/auth/login`        | Exchange credentials for a token           |
| `GET`    | `/api/auth/me`           | Current user                               |
| `GET`    | `/api/containers`        | Carton catalogue                           |
| `POST`   | `/api/containers`        | Add a carton type                          |
| `DELETE` | `/api/containers/:id`    | Retire a carton type                       |
| `GET`    | `/api/orders`            | Order history                              |
| `POST`   | `/api/orders`            | Save a new order                           |
| `GET`    | `/api/orders/:id`        | One order with its stored result           |
| `POST`   | `/api/orders/:id/pack`   | Send to Solver, store what comes back      |
| `GET`    | `/api/orders/:id/result` | **Packing layout — this is Visualizer's endpoint** |
| `DELETE` | `/api/orders/:id`        | Delete an order                            |

All routes except `/api/health` and the two auth routes need
`Authorization: Bearer <token>`.

---

## For the Visualizer team

Call `GET /api/orders/:id/result` with a bearer token. You get:

```json
{
  "orderId": "...",
  "status": "success",
  "boxes": [
    {
      "boxId": "MED",
      "dimensions": { "w": 400, "h": 300, "d": 250 },
      "items": [
        {
          "itemId": "SKU-1",
          "position": { "x": 0, "y": 0, "z": 0 },
          "rotation": "XYZ",
          "dimensions": { "w": 100, "h": 100, "d": 100 }
        }
      ]
    }
  ],
  "unpacked": []
}
```

Every item carries `position` + `rotation` + `dimensions`, and every box carries its
own `dimensions` — everything needed to build the scene, no follow-up calls.

There's a placeholder slot on the order detail page marked
`FitVisualizer 3D view mounts here`. Drop the component in there.

The exact shape the Portal accepts is enforced in
[`server/src/services/solverClient.js`](../server/src/services/solverClient.js) —
a reply missing `position`, `dimensions`, or a valid `status` is rejected
rather than stored.

---

## Layout

```
server/
  src/
    index.js               Express app entry
    config.js              env config
    supabase.js            Supabase client + connection check
    data/                  queries (orders, containers, profiles)
    seed.js                demo data
    supabase/schema.sql    tables, policies, triggers
    middleware/            auth (Supabase tokens + roles), errors
    routes/                auth, orders, containers, admin
    services/
      solverClient.js      ← the ONLY place we talk to Solver
      mockSolver.js        stand-in until Solver ships
web/
  src/
    api.js                 fetch wrapper + token storage
    auth.jsx               session context
    components/            Layout, PackingPreview
    pages/                 Login, Orders, NewOrder, OrderDetail, Cartons
```

`services/solverClient.js` is the single point of contact with FitSolver. If the
agreed interface changes, that file changes and nothing else does.

---

## Notes for the team

- **Units are millimetres and grams**
- **`rotation` is an axis-order string** (`"XYZ"`, `"YXZ"`, …). Visualizer's 3D
  library may prefer degrees or a quaternion. Settle this before Sprint 2.
- The Portal **validates** every Solver reply before storing it
  (`validatePackResponse`). A malformed response fails loudly instead of writing
  junk to the database that Visualizer then can't render.
- `.env` is gitignored. Never commit real secrets.
