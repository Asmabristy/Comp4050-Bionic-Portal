/**
 * Every id in this schema is a Postgres uuid.
 *
 * Passing anything else straight through to PostgREST is unreliable: a plain
 * non-uuid comes back as error 22P02, but an id containing characters that are
 * special in a query string produces a malformed request that Supabase answers
 * with an HTML error page. The client then fails parsing it as JSON and the
 * route 500s instead of 404ing.
 *
 * Checking the shape here means a bad id is simply "not found", whatever it
 * contains, and saves a pointless round trip.
 */
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value) {
  return typeof value === "string" && UUID.test(value);
}
