import React, { useMemo, useState } from "react";
import { Layout, Menu } from "antd";
import { HeartTwoTone } from "@ant-design/icons";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import '@/styles/layout.admin.scss'
import avatarFallback from "@/assets/avatar/avatar.jpg";
import { LogoutAPI } from "@/services/api";
import { useCurrentApp } from "@/context/use.curent";
import { adminMenuItems } from "../menu/menu.admin";
import AdminHeader from "../header/header.admin";
import { findActiveKey } from "@/helper/findActiveKey";


const { Content, Footer, Sider } = Layout;

const LayoutAdmin: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);

    const { user, setUser, setIsAuthenticated, isAuthenticated } = useCurrentApp();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const activeMenu = useMemo(() => {
        return findActiveKey(adminMenuItems, pathname) || "/";
    }, [pathname]);

    const handleLogout = async () => {
        const res = await LogoutAPI();
        if (res?.data) {
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem("access_token");
            navigate("/login");
        }
    };

    const handleProfile = () => {
        navigate("/admin/profile");
    };

    const avatarUrl = user?.avatar
        ? `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${user.avatar}`
        : avatarFallback;

    if (isAuthenticated === false) return <Outlet />;

    return (
        <Layout style={{ minHeight: "100vh" }} className={`layout-admin`}>
            <Sider
                theme="light"
                className="admin-sider"
                collapsible
                collapsed={collapsed}
                onCollapse={(value) => setCollapsed(value)}
                width={300}
            >
                <div className="admin-brand">Admin</div>
                <Menu selectedKeys={[activeMenu]} mode="inline" items={adminMenuItems} />

            </Sider>

            <Layout className="admin-main">
                <AdminHeader
                    collapsed={collapsed}
                    onToggleCollapsed={() => setCollapsed((prev) => !prev)}
                    avatarUrl={avatarUrl}
                    email={user?.email}
                    onProfile={handleProfile}
                    onLogout={handleLogout}
                />

                <Content className="admin-content">
                    <div className="admin-page-card">
                        <Outlet />
                    </div>
                </Content>

                <Footer className="admin-footer">
                    © {new Date().getFullYear()} University Management System – Developed by School university with{" "}
                    <HeartTwoTone twoToneColor="#eb2f96" />
                </Footer>
            </Layout>
        </Layout>
    );

};

export default LayoutAdmin;
