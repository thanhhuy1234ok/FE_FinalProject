import { AUTH_API, ROLES_API, USER_API } from "@/types/constans";
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

export const getUserAPI = (query :string) =>{
  return axios.get<IBackendRes<IModelPaginate<IUserTable>>>(USER_API.LIST(query))
}

export const createUserAPI = (data: Record<string, unknown>) =>{
  return axios.post<IBackendRes<IUserTable>>(USER_API.CREATE,{...data})
}

export const getDetailUserAPI = (id : string) =>{
  return axios.get<IBackendRes<IUserTable>>(USER_API.DETAIL(id))
}

export const getRolesAPI = (query : string) =>{
  return axios.get<IBackendRes<IModelPaginate<IRolesTable>>>(ROLES_API.LIST(query))
}