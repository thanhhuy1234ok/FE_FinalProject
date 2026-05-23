import {
    getStudentDashboardSummaryAPI,
    getStudentTodaySchedulesAPI,
    getStudentCourseProgressAPI,
    getStudentLatestGradesAPI,
} from "@/services/api";

import {
    BookOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ReadOutlined,
    StarOutlined,
} from "@ant-design/icons";

import {
    Avatar,
    Button,
    Card,
    Col,
    Empty,
    message,
    Progress,
    Row,
    Space,
    Statistic,
    Table,
    Tag,
    Typography,
} from "antd";

import type { ColumnsType } from "antd/es/table";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

type DashboardSummary = {
    totalCourses: number;
    totalCredits: number;
    gpa: number;
    attendancePercent: number;
};

type TodaySchedule = {
    id: number;
    subject: string;
    code?: string;
    teacher: string;
    room: string;
    time: string;
    status: string;
};

type CourseProgress = {
    id: number;
    subject: string;
    code: string;
    teacher: string;
    totalLessons: number;
    completedLessons: number;
    progress: number;
};

type LatestGrade = {
    id: number;
    subject: string;
    code: string;
    attendanceScore: number;
    midtermScore: number;
    finalScore: number;
    totalScore: number;
    letterGrade?: string | null;
    isPassed: boolean;
};

