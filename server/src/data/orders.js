import { supabase } from "../supabase.js";

/*
 * items, containers and result are jsonb columns holding exactly the structures
 * the API has always returned, so toPublic() output is unchanged from the
 * Mongoose version. FitVisualizer reads result.boxes straight off this.
 */

function toPublic(row) {
  return {
    id: row.id,
    reference: row.reference,
    status: row.status,
    items: row.items ?? [],
    containers: row.containers ?? [],
    result: row.result ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function fail(error, what) {
  if (error) throw new Error(`${what}: ${error.message}`);
}

/** This user's orders, newest first. */
export async function listForOwner(ownerId) {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("owner", ownerId)
    .order("created_at", { ascending: false });

  fail(error, "Could not load orders");
  return data.map(toPublic);
}

/** One order, but only if this user owns it. */
export async function findOwned(id, ownerId) {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("owner", ownerId)
    .maybeSingle();

  // A malformed uuid is a "not found", not a 500.
  if (error && error.code === "22P02") return null;
  fail(error, "Could not load order");

  return data ? toPublic(data) : null;
}

export async function create({ reference, ownerId, items, containers, status }) {
  const { data, error } = await supabase
    .from("orders")
    .insert({
      reference,
      owner: ownerId,
      items,
      containers,
      status: status || "draft",
    })
    .select()
    .single();

  fail(error, "Could not save order");
  return toPublic(data);
}

/** Patch an order in place. `patch` uses API names (status, result). */
export async function update(id, ownerId, patch) {
  const row = {};
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.result !== undefined) row.result = patch.result;
  if (patch.items !== undefined) row.items = patch.items;
  if (patch.containers !== undefined) row.containers = patch.containers;
  if (patch.reference !== undefined) row.reference = patch.reference;

  const { data, error } = await supabase
    .from("orders")
    .update(row)
    .eq("id", id)
    .eq("owner", ownerId)
    .select()
    .maybeSingle();

  fail(error, "Could not update order");
  return data ? toPublic(data) : null;
}

export async function remove(id, ownerId) {
  const { data, error } = await supabase
    .from("orders")
    .delete()
    .eq("id", id)
    .eq("owner", ownerId)
    .select()
    .maybeSingle();

  fail(error, "Could not delete order");
  return data ? toPublic(data) : null;
}
