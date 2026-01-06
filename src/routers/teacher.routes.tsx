import LayoutTeacher from "@/components/layout/Layout.teacher";
import type { RouteObject } from "react-router-dom";

export const teacherRoutes: RouteObject = {
    path: "/",
    element: <LayoutTeacher />,
    children: [
        { index: true, element: <>teacher</> }
    ]
}