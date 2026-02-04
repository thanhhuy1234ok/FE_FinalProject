import { createContext } from "react";
import { Role } from "@/constants/role";

export interface IAppContext {
  isAuthenticated: boolean;
  setIsAuthenticated: (v: boolean) => void;
  setUser: (v: IUser | null) => void;
  user: IUser | null;
  role: Role | null;
  isAppLoading: boolean;
  setIsAppLoading: (v: boolean) => void;
}

export const CurrentAppContext = createContext<IAppContext | null>(null);
