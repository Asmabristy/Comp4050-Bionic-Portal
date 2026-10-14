
const TOKEN_KEY = "fitportal.token";
const REFRESH_KEY = "fitportal.refresh";

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  setRefresh: (t) =>
    t ? localStorage.setItem(REFRESH_KEY, t) : localStorage.removeItem(REFRESH_KEY),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

async function send(path, { method, body, token }) {
  return fetch(`/api${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

/*
 * Access tokens last an hour. Rather than watching the clock, we let a request
 * fail once with a 401, swap the refresh token for a new access token, and
 * replay it. Only one refresh runs at a time — several requests failing at once
 * would otherwise each spend the refresh token, and only the first would win.
 */
let refreshing = null;

async function refreshAccessToken() {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) return null;

  if (!refreshing) {
    refreshing = (async () => {
      try {
        const res = await send("/auth/refresh", {
          method: "POST",
          body: { refreshToken },
        });

        if (!res.ok) return null;

        const data = await res.json();
        tokenStore.set(data.token);
        tokenStore.setRefresh(data.refreshToken);
        return data.token;
      } catch {
        return null;
      } finally {
        // Let the next 401 start a fresh attempt.
        setTimeout(() => {
          refreshing = null;
        }, 0);
      }
    })();
  }

  return refreshing;
}

async function request(path, { method = "GET", body } = {}) {
  let res = await send(path, { method, body, token: tokenStore.get() });

  if (res.status === 401 && path !== "/auth/refresh") {
    const fresh = await refreshAccessToken();

    if (fresh) {
      res = await send(path, { method, body, token: fresh });
    }
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401) tokenStore.clear();
    throw new Error(data.error || `Request failed (${res.status}).`);
  }

  return data;
}

export const api = {
  register: (payload) =>
    request("/auth/register", {
      method: "POST",
      body: payload,
    }),

  login: (payload) =>
    request("/auth/login", {
      method: "POST",
      body: payload,
    }),

  me: () => request("/auth/me"),

  listContainers: (includeInactive = false) =>
    request(
      includeInactive
        ? "/containers?includeInactive=true"
        : "/containers"
    ),

  createContainer: (payload) =>
    request("/containers", {
      method: "POST",
      body: payload,
    }),

  updateContainer: (id, payload) =>
    request(`/containers/${id}`, {
      method: "PATCH",
      body: payload,
    }),

  deleteContainer: (id) =>
    request(`/containers/${id}`, {
      method: "DELETE",
    }),

  listOrders: () => request("/orders"),

  createOrder: (payload) =>
    request("/orders", {
      method: "POST",
      body: payload,
    }),

  getOrder: (id) => request(`/orders/${id}`),

  packOrder: (id) =>
    request(`/orders/${id}/pack`, {
      method: "POST",
    }),

  getResult: (id) =>
    request(`/orders/${id}/result`),

  listUsers: () => request("/admin/users"),

  setUserRole: (id, role) =>
    request(`/admin/users/${id}`, {
      method: "PATCH",
      body: { role },
    }),

  // Delete a user account (Admin-only backend endpoint).
  deleteUser: (id) =>
    request(`/admin/users/${id}`, {
      method: "DELETE",
    }),

  deleteOrder: (id) =>
    request(`/orders/${id}`, {
      method: "DELETE",
    }),
};