const StudentDashboardPage = () => {
    const navigate = useNavigate();

    const [summary, setSummary] = useState<DashboardSummary>({
        totalCourses: 0,
        totalCredits: 0,
        gpa: 0,
        attendancePercent: 0,
    });

    const [todaySchedules, setTodaySchedules] = useState<TodaySchedule[]>([]);
    const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
    const [latestGrades, setLatestGrades] = useState<LatestGrade[]>([]);

    const [loadingSummary, setLoadingSummary] = useState(false);
    const [loadingSchedules, setLoadingSchedules] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(false);
    const [loadingGrades, setLoadingGrades] = useState(false);

    const fetchSummary = async () => {
        try {
            setLoadingSummary(true);

            const res = await getStudentDashboardSummaryAPI();

            setSummary(res.data?.data || res.data);
        } catch (error) {
            console.log(error);
            message.error("Không tải được tổng quan sinh viên");
        } finally {
            setLoadingSummary(false);
        }
    };

    const fetchTodaySchedules = async () => {
        try {
            setLoadingSchedules(true);

            const res = await getStudentTodaySchedulesAPI();

            setTodaySchedules(res.data?.data || res.data || []);
        } catch (error) {
            console.log(error);
            message.error("Không tải được lịch học hôm nay");
        } finally {
            setLoadingSchedules(false);
        }
    };

    const fetchCourseProgress = async () => {
        try {
            setLoadingProgress(true);

            const res = await getStudentCourseProgressAPI();

            setCourseProgress(res.data?.data || res.data || []);
        } catch (error) {
            console.log(error);
            message.error("Không tải được tiến độ học tập");
        } finally {
            setLoadingProgress(false);
        }
    };

    const fetchLatestGrades = async () => {
        try {
            setLoadingGrades(true);

            const res = await getStudentLatestGradesAPI();

            setLatestGrades(res.data?.data || res.data || []);
        } catch (error) {
            console.log(error);
            message.error("Không tải được điểm số");
        } finally {
            setLoadingGrades(false);
        }
    };

    useEffect(() => {
        fetchSummary();
        fetchTodaySchedules();
        fetchCourseProgress();
        fetchLatestGrades();
    }, []);

    const nextSchedule = useMemo(() => {
        return todaySchedules.find(
            (item) =>
                item.status === "Đang diễn ra" || item.status === "Sắp tới",
        );
    }, [todaySchedules]);

    const gradeColumns: ColumnsType<LatestGrade> = [
        {
            title: "Môn học",
            dataIndex: "subject",
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{record.subject}</Text>
                    <Text type="secondary">{record.code}</Text>
                </Space>
            ),
        },
        {
            title: "QT",
            dataIndex: "attendanceScore",
            align: "center",
        },
        {
            title: "GK",
            dataIndex: "midtermScore",
            align: "center",
        },
        {
            title: "CK",
            dataIndex: "finalScore",
            align: "center",
        },
        {
            title: "Tổng",
            dataIndex: "totalScore",
            align: "center",
            render: (value) => <Text strong>{value}</Text>,
        },
        {
            title: "Xếp loại",
            dataIndex: "letterGrade",
            align: "center",
            render: (_, record) => (
                <Tag color={record.isPassed ? "green" : "red"}>
                    {record.letterGrade || "N/A"}
                </Tag>
            ),
        },
    ];

    return (
        <div>
            <Card
                bordered={false}
                loading={loadingSummary}
                style={{
                    borderRadius: 24,
                    marginBottom: 24,
                    background:
                        "linear-gradient(135deg, #0f172a 0%, #2563eb 55%, #14b8a6 100%)",
                    color: "#fff",
                    overflow: "hidden",
                }}
                bodyStyle={{ padding: 28 }}
            >
                <Row justify="space-between" align="middle" gutter={[24, 24]}>
                    <Col xs={24} lg={15}>
                        <Tag color="cyan" style={{ marginBottom: 12 }}>
                            Student Dashboard
                        </Tag>

                        <Title level={2} style={{ color: "#fff" }}>
                            Chào mừng quay lại, Sinh viên
                        </Title>

                        <Text style={{ color: "rgba(255,255,255,0.82)" }}>
                            Hôm nay bạn có {todaySchedules.length} lịch học.
                            Theo dõi lịch học, điểm số và tiến độ học tập của
                            bạn tại đây.
                        </Text>

                        <div style={{ marginTop: 20 }}>
                            <Button
                                type="primary"
                                size="large"
                                icon={<CalendarOutlined />}
                                onClick={() => navigate("/timetable")}
                            >
                                Xem thời khóa biểu
                            </Button>
                        </div>
                    </Col>

                    <Col xs={24} lg={8}>
                        <Card
                            bordered={false}
                            style={{
                                borderRadius: 20,
                                background: "rgba(255,255,255,0.14)",
                                backdropFilter: "blur(12px)",
                            }}
                        >
                            <Space align="center">
                                <Avatar
                                    size={64}
                                    style={{
                                        background: "#fff",
                                        color: "#1677ff",
                                        fontWeight: 700,
                                    }}
                                >
                                    SV
                                </Avatar>

                                <div>
                                    <Text style={{ color: "#fff" }} strong>
                                        Lịch học tiếp theo
                                    </Text>

                                    <Title
                                        level={4}
                                        style={{
                                            color: "#fff",
                                            margin: "4px 0",
                                        }}
                                    >
                                        {nextSchedule?.time || "Không có lịch"}
                                    </Title>

                                    <Text style={{ color: "#e0f2fe" }}>
                                        {nextSchedule
                                            ? `${nextSchedule.subject} - ${nextSchedule.room}`
                                            : "Hôm nay chưa có lịch học"}
                                    </Text>
                                </div>
                            </Space>
                        </Card>
                    </Col>
                </Row>
            </Card>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <DashboardStatCard
                        icon={<BookOutlined />}
                        title="Môn đang học"
                        value={summary.totalCourses}
                        color="#1677ff"
                    />
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <DashboardStatCard
                        icon={<ReadOutlined />}
                        title="Tổng tín chỉ"
                        value={summary.totalCredits}
                        color="#722ed1"
                    />
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <DashboardStatCard
                        icon={<CheckCircleOutlined />}
                        title="Chuyên cần"
                        value={summary.attendancePercent}
                        suffix="%"
                        color="#52c41a"
                    />
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <DashboardStatCard
                        icon={<StarOutlined />}
                        title="GPA hiện tại"
                        value={summary.gpa}
                        precision={2}
                        color="#faad14"
                    />
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                <Col xs={24} xl={15}>
                    <Card
                        title="Lịch học hôm nay"
                        bordered={false}
                        loading={loadingSchedules}
                        style={{ borderRadius: 20 }}
                    >
                        {todaySchedules.length ? (
                            <Space
                                direction="vertical"
                                size={14}
                                style={{ width: "100%" }}
                            >
                                {todaySchedules.map((item) => (
                                    <ScheduleCard key={item.id} item={item} />
                                ))}
                            </Space>
                        ) : (
                            <Empty description="Không có lịch học hôm nay" />
                        )}
                    </Card>
                </Col>

                <Col xs={24} xl={9}>
                    <Card
                        title="Tổng quan điểm danh"
                        bordered={false}
                        style={{ borderRadius: 20, height: "100%" }}
                    >
                        <div style={{ textAlign: "center", padding: 12 }}>
                            <Progress
                                type="circle"
                                percent={summary.attendancePercent}
                                size={170}
                                strokeLinecap="round"
                            />

                            <Title level={4} style={{ marginTop: 20 }}>
                                Tỷ lệ chuyên cần
                            </Title>

                            <Text type="secondary">
                                Cố gắng duy trì trên 80% để đủ điều kiện thi.
                            </Text>
                        </div>
                    </Card>
                </Col>

                <Col xs={24}>
                    <Card
                        title="Tiến độ học tập"
                        bordered={false}
                        loading={loadingProgress}
                        style={{ borderRadius: 20 }}
                    >
                        {courseProgress.length ? (
                            <Row gutter={[16, 16]}>
                                {courseProgress.map((course) => (
                                    <Col xs={24} md={12} xl={8} key={course.id}>
                                        <CourseProgressCard course={course} />
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            <Empty description="Chưa có tiến độ học tập" />
                        )}
                    </Card>
                </Col>

                <Col xs={24}>
                    <Card
                        title="Điểm số gần đây"
                        bordered={false}
                        loading={loadingGrades}
                        style={{ borderRadius: 20 }}
                    >
                        <Table
                            rowKey="id"
                            columns={gradeColumns}
                            dataSource={latestGrades}
                            pagination={false}
                            scroll={{ x: 800 }}
                            locale={{
                                emptyText: "Chưa có điểm số",
                            }}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

type StatCardProps = {
    icon: React.ReactNode;
    title: string;
    value: number;
    color: string;
    suffix?: string;
    precision?: number;
};

const DashboardStatCard = ({
    icon,
    title,
    value,
    color,
    suffix,
    precision,
}: StatCardProps) => {
    return (
        <Card
            bordered={false}
            style={{
                borderRadius: 20,
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
            }}
            bodyStyle={{ padding: 20 }}
        >
            <Space align="center" size={16}>
                <div
                    style={{
                        width: 52,
                        height: 52,
                        borderRadius: 16,
                        background: `${color}18`,
                        color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 24,
                    }}
                >
                    {icon}
                </div>

                <Statistic
                    title={title}
                    value={value}
                    suffix={suffix}
                    precision={precision}
                />
            </Space>
        </Card>
    );
};

const ScheduleCard = ({ item }: { item: TodaySchedule }) => {
    const isActive = item.status === "Đang diễn ra";
    const isDone = item.status === "Đã kết thúc";

    return (
        <div
            style={{
                padding: 16,
                borderRadius: 18,
                background: isActive ? "#eff6ff" : "#fafafa",
                border: isActive ? "1px solid #91caff" : "1px solid #f0f0f0",
            }}
        >
            <Row justify="space-between" align="middle" gutter={[16, 16]}>
                <Col xs={24} md={14}>
                    <Space>
                        <div
                            style={{
                                width: 46,
                                height: 46,
                                borderRadius: 14,
                                background: isActive ? "#1677ff" : "#d9d9d9",
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 20,
                            }}
                        >
                            {isActive ? (
                                <CheckCircleOutlined />
                            ) : (
                                <ClockCircleOutlined />
                            )}
                        </div>

                        <div>
                            <Text strong style={{ fontSize: 16 }}>
                                {item.subject}
                            </Text>

                            <br />

                            <Text type="secondary">
                                {item.teacher} • {item.room}
                            </Text>
                        </div>
                    </Space>
                </Col>

                <Col xs={24} md={10}>
                    <Space
                        direction="vertical"
                        align="end"
                        size={4}
                        style={{ width: "100%" }}
                    >
                        <Tag
                            color={
                                isActive ? "blue" : isDone ? "default" : "gold"
                            }
                        >
                            {item.status}
                        </Tag>

                        <Text strong>{item.time}</Text>
                    </Space>
                </Col>
            </Row>
        </div>
    );
};

const CourseProgressCard = ({ course }: { course: CourseProgress }) => {
    return (
        <Card
            bordered={false}
            style={{
                borderRadius: 18,
                background: "#fafafa",
                border: "1px solid #f0f0f0",
            }}
        >
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <Space align="center">
                    <Avatar
                        shape="square"
                        size={48}
                        style={{
                            borderRadius: 14,
                            background: "#1677ff",
                        }}
                    >
                        {course.code?.slice(0, 2) || "MH"}
                    </Avatar>

                    <div>
                        <Text strong>{course.subject}</Text>

                        <br />

                        <Text type="secondary">
                            {course.code} • {course.teacher}
                        </Text>
                    </div>
                </Space>

                <Row justify="space-between">
                    <Text type="secondary">Buổi đã học</Text>

                    <Text strong>
                        {course.completedLessons}/{course.totalLessons}
                    </Text>
                </Row>

                <div>
                    <Row justify="space-between">
                        <Text type="secondary">Tiến độ môn học</Text>

                        <Text strong>{course.progress}%</Text>
                    </Row>

                    <Progress
                        percent={course.progress}
                        showInfo={false}
                        strokeLinecap="round"
                    />
                </div>
            </Space>
        </Card>
    );
};

export default StudentDashboardPage;
