import LayoutAdmin from "@/components/layout/Layout.admin";
import LayoutDefault from "@/components/layout/Layout.defautl";
import CampusBuildingRoomPage from "@/pages/admin/campus-buiding-room";
import DetailCampusBuilding from "@/pages/admin/campus-buiding-room/_components/detail.campus";
import Dashboard from "@/pages/admin/dashboard";
import DepartmentPage from "@/pages/admin/department";
import DepartmentDetailPage from "@/pages/admin/department/_components/detail";
import FacultyPage from "@/pages/admin/faculty";
import FaculltyDetailPage from "@/pages/admin/faculty/_components/detail";
import MajorManagerPage from "@/pages/admin/major";
import TrainingCoursePage from "@/pages/admin/training-course";
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
        // {
        //     path: "manage-user/roles",
        //     element: <RolesMangagerPage />,
        // },
        {
            path: "manage-curriculum/course",
            element: <TrainingCoursePage />,
        },
        {
            path: "manage-curriculum/department",
            element: <LayoutDefault />,
            children: [
                {
                    index: true,
                    element: <DepartmentPage />,
                },
                {
                    path: ":id",
                    element: <DepartmentDetailPage />,
                },
            ],
        },
        {
            path: "manage-curriculum/major",
            element: <MajorManagerPage />,
        },
        {
            path: "manage-curriculum/faculty",
            element: <LayoutDefault />,
            children: [
                {
                    index: true,
                    element: <FacultyPage />,
                },
                {
                    path: ":id",
                    element: <FaculltyDetailPage />,
                },
            ],
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
        {
            path: "manage-subject/class",
            element: <>class</>,
        },
        {
            path: "manage-subject/schedule",
            element: <>Lịch học</>,
        },
    ],
};
