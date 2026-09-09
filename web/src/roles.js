/**
 * Roles are ranked, not unrelated labels.
 *
 * Checking `role === "supervisor"` exactly meant an admin saw less of the app
 * than a supervisor, so promoting someone to admin quietly took away their
 * access. Mirrors hasAtLeast() in the server's auth middleware — the server is
 * what actually enforces this; these checks only decide what to render.
 */
const RANK = {
  operator: 1,
  supervisor: 2,
  admin: 3,
};

export function hasAtLeast(role, minimum) {
  return (RANK[role] || 0) >= (RANK[minimum] || 0);
}

/** Can run the packing algorithm and reach the Administration page. */
export function isSupervisor(user) {
  return hasAtLeast(user?.role, "supervisor");
}
