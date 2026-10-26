# Running FitPortal

Two terminals, one for each half.

## Terminal 1 — server

First time — set up Supabase first (schema + keys), see
[SUPABASE.md](SUPABASE.md). Then:

```bash
cd server && npm install && cp .env.example .env && npm run seed && npm run dev
```

After that:

```bash
cd server && npm run dev
```

## Terminal 2 — web

First time:

```bash
cd web && npm install && npm run dev
```

After that:

```bash
cd web && npm run dev
```

Then open **http://localhost:5173**

## Version check

The API exposes the solver build and the installed package revision:

```bash
curl http://localhost:4000/api/version
```

`declared` comes from `server/package-lock.json`, `installed` comes from
`server/node_modules/.package-lock.json`, and `build` is the metadata reported
by the loaded native addon. `binaryBuild` is read directly from the addon file,
so it is still available when the addon cannot be loaded. The load error, if
any, is returned in `error`.

Note that `build.gitHash` (and `binaryBuild.gitHash`) is the source revision
used to compile the prebuilt binary, not necessarily the commit that committed
the binary to the solver repository.

## Login

```
operator@thomax.test
perfectfit
```
