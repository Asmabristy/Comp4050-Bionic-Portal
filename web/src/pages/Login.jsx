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
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) =>
    setForm({
      ...form,
      [key]: e.target.value,
    });

  const submit = async () => {
    setError("");
    setBusy(true);

    try {
      if (mode === "signin") {
        await signIn(form.email, form.password);
      } else {
        await signUp(
          form.name,
          form.email,
          form.password
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      submit();
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError("");
    setShowPassword(false);
  };

  return (
    <div className="login-page">
      <div className="login-background-shape login-background-shape--one" />
      <div className="login-background-shape login-background-shape--two" />

      <div className="login-shell">

        {/* Branding */}
        <div className="login-brand">
          <span className="login-brand__bionic">
            BIONIC
          </span>

          <span className="login-brand__portal">
            PORTAL
          </span>
        </div>

        {/* Login card */}
        <div className="login-card">
          <div className="login-card__heading">
            <span className="login-eyebrow">
              {mode === "signin"
                ? "Welcome back"
                : "Get started"}
            </span>

            <h1>
              {mode === "signin"
                ? "Sign in to your account"
                : "Create your account"}
            </h1>

           
          </div>

          {error && (
            <div className="notice notice--error">
              {error}
            </div>
          )}

          <div className="login-form">

            {mode === "signup" && (
              <div className="login-field">
                <label htmlFor="name">
                  Name
                </label>

                <input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={set("name")}
                  onKeyDown={onKeyDown}
                  autoComplete="name"
                />
              </div>
            )}

            <div className="login-field">
              <label htmlFor="email">
                Email
              </label>

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
              <label htmlFor="password">
                Password
              </label>

              <div className="password-field">
                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
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
                    setShowPassword(
                      (current) => !current
                    )
                  }
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>
              </div>
            </div>

            <button
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
                <span>
                  No account yet?
                </span>

                <button
                  type="button"
                  onClick={() =>
                    switchMode("signup")
                  }
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                <span>
                  Already registered?
                </span>

                <button
                  type="button"
                  onClick={() =>
                    switchMode("signin")
                  }
                >
                  Sign in
                </button>
              </>
            )}
          </div>

        </div>

        <div className="login-footer">
          Bionic Portal · Project Perfect Fit
        </div>

      </div>
    </div>
  );
}