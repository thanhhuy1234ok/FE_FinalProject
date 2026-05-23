import LayoutDefault from "@/components/layout/Layout.defautl";
import LayoutTeacher from "@/components/layout/Layout.teacher";
import CourseClassPage from "@/pages/teacher/course-class";
import CourseClassDetailPage from "@/pages/teacher/course-class/_components/CourseClassDetailPage";
import CoursesTimePage from "@/pages/teacher/courses-time";
import TeacherLessonDetailPage from "@/pages/teacher/courses-time/_components/TeacherLessonDetailPage";

import TeacherDashboardPage from "@/pages/teacher/dashboard";
import TeacherProfilePage from "@/pages/teacher/profile";
import TablePage from "@/pages/teacher/time-table";
import type { RouteObject } from "react-router-dom";

export const teacherRoutes: RouteObject = {
    path: "/",
    element: <LayoutTeacher />,
    children: [
        { index: true, element: <TeacherDashboardPage /> },
        {
            path: "courses-time",
            element: <LayoutDefault />,
            children: [
                { index: true, element: <CoursesTimePage /> },
                {
                    path: ":lessonId",
                    element: <TeacherLessonDetailPage />,
                },
            ],
        },
        {
            path: "time-table",
            element: <TablePage />,
        },
        {
            path: "courses-class",
            element: <LayoutDefault />,
            children: [
                {
                    index: true,
                    element: <CourseClassPage />,
                },
                {
                    path: ":courseId",
                    element: <CourseClassDetailPage />,
                },
            ],
        },
        {
            path: "profile",
            element: <TeacherProfilePage />,
        },
    ],
};
