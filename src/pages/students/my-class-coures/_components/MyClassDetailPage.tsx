import {
    ArrowLeftOutlined,
    BookOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    DownloadOutlined,
    EyeOutlined,
    FilePdfOutlined,
    FileUnknownOutlined,
    FileWordOutlined,
    HomeOutlined,
    MessageOutlined,
    TeamOutlined,
    UploadOutlined,
    UserOutlined,
} from "@ant-design/icons";
import {
    Avatar,
    Badge,
    Button,
    Card,
    Col,
    Descriptions,
    Empty,
    Row,
    Space,
    Spin,
    Table,
    Tabs,
    Tag,
    Typography,
    message,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getMyClassDetailAPI } from "@/services/api";
import { socket } from "@/socket/socket";
import ChatRoomSection from "./ChatRoomSection";

const { Title, Text } = Typography;

const dayMap: Record<number, string> = {
    2: "Thứ 2",
    3: "Thứ 3",
    4: "Thứ 4",
    5: "Thứ 5",
    6: "Thứ 6",
    7: "Thứ 7",
    8: "Chủ nhật",
};

const statusTextMap: Record<string, string> = {
    OPEN: "Đang mở",
    CLOSED: "Đã đóng",
    REGISTERED: "Đang học",
    CANCELLED: "Đã hủy",
};

const getFileIcon = (fileType?: string, fileName?: string) => {
    const type = fileType?.toLowerCase() || "";
    const name = fileName?.toLowerCase() || "";

    if (type.includes("pdf") || name.endsWith(".pdf")) {
        return <FilePdfOutlined style={{ fontSize: 24, color: "#ff4d4f" }} />;
    }

    if (
        type.includes("word") ||
        type.includes("document") ||
        name.endsWith(".doc") ||
        name.endsWith(".docx")
    ) {
        return <FileWordOutlined style={{ fontSize: 24, color: "#1677ff" }} />;
    }

    return <FileUnknownOutlined style={{ fontSize: 24, color: "#8c8c8c" }} />;
};

const isOfficeFile = (fileType?: string, fileName?: string) => {
    const type = fileType?.toLowerCase() || "";
    const name = fileName?.toLowerCase() || "";

    return (
        type.includes("word") ||
        type.includes("document") ||
        type.includes("presentation") ||
        type.includes("powerpoint") ||
        name.endsWith(".doc") ||
        name.endsWith(".docx") ||
        name.endsWith(".ppt") ||
        name.endsWith(".pptx")
    );
};

const isPdfFile = (fileType?: string, fileName?: string) => {
    const type = fileType?.toLowerCase() || "";
    const name = fileName?.toLowerCase() || "";

    return type.includes("pdf") || name.endsWith(".pdf");
};

