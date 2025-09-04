import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, getToken, setToken, clearToken, getUser, setUser, clearUser } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [initializing, setInitializing] = useState(true);
  const [user, setUserState] = useState(null);

  useEffect(() => {
    // подтянуть сохранённого пользователя при старте
    const u = getUser();
    const t = getToken();
    if (u && t) setUserState(u);
    setInitializing(false);
  }, []);

  async function login(email, password) {
    const data = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    setUser(data.user);
    setUserState(data.user);
    return data.user;
  }

  async function register(name, email, password) {
    const data = await api("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    setToken(data.token);
    setUser(data.user);
    setUserState(data.user);
    return data.user;
  }

  function logout() {
    clearToken();
    clearUser();
    setUserState(null);
  }

  const value = useMemo(
    () => ({ user, initializing, isAuthed: !!user, login, register, logout }),
    [user, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
