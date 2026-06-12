// const BASE = import.meta.env.VITE_BACKEND_URL;
const BASE = 'http://localhost:8080';
// const BASE = ""

export const API_URLS = {
    BASE: BASE,
    API: `${BASE}/api`,
    LOGOUT: `${BASE}/logout`,
    AUTH_OCI: `${BASE}/oauth2/authorization/oci`,
    LOGIN: `${BASE}/login`,
};