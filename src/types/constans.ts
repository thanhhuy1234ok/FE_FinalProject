export const API_BASE = "/api/v1";

export const ROLE_MAP: Record<string, { label: string; color: string }> = {
    ADMIN: { label: "Quản trị viên", color: "red" },
    TEACHER: { label: "Giáo viên", color: "gold" },
    STUDENT: { label: "Học sinh", color: "blue" },
    UNKNOWN: { label: "Không xác định", color: "default" },
};

export const AUTH_API = {
    LOGIN: `${API_BASE}/auth/login`,
    LOGOUT: `${API_BASE}/auth/logout`,
    ACCOUNT: `${API_BASE}/auth/account`,
    REFRESH: `${API_BASE}/auth/refresh`,
};

export const USER_API = {
    LIST: (query: string) => `${API_BASE}/users?${query}`,
    CREATE: `${API_BASE}/users`,
    DETAIL: (id: string | number) => `${API_BASE}/users/${id}`,
    UPDATE: (id: string | number) => `${API_BASE}/users/${id}`,
    DELETE: (id: string | number) => `${API_BASE}/users/${id}`,
};

export const ROLES_API = {
    LIST: (query: string) => `${API_BASE}/roles?${query}`,
    CREATE: `${API_BASE}/roles`,
    DETAIL: (id: string | number) => `${API_BASE}/roles/${id}`,
    DELETE: (id: string | number) => `${API_BASE}/roles/${id}`,
};

export const MAJORS_API = {
    LIST: (query: string) => `${API_BASE}/majors?${query}`,
    CREATE: `${API_BASE}/majors`,
    DETAIL: (id: string | number) => `${API_BASE}/majors/${id}`,
    DELETE: (id: string | number) => `${API_BASE}/majors/${id}`,
};

export const CLASSES_API = {
    LIST: (query: string) => `${API_BASE}/admin-class?${query}`,
    CREATE: `${API_BASE}/admin-class`,
    DETAIL: (id: string | number) => `${API_BASE}/admin-class/${id}`,
    DELETE: (id: string | number) => `${API_BASE}/admin-class/${id}`,
};

export const YEARS_API = {
    LIST: (query: string) => `${API_BASE}/year-of-admission?${query}`,
    CREATE: `${API_BASE}/year-of-admission`,
    DETAIL: (id: string | number) => `${API_BASE}/year-of-admission/${id}`,
    DELETE: (id: string | number) => `${API_BASE}/year-of-admission/${id}`,
};
