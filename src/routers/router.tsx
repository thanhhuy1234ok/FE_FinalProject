import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Dashboard from "../pages/dashboard/Dashboard";
import ProtectedRoute from "./guards/ProtectedRoute";
import { Role } from "../constants/role";

const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      {
        element: (
          <ProtectedRoute
            allowedRoles={[Role.ADMIN, Role.STUDENT, Role.USER]}
          />
        ),
        children: [{ index: true, element: <Dashboard /> }],
      },

      {
        element: <ProtectedRoute allowedRoles={[Role.ADMIN]} />,
        children: [{ path: "billing", element: <div>Billing</div> }],
      },

      {
        element: <ProtectedRoute allowedRoles={[Role.ADMIN, Role.STUDENT]} />,
        children: [{ path: "tables", element: <div>Tables</div> }],
      },
    ],
  },

  { path: "/sign-in", element: <div>Sign In</div> },
  { path: "/403", element: <div>403 - Forbidden</div> },
]);

export default router;
