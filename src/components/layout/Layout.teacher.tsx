import {
    BookOutlined,
    CalendarOutlined,
    HomeOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    ReadOutlined,
    TeamOutlined,
    UserOutlined,
} from "@ant-design/icons";
import {
    Avatar,
    Button,
    Dropdown,
    Layout,
    Menu,
    message,
    Space,
    Typography,
} from "antd";
import type { MenuProps } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCurrentApp } from "@/context/use.curent";
import { LogoutAPI } from "@/services/api";
import { socket } from "@/socket/socket";

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;

const LayoutTeacher = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const { user, setIsAuthenticated, setUser } = useCurrentApp();

    const handleLogout = async () => {
        try {
            await LogoutAPI();
            socket.disconnect();
            message.success("Đăng xuất thành công");
        } catch (error) {
            message.warning("Phiên đăng nhập đã được xoá khỏi máy hiện tại");
        } finally {
            setIsAuthenticated(false);
            setUser(null);
            localStorage.removeItem("access_token");
            navigate("/");
        }
    };
    const menuItems: MenuProps["items"] = [
        {
            key: "/",
            icon: <HomeOutlined />,
            label: "Tổng quan",
        },
        {
            key: "/courses-time",
            icon: <BookOutlined />,
            label: "Lịch giảng dạy",
        },
        {
            key: "/time-table",
            icon: <CalendarOutlined />,
            label: "Thời khóa biểu",
        },
        {
            key: "/courses-class",
            icon: <TeamOutlined />,
            label: "Lớp giảng dạy",
        },
        {
            key: "/profile",
            icon: <UserOutlined />,
            label: "Hồ sơ cá nhân",
        },
    ];

    const dropdownItems: MenuProps["items"] = [
        {
            key: "profile",
            icon: <UserOutlined />,
            label: "Thông tin cá nhân",
            onClick: () => navigate("/teacher/profile"),
        },
        {
            type: "divider",
        },
        {
            key: "logout",
            icon: <LogoutOutlined />,
            label: "Đăng xuất",
            danger: true,
            onClick: handleLogout,
        },
    ];

    const selectedKey =
        menuItems.find((item: any) => location.pathname === item.key)?.key ||
        menuItems.find(
            (item: any) =>
                location.pathname.startsWith(item.key) && item.key !== "/",
        )?.key ||
        "/";

    return (
        <Layout style={{ minHeight: "100vh", background: "#f5f7fb" }}>
            <Sider
                width={260}
                collapsed={collapsed}
                theme="light"
                style={{
                    borderRight: "1px solid #edf0f5",
                    boxShadow: "6px 0 20px rgba(15, 23, 42, 0.04)",
                }}
            >
                <div
                    style={{
                        height: 72,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: collapsed ? "center" : "flex-start",
                        padding: collapsed ? 0 : "0 20px",
                        borderBottom: "1px solid #f0f2f5",
                    }}
                >
                    <div
                        style={{
                            width: 42,
                            height: 42,
                            borderRadius: 14,
                            background:
                                "linear-gradient(135deg, #1677ff, #52c41a)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontWeight: 800,
                            fontSize: 18,
                        }}
                    >
                        T
                    </div>

                    {!collapsed && (
                        <div style={{ marginLeft: 12 }}>
                            <Title level={5} style={{ margin: 0 }}>
                                Teacher LMS
                            </Title>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                Quản lý giảng dạy
                            </Text>
                        </div>
                    )}
                </div>

                <Menu
                    mode="inline"
                    selectedKeys={[selectedKey as string]}
                    items={menuItems}
                    onClick={({ key }) => navigate(key)}
                    style={{
                        borderRight: 0,
                        padding: "12px 8px",
                        fontWeight: 500,
                    }}
                />
            </Sider>

            <Layout>
                <Header
                    style={{
                        height: 72,
                        background: "#fff",
                        padding: "0 24px",
                        borderBottom: "1px solid #edf0f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <Space>
                        <Button
                            type="text"
                            icon={
                                collapsed ? (
                                    <MenuUnfoldOutlined />
                                ) : (
                                    <MenuFoldOutlined />
                                )
                            }
                            onClick={() => setCollapsed(!collapsed)}
                        />
                    </Space>

                    <Dropdown
                        menu={{ items: dropdownItems }}
                        trigger={["click"]}
                        placement="bottomRight"
                    >
                        <Space style={{ cursor: "pointer" }}>
                            <Avatar
                                size={40}
                                icon={
                                    user?.avatar ? (
                                        <img src={user.avatar} alt="Avatar" />
                                    ) : (
                                        <UserOutlined />
                                    )
                                }
                            />
                            <div style={{ lineHeight: 1.2 }}>
                                <Text strong>{user?.name}</Text>
                                <br />
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    {user?.email}
                                </Text>
                            </div>
                        </Space>
                    </Dropdown>
                </Header>

                <Content
                    style={{
                        padding: 24,
                        background: "#f5f7fb",
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default LayoutTeacher;
