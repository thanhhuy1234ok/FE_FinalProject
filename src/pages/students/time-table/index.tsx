import {
    CalendarOutlined,
    ClockCircleOutlined,
    EnvironmentOutlined,
    LeftOutlined,
    ReloadOutlined,
    RightOutlined,
    UserOutlined,
} from "@ant-design/icons";
import {
    App,
    Button,
    Card,
    Col,
    Empty,
    Radio,
    Row,
    Space,
    Spin,
    Tag,
    Typography,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/vi";
import { useEffect, useMemo, useState } from "react";
import { getMyTimeTableAPI } from "@/services/api";

dayjs.locale("vi");

const { Title, Text } = Typography;

type ViewMode = "week" | "day" | "month";

type LessonCell = {
    id: number;
    subject: string;
    courseCode: string;
    room: string;
    teacher: string;
    className?: string;
    dayOfWeek: number;
    lessonStart: number;
    lessonEnd: number;
    startDate?: string | null;
    endDate?: string | null;
    date?: string | null;
    time: string;
};

const LESSON_TIME_MAP: Record<number, { start: string; end: string }> = {
    1: { start: "07:00", end: "07:50" },
    2: { start: "07:50", end: "08:40" },
    3: { start: "08:50", end: "09:40" },
    4: { start: "09:40", end: "10:30" },
    5: { start: "10:40", end: "11:30" },
    6: { start: "13:00", end: "13:50" },
    7: { start: "13:50", end: "14:40" },
    8: { start: "14:50", end: "15:40" },
    9: { start: "15:40", end: "16:30" },
    10: { start: "19:55", end: "20:30" },
    11: { start: "20:30", end: "21:20" },
};

const LESSON_ROWS = Object.entries(LESSON_TIME_MAP).map(([lesson, time]) => ({
    lesson: Number(lesson),
    label: `Tiết ${lesson}`,
    time: `${time.start} - ${time.end}`,
}));

const WEEK_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

const COLORS = [
    "linear-gradient(135deg,#2563eb,#38bdf8)",
    "linear-gradient(135deg,#059669,#34d399)",
    "linear-gradient(135deg,#7c3aed,#a78bfa)",
    "linear-gradient(135deg,#ea580c,#fb923c)",
    "linear-gradient(135deg,#db2777,#f472b6)",
    "linear-gradient(135deg,#0891b2,#22d3ee)",
];

const getCardColor = (text: string) => {
    let sum = 0;
    for (const char of text || "") sum += char.charCodeAt(0);
    return COLORS[sum % COLORS.length];
};

const getVietnameseDay = (date: Dayjs) => {
    const d = date.day();
    return d === 0 ? 8 : d + 1;
};

const getWeekDays = (date: Dayjs) => {
    const monday =
        date.day() === 0
            ? date.subtract(6, "day").startOf("day")
            : date.subtract(date.day() - 1, "day").startOf("day");

    return Array.from({ length: 7 }, (_, index) => monday.add(index, "day"));
};

const getMonthCells = (date: Dayjs) => {
    const startOfMonth = date.startOf("month");
    const endOfMonth = date.endOf("month");

    const start =
        startOfMonth.day() === 0
            ? startOfMonth.subtract(6, "day")
            : startOfMonth.subtract(startOfMonth.day() - 1, "day");

    const end =
        endOfMonth.day() === 0
            ? endOfMonth
            : endOfMonth.add(7 - endOfMonth.day(), "day");

    const cells: Dayjs[] = [];
    let cursor = start.startOf("day");

    while (cursor.isBefore(end) || cursor.isSame(end, "day")) {
        cells.push(cursor);
        cursor = cursor.add(1, "day");
    }

    return cells;
};

const getTimeText = (lessonStart: number, lessonEnd: number) => {
    const start = LESSON_TIME_MAP[lessonStart]?.start || `Tiết ${lessonStart}`;
    const end = LESSON_TIME_MAP[lessonEnd]?.end || `Tiết ${lessonEnd}`;
    return `${start} - ${end}`;
};

const getResponseArray = (res: any) => {
    const data =
        res?.data?.data?.result ||
        res?.data?.data ||
        res?.data?.result ||
        res?.data ||
        [];

    return Array.isArray(data) ? data : [];
};

const normalizeLesson = (item: any): LessonCell => {
    const courseOffering = item.courseOffering || item.course || item;

    const lessonStart = Number(item.lessonStart);
    const lessonEnd = Number(item.lessonEnd);

    const subject =
        item.subjectName ||
        item.subject?.name ||
        courseOffering?.subjectName ||
        courseOffering?.subject ||
        courseOffering?.teacherSubject?.subject?.name ||
        "Môn học";

    const teacher =
        item.teacherName ||
        item.teacher?.name ||
        item.teacher?.user?.name ||
        courseOffering?.teacherName ||
        courseOffering?.teacher ||
        courseOffering?.teacherSubject?.teacher?.user?.name ||
        "Đang cập nhật";

    const room =
        item.roomName ||
        item.room?.name ||
        item.room ||
        courseOffering?.roomName ||
        "Chưa có phòng";

    return {
        id: Number(item.id),
        subject,
        courseCode:
            item.courseCode ||
            courseOffering?.courseCode ||
            courseOffering?.code ||
            "Mã lớp học phần",
        room,
        teacher,
        className:
            item.className ||
            courseOffering?.className ||
            courseOffering?.adminClass?.name ||
            "",
        dayOfWeek: Number(item.dayOfWeek),
        lessonStart,
        lessonEnd,
        startDate: item.startDate || courseOffering?.startDate || null,
        endDate: item.endDate || courseOffering?.endDate || null,
        date: item.date || null,
        time: getTimeText(lessonStart, lessonEnd),
    };
};

const TimeTablePage = () => {
    const { message } = App.useApp();

    const [mode, setMode] = useState<ViewMode>("week");
    const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
    const [lessons, setLessons] = useState<LessonCell[]>([]);
    const [loading, setLoading] = useState(false);

    const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

    const fetchData = async () => {
        try {
            setLoading(true);

            const params: {
                date?: string;
                from?: string;
                to?: string;
            } = {};

            if (mode === "day") {
                params.date = currentDate.format("YYYY-MM-DD");
            }

            if (mode === "week") {
                params.from = weekDays[0].format("YYYY-MM-DD");
                params.to = weekDays[6].format("YYYY-MM-DD");
            }

            if (mode === "month") {
                params.from = currentDate.startOf("month").format("YYYY-MM-DD");
                params.to = currentDate.endOf("month").format("YYYY-MM-DD");
            }

            const res = await getMyTimeTableAPI(params);
            const rawData = getResponseArray(res);

            const data = rawData
                .map(normalizeLesson)
                .filter(
                    (item) =>
                        item.dayOfWeek && item.lessonStart && item.lessonEnd,
                );

            setLessons(data);
        } catch (error) {
            console.error(error);
            message.error("Không tải được thời khóa biểu");
            setLessons([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [mode, currentDate]);

    const getLessonsByDate = (date: Dayjs) => {
        const current = date.startOf("day");
        const dayOfWeek = getVietnameseDay(current);

        return lessons
            .filter((item) => {
                if (item.date) {
                    return dayjs(item.date).isSame(current, "day");
                }

                if (item.dayOfWeek !== dayOfWeek) return false;

                const startOk = item.startDate
                    ? current.isSame(dayjs(item.startDate), "day") ||
                      current.isAfter(dayjs(item.startDate), "day")
                    : true;

                const endOk = item.endDate
                    ? current.isSame(dayjs(item.endDate), "day") ||
                      current.isBefore(dayjs(item.endDate), "day")
                    : true;

                return startOk && endOk;
            })
            .sort((a, b) => a.lessonStart - b.lessonStart);
    };

    const dayLessons = useMemo(
        () => getLessonsByDate(currentDate),
        [lessons, currentDate],
    );

    const handlePrev = () => {
        if (mode === "day") setCurrentDate((prev) => prev.subtract(1, "day"));
        if (mode === "week") setCurrentDate((prev) => prev.subtract(1, "week"));
        if (mode === "month")
            setCurrentDate((prev) => prev.subtract(1, "month"));
    };

    const handleNext = () => {
        if (mode === "day") setCurrentDate((prev) => prev.add(1, "day"));
        if (mode === "week") setCurrentDate((prev) => prev.add(1, "week"));
        if (mode === "month") setCurrentDate((prev) => prev.add(1, "month"));
    };

    const renderHeaderTitle = () => {
        if (mode === "day") return currentDate.format("DD/MM/YYYY");

        if (mode === "week") {
            return `${weekDays[0].format("DD/MM/YYYY")} - ${weekDays[6].format(
                "DD/MM/YYYY",
            )}`;
        }

        return currentDate.format("MM/YYYY");
    };

    const renderLessonCard = (lesson: LessonCell) => (
        <div
            key={lesson.id}
            style={{
                height: "100%",
                minHeight: 132,
                padding: 12,
                borderRadius: 14,
                background: getCardColor(lesson.courseCode),
                color: "#fff",
                boxShadow: "0 10px 24px rgba(37, 99, 235, 0.22)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
            }}
        >
            <div>
                <div
                    style={{
                        fontWeight: 900,
                        fontSize: 13,
                        marginBottom: 6,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                    title={lesson.courseCode}
                >
                    {lesson.courseCode}
                </div>

                <div
                    style={{
                        fontSize: 14,
                        fontWeight: 800,
                        lineHeight: 1.35,
                        marginBottom: 8,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }}
                    title={lesson.subject}
                >
                    {lesson.subject}
                </div>

                <div style={{ fontSize: 12, opacity: 0.95, marginBottom: 4 }}>
                    <EnvironmentOutlined /> {lesson.room}
                </div>

                <div style={{ fontSize: 12, opacity: 0.95 }}>
                    <UserOutlined /> {lesson.teacher}
                </div>
            </div>

            <div
                style={{
                    marginTop: 10,
                    paddingTop: 8,
                    borderTop: "1px solid rgba(255,255,255,0.25)",
                    fontSize: 12,
                    fontWeight: 700,
                }}
            >
                <ClockCircleOutlined /> {lesson.time}
            </div>
        </div>
    );

    const renderWeekView = () => {
        const ROW_HEIGHT = 86;

        return (
            <Card
                loading={loading}
                style={{
                    borderRadius: 22,
                    overflow: "hidden",
                    boxShadow: "0 14px 38px rgba(15, 23, 42, 0.08)",
                }}
                bodyStyle={{ padding: 0 }}
            >
                <div style={{ width: "100%", overflowX: "auto" }}>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "96px repeat(7, minmax(190px, 1fr))",
                            minWidth: 1420,
                            background: "#fff",
                        }}
                    >
                        <div
                            style={{
                                padding: 16,
                                background: "#f8fafc",
                                fontWeight: 900,
                                borderRight: "1px solid #e5e7eb",
                                borderBottom: "1px solid #e5e7eb",
                                textAlign: "center",
                            }}
                        >
                            Tiết
                        </div>

                        {weekDays.map((date, index) => {
                            const isToday = date.isSame(dayjs(), "day");

                            return (
                                <div
                                    key={date.format("YYYY-MM-DD")}
                                    style={{
                                        padding: "14px 8px",
                                        textAlign: "center",
                                        background: isToday
                                            ? "#dbeafe"
                                            : "#f8fafc",
                                        borderRight: "1px solid #e5e7eb",
                                        borderBottom: "1px solid #e5e7eb",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 16,
                                            fontWeight: 900,
                                            color: isToday
                                                ? "#1677ff"
                                                : "#111827",
                                        }}
                                    >
                                        {WEEK_LABELS[index]}
                                    </div>

                                    <Text
                                        type="secondary"
                                        style={{ fontSize: 12 }}
                                    >
                                        {date.format("DD/MM")}
                                    </Text>
                                </div>
                            );
                        })}

                        <div>
                            {LESSON_ROWS.map((row) => (
                                <div
                                    key={row.lesson}
                                    style={{
                                        height: ROW_HEIGHT,
                                        padding: "10px 8px",
                                        background: "#f8fafc",
                                        borderRight: "1px solid #e5e7eb",
                                        borderBottom: "1px solid #e5e7eb",
                                        textAlign: "center",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontWeight: 900,
                                            color: "#111827",
                                            marginBottom: 4,
                                        }}
                                    >
                                        {row.label}
                                    </div>

                                    <Text
                                        type="secondary"
                                        style={{ fontSize: 11 }}
                                    >
                                        {row.time}
                                    </Text>
                                </div>
                            ))}
                        </div>

                        {weekDays.map((date) => {
                            const dayItems = getLessonsByDate(date);
                            const isToday = date.isSame(dayjs(), "day");

                            return (
                                <div
                                    key={date.format("YYYY-MM-DD")}
                                    style={{
                                        position: "relative",
                                        height: ROW_HEIGHT * LESSON_ROWS.length,
                                        background: isToday
                                            ? "#eff6ff"
                                            : "#fff",
                                        borderRight: "1px solid #e5e7eb",
                                    }}
                                >
                                    {LESSON_ROWS.map((row) => (
                                        <div
                                            key={row.lesson}
                                            style={{
                                                position: "absolute",
                                                left: 0,
                                                right: 0,
                                                top:
                                                    (row.lesson - 1) *
                                                    ROW_HEIGHT,
                                                height: ROW_HEIGHT,
                                                borderBottom:
                                                    "1px solid #e5e7eb",
                                            }}
                                        />
                                    ))}

                                    {dayItems.map((lesson) => {
                                        const top =
                                            (lesson.lessonStart - 1) *
                                            ROW_HEIGHT;
                                        const span =
                                            lesson.lessonEnd -
                                            lesson.lessonStart +
                                            1;
                                        const height = span * ROW_HEIGHT - 12;

                                        return (
                                            <div
                                                key={lesson.id}
                                                style={{
                                                    position: "absolute",
                                                    left: 10,
                                                    right: 10,
                                                    top: top + 6,
                                                    height,
                                                    zIndex: 2,
                                                }}
                                            >
                                                {renderLessonCard(lesson)}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Card>
        );
    };

    const renderDayView = () => (
        <Card
            loading={loading}
            style={{ borderRadius: 22 }}
            title={`Lịch học ngày ${currentDate.format("DD/MM/YYYY")}`}
        >
            {dayLessons.length === 0 ? (
                <Empty description="Không có lịch học trong ngày này" />
            ) : (
                <Space direction="vertical" size={14} style={{ width: "100%" }}>
                    {dayLessons.map((lesson) => (
                        <Card
                            key={lesson.id}
                            style={{
                                borderRadius: 18,
                                border: "1px solid #e5e7eb",
                                boxShadow: "0 8px 22px rgba(15,23,42,0.06)",
                            }}
                        >
                            <Row align="middle" gutter={[16, 16]}>
                                <Col xs={24} md={5}>
                                    <div
                                        style={{
                                            height: 74,
                                            borderRadius: 16,
                                            background: "#eff6ff",
                                            color: "#1677ff",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: 8,
                                            fontWeight: 900,
                                        }}
                                    >
                                        <ClockCircleOutlined />
                                        {lesson.time}
                                    </div>
                                </Col>

                                <Col xs={24} md={19}>
                                    <Space wrap>
                                        <Tag color="blue">
                                            {lesson.courseCode}
                                        </Tag>
                                        <Tag color="green">
                                            {lesson.subject}
                                        </Tag>
                                    </Space>

                                    <div
                                        style={{
                                            fontWeight: 800,
                                            marginTop: 8,
                                        }}
                                    >
                                        {lesson.subject}
                                    </div>

                                    <div
                                        style={{
                                            color: "#64748b",
                                            marginTop: 4,
                                        }}
                                    >
                                        <EnvironmentOutlined /> Phòng:{" "}
                                        {lesson.room}
                                    </div>

                                    <div style={{ color: "#64748b" }}>
                                        <UserOutlined /> Giảng viên:{" "}
                                        {lesson.teacher}
                                    </div>
                                </Col>
                            </Row>
                        </Card>
                    ))}
                </Space>
            )}
        </Card>
    );

    const renderMonthView = () => {
        const cells = getMonthCells(currentDate);

        return (
            <Card
                loading={loading}
                style={{
                    borderRadius: 22,
                    overflow: "hidden",
                    boxShadow: "0 14px 38px rgba(15, 23, 42, 0.08)",
                }}
                bodyStyle={{ padding: 0 }}
            >
                <div style={{ width: "100%", overflowX: "auto" }}>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(7, minmax(150px, 1fr))",
                            minWidth: 1050,
                        }}
                    >
                        {WEEK_LABELS.map((day) => (
                            <div
                                key={day}
                                style={{
                                    padding: "14px 8px",
                                    textAlign: "center",
                                    fontWeight: 900,
                                    background: "#f8fafc",
                                    borderRight: "1px solid #e5e7eb",
                                    borderBottom: "1px solid #e5e7eb",
                                }}
                            >
                                {day}
                            </div>
                        ))}

                        {cells.map((date) => {
                            const isCurrentMonth = date.isSame(
                                currentDate,
                                "month",
                            );
                            const isToday = date.isSame(dayjs(), "day");
                            const items = getLessonsByDate(date);

                            return (
                                <div
                                    key={date.format("YYYY-MM-DD")}
                                    onClick={() => {
                                        setCurrentDate(date);
                                        setMode("day");
                                    }}
                                    style={{
                                        minHeight: 138,
                                        padding: 10,
                                        cursor: "pointer",
                                        background: isToday
                                            ? "#eff6ff"
                                            : isCurrentMonth
                                              ? "#fff"
                                              : "#f8fafc",
                                        borderRight: "1px solid #e5e7eb",
                                        borderBottom: "1px solid #e5e7eb",
                                        opacity: isCurrentMonth ? 1 : 0.45,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            marginBottom: 8,
                                        }}
                                    >
                                        <Text strong={isToday}>
                                            {date.format("DD")}
                                        </Text>

                                        {items.length > 0 && (
                                            <Tag
                                                color="blue"
                                                style={{ margin: 0 }}
                                            >
                                                {items.length}
                                            </Tag>
                                        )}
                                    </div>

                                    <Space
                                        direction="vertical"
                                        size={6}
                                        style={{ width: "100%" }}
                                    >
                                        {items.slice(0, 2).map((item) => (
                                            <div
                                                key={item.id}
                                                style={{
                                                    padding: "7px 8px",
                                                    borderRadius: 10,
                                                    background: "#eff6ff",
                                                    border: "1px solid #bfdbfe",
                                                }}
                                            >
                                                <Text
                                                    strong
                                                    style={{
                                                        fontSize: 12,
                                                        display: "block",
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow:
                                                            "ellipsis",
                                                    }}
                                                >
                                                    {item.subject}
                                                </Text>

                                                <Text
                                                    type="secondary"
                                                    style={{
                                                        fontSize: 11,
                                                        display: "block",
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow:
                                                            "ellipsis",
                                                    }}
                                                >
                                                    {item.room} • T
                                                    {item.lessonStart}-
                                                    {item.lessonEnd}
                                                </Text>
                                            </div>
                                        ))}

                                        {items.length > 2 && (
                                            <Text
                                                type="secondary"
                                                style={{ fontSize: 11 }}
                                            >
                                                +{items.length - 2} lịch khác
                                            </Text>
                                        )}
                                    </Space>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Card>
        );
    };

    return (
        <div
            style={{
                padding: 24,
                minHeight: "100vh",
                background: "linear-gradient(180deg,#f8fbff 0%,#f3f6fb 100%)",
            }}
        >
            <Space direction="vertical" size={18} style={{ width: "100%" }}>
                <Card
                    variant="borderless"
                    style={{
                        borderRadius: 24,
                        boxShadow: "0 14px 38px rgba(15, 23, 42, 0.08)",
                    }}
                    bodyStyle={{ padding: 22 }}
                >
                    <Row
                        justify="space-between"
                        align="middle"
                        gutter={[16, 16]}
                    >
                        <Col>
                            <Space align="start">
                                <div
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 14,
                                        background: "#eff6ff",
                                        color: "#1677ff",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 22,
                                    }}
                                >
                                    <CalendarOutlined />
                                </div>

                                <div>
                                    <Title level={3} style={{ margin: 0 }}>
                                        Thời khóa biểu
                                    </Title>

                                    <Text type="secondary">
                                        Xem lịch học theo ngày, tuần hoặc tháng
                                    </Text>
                                </div>
                            </Space>
                        </Col>

                        <Col>
                            <Space wrap>
                                <Button
                                    icon={<LeftOutlined />}
                                    onClick={handlePrev}
                                />

                                <Button onClick={() => setCurrentDate(dayjs())}>
                                    Hôm nay
                                </Button>

                                <Button
                                    icon={<RightOutlined />}
                                    onClick={handleNext}
                                />

                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={fetchData}
                                    loading={loading}
                                >
                                    Tải lại
                                </Button>

                                <Radio.Group
                                    value={mode}
                                    onChange={(e) => setMode(e.target.value)}
                                    optionType="button"
                                    buttonStyle="solid"
                                >
                                    <Radio.Button value="week">
                                        Tuần
                                    </Radio.Button>
                                    <Radio.Button value="day">
                                        Ngày
                                    </Radio.Button>
                                    <Radio.Button value="month">
                                        Tháng
                                    </Radio.Button>
                                </Radio.Group>
                            </Space>
                        </Col>
                    </Row>
                </Card>

                <Card
                    variant="borderless"
                    style={{
                        borderRadius: 18,
                        boxShadow: "0 10px 26px rgba(15, 23, 42, 0.06)",
                    }}
                    bodyStyle={{ padding: "14px 18px" }}
                >
                    <Row justify="space-between" align="middle">
                        <Col>
                            <Text type="secondary">Đang xem</Text>
                            <Title level={4} style={{ margin: 0 }}>
                                {renderHeaderTitle()}
                            </Title>
                        </Col>

                        <Col>
                            <Tag
                                color="blue"
                                style={{
                                    borderRadius: 999,
                                    padding: "4px 12px",
                                }}
                            >
                                {lessons.length} lịch học
                            </Tag>
                        </Col>
                    </Row>
                </Card>

                <Spin spinning={loading}>
                    {mode === "week" && renderWeekView()}
                    {mode === "day" && renderDayView()}
                    {mode === "month" && renderMonthView()}
                </Spin>
            </Space>
        </div>
    );
};

export default TimeTablePage;
