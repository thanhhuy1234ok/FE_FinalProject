import {
    AUTH_API,
    CLASSES_API,
    MAJORS_API,
    ROLES_API,
    USER_API,
    YEARS_API,
} from "@/types/constans";
import createInstanceAxios from "./axios.customize";

const axios = createInstanceAxios(import.meta.env.VITE_BACKEND_URL);

export const LogoutAPI = () => {
    return axios.post<IBackendRes<IFetchAccount>>(AUTH_API.LOGOUT);
};

export const getAccountAPI = () => {
    return axios.get<IBackendRes<IFetchAccount>>(AUTH_API.ACCOUNT);
};

export const LoginAPI = (username: string, password: string) => {
    return axios.post<IBackendRes<ILogin>>(AUTH_API.LOGIN, {
        username,
        password,
    });
};

//** User API */
export const getUserAPI = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IUserTable>>>(
        USER_API.LIST(query),
    );
};

export const createUserAPI = (data: Record<string, unknown>) => {
    return axios.post<IBackendRes<IUserTable>>(USER_API.CREATE, { ...data });
};

export const getDetailUserAPI = (id: string) => {
    return axios.get<IBackendRes<IUserTable>>(USER_API.DETAIL(id));
};
export const deleteUserAPI = (id: number | string) => {
    return axios.delete<IBackendRes<null>>(USER_API.DELETE(id));
};

export const updateUserAPI = (
    id: number | string,
    data: Record<string, unknown>,
) => {
    return axios.put<IBackendRes<IUserTable>>(USER_API.UPDATE(id), { ...data });
};

export const callBulkCreateUser = (user: IExcelData[]) => {
    return axios.post<IBackendRes<IExcelData[]>>(
        "/api/v1/users/bulk-create",
        user,
    );
};

//** Role API */
export const getRolesAPI = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IRolesTable>>>(
        ROLES_API.LIST(query),
    );
};

//** Major API */
export const getMajorsAPI = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IMajorsTable>>>(
        MAJORS_API.LIST(query),
    );
};

export const createMajorAPI = (data: Record<string, unknown>) => {
    return axios.post<IBackendRes<IMajorsTable>>(MAJORS_API.CREATE, {
        ...data,
    });
};

//** Class API */
export const getClassesAPI = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IClassesTable>>>(
        CLASSES_API.LIST(query),
    );
};
//** Year of Admission API */
export const getYearsAPI = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IYearsTable>>>(
        YEARS_API.LIST(query),
    );
};
