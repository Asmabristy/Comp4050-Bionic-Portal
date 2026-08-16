import { useState } from "react";
import { useAuth } from "../auth.jsx";

export function Login() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState("signin");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async () => {
    setError("");
    setBusy(true);
    try {
      if (mode === "signin") {
        await signIn(form.email, form.password);
      } else {
        await signUp(form.name, form.email, form.password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") submit();
  };

  return (
    <div className="gate">
      <div className="gate__card">
        <div className="gate__mark">
          Fit<em>Portal</em>
        </div>
        <div className="gate__sub">Project Perfect Fit — operations</div>

        {error && <div className="notice notice--error">{error}</div>}

        {mode === "signup" && (
          <div className="field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              value={form.name}
              onChange={set("name")}
              onKeyDown={onKeyDown}
              autoComplete="name"
            />
          </div>
        )}

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={set("email")}
            onKeyDown={onKeyDown}
            autoComplete="email"
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={set("password")}
            onKeyDown={onKeyDown}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
          />
        </div>

        <button onClick={submit} disabled={busy} style={{ width: "100%" }}>
          {busy ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>

        <div className="gate__switch">
          {mode === "signin" ? (
            <>
              No account yet?{" "}
              <button onClick={() => setMode("signup")}>Create one</button>
            </>
          ) : (
            <>
              Already registered?{" "}
              <button onClick={() => setMode("signin")}>Sign in</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
