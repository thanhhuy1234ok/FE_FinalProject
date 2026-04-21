import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    App,
    Button,
    Card,
    Col,
    Descriptions,
    Empty,
    Row,
    Space,
    Spin,
    Table,
    Tag,
    Typography,
} from "antd";
import {
    ArrowLeftOutlined,
    BookOutlined,
    CalendarOutlined,
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

const { Title, Text } = Typography;

type TTeacherUser = {
    id?: string;
    name?: string;
    email?: string;
};

type TTeacher = {
    id?: number;
    msgv?: string;
    degree?: string;
    specialization?: string;
    user?: TTeacherUser;
};

type TSubject = {
    id?: number;
    code?: string;
    name?: string;
    credit?: number;
};

type TTeacherSubject = {
    id?: number;
    teacher?: TTeacher;
    subject?: TSubject;
};

type TTerm = {
    id?: number;
    year?: number;
    semester?: string;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
};

type TAdminClass = {
    id?: number;
    code?: string;
    name?: string;
    capacity?: number;
};

type TRoom = {
    id?: number;
    code?: string;
    name?: string;
};

type TSchedule = {
    id: number;
    dayOfWeek?: number;
    lessonStart?: number;
    lessonEnd?: number;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
    roomId?: number;
    room?: TRoom;
};

type TLesson = {
    id: number;
    date?: string;
    dayOfWeek?: number;
    lessonStart?: number;
    lessonEnd?: number;
    status?: string;
    room?: TRoom;
    schedule?: {
        id?: number;
    };
};

type TStudentUser = {
    id?: string;
    name?: string;
    email?: string;
};

type TStudent = {
    id?: number | string;
    mssv?: string;
    user?: TStudentUser;
};

type TCourseRegistration = {
    id?: number | string;
    status?: string;
    studentId?: number | string;
    courseOfferingId?: number;
    student?: TStudent;
    createdAt?: string;
    updatedAt?: string;
};

type TStudentScore = {
    id: string;
    name: string;
    mssv: string;
    diemChuyenCan?: number | null;
    diemKiemTra?: number | null;
    diemThi?: number | null;
};

type TCourseOfferingDetail = {
    id: number;
    code?: string;
    name?: string;
    maxStudents?: number;
    enrolledCount?: number;
    isActive?: boolean;
    status?: string;
    createdAt?: string;
    teacherSubject?: TTeacherSubject;
    term?: TTerm;
    adminClass?: TAdminClass;
    schedules?: TSchedule[];
    courseRegistrations?: TCourseRegistration[];
};

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
    DONE: { label: "Đã học", color: "green" },
    CANCELLED: { label: "Đã hủy", color: "red" },
};

const REGISTRATION_STATUS_MAP: Record<
    string,
    { label: string; color: string }
> = {
    REGISTERED: { label: "Đã đăng ký", color: "green" },
    CANCELLED: { label: "Đã hủy", color: "red" },
    PENDING: { label: "Chờ duyệt", color: "gold" },
};

const formatDate = (value?: string) => {
    if (!value) return "—";
    return dayjs(value).format("DD/MM/YYYY");
};

const formatDateTime = (value?: string) => {
    if (!value) return "—";
    return dayjs(value).format("DD/MM/YYYY HH:mm");
};

const renderSemesterTag = (semester?: string) => {
    if (!semester) return <Text>—</Text>;
    const config = SEMESTER_MAP[semester];
    if (!config) return <Tag>{semester}</Tag>;
    return <Tag color={config.color}>{config.label}</Tag>;
};

