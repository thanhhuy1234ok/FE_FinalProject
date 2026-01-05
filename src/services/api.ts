import { AUTH_API } from "@/types/constans";
import createInstanceAxios from "./axios.customize";

const axios = createInstanceAxios(import.meta.env.VITE_BACKEND_URL);

export const LogoutAPI = () => {
  return axios.post<IBackendRes<IFetchAccount>>(AUTH_API.LOGOUT);
};

export const AcountAPI = () => {
  return axios.get<IBackendRes<IFetchAccount>>(AUTH_API.ACCOUNT);
};

export const LoginAPI = (username: string, password: string) => {
  return axios.post<IBackendRes<ILogin>>(AUTH_API.LOGIN, {
    username,
    password,
  });
};
