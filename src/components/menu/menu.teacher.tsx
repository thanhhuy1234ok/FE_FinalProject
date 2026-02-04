import { Link } from "react-router-dom";
import { AppstoreOutlined } from "@ant-design/icons";
import type { MenuItem } from "@/helper/menu";

export const teacherMenuItems: MenuItem[] = [
    {
        label: <Link to="/">Dashboard</Link>,
        key: "/",
        icon: <AppstoreOutlined />,
    },
    // Add more teacher specific menu items here
];
