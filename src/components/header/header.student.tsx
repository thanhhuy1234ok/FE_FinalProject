import { useCurrentApp } from "@/context/use.curent";
import { LogoutAPI } from "@/services/api";
import {
    BellOutlined,
    BookOutlined,
    CalendarOutlined,
    CreditCardOutlined,
    FileTextOutlined,
    HomeOutlined,
    LogoutOutlined,
    ProfileOutlined,
    ReadOutlined,
    UserOutlined,
} from "@ant-design/icons";
import {
    Avatar,
    Badge,
    Dropdown,
    Grid,
    Input,
    Layout,
    Menu,
    Typography,
    message,
} from "antd";
import type { MenuProps } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

const { Header } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

const StudentHeader = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const screens = useBreakpoint();
    const { user, setUser, setIsAuthenticated } = useCurrentApp();

    const handleLogout = async () => {
        try {
            await LogoutAPI();
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

    const getSelectedKey = (pathname: string) => {
        if (pathname.startsWith("/schedule")) return "/schedule";
        if (pathname.startsWith("/courses")) return "/courses";
        if (pathname.startsWith("/course-registration"))
            return "/course-registration";
        if (pathname.startsWith("/grades")) return "/grades";
        if (pathname.startsWith("/profile")) return "/profile";
        if (pathname.startsWith("/payment/history")) return "/payment/history";
        if (pathname.startsWith("/payment")) return "/payment";
        return "/";
    };

    const selectedKey = getSelectedKey(location.pathname);

    const menuItems: MenuProps["items"] = [
        {
            key: "/",
            icon: <HomeOutlined />,
            label: "Tổng quan",
        },
        {
            key: "/schedule",
            icon: <CalendarOutlined />,
            label: "Lịch học",
        },
        {
            key: "/courses",
            icon: <BookOutlined />,
            label: "Môn học",
        },
        {
            key: "/course-registration",
            icon: <BookOutlined />,
            label: "Đăng ký môn học",
        },
        {
            key: "/grades",
            icon: <ReadOutlined />,
            label: "Kết quả học tập",
        },
        {
            key: "payment-submenu",
            icon: <CreditCardOutlined />,
            label: "Thanh toán",
            children: [
                {
                    key: "/payment",
                    icon: <CreditCardOutlined />,
                    label: "Thanh toán hiện tại",
                },
                {
                    key: "/payment/history",
                    icon: <FileTextOutlined />,
                    label: "Lịch sử thanh toán",
                },
            ],
        },
    ];

    const userMenuItems: MenuProps["items"] = [
        {
            key: "profile",
            icon: <ProfileOutlined />,
            label: "Thông tin cá nhân",
        },
        {
            type: "divider",
        },
        {
            key: "logout",
            icon: <LogoutOutlined />,
            label: "Đăng xuất",
            danger: true,
        },
    ];

    const handleUserMenuClick: MenuProps["onClick"] = ({ key }) => {
        if (key === "profile") {
            navigate("/profile");
            return;
        }

        if (key === "logout") {
            handleLogout();
        }
    };

    const openKeys = location.pathname.startsWith("/payment")
        ? ["payment-submenu"]
        : [];

    return (
        <Header
            style={{
                background: "#fff",
                padding: "0 24px",
                height: 64,
                lineHeight: "64px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #f0f0f0",
                position: "sticky",
                top: 0,
                zIndex: 100,
                width: "100%",
                gap: 24,
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    minWidth: 0,
                    flex: 1,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        flexShrink: 0,
                        marginRight: 28,
                    }}
                >
                    <Text
                        strong
                        style={{
                            fontSize: 18,
                            whiteSpace: "nowrap",
                        }}
                    >
                        🎓 Student Portal
                    </Text>
                </div>

                <div
                    style={{
                        minWidth: 0,
                        flex: 1,
                        overflow: "hidden",
                    }}
                >
                    <Menu
                        mode="horizontal"
                        selectedKeys={[selectedKey]}
                        defaultOpenKeys={openKeys}
                        items={menuItems}
                        onClick={(e) => {
                            if (String(e.key).startsWith("/")) {
                                navigate(String(e.key));
                            }
                        }}
                        style={{
                            borderBottom: "none",
                        }}
                        overflowedIndicator={<span>...</span>}
                    />
                </div>
            </div>

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    flexShrink: 0,
                }}
            >
                {screens.lg && (
                    <Input.Search
                        placeholder="Tìm kiếm..."
                        allowClear
                        style={{ width: 260 }}
                    />
                )}

                <Badge count={3} size="small">
                    <BellOutlined
                        style={{
                            fontSize: 18,
                            cursor: "pointer",
                        }}
                    />
                </Badge>

                <Dropdown
                    menu={{
                        items: userMenuItems,
                        onClick: handleUserMenuClick,
                    }}
                    placement="bottomRight"
                    trigger={["click"]}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            cursor: "pointer",
                        }}
                    >
                        <Avatar icon={<UserOutlined />} />
                        {screens.sm && (
                            <Text
                                ellipsis
                                style={{
                                    maxWidth: 140,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {user?.name || user?.email || "Student"}
                            </Text>
                        )}
                    </div>
                </Dropdown>
            </div>
        </Header>
    );
};

export default StudentHeader;
