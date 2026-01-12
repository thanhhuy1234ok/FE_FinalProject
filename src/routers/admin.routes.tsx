import LayoutAdmin from "@/components/layout/Layout.admin";
import Dashboard from "@/pages/admin/dashboard";
import RolesMangagerPage from "@/pages/admin/roles";
import UserManagerPage from "@/pages/admin/users";
import type { RouteObject } from "react-router-dom";

export const adminRoutes: RouteObject = {
    path: "/",
    element: <LayoutAdmin />,
    children: [
        { index: true, element: <Dashboard /> },
        {
            path: 'manage-user/users',
            element: <UserManagerPage />
        },
        {
            path: 'manage-user/roles',
            element: <RolesMangagerPage />
        },
        {
            path: 'manage-curriculum/course',
            element: <>roles</>
        },
    ]
}