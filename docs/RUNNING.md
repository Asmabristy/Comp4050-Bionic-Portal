# Running FitPortal

Two terminals, one for each half.

## Terminal 1 — server

First time:

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

## Login

```
operator@thomax.test
perfectfit
```
