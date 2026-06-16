import {
    Button,
    Card,
    Col,
    Empty,
    Radio,
    Row,
    Select,
    Space,
    Tag,
    Typography,
} from "antd";
import {
    CalendarOutlined,
    ClockCircleOutlined,
    EnvironmentOutlined,
    LeftOutlined,
    RightOutlined,
    TeamOutlined,
} from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/vi";
import { getTeacherTimeTableAPI } from "@/services/api";

dayjs.locale("vi");

const { Title, Text } = Typography;

type ViewMode = "day" | "week" | "month";

type TeacherSchedule = {
    id: number;
    subjectName: string;
    courseCode: string;
    className?: string | null;
    roomName?: string | null;
    dayOfWeek: number;
    lessonStart: number;
    lessonEnd: number;
    startTime?: string;
    endTime?: string;
    startDate?: string | null;
    endDate?: string | null;
    date?: string | null;
    studentCount?: number;
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
const COURSE_COLOR = "linear-gradient(135deg, #1677ff 0%, #4096ff 100%)";

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

const getTimeText = (item: TeacherSchedule) => {
    const start =
        item.startTime || LESSON_TIME_MAP[item.lessonStart]?.start || "--:--";

    const end = item.endTime || LESSON_TIME_MAP[item.lessonEnd]?.end || "--:--";

    return `${start} - ${end}`;
};

const getResponseArray = (res: any): TeacherSchedule[] => {
    const data =
        res?.data?.data?.result ||
        res?.data?.data ||
        res?.data?.result ||
        res?.data ||
        [];

    return Array.isArray(data) ? data : [];
};

const TablePage = () => {
    const [mode, setMode] = useState<ViewMode>("week");
    const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
    const [loading, setLoading] = useState(false);
    const [schedules, setSchedules] = useState<TeacherSchedule[]>([]);

    const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

    const fetchTeacherTimetable = async () => {
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

            const res = await getTeacherTimeTableAPI(params);
            const data = getResponseArray(res);

            setSchedules(data);
        } catch (error) {
            console.log(error);
            setSchedules([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeacherTimetable();
    }, [mode, currentDate]);

    const getSchedulesByDate = (date: Dayjs) => {
        const current = date.startOf("day");
        const currentDayOfWeek = getVietnameseDay(current);

        return schedules
            .filter((item) => {
                if (item.date) {
                    return dayjs(item.date).isSame(current, "day");
                }

                if (Number(item.dayOfWeek) !== currentDayOfWeek) {
                    return false;
                }

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
            .sort((a, b) => Number(a.lessonStart) - Number(b.lessonStart));
    };

    const daySchedules = useMemo(
        () => getSchedulesByDate(currentDate),
        [currentDate, schedules],
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

    const renderScheduleBlock = (item: TeacherSchedule) => (
        <div
            key={item.id}
            style={{
                height: "100%",
                padding: 12,
                borderRadius: 16,
                background: COURSE_COLOR,
                color: "#fff",
                boxShadow: "0 10px 24px rgba(22,119,255,0.25)",
                border: "1px solid rgba(255,255,255,0.35)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                overflow: "hidden",
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
                    title={item.courseCode}
                >
                    {item.courseCode}
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
                    title={item.subjectName}
                >
                    {item.subjectName}
                </div>

                <div style={{ fontSize: 12, opacity: 0.95 }}>
                    <EnvironmentOutlined /> {item.roomName || "Chưa có phòng"}
                </div>

                <div style={{ fontSize: 12, opacity: 0.95 }}>
                    <TeamOutlined /> {item.className || "Lớp học"}
                </div>

                <div style={{ fontSize: 12, opacity: 0.95 }}>
                    {item.studentCount || 0} sinh viên
                </div>
            </div>

            <div
                style={{
                    marginTop: 8,
                    paddingTop: 8,
                    borderTop: "1px solid rgba(255,255,255,0.28)",
                    fontSize: 12,
                    fontWeight: 700,
                }}
            >
                <ClockCircleOutlined /> {getTimeText(item)}
            </div>
        </div>
    );

    const renderDayView = () => (
        <Card
            loading={loading}
            style={{ borderRadius: 22 }}
            title={`Lịch dạy ngày ${currentDate.format("DD/MM/YYYY")}`}
        >
            {daySchedules.length === 0 ? (
                <Empty description="Không có lịch dạy trong ngày này" />
            ) : (
                <Space direction="vertical" size={14} style={{ width: "100%" }}>
                    {daySchedules.map((item) => (
                        <Card
                            key={item.id}
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
                                        {getTimeText(item)}
                                    </div>
                                </Col>

                                <Col xs={24} md={19}>
                                    <Space wrap>
                                        <Tag color="blue">
                                            {item.courseCode}
                                        </Tag>
                                        <Tag color="green">
                                            {item.className || "Lớp học"}
                                        </Tag>
                                    </Space>

                                    <div
                                        style={{
                                            fontWeight: 800,
                                            marginTop: 8,
                                            fontSize: 16,
                                        }}
                                    >
                                        {item.subjectName}
                                    </div>

                                    <div
                                        style={{
                                            color: "#64748b",
                                            marginTop: 4,
                                        }}
                                    >
                                        <EnvironmentOutlined /> Phòng:{" "}
                                        {item.roomName || "Chưa có phòng"}
                                    </div>

                                    <div style={{ color: "#64748b" }}>
                                        <TeamOutlined />{" "}
                                        {item.studentCount || 0} sinh viên
                                    </div>
                                </Col>
                            </Row>
                        </Card>
                    ))}
                </Space>
            )}
        </Card>
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
                            const dayItems = getSchedulesByDate(date);
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

                                    {dayItems.map((item) => {
                                        const top =
                                            (Number(item.lessonStart) - 1) *
                                            ROW_HEIGHT;

                                        const span =
                                            Number(item.lessonEnd) -
                                            Number(item.lessonStart) +
                                            1;

                                        const height = span * ROW_HEIGHT - 12;

                                        return (
                                            <div
                                                key={item.id}
                                                style={{
                                                    position: "absolute",
                                                    left: 10,
                                                    right: 10,
                                                    top: top + 6,
                                                    height,
                                                    zIndex: 2,
                                                }}
                                            >
                                                {renderScheduleBlock(item)}
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
                            const items = getSchedulesByDate(date);

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
                                                    {item.courseCode}
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
                                                    {item.roomName ||
                                                        "Chưa có phòng"}{" "}
                                                    • T{item.lessonStart}-
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
                                        Thời khóa biểu giáo viên
                                    </Title>

                                    <Text type="secondary">
                                        Xem lịch dạy theo ngày, tuần hoặc tháng
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
                            <Select
                                value={mode}
                                style={{ width: 150 }}
                                onChange={(value) => setMode(value)}
                                options={[
                                    { label: "Theo tuần", value: "week" },
                                    { label: "Theo ngày", value: "day" },
                                    { label: "Theo tháng", value: "month" },
                                ]}
                            />
                        </Col>
                    </Row>
                </Card>

                {mode === "day" && renderDayView()}
                {mode === "week" && renderWeekView()}
                {mode === "month" && renderMonthView()}
            </Space>
        </div>
    );
};

export default TablePage;
