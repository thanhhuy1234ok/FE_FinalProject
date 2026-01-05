export const API_BASE = "/api/v1";

export const AUTH_API = {
  LOGIN: `${API_BASE}/auth/login`,
  LOGOUT: `${API_BASE}/auth/logout`,
  ACCOUNT: `${API_BASE}/auth/account`,
  REFRESH:`${API_BASE}/auth/refresh`
};  

export const USER_API = {
  LIST: `${API_BASE}/users`,
  CREATE: `${API_BASE}/users`,
  DETAIL: (id: string | number) => `${API_BASE}/users/${id}`,
  DELETE: (id: string | number) => `${API_BASE}/users/${id}`,
};
