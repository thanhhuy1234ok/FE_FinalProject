import {
  DashboardOutlined,
  TableOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";

import { Role } from "../constants/role";

export const MENU_ITEMS = [
  {
    key: "/",
    label: "Dashboard",
    icon: <DashboardOutlined />,
    roles: [Role.ADMIN, Role.STUDENT, Role.USER],
  },
  {
    key: "/tables",
    label: "Tables",
    icon: <TableOutlined />,
    roles: [Role.ADMIN, Role.STUDENT],
  },
  {
    key: "/billing",
    label: "Billing",
    icon: <CreditCardOutlined />,
    roles: [Role.ADMIN],
  },
];
