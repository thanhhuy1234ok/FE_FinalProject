import LayoutStudent from "@/components/layout/Layout.student";
import type { RouteObject } from "react-router-dom";

export const studentRoutes: RouteObject = {
    path: "/",
    element: <LayoutStudent />,
    children: [
        { index: true, element: <> student</> }
    ]
}