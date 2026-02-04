import { useEffect, useState } from "react";
import { CurrentAppContext } from "./app.context";
import { PacmanLoader } from "react-spinners";
import { getAccountAPI } from "@/services/api";
import type { Role } from "@/constants/role";

type TProps = {
  children: React.ReactNode;
};

export const AppProvider = (props: TProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<IUser | null>(null);
  const [isAppLoading, setIsAppLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const res = await getAccountAPI();

        console.log(res);

        if (res?.data?.user) {
          setUser(res.data.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsAppLoading(false);
      }
    };

    fetchAccount();
  }, []);

  const role = user?.role?.name ? (user.role.name as Role) : null;
  return (
    <>
      {isAppLoading === false ? (
        <CurrentAppContext.Provider
          value={{
            isAuthenticated,
            user,
            role,
            setIsAuthenticated,
            setUser,
            isAppLoading,
            setIsAppLoading,
          }}
        >
          {props.children}
        </CurrentAppContext.Provider>
      ) : (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <PacmanLoader size={30} color="#36d6b4" />
        </div>
      )}
    </>
  );
};
