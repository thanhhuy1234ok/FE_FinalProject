import {
    getTeacherTodaySchedulesAPI,
    getTeachingCoursesAPI,
    getTeachingSessionsAPI,
} from "@/services/api";
import {
    BookOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    FileTextOutlined,
    TeamOutlined,
} from "@ant-design/icons";
import {
    Avatar,
    Button,
    Card,
    Col,
    DatePicker,
    Divider,
    Empty,
    List,
    message,
    Progress,
    Row,
    Space,
    Statistic,
    Tag,
    Timeline,
    Typography,
} from "antd";
import type { RangePickerProps } from "antd/es/date-picker";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

type TodaySchedule = {
    id: number;
    subject: string;
    className: string;
    time: string;
    room: string;
    status: string;
};

type TeachingCourse = {
    id: number;
    name: string;
    code: string;
    className: string;
    students: number;
    progress: number;
};

type TeachingSession = {
    id: number;
    subject: string;
    className: string;
    date: string;
    startTime: string;
    endTime: string;
};
type TeachingSessionGroup = {
    key: string;
    subject: string;
    className: string;
    totalSessions: number;
    totalMinutes: number;
    fromDate: string;
    toDate: string;
};

type DateRange = [Dayjs, Dayjs] | null;

const activities = [
    "Đã cập nhật điểm quá trình lớp WEB301",
    "Sinh viên Nguyễn Văn A gửi bài tập mới",
    "Lớp DBI202 có lịch học vào 09:30 hôm nay",
    "Bạn có 12 bài cần chấm trong tuần này",
];

