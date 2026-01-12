export const API_BASE = "/api/v1";

export const AUTH_API = {
  LOGIN: `${API_BASE}/auth/login`,
  LOGOUT: `${API_BASE}/auth/logout`,
  ACCOUNT: `${API_BASE}/auth/account`,
  REFRESH:`${API_BASE}/auth/refresh`
};  

export const USER_API = {
  LIST: (query: string) => `${API_BASE}/users?${query}`,
  CREATE: `${API_BASE}/users`,
  DETAIL: (id: string | number) => `${API_BASE}/users/${id}`,
  DELETE: (id: string | number) => `${API_BASE}/users/${id}`,
};

export const ROLES_API = {
   LIST: (query: string) => `${API_BASE}/roles?${query}`,
  CREATE: `${API_BASE}/roles`,
  DETAIL: (id: string | number) => `${API_BASE}/roles/${id}`,
  DELETE: (id: string | number) => `${API_BASE}/roles/${id}`,
}