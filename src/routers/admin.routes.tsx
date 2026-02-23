import LayoutAdmin from "@/components/layout/Layout.admin";
import LayoutDefault from "@/components/layout/Layout.defautl";
import CampusBuildingRoomPage from "@/pages/admin/campus-buiding-room";
import DetailCampusBuilding from "@/pages/admin/campus-buiding-room/_components/detail.campus";
import Dashboard from "@/pages/admin/dashboard";
import MajorManagerPage from "@/pages/admin/major";
import RolesMangagerPage from "@/pages/admin/roles";
import UserManagerPage from "@/pages/admin/users";
import UserDetailPage from "@/pages/admin/users/_components/user-detail-v1";
import type { RouteObject } from "react-router-dom";

export const adminRoutes: RouteObject = {
    path: "/",
    element: <LayoutAdmin />,
    children: [
        { index: true, element: <Dashboard /> },
        {
            path: "manage-user/users",
            element: <UserManagerPage />,
        },
        {
            path: "manage-user/users/:id",
            element: <UserDetailPage />,
        },
        {
            path: "manage-user/roles",
            element: <RolesMangagerPage />,
        },
        {
            path: "manage-curriculum/course",
            element: <MajorManagerPage />,
        },
        {
            path: "manage-curriculum/major",
            element: <> major</>,
        },
        {
            path: "manage-campus-room/campus",
            element: <LayoutDefault />,
            children: [
                {
                    index: true,
                    element: <CampusBuildingRoomPage />,
                },
                {
                    path: ":id/buildings",
                    element: <DetailCampusBuilding />,
                },
            ],
        },
    ],
};
