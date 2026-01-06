import LayoutAdmin from "@/components/layout/Layout.admin";
import Dashboard from "@/pages/admin/Dashboard";
import type { RouteObject } from "react-router-dom";

export const adminRoutes: RouteObject = {
    path: "/",
    element: <LayoutAdmin />,
    children: [
        { index: true, element: <Dashboard /> },
        {
            path: 'manage-user/users',
            element: <>user</>
        },
        {
            path: 'manage-user/roles',
            element: <>roles</>
        },
        {
            path: 'manage-curriculum/course',
            element: <>roles</>
        },
    ]
}