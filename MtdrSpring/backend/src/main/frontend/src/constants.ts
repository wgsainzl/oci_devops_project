const BASE = import.meta.env.VITE_BACKEND_URL;

export const API_URLS = {
  BASE: BASE,
  LOGOUT: `${BASE}/logout`,
  AUTH_OCI: `${BASE}/oauth2/authorization/oci`,
  LOGIN: `${BASE}/login`,
};