import React from "react";
import { Avatar, Dropdown, Space } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";

type Props = {
    collapsed: boolean;
    onToggleCollapsed: () => void;
    avatarUrl: string;
    email?: string;
    onProfile: () => void;
    onLogout: () => void;
};

const StudentHeader: React.FC<Props> = ({
    collapsed,
    onToggleCollapsed,
    avatarUrl,
    email,
    onProfile,
    onLogout,
}) => {
    const itemsDropdown: MenuProps["items"] = [
        {
            label: (
                <span style={{ cursor: "pointer" }} onClick={onProfile}>
                    Quản lý tài khoản
                </span>
            ),
            key: "account",
        },
        {
            label: (
                <span style={{ cursor: "pointer" }} onClick={onLogout}>
                    Đăng xuất
                </span>
            ),
            key: "logout",
        },
    ];

    return (
        <div
            className="student-header"
            style={{
                height: "50px",
                borderBottom: "1px solid #ebebeb",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 15px",
            }}
        >
            <span>
                {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                    className: "trigger",
                    onClick: onToggleCollapsed,
                })}
            </span>

            <Dropdown menu={{ items: itemsDropdown }} trigger={["click"]}>
                <Space style={{ cursor: "pointer" }}>
                    <Avatar src={avatarUrl} />
                    {email}
                </Space>
            </Dropdown>
        </div>
    );
};

export default StudentHeader;
