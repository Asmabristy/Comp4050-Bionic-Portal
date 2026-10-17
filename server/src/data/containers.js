import { supabase } from "../supabase.js";
import { isUuid } from "./ids.js";

/*
 * Postgres columns are snake_case; the API has always spoken camelCase.
 * Translate at this boundary so routes and clients see the shape they always
 * did — the same JSON the Mongoose toPublic() used to return.
 */

function toPublic(row) {
  return {
    id: row.id,
    reference: row.reference,
    width: Number(row.width),
    length: Number(row.length),
    depth: Number(row.depth),
    maxWeight: row.max_weight === null ? null : Number(row.max_weight),
    boxWeight: row.box_weight === null ? null : Number(row.box_weight),
    active: row.active,
    maximumBoxes: row.maximum_boxes === null ? null : Number(row.maximum_boxes),
  };
}

function toRow(input) {
  return {
    reference: input.reference,
    width: input.width,
    length: input.length,
    depth: input.depth,
    max_weight: input.maxWeight ?? null,
    box_weight: input.boxWeight ?? null,
    active: input.active ?? true,
    maximum_boxes: input.maximumBoxes ?? null,
  };
}

function fail(error, what) {
  if (error) throw new Error(`${what}: ${error.message}`);
}

/** Active carton types, smallest first — the packing catalogue. */
export async function listActive() {
  const { data, error } = await supabase
    .from("containers")
    .select("*")
    .eq("active", true)
    .order("width", { ascending: true });

  fail(error, "Could not load cartons");
  return data.map(toPublic);
}

export async function listAll() {
  const { data, error } = await supabase
    .from("containers")
    .select("*")
    .order("width", { ascending: true });

  fail(error, "Could not load cartons");
  return data.map(toPublic);
}

export async function findByReference(reference) {
  const { data, error } = await supabase
    .from("containers")
    .select("*")
    .eq("reference", reference)
    .maybeSingle();

  fail(error, "Could not look up carton");
  return data ? toPublic(data) : null;
}

export async function findById(id) {
  if (!isUuid(id)) return null;

  const { data, error } = await supabase
    .from("containers")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  fail(error, "Could not look up carton");

  return data ? toPublic(data) : null;
}

/** Is this reference already used by a different carton? */
export async function referenceTaken(reference, exceptId) {
  let query = supabase.from("containers").select("id").eq("reference", reference);
  if (exceptId) query = query.neq("id", exceptId);

  const { data, error } = await query.maybeSingle();

  fail(error, "Could not check carton reference");
  return Boolean(data);
}

/** Patch a carton. patch uses API names (maxWeight, maximumBoxes, ...). */
export async function update(id, patch) {
  if (!isUuid(id)) return null;

  const row = {};
  if (patch.reference !== undefined) row.reference = patch.reference;
  if (patch.width !== undefined) row.width = patch.width;
  if (patch.length !== undefined) row.length = patch.length;
  if (patch.depth !== undefined) row.depth = patch.depth;
  if (patch.maxWeight !== undefined) row.max_weight = patch.maxWeight;
  if (patch.boxWeight !== undefined) row.box_weight = patch.boxWeight;
  if (patch.active !== undefined) row.active = patch.active;
  if (patch.maximumBoxes !== undefined) row.maximum_boxes = patch.maximumBoxes;

  const { data, error } = await supabase
    .from("containers")
    .update(row)
    .eq("id", id)
    .select()
    .maybeSingle();

  fail(error, "Could not update carton");
  return data ? toPublic(data) : null;
}

export async function create(input) {
  const { data, error } = await supabase
    .from("containers")
    .insert(toRow(input))
    .select()
    .single();

  fail(error, "Could not save carton");
  return toPublic(data);
}

export async function remove(id) {
  if (!isUuid(id)) return null;

  const { data, error } = await supabase
    .from("containers")
    .delete()
    .eq("id", id)
    .select()
    .maybeSingle();

  fail(error, "Could not delete carton");
  return data ? toPublic(data) : null;
}
