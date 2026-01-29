import { Navigate } from "react-router-dom";
import { useCurrentApp } from "@/context/use.curent";

import LayoutAdmin from "./Layout.admin";
import LayoutStudent from "./Layout.student";
import LayoutTeacher from "./Layout.teacher";

const LayoutSelector = () => {
  const { role, isAuthenticated, isAppLoading } = useCurrentApp();

  if (isAppLoading) return null;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (role === "ADMIN") return <LayoutAdmin />;
  if (role === "STUDENT") return <LayoutStudent />;

  return <LayoutTeacher />;

};

export default LayoutSelector;
