// ─────────────────────────────────────────────────────────────────
// After deploying the backend to Render.com, paste your Render URL below
// e.g. https://ebizzpro-backend.onrender.com
// ─────────────────────────────────────────────────────────────────
export const API_URL = 'https://YOUR_RENDER_URL.onrender.com';

async function apiRequest(method, path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ── Auth ──────────────────────────────────────────────────────────
export const authAPI = {
  register: (name, email, password) =>
    apiRequest('POST', '/auth/register', { name, email, password }),

  login: (email, password) =>
    apiRequest('POST', '/auth/login', { email, password }),

  updateProfile: (userId, profile) =>
    apiRequest('PATCH', `/auth/profile/${userId}`, profile),
};

// ── Invoices ──────────────────────────────────────────────────────
export const invoiceAPI = {
  getAll:       (userId)      => apiRequest('GET',    `/invoices/${userId}`),
  create:       (data)        => apiRequest('POST',   '/invoices', data),
  updateStatus: (id, status)  => apiRequest('PATCH',  `/invoices/${id}/status`, { status }),
  delete:       (id)          => apiRequest('DELETE', `/invoices/${id}`),
};

// ── Parties ───────────────────────────────────────────────────────
export const partyAPI = {
  getAll:  (userId) => apiRequest('GET',    `/parties/${userId}`),
  create:  (data)   => apiRequest('POST',   '/parties', data),
  update:  (id, d)  => apiRequest('PATCH',  `/parties/${id}`, d),
  delete:  (id)     => apiRequest('DELETE', `/parties/${id}`),
};

// ── Stock ─────────────────────────────────────────────────────────
export const stockAPI = {
  getAll:  (userId) => apiRequest('GET',    `/stock/${userId}`),
  create:  (data)   => apiRequest('POST',   '/stock', data),
  update:  (id, d)  => apiRequest('PATCH',  `/stock/${id}`, d),
  delete:  (id)     => apiRequest('DELETE', `/stock/${id}`),
};
