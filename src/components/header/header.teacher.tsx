import {
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
} from "@ant-design/icons";
import {
    Avatar,
    Button,
    Dropdown,
    Layout,
    message,
    Space,
    Typography,
} from "antd";
import type { MenuProps } from "antd";
import { useNavigate } from "react-router-dom";
import { LogoutAPI } from "@/services/api";
import { socket } from "@/socket/socket";

const { Header } = Layout;
const { Text } = Typography;

interface IProps {
    collapsed: boolean;
    setCollapsed: (value: boolean) => void;
    user: any;
    setIsAuthenticated: (value: boolean) => void;
    setUser: (value: any) => void;
}

const TeacherHeader = ({
    collapsed,
    setCollapsed,
    user,
    setIsAuthenticated,
    setUser,
}: IProps) => {
    const navigate = useNavigate();

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

    const dropdownItems: MenuProps["items"] = [
        {
            key: "profile",
            icon: <UserOutlined />,
            label: "Thông tin cá nhân",
            onClick: () => navigate("/profile"),
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

    return (
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
                        src={user?.avatar || undefined}
                        icon={!user?.avatar ? <UserOutlined /> : undefined}
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
    );
};

export default TeacherHeader;
