/**
 * One definition of what counts as an acceptable password.
 *
 * It used to live inline in the register route, which meant the seed script
 * could — and did — create accounts that the app's own rules would reject.
 */
const STRONG =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,}$/;

export const PASSWORD_RULE =
  "Password must be at least 8 characters and include an uppercase letter, lowercase letter, number, and special character.";

export function isStrongPassword(password) {
  return typeof password === "string" && STRONG.test(password);
}
