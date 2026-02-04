import React, { useMemo, useState } from "react";
import { Layout, Menu } from "antd";
import { HeartTwoTone } from "@ant-design/icons";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import '@/styles/layout.student.scss'
import avatarFallback from "@/assets/avatar/avatar.jpg";
import { LogoutAPI } from "@/services/api";
import { useCurrentApp } from "@/context/use.curent";
import { studentMenuItems } from "../menu/menu.student";
import StudentHeader from "../header/header.student";
import { findActiveKey } from "@/helper/findActiveKey";


const { Content, Footer, Sider } = Layout;

const LayoutStudent: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);

    const { user, setUser, setIsAuthenticated, isAuthenticated } = useCurrentApp();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const activeMenu = useMemo(() => {
        return findActiveKey(studentMenuItems, pathname) || "/";
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
        navigate("/student/profile");
    };

    const avatarUrl = user?.avatar
        ? `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${user.avatar}`
        : avatarFallback;

    if (isAuthenticated === false) return <Outlet />;

    return (
        <Layout style={{ minHeight: "100vh" }} className={`layout-student`}>
            <Sider
                theme="light"
                className="student-sider"
                collapsible
                collapsed={collapsed}
                onCollapse={(value) => setCollapsed(value)}
                width={300}
            >
                <div className="student-brand">Student</div>
                <Menu selectedKeys={[activeMenu]} mode="inline" items={studentMenuItems} />

            </Sider>

            <Layout className="student-main">
                <StudentHeader
                    collapsed={collapsed}
                    onToggleCollapsed={() => setCollapsed((prev) => !prev)}
                    avatarUrl={avatarUrl}
                    email={user?.email}
                    onProfile={handleProfile}
                    onLogout={handleLogout}
                />

                <Content className="student-content">
                    <div className="student-page-card">
                        <Outlet />
                    </div>
                </Content>

                <Footer className="student-footer">
                    © {new Date().getFullYear()} University Management System – Developed by School university with{" "}
                    <HeartTwoTone twoToneColor="#eb2f96" />
                </Footer>
            </Layout>
        </Layout>
    );

};

export default LayoutStudent;