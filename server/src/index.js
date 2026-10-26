import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { connectDb } from "./supabase.js";
import { authRouter } from "./routes/auth.routes.js";
import { ordersRouter } from "./routes/orders.routes.js";
import { containersRouter } from "./routes/containers.routes.js";
import { adminRouter } from "./routes/admin.routes.js";
import { solverVersion } from "./services/solverClient.js";
import { notFound, errorHandler } from "./middleware/errors.js";

const app = express();

app.use(
  cors({
    // Allow any origin in the configured list. Requests with no Origin header
    // (curl, server-to-server) pass through too.
    origin(origin, callback) {
      // Don't throw on a disallowed origin — that surfaces as a confusing 500.
      // Returning false just omits the CORS headers, so the browser reports a
      // proper CORS error and the server log stays clean.
      if (origin && !config.webOrigins.includes(origin)) {
        console.warn(`[cors] blocked origin ${origin} (allowed: ${config.webOrigins.join(", ")})`);
        return callback(null, false);
      }
      callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "fitportal-api",
    db: "supabase",
    solver: config.useMockSolver ? "mock" : config.solverUrl,
  });
});

app.get("/api/version", async (req, res) => {
  res.json({
    service: "fitportal-api",
    node: process.version,
    runtime: `${process.platform}-${process.arch}`,
    ...(await solverVersion()),
  });
});

app.use("/api/auth", authRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/containers", containersRouter);
app.use("/api/admin", adminRouter);

app.use(notFound);
app.use(errorHandler);

connectDb()
  .then(() => {
    app.listen(config.port, () => {
      console.log(`[api] listening on http://localhost:${config.port}`);
      console.log(`[api] solver: ${config.useMockSolver ? "MOCK (built-in)" : config.solverUrl}`);
    });
  })
  .catch((err) => {
    console.error("[api] could not start:", err.message);
    process.exit(1);
  });
