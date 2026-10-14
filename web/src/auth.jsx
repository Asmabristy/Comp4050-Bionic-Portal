
import { createContext, useContext, useEffect, useState } from "react";
import { api, tokenStore } from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  // Restore the session if a token is still in storage.
  useEffect(() => {
    if (!tokenStore.get()) {
      setChecking(false);
      return;
    }

    api
      .me()
      .then(({ user }) => setUser(user))
      .catch(() => tokenStore.clear())
      .finally(() => setChecking(false));
  }, []);

  /**
   * Sign in an existing, verified user.
   *
   * The backend validates credentials, email confirmation,
   * and the user's database profile.
   *
   * Existing confirmed Supervisor accounts use this same flow.
   */
  const signIn = async (email, password) => {
    const { token, refreshToken, user } = await api.login({
      email,
      password,
    });

    tokenStore.set(token);
    tokenStore.setRefresh(refreshToken);
    setUser(user);
  };

  /**
   * Register a new Operator.
   *
   * Registration now sends an email verification link.
   * It does not create a logged-in session.
   *
   * Return the API response so the registration page
   * can display the verification message.
   */
  const signUp = async (name, email, password) => {
    const result = await api.register({
      name,
      email,
      password,
    });

    return result;
  };

  /**
   * Sign out the current user.
   */
  const signOut = () => {
    tokenStore.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        checking,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return ctx;
}
