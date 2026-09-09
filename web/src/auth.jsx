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

  const signIn = async (email, password) => {
    const { token, refreshToken, user } = await api.login({ email, password });
    tokenStore.set(token);
    tokenStore.setRefresh(refreshToken);
    setUser(user);
  };

  const signUp = async (name, email, password) => {
    const { token, refreshToken, user } = await api.register({ name, email, password });
    tokenStore.set(token);
    tokenStore.setRefresh(refreshToken);
    setUser(user);
  };

  const signOut = () => {
    tokenStore.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, checking, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
