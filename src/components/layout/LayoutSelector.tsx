import { useCurrentApp } from "@/context/use.curent";
import { getRoutesByRole } from "@/helper/route.helpers";
import NotFound from "@/pages/not-found/403";
import { Navigate, useRoutes, type RouteObject } from "react-router-dom";

const LayoutSelector = () => {
    const { isAuthenticated, isAppLoading, user } = useCurrentApp();

    const roleName = user?.role?.name;

    const routes: RouteObject[] = isAppLoading
        ? [{ path: "*", element: null }]
        : !isAuthenticated
          ? [{ path: "*", element: <Navigate to="/login" replace /> }]
          : !roleName
            ? [{ path: "*", element: null }]
            : [getRoutesByRole(roleName), { path: "*", element: <NotFound /> }];

    return useRoutes(routes);
};

export default LayoutSelector;
