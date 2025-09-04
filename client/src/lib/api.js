const BASE = (process.env.REACT_APP_API_BASE || "/api").replace(/\/$/, "");
export const API_URL = BASE;

const TOKEN_KEY = "pd.token";
const USER_KEY = "pd.user";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t || "");
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const getUser = () => {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || "null"); }
  catch { return null; }
};
export const setUser = (u) => localStorage.setItem(USER_KEY, JSON.stringify(u || null));
export const clearUser = () => localStorage.removeItem(USER_KEY);

export async function api(path, opts = {}) {
  const headers = { ...(opts.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (opts.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";

  const res = await fetch(`${API_URL}${path}`, { ...opts, headers });
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (res.status === 401) throw new Error("unauthorized");
  if (!res.ok) throw new Error(data?.error || `Request failed: ${res.status}`);
  return data;
}
