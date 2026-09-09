import { createClient } from "@supabase/supabase-js";
import { config } from "./config.js";

/**
 * Server-side Supabase client.
 *
 * Uses the service_role key, which bypasses Row Level Security. That is what we
 * want here — the API is the thing enforcing ownership and roles, the same way
 * it did against Mongo. This key must never reach the browser.
 */
export const supabase = createClient(
  config.supabaseUrl,
  config.supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * A throwaway client for verifying a password.
 *
 * signInWithPassword() attaches the signed-in user's session to whichever
 * client performs it, and every later query on that client then runs as that
 * user under Row Level Security instead of as service_role. Using a fresh
 * client per sign-in keeps the shared admin client above session-free.
 */
export function signInClient() {
  return createClient(config.supabaseUrl, config.supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Fail loudly at boot rather than on the first request. */
export async function connectDb() {
  if (!config.supabaseUrl || !config.supabaseServiceKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set. See server/.env.example."
    );
  }

  const { error } = await supabase.from("containers").select("id").limit(1);

  if (error) {
    throw new Error(
      `Could not reach Supabase (${error.message}). ` +
        "Check your keys, and that server/supabase/schema.sql has been run."
    );
  }

  const host = new URL(config.supabaseUrl).host;
  console.log(`[db] connected to Supabase at ${host}`);
}
