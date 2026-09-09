import { createClient } from "@supabase/supabase-js";
import { config } from "./config.js";

const MISSING_CONFIG =
  "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in server/.env. " +
  "Copy server/.env.example to server/.env and fill in your project's values " +
  "(Supabase dashboard -> Project Settings -> API). See docs/SUPABASE.md.";

function assertConfigured() {
  if (!config.supabaseUrl || !config.supabaseServiceKey) {
    throw new Error(MISSING_CONFIG);
  }
}

function newClient() {
  assertConfigured();

  return createClient(config.supabaseUrl, config.supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

let client = null;

/**
 * Server-side Supabase client.
 *
 * Uses the service_role key, which bypasses Row Level Security. That is what we
 * want here — the API is the thing enforcing ownership and roles, the same way
 * it did against Mongo. This key must never reach the browser.
 *
 * Built on first use rather than at import. Creating it eagerly meant that with
 * no .env present, supabase-js threw "supabaseUrl is required" from inside
 * node_modules before our own check could run, so the first thing anyone saw
 * when setting the project up was a stack trace instead of an instruction.
 */
export const supabase = new Proxy(
  {},
  {
    get(_target, prop) {
      if (!client) client = newClient();

      const value = client[prop];
      return typeof value === "function" ? value.bind(client) : value;
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
  return newClient();
}

/** Fail loudly at boot rather than on the first request. */
export async function connectDb() {
  assertConfigured();

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
