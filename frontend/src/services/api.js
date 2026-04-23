// Frontend API service — base fetch wrapper
// Backend runs on port 8082

const BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:8082'
  : `http://${window.location.hostname}:8082`;

function getAuthHeaders() {
  const jwt = localStorage.getItem('jwt');
  return {
    'Content-Type': 'application/json',
    ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
  };
}

async function handleResponse(res) {
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { message: text };
  }
  if (!res.ok) {
    const msg = data?.error || data?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export default {
  get: (path, options = {}) => {
    let url = `${BASE_URL}${path}`;
    if (options.params && Object.keys(options.params).length > 0) {
      const query = new URLSearchParams(
        Object.fromEntries(Object.entries(options.params).filter(([, v]) => v !== undefined && v !== null && v !== ''))
      ).toString();
      if (query) url += `?${query}`;
    }
    return fetch(url, { headers: getAuthHeaders() }).then(handleResponse);
  },

  post: (path, body) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),

  put: (path, body) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),

  patch: (path, body) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),

  delete: (path) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).then(handleResponse),
};
