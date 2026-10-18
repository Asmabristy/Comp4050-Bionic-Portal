import { supabase } from "../supabase.js";
import { isUuid } from "./ids.js";

/*
 * items, containers and result are jsonb columns holding exactly the structures
 * the API has always returned, so toPublic() output is unchanged from the
 * Mongoose version. FitVisualizer reads result.boxes straight off this.
 */

function toPublic(row) {
  return {
    id: row.id,
    reference: row.reference,
    // Who raised it — the UI shows nothing with this, but the delete check needs it.
    ownerId: row.owner,
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

/*
 * Orders are a shared work queue, not private documents. An operator raises an
 * order and a supervisor packs it, so both roles have to see the same list —
 * scoping reads to the creator would break that handover entirely.
 * `owner` is still recorded, and still governs who may delete.
 */

/** Every order, newest first. */
export async function listAll() {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  fail(error, "Could not load orders");
  return data.map(toPublic);
}

/** One order, readable by any signed-in user. */
export async function findById(id) {
  if (!isUuid(id)) return null;

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  fail(error, "Could not load order");

  return data ? toPublic(data) : null;
}

/** Is this order reference already in use? Case-insensitive. */
export async function referenceTaken(reference) {
  const { data, error } = await supabase
    .from("orders")
    .select("id")
    .ilike("reference", reference)
    .limit(1);

  fail(error, "Could not check the order reference");
  return data.length > 0;
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
export async function update(id, patch) {
  if (!isUuid(id)) return null;

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
    .select()
    .maybeSingle();

  fail(error, "Could not update order");
  return data ? toPublic(data) : null;
}

export async function remove(id) {
  if (!isUuid(id)) return null;

  const { data, error } = await supabase
    .from("orders")
    .delete()
    .eq("id", id)
    .select()
    .maybeSingle();

  fail(error, "Could not delete order");
  return data ? toPublic(data) : null;
}