const getViewUrl = (record: any) => {
    const fileUrl = record?.fileUrl;
    if (!fileUrl) return "";

    if (isOfficeFile(record?.fileType, record?.fileName)) {
        return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(fileUrl)}`;
    }

    return fileUrl;
};

const getDownloadUrl = (fileUrl?: string) => {
    if (!fileUrl) return "";

    if (fileUrl.includes("/upload/")) {
        return fileUrl.replace("/upload/", "/upload/fl_attachment/");
    }

    return fileUrl;
};

const MyClassDetailPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState("info");
    const [chatUnread, setChatUnread] = useState(0);

    const fetchDetail = async () => {
        if (!courseId) return;

        try {
            setLoading(true);

            const res = await getMyClassDetailAPI(Number(courseId));
            const payload = res?.data?.data || res?.data?.result || res?.data;

            setData(payload);
        } catch (error) {
            console.log("GET MY CLASS DETAIL ERROR:", error);
            message.error("Không tải được chi tiết lớp học");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [courseId]);

    const course = data?.courseOffering;
    const subject = course?.teacherSubject?.subject;
    const teacher = course?.teacherSubject?.teacher;

    useEffect(() => {
        const handleConversationUpdated = (payload: any) => {
            if (!course?.id) return;
            if (payload?.courseOfferingId !== course.id) return;

            if (activeTab !== "chat") {
                setChatUnread(payload?.unreadCount || 1);
            }
        };

        socket.on("conversation:updated", handleConversationUpdated);

        return () => {
            socket.off("conversation:updated", handleConversationUpdated);
        };
    }, [course?.id, activeTab]);

    const students = useMemo(() => {
        return course?.courseRegistrations || [];
    }, [course]);

    const documents = useMemo(() => {
        return course?.documents || [];
    }, [course]);

    const studentColumns = [
        {
            title: "STT",
            width: 70,
            align: "center" as const,
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: "Sinh viên",
            render: (_: any, record: any) => {
                const student = record?.student;
                const user = student?.user;

                return (
                    <Space>
                        <Avatar src={user?.avatar} icon={<UserOutlined />}>
                            {user?.name?.charAt(0)}
                        </Avatar>

                        <div>
                            <Text strong>{user?.name || "Chưa có tên"}</Text>
                            <br />
                            <Text type="secondary">
                                {user?.email || "Chưa có email"}
                            </Text>
                        </div>
                    </Space>
                );
            },
        },
        {
            title: "MSSV",
            width: 130,
            render: (_: any, record: any) => record?.student?.mssv || "Chưa có",
        },
        {
            title: "Trạng thái",
            width: 140,
            render: (_: any, record: any) => (
                <Tag color={record?.status === "REGISTERED" ? "green" : "red"}>
                    {statusTextMap[record?.status] || record?.status}
                </Tag>
            ),
        },
    ];

    const documentColumns = [
        {
            title: "Tài liệu",
            render: (_: any, record: any) => (
                <Space align="start">
                    {getFileIcon(record?.fileType, record?.fileName)}

                    <div>
                        <Text strong>
                            {record?.title || "Tài liệu học tập"}
                        </Text>
                        <br />
                        <Text type="secondary">
                            {record?.fileName || "Không rõ tên file"}
                        </Text>
                        <br />

                        <Space size={6} style={{ marginTop: 4 }}>
                            {isPdfFile(record?.fileType, record?.fileName) && (
                                <Tag color="red">PDF</Tag>
                            )}

                            {isOfficeFile(
                                record?.fileType,
                                record?.fileName,
                            ) && <Tag color="blue">OFFICE</Tag>}
                        </Space>
                    </div>
                </Space>
            ),
        },
        {
            title: "Dung lượng",
            width: 140,
            render: (_: any, record: any) => {
                const size = Number(record?.fileSize || 0);
                if (!size) return "Không rõ";
                return `${(size / 1024 / 1024).toFixed(2)} MB`;
            },
        },
        {
            title: "Ngày upload",
            width: 190,
            render: (_: any, record: any) =>
                record?.createdAt
                    ? new Date(record.createdAt).toLocaleString("vi-VN")
                    : "Không rõ",
        },
        {
            title: "Thao tác",
            width: 260,
            align: "center" as const,
            render: (_: any, record: any) => (
                <Space>
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => {
                            const viewUrl = getViewUrl(record);

                            if (!viewUrl) {
                                message.error("Không tìm thấy file");
                                return;
                            }

                            window.open(
                                viewUrl,
                                "_blank",
                                "noopener,noreferrer",
                            );
                        }}
                    >
                        Xem
                    </Button>

                    <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={() => {
                            if (!record?.fileUrl) {
                                message.error("Không tìm thấy file");
                                return;
                            }

                            window.open(
                                getDownloadUrl(record.fileUrl),
                                "_blank",
                                "noopener,noreferrer",
                            );
                        }}
                    >
                        Tải xuống
                    </Button>
                </Space>
            ),
        },
    ];

    if (loading) {
        return (
            <div style={{ padding: 24 }}>
                <Spin spinning />
            </div>
        );
    }

    if (!course || !subject) {
        return (
            <div style={{ padding: 24 }}>
                <Card style={{ borderRadius: 20 }}>
                    <Empty description="Không tìm thấy lớp học" />
                </Card>
            </div>
        );
    }

    return (
        <div style={{ padding: 24 }}>
            <Space direction="vertical" size={20} style={{ width: "100%" }}>
                <Card
                    style={{
                        borderRadius: 24,
                        border: "none",
                        background:
                            "linear-gradient(135deg, #1677ff 0%, #69b1ff 100%)",
                    }}
                >
                    <Row
                        justify="space-between"
                        align="middle"
                        gutter={[16, 16]}
                    >
                        <Col xs={24} lg={16}>
                            <Space direction="vertical" size={10}>
                                <Button
                                    icon={<ArrowLeftOutlined />}
                                    onClick={() => navigate(-1)}
                                >
                                    Quay lại
                                </Button>

                                <Title
                                    level={2}
                                    style={{
                                        color: "#fff",
                                        margin: 0,
                                    }}
                                >
                                    {subject.name}
                                </Title>

                                <Text style={{ color: "#eef6ff" }}>
                                    Mã lớp: {course.code}
                                </Text>

                                <Space wrap>
                                    <Tag color="blue">{subject.code}</Tag>
                                    <Tag color="gold">
                                        {subject.credit} tín chỉ
                                    </Tag>
                                    <Tag color="green">
                                        {course.term?.semester} -{" "}
                                        {course.term?.year}
                                    </Tag>
                                </Space>
                            </Space>
                        </Col>

                        <Col xs={24} lg={8}>
                            <Card
                                style={{
                                    borderRadius: 20,
                                    background: "rgba(255,255,255,0.96)",
                                }}
                            >
                                <Space>
                                    <Avatar
                                        size={60}
                                        style={{
                                            background: "#1677ff",
                                            fontWeight: 700,
                                            fontSize: 22,
                                        }}
                                    >
                                        {subject.code?.slice(0, 2)}
                                    </Avatar>

                                    <div>
                                        <Text type="secondary">Sĩ số lớp</Text>
                                        <Title level={3} style={{ margin: 0 }}>
                                            {students.length}/
                                            {course.maxStudents || 0}
                                        </Title>
                                    </div>
                                </Space>
                            </Card>
                        </Col>
                    </Row>
                </Card>

                <Card style={{ borderRadius: 20 }}>
                    <Tabs
                        activeKey={activeTab}
                        onChange={(key) => {
                            setActiveTab(key);

                            if (key === "chat") {
                                setChatUnread(0);
                            }
                        }}
                        size="large"
                        items={[
                            {
                                key: "info",
                                label: (
                                    <Space>
                                        <BookOutlined />
                                        Thông tin lớp & tài liệu
                                    </Space>
                                ),
                                children: (
                                    <Space
                                        direction="vertical"
                                        size={20}
                                        style={{ width: "100%" }}
                                    >
                                        <Row gutter={[20, 20]}>
                                            <Col xs={24} lg={16}>
                                                <Card
                                                    title="Thông tin lớp học"
                                                    style={{ borderRadius: 20 }}
                                                >
                                                    <Descriptions
                                                        column={1}
                                                        bordered
                                                    >
                                                        <Descriptions.Item
                                                            label={
                                                                <Space>
                                                                    <BookOutlined />
                                                                    Môn học
                                                                </Space>
                                                            }
                                                        >
                                                            {subject.name} -{" "}
                                                            {subject.code}
                                                        </Descriptions.Item>

                                                        <Descriptions.Item
                                                            label={
                                                                <Space>
                                                                    <TeamOutlined />
                                                                    Lớp hành
                                                                    chính
                                                                </Space>
                                                            }
                                                        >
                                                            {course.adminClass
                                                                ? `${course.adminClass.name} (${course.adminClass.code})`
                                                                : "Chưa có"}
                                                        </Descriptions.Item>

                                                        <Descriptions.Item
                                                            label={
                                                                <Space>
                                                                    <UserOutlined />
                                                                    Giáo viên
                                                                </Space>
                                                            }
                                                        >
                                                            {teacher?.user
                                                                ?.name ||
                                                                teacher?.name ||
                                                                "Chưa có"}
                                                        </Descriptions.Item>

                                                        <Descriptions.Item
                                                            label={
                                                                <Space>
                                                                    <CalendarOutlined />
                                                                    Học kỳ
                                                                </Space>
                                                            }
                                                        >
                                                            {
                                                                course.term
                                                                    ?.semester
                                                            }{" "}
                                                            -{" "}
                                                            {course.term?.year}
                                                        </Descriptions.Item>

                                                        <Descriptions.Item label="Trạng thái">
                                                            <Tag
                                                                color={
                                                                    course.status ===
                                                                    "OPEN"
                                                                        ? "green"
                                                                        : "red"
                                                                }
                                                            >
                                                                {statusTextMap[
                                                                    course
                                                                        .status
                                                                ] ||
                                                                    course.status}
                                                            </Tag>
                                                        </Descriptions.Item>
                                                    </Descriptions>
                                                </Card>
                                            </Col>

                                            <Col xs={24} lg={8}>
                                                <Card
                                                    title="Lịch học"
                                                    style={{ borderRadius: 20 }}
                                                >
                                                    <Space
                                                        direction="vertical"
                                                        size={12}
                                                        style={{
                                                            width: "100%",
                                                        }}
                                                    >
                                                        {course.schedules
                                                            ?.length ? (
                                                            course.schedules.map(
                                                                (
                                                                    schedule: any,
                                                                ) => (
                                                                    <Card
                                                                        key={
                                                                            schedule.id
                                                                        }
                                                                        size="small"
                                                                        style={{
                                                                            borderRadius: 16,
                                                                            background:
                                                                                "#f5f8ff",
                                                                        }}
                                                                    >
                                                                        <Space
                                                                            direction="vertical"
                                                                            size={
                                                                                4
                                                                            }
                                                                        >
                                                                            <Text
                                                                                strong
                                                                            >
                                                                                {dayMap[
                                                                                    Number(
                                                                                        schedule.dayOfWeek,
                                                                                    )
                                                                                ] ||
                                                                                    "Không rõ ngày"}
                                                                            </Text>

                                                                            <Text>
                                                                                <ClockCircleOutlined />{" "}
                                                                                Tiết{" "}
                                                                                {
                                                                                    schedule.lessonStart
                                                                                }{" "}
                                                                                -{" "}
                                                                                {
                                                                                    schedule.lessonEnd
                                                                                }
                                                                            </Text>

                                                                            <Text type="secondary">
                                                                                <HomeOutlined />{" "}
                                                                                Phòng:{" "}
                                                                                {schedule
                                                                                    .room
                                                                                    ?.name ||
                                                                                    "Chưa có"}
                                                                            </Text>
                                                                        </Space>
                                                                    </Card>
                                                                ),
                                                            )
                                                        ) : (
                                                            <Empty description="Chưa có lịch học" />
                                                        )}
                                                    </Space>
                                                </Card>
                                            </Col>
                                        </Row>

                                        <Card
                                            title={
                                                <Space>
                                                    <UploadOutlined />
                                                    Tài liệu lớp học
                                                </Space>
                                            }
                                            style={{ borderRadius: 20 }}
                                        >
                                            <Table
                                                rowKey="id"
                                                columns={documentColumns}
                                                dataSource={documents}
                                                pagination={false}
                                                scroll={{ x: 900 }}
                                                locale={{
                                                    emptyText: (
                                                        <Empty description="Giáo viên chưa upload tài liệu" />
                                                    ),
                                                }}
                                            />
                                        </Card>
                                    </Space>
                                ),
                            },
                            {
                                key: "students",
                                label: (
                                    <Space>
                                        <TeamOutlined />
                                        Danh sách sinh viên
                                    </Space>
                                ),
                                children: (
                                    <Card
                                        title={
                                            <Space>
                                                <TeamOutlined />
                                                Danh sách sinh viên
                                            </Space>
                                        }
                                        extra={
                                            <Text type="secondary">
                                                {students.length} sinh viên
                                            </Text>
                                        }
                                        style={{ borderRadius: 20 }}
                                    >
                                        <Table
                                            rowKey="id"
                                            columns={studentColumns}
                                            dataSource={students}
                                            pagination={{
                                                pageSize: 10,
                                                showSizeChanger: false,
                                            }}
                                        />
                                    </Card>
                                ),
                            },
                            {
                                key: "chat",
                                label: (
                                    <Badge count={chatUnread} size="small">
                                        <Space>
                                            <MessageOutlined />
                                            Chat room
                                        </Space>
                                    </Badge>
                                ),
                                children: (
                                    <ChatRoomSection
                                        courseOfferingId={course.id}
                                        isActive={activeTab === "chat"}
                                        onSeen={() => setChatUnread(0)}
                                    />
                                ),
                            },
                        ]}
                    />
                </Card>
            </Space>
        </div>
    );
};

export default MyClassDetailPage;
