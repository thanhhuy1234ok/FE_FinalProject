import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
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
import {
    BookOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    EnvironmentOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { getMyLessonsByDateAPI } from "@/services/api";
import { LESSON_TIME_MAP } from "@/types/constans";

const { Title, Text } = Typography;

type TLessonItem = {
    id: number;
    date: string;
    dayOfWeek: number;
    lessonStart: number;
    lessonEnd: number;
    status: string;
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
        } | null;
        teacher: {
            id: number;
            name: string;
        } | null;
        adminClass?: {
            id: number;
            name: string;
            code: string;
        } | null;
    } | null;
};

const dayOfWeekMap: Record<number, string> = {
    2: "Thứ 2",
    3: "Thứ 3",
    4: "Thứ 4",
    5: "Thứ 5",
    6: "Thứ 6",
    7: "Thứ 7",
    8: "Chủ nhật",
};

const getLessonStatusMeta = (status?: string) => {
    switch (status) {
        case "ONGOING":
            return {
                label: "Đang học",
                tagColor: "blue",
                leftColor: "#1677ff",
                bg: "#f0f7ff",
            };
        case "COMPLETED":
            return {
                label: "Học xong",
                tagColor: "green",
                leftColor: "#52c41a",
                bg: "#f6ffed",
            };
        case "UPCOMING":
        default:
            return {
                label: "Chưa học",
                tagColor: "default",
                leftColor: "#bfbfbf",
                bg: "#fafafa",
            };
    }
};

const pad2 = (num: number) => String(num).padStart(2, "0");

const formatCountdown = (diffMs: number) => {
    if (diffMs <= 0) return "00:00:00";

    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
};

const getLessonTimeText = (lessonStart?: number, lessonEnd?: number) => {
    if (!lessonStart || !lessonEnd) return "";

    const start = LESSON_TIME_MAP[lessonStart]?.start;
    const end = LESSON_TIME_MAP[lessonEnd]?.end;

    if (!start || !end) return `Tiết ${lessonStart} - ${lessonEnd}`;

    return `${start} - ${end}`;
};

const getLessonStartDateTime = (lesson: TLessonItem) => {
    const startTime = LESSON_TIME_MAP[lesson.lessonStart]?.start;
    if (!startTime) return null;

    return dayjs(`${lesson.date} ${startTime}`, "YYYY-MM-DD HH:mm");
};

const getLessonEndDateTime = (lesson: TLessonItem) => {
    const endTime = LESSON_TIME_MAP[lesson.lessonEnd]?.end;
    if (!endTime) return null;

    return dayjs(`${lesson.date} ${endTime}`, "YYYY-MM-DD HH:mm");
};

const getScheduleNotice = (lesson: TLessonItem, now: dayjs.Dayjs) => {
    const lessonDate = dayjs(lesson.date);
    const startAt = getLessonStartDateTime(lesson);
    const endAt = getLessonEndDateTime(lesson);

    if (!startAt || !endAt) {
        return {
            type: "default",
            text: `Lịch sẽ học vào ngày ${lessonDate.format("DD/MM/YYYY")}`,
        };
    }

    if (!lessonDate.isSame(now, "day")) {
        return {
            type: "future-date",
            text: `Lịch sẽ học vào ngày ${lessonDate.format("DD/MM/YYYY")}`,
        };
    }

    if (now.isBefore(startAt)) {
        const diffMs = startAt.valueOf() - now.valueOf();
        return {
            type: "countdown",
            text: `Còn ${formatCountdown(diffMs)} sẽ bắt đầu học`,
        };
    }

    if (now.isAfter(endAt)) {
        return {
            type: "done",
            text: "Buổi học đã kết thúc",
        };
    }

    return {
        type: "ongoing",
        text: "Đang diễn ra",
    };
};

