const TOKEN_KEY = "fitportal.token";

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function request(path, { method = "GET", body } = {}) {
  const token = tokenStore.get();

  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401) tokenStore.clear();
    throw new Error(data.error || `Request failed (${res.status}).`);
  }
  return data;
}

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  me: () => request("/auth/me"),

  listContainers: () => request("/containers"),
  createContainer: (payload) => request("/containers", { method: "POST", body: payload }),

  listOrders: () => request("/orders"),
  createOrder: (payload) => request("/orders", { method: "POST", body: payload }),
  getOrder: (id) => request(`/orders/${id}`),
  packOrder: (id) => request(`/orders/${id}/pack`, { method: "POST" }),
  getResult: (id) => request(`/orders/${id}/result`),
  deleteOrder: (id) => request(`/orders/${id}`, { method: "DELETE" }),
};
