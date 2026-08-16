import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { connectDb } from "./db.js";
import { authRouter } from "./routes/auth.routes.js";
import { ordersRouter } from "./routes/orders.routes.js";
import { containersRouter } from "./routes/containers.routes.js";
import { notFound, errorHandler } from "./middleware/errors.js";

const app = express();

app.use(cors({ origin: config.webOrigin, credentials: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "fitportal-api",
    solver: config.useMockSolver ? "mock" : config.solverUrl,
  });
});

app.use("/api/auth", authRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/containers", containersRouter);

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
