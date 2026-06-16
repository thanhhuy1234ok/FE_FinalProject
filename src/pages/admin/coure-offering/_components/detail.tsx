import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    App,
    Avatar,
    Badge,
    Button,
    Card,
    Col,
    Descriptions,
    Empty,
    Progress,
    Row,
    Space,
    Spin,
    Statistic,
    Table,
    Tag,
    Typography,
} from "antd";
import {
    ArrowLeftOutlined,
    BookOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    HomeOutlined,
    ReadOutlined,
    ReloadOutlined,
    TeamOutlined,
    UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import {
    getCourseOfferingDetailAPI,
    getLessonByCourseOfferingAPI,
} from "@/services/api";
import { LESSON_TIME_MAP } from "@/types/constans";

const { Title, Text } = Typography;

const DAY_MAP: Record<number, string> = {
    2: "Thứ 2",
    3: "Thứ 3",
    4: "Thứ 4",
    5: "Thứ 5",
    6: "Thứ 6",
    7: "Thứ 7",
    8: "Chủ nhật",
};

const SEMESTER_MAP: Record<string, { label: string; color: string }> = {
    HK1: { label: "Học kỳ 1", color: "blue" },
    HK2: { label: "Học kỳ 2", color: "purple" },
    SUMMER: { label: "Học kỳ hè", color: "orange" },
};

const COURSE_STATUS_MAP: Record<string, { label: string; color: string }> = {
    DRAFT: { label: "Đã tạo", color: "default" },
    WAITING_REGISTRATION: { label: "Chờ đăng ký", color: "gold" },
    OPEN: { label: "Đang mở", color: "green" },
    CLOSED: { label: "Đã đóng", color: "red" },
};

const LESSON_STATUS_MAP: Record<string, { label: string; color: string }> = {
    UPCOMING: { label: "Sắp diễn ra", color: "blue" },
    ONGOING: { label: "Đang học", color: "processing" },
    DONE: { label: "Đã học", color: "green" },
    COMPLETED: { label: "Đã học", color: "green" },
    CANCELLED: { label: "Đã hủy", color: "red" },
};

const formatDate = (value?: string) =>
    value ? dayjs(value).format("DD/MM/YYYY") : "—";

const formatDateTime = (value?: string) =>
    value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "—";

const getLessonRangeText = (start?: number, end?: number) => {
    if (!start || !end) return "—";

    const startTime = LESSON_TIME_MAP[start]?.start;
    const endTime = LESSON_TIME_MAP[end]?.end;

    if (!startTime || !endTime) return `Tiết ${start} - ${end}`;

    return `${startTime} - ${endTime}`;
};

const renderSemesterTag = (semester?: string) => {
    if (!semester) return <Text>—</Text>;

    const config = SEMESTER_MAP[semester];

    return (
        <Tag color={config?.color || "default"}>
            {config?.label || semester}
        </Tag>
    );
};

const renderCourseStatusTag = (status?: string, isActive?: boolean) => {
    const config = status ? COURSE_STATUS_MAP[status] : undefined;

    if (config) {
        return <Tag color={config.color}>{config.label}</Tag>;
    }

    return (
        <Tag color={isActive ? "green" : "default"}>
            {isActive ? "Đang hoạt động" : "Ngưng hoạt động"}
        </Tag>
    );
};

const renderLessonStatusTag = (status?: string) => {
    if (!status) return <Tag>—</Tag>;

    const config = LESSON_STATUS_MAP[status];

    return (
        <Tag color={config?.color || "default"}>{config?.label || status}</Tag>
    );
};

const CourseOfferingDetailPage = () => {
    const { message } = App.useApp();
    const navigate = useNavigate();
    const params = useParams();

    const [loading, setLoading] = useState(false);
    const [loadingLessons, setLoadingLessons] = useState(false);
    const [dataDetail, setDataDetail] = useState<any>(null);
    const [lessons, setLessons] = useState<any[]>([]);

    const [lessonPage, setLessonPage] = useState({
        current: 1,
        pageSize: 10,
    });

    const [studentPage, setStudentPage] = useState({
        current: 1,
        pageSize: 10,
    });

    const courseOfferingId = Number(params?.id);

    const fetchDetail = async () => {
        if (!courseOfferingId) return;

        try {
            setLoading(true);

            const res = await getCourseOfferingDetailAPI(courseOfferingId);
            const detail =
                res?.data?.data ?? res?.data?.result ?? res?.data ?? null;

            setDataDetail(detail);
        } catch (error: any) {
            message.error(
                error?.response?.data?.message ||
                    "Không thể tải chi tiết lớp học phần",
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchLessons = async () => {
        if (!courseOfferingId) return;

        try {
            setLoadingLessons(true);

            const res = await getLessonByCourseOfferingAPI(courseOfferingId);
            const lessonData =
                res?.data?.data?.result ??
                res?.data?.data ??
                res?.data?.result ??
                res?.data ??
                [];

            setLessons(Array.isArray(lessonData) ? lessonData : []);
            setLessonPage((prev) => ({ ...prev, current: 1 }));
        } catch {
            setLessons([]);
        } finally {
            setLoadingLessons(false);
        }
    };

    const fetchData = async () => {
        await Promise.all([fetchDetail(), fetchLessons()]);
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseOfferingId]);

    const subject = dataDetail?.teacherSubject?.subject;
    const teacher = dataDetail?.teacherSubject?.teacher;
    const teacherUser = teacher?.user;
    const term = dataDetail?.term;
    const adminClass = dataDetail?.adminClass;

    const schedules = useMemo(() => dataDetail?.schedules ?? [], [dataDetail]);

    const students = useMemo(() => {
        const registrations = dataDetail?.courseRegistrations ?? [];

        return registrations.map((item: any, index: number) => ({
            id: String(item?.id ?? item?.student?.id ?? index + 1),
            name: item?.student?.user?.name ?? "—",
            email: item?.student?.user?.email ?? "—",
            mssv: item?.student?.mssv ?? "—",
            status: item?.status,
            createdAt: item?.createdAt,
        }));
    }, [dataDetail]);

    const doneLessons = lessons.filter((item) =>
        ["DONE", "COMPLETED"].includes(item?.status),
    ).length;

    const lessonProgress = lessons.length
        ? Math.round((doneLessons / lessons.length) * 100)
        : 0;

    const enrolledCount = students.length;
    const maxStudents = dataDetail?.maxStudents || 0;
    const enrolledPercent = maxStudents
        ? Math.round((enrolledCount / maxStudents) * 100)
        : 0;

    const scheduleColumns = [
        {
            title: "Thứ",
            dataIndex: "dayOfWeek",
            width: 120,
            render: (value: number) => (
                <Tag color="blue">{DAY_MAP[value] || `Thứ ${value}`}</Tag>
            ),
        },
        {
            title: "Tiết học",
            render: (_: any, record: any) => (
                <Space direction="vertical" size={0}>
                    <Text strong>
                        Tiết {record.lessonStart ?? "—"} -{" "}
                        {record.lessonEnd ?? "—"}
                    </Text>
                    <Text type="secondary">
                        {getLessonRangeText(
                            record.lessonStart,
                            record.lessonEnd,
                        )}
                    </Text>
                </Space>
            ),
        },
        {
            title: "Phòng",
            render: (_: any, record: any) => (
                <Space>
                    <HomeOutlined />
                    <Text strong>
                        {record?.room?.code ||
                            record?.room?.name ||
                            `Phòng #${record.roomId || "—"}`}
                    </Text>
                </Space>
            ),
        },
        {
            title: "Thời gian áp dụng",
            render: (_: any, record: any) => (
                <Text type="secondary">
                    {formatDate(record.startDate)} -{" "}
                    {formatDate(record.endDate)}
                </Text>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "isActive",
            width: 130,
            render: (value: boolean) => (
                <Badge
                    status={value ? "success" : "default"}
                    text={value ? "Đang áp dụng" : "Ngưng"}
                />
            ),
        },
    ];

    const lessonColumns = [
        {
            title: "STT",
            width: 70,
            align: "center" as const,
            render: (_: any, __: any, index: number) => {
                const { current, pageSize } = lessonPage;
                return (current - 1) * pageSize + index + 1;
            },
        },
        {
            title: "Ngày học",
            dataIndex: "date",
            render: (value: string, record: any) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{formatDate(value)}</Text>
                    <Text type="secondary">
                        {DAY_MAP[record?.dayOfWeek] || "—"}
                    </Text>
                </Space>
            ),
        },
        {
            title: "Thời gian",
            render: (_: any, record: any) => (
                <Space direction="vertical" size={0}>
                    <Text>
                        Tiết {record.lessonStart ?? "—"} -{" "}
                        {record.lessonEnd ?? "—"}
                    </Text>
                    <Text type="secondary">
                        {getLessonRangeText(
                            record.lessonStart,
                            record.lessonEnd,
                        )}
                    </Text>
                </Space>
            ),
        },
        {
            title: "Phòng",
            render: (_: any, record: any) =>
                record?.room?.code || record?.room?.name || "—",
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            render: renderLessonStatusTag,
        },
    ];

    const studentColumns = [
        {
            title: "STT",
            width: 70,
            align: "center" as const,
            render: (_: any, __: any, index: number) => {
                const { current, pageSize } = studentPage;
                return (current - 1) * pageSize + index + 1;
            },
        },
        {
            title: "Sinh viên",
            render: (_: any, record: any) => (
                <Space>
                    <Avatar icon={<UserOutlined />} />
                    <Space direction="vertical" size={0}>
                        <Text strong>{record.name}</Text>
                        <Text type="secondary">{record.email}</Text>
                    </Space>
                </Space>
            ),
        },
        {
            title: "MSSV",
            dataIndex: "mssv",
            width: 140,
            render: (value: string) => <Tag>{value}</Tag>,
        },
        {
            title: "Ngày đăng ký",
            dataIndex: "createdAt",
            width: 160,
            render: formatDateTime,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            width: 130,
            render: (value: string) => (
                <Tag color={value === "REGISTERED" ? "green" : "red"}>
                    {value === "REGISTERED" ? "Đã đăng ký" : value || "—"}
                </Tag>
            ),
        },
    ];

    if (loading && !dataDetail) {
        return (
            <div
                style={{
                    minHeight: 360,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Spin size="large" />
            </div>
        );
    }

    if (!dataDetail) {
        return (
            <Card>
                <Empty description="Không tìm thấy lớp học phần" />
                <Button
                    icon={<ArrowLeftOutlined />}
                    style={{ marginTop: 16 }}
                    onClick={() => navigate(-1)}
                >
                    Quay lại
                </Button>
            </Card>
        );
    }

    return (
        <Space direction="vertical" size={18} style={{ width: "100%" }}>
            <Card
                style={{
                    borderRadius: 20,
                    overflow: "hidden",
                    background:
                        "linear-gradient(135deg, #eff6ff 0%, #ffffff 45%, #f8fafc 100%)",
                }}
                bodyStyle={{ padding: 24 }}
            >
                <Row gutter={[16, 16]} align="middle" justify="space-between">
                    <Col xs={24} lg={16}>
                        <Space size={16} align="start">
                            <Avatar
                                size={64}
                                icon={<ReadOutlined />}
                                style={{
                                    background: "#1677ff",
                                    boxShadow:
                                        "0 12px 28px rgba(22,119,255,0.25)",
                                }}
                            />

                            <Space direction="vertical" size={6}>
                                <Space wrap>
                                    {renderCourseStatusTag(
                                        dataDetail?.status,
                                        dataDetail?.isActive,
                                    )}
                                    {renderSemesterTag(term?.semester)}
                                </Space>

                                <Title level={3} style={{ margin: 0 }}>
                                    {dataDetail?.code || "Lớp học phần"}
                                </Title>

                                <Text style={{ fontSize: 16 }}>
                                    {subject?.name || "—"}
                                </Text>

                                <Text type="secondary">
                                    Tạo lúc:{" "}
                                    {formatDateTime(dataDetail?.createdAt)}
                                </Text>
                            </Space>
                        </Space>
                    </Col>

                    <Col xs={24} lg={8}>
                        <Row gutter={[8, 8]} justify="end">
                            <Col>
                                <Button
                                    icon={<ArrowLeftOutlined />}
                                    onClick={() => navigate(-1)}
                                >
                                    Quay lại
                                </Button>
                            </Col>
                            <Col>
                                <Button
                                    type="primary"
                                    icon={<ReloadOutlined />}
                                    loading={loading || loadingLessons}
                                    onClick={fetchData}
                                >
                                    Làm mới
                                </Button>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Card>

            <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                    <Card bordered={false} style={{ borderRadius: 18 }}>
                        <Statistic
                            title="Sinh viên đăng ký"
                            value={enrolledCount}
                            suffix={`/ ${maxStudents || "—"}`}
                            prefix={<TeamOutlined />}
                        />
                        <Progress
                            percent={enrolledPercent}
                            size="small"
                            style={{ marginTop: 12 }}
                        />
                    </Card>
                </Col>

                <Col xs={24} md={8}>
                    <Card bordered={false} style={{ borderRadius: 18 }}>
                        <Statistic
                            title="Tổng buổi học"
                            value={lessons.length}
                            prefix={<CalendarOutlined />}
                        />
                        <Text type="secondary">
                            Đã học {doneLessons}/{lessons.length} buổi
                        </Text>
                    </Card>
                </Col>

                <Col xs={24} md={8}>
                    <Card bordered={false} style={{ borderRadius: 18 }}>
                        <Statistic
                            title="Tiến độ môn học"
                            value={lessonProgress}
                            suffix="%"
                            prefix={<ClockCircleOutlined />}
                        />
                        <Progress
                            percent={lessonProgress}
                            size="small"
                            status={
                                lessonProgress >= 100 ? "success" : "active"
                            }
                            style={{ marginTop: 12 }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={15}>
                    <Card
                        title={
                            <Space>
                                <BookOutlined />
                                <span>Thông tin lớp học phần</span>
                            </Space>
                        }
                        style={{ borderRadius: 18 }}
                    >
                        <Descriptions column={1} bordered size="middle">
                            <Descriptions.Item label="Mã lớp học phần">
                                <Text strong>{dataDetail?.code || "—"}</Text>
                            </Descriptions.Item>

                            <Descriptions.Item label="Môn học">
                                <Space direction="vertical" size={0}>
                                    <Text strong>{subject?.name || "—"}</Text>
                                    <Text type="secondary">
                                        {subject?.code || "—"} •{" "}
                                        {subject?.credit ?? "—"} tín chỉ
                                    </Text>
                                </Space>
                            </Descriptions.Item>

                            <Descriptions.Item label="Học kỳ">
                                <Space direction="vertical" size={0}>
                                    <Space>
                                        {renderSemesterTag(term?.semester)}
                                        <Text>
                                            {term?.year
                                                ? `Năm ${term.year}`
                                                : ""}
                                        </Text>
                                    </Space>
                                    <Text type="secondary">
                                        {formatDate(term?.startDate)} -{" "}
                                        {formatDate(term?.endDate)}
                                    </Text>
                                </Space>
                            </Descriptions.Item>

                            <Descriptions.Item label="Lớp hành chính">
                                {adminClass ? (
                                    <Space direction="vertical" size={0}>
                                        <Text strong>
                                            {adminClass?.code || "—"}
                                        </Text>
                                        <Text type="secondary">
                                            {adminClass?.name || "—"}
                                        </Text>
                                    </Space>
                                ) : (
                                    "Không có lớp hành chính"
                                )}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>

                <Col xs={24} lg={9}>
                    <Card
                        title={
                            <Space>
                                <UserOutlined />
                                <span>Giảng viên phụ trách</span>
                            </Space>
                        }
                        style={{ borderRadius: 18 }}
                    >
                        <Space
                            direction="vertical"
                            align="center"
                            style={{ width: "100%", marginBottom: 16 }}
                        >
                            <Avatar size={72} icon={<UserOutlined />} />
                            <Title level={5} style={{ margin: 0 }}>
                                {teacherUser?.name || "—"}
                            </Title>
                            <Text type="secondary">
                                {teacherUser?.email || "—"}
                            </Text>
                        </Space>

                        <Descriptions column={1} bordered size="small">
                            <Descriptions.Item label="Mã GV">
                                {teacher?.msgv || "—"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Học vị">
                                {teacher?.degree || "—"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Chuyên môn">
                                {teacher?.specialization || "—"}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>
            </Row>

            <Card
                title={
                    <Space>
                        <CalendarOutlined />
                        <span>Lịch học cố định</span>
                        <Tag>{schedules.length}</Tag>
                    </Space>
                }
                style={{ borderRadius: 18 }}
            >
                <Table
                    rowKey="id"
                    columns={scheduleColumns}
                    dataSource={schedules}
                    pagination={false}
                    locale={{ emptyText: "Chưa có lịch học" }}
                    scroll={{ x: 900 }}
                />
            </Card>

            <Card
                title={
                    <Space>
                        <ClockCircleOutlined />
                        <span>Danh sách buổi học</span>
                        <Tag>{lessons.length}</Tag>
                    </Space>
                }
                style={{ borderRadius: 18 }}
            >
                <Table
                    rowKey="id"
                    columns={lessonColumns}
                    dataSource={lessons}
                    loading={loadingLessons}
                    pagination={{
                        current: lessonPage.current,
                        pageSize: lessonPage.pageSize,
                        showSizeChanger: false,
                        onChange: (page, pageSize) =>
                            setLessonPage({ current: page, pageSize }),
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} trên ${total} buổi học`,
                    }}
                    locale={{ emptyText: "Chưa có buổi học" }}
                    scroll={{ x: 900 }}
                />
            </Card>

            <Card
                title={
                    <Space>
                        <TeamOutlined />
                        <span>Danh sách sinh viên</span>
                        <Tag>{students.length}</Tag>
                    </Space>
                }
                style={{ borderRadius: 18 }}
            >
                <Table
                    rowKey="id"
                    columns={studentColumns}
                    dataSource={students}
                    pagination={{
                        current: studentPage.current,
                        pageSize: studentPage.pageSize,
                        showSizeChanger: false,
                        onChange: (page, pageSize) =>
                            setStudentPage({ current: page, pageSize }),
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} trên ${total} sinh viên`,
                    }}
                    locale={{ emptyText: "Chưa có sinh viên đăng ký" }}
                    scroll={{ x: 900 }}
                />
            </Card>
        </Space>
    );
};

export default CourseOfferingDetailPage;
