import { Layout, message } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import StudentHeader from "../header/header.student";
import { LogoutAPI } from "@/services/api";
import { useCurrentApp } from "@/context/use.curent";

const { Content } = Layout;

const LayoutStudent = () => {

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <StudentHeader />

            <Content
                style={{
                    padding: 24,
                    background: "#f5f7fa",
                }}
            >
                <div
                    style={{
                        background: "#fff",
                        borderRadius: 12,
                        padding: 24,
                        minHeight: "calc(100vh - 100px)",
                    }}
                >
                    <Outlet />
                </div>
            </Content>
        </Layout>
    );
};

export default LayoutStudent;
