import {
    App,
    Badge,
    Button,
    Card,
    Col,
    Empty,
    Row,
    Space,
    Spin,
    Tag,
    Tooltip,
    Typography,
} from "antd";
import {
    BookOutlined,
    CalendarOutlined,
    EnvironmentOutlined,
    EyeOutlined,
    ReloadOutlined,
    TeamOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { getMyClassesAPI } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { socket } from "@/socket/socket";

const { Title, Text } = Typography;

const dayLabel: Record<number, string> = {
    2: "Thứ 2",
    3: "Thứ 3",
    4: "Thứ 4",
    5: "Thứ 5",
    6: "Thứ 6",
    7: "Thứ 7",
    8: "Chủ nhật",
};

const MyClassesPage = () => {
    const { message } = App.useApp();

    const [loading, setLoading] = useState(false);
    const [classes, setClasses] = useState<any[]>([]);
    const navigate = useNavigate();

    const fetchMyClasses = async () => {
        try {
            setLoading(true);

            const res = await getMyClassesAPI();
            const payload = res.data;

            if (Array.isArray(payload)) {
                setClasses(payload);
            } else {
                setClasses([]);
            }
        } catch (error) {
            console.log("GET MY CLASSES ERROR:", error);
            message.error("Không tải được danh sách lớp học");
            setClasses([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyClasses();
    }, []);

    useEffect(() => {
        const handleConversationUpdated = (payload: any) => {
            if (!payload?.courseOfferingId) return;

            setClasses((prev) =>
                prev.map((registration) => {
                    const courseId = registration?.courseOffering?.id;

                    if (courseId !== payload.courseOfferingId) {
                        return registration;
                    }

                    return {
                        ...registration,
                        unreadCount: payload.unreadCount || 0,
                        courseOffering: {
                            ...registration.courseOffering,
                            unreadCount: payload.unreadCount || 0,
                        },
                    };
                }),
            );
        };

        socket.on("conversation:updated", handleConversationUpdated);

        return () => {
            socket.off("conversation:updated", handleConversationUpdated);
        };
    }, []);

    return (
        <div
            style={{
                padding: 24,
                minHeight: "100vh",
                background:
                    "linear-gradient(180deg, #f5f8ff 0%, #ffffff 45%, #f7f9fc 100%)",
            }}
        >
            <Space direction="vertical" size={24} style={{ width: "100%" }}>
                <Card
                    bordered={false}
                    style={{
                        borderRadius: 24,
                        boxShadow: "0 12px 32px rgba(15, 23, 42, 0.08)",
                    }}
                    bodyStyle={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 16,
                        flexWrap: "wrap",
                    }}
                >
                    <div>
                        <Title level={2} style={{ margin: 0 }}>
                            Lớp học của tôi
                        </Title>

                        <Text type="secondary">
                            Chỉ hiển thị các lớp đã đăng ký và đã thanh toán
                        </Text>
                    </div>

                    <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchMyClasses}
                        loading={loading}
                    >
                        Tải lại
                    </Button>
                </Card>

                {loading ? (
                    <Card
                        bordered={false}
                        style={{
                            borderRadius: 24,
                            textAlign: "center",
                            padding: 60,
                        }}
                    >
                        <Spin size="large" />
                    </Card>
                ) : classes.length === 0 ? (
                    <Card bordered={false} style={{ borderRadius: 24 }}>
                        <Empty description="Bạn chưa có lớp học đã thanh toán" />
                    </Card>
                ) : (
                    <Row gutter={[20, 20]}>
                        {classes.map((registration) => {
                            const course = registration?.courseOffering;

                            const teacherSubject = course?.teacherSubject;
                            const subject = teacherSubject?.subject;

                            const teacher = teacherSubject?.teacher;
                            const teacherName =
                                teacher?.user?.name ||
                                teacher?.name ||
                                "Chưa phân công";

                            const term = course?.term;
                            const adminClass = course?.adminClass;
                            const schedules = Array.isArray(course?.schedules)
                                ? course.schedules
                                : [];

                            const subjectName =
                                subject?.name ||
                                course?.subject?.name ||
                                "Không có tên môn";

                            const subjectCode =
                                subject?.code ||
                                course?.subject?.code ||
                                course?.code ||
                                "N/A";

                            const credit =
                                subject?.credit || course?.subject?.credit || 0;

                            const unreadCount =
                                course?.unreadCount ||
                                registration?.unreadCount ||
                                0;

                            const hasUnread = unreadCount > 0;

                            return (
                                <Col
                                    xs={24}
                                    md={12}
                                    xl={8}
                                    key={registration.id}
                                >
                                    <Badge
                                        count={unreadCount}
                                        overflowCount={99}
                                        offset={[-8, 8]}
                                    >
                                        <Card
                                            hoverable
                                            bordered={false}
                                            style={{
                                                height: "100%",
                                                borderRadius: 24,
                                                overflow: "hidden",
                                                border: hasUnread
                                                    ? "1px solid #ff7875"
                                                    : "none",
                                                boxShadow: hasUnread
                                                    ? "0 10px 28px rgba(255, 77, 79, 0.16)"
                                                    : "0 10px 28px rgba(15, 23, 42, 0.08)",
                                            }}
                                            bodyStyle={{
                                                padding: 0,
                                                height: "100%",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    height: 8,
                                                    background: hasUnread
                                                        ? "linear-gradient(90deg, #ff4d4f, #ff7875)"
                                                        : "linear-gradient(90deg, #1677ff, #69b1ff)",
                                                }}
                                            />

                                            <div style={{ padding: 22 }}>
                                                <Space
                                                    direction="vertical"
                                                    size={16}
                                                    style={{ width: "100%" }}
                                                >
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            justifyContent:
                                                                "space-between",
                                                            alignItems:
                                                                "flex-start",
                                                            gap: 12,
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                minWidth: 0,
                                                                flex: 1,
                                                            }}
                                                        >
                                                            <Tooltip
                                                                title={
                                                                    subjectName
                                                                }
                                                            >
                                                                <Title
                                                                    level={4}
                                                                    ellipsis
                                                                    style={{
                                                                        margin: 0,
                                                                        color: "#0f172a",
                                                                    }}
                                                                >
                                                                    {
                                                                        subjectName
                                                                    }
                                                                </Title>
                                                            </Tooltip>

                                                            <Text type="secondary">
                                                                {subjectCode}
                                                            </Text>
                                                        </div>

                                                        <Space>
                                                            {hasUnread && (
                                                                <Tag
                                                                    color="red"
                                                                    style={{
                                                                        borderRadius: 999,
                                                                    }}
                                                                >
                                                                    Tin mới
                                                                </Tag>
                                                            )}

                                                            <Tag
                                                                color="blue"
                                                                style={{
                                                                    borderRadius: 999,
                                                                    padding:
                                                                        "4px 10px",
                                                                }}
                                                            >
                                                                {credit} tín chỉ
                                                            </Tag>
                                                        </Space>
                                                    </div>

                                                    <div
                                                        style={{
                                                            display: "grid",
                                                            gap: 10,
                                                        }}
                                                    >
                                                        <Text>
                                                            <BookOutlined /> Mã
                                                            lớp:{" "}
                                                            <b>
                                                                {course?.code ||
                                                                    "N/A"}
                                                            </b>
                                                        </Text>

                                                        <Text>
                                                            <UserOutlined />{" "}
                                                            Giáo viên:{" "}
                                                            <b>{teacherName}</b>
                                                        </Text>

                                                        <Text>
                                                            <CalendarOutlined />{" "}
                                                            Học kỳ:{" "}
                                                            <b>
                                                                {term?.semester ||
                                                                    "?"}{" "}
                                                                -{" "}
                                                                {term?.year ||
                                                                    "?"}
                                                            </b>
                                                        </Text>

                                                        <Text>
                                                            <TeamOutlined /> Lớp
                                                            hành chính:{" "}
                                                            <b>
                                                                {adminClass?.name ||
                                                                    "N/A"}
                                                            </b>
                                                        </Text>

                                                        <Text>
                                                            <EnvironmentOutlined />{" "}
                                                            Mã lớp HC:{" "}
                                                            <b>
                                                                {adminClass?.code ||
                                                                    "N/A"}
                                                            </b>
                                                        </Text>
                                                    </div>

                                                    <div>
                                                        <Text strong>
                                                            Lịch học
                                                        </Text>

                                                        <div
                                                            style={{
                                                                marginTop: 10,
                                                                display: "flex",
                                                                flexWrap:
                                                                    "wrap",
                                                                gap: 8,
                                                            }}
                                                        >
                                                            {schedules.length ===
                                                            0 ? (
                                                                <Tag>
                                                                    Chưa có lịch
                                                                    học
                                                                </Tag>
                                                            ) : (
                                                                schedules.map(
                                                                    (
                                                                        schedule: any,
                                                                    ) => (
                                                                        <Tag
                                                                            key={
                                                                                schedule.id
                                                                            }
                                                                            color="processing"
                                                                            style={{
                                                                                borderRadius: 999,
                                                                                padding:
                                                                                    "4px 10px",
                                                                            }}
                                                                        >
                                                                            {dayLabel[
                                                                                Number(
                                                                                    schedule.dayOfWeek,
                                                                                )
                                                                            ] ||
                                                                                `Thứ ${schedule.dayOfWeek}`}{" "}
                                                                            •
                                                                            Tiết{" "}
                                                                            {schedule.lessonStart ??
                                                                                "?"}
                                                                            -
                                                                            {schedule.lessonEnd ??
                                                                                "?"}
                                                                            {schedule
                                                                                ?.room
                                                                                ?.name
                                                                                ? ` • ${schedule.room.name}`
                                                                                : ""}
                                                                        </Tag>
                                                                    ),
                                                                )
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            justifyContent:
                                                                "flex-end",
                                                            marginTop: 8,
                                                        }}
                                                    >
                                                        <Button
                                                            type="primary"
                                                            icon={
                                                                <EyeOutlined />
                                                            }
                                                            style={{
                                                                borderRadius: 999,
                                                                height: 40,
                                                                paddingInline: 18,
                                                            }}
                                                            onClick={() => {
                                                                setClasses(
                                                                    (prev) =>
                                                                        prev.map(
                                                                            (
                                                                                item,
                                                                            ) =>
                                                                                item
                                                                                    ?.courseOffering
                                                                                    ?.id ===
                                                                                course?.id
                                                                                    ? {
                                                                                          ...item,
                                                                                          unreadCount: 0,
                                                                                          courseOffering:
                                                                                              {
                                                                                                  ...item.courseOffering,
                                                                                                  unreadCount: 0,
                                                                                              },
                                                                                      }
                                                                                    : item,
                                                                        ),
                                                                );

                                                                navigate(
                                                                    `/my-classes/${course?.id}`,
                                                                );
                                                            }}
                                                        >
                                                            Xem chi tiết
                                                        </Button>
                                                    </div>
                                                </Space>
                                            </div>
                                        </Card>
                                    </Badge>
                                </Col>
                            );
                        })}
                    </Row>
                )}
            </Space>
        </div>
    );
};

export default MyClassesPage;
