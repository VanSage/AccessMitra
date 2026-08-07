// Thin fetch wrapper around the Express backend.
// Set EXPO_PUBLIC_API_URL in mobile/.env (Expo auto-loads EXPO_PUBLIC_* vars),
// e.g. EXPO_PUBLIC_API_URL=http://192.168.1.10:4000/api when testing on a
// physical device on the same Wi-Fi network as your dev machine.
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data;
}

export const api = {
  getPlaces: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/places${qs ? `?${qs}` : ''}`);
  },
  getPlace: (id) => request(`/places/${id}`),
  getRoute: (placeId, from) =>
    request(`/routes?placeId=${placeId}${from ? `&fromLat=${from.lat}&fromLng=${from.lng}` : ''}`),
  listReports: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/reports${qs ? `?${qs}` : ''}`);
  },
  submitReport: (payload, token) =>
    request('/reports', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(payload),
    }),
  upvoteReport: (id, token) =>
    request(`/reports/${id}/upvote`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),
  getLeaderboard: () => request('/community/leaderboard'),
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (payload) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
};
