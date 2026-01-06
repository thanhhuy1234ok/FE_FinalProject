import LayoutSelector from "@/components/layout/LayoutSelector";
import LoginPage from "@/pages/auth/login";
import { createBrowserRouter } from "react-router-dom";

const router = createBrowserRouter([
  // 🌐 Public route
  {
    path: "/login",
    element: <LoginPage />,
  },

  // 🔐 Protected routes (theo role)
  {
    path: "/*",
    element: <LayoutSelector />,
  },
]);

export default router;
