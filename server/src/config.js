import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 4000),

  // Supabase replaces MongoDB. The service key is server-only.
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",

  solverUrl: process.env.SOLVER_URL || "http://localhost:5000",
  solverTimeoutMs: Number(process.env.SOLVER_TIMEOUT_MS || 15000),
  useMockSolver: String(process.env.USE_MOCK_SOLVER || "true") === "true",
  webOrigin: process.env.WEB_ORIGIN || "http://localhost:5173",
};

if (!config.supabaseUrl || !config.supabaseServiceKey) {
  console.warn(
    "[config] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set. The API will not start."
  );
}
