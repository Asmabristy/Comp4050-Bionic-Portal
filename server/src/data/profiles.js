import { supabase } from "../supabase.js";

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
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error && error.code === "22P02") return null;
  fail(error, "Could not load user");

  return data ? toPublic(data) : null;
}

/** Change someone's role. */
export async function setRole(id, role) {
  const { data, error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", id)
    .select()
    .maybeSingle();

  fail(error, "Could not update user");
  return data ? toPublic(data) : null;
}
