import { Link } from "react-router-dom";
import { AppstoreOutlined } from "@ant-design/icons";
import type { MenuItem } from "@/helper/menu";

export const studentMenuItems: MenuItem[] = [
    {
        label: <Link to="/">Dashboard</Link>,
        key: "/",
        icon: <AppstoreOutlined />,
    },
    // Add more student specific menu items here
];
