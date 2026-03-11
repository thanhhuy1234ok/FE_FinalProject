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

export const CAPUS_BUILDING_ROOM_API = {
    LIST_ROOM: (query: string) => `${API_BASE}/rooms?${query}`,
    CREATE_ROOM: `${API_BASE}/rooms`,
    PREVIEW_CODE_ROOM: (id: string | number, query: string) =>
        `${API_BASE}/rooms/${id}/preview-code?${query}`,

    LIST_CAMPUS: (query: string) => `${API_BASE}/campus?${query}`,
    CREATE_CAMPUS: `${API_BASE}/campus`,
    DETAIL_CAMPUS: (id: string | number) => `${API_BASE}/campus/${id}`,
    DELETE_CAMPUS: (id: string | number) => `${API_BASE}/campus/${id}`,

    CREATE_BUILDING: (CampusId: string | number) =>
        `${API_BASE}/campus/${CampusId}/buildings`,
};

export const TERMS_API = {
    LIST: (query: string) => `${API_BASE}/terms?${query}`,
    CREATE: `${API_BASE}/terms`,
    DETAIL: (id: string | number) => `${API_BASE}/terms/${id}`,
    DELETE: (id: string | number) => `${API_BASE}/terms/${id}`,
};

export const Curriculum_API = {
    LIST: (query: string) => `${API_BASE}/curriculum?${query}`,
    CREATE: `${API_BASE}/curriculum`,
    DETAIL: (id: string | number) => `${API_BASE}/curriculums/${id}`,
    DELETE: (id: string | number) => `${API_BASE}/curriculums/${id}`,
    Preview: `${API_BASE}/curriculum/preview-name-code`,
};

export const CURRICULUM_SUBJECT_API = {
    CREATE_BULK: `${API_BASE}/curriculum-subjects/bulk`,
    CREATE_BULK_NAME: `${API_BASE}/curriculum-subjects/bulkName`,
    LIST: (query: string) => `${API_BASE}/curriculum-subjects?${query}`,
};

export const SUBJECT_API = {
    LIST: (query: string) => `${API_BASE}/subjects?${query}`,
};

export const DEPARTMENT_API = {
    LIST: (query: string) => `${API_BASE}/departments?${query}`,
    CREATE: `${API_BASE}/departments`,
    DETAIL: (id: number) => `${API_BASE}/departments/${id}`,
    DELETE: (id: string | number) => `${API_BASE}/departments/${id}`,
};

export const FACULTY_API = {
    LIST: (query: string) => `${API_BASE}/faculty?${query}`,
    CREATE: `${API_BASE}/faculty`,
    DETAIL: (id: number) => `${API_BASE}/faculty/${id}`,
    DELETE: (id: string | number) => `${API_BASE}/faculty/${id}`,
};
