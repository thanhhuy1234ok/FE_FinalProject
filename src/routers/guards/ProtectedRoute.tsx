import { Navigate, Outlet } from "react-router-dom";
import { Role } from "@/constants/role";
import { useCurrentApp } from "@/context/use.curent";

interface ProtectedRouteProps {
  allowedRoles: Role[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, role } = useCurrentApp();

  // Chưa login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Login rồi nhưng không có quyền
  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
