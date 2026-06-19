import { useEffect, useMemo, useState } from "react";
import {
    Avatar,
    Button,
    Card,
    Col,
    Descriptions,
    Empty,
    Modal,
    Progress,
    Row,
    Space,
    Spin,
    Table,
    Tag,
    Typography,
    message,
} from "antd";
import {
    ArrowLeftOutlined,
    BookOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    EnvironmentOutlined,
    QrcodeOutlined,
    TeamOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import {
    createAttendanceQrAPI,
    getTeacherLessonDetailAPI,
    getTeacherLessonStudentsAPI,
    markLessonAttendanceManualAPI,
} from "@/services/api";
import { LESSON_TIME_MAP } from "@/types/constans";

const { Title, Text } = Typography;

type TLessonStatus =
    | "UPCOMING"
    | "ONGOING"
    | "COMPLETED"
    | "CANCEL_REQUESTED"
    | "CANCELLED";

type TLessonDetail = {
    id: number;
    date: string;
    dayOfWeek: number;
    lessonStart: number;
    lessonEnd: number;
    status: TLessonStatus;
    room: {
        id: number;
        name: string;
    } | null;
    courseOffering: {
        id: number;
        code: string;
        subject: {
            id: number;
            code: string;
            name: string;
            credit?: number;
        } | null;
        teacher?: {
            id: number;
            name?: string | null;
        } | null;
        term?: {
            id: number;
            semester: string;
            year: number;
        } | null;
    } | null;
};

type TLessonStudent = {
    registrationId: number;
    student: {
        id: number;
        userId?: string;
        mssv?: string;
        code?: string;
        name?: string | null;
        email?: string | null;
    };
    attendance?: {
        id?: number;
        status?: "PRESENT" | "ABSENT" | "LATE" | "NOT_ATTENDED";
        checkedAt?: string | null;
        method?: "QR" | "MANUAL";
    } | null;
};

const dayMap: Record<number, string> = {
    1: "Chủ nhật",
    2: "Thứ 2",
    3: "Thứ 3",
    4: "Thứ 4",
    5: "Thứ 5",
    6: "Thứ 6",
    7: "Thứ 7",
};

const getLessonTimeText = (start?: number, end?: number) => {
    if (!start || !end) return "Chưa có thời gian";

    const startTime = LESSON_TIME_MAP[start]?.start;
    const endTime = LESSON_TIME_MAP[end]?.end;

    if (!startTime || !endTime) return `Tiết ${start} - ${end}`;

    return `${startTime} - ${endTime}`;
};

const getProgressPercent = (lesson: TLessonDetail) => {
    if (lesson.status === "COMPLETED") return 100;
    if (lesson.status !== "ONGOING") return 0;

    const start = LESSON_TIME_MAP[lesson.lessonStart]?.start;
    const end = LESSON_TIME_MAP[lesson.lessonEnd]?.end;

    if (!start || !end) return 0;

    const startAt = dayjs(`${lesson.date} ${start}`, "YYYY-MM-DD HH:mm");
    const endAt = dayjs(`${lesson.date} ${end}`, "YYYY-MM-DD HH:mm");
    const now = dayjs();

    const total = endAt.diff(startAt);
    const passed = now.diff(startAt);

    return Math.min(100, Math.max(0, Math.floor((passed / total) * 100)));
};

const getStatusMeta = (status?: TLessonStatus) => {
    switch (status) {
        case "ONGOING":
            return {
                label: "Đang dạy",
                color: "processing",
                bg: "#e6f4ff",
                border: "#69b1ff",
                title: "Lớp đang mở",
                desc: "Bạn có thể vào lớp và thực hiện điểm danh.",
            };

        case "COMPLETED":
            return {
                label: "Đã kết thúc",
                color: "green",
                bg: "#f6ffed",
                border: "#b7eb8f",
                title: "Buổi học đã kết thúc",
                desc: "Không thể vào lớp sau khi buổi học kết thúc.",
            };

        case "CANCEL_REQUESTED":
            return {
                label: "Chờ duyệt hủy",
                color: "orange",
                bg: "#fff7e6",
                border: "#ffd591",
                title: "Đang chờ admin xử lý",
                desc: "Yêu cầu hủy lớp đã được gửi và đang chờ duyệt.",
            };

        case "CANCELLED":
            return {
                label: "Đã hủy",
                color: "red",
                bg: "#fff1f0",
                border: "#ffa39e",
                title: "Buổi học đã bị hủy",
                desc: "Buổi học này không còn hoạt động.",
            };

        case "UPCOMING":
        default:
            return {
                label: "Chưa mở",
                color: "default",
                bg: "#fafafa",
                border: "#f0f0f0",
                title: "Chưa tới giờ mở lớp",
                desc: "Lớp chỉ mở khi trạng thái là Đang dạy.",
            };
    }
};

const renderAttendanceTag = (status?: string) => {
    switch (status) {
        case "PRESENT":
            return <Tag color="green">Có mặt</Tag>;

        case "ABSENT":
            return <Tag color="red">Vắng</Tag>;

        case "LATE":
            return <Tag color="orange">Đi muộn</Tag>;

        case "NOT_ATTENDED":
        default:
            return <Tag>Chưa điểm danh</Tag>;
    }
};

const TeacherLessonDetailPage = () => {
    const { lessonId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [lesson, setLesson] = useState<TLessonDetail | null>(null);
    const [now, setNow] = useState(dayjs());

    const [students, setStudents] = useState<TLessonStudent[]>([]);
    const [studentLoading, setStudentLoading] = useState(false);
    const [qrOpen, setQrOpen] = useState(false);
    const [qrLoading, setQrLoading] = useState(false);
    const [qrData, setQrData] = useState<{
        token: string;
        expiredAt: number;
        qrImage: string;
    } | null>(null);

    const handleOpenQr = async () => {
        try {
            setQrOpen(true);
            setQrLoading(true);
            setQrData(null);

            const location = await getCurrentLocation();

            const res = await createAttendanceQrAPI(Number(lessonId), {
                latitude: location.latitude,
                longitude: location.longitude,
            });

            const result = res?.data?.data ?? res?.data?.result ?? res?.data;

            setQrData(result);
        } catch (error: any) {
            message.error(
                error?.response?.data?.message || "Không tạo được mã QR",
            );
            setQrOpen(false);
        } finally {
            setQrLoading(false);
        }
    };

    const fetchLessonStudents = async (id: number) => {
        try {
            setStudentLoading(true);

            const res = await getTeacherLessonStudentsAPI(id);

            const result =
                res?.data?.result ??
                res?.data?.data?.result ??
                res?.data?.data ??
                [];

            setStudents(Array.isArray(result) ? result : []);
        } catch (error: any) {
            message.error(
                error?.response?.data?.message ||
                    "Không thể tải danh sách sinh viên",
            );
            setStudents([]);
        } finally {
            setStudentLoading(false);
        }
    };

    const fetchLessonDetail = async (id: number) => {
        try {
            setLoading(true);

            const res = await getTeacherLessonDetailAPI(id);

            const result =
                res?.data?.result ??
                res?.data?.data?.result ??
                res?.data?.data ??
                res?.data ??
                null;

            setLesson(result);
        } catch (error: any) {
            message.error(
                error?.response?.data?.message ||
                    "Không thể tải chi tiết buổi học",
            );
            setLesson(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const id = Number(lessonId);

        if (!id) return;

        fetchLessonDetail(id);
        fetchLessonStudents(id);
    }, [lessonId]);

    useEffect(() => {
        const timer = setInterval(() => {
            setNow(dayjs());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const statusMeta = useMemo(() => {
        return getStatusMeta(lesson?.status);
    }, [lesson?.status]);

    const progressPercent = useMemo(() => {
        if (!lesson) return 0;
        return getProgressPercent(lesson);
    }, [lesson, now]);

    const attendanceSummary = useMemo(() => {
        const present = students.filter(
            (item) => item.attendance?.status === "PRESENT",
        ).length;

        const absent = students.filter(
            (item) => item.attendance?.status === "ABSENT",
        ).length;

        const late = students.filter(
            (item) => item.attendance?.status === "LATE",
        ).length;

        const notAttended = students.length - present - absent - late;

        return {
            total: students.length,
            present,
            absent,
            late,
            notAttended,
        };
    }, [students]);
    const isAttended = (record: TLessonStudent) => {
        return (
            record.attendance &&
            record.attendance.status &&
            record.attendance.status !== "NOT_ATTENDED"
        );
    };

    const getCurrentLocation = (): Promise<{
        latitude?: number;
        longitude?: number;
    }> => {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                resolve({});
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                () => {
                    resolve({});
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                },
            );
        });
    };

    const handleMarkAllPresent = async () => {
        if (!lesson) return;

        if (lesson.status !== "ONGOING") {
            message.warning("Chỉ điểm danh khi lớp đang diễn ra");
            return;
        }

        const notAttended = students.filter(
            (s) => !s.attendance || s.attendance.status === "NOT_ATTENDED",
        );

        if (notAttended.length === 0) {
            message.info("Tất cả sinh viên đã được điểm danh");
            return;
        }

        try {
            await Promise.all(
                notAttended.map((student) =>
                    markLessonAttendanceManualAPI(lesson.id, {
                        registrationId: student.registrationId,
                        status: "PRESENT",
                    }),
                ),
            );

            // 🔥 update UI ngay
            setStudents((prev) =>
                prev.map((item) => {
                    if (
                        !item.attendance ||
                        item.attendance.status === "NOT_ATTENDED"
                    ) {
                        return {
                            ...item,
                            attendance: {
                                ...item.attendance,
                                status: "PRESENT",
                                method: "MANUAL",
                                checkedAt: new Date().toISOString(),
                            },
                        };
                    }
                    return item;
                }),
            );

            message.success(`Đã điểm danh ${notAttended.length} sinh viên`);

            // optional: sync lại từ BE
            fetchLessonStudents(lesson.id);
        } catch (error: any) {
            message.error(
                error?.response?.data?.message ||
                    "Điểm danh hàng loạt thất bại",
            );
        }
    };

    const handleMarkAttendance = async (
        record: TLessonStudent,
        status: "PRESENT" | "ABSENT" | "LATE",
    ) => {
        if (!lesson) return;

        if (lesson.status !== "ONGOING") {
            message.warning("Chỉ được điểm danh khi lớp đang diễn ra");
            return;
        }

        try {
            await markLessonAttendanceManualAPI(lesson.id, {
                registrationId: record.registrationId,
                status,
            });

            message.success("Điểm danh thành công");
            fetchLessonStudents(lesson.id);
        } catch (error: any) {
            message.error(
                error?.response?.data?.message ||
                    "Không thể điểm danh sinh viên",
            );
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: 60 }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!lesson) {
        return (
            <Card bordered={false} style={{ borderRadius: 20 }}>
                <Empty description="Không tìm thấy buổi học" />
            </Card>
        );
    }

    return (
        <div>
            <Card
                bordered={false}
                style={{
                    borderRadius: 24,
                    marginBottom: 20,
                    background:
                        "linear-gradient(135deg, #0f172a 0%, #1d4ed8 58%, #06b6d4 100%)",
                    overflow: "hidden",
                }}
                bodyStyle={{ padding: 24 }}
            >
                <Row justify="space-between" align="middle" gutter={[24, 24]}>
                    <Col xs={24} lg={14}>
                        <Space
                            direction="vertical"
                            size={18}
                            style={{ width: "100%" }}
                        >
                            <Button
                                icon={<ArrowLeftOutlined />}
                                onClick={() => navigate(-1)}
                                style={{
                                    width: "fit-content",
                                    borderRadius: 10,
                                }}
                            >
                                Quay lại
                            </Button>

                            <Space align="center" size={16}>
                                <Avatar
                                    size={72}
                                    shape="square"
                                    style={{
                                        borderRadius: 22,
                                        background: "#fff",
                                        color: "#1677ff",
                                        fontWeight: 800,
                                        fontSize: 22,
                                        boxShadow:
                                            "0 10px 24px rgba(0,0,0,0.14)",
                                    }}
                                >
                                    {lesson.courseOffering?.subject?.code?.slice(
                                        0,
                                        2,
                                    ) || "LS"}
                                </Avatar>

                                <div>
                                    <Tag color={statusMeta.color}>
                                        {statusMeta.label}
                                    </Tag>

                                    <Title
                                        level={2}
                                        style={{
                                            margin: "8px 0 4px",
                                            color: "#fff",
                                            lineHeight: 1.15,
                                        }}
                                    >
                                        {lesson.courseOffering?.subject?.name ||
                                            "Chưa có tên môn"}
                                    </Title>

                                    <Text style={{ color: "#dbeafe" }}>
                                        {lesson.courseOffering?.code ||
                                            "Chưa có mã lớp"}{" "}
                                        •{" "}
                                        {lesson.courseOffering?.term
                                            ? `${lesson.courseOffering.term.semester} - ${lesson.courseOffering.term.year}`
                                            : "Chưa có học kỳ"}
                                    </Text>
                                </div>
                            </Space>
                        </Space>
                    </Col>

                    <Col xs={24} lg={10}>
                        <Card
                            bordered={false}
                            style={{
                                borderRadius: 20,
                                background: "rgba(255,255,255,0.16)",
                                backdropFilter: "blur(10px)",
                            }}
                            bodyStyle={{ padding: 20 }}
                        >
                            <Space
                                direction="vertical"
                                size={12}
                                style={{ width: "100%" }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        gap: 12,
                                    }}
                                >
                                    <Text strong style={{ color: "#fff" }}>
                                        Tiến độ buổi học
                                    </Text>

                                    <Tag color={statusMeta.color}>
                                        {statusMeta.label}
                                    </Tag>
                                </div>

                                <Progress
                                    percent={progressPercent}
                                    strokeLinecap="round"
                                    showInfo={false}
                                />

                                <Button
                                    type="primary"
                                    block
                                    size="large"
                                    disabled={lesson.status !== "ONGOING"}
                                >
                                    Vào lớp dạy
                                </Button>
                            </Space>
                        </Card>
                    </Col>
                </Row>
            </Card>

            <Row gutter={[20, 20]}>
                <Col xs={24} lg={16}>
                    <Card
                        title="Thông tin buổi học"
                        bordered={false}
                        style={{ borderRadius: 20 }}
                    >
                        <Descriptions column={1} bordered>
                            <Descriptions.Item label="Môn học">
                                <BookOutlined />{" "}
                                {lesson.courseOffering?.subject?.name ||
                                    "Chưa có"}
                            </Descriptions.Item>

                            <Descriptions.Item label="Mã môn">
                                {lesson.courseOffering?.subject?.code || "N/A"}
                            </Descriptions.Item>

                            <Descriptions.Item label="Ngày dạy">
                                <CalendarOutlined /> {dayMap[lesson.dayOfWeek]}{" "}
                                - {dayjs(lesson.date).format("DD/MM/YYYY")}
                            </Descriptions.Item>

                            <Descriptions.Item label="Thời gian">
                                <ClockCircleOutlined />{" "}
                                {getLessonTimeText(
                                    lesson.lessonStart,
                                    lesson.lessonEnd,
                                )}{" "}
                                — Tiết {lesson.lessonStart} - {lesson.lessonEnd}
                            </Descriptions.Item>

                            <Descriptions.Item label="Phòng học">
                                <EnvironmentOutlined />{" "}
                                {lesson.room?.name || "Chưa có phòng"}
                            </Descriptions.Item>

                            <Descriptions.Item label="Giảng viên">
                                <UserOutlined />{" "}
                                {lesson.courseOffering?.teacher?.name ||
                                    "Chưa có giảng viên"}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card
                        title="Trạng thái"
                        bordered={false}
                        style={{ borderRadius: 20 }}
                    >
                        <div
                            style={{
                                padding: 18,
                                borderRadius: 16,
                                background: statusMeta.bg,
                                border: `1px solid ${statusMeta.border}`,
                                textAlign: "center",
                            }}
                        >
                            <Tag color={statusMeta.color}>
                                {statusMeta.label}
                            </Tag>

                            <Title level={4} style={{ marginTop: 12 }}>
                                {statusMeta.title}
                            </Title>

                            <Text type="secondary">{statusMeta.desc}</Text>

                            <div style={{ marginTop: 14 }}>
                                <Text type="secondary">
                                    Cập nhật lúc: {now.format("HH:mm:ss")}
                                </Text>
                            </div>
                        </div>
                    </Card>
                </Col>

                <Col xs={24}>
                    <Card
                        title={
                            <Space>
                                <TeamOutlined />
                                Danh sách sinh viên
                            </Space>
                        }
                        extra={
                            <Space wrap>
                                <Tag color="blue">
                                    Tổng: {attendanceSummary.total}
                                </Tag>
                                <Tag color="green">
                                    Có mặt: {attendanceSummary.present}
                                </Tag>
                                <Tag color="orange">
                                    Đi muộn: {attendanceSummary.late}
                                </Tag>
                                <Tag color="red">
                                    Vắng: {attendanceSummary.absent}
                                </Tag>

                                <Space wrap>
                                    <Button
                                        type="primary"
                                        onClick={handleMarkAllPresent}
                                        disabled={
                                            lesson.status !== "ONGOING" ||
                                            students.length === 0
                                        }
                                    >
                                        Điểm danh tất cả
                                    </Button>

                                    <Button
                                        type="primary"
                                        icon={<QrcodeOutlined />}
                                        onClick={handleOpenQr}
                                    >
                                        Tạo mã QR
                                    </Button>
                                </Space>
                            </Space>
                        }
                        bordered={false}
                        style={{ borderRadius: 20 }}
                    >
                        <Table
                            rowKey="registrationId"
                            loading={studentLoading}
                            dataSource={students}
                            pagination={false}
                            columns={[
                                {
                                    title: "Mã SV",
                                    render: (_, record: TLessonStudent) =>
                                        record.student?.mssv ||
                                        record.student?.code ||
                                        record.student?.id ||
                                        "N/A",
                                },
                                {
                                    title: "Họ tên",
                                    render: (_, record: TLessonStudent) =>
                                        record.student?.name || "Chưa có tên",
                                },
                                {
                                    title: "Email",
                                    render: (_, record: TLessonStudent) =>
                                        record.student?.email || "N/A",
                                },
                                {
                                    title: "Điểm danh",
                                    render: (_, record: TLessonStudent) =>
                                        renderAttendanceTag(
                                            record.attendance?.status,
                                        ),
                                },
                                {
                                    title: "Thời gian",
                                    render: (_, record: TLessonStudent) =>
                                        record.attendance?.checkedAt
                                            ? dayjs(
                                                  record.attendance.checkedAt,
                                              ).format("HH:mm:ss DD/MM/YYYY")
                                            : "Chưa có",
                                },
                                {
                                    title: "Phương thức",
                                    render: (_, record: TLessonStudent) => {
                                        const method =
                                            record.attendance?.method;

                                        if (method === "QR") {
                                            return <Tag color="blue">QR</Tag>;
                                        }

                                        if (method === "MANUAL") {
                                            return (
                                                <Tag color="purple">
                                                    Thủ công
                                                </Tag>
                                            );
                                        }

                                        return <Tag>Chưa có</Tag>;
                                    },
                                },
                                {
                                    title: "Thao tác",
                                    render: (_, record: TLessonStudent) => {
                                        if (isAttended(record)) {
                                            return (
                                                <Tag color="green">
                                                    Đã điểm danh
                                                </Tag>
                                            );
                                        }

                                        return (
                                            <Space>
                                                <Button
                                                    size="small"
                                                    type="primary"
                                                    disabled={
                                                        lesson.status !==
                                                        "ONGOING"
                                                    }
                                                    onClick={() =>
                                                        handleMarkAttendance(
                                                            record,
                                                            "PRESENT",
                                                        )
                                                    }
                                                >
                                                    Có mặt
                                                </Button>

                                                <Button
                                                    size="small"
                                                    disabled={
                                                        lesson.status !==
                                                        "ONGOING"
                                                    }
                                                    onClick={() =>
                                                        handleMarkAttendance(
                                                            record,
                                                            "LATE",
                                                        )
                                                    }
                                                >
                                                    Đi muộn
                                                </Button>

                                                <Button
                                                    size="small"
                                                    danger
                                                    disabled={
                                                        lesson.status !==
                                                        "ONGOING"
                                                    }
                                                    onClick={() =>
                                                        handleMarkAttendance(
                                                            record,
                                                            "ABSENT",
                                                        )
                                                    }
                                                >
                                                    Vắng
                                                </Button>
                                            </Space>
                                        );
                                    },
                                },
                            ]}
                        />
                    </Card>
                </Col>
            </Row>

            {/* <Modal
                title="Mã QR điểm danh"
                open={qrOpen}
                onCancel={() => setQrOpen(false)}
                footer={null}
                centered
            >
                <div style={{ textAlign: "center", padding: 20 }}>
                    <div
                        style={{
                            width: 260,
                            height: 260,
                            margin: "0 auto",
                            borderRadius: 18,
                            border: "1px dashed #d9d9d9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "#fafafa",
                            overflow: "hidden",
                        }}
                    >
                        {qrLoading ? (
                            <Spin />
                        ) : qrData?.qrImage ? (
                            <img
                                src={qrData.qrImage}
                                alt="QR điểm danh"
                                style={{
                                    width: 240,
                                    height: 240,
                                    objectFit: "contain",
                                }}
                            />
                        ) : (
                            <Space direction="vertical" align="center">
                                <QrcodeOutlined
                                    style={{ fontSize: 64, color: "#1677ff" }}
                                />
                                <Text strong>QR điểm danh</Text>
                            </Space>
                        )}
                    </div>

                    <Title level={5} style={{ marginTop: 18 }}>
                        {lesson.courseOffering?.subject?.name ||
                            lesson.courseOffering?.teacher?.name ||
                            "Buổi học"}
                    </Title>

                    <Text type="secondary">
                        Sinh viên quét mã QR để điểm danh buổi học này.
                    </Text>

                    <div style={{ marginTop: 12 }}>
                        <Tag color={statusMeta.color}>{statusMeta.label}</Tag>
                        <Tag>{dayjs(lesson.date).format("DD/MM/YYYY")}</Tag>
                        <Tag>
                            {getLessonTimeText(
                                lesson.lessonStart,
                                lesson.lessonEnd,
                            )}
                        </Tag>
                    </div>

                    {qrData?.expiredAt && (
                        <div style={{ marginTop: 12 }}>
                            <Text type="danger">
                                QR hết hạn lúc{" "}
                                {dayjs(qrData.expiredAt).format("HH:mm:ss")}
                            </Text>
                        </div>
                    )}
                </div>
            </Modal> */}

            <Modal
                title={null}
                open={qrOpen}
                onCancel={() => setQrOpen(false)}
                footer={null}
                centered
                width={420}
            >
                <div
                    style={{
                        textAlign: "center",
                        padding: 12,
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            marginBottom: 20,
                        }}
                    >
                        <div
                            style={{
                                width: 78,
                                height: 78,
                                borderRadius: 24,
                                margin: "0 auto",
                                background:
                                    "linear-gradient(135deg,#1677ff 0%,#06b6d4 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 10px 30px rgba(22,119,255,0.25)",
                            }}
                        >
                            <QrcodeOutlined
                                style={{
                                    fontSize: 40,
                                    color: "#fff",
                                }}
                            />
                        </div>

                        <Title
                            level={3}
                            style={{
                                marginTop: 16,
                                marginBottom: 4,
                            }}
                        >
                            QR Điểm Danh
                        </Title>

                        <Text type="secondary">
                            Sinh viên quét mã để điểm danh buổi học
                        </Text>
                    </div>

                    {/* QR */}
                    <div
                        style={{
                            width: 280,
                            height: 280,
                            margin: "0 auto",
                            borderRadius: 28,
                            background: "#fff",
                            padding: 16,
                            border: "1px solid #f0f0f0",
                            boxShadow: "0 15px 40px rgba(0,0,0,0.08)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                            position: "relative",
                        }}
                    >
                        {qrLoading ? (
                            <Spin size="large" />
                        ) : qrData?.qrImage ? (
                            <>
                                <img
                                    src={qrData.qrImage}
                                    alt="QR điểm danh"
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "contain",
                                    }}
                                />

                                <div
                                    style={{
                                        position: "absolute",
                                        top: 14,
                                        right: 14,
                                    }}
                                >
                                    <Tag color="blue">LIVE</Tag>
                                </div>
                            </>
                        ) : (
                            <Space direction="vertical" align="center">
                                <QrcodeOutlined
                                    style={{
                                        fontSize: 72,
                                        color: "#1677ff",
                                    }}
                                />

                                <Text strong>Đang tạo QR...</Text>
                            </Space>
                        )}
                    </div>

                    {/* Info */}
                    <div
                        style={{
                            marginTop: 22,
                            padding: 18,
                            borderRadius: 18,
                            background: "#fafafa",
                            border: "1px solid #f0f0f0",
                        }}
                    >
                        <Space direction="vertical" size={10}>
                            <Tag
                                color="processing"
                                style={{
                                    paddingInline: 12,
                                    paddingBlock: 4,
                                    borderRadius: 999,
                                    fontSize: 14,
                                }}
                            >
                                {lesson.courseOffering?.subject?.name ||
                                    "Buổi học"}
                            </Tag>

                            <Space wrap align="center" size={8}>
                                <Tag icon={<CalendarOutlined />}>
                                    {dayjs(lesson.date).format("DD/MM/YYYY")}
                                </Tag>

                                <Tag icon={<ClockCircleOutlined />}>
                                    {getLessonTimeText(
                                        lesson.lessonStart,
                                        lesson.lessonEnd,
                                    )}
                                </Tag>

                                <Tag icon={<EnvironmentOutlined />}>
                                    {lesson.room?.name || "Chưa có phòng"}
                                </Tag>
                            </Space>
                        </Space>
                    </div>

                    {/* Expire */}
                    {qrData?.expiredAt && (
                        <div
                            style={{
                                marginTop: 18,
                                padding: 16,
                                borderRadius: 16,
                                background: "#fff7e6",
                                border: "1px solid #ffd591",
                            }}
                        >
                            <Space direction="vertical" size={4}>
                                <Text strong style={{ color: "#d46b08" }}>
                                    QR sẽ hết hạn lúc
                                </Text>

                                <Title
                                    level={4}
                                    style={{
                                        margin: 0,
                                        color: "#fa8c16",
                                    }}
                                >
                                    {dayjs(qrData.expiredAt).format("HH:mm:ss")}
                                </Title>

                                <Text type="secondary">
                                    Sinh viên cần cùng wifi và gần vị trí lớp
                                    học
                                </Text>
                            </Space>
                        </div>
                    )}

                    {/* Tips */}
                    <div
                        style={{
                            marginTop: 18,
                            textAlign: "left",
                            background: "#f6ffed",
                            border: "1px solid #b7eb8f",
                            borderRadius: 16,
                            padding: 16,
                        }}
                    >
                        <Space direction="vertical" size={8}>
                            <Text strong>Điều kiện điểm danh:</Text>

                            <Text type="secondary">
                                • Sinh viên phải ở gần vị trí tạo QR
                            </Text>

                            <Text type="secondary">
                                • QR chỉ có hiệu lực trong vài phút
                            </Text>
                        </Space>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default TeacherLessonDetailPage;
