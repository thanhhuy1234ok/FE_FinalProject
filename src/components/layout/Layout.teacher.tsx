import React, { useMemo, useState } from "react";
import { Layout, Menu } from "antd";
import { HeartTwoTone } from "@ant-design/icons";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import '@/styles/layout.teacher.scss'
import avatarFallback from "@/assets/avatar/avatar.jpg";
import { LogoutAPI } from "@/services/api";
import { useCurrentApp } from "@/context/use.curent";
import { teacherMenuItems } from "../menu/menu.teacher";
import TeacherHeader from "../header/header.teacher";
import { findActiveKey } from "@/helper/findActiveKey";


const { Content, Footer, Sider } = Layout;

const LayoutTeacher: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);

    const { user, setUser, setIsAuthenticated, isAuthenticated } = useCurrentApp();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const activeMenu = useMemo(() => {
        return findActiveKey(teacherMenuItems, pathname) || "/";
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
        navigate("/teacher/profile");
    };

    const avatarUrl = user?.avatar
        ? `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${user.avatar}`
        : avatarFallback;

    if (isAuthenticated === false) return <Outlet />;

    return (
        <Layout style={{ minHeight: "100vh" }} className={`layout-teacher`}>
            <Sider
                theme="light"
                className="teacher-sider"
                collapsible
                collapsed={collapsed}
                onCollapse={(value) => setCollapsed(value)}
                width={300}
            >
                <div className="teacher-brand">Teacher</div>
                <Menu selectedKeys={[activeMenu]} mode="inline" items={teacherMenuItems} />

            </Sider>

            <Layout className="teacher-main">
                <TeacherHeader
                    collapsed={collapsed}
                    onToggleCollapsed={() => setCollapsed((prev) => !prev)}
                    avatarUrl={avatarUrl}
                    email={user?.email}
                    onProfile={handleProfile}
                    onLogout={handleLogout}
                />

                <Content className="teacher-content">
                    <div className="teacher-page-card">
                        <Outlet />
                    </div>
                </Content>

                <Footer className="teacher-footer">
                    © {new Date().getFullYear()} University Management System – Developed by School university with{" "}
                    <HeartTwoTone twoToneColor="#eb2f96" />
                </Footer>
            </Layout>
        </Layout>
    );

};

export default LayoutTeacher;