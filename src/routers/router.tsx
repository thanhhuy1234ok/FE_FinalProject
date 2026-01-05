import LoginPage from "@/pages/auth/login";
import { createBrowserRouter } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/*",
    element: "<div>heloo</div>",
  },
  {
    path: "login",
    element: <LoginPage />,
  },
]);

export default router;
