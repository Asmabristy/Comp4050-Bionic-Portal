import { it, expect, vi } from "vitest";
vi.mock("../../server/src/supabase.js", () => ({ supabase: {} }));
import { requireSupervisor, requireAdmin } from "../../server/src/middleware/auth.js";
import { isStrongPassword } from "../../server/src/passwordPolicy.js";
it.each([
  "abcdefgh",
  "ABCDEFGH",
  "Abcdefg1",
  "Ab1!",
  "Abc 123!",
  null,
  12345678,
])("rejects weak/non-string passwords %j", (password) => {
  expect(isStrongPassword(password)).toBe(false);
});
it("accepts a password satisfying every published rule", () => {
  expect(isStrongPassword("QaTest123!")).toBe(true);
});
it.each(["operator", "unknown", undefined])(
  "denies packing for role %s",
  (role) => {
    const next = vi.fn();
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    requireSupervisor({ user: { role } }, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  },
);
it.each(["supervisor", "admin"])("permits packing for %s", (role) => {
  const next = vi.fn();
  requireSupervisor({ user: { role } }, {}, next);
  expect(next).toHaveBeenCalledOnce();
});
it("restricts Admin-only middleware to Admin", () => {
  const next = vi.fn();
  const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
  requireAdmin({ user: { role: "supervisor" } }, res, next);
  expect(res.status).toHaveBeenCalledWith(403);
  requireAdmin({ user: { role: "admin" } }, res, next);
  expect(next).toHaveBeenCalledOnce();
});
