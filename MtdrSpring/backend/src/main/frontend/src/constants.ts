// const BASE = import.meta.env.VITE_BACKEND_URL;
// const BASE = import.meta.env.VITE_BACKEND_URL
const BASE = window.location.port === '5173' ? '' : import.meta.env.VITE_BACKEND_URL;

export const API_URLS = {
  BASE: BASE,
  API: `${BASE}/api`,
  LOGOUT: `${BASE}/logout`,
  AUTH_OCI: `${BASE}/oauth2/authorization/oci`,
  LOGIN: `${BASE}/login`,
};