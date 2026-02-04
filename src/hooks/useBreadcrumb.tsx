import { useLocation } from "react-router-dom";
import { BREADCRUMB_MAP } from "../configs/breadcrumb.config";

export const useBreadcrumb = () => {
  const { pathname } = useLocation();

  const label = BREADCRUMB_MAP[pathname] || "";

  return {
    breadcrumb: ["Pages", label],
    title: label,
  };
};
