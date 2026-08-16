import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/fitportal",
  jwtSecret: process.env.JWT_SECRET || "dev-only-insecure-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  solverUrl: process.env.SOLVER_URL || "http://localhost:5000",
  solverTimeoutMs: Number(process.env.SOLVER_TIMEOUT_MS || 15000),
  useMockSolver: String(process.env.USE_MOCK_SOLVER || "true") === "true",
  webOrigin: process.env.WEB_ORIGIN || "http://localhost:5173",
};

if (config.jwtSecret === "dev-only-insecure-secret") {
  console.warn("[config] JWT_SECRET is not set. Fine for local dev, not for anything else.");
}
