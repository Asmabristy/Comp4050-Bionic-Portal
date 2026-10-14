
import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 4000),

  // Supabase replaces MongoDB. The service key is server-only.
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",

  // Anon key for normal Operator signup and email verification.
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",

  solverUrl: process.env.SOLVER_URL || "http://localhost:5000",
  solverTimeoutMs: Number(process.env.SOLVER_TIMEOUT_MS || 15000),
  useMockSolver: String(process.env.USE_MOCK_SOLVER || "true") === "true",

  // Comma-separated list, so local dev and a deployed frontend can both be
  // allowed without swapping this value between environments.
  webOrigins: (process.env.WEB_ORIGIN || "http://localhost:5173,http://localhost:5174")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
};

if (!config.supabaseUrl || !config.supabaseServiceKey) {
  console.warn(
    "[config] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set. The API will not start."
  );
}

if (!config.supabaseAnonKey) {
  console.warn(
    "[config] SUPABASE_ANON_KEY is not set. Email registration will not work."
  );
}