const renderCourseStatusTag = (status?: string, isActive?: boolean) => {
    if (status && COURSE_STATUS_MAP[status]) {
        const config = COURSE_STATUS_MAP[status];
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
    if (!config) return <Tag>{status}</Tag>;
    return <Tag color={config.color}>{config.label}</Tag>;
};

const renderRegistrationStatusTag = (status?: string) => {
    if (!status) return <Tag>—</Tag>;
    const config = REGISTRATION_STATUS_MAP[status];
    if (!config) return <Tag>{status}</Tag>;
    return <Tag color={config.color}>{config.label}</Tag>;
};

const CourseOfferingDetailPage = () => {
    const { message } = App.useApp();
    const navigate = useNavigate();
    const params = useParams();

    const [loading, setLoading] = useState(false);
    const [loadingLessons, setLoadingLessons] = useState(false);
    const [dataDetail, setDataDetail] = useState<TCourseOfferingDetail | null>(
        null,
    );
    const [lessons, setLessons] = useState<TLesson[]>([]);

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
            console.error(error);
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
            setLessonPage((prev) => ({
                ...prev,
                current: 1,
            }));
        } catch (error: any) {
            console.error(error);
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

    const schedules = useMemo(
        () => dataDetail?.schedules ?? [],
        [dataDetail?.schedules],
    );

    const students = useMemo<TStudentScore[]>(() => {
        const registrations = dataDetail?.courseRegistrations ?? [];

        return registrations.map((item, index) => ({
            id: String(item?.id ?? item?.student?.id ?? index + 1),
            name: item?.student?.user?.name ?? "—",
            mssv: item?.student?.mssv ?? "—",
            diemChuyenCan: null,
            diemKiemTra: null,
            diemThi: null,
        }));
    }, [dataDetail?.courseRegistrations]);

    const scheduleColumns = [
        {
            title: "STT",
            width: 70,
            align: "center" as const,
            render: (_: any, __: TSchedule, index: number) => index + 1,
        },
        {
            title: "Thứ",
            dataIndex: "dayOfWeek",
            key: "dayOfWeek",
            render: (value: number) => DAY_MAP[value] || `Thứ ${value}`,
        },
        {
            title: "Tiết học",
            key: "period",
            render: (_: any, record: TSchedule) =>
                `${record.lessonStart ?? "—"} - ${record.lessonEnd ?? "—"}`,
        },
        {
            title: "Phòng học",
            key: "room",
            render: (_: any, record: TSchedule) =>
                record?.room?.code ||
                record?.room?.name ||
                (record?.roomId ? `Phòng #${record.roomId}` : "—"),
        },
        {
            title: "Từ ngày",
            dataIndex: "startDate",
            key: "startDate",
            render: (value: string) => formatDate(value),
        },
        {
            title: "Đến ngày",
            dataIndex: "endDate",
            key: "endDate",
            render: (value: string) => formatDate(value),
        },
        {
            title: "Trạng thái",
            dataIndex: "isActive",
            key: "isActive",
            render: (value: boolean) => (
                <Tag color={value ? "green" : "default"}>
                    {value ? "Đang áp dụng" : "Ngưng"}
                </Tag>
            ),
        },
    ];

    const lessonColumns = [
        {
            title: "STT",
            width: 70,
            align: "center" as const,
            render: (_text: any, _record: TLesson, index: number) => {
                const { current, pageSize } = lessonPage;
                return <Text>{(current - 1) * pageSize + index + 1}</Text>;
            },
        },
        {
            title: "Ngày học",
            dataIndex: "date",
            key: "date",
            render: (value: string) => formatDate(value),
        },
        {
            title: "Thứ",
            dataIndex: "dayOfWeek",
            key: "dayOfWeek",
            render: (value: number) => DAY_MAP[value] || `Thứ ${value}`,
        },
        {
            title: "Tiết học",
            key: "period",
            render: (_: any, record: TLesson) =>
                `${record.lessonStart ?? "—"} - ${record.lessonEnd ?? "—"}`,
        },
        {
            title: "Phòng học",
            key: "room",
            render: (_: any, record: TLesson) =>
                record?.room?.code || record?.room?.name || "—",
        },
        {
            title: "Lịch gốc",
            key: "schedule",
            render: (_: any, record: TLesson) =>
                record?.schedule?.id ? `Schedule #${record.schedule.id}` : "—",
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (value: string) => renderLessonStatusTag(value),
        },
    ];

    const studentColumns = [
        {
            title: "STT",
            width: 70,
            align: "center" as const,
            render: (_: any, __: TStudentScore, index: number) => {
                const { current, pageSize } = studentPage;
                return <Text>{(current - 1) * pageSize + index + 1}</Text>;
            },
        },
        {
            title: "Họ tên",
            dataIndex: "name",
            key: "name",
            render: (value: string) => value || "—",
        },
        {
            title: "MSSV",
            dataIndex: "mssv",
            key: "mssv",
            render: (value: string) => value || "—",
        },
        {
            title: "Điểm chuyên cần",
            dataIndex: "diemChuyenCan",
            key: "diemChuyenCan",
            align: "center" as const,
            render: (value?: number | null) =>
                value !== null && value !== undefined ? value.toFixed(1) : "—",
        },
        {
            title: "Điểm KT",
            dataIndex: "diemKiemTra",
            key: "diemKiemTra",
            align: "center" as const,
            render: (value?: number | null) =>
                value !== null && value !== undefined ? value.toFixed(1) : "—",
        },
        {
            title: "Điểm thi",
            dataIndex: "diemThi",
            key: "diemThi",
            align: "center" as const,
            render: (value?: number | null) =>
                value !== null && value !== undefined ? value.toFixed(1) : "—",
        },
    ];

    if (loading && !dataDetail) {
        return (
            <div
                style={{
                    minHeight: 300,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
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
                <div style={{ marginTop: 16 }}>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate(-1)}
                    >
                        Quay lại
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Card>
                <Row justify="space-between" align="middle" gutter={[16, 16]}>
                    <Col xs={24} md={16}>
                        <Space direction="vertical" size={4}>
                            <Title level={3} style={{ margin: 0 }}>
                                {dataDetail?.code || "Lớp học phần"}{" "}
                                {dataDetail?.name ? `- ${dataDetail.name}` : ""}
                            </Title>

                            <Space wrap>
                                {renderCourseStatusTag(
                                    dataDetail?.status,
                                    dataDetail?.isActive,
                                )}
                                {dataDetail?.term?.semester &&
                                    renderSemesterTag(
                                        dataDetail?.term?.semester,
                                    )}
                            </Space>

                            <Text type="secondary">
                                Tạo lúc: {formatDateTime(dataDetail?.createdAt)}
                            </Text>
                        </Space>
                    </Col>

                    <Col xs={24} md={8}>
                        <Row justify="end" gutter={[8, 8]}>
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
                                    onClick={fetchData}
                                    loading={loading || loadingLessons}
                                >
                                    Làm mới
                                </Button>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Card>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={14}>
                    <Card title="Thông tin chung">
                        <Descriptions column={1} bordered size="middle">
                            <Descriptions.Item
                                label={
                                    <Space>
                                        <ReadOutlined />
                                        <span>Mã lớp học phần</span>
                                    </Space>
                                }
                            >
                                {dataDetail?.code || "—"}
                            </Descriptions.Item>

                            <Descriptions.Item
                                label={
                                    <Space>
                                        <BookOutlined />
                                        <span>Môn học</span>
                                    </Space>
                                }
                            >
                                <Space direction="vertical" size={0}>
                                    <Text strong>
                                        {dataDetail?.teacherSubject?.subject
                                            ?.name || "—"}
                                    </Text>
                                    <Text type="secondary">
                                        {dataDetail?.teacherSubject?.subject
                                            ?.code || "—"}
                                    </Text>
                                </Space>
                            </Descriptions.Item>

                            <Descriptions.Item
                                label={
                                    <Space>
                                        <BookOutlined />
                                        <span>Số tín chỉ</span>
                                    </Space>
                                }
                            >
                                {dataDetail?.teacherSubject?.subject?.credit ??
                                    "—"}
                            </Descriptions.Item>

                            <Descriptions.Item
                                label={
                                    <Space>
                                        <CalendarOutlined />
                                        <span>Kỳ học</span>
                                    </Space>
                                }
                            >
                                <Space direction="vertical" size={0}>
                                    <span>
                                        {renderSemesterTag(
                                            dataDetail?.term?.semester,
                                        )}{" "}
                                        {dataDetail?.term?.year
                                            ? `- Năm ${dataDetail.term.year}`
                                            : ""}
                                    </span>
                                    <Text type="secondary">
                                        {formatDate(
                                            dataDetail?.term?.startDate,
                                        )}{" "}
                                        -{" "}
                                        {formatDate(dataDetail?.term?.endDate)}
                                    </Text>
                                </Space>
                            </Descriptions.Item>

                            <Descriptions.Item
                                label={
                                    <Space>
                                        <TeamOutlined />
                                        <span>Lớp hành chính</span>
                                    </Space>
                                }
                            >
                                {dataDetail?.adminClass ? (
                                    <Space direction="vertical" size={0}>
                                        <Text strong>
                                            {dataDetail?.adminClass?.code ||
                                                "—"}
                                        </Text>
                                        <Text type="secondary">
                                            {dataDetail?.adminClass?.name ||
                                                "—"}
                                        </Text>
                                    </Space>
                                ) : (
                                    "—"
                                )}
                            </Descriptions.Item>

                            <Descriptions.Item
                                label={
                                    <Space>
                                        <TeamOutlined />
                                        <span>Sĩ số</span>
                                    </Space>
                                }
                            >
                                {students.length}/
                                {dataDetail?.maxStudents ?? "—"}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>

                <Col xs={24} lg={10}>
                    <Card title="Giảng viên phụ trách">
                        <Descriptions column={1} bordered size="middle">
                            <Descriptions.Item
                                label={
                                    <Space>
                                        <UserOutlined />
                                        <span>Họ và tên</span>
                                    </Space>
                                }
                            >
                                {dataDetail?.teacherSubject?.teacher?.user
                                    ?.name || "—"}
                            </Descriptions.Item>

                            <Descriptions.Item label="Email">
                                {dataDetail?.teacherSubject?.teacher?.user
                                    ?.email || "—"}
                            </Descriptions.Item>

                            <Descriptions.Item label="Mã giảng viên">
                                {dataDetail?.teacherSubject?.teacher?.msgv ||
                                    "—"}
                            </Descriptions.Item>

                            <Descriptions.Item label="Học vị">
                                {dataDetail?.teacherSubject?.teacher?.degree ||
                                    "—"}
                            </Descriptions.Item>

                            <Descriptions.Item label="Chuyên môn">
                                {dataDetail?.teacherSubject?.teacher
                                    ?.specialization || "—"}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>
            </Row>

            <Card title={`Danh sách lịch học (${schedules.length})`}>
                <Table<TSchedule>
                    rowKey="id"
                    columns={scheduleColumns}
                    dataSource={schedules}
                    pagination={false}
                    locale={{ emptyText: "Chưa có lịch học" }}
                    scroll={{ x: 900 }}
                />
            </Card>

            <Card title={`Danh sách buổi học (${lessons.length})`}>
                <Table<TLesson>
                    rowKey="id"
                    columns={lessonColumns}
                    dataSource={lessons}
                    loading={loadingLessons}
                    pagination={{
                        current: lessonPage.current,
                        pageSize: lessonPage.pageSize,
                        showSizeChanger: false,
                        onChange: (page, pageSize) => {
                            setLessonPage({
                                current: page,
                                pageSize,
                            });
                        },
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} trên ${total} buổi học`,
                    }}
                    locale={{ emptyText: "Chưa có lesson" }}
                    scroll={{ x: 1000 }}
                />
            </Card>

            <Card
                title={`Danh sách sinh viên đăng ký môn (${students.length})`}
            >
                <Table<TStudentScore>
                    rowKey="id"
                    columns={studentColumns}
                    dataSource={students}
                    pagination={{
                        current: studentPage.current,
                        pageSize: studentPage.pageSize,
                        showSizeChanger: false,
                        onChange: (page, pageSize) => {
                            setStudentPage({
                                current: page,
                                pageSize,
                            });
                        },
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
