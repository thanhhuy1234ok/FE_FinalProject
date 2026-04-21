import LayoutStudent from "@/components/layout/Layout.student";
import StudentCourseRegistrationPage from "@/pages/students/course-registration";
import StudentOverviewPage from "@/pages/students/dashboarh";
import PaymentPage from "@/pages/students/payment";
import PaymentDetailPage from "@/pages/students/payment/_components/history-payment/PaymentDetailPage";
import PaymentHistoryPage from "@/pages/students/payment/_components/history-payment/PaymentHistoryPage";
import StudentProfilePage from "@/pages/students/profile";
import StudentSchedulePage from "@/pages/students/schedule";
import type { RouteObject } from "react-router-dom";

export const studentRoutes: RouteObject = {
    path: "/",
    element: <LayoutStudent />,
    children: [
        { index: true, element: <StudentOverviewPage /> },
        { path: "profile", element: <StudentProfilePage /> },
        {
            path: "course-registration",
            element: <StudentCourseRegistrationPage />,
        },
        {
            path: "schedule",
            element: <StudentSchedulePage />,
        },
        {
            path: "payment",
            element: <PaymentPage />,
        },
        {
            path: "payment/history",
            element: <PaymentHistoryPage />,
        },
        {
            path: "payment/:id",
            element: <PaymentDetailPage />,
        },
    ],
};
