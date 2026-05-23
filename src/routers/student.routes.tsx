import LayoutDefault from "@/components/layout/Layout.defautl";
import LayoutStudent from "@/components/layout/Layout.student";
import StudentCourseRegistrationPage from "@/pages/students/course-registration";
import StudentOverviewPage from "@/pages/students/dashboarh";
import StudyResultPage from "@/pages/students/grade";
import MyClassesPage from "@/pages/students/my-class-coures";
import MyClassDetailPage from "@/pages/students/my-class-coures/_components/MyClassDetailPage";
import PaymentPage from "@/pages/students/payment";
import PaymentDetailPage from "@/pages/students/payment/_components/history-payment/PaymentDetailPage";
import PaymentHistoryPage from "@/pages/students/payment/_components/history-payment/PaymentHistoryPage";
import ReturnURLPage from "@/pages/students/payment/_components/return-url";
import StudentProfilePage from "@/pages/students/profile";
import StudentSchedulePage from "@/pages/students/schedule";
import TimeTablePage from "@/pages/students/time-table";
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
        {
            path: "vn-pay/return-url",
            element: <ReturnURLPage />,
        },
        {
            path: "timetable",
            element: <TimeTablePage />,
        },

        {
            path: "my-classes",
            element: <LayoutDefault />,
            children: [
                {
                    index: true,
                    element: <MyClassesPage />,
                },
                {
                    path: ":courseId",
                    element: <MyClassDetailPage />,
                },
            ],
        },
        {
            path: "grades",
            element: <StudyResultPage />,
        },
    ],
};
