import React, { useMemo, useState } from "react";
import { Layout, Menu, Drawer, message, Grid } from "antd";
import { HeartTwoTone } from "@ant-design/icons";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import "@/styles/layout.admin.scss";
import avatarFallback from "@/assets/avatar/avatar.jpg";
import { LogoutAPI } from "@/services/api";
import { useCurrentApp } from "@/context/use.curent";
import { adminMenuItems } from "../menu/menu.admin";
import AdminHeader from "../header/header.admin";
import { findActiveKey } from "@/helper/findActiveKey";

const { Content, Footer, Sider } = Layout;
const { useBreakpoint } = Grid;

const LayoutAdmin: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [openDrawer, setOpenDrawer] = useState(false);

    const screens = useBreakpoint();
    const isMobile = !screens.lg; // < 992px coi là mobile/tablet

    const { user, setUser, setIsAuthenticated, isAuthenticated } =
        useCurrentApp();

    const navigate = useNavigate();
    const { pathname } = useLocation();

    const activeMenu = useMemo(() => {
        return findActiveKey(adminMenuItems, pathname) || "/";
    }, [pathname]);

    const handleLogout = async () => {
        try {
            const res = await LogoutAPI();
            if (res && res.data) {
                message.success("Đăng xuất thành công");
                setIsAuthenticated(false);
                setUser(null);
                localStorage.removeItem("access_token");
                navigate("/");
            }
        } catch (error) {
            message.error("Đăng xuất thất bại");
        }
    };

    const handleProfile = () => {
        navigate("/admin/profile");
        if (isMobile) setOpenDrawer(false);
    };

    const avatarUrl = user?.avatar
        ? `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${user.avatar}`
        : avatarFallback;

    if (isAuthenticated === false) return <Outlet />;

    const renderMenu = (
        <Menu
            selectedKeys={[activeMenu]}
            mode="inline"
            items={adminMenuItems}
            onClick={() => {
                if (isMobile) setOpenDrawer(false);
            }}
        />
    );

    return (
        <Layout style={{ minHeight: "100vh" }} className="layout-admin">
            {/* Desktop sider */}
            {!isMobile && (
                <Sider
                    theme="light"
                    className="admin-sider"
                    collapsible
                    collapsed={collapsed}
                    onCollapse={(value) => setCollapsed(value)}
                    width={280}
                    breakpoint="lg"
                    collapsedWidth={84}
                >
                    <div className="admin-brand">
                        {collapsed ? "A" : "Admin"}
                    </div>
                    {renderMenu}
                </Sider>
            )}

            {/* Mobile drawer menu */}
            {isMobile && (
                <Drawer
                    title="Admin Menu"
                    placement="left"
                    open={openDrawer}
                    onClose={() => setOpenDrawer(false)}
                    bodyStyle={{ padding: 0 }}
                    width={260}
                >
                    {/* <div className="admin-brand mobile">Admin</div> */}
                    {renderMenu}
                </Drawer>
            )}

            <Layout className="admin-main">
                <AdminHeader
                    collapsed={collapsed}
                    onToggleCollapsed={() => {
                        if (isMobile) {
                            setOpenDrawer(true);
                        } else {
                            setCollapsed((prev) => !prev);
                        }
                    }}
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
                    © {new Date().getFullYear()} University Management System –
                    Developed by School university with{" "}
                    <HeartTwoTone twoToneColor="#eb2f96" />
                </Footer>
            </Layout>
        </Layout>
    );
};

export default LayoutAdmin;
