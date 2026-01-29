import { createBrowserRouter } from "react-router-dom";
import LoginPage from "@/pages/auth/login";
import LayoutSelector from "@/components/layout/LayoutSelector";

const router = createBrowserRouter([
   { path: "/login", element: <LoginPage /> },
 {
    path: "/",
    element: <LayoutSelector />,
  },

  { path: "*", element: <div>404 - Not found</div> },

]);

export default router;