const StudentLessonCardList = () => {
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [lessons, setLessons] = useState<TLessonItem[]>([]);
    const [now, setNow] = useState(dayjs());

    const fetchLessons = async (date: string) => {
        try {
            setLoading(true);
            const res = await getMyLessonsByDateAPI(date);
            const result = res?.data?.result ?? res?.data?.data?.result ?? [];

            const sorted = Array.isArray(result)
                ? [...result].sort((a, b) => a.lessonStart - b.lessonStart)
                : [];

            setLessons(sorted);
        } catch (error: any) {
            message.error(error?.message || "Không thể tải lịch học");
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
        <div
            style={{
                padding: 20,
                background: "#fff",
                minHeight: "100vh",
            }}
        >
            <Space direction="vertical" size={20} style={{ width: "100%" }}>
                <Card
                    bordered={false}
                    style={{
                        borderRadius: 20,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
                    }}
                    bodyStyle={{ padding: 20 }}
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
                            <Title
                                level={3}
                                style={{
                                    margin: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                }}
                            >
                                <CalendarOutlined />
                                Lịch học trong ngày
                            </Title>
                            <Text type="secondary">
                                Danh sách các buổi học theo ngày
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
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            padding: "40px 0",
                        }}
                    >
                        <Spin size="large" />
                    </div>
                ) : lessons.length === 0 ? (
                    <Card
                        bordered={false}
                        style={{
                            borderRadius: 20,
                            boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
                        }}
                    >
                        <Empty description="Không có lịch học trong ngày này" />
                    </Card>
                ) : (
                    <Space
                        direction="vertical"
                        size={16}
                        style={{ width: "100%" }}
                    >
                        {lessons.map((item) => {
                            const statusMeta = getLessonStatusMeta(item.status);
                            const scheduleNotice = getScheduleNotice(item, now);

                            return (
                                <Card
                                    key={item.id}
                                    bordered={false}
                                    style={{
                                        borderRadius: 20,
                                        overflow: "hidden",
                                        boxShadow:
                                            "0 6px 20px rgba(0,0,0,0.05)",
                                    }}
                                    bodyStyle={{ padding: 0 }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "stretch",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: 8,
                                                background:
                                                    statusMeta.leftColor,
                                                flexShrink: 0,
                                            }}
                                        />

                                        <div
                                            style={{
                                                flex: 1,
                                                padding: 18,
                                                background: "#fff",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    alignItems: "flex-start",
                                                    gap: 12,
                                                    flexWrap: "wrap",
                                                }}
                                            >
                                                <div>
                                                    <div
                                                        style={{
                                                            fontSize: 18,
                                                            fontWeight: 700,
                                                            color: "#1f1f1f",
                                                            marginBottom: 4,
                                                        }}
                                                    >
                                                        {item.courseOffering
                                                            ?.subject?.name ||
                                                            "Chưa có tên môn"}
                                                    </div>
                                                    <Text type="secondary">
                                                        {item.courseOffering
                                                            ?.code ||
                                                            "Chưa có mã lớp học phần"}
                                                    </Text>
                                                </div>

                                                <Tag
                                                    color={statusMeta.tagColor}
                                                >
                                                    {statusMeta.label}
                                                </Tag>
                                            </div>

                                            <div
                                                style={{
                                                    marginTop: 14,
                                                    display: "flex",
                                                    flexWrap: "wrap",
                                                    gap: 8,
                                                }}
                                            >
                                                <Tag
                                                    icon={<BookOutlined />}
                                                    color="blue"
                                                >
                                                    {item.courseOffering
                                                        ?.subject?.code ||
                                                        "N/A"}
                                                </Tag>

                                                <Tag
                                                    icon={
                                                        <ClockCircleOutlined />
                                                    }
                                                    color="purple"
                                                >
                                                    Tiết {item.lessonStart} -{" "}
                                                    {item.lessonEnd}
                                                </Tag>

                                                <Tag color="cyan">
                                                    {getLessonTimeText(
                                                        item.lessonStart,
                                                        item.lessonEnd,
                                                    )}
                                                </Tag>
                                            </div>

                                            <div
                                                style={{
                                                    marginTop: 14,
                                                    padding: "12px 14px",
                                                    borderRadius: 14,
                                                    background:
                                                        scheduleNotice.type ===
                                                        "countdown"
                                                            ? "#f0f7ff"
                                                            : scheduleNotice.type ===
                                                                "ongoing"
                                                              ? "#e6f4ff"
                                                              : scheduleNotice.type ===
                                                                  "done"
                                                                ? "#f6ffed"
                                                                : "#fafafa",
                                                    border:
                                                        scheduleNotice.type ===
                                                        "countdown"
                                                            ? "1px solid #91caff"
                                                            : scheduleNotice.type ===
                                                                "ongoing"
                                                              ? "1px solid #69b1ff"
                                                              : scheduleNotice.type ===
                                                                  "done"
                                                                ? "1px solid #b7eb8f"
                                                                : "1px solid #f0f0f0",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize:
                                                            scheduleNotice.type ===
                                                            "countdown"
                                                                ? 20
                                                                : 14,
                                                        fontWeight:
                                                            scheduleNotice.type ===
                                                            "countdown"
                                                                ? 700
                                                                : 500,
                                                        color:
                                                            scheduleNotice.type ===
                                                            "countdown"
                                                                ? "#1677ff"
                                                                : scheduleNotice.type ===
                                                                    "ongoing"
                                                                  ? "#1677ff"
                                                                  : scheduleNotice.type ===
                                                                      "done"
                                                                    ? "#389e0d"
                                                                    : "#595959",
                                                        letterSpacing:
                                                            scheduleNotice.type ===
                                                            "countdown"
                                                                ? 1
                                                                : 0,
                                                    }}
                                                >
                                                    {scheduleNotice.text}
                                                </div>
                                            </div>

                                            <div
                                                style={{
                                                    marginTop: 16,
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: 10,
                                                    color: "#595959",
                                                    fontSize: 14,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 8,
                                                    }}
                                                >
                                                    <CalendarOutlined />
                                                    <span>
                                                        {
                                                            dayOfWeekMap[
                                                                item.dayOfWeek
                                                            ]
                                                        }{" "}
                                                        -{" "}
                                                        {dayjs(
                                                            item.date,
                                                        ).format("DD/MM/YYYY")}
                                                    </span>
                                                </div>

                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 8,
                                                    }}
                                                >
                                                    <UserOutlined />
                                                    <span>
                                                        {item.courseOffering
                                                            ?.teacher?.name ||
                                                            "Chưa có giảng viên"}
                                                    </span>
                                                </div>

                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 8,
                                                    }}
                                                >
                                                    <EnvironmentOutlined />
                                                    <span>
                                                        {item.room?.name ||
                                                            "Chưa có phòng học"}
                                                    </span>
                                                </div>
                                            </div>

                                            {item.courseOffering
                                                ?.adminClass && (
                                                <div
                                                    style={{
                                                        marginTop: 16,
                                                        padding: "10px 12px",
                                                        borderRadius: 12,
                                                        border: "1px solid #f0f0f0",
                                                        background:
                                                            statusMeta.bg,
                                                        fontSize: 13,
                                                        color: "#595959",
                                                    }}
                                                >
                                                    Lớp:{" "}
                                                    <b>
                                                        {
                                                            item.courseOffering
                                                                .adminClass.name
                                                        }
                                                    </b>{" "}
                                                    (
                                                    {
                                                        item.courseOffering
                                                            .adminClass.code
                                                    }
                                                    )
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </Space>
                )}
            </Space>
        </div>
    );
};

export default StudentLessonCardList;
