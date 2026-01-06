import type { RouteObject } from "react-router-dom";
import { adminRoutes } from "../routers/admin.routes";
import { teacherRoutes } from "../routers/teacher.routes";
import { studentRoutes } from "../routers/student.routes";

export const getRoutesByRole = (roleName?: string | null): RouteObject => {
  const role = (roleName ?? "").toLowerCase();

  switch (role) {
    case "admin":
      return adminRoutes;
    case "teacher":
      return teacherRoutes;
    case "student":
      return studentRoutes;
    default:
      return studentRoutes;
  }
};
