// Real Express handlers and middleware. In-memory doubles replace every database/auth call.
// These checks never create, promote or delete real Supabase accounts or cartons.
import express from "express";
import { beforeAll, afterAll, beforeEach, it, expect, vi } from "vitest";
const state = vi.hoisted(() => ({
  users: new Map(),
  cartons: new Map(),
  next: 0,
}));
vi.mock("../../server/src/supabase.js", () => ({
  supabase: {
    auth: {
      getUser: async (token) => ({
        data: { user: state.users.get(token) },
        error: null,
      }),
    },
    from: () => ({
      select: () => ({
        eq: (_, id) => ({
          maybeSingle: async () => ({ data: state.users.get(id) }),
        }),
      }),
    }),
  },
}));
vi.mock("../../server/src/data/profiles.js", () => ({
  listAll: async () => [...state.users.values()],
  findById: async (id) => state.users.get(id),
  setRole: async (id, role) => {
    const u = { ...state.users.get(id), role };
    state.users.set(id, u);
    return u;
  },
}));
vi.mock("../../server/src/data/containers.js", () => ({
  listAll: async () => [...state.cartons.values()],
  listActive: async () => [...state.cartons.values()].filter((c) => c.active),
  findById: async (id) => state.cartons.get(id),
  referenceTaken: async (ref, except) =>
    [...state.cartons.values()].some(
      (c) => c.id !== except && c.reference.toLowerCase() === ref.toLowerCase(),
    ),
  create: async (input) => {
    const c = { ...input, id: `carton-${++state.next}` };
    state.cartons.set(c.id, c);
    return c;
  },
  update: async (id, patch) => {
    if (!state.cartons.has(id)) return null;
    const c = { ...state.cartons.get(id), ...patch };
    state.cartons.set(id, c);
    return c;
  },
}));
import { adminRouter } from "../../server/src/routes/admin.routes.js";
import { containersRouter } from "../../server/src/routes/containers.routes.js";
import { errorHandler, notFound } from "../../server/src/middleware/errors.js";
let server, base;
beforeAll(async () => {
  const app = express();
  app.use(express.json());
  app.use("/api/admin", adminRouter);
  app.use("/api/containers", containersRouter);
  app.use(notFound);
  app.use(errorHandler);
  server = app.listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  base = `http://127.0.0.1:${server.address().port}`;
});
afterAll(async () => {
  server.closeAllConnections();
  await new Promise((r) => server.close(r));
});
beforeEach(() => {
  state.users.clear();
  state.cartons.clear();
  state.next = 0;
  for (const role of ["operator", "supervisor", "admin"])
    state.users.set(role, {
      id: role,
      email: `${role}@example.test`,
      role,
      name: role,
    });
  state.cartons.set("active", {
    id: "active",
    reference: "SML",
    width: 100,
    depth: 80,
    length: 200,
    active: true,
  });
  state.cartons.set("inactive", {
    id: "inactive",
    reference: "OLD",
    width: 100,
    depth: 80,
    length: 200,
    active: false,
  });
});
async function call(path, { method = "GET", role = "supervisor", body } = {}) {
  const res = await fetch(base + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(role ? { Authorization: `Bearer ${role}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return { status: res.status, body: await res.json() };
}
const valid = () => ({ reference: " NEW ", width: 50, depth: 40, length: 60 });
it.each(["/api/admin/users", "/api/containers"])(
  "requires authentication for %s",
  async (path) => expect((await call(path, { role: null })).status).toBe(401),
);
it.each(["GET", "PATCH"])(
  "denies Operator %s access to user management",
  async (method) => {
    expect(
      (
        await call("/api/admin/users" + (method === "PATCH" ? "/admin" : ""), {
          method,
          role: "operator",
          body: method === "PATCH" ? { role: "operator" } : undefined,
        })
      ).status,
    ).toBe(403);
    expect(state.users.get("admin").role).toBe("admin");
  },
);
it.each(["supervisor", "admin"])("allows %s to list users", async (role) =>
  expect((await call("/api/admin/users", { role })).body.users).toHaveLength(3),
);
it("updates another user role and keeps the change on later reads", async () => {
  const r = await call("/api/admin/users/operator", {
    method: "PATCH",
    body: { role: "supervisor" },
  });
  expect(r.status).toBe(200);
  expect(r.body.user.role).toBe("supervisor");
  expect(
    (await call("/api/admin/users")).body.users.find((u) => u.id === "operator")
      .role,
  ).toBe("supervisor");
});
it.each(["root", "", null])("rejects unsupported role %j", async (role) =>
  expect(
    (
      await call("/api/admin/users/operator", {
        method: "PATCH",
        body: { role },
      })
    ).status,
  ).toBe(400),
);
it("returns 404 for unknown user", async () =>
  expect(
    (
      await call("/api/admin/users/missing", {
        method: "PATCH",
        body: { role: "operator" },
      })
    ).status,
  ).toBe(404));
it("prevents Supervisor self-demotion", async () =>
  expect(
    (
      await call("/api/admin/users/supervisor", {
        method: "PATCH",
        body: { role: "operator" },
      })
    ).status,
  ).toBe(400));
it("lists active cartons by default and includes inactive ones on request", async () => {
  expect(
    (await call("/api/containers")).body.containers.map((c) => c.id),
  ).toEqual(["active"]);
  expect(
    (await call("/api/containers?includeInactive=true")).body.containers,
  ).toHaveLength(2);
});
it("creates, edits and deactivates a carton while retaining catalogue history", async () => {
  const created = await call("/api/containers", {
    method: "POST",
    body: valid(),
  });
  expect(created.status).toBe(201);
  const id = created.body.container.id;
  expect(created.body.container).toMatchObject({
    reference: "NEW",
    active: true,
    maxWeight: null,
  });
  const edited = await call(`/api/containers/${id}`, {
    method: "PATCH",
    body: { width: 75, maxWeight: 0, maximumBoxes: 2 },
  });
  expect(edited.body.container).toMatchObject({
    width: 75,
    maxWeight: 0,
    maximumBoxes: 2,
  });
  expect(
    (await call(`/api/containers/${id}`, { method: "DELETE" })).body.container
      .active,
  ).toBe(false);
  expect(
    (await call("/api/containers")).body.containers.map((c) => c.id),
  ).not.toContain(id);
  expect(
    (await call("/api/containers?includeInactive=true")).body.containers.map(
      (c) => c.id,
    ),
  ).toContain(id);
});
it.each([{ reference: "" }, { width: 0 }, { depth: -1 }, { length: "60" }])(
  "rejects invalid carton creation %j",
  async (patch) => {
    expect(
      (
        await call("/api/containers", {
          method: "POST",
          body: { ...valid(), ...patch },
        })
      ).status,
    ).toBe(400);
    expect(state.cartons.size).toBe(2);
  },
);
it("rejects duplicate carton references on create and update", async () => {
  expect(
    (
      await call("/api/containers", {
        method: "POST",
        body: { ...valid(), reference: "sml" },
      })
    ).status,
  ).toBe(409);
  expect(
    (
      await call("/api/containers/inactive", {
        method: "PATCH",
        body: { reference: "SML" },
      })
    ).status,
  ).toBe(409);
});
it.each([
  { width: 0 },
  { depth: -1 },
  { length: "60" },
  { maxWeight: -1 },
  { boxWeight: -1 },
  { maximumBoxes: 1.5 },
  { active: "true" },
])("rejects invalid carton edit %j without writing it", async (body) => {
  const before = structuredClone(state.cartons.get("active"));
  expect(
    (await call("/api/containers/active", { method: "PATCH", body })).status,
  ).toBe(400);
  expect(state.cartons.get("active")).toEqual(before);
});
it.each(["PATCH", "DELETE"])(
  "returns 404 for %s of missing carton",
  async (method) =>
    expect(
      (await call("/api/containers/missing", { method, body: { width: 75 } }))
        .status,
    ).toBe(404),
);
