import LayoutAdmin from "@/components/layout/Layout.admin";
import LayoutDefault from "@/components/layout/Layout.defautl";
import AdminClass from "@/pages/admin/admin-class";
import AdminClassDetail from "@/pages/admin/admin-class/_components/AdminClassDetail";
import CampusBuildingRoomPage from "@/pages/admin/campus-buiding-room";
import DetailCampusBuilding from "@/pages/admin/campus-buiding-room/_components/detail.campus";
import CoureOfferingPage from "@/pages/admin/coure-offering";
import CourseOfferingDetailPage from "@/pages/admin/coure-offering/_components/detail";
import Dashboard from "@/pages/admin/dashboard";
import DepartmentPage from "@/pages/admin/department";
import DepartmentDetailPage from "@/pages/admin/department/_components/detail";
import FacultyPage from "@/pages/admin/faculty";
import FaculltyDetailPage from "@/pages/admin/faculty/_components/detail";
import PaymentManagementPage from "@/pages/admin/finance";
import MajorManagerPage from "@/pages/admin/major";
import MajorDetailPage from "@/pages/admin/major/_components/detail";
import RoomPage from "@/pages/admin/room";
import SchedulePage from "@/pages/admin/schedule";
import SubjectPage from "@/pages/admin/subjects";
import TermPage from "@/pages/admin/term";
import TrainingCoursePage from "@/pages/admin/training-course";
import UserManagerPage from "@/pages/admin/users";
import UserDetailPageDemo from "@/pages/admin/users/_components/detaildemo";

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
            element: <UserDetailPageDemo />,
            // element: <UserDetailPage />,
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
            element: <LayoutDefault />,
            children: [
                {
                    index: true,
                    element: <MajorManagerPage />,
                },
                {
                    path: ":id",
                    element: <MajorDetailPage />,
                },
            ],
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
            path: "manage-curriculum/subject",
            element: <SubjectPage />,
        },
        {
            path: "manage-campus-room/classrooms",
            element: <RoomPage />,
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
            element: <LayoutDefault />,
            children: [
                {
                    index: true,
                    element: <AdminClass />,
                },
                {
                    path: ":id",
                    element: <AdminClassDetail />,
                },
            ],
        },
        {
            path: "manage-subject/schedule",
            element: <SchedulePage />,
        },
        {
            path: "manage-subject/term",
            element: <TermPage />,
        },
        {
            path: "manage-subject/course-offering",
            element: <LayoutDefault />,
            children: [
                {
                    index: true,
                    element: (
                        <>
                            <CoureOfferingPage />
                        </>
                    ),
                },
                {
                    path: ":id",
                    element: <CourseOfferingDetailPage />,
                },
            ],
        },
        {
            path: "/manage-finance",
            element: <LayoutDefault />,
            children: [
                {
                    index: true,
                    element: <PaymentManagementPage />,
                },
            ],
        },
    ],
};
