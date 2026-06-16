import { useEffect, useMemo, useState } from "react";
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
    TeamOutlined,
} from "@ant-design/icons";
import {
    Avatar,
    Badge,
    Button,
    Dropdown,
    Empty,
    Grid,
    Input,
    Layout,
    List,
    Menu,
    Space,
    Tag,
    Typography,
    message,
} from "antd";
import type { MenuProps } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { socket, connectSocket } from "@/socket/socket";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import "@/styles/bell.scss";
import {
    getMyNotificationsAPI,
    markAllNotificationsAsReadAPI,
    markNotificationAsReadAPI,
} from "@/services/api";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(relativeTime);
dayjs.locale("vi");
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("vi");
const { Header } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

interface INotification {
    id: number;
    title: string;
    content: string;
    type: string;
    isRead: boolean;
    createdAt: string;
    referenceId?: number | null;
}

const StudentHeader = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const screens = useBreakpoint();

    const { user, setUser, setIsAuthenticated } = useCurrentApp();

    const [openKeys, setOpenKeys] = useState<string[]>([]);
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [shakeBell, setShakeBell] = useState(false);

    const unreadCount = useMemo(() => {
        return notifications.filter((item) => !item.isRead).length;
    }, [notifications]);

    useEffect(() => {
        const token = localStorage.getItem("access_token");

        if (token && !socket.connected) {
            connectSocket(token);
        }
    }, []);
    const fetchNotifications = async () => {
        try {
            const res = await getMyNotificationsAPI();
            const data = res?.data?.data || res?.data || [];

            setNotifications(data);
        } catch (error) {
            console.log("Load notification error:", error);
        }
    };
    useEffect(() => {
        fetchNotifications();
    }, []);

    useEffect(() => {
        const handleNewNotification = (data: INotification) => {
            setNotifications((prev) => {
                const existed = prev.some((item) => item.id === data.id);
                if (existed) return prev;

                return [{ ...data, isRead: false }, ...prev];
            });

            setShakeBell(true);
            setTimeout(() => setShakeBell(false), 800);

            message.success(data.title);
        };

        const handleDeletedNotification = async (data: { id?: number }) => {
            console.log("DELETE NOTI FE:", data);

            if (data?.id) {
                setNotifications((prev) =>
                    prev.filter((item) => item.id !== Number(data.id)),
                );
            }

            // fallback sync lại DB cho chắc
            await fetchNotifications();
        };

        socket.on("notification:new", handleNewNotification);
        socket.on("notification:deleted", handleDeletedNotification);

        return () => {
            socket.off("notification:new", handleNewNotification);
            socket.off("notification:deleted", handleDeletedNotification);
        };
    }, []);

    const getNotificationLink = (item: INotification) => {
        const type = String(item.type || "").toUpperCase();

        switch (type) {
            case "DOCUMENT":
            case "COURSE":
                return item.referenceId
                    ? `/my-classes/${item.referenceId}`
                    : null;

            case "LESSON":
            case "ATTENDANCE":
            case "QR_ATTENDANCE":
                return item.referenceId
                    ? `/my-classes/lessons/${item.referenceId}`
                    : null;

            case "PAYMENT":
                return "/payment/history";

            case "GRADE":
            case "GRADE_PUBLISHED":
                return "/grades";

            default:
                return null;
        }
    };

    const handleNotificationClick = async (item: INotification) => {
        try {
            if (!item.isRead) {
                await markNotificationAsReadAPI(item.id);

                setNotifications((prev) =>
                    prev.map((notification) =>
                        notification.id === item.id
                            ? {
                                  ...notification,
                                  isRead: true,
                              }
                            : notification,
                    ),
                );
            }

            const link = getNotificationLink(item);

            if (link) {
                setNotificationOpen(false);
                navigate(link);
            }
        } catch (error) {
            console.log("Read notification error:", error);
        }
    };

    const handleReadAllNotifications = async () => {
        if (unreadCount === 0) return;

        try {
            await markAllNotificationsAsReadAPI();

            setNotifications((prev) =>
                prev.map((item) => ({
                    ...item,
                    isRead: true,
                })),
            );
        } catch (error) {
            console.log("Read all notification error:", error);
        }
    };

    const handleLogout = async () => {
        try {
            await LogoutAPI();
            message.success("Đăng xuất thành công");
        } catch (error) {
            message.warning("Phiên đăng nhập đã được xoá");
        } finally {
            setIsAuthenticated(false);
            setUser(null);

            socket.disconnect();
            localStorage.removeItem("access_token");

            navigate("/");
        }
    };

    const getSelectedKey = (pathname: string) => {
        if (pathname.startsWith("/schedule")) return "/schedule";
        if (pathname.startsWith("/timetable")) return "/timetable";
        if (pathname.startsWith("/my-classes")) return "/my-classes";
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
            key: "/timetable",
            icon: <BookOutlined />,
            label: "Thời khóa biểu",
        },
        {
            key: "/my-classes",
            icon: <TeamOutlined />,
            label: "Lớp học của tôi",
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

    const notificationMenu = (
        <div
            style={{
                width: 380,
                maxHeight: 520,
                overflowY: "auto",
                background: "#fff",
                borderRadius: 16,
                padding: 12,
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                    gap: 12,
                }}
            >
                <div>
                    <Text strong>Thông báo</Text>
                    <div
                        style={{
                            fontSize: 12,
                            color: "#999",
                            marginTop: 2,
                        }}
                    >
                        {unreadCount} chưa đọc
                    </div>
                </div>

                <Space>
                    <Button
                        type="link"
                        size="small"
                        disabled={unreadCount === 0}
                        onClick={handleReadAllNotifications}
                    >
                        Đọc tất cả
                    </Button>
                </Space>
            </div>

            {notifications.length === 0 ? (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Chưa có thông báo"
                />
            ) : (
                <List
                    dataSource={notifications}
                    renderItem={(item) => {
                        const link = getNotificationLink(item);

                        return (
                            <List.Item
                                onClick={() => handleNotificationClick(item)}
                                style={{
                                    padding: 12,
                                    borderRadius: 12,
                                    marginBottom: 8,
                                    background: item.isRead
                                        ? "#fff"
                                        : "#f6ffed",
                                    cursor: "pointer",
                                    border: "1px solid #f0f0f0",
                                }}
                            >
                                <div style={{ width: "100%" }}>
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            gap: 8,
                                        }}
                                    >
                                        <Text strong>{item.title}</Text>

                                        {!item.isRead && (
                                            <Tag color="green">Mới</Tag>
                                        )}
                                    </div>

                                    <div
                                        style={{
                                            marginTop: 4,
                                            marginBottom: 6,
                                        }}
                                    >
                                        <Text type="secondary">
                                            {item.content}
                                        </Text>

                                        {link && (
                                            <div
                                                style={{
                                                    marginTop: 6,
                                                    fontSize: 12,
                                                    color: "#1677ff",
                                                }}
                                            >
                                                Bấm để xem chi tiết
                                            </div>
                                        )}
                                    </div>

                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            gap: 8,
                                        }}
                                    >
                                        <Tag color="blue">{item.type}</Tag>

                                        <Text
                                            type="secondary"
                                            style={{
                                                fontSize: 12,
                                            }}
                                        >
                                            {dayjs
                                                .utc(item.createdAt)
                                                .tz("Asia/Ho_Chi_Minh")
                                                .fromNow()}
                                        </Text>
                                    </div>
                                </div>
                            </List.Item>
                        );
                    }}
                />
            )}
        </div>
    );

    return (
        <Header
            style={{
                background: "#fff",
                padding: "0 24px",
                height: 64,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #f0f0f0",
                position: "sticky",
                top: 0,
                zIndex: 100,
                gap: 20,
            }}
        >
            <div
                style={{
                    minWidth: 0,
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                }}
            >
                <Menu
                    mode="horizontal"
                    selectedKeys={[selectedKey]}
                    openKeys={openKeys}
                    onOpenChange={(keys) => setOpenKeys(keys as string[])}
                    items={menuItems}
                    onClick={(e) => {
                        if (String(e.key).startsWith("/")) {
                            navigate(String(e.key));
                        }
                    }}
                    style={{
                        borderBottom: "none",
                        flex: 1,
                        minWidth: 0,
                    }}
                    overflowedIndicator={<span>...</span>}
                />
            </div>

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                    flexShrink: 0,
                }}
            >
                {screens.lg && (
                    <Input.Search
                        placeholder="Tìm kiếm..."
                        style={{ width: 250 }}
                    />
                )}

                <Dropdown
                    open={notificationOpen}
                    onOpenChange={setNotificationOpen}
                    dropdownRender={() => notificationMenu}
                    trigger={["click"]}
                    placement="bottomRight"
                >
                    <Badge count={unreadCount} size="small">
                        <BellOutlined
                            style={{
                                fontSize: 22,
                                cursor: "pointer",
                            }}
                            className={
                                shakeBell || unreadCount > 0
                                    ? "bell-animation"
                                    : ""
                            }
                        />
                    </Badge>
                </Dropdown>

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
