
import { useState } from "react";
import { useAuth } from "../auth.jsx";

export function Login() {
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState("signin");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) =>
    setForm((current) => ({
      ...current,
      [key]: e.target.value,
    }));

  const submit = async () => {
    if (busy) return;

    setError("");
    setSuccess("");
    setBusy(true);

    try {
      if (mode === "signin") {
        await signIn(form.email, form.password);
      } else {
        const result = await signUp(
          form.name,
          form.email,
          form.password
        );

        if (result?.requiresEmailVerification) {
          setSuccess(
            result.message ||
              "Please check your email and verify your account before signing in."
          );

          // Clear the password after registration.
          setForm((current) => ({
            ...current,
            password: "",
          }));

          setShowPassword(false);
        } else {
          setError(
            "Registration could not be confirmed. Please try again."
          );
        }
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !busy) {
      submit();
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError("");
    setSuccess("");
    setShowPassword(false);
    setForm((current) => ({
      ...current,
      password: "",
    }));
  };

  return (
    <div className="login-page">
      <div className="login-plate">
        <div className="login-brand">
          <span className="login-brand__bionic">Bionic</span>
          <span className="login-brand__portal">Portal</span>
        </div>

        <div>
          <p className="login-plate__statement">
            Every carton, item and order, specified and measured.
          </p>

          <dl className="login-plate__spec">
            <div>
              <dt>System</dt>
              <dd>Project Perfect Fit</dd>
            </div>

            <div>
              <dt>Packing</dt>
              <dd>FitSolver</dd>
            </div>

            <div>
              <dt>Inspection</dt>
              <dd>FitVisualizer, in three dimensions</dd>
            </div>

            <div>
              <dt>Units</dt>
              <dd>Millimetres and kilograms</dd>
            </div>
          </dl>
        </div>

        <p className="login-footer">
          Bionic Portal · Project Perfect Fit
        </p>
      </div>

      <div className="login-form-side">
        <div className="login-card">
          <h1>
            {mode === "signin"
              ? "Sign in to Bionic Portal"
              : "Create an account"}
          </h1>

          {error && (
            <div
              className="notice notice--error"
              style={{ marginTop: 16 }}
              role="alert"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className="notice"
              style={{
                marginTop: 16,
                padding: 14,
                border: "1px solid #16a34a",
                borderRadius: 8,
                backgroundColor: "#f0fdf4",
                color: "#166534",
              }}
              role="status"
            >
              <strong>Check your email</strong>
              <p style={{ margin: "8px 0 0" }}>
                {success}
              </p>
            </div>
          )}

          <div className="login-form">
            {mode === "signup" && (
              <div className="login-field">
                <label htmlFor="name">Name</label>

                <input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={set("name")}
                  onKeyDown={onKeyDown}
                  autoComplete="name"
                />
              </div>
            )}

            <div className="login-field">
              <label htmlFor="email">Email</label>

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set("email")}
                onKeyDown={onKeyDown}
                autoComplete="email"
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>

              <div className="password-field">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Your password"
                  value={form.password}
                  onChange={set("password")}
                  onKeyDown={onKeyDown}
                  autoComplete={
                    mode === "signin"
                      ? "current-password"
                      : "new-password"
                  }
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {mode === "signup" && (
                <p className="login-hint">
                  At least 8 characters, with an uppercase and a lowercase
                  letter, a number, and a special character.
                </p>
              )}
            </div>

            <button
              type="button"
              className="login-submit"
              onClick={submit}
              disabled={busy}
            >
              {busy
                ? "Working…"
                : mode === "signin"
                  ? "Sign in"
                  : "Create account"}
            </button>
          </div>

          <div className="login-switch">
            {mode === "signin" ? (
              <>
                <span>No account yet?</span>

                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                <span>Already registered?</span>

                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