const TeacherDashboardPage = () => {
    const [range, setRange] = useState<DateRange>([
        dayjs().startOf("month"),
        dayjs().endOf("month"),
    ]);

    const [todaySchedules, setTodaySchedules] = useState<TodaySchedule[]>([]);
    const [teachingCourses, setTeachingCourses] = useState<TeachingCourse[]>(
        [],
    );
    const [teachingSessions, setTeachingSessions] = useState<TeachingSession[]>(
        [],
    );

    const [loadingTodaySchedules, setLoadingTodaySchedules] = useState(false);
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [loadingSessions, setLoadingSessions] = useState(false);

    const fetchTodaySchedules = async () => {
        try {
            setLoadingTodaySchedules(true);
            const res = await getTeacherTodaySchedulesAPI();
            setTodaySchedules(res.data?.data || res.data || []);
        } catch (error) {
            console.log(error);
            message.error("Không tải được lịch dạy hôm nay");
        } finally {
            setLoadingTodaySchedules(false);
        }
    };

    const fetchTeachingCourses = async () => {
        try {
            setLoadingCourses(true);
            const res = await getTeachingCoursesAPI();
            setTeachingCourses(res.data?.data || res.data || []);
        } catch (error) {
            console.log(error);
            message.error("Không tải được lớp học");
        } finally {
            setLoadingCourses(false);
        }
    };

    const fetchTeachingSessions = async () => {
        try {
            setLoadingSessions(true);

            const fromDate = range?.[0]?.format("YYYY-MM-DD");
            const toDate = range?.[1]?.format("YYYY-MM-DD");

            const res = await getTeachingSessionsAPI(fromDate, toDate);
            setTeachingSessions(res.data?.data || res.data || []);
        } catch (error) {
            console.log(error);
            message.error("Không tải được thời lượng giảng dạy");
        } finally {
            setLoadingSessions(false);
        }
    };

    useEffect(() => {
        fetchTodaySchedules();
        fetchTeachingCourses();
    }, []);

    useEffect(() => {
        fetchTeachingSessions();
    }, [range]);

    const teachingSessionGroups = useMemo<TeachingSessionGroup[]>(() => {
        const groupMap = new Map<string, TeachingSessionGroup>();

        teachingSessions.forEach((item) => {
            const key = `${item.subject}-${item.className}`;

            const start = dayjs(
                `${item.date} ${item.startTime}`,
                "YYYY-MM-DD HH:mm",
            );

            const end = dayjs(
                `${item.date} ${item.endTime}`,
                "YYYY-MM-DD HH:mm",
            );

            const minutes = Math.max(end.diff(start, "minute"), 0);

            const current = groupMap.get(key);

            if (!current) {
                groupMap.set(key, {
                    key,
                    subject: item.subject,
                    className: item.className,
                    totalSessions: 1,
                    totalMinutes: minutes,
                    fromDate: item.date,
                    toDate: item.date,
                });

                return;
            }

            current.totalSessions += 1;
            current.totalMinutes += minutes;

            if (dayjs(item.date).isBefore(dayjs(current.fromDate), "day")) {
                current.fromDate = item.date;
            }

            if (dayjs(item.date).isAfter(dayjs(current.toDate), "day")) {
                current.toDate = item.date;
            }

            groupMap.set(key, current);
        });

        return Array.from(groupMap.values()).sort((a, b) =>
            a.subject.localeCompare(b.subject),
        );
    }, [teachingSessions]);

    const totalStudents = useMemo(() => {
        return teachingCourses.reduce((sum, item) => sum + item.students, 0);
    }, [teachingCourses]);

    const totalTeachingMinutes = useMemo(() => {
        return teachingSessions.reduce((total, item) => {
            const start = dayjs(
                `${item.date} ${item.startTime}`,
                "YYYY-MM-DD HH:mm",
            );
            const end = dayjs(
                `${item.date} ${item.endTime}`,
                "YYYY-MM-DD HH:mm",
            );

            if (!start.isValid() || !end.isValid()) return total;

            return total + Math.max(end.diff(start, "minute"), 0);
        }, 0);
    }, [teachingSessions]);

    const totalTeachingHours = Math.floor(totalTeachingMinutes / 60);
    const totalTeachingRemainMinutes = totalTeachingMinutes % 60;

    const nextSchedule = todaySchedules.find(
        (item) => item.status === "Đang diễn ra" || item.status === "Sắp tới",
    );

    const handleRangeChange: RangePickerProps["onChange"] = (value) => {
        if (!value || !value[0] || !value[1]) {
            setRange(null);
            return;
        }

        setRange([value[0], value[1]]);
    };

    return (
        <div>
            <Card
                bordered={false}
                style={{
                    borderRadius: 24,
                    marginBottom: 24,
                    background:
                        "linear-gradient(135deg, #0f172a 0%, #1d4ed8 55%, #06b6d4 100%)",
                    color: "#fff",
                    overflow: "hidden",
                }}
                bodyStyle={{ padding: 28 }}
            >
                <Row justify="space-between" align="middle" gutter={[24, 24]}>
                    <Col xs={24} lg={15}>
                        <Tag color="blue" style={{ marginBottom: 12 }}>
                            Teacher Dashboard
                        </Tag>

                        <Title level={2} style={{ color: "#fff" }}>
                            Chào mừng quay lại, Giảng viên
                        </Title>

                        <Text style={{ color: "rgba(255,255,255,0.82)" }}>
                            Hôm nay bạn có {todaySchedules.length} lịch dạy.
                            Kiểm tra lớp học, sinh viên và tiến độ giảng dạy
                            ngay bên dưới.
                        </Text>
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
                                    GV
                                </Avatar>

                                <div>
                                    <Text style={{ color: "#fff" }} strong>
                                        Lịch dạy tiếp theo
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
                                            : "Hôm nay chưa có lịch dạy"}
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
                        title="Lớp đang dạy"
                        value={teachingCourses.length}
                        color="#1677ff"
                    />
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <DashboardStatCard
                        icon={<TeamOutlined />}
                        title="Tổng sinh viên"
                        value={totalStudents}
                        color="#52c41a"
                    />
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <DashboardStatCard
                        icon={<CalendarOutlined />}
                        title="Lịch hôm nay"
                        value={todaySchedules.length}
                        color="#faad14"
                    />
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <DashboardStatCard
                        icon={<FileTextOutlined />}
                        title="Bài cần chấm"
                        value={12}
                        color="#ff4d4f"
                    />
                </Col>
            </Row>

            <Card
                bordered={false}
                loading={loadingSessions}
                style={{
                    borderRadius: 20,
                    marginBottom: 24,
                    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
                }}
                bodyStyle={{ padding: 20 }}
            >
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} lg={12}>
                        <Space
                            direction="vertical"
                            size={4}
                            style={{ width: "100%" }}
                        >
                            <Text strong style={{ fontSize: 16 }}>
                                Tổng thời lượng giảng dạy
                            </Text>

                            <Text type="secondary">
                                Chọn khoảng thời gian để xem tổng số buổi và
                                tổng giờ dạy
                            </Text>

                            <DatePicker.RangePicker
                                style={{ width: "100%", marginTop: 8 }}
                                format="DD/MM/YYYY"
                                value={range}
                                onChange={handleRangeChange}
                            />
                        </Space>
                    </Col>

                    <Col xs={12} lg={6}>
                        <div
                            style={{
                                padding: 18,
                                borderRadius: 18,
                                background: "#f8fafc",
                                textAlign: "center",
                            }}
                        >
                            <CalendarOutlined
                                style={{
                                    fontSize: 24,
                                    color: "#1677ff",
                                    marginBottom: 8,
                                }}
                            />

                            <div style={{ fontSize: 30, fontWeight: 700 }}>
                                {teachingSessions.length}
                            </div>

                            <Text type="secondary">Buổi dạy</Text>
                        </div>
                    </Col>

                    <Col xs={12} lg={6}>
                        <div
                            style={{
                                padding: 18,
                                borderRadius: 18,
                                background: "#f6ffed",
                                textAlign: "center",
                            }}
                        >
                            <ClockCircleOutlined
                                style={{
                                    fontSize: 24,
                                    color: "#52c41a",
                                    marginBottom: 8,
                                }}
                            />

                            <div style={{ fontSize: 28, fontWeight: 700 }}>
                                {totalTeachingHours}h{" "}
                                {totalTeachingRemainMinutes}m
                            </div>

                            <Text type="secondary">Tổng thời lượng</Text>
                        </div>
                    </Col>
                </Row>

                <Divider />

                <List
                    dataSource={teachingSessionGroups}
                    locale={{
                        emptyText:
                            "Không có dữ liệu giảng dạy trong khoảng thời gian này",
                    }}
                    renderItem={(item) => {
                        const hours = Math.floor(item.totalMinutes / 60);
                        const remainMinutes = item.totalMinutes % 60;

                        return (
                            <List.Item
                                style={{
                                    padding: "14px 16px",
                                    marginBottom: 10,
                                    borderRadius: 16,
                                    background: "#fafafa",
                                    border: "1px solid #f0f0f0",
                                }}
                            >
                                <Row
                                    align="middle"
                                    justify="space-between"
                                    gutter={[16, 16]}
                                    style={{ width: "100%" }}
                                >
                                    <Col xs={24} md={9}>
                                        <List.Item.Meta
                                            avatar={
                                                <Avatar
                                                    shape="square"
                                                    style={{
                                                        background: "#1677ff",
                                                        borderRadius: 12,
                                                    }}
                                                    icon={<BookOutlined />}
                                                />
                                            }
                                            title={
                                                <Text strong>
                                                    {item.subject}
                                                </Text>
                                            }
                                            description={
                                                <Text type="secondary">
                                                    {item.className}
                                                </Text>
                                            }
                                        />
                                    </Col>

                                    <Col
                                        xs={12}
                                        md={4}
                                        style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Tag
                                            color="blue"
                                            style={{
                                                minWidth: 90,
                                                textAlign: "center",
                                                padding: "4px 12px",
                                                borderRadius: 999,
                                                fontWeight: 600,
                                                background: "#e6f4ff",
                                                borderColor: "#91caff",
                                                color: "#0958d9",
                                            }}
                                        >
                                            {item.totalSessions} buổi
                                        </Tag>
                                    </Col>

                                    <Col
                                        xs={12}
                                        md={5}
                                        style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Tag
                                            color="green"
                                            style={{
                                                minWidth: 90,
                                                textAlign: "center",
                                                padding: "4px 12px",
                                                borderRadius: 999,
                                                fontWeight: 600,
                                            }}
                                        >
                                            {hours}h : {remainMinutes}m
                                        </Tag>
                                    </Col>

                                    <Col
                                        xs={24}
                                        md={6}
                                        style={{
                                            display: "flex",
                                            justifyContent: "flex-end",
                                            textAlign: "right",
                                        }}
                                    >
                                        <Text type="secondary">
                                            {dayjs(item.fromDate).format(
                                                "DD/MM/YYYY",
                                            )}{" "}
                                            -{" "}
                                            {dayjs(item.toDate).format(
                                                "DD/MM/YYYY",
                                            )}
                                        </Text>
                                    </Col>
                                </Row>
                            </List.Item>
                        );
                    }}
                />
            </Card>

            <Row gutter={[24, 24]}>
                <Col xs={24} xl={15}>
                    <Card
                        title="Lịch dạy hôm nay"
                        bordered={false}
                        loading={loadingTodaySchedules}
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
                            <Empty description="Không có lịch dạy hôm nay" />
                        )}
                    </Card>
                </Col>

                <Col xs={24} xl={9}>
                    <Card
                        title="Hoạt động gần đây"
                        bordered={false}
                        style={{ borderRadius: 20, height: "100%" }}
                    >
                        <Timeline
                            items={activities.map((activity, index) => ({
                                color: index === 0 ? "blue" : "gray",
                                children: <Text>{activity}</Text>,
                            }))}
                        />
                    </Card>
                </Col>

                <Col xs={24}>
                    <Card
                        title="Lớp học đang phụ trách"
                        bordered={false}
                        loading={loadingCourses}
                        style={{ borderRadius: 20 }}
                    >
                        {teachingCourses.length ? (
                            <Row gutter={[16, 16]}>
                                {teachingCourses.map((course) => (
                                    <Col xs={24} md={12} xl={8} key={course.id}>
                                        <CourseCard course={course} />
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            <Empty description="Chưa có lớp học phụ trách" />
                        )}
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
};

const DashboardStatCard = ({ icon, title, value, color }: StatCardProps) => {
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

                <Statistic title={title} value={value} />
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
                <Col>
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
                                {item.className} • {item.room}
                            </Text>
                        </div>
                    </Space>
                </Col>

                <Col>
                    <Space direction="vertical" align="end" size={4}>
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

const CourseCard = ({ course }: { course: TeachingCourse }) => {
    const navigate = useNavigate();

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
                        <Text strong>{course.name}</Text>
                        <br />
                        <Text type="secondary">
                            {course.code} • {course.className}
                        </Text>
                    </div>
                </Space>

                <Row justify="space-between">
                    <Text type="secondary">Sinh viên</Text>
                    <Text strong>{course.students}</Text>
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

                <Button
                    block
                    type="primary"
                    onClick={() => navigate(`/courses-class/${course.id}`)}
                >
                    Xem chi tiết lớp
                </Button>
            </Space>
        </Card>
    );
};

export default TeacherDashboardPage;
