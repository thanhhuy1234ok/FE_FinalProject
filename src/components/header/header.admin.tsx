import React, { useEffect, useMemo, useState } from "react";
import {
    Avatar,
    Badge,
    Button,
    Dropdown,
    Empty,
    List,
    Space,
    Typography,
    Grid,
    Tag,
} from "antd";
import {
    BellOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    LogoutOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { socket } from "@/socket/socket";
import "@/styles/header.admin.scss";
import {
    getMyNotificationsAPI,
    markNotificationAsReadAPI,
    markAllNotificationsAsReadAPI,
    markAllNotificationsAsReadALLAPI,
} from "@/services/api";

const { Text } = Typography;
const { useBreakpoint } = Grid;

type NotificationItem = {
    id: number;
    title: string;
    content: string;
    type?: string;
    isRead: boolean;
    createdAt?: string;
};

type Props = {
    collapsed: boolean;
    onToggleCollapsed: () => void;
    avatarUrl: string;
    email?: string;
    onProfile: () => void;
    onLogout: () => void;
};

const LIMIT_NOTIFICATION = 5;

const AdminHeader: React.FC<Props> = ({
    collapsed,
    onToggleCollapsed,
    avatarUrl,
    email,
    onProfile,
    onLogout,
}) => {
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [showAllNotification, setShowAllNotification] = useState(false);
    const [shakeBell, setShakeBell] = useState(false);
    const unreadCount = useMemo(() => {
        return notifications.filter((item) => !item.isRead).length;
    }, [notifications]);

    const visibleNotifications = useMemo(() => {
        if (showAllNotification) return notifications;
        return notifications.slice(0, LIMIT_NOTIFICATION);
    }, [notifications, showAllNotification]);
    const fetchNotifications = async () => {
        try {
            const res = await getMyNotificationsAPI();
            const data = res?.data?.data || res?.data || [];
            setNotifications(data);
        } catch (error) {
            console.log("Load notifications error:", error);
        }
    };
    useEffect(() => {
        fetchNotifications();
    }, []);

    useEffect(() => {
        const handleNewNotification = (data: NotificationItem) => {
            setNotifications((prev) => [
                {
                    ...data,
                    isRead: false,
                },
                ...prev,
            ]);

            setShakeBell(true);

            setTimeout(() => {
                setShakeBell(false);
            }, 800);
        };

        socket.on("notification:new", handleNewNotification);
        fetchNotifications();
        return () => {
            socket.off("notification:new", handleNewNotification);
        };
    }, []);

    const handleReadNotification = async (item: NotificationItem) => {
        if (item.isRead || !item.id) return;

        try {
            await markNotificationAsReadAPI(item.id);

            setNotifications((prev) =>
                prev.map((notification) =>
                    notification.id === item.id
                        ? { ...notification, isRead: true }
                        : notification,
                ),
            );
        } catch (error) {
            console.log("Mark notification read error:", error);
        }
    };

    const handleReadAllNotifications = async () => {
        if (unreadCount === 0) return;

        try {
            await markAllNotificationsAsReadALLAPI();

            setNotifications((prev) =>
                prev.map((item) => ({
                    ...item,
                    isRead: true,
                })),
            );
        } catch (error) {
            console.log("Mark all notifications read error:", error);
        }
    };

    const itemsDropdown: MenuProps["items"] = [
        {
            key: "account",
            icon: <UserOutlined />,
            label: "Quản lý tài khoản",
        },
        {
            key: "logout",
            icon: <LogoutOutlined />,
            label: "Đăng xuất",
        },
    ];

    const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
        if (key === "account") {
            onProfile();
            return;
        }

        if (key === "logout") {
            onLogout();
        }
    };

    const notificationDropdown = useMemo(() => {
        return (
            <div className="admin-header__notification-dropdown">
                <div className="admin-header__notification-head">
                    <div>
                        <Text strong>Thông báo</Text>
                        <div className="admin-header__notification-subtitle">
                            {unreadCount} chưa đọc
                        </div>
                    </div>

                    <Button
                        type="link"
                        size="small"
                        disabled={unreadCount === 0}
                        onClick={handleReadAllNotifications}
                    >
                        Đọc tất cả
                    </Button>
                </div>

                {notifications.length === 0 ? (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Chưa có thông báo"
                    />
                ) : (
                    <>
                        <List
                            dataSource={visibleNotifications}
                            renderItem={(item) => (
                                <List.Item
                                    className={`admin-header__notification-item ${
                                        !item.isRead ? "is-unread" : ""
                                    }`}
                                    onClick={() => handleReadNotification(item)}
                                >
                                    <div className="admin-header__notification-body">
                                        <div className="admin-header__notification-top">
                                            <div className="admin-header__notification-title">
                                                {item.title}
                                            </div>

                                            {!item.isRead && (
                                                <span className="admin-header__notification-dot" />
                                            )}
                                        </div>

                                        <div className="admin-header__notification-content">
                                            {item.content}
                                        </div>

                                        <div className="admin-header__notification-footer">
                                            {item.type && (
                                                <Tag color="blue">
                                                    {item.type}
                                                </Tag>
                                            )}

                                            {item.createdAt && (
                                                <span className="admin-header__notification-time">
                                                    {new Date(
                                                        item.createdAt,
                                                    ).toLocaleString("vi-VN")}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </List.Item>
                            )}
                        />

                        {notifications.length > LIMIT_NOTIFICATION && (
                            <Button
                                block
                                type="text"
                                className="admin-header__notification-more"
                                onClick={() =>
                                    setShowAllNotification((prev) => !prev)
                                }
                            >
                                {showAllNotification
                                    ? "Thu gọn"
                                    : `Xem thêm ${
                                          notifications.length -
                                          LIMIT_NOTIFICATION
                                      } thông báo`}
                            </Button>
                        )}
                    </>
                )}
            </div>
        );
    }, [notifications, visibleNotifications, unreadCount, showAllNotification]);

    return (
        <header className="admin-header">
            <button
                type="button"
                className="admin-header__trigger"
                onClick={onToggleCollapsed}
                aria-label="Toggle menu"
            >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </button>

            <div className="admin-header__right">
                <Dropdown
                    open={notificationOpen}
                    onOpenChange={setNotificationOpen}
                    dropdownRender={() => notificationDropdown}
                    trigger={["click"]}
                    placement="bottomRight"
                >
                    <button
                        type="button"
                        className="admin-header__notification-btn"
                    >
                        <Badge count={unreadCount} size="small">
                            <BellOutlined
                                className={`admin-header__bell-icon ${
                                    shakeBell ? "is-shaking" : ""
                                }`}
                            />
                        </Badge>
                    </button>
                </Dropdown>

                <Dropdown
                    menu={{
                        items: itemsDropdown,
                        onClick: handleMenuClick,
                    }}
                    trigger={["click"]}
                    placement="bottomRight"
                >
                    <div
                        className="admin-header__account"
                        role="button"
                        tabIndex={0}
                    >
                        <Space size={10}>
                            <Avatar src={avatarUrl} icon={<UserOutlined />} />

                            {!isMobile && (
                                <Text
                                    className="admin-header__email"
                                    ellipsis={{ tooltip: email }}
                                >
                                    {email || "Tài khoản"}
                                </Text>
                            )}
                        </Space>
                    </div>
                </Dropdown>
            </div>
        </header>
    );
};

export default AdminHeader;
