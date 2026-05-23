import { useEffect, useState } from "react";
import {
    Button,
    Card,
    DatePicker,
    Empty,
    Space,
    Spin,
    Tag,
    Typography,
    message,
} from "antd";
import dayjs from "dayjs";
import {
    BookOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    EnvironmentOutlined,
    TeamOutlined,
} from "@ant-design/icons";
import { getTeacherLessonsByDateAPI } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { LESSON_TIME_MAP } from "@/types/constans";

const { Title, Text } = Typography;

type TTeacherLesson = {
    id: number;
    date: string;
    dayOfWeek: number;
    lessonStart: number;
    lessonEnd: number;
    status: string;
    isActive: boolean;
    room: {
        id: number;
        name: string;
    } | null;
    courseOffering: {
        id: number;
        code: string;
        subject: {
            id: number;
            name: string;
            code: string;
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

const dayMap: Record<number, string> = {
    1: "Chủ nhật",
    2: "Thứ 2",
    3: "Thứ 3",
    4: "Thứ 4",
    5: "Thứ 5",
    6: "Thứ 6",
    7: "Thứ 7",
};

const pad2 = (n: number) => String(n).padStart(2, "0");

const formatCountdown = (diffMs: number) => {
    const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
};

const getLessonTimeText = (lessonStart?: number, lessonEnd?: number) => {
    if (!lessonStart || !lessonEnd) return "Chưa có thời gian";

    const start = LESSON_TIME_MAP[lessonStart]?.start;
    const end = LESSON_TIME_MAP[lessonEnd]?.end;

    if (!start || !end) return `Tiết ${lessonStart} - ${lessonEnd}`;

    return `${start} - ${end}`;
};

const getScheduleDateTime = (
    lessonDate: string,
    lessonStart: number,
    lessonEnd: number,
) => {
    const start = LESSON_TIME_MAP[lessonStart]?.start;
    const end = LESSON_TIME_MAP[lessonEnd]?.end;

    if (!start || !end) return null;

    return {
        startAt: dayjs(`${lessonDate} ${start}`, "YYYY-MM-DD HH:mm"),
        endAt: dayjs(`${lessonDate} ${end}`, "YYYY-MM-DD HH:mm"),
    };
};

const getTeachingStatus = (lesson: TTeacherLesson, now: dayjs.Dayjs) => {
    const dateTime = getScheduleDateTime(
        lesson.date,
        lesson.lessonStart,
        lesson.lessonEnd,
    );

    if (!dateTime) {
        return {
            label: "Chưa mở",
            tagColor: "default",
            buttonDisabled: true,
            notice: "Chưa xác định thời gian",
            leftColor: "#bfbfbf",
            boxBg: "#fafafa",
            boxBorder: "#f0f0f0",
        };
    }

    const { startAt, endAt } = dateTime;
    const openAt = startAt.subtract(30, "minute");

    if (now.isAfter(endAt)) {
        return {
            label: "Đã kết thúc",
            tagColor: "green",
            buttonDisabled: true,
            notice: "Buổi dạy đã kết thúc",
            leftColor: "#52c41a",
            boxBg: "#f6ffed",
            boxBorder: "#b7eb8f",
        };
    }

    if (now.isBefore(openAt)) {
        return {
            label: "Chưa mở",
            tagColor: "default",
            buttonDisabled: true,
            notice: "Mở trước giờ dạy 30 phút",
            leftColor: "#bfbfbf",
            boxBg: "#fafafa",
            boxBorder: "#f0f0f0",
        };
    }

    if (now.isBefore(startAt)) {
        return {
            label: "Sắp dạy",
            tagColor: "blue",
            buttonDisabled: false,
            notice: `Còn ${formatCountdown(
                startAt.valueOf() - now.valueOf(),
            )} bắt đầu`,
            leftColor: "#1677ff",
            boxBg: "#f0f7ff",
            boxBorder: "#91caff",
        };
    }

    return {
        label: "Đang dạy",
        tagColor: "processing",
        buttonDisabled: false,
        notice: "Buổi dạy đang diễn ra",
        leftColor: "#1677ff",
        boxBg: "#e6f4ff",
        boxBorder: "#69b1ff",
    };
};

const CoursesTimePage = () => {
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [now, setNow] = useState(dayjs());
    const [lessons, setLessons] = useState<TTeacherLesson[]>([]);
    const navigate = useNavigate();
    const selectedDayOfWeek = selectedDate.day() + 1;

    const fetchLessons = async (date: string) => {
        try {
            setLoading(true);

            const res = await getTeacherLessonsByDateAPI(date);

            const result =
                res?.data?.result ??
                res?.data?.data?.result ??
                res?.data?.data ??
                [];

            const sorted = Array.isArray(result)
                ? [...result].sort((a, b) => a.lessonStart - b.lessonStart)
                : [];

            setLessons(sorted);
        } catch (error: any) {
            message.error(
                error?.response?.data?.message ||
                    error?.message ||
                    "Không thể tải lớp dạy trong ngày",
            );
            setLessons([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLessons(selectedDate.format("YYYY-MM-DD"));
    }, [selectedDate]);

    useEffect(() => {
        const timer = setInterval(() => {
            setNow(dayjs());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div>
            <Card
                bordered={false}
                style={{
                    borderRadius: 20,
                    marginBottom: 20,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                        flexWrap: "wrap",
                    }}
                >
                    <div>
                        <Title level={3} style={{ margin: 0 }}>
                            Lớp dạy trong ngày
                        </Title>

                        <Text type="secondary">
                            {dayMap[selectedDayOfWeek]} -{" "}
                            {selectedDate.format("DD/MM/YYYY")} •{" "}
                            {now.format("HH:mm:ss")}
                        </Text>
                    </div>

                    <Space wrap>
                        <Button onClick={() => setSelectedDate(dayjs())}>
                            Hôm nay
                        </Button>

                        <DatePicker
                            value={selectedDate}
                            format="DD/MM/YYYY"
                            onChange={(date) => {
                                if (date) setSelectedDate(date);
                            }}
                        />
                    </Space>
                </div>
            </Card>

            {loading ? (
                <div style={{ textAlign: "center", padding: 40 }}>
                    <Spin size="large" />
                </div>
            ) : lessons.length === 0 ? (
                <Card bordered={false} style={{ borderRadius: 20 }}>
                    <Empty description="Không có lớp dạy trong ngày này" />
                </Card>
            ) : (
                <Space direction="vertical" size={16} style={{ width: "100%" }}>
                    {lessons.map((lesson) => {
                        const status = getTeachingStatus(lesson, now);

                        return (
                            <Card
                                key={lesson.id}
                                bordered={false}
                                style={{
                                    borderRadius: 20,
                                    overflow: "hidden",
                                    boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
                                }}
                                bodyStyle={{ padding: 0 }}
                            >
                                <div style={{ display: "flex" }}>
                                    <div
                                        style={{
                                            width: 6,
                                            background: status.leftColor,
                                        }}
                                    />

                                    <div
                                        style={{
                                            flex: 1,
                                            padding: 20,
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            gap: 20,
                                            flexWrap: "wrap",
                                        }}
                                    >
                                        <div
                                            style={{
                                                flex: 1,
                                                minWidth: 260,
                                            }}
                                        >
                                            <Title
                                                level={4}
                                                style={{ margin: 0 }}
                                            >
                                                {lesson.courseOffering?.subject
                                                    ?.name || "Chưa có tên môn"}
                                            </Title>

                                            <Text type="secondary">
                                                {lesson.courseOffering?.code ||
                                                    "Chưa có mã lớp"}{" "}
                                                •{" "}
                                                {lesson.courseOffering?.term
                                                    ? `${lesson.courseOffering.term.semester} - ${lesson.courseOffering.term.year}`
                                                    : "Chưa có học kỳ"}
                                            </Text>

                                            <div style={{ marginTop: 12 }}>
                                                <Space wrap>
                                                    <Tag
                                                        icon={<BookOutlined />}
                                                        color="blue"
                                                    >
                                                        {lesson.courseOffering
                                                            ?.subject?.code ||
                                                            "N/A"}
                                                    </Tag>

                                                    <Tag
                                                        icon={<TeamOutlined />}
                                                        color="green"
                                                    >
                                                        Lớp giảng dạy
                                                    </Tag>

                                                    <Tag
                                                        icon={
                                                            <EnvironmentOutlined />
                                                        }
                                                        color="cyan"
                                                    >
                                                        {lesson.room?.name ||
                                                            "Chưa có phòng"}
                                                    </Tag>
                                                </Space>
                                            </div>

                                            <div style={{ marginTop: 14 }}>
                                                <Text strong>
                                                    <CalendarOutlined /> Lịch
                                                    dạy
                                                </Text>

                                                <div style={{ marginTop: 8 }}>
                                                    <Space wrap>
                                                        <Tag color="purple">
                                                            {
                                                                dayMap[
                                                                    lesson
                                                                        .dayOfWeek
                                                                ]
                                                            }{" "}
                                                            -{" "}
                                                            {getLessonTimeText(
                                                                lesson.lessonStart,
                                                                lesson.lessonEnd,
                                                            )}
                                                        </Tag>

                                                        <Tag>
                                                            Tiết{" "}
                                                            {lesson.lessonStart}{" "}
                                                            - {lesson.lessonEnd}
                                                        </Tag>
                                                    </Space>
                                                </div>
                                            </div>
                                        </div>

                                        <div
                                            style={{
                                                minWidth: 230,
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "flex-end",
                                                gap: 12,
                                            }}
                                        >
                                            <Tag color={status.tagColor}>
                                                {status.label}
                                            </Tag>

                                            <div
                                                style={{
                                                    padding: "12px 14px",
                                                    borderRadius: 14,
                                                    background: status.boxBg,
                                                    border: `1px solid ${status.boxBorder}`,
                                                    width: "100%",
                                                    textAlign: "center",
                                                }}
                                            >
                                                <ClockCircleOutlined />{" "}
                                                <Text strong>
                                                    {status.notice}
                                                </Text>
                                            </div>

                                            <Button
                                                type="primary"
                                                disabled={status.buttonDisabled}
                                                block
                                                onClick={() =>
                                                    navigate(`${lesson.id}`)
                                                }
                                            >
                                                Vào lớp dạy
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </Space>
            )}
        </div>
    );
};

export default CoursesTimePage;
