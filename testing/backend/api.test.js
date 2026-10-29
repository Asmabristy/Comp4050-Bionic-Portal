import {
  beforeAll,
  afterAll,
  beforeEach,
  describe,
  it,
  expect,
  vi,
} from "vitest";
import express from "express";
const fake = vi.hoisted(() => ({
  rows: new Map(),
  nextId: 0,
  profileError: null,
  signInError: null,
  refreshError: true,
  solverError: false,
  active: [],
  users: new Map(),
}));
vi.mock("../../server/src/supabase.js", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(async (token) => ({
        data: { user: fake.users.get(token) || null },
        error: null,
      })),
      admin: {
        createUser: vi.fn(async (input) => ({
          data: { user: { id: "new-user", email: input.email } },
          error: null,
        })),
        deleteUser: vi.fn(async () => ({ error: null })),
      },
    },
    from: vi.fn(() => ({
      select: () => ({
        eq: (_, id) => ({
          maybeSingle: async () => ({ data: fake.users.get(id) || null }),
        }),
      }),
      insert: async () => ({ error: fake.profileError }),
    })),
  },
  signInClient: () => ({
    auth: {
      signInWithPassword: async () => ({
        data: fake.signInError
          ? { session: null }
          : {
              session: {
                access_token: "new-token",
                refresh_token: "new-refresh",
              },
              user: fake.users.get("operator"),
            },
        error: fake.signInError,
      }),
      refreshSession: async () => ({
        data: fake.refreshError
          ? { session: null }
          : {
              session: {
                access_token: "renewed",
                refresh_token: "renewed-refresh",
              },
              user: fake.users.get("operator"),
            },
        error: fake.refreshError ? { message: "expired" } : null,
      }),
    },
  }),
}));
vi.mock("../../server/src/data/orders.js", () => ({
  listAll: async () => [...fake.rows.values()],
  findById: async (id) => fake.rows.get(id) || null,
  referenceTaken: async (ref) =>
    [...fake.rows.values()].some(
      (o) => o.reference.toLowerCase() === ref.toLowerCase(),
    ),
  create: async (input) => {
    const row = { ...input, id: `order-${++fake.nextId}`, result: null };
    fake.rows.set(row.id, row);
    return row;
  },
  update: async (id, patch) => {
    const row = fake.rows.get(id);
    if (!row) return null;
    const next = { ...row, ...patch };
    fake.rows.set(id, next);
    return next;
  },
  remove: async (id) => fake.rows.delete(id),
}));
vi.mock("../../server/src/data/containers.js", () => ({
  listActive: async () => fake.active,
}));
vi.mock("../../server/src/config.js", () => ({ config: { useMockSolver: true } }));
// Real HTTP routes; Supabase, persistence and Solver are isolated doubles.
// Solver adapter is tested separately in solver.test.js.
vi.mock("../../server/src/services/solverClient.js", () => ({
  requestPacking: vi.fn(async (order) => ({
    status: "success",
    boxes: [
      {
        boxId: "BOX",
        dimensions: { width: 100, depth: 80, length: 200 },
        items: [],
      },
    ],
    unpacked: [],
  })),
}));
import { ordersRouter } from "../../server/src/routes/orders.routes.js";
import { authRouter } from "../../server/src/routes/auth.routes.js";
import { errorHandler, notFound } from "../../server/src/middleware/errors.js";
import { supabase } from "../../server/src/supabase.js";
let server, base;
const item = (patch = {}) => ({
  itemCode: "SKU",
  itemReference: "Widget",
  width: 10,
  depth: 20,
  length: 30,
  weight: 1,
  quantity: 2,
  ...patch,
});
const payload = (patch = {}) => ({
  reference: "QA-001",
  items: [item()],
  ...patch,
});
async function call(path, { method = "GET", body, role = "operator" } = {}) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(role ? { Authorization: `Bearer ${role}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return { status: res.status, body: await res.json() };
}
beforeAll(async () => {
  const app = express();
  app.use(express.json());
  app.use("/api/orders", ordersRouter);
  app.use("/api/auth", authRouter);
  app.use(notFound);
  app.use(errorHandler);
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
afterAll(async () => {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
});
beforeEach(() => {
  vi.clearAllMocks();
  fake.rows.clear();
  fake.nextId = 0;
  fake.profileError = null;
  fake.signInError = null;
  fake.refreshError = true;
  fake.active = [
    { reference: "BOX", width: 100, depth: 80, length: 200, active: true },
  ];
  fake.users.clear();
  for (const role of ["operator", "supervisor", "admin"])
    fake.users.set(role, {
      id: role,
      email: `${role}@example.test`,
      role,
      name: role,
    });
});
describe("real Express routes with isolated Supabase/persistence doubles", () => {
  it.each([null, "invalid"])(
    "rejects missing/invalid credentials: %s",
    async (role) => {
      expect((await call("/api/orders", { role })).status).toBe(401);
    },
  );
  it("creates an Operator draft, shares it, packs as Supervisor, exposes the Visualiser contract, edits and repacks", async () => {
    const created = await call("/api/orders", {
      method: "POST",
      body: payload(),
    });
    expect(created.status).toBe(201);
    const id = created.body.order.id;
    expect(
      (await call("/api/orders", { role: "supervisor" })).body.orders,
    ).toHaveLength(1);
    expect(
      (await call(`/api/orders/${id}/pack`, { method: "POST" })).status,
    ).toBe(403);
    expect(
      (
        await call(`/api/orders/${id}/items`, {
          method: "PUT",
          body: { items: [item()] },
        })
      ).status,
    ).toBe(403);
    expect(
      (
        await call(`/api/orders/${id}/pack`, {
          method: "POST",
          role: "supervisor",
        })
      ).body.order.status,
    ).toBe("packed");
    const result = await call(`/api/orders/${id}/result`);
    expect(result.status).toBe(200);
    expect(result.body.boxes[0].dimensions).toEqual({
      width: 100,
      depth: 80,
      length: 200,
    });
    const edit = await call(`/api/orders/${id}/items`, {
      method: "PUT",
      role: "admin",
      body: { items: [item({ quantity: 1, boxGroup: 7 })] },
    });
    expect(edit.body.order).toMatchObject({
      status: "draft",
      result: null,
      items: [{ boxGroup: "7", quantity: 1 }],
    });
    expect((await call(`/api/orders/${id}/result`)).status).toBe(404);
    expect(
      (await call(`/api/orders/${id}/pack`, { method: "POST", role: "admin" }))
        .body.order.status,
    ).toBe("packed");
  });
  it.each([0, -1, 1.5, 10001, null, "2"])(
    "rejects invalid API quantity %s",
    async (quantity) => {
      expect(
        (
          await call("/api/orders", {
            method: "POST",
            body: payload({ items: [item({ quantity })] }),
          })
        ).status,
      ).toBe(400);
      expect(fake.rows.size).toBe(0);
    },
  );
  it.each([0, -1, "10", null])("rejects invalid width %s", async (width) => {
    expect(
      (
        await call("/api/orders", {
          method: "POST",
          body: payload({ items: [item({ width })] }),
        })
      ).status,
    ).toBe(400);
  });
  it("rejects aggregate unit and row limits", async () => {
    expect(
      (
        await call("/api/orders", {
          method: "POST",
          body: payload({
            items: [
              item({ quantity: 10000 }),
              item({ quantity: 10000 }),
              item(),
            ],
          }),
        })
      ).status,
    ).toBe(400);
    expect(
      (
        await call("/api/orders", {
          method: "POST",
          body: payload({ items: Array.from({ length: 501 }, () => item()) }),
        })
      ).status,
    ).toBe(400);
  });
  it("rejects duplicate references case-insensitively", async () => {
    await call("/api/orders", { method: "POST", body: payload() });
    expect(
      (
        await call("/api/orders", {
          method: "POST",
          body: payload({ reference: "qa-001" }),
        })
      ).status,
    ).toBe(409);
  });
  it.each(["BOX", 1, []])(
    "rejects malformed explicit carton entry %j with 400 rather than 500",
    async (value) => {
      expect(
        (
          await call("/api/orders", {
            method: "POST",
            body: payload({ containers: [value] }),
          })
        ).status,
      ).toBe(400);
    },
  );
  it("rejects packing with no remaining active cartons", async () => {
    const r = await call("/api/orders", { method: "POST", body: payload() });
    fake.active = [];
    expect(
      (
        await call(`/api/orders/${r.body.order.id}/pack`, {
          method: "POST",
          role: "supervisor",
        })
      ).status,
    ).toBe(400);
  });
  it("rejects edits while an order is packing", async () => {
    const r = await call("/api/orders", { method: "POST", body: payload() });
    fake.rows.get(r.body.order.id).status = "packing";
    expect(
      (
        await call(`/api/orders/${r.body.order.id}/items`, {
          method: "PUT",
          role: "supervisor",
          body: { items: [item()] },
        })
      ).status,
    ).toBe(409);
  });
  it.each(["supervisor"])(
    "allows %s to delete another user order",
    async (role) => {
      const r = await call("/api/orders", { method: "POST", body: payload() });
      expect(
        (
          await call(`/api/orders/${r.body.order.id}`, {
            method: "DELETE",
            role,
          })
        ).status,
      ).toBe(200);
    },
  );
  it("allows the owner to delete and rejects unrelated Operators", async () => {
    const r = await call("/api/orders", { method: "POST", body: payload() });
    fake.rows.get(r.body.order.id).ownerId = "other";
    expect(
      (await call(`/api/orders/${r.body.order.id}`, { method: "DELETE" }))
        .status,
    ).toBe(403);
    fake.rows.get(r.body.order.id).ownerId = "operator";
    expect(
      (await call(`/api/orders/${r.body.order.id}`, { method: "DELETE" }))
        .status,
    ).toBe(200);
  });
  it("returns 404 for a missing order", async () => {
    expect((await call("/api/orders/missing")).status).toBe(404);
  });
  it("rejects weak passwords before creating an account", async () => {
    const r = await call("/api/auth/register", {
      method: "POST",
      role: null,
      body: { name: "QA", email: "qa@example.test", password: "abcdefgh" },
    });
    expect(r.status).toBe(400);
    expect(supabase.auth.admin.createUser).not.toHaveBeenCalled();
  });
  it("returns a valid session for successful registration", async () => {
    const r = await call("/api/auth/register", {
      method: "POST",
      role: null,
      body: { name: "QA", email: "qa@example.test", password: "QaTest123!" },
    });
    expect(r.status).toBe(201);
    expect(r.body.token).toBe("new-token");
    expect(r.body.user.role).toBe("operator");
  });
  it("cleans up the auth account when profile creation fails", async () => {
    fake.profileError = { message: "storage error" };
    const r = await call("/api/auth/register", {
      method: "POST",
      role: null,
      body: { name: "QA", email: "qa@example.test", password: "QaTest123!" },
    });
    expect(r.status).toBe(500);
    expect(supabase.auth.admin.deleteUser).toHaveBeenCalledWith("new-user");
  });
});

it("login validates missing input, rejects invalid credentials and returns a session on success", async () => {
  expect(
    (await call("/api/auth/login", { method: "POST", body: {} })).status,
  ).toBe(400);
  fake.signInError = { message: "invalid credentials" };
  expect(
    (
      await call("/api/auth/login", {
        method: "POST",
        body: { email: "qa@example.test", password: "wrong" },
      })
    ).status,
  ).toBe(401);
  fake.signInError = null;
  const r = await call("/api/auth/login", {
    method: "POST",
    body: { email: "qa@example.test", password: "QaTest123!" },
  });
  expect(r.status).toBe(200);
  expect(r.body.token).toBe("new-token");
  expect(r.body.user.role).toBe("operator");
});
it("refresh rejects absent/expired tokens and returns both replacement tokens", async () => {
  expect(
    (await call("/api/auth/refresh", { method: "POST", body: {} })).status,
  ).toBe(400);
  expect(
    (
      await call("/api/auth/refresh", {
        method: "POST",
        body: { refreshToken: "expired" },
      })
    ).status,
  ).toBe(401);
  fake.refreshError = false;
  const r = await call("/api/auth/refresh", {
    method: "POST",
    body: { refreshToken: "valid" },
  });
  expect(r.status).toBe(200);
  expect(r.body).toMatchObject({
    token: "renewed",
    refreshToken: "renewed-refresh",
    user: { role: "operator" },
  });
});
it("me exposes only the public user shape and rejects an invalid token", async () => {
  const r = await call("/api/auth/me");
  expect(r.status).toBe(200);
  expect(r.body.user).toEqual({
    id: "operator",
    email: "operator@example.test",
    name: "operator",
    role: "operator",
  });
  expect((await call("/api/auth/me", { role: "invalid" })).status).toBe(401);
});
