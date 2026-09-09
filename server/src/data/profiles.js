import { supabase } from "../supabase.js";
import { isUuid } from "./ids.js";

/*
 * Profiles hold the fields Supabase Auth doesn't: display name and role.
 * Keyed by the auth user id.
 */

function toPublic(row) {
  return {
    id: row.id,
    email: row.email,
    name: row.name || "",
    role: row.role,
    createdAt: row.created_at,
  };
}

function fail(error, what) {
  if (error) throw new Error(`${what}: ${error.message}`);
}

/** Everyone with an account, oldest first. */
export async function listAll() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });

  fail(error, "Could not load users");
  return data.map(toPublic);
}

export async function findById(id) {
  if (!isUuid(id)) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  fail(error, "Could not load user");

  return data ? toPublic(data) : null;
}

/** Change someone's role. */
export async function setRole(id, role) {
  if (!isUuid(id)) return null;

  const { data, error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", id)
    .select()
    .maybeSingle();

  fail(error, "Could not update user");
  return data ? toPublic(data) : null;
}
