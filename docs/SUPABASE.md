# Supabase setup

This branch (`supabase-integration`) replaces MongoDB with Supabase.
`main` and `feature/ui-redesign` still use Mongo, so nothing here affects them.

## What changed

| Before | Now |
|---|---|
| MongoDB + Mongoose | Supabase (Postgres) via `@supabase/supabase-js` |
| Our own bcrypt + JWT login | Supabase Auth |
| `users` collection | `auth.users` + a `profiles` table for name and role |
| `orders`, `containers` collections | `orders`, `containers` tables |

**The API contract did not change.** `POST /api/auth/login` still takes
`{ email, password }` and returns `{ token, user }`; every route returns the
same JSON as before. The web app and FitVisualizer needed no changes at all.

The solver is untouched and still runs as an npm package.

## One-time setup

### 1. Create a Supabase project

<https://supabase.com> → New project. Any region, any name.

### 2. Create the tables

Dashboard → **SQL Editor** → New query → paste all of
[`server/supabase/schema.sql`](../server/supabase/schema.sql) → Run.

This creates `profiles`, `containers` and `orders`, with Row Level Security
enabled on all three.

### 3. Add your keys

Dashboard → **Project Settings → API**. Copy the Project URL and the
`service_role` key into `server/.env`:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

The `service_role` key bypasses Row Level Security. It belongs on the server
only — never in `web/`, never committed.

### 4. Seed accounts and cartons

```bash
cd server && npm install && npm run seed
```

Creates two accounts and the starter carton catalogue:

| Email | Password | Role |
|---|---|---|
| `supervisor@thomax.com` | `Demo@1234` | supervisor |
| `operator@thomax.test` | `perfectfit` | operator |

Only supervisors can run the packing algorithm, so use the supervisor account
to demo packing.

Re-running the seed is safe — it resets those two passwords and roles, and
matches cartons on reference instead of wiping the table.

### 5. Run it

```bash
cd server && npm run dev
```
```bash
cd web && npm run dev
```

## Notes

**Row Level Security.** The API uses the service key, which bypasses RLS, so the
policies in `schema.sql` are not what protects your data day to day — the API's
own ownership checks are. The policies matter if anyone ever queries Supabase
directly with an anon key, and they are what a future Vercel/browser-direct
setup would rely on.

**Roles live in `profiles`.** Supabase Auth stores the account; `profiles.role`
stores whether someone is an operator, supervisor or admin. To promote someone,
update that row.

**Existing Mongo data does not carry over.** This is a fresh database. If you
need the old orders, they are still in your local Mongo on the other branches.

**The archived Mongoose models** are kept at `server/src/models/_mongo-archive/`
for reference while both approaches are in play. Delete that folder once
Supabase is the agreed direction.
