
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
 * Shared server-side Supabase client.
 *
 * Uses the service_role key for trusted backend database operations.
 * This key must never be exposed to the browser.
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
 * A separate client for password sign-in and session refresh.
 * Keeps user sessions isolated from the shared admin client.
 */
export function signInClient() {
  return newClient();
}

/**
 * Public signup client for Operator registration.
 *
 * Uses the anon key so new users follow Supabase's normal
 * email confirmation process rather than admin.createUser().
 */
export function signUpClient() {
  assertConfigured();

  if (!config.supabaseAnonKey) {
    throw new Error(
      "SUPABASE_ANON_KEY must be configured in server/.env."
    );
  }

  return createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

/** Fail loudly at boot rather than on the first request. */
export async function connectDb() {
  assertConfigured();

  const { error } = await supabase
    .from("containers")
    .select("id")
    .limit(1);

  if (error) {
    throw new Error(
      `Could not reach Supabase (${error.message}). ` +
        "Check your keys, and that server/supabase/schema.sql has been run."
    );
  }

  const host = new URL(config.supabaseUrl).host;
  console.log(`[db] connected to Supabase at ${host}`);
}
