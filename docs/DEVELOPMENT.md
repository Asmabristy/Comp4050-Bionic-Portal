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


## Environment Configuration

FitPortal uses environment variables to manage application settings, database connections, authentication, and communication with external services such as FitSolver.

Environment variables allow developers to configure the application without hardcoding sensitive information into the source code.

### 1. Setting Up the Backend Environment

The backend configuration is located in the `server/` directory.

An example environment configuration is provided in:

```text
server/.env.example
```

To configure the backend locally:

**Step 1:** Navigate to the server directory.

```bash
cd server
```

**Step 2:** Create a `.env` file using the existing example.

For macOS:

```bash
cp .env.example .env
```

For Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

**Step 3:** Open the newly created `.env` file and replace the placeholder values with the appropriate credentials and configuration details provided by the development team.

### 2. Backend Environment Variables

The following is an example of the backend environment configuration:

```env
PORT=5000

# Supabase Configuration
SUPABASE_URL=<your-supabase-project-url>
SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>

# Solver Configuration
SOLVER_URL=<your-solver-service-url>
SOLVER_TIMEOUT_MS=30000
USE_MOCK_SOLVER=false

# Frontend Configuration
WEB_ORIGIN=http://localhost:5173
```

The exact variable names and required values should be checked against `server/.env.example` and `server/src/config.js`.

#### Environment Variable Descriptions

| Variable | Description |
|----------|-------------|
| `PORT` | Specifies the port used by the backend server during local development. |
| `SUPABASE_URL` | URL of the Supabase project used for database operations and authentication. |
| `SUPABASE_ANON_KEY` | Public Supabase key used for operations subject to configured access policies. |
| `SUPABASE_SERVICE_ROLE_KEY` | Privileged key used for authorised server-side Supabase operations. |
| `SOLVER_URL` | URL of the FitSolver service used to process packing requests. |
| `SOLVER_TIMEOUT_MS` | Maximum time allowed for a Solver request before it times out, in milliseconds. |
| `USE_MOCK_SOLVER` | Determines whether the backend uses mock Solver responses for development and testing. |
| `WEB_ORIGIN` | Specifies the frontend origin permitted to communicate with the backend. |

### 3. Frontend Environment Configuration

The React frontend is located in the `web/` directory.

Depending on the frontend implementation, environment variables may be required to configure communication with the backend.

For a Vite-based React application, environment variables exposed to frontend code typically use the `VITE_` prefix.

An example configuration is:

```env
VITE_API_URL=http://localhost:5000
```

This specifies the backend API URL used during local development.

**Note:** The exact variable name must match the frontend's existing source code. Do not add `VITE_API_URL` unless the application is configured to use it.

Frontend environment variables must not contain private API keys, passwords, or Supabase service-role credentials because variables exposed through Vite are included in the client-side application.

### 4. Production Environment Configuration

FitPortal uses separate hosting platforms for its frontend and backend.

| Component | Hosting Platform | Configuration |
|-----------|------------------|---------------|
| Frontend (`web/`) | Vercel | Frontend environment variables and backend API URL |
| Backend (`server/`) | Render | Supabase credentials, Solver configuration, and allowed frontend origin |
| Database | Supabase | Database, authentication, and access policies |

#### Vercel – Frontend Configuration

Frontend environment variables are configured through the Vercel dashboard.

1. Open the FitPortal project in Vercel.
2. Navigate to **Settings → Environment Variables**.
3. Add the required frontend configuration.
4. Ensure the backend API URL points to the deployed Render service.
5. Redeploy the frontend to apply the updated settings.

For example:

```env
VITE_API_URL=https://<your-render-service>.onrender.com
```

This is an example only and must match the variable used by the frontend.

#### Render – Backend Configuration

Backend environment variables are configured through the Render dashboard.

1. Open the FitPortal backend Web Service.
2. Navigate to **Environment**.
3. Add the required variables from `server/.env.example`.
4. Ensure the Supabase configuration is correct.
5. Configure the Solver service URL.
6. Set `WEB_ORIGIN` to the deployed Vercel frontend origin.
7. Save the changes and verify that the service deploys or restarts successfully.

The backend must also use the `PORT` value supplied by Render when running in production.

### 5. Security Guidelines

To prevent accidental exposure of sensitive information, developers must follow these guidelines:

- Never commit `.env` files containing credentials to GitHub.
- Do not hardcode passwords, private API keys, or authentication tokens into the application.
- Keep the Supabase service-role key restricted to the backend.
- Use separate environment configurations for local development and production.
- Do not share production credentials through public documentation.
- Ensure access to Vercel, Render, and Supabase is restricted to authorised team members.
- Rotate credentials if they are accidentally exposed.

The repository's `.gitignore` configuration should exclude environment files:

```gitignore
.env
.env.*
!.env.example
```

The `.env.example` file should only contain variable names and safe placeholder values.

### 6. Troubleshooting Environment Issues

| Issue | Possible Cause | Recommended Solution |
|-------|----------------|----------------------|
| Backend fails to start | Missing or invalid environment variables | Verify the values in `server/.env`. |
| Supabase connection fails | Incorrect Supabase URL or credentials | Check the Supabase project configuration. |
| Frontend cannot communicate with backend | Incorrect API URL or CORS configuration | Verify the backend URL and `WEB_ORIGIN`. |
| Solver request fails | Incorrect Solver URL or unavailable service | Check `SOLVER_URL` and service availability. |
| Application works locally but not after deployment | Missing production environment variables | Verify the Vercel and Render environment settings. |
| Updated variables are not applied | Application has not restarted | Restart the local server or redeploy the affected service. |

### 7. Additional Resources

For further setup and configuration instructions, refer to:

- [Running Instructions](RUNNING.md)
- [Supabase Documentation](SUPABASE.md)
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)


## Notes for the team

- **Units are millimetres and grams**
- **`rotation` is an axis-order string** (`"XYZ"`, `"YXZ"`, …). Visualizer's 3D
  library may prefer degrees or a quaternion. Settle this before Sprint 2.
- The Portal **validates** every Solver reply before storing it
  (`validatePackResponse`). A malformed response fails loudly instead of writing
  junk to the database that Visualizer then can't render.
- `.env` is gitignored. Never commit real secrets.
