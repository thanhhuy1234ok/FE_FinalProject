import React from "react";
import { Avatar, Dropdown, Space, Typography, Grid } from "antd";
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    LogoutOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import "@/styles/header.admin.scss";
const { Text } = Typography;
const { useBreakpoint } = Grid;

type Props = {
    collapsed: boolean;
    onToggleCollapsed: () => void;
    avatarUrl: string;
    email?: string;
    onProfile: () => void;
    onLogout: () => void;
};

const AdminHeader: React.FC<Props> = ({
    collapsed,
    onToggleCollapsed,
    avatarUrl,
    email,
    onProfile,
    onLogout,
}) => {
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const itemsDropdown: MenuProps["items"] = [
        {
            key: "account",
            icon: <UserOutlined />,
            label: "Quản lý tài khoản",
        },
        {
            key: "logout",
            icon: <LogoutOutlined />,
            label: "Đăng xuất",
        },
    ];

    const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
        if (key === "account") {
            onProfile();
            return;
        }

        if (key === "logout") {
            onLogout();
        }
    };

    return (
        <header className="admin-header">
            <button
                type="button"
                className="admin-header__trigger"
                onClick={onToggleCollapsed}
                aria-label="Toggle menu"
            >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </button>

            <div className="admin-header__right">
                <Dropdown
                    menu={{
                        items: itemsDropdown,
                        onClick: handleMenuClick,
                    }}
                    trigger={["click"]}
                    placement="bottomRight"
                >
                    <div
                        className="admin-header__account"
                        role="button"
                        tabIndex={0}
                    >
                        <Space size={10}>
                            <Avatar src={avatarUrl} />
                            {!isMobile && (
                                <Text
                                    className="admin-header__email"
                                    ellipsis={{ tooltip: email }}
                                >
                                    {email || "Tài khoản"}
                                </Text>
                            )}
                        </Space>
                    </div>
                </Dropdown>
            </div>
        </header>
    );
};

export default AdminHeader;
