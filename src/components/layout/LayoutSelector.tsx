import { useCurrentApp } from "@/context/use.curent";
import NotFound from "@/pages/not-found/403";
import { getRoutesByRole } from "@/helper/route.helpers";
import { Navigate, useRoutes, type RouteObject } from "react-router-dom";


const LayoutSelector = () => {
    const { isAuthenticated, isAppLoading } = useCurrentApp();
    console.log({ isAppLoading, isAuthenticated });

    // const roleTree = getRoutesByRole(user?.role?.name);
    const roleTree = getRoutesByRole('admin');

    // ✅ Không return trước useRoutes (tránh lỗi Rules of Hooks)
    const routes: RouteObject[] = [
        ...(isAppLoading
            ? [
                {
                    path: "*",
                    element: null, // AppProvider đã có loader
                },
            ]
            : []),

        ...(!isAppLoading && !isAuthenticated
            ? [
                {
                    path: "*",
                    element: <Navigate to="/login" replace />,
                },
            ]
            : [
                roleTree,
                { path: "*", element: <NotFound /> },
            ]),
    ];

    return useRoutes(routes);
};

export default LayoutSelector;
