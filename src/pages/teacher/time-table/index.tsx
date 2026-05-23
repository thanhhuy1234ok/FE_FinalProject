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

const lessonTimeMap: Record<number, string> = {
    1: "07:00",
    2: "08:00",
    3: "09:00",
    4: "10:00",
    5: "13:00",
    6: "14:00",
    7: "15:00",
    8: "16:00",
    9: "17:00",
};

const lessonRows = [
    { lesson: 1, label: "Tiết 1", time: "07:00" },
    { lesson: 2, label: "Tiết 2", time: "08:00" },
    { lesson: 3, label: "Tiết 3", time: "09:00" },
    { lesson: 4, label: "Tiết 4", time: "10:00" },
    { lesson: 5, label: "Tiết 5", time: "13:00" },
    { lesson: 6, label: "Tiết 6", time: "14:00" },
    { lesson: 7, label: "Tiết 7", time: "15:00" },
    { lesson: 8, label: "Tiết 8", time: "16:00" },
];

const daysLabel = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

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
    const start = item.startTime || lessonTimeMap[item.lessonStart] || "--:--";
    const end =
        item.endTime ||
        lessonTimeMap[item.lessonEnd + 1] ||
        lessonTimeMap[item.lessonEnd] ||
        "--:--";

    return `${start} - ${end}`;
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

            const data =
                res.data?.data?.result ||
                res.data?.data ||
                res.data?.result ||
                res.data ||
                [];

            setSchedules(Array.isArray(data) ? data : []);
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
        const dayOfWeek = getVietnameseDay(current);

        return schedules
            .filter((item) => {
                if (item.date) {
                    return dayjs(item.date).isSame(current, "day");
                }

                if (item.dayOfWeek !== dayOfWeek) {
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
            .sort((a, b) => a.lessonStart - b.lessonStart);
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
        if (mode === "day") return currentDate.format("dddd, DD/MM/YYYY");

        if (mode === "week") {
            return `Tuần ${weekDays[0].format("DD/MM")} - ${weekDays[6].format(
                "DD/MM/YYYY",
            )}`;
        }

        return `Tháng ${currentDate.format("MM/YYYY")}`;
    };

    const renderScheduleCard = (item: TeacherSchedule) => {
        return (
            <Card
                key={item.id}
                size="small"
                hoverable
                style={{
                    borderRadius: 18,
                    marginBottom: 14,
                    border: "1px solid #dbeafe",
                    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
                }}
                bodyStyle={{ padding: 16 }}
            >
                <Space direction="vertical" size={8} style={{ width: "100%" }}>
                    <Space wrap>
                        <Tag color="blue">{item.courseCode}</Tag>
                        <Tag color="green">{item.className || "Lớp học"}</Tag>
                    </Space>

                    <Text strong style={{ fontSize: 18 }}>
                        {item.subjectName}
                    </Text>

                    <Text type="secondary" style={{ fontSize: 14 }}>
                        <ClockCircleOutlined /> {getTimeText(item)}
                    </Text>

                    <Text type="secondary" style={{ fontSize: 14 }}>
                        <EnvironmentOutlined />
                        {item.roomName || "Chưa có phòng"}
                    </Text>

                    <Text type="secondary" style={{ fontSize: 14 }}>
                        <TeamOutlined /> {item.studentCount || 0} sinh viên
                    </Text>
                </Space>
            </Card>
        );
    };

    const renderDayView = () => {
        return (
            <Card
                loading={loading}
                style={{ borderRadius: 22 }}
                title={`Lịch dạy ngày ${currentDate.format("DD/MM/YYYY")}`}
            >
                {daySchedules.length === 0 ? (
                    <Empty description="Không có lịch dạy trong ngày này" />
                ) : (
                    daySchedules.map(renderScheduleCard)
                )}
            </Card>
        );
    };

    const renderWeekView = () => {
        return (
            <Card
                loading={loading}
                style={{ borderRadius: 22, overflow: "hidden" }}
                bodyStyle={{ padding: 0 }}
            >
                <div style={{ width: "100%", overflowX: "auto" }}>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "80px repeat(7, minmax(130px, 1fr))",
                            minWidth: 980,
                            borderBottom: "1px solid #e5e7eb",
                            background: "#f8fafc",
                        }}
                    >
                        <div
                            style={{
                                padding: 12,
                                fontWeight: 800,
                                fontSize: 14,
                                color: "#334155",
                            }}
                        >
                            Tiết
                        </div>

                        {weekDays.map((date) => {
                            const isToday = date.isSame(dayjs(), "day");

                            return (
                                <div
                                    key={date.toString()}
                                    style={{
                                        padding: "12px 8px",
                                        textAlign: "center",
                                        borderLeft: "1px solid #e5e7eb",
                                        background: isToday
                                            ? "linear-gradient(135deg,#e6f4ff,#bae0ff)"
                                            : "#f8fafc",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontWeight: 800,
                                            fontSize: 14,
                                            textTransform: "capitalize",
                                            color: isToday
                                                ? "#0958d9"
                                                : "#0f172a",
                                        }}
                                    >
                                        {date.format("ddd")}
                                    </div>

                                    <Text
                                        type="secondary"
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 600,
                                        }}
                                    >
                                        {date.format("DD/MM")}
                                    </Text>
                                </div>
                            );
                        })}
                    </div>

                    {lessonRows.map((row) => (
                        <div
                            key={row.lesson}
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "80px repeat(7, minmax(130px, 1fr))",
                                minWidth: 980,
                                minHeight: 105,
                                borderBottom: "1px solid #e5e7eb",
                            }}
                        >
                            <div
                                style={{
                                    padding: 12,
                                    background: "#f8fafc",
                                    borderRight: "1px solid #e5e7eb",
                                }}
                            >
                                <Text
                                    strong
                                    style={{ fontSize: 13, color: "#334155" }}
                                >
                                    {row.label}
                                </Text>
                                <br />
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    {row.time}
                                </Text>
                            </div>

                            {weekDays.map((date) => {
                                const items = getSchedulesByDate(date).filter(
                                    (item) => row.lesson === item.lessonStart,
                                );

                                return (
                                    <div
                                        key={date.toString()}
                                        style={{
                                            padding: 8,
                                            borderLeft: "1px solid #e5e7eb",
                                            background: date.isSame(
                                                dayjs(),
                                                "day",
                                            )
                                                ? "#f0f9ff"
                                                : "#ffffff",
                                        }}
                                    >
                                        {items.map((item) => (
                                            <div
                                                key={item.id}
                                                style={{
                                                    padding: 10,
                                                    borderRadius: 14,
                                                    background:
                                                        "linear-gradient(135deg, #1677ff, #4096ff)",
                                                    color: "#fff",
                                                    marginBottom: 8,
                                                    minHeight: Math.max(
                                                        76,
                                                        (item.lessonEnd -
                                                            item.lessonStart +
                                                            1) *
                                                            66,
                                                    ),
                                                    boxShadow:
                                                        "0 8px 18px rgba(22,119,255,0.28)",
                                                    border: "1px solid rgba(255,255,255,0.24)",
                                                    transition:
                                                        "all 0.25s ease",
                                                    cursor: "pointer",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    justifyContent:
                                                        "space-between",
                                                }}
                                            >
                                                <div>
                                                    <div
                                                        style={{
                                                            fontWeight: 900,
                                                            fontSize: 14,
                                                            marginBottom: 4,
                                                            whiteSpace:
                                                                "nowrap",
                                                            overflow: "hidden",
                                                            textOverflow:
                                                                "ellipsis",
                                                        }}
                                                    >
                                                        {item.courseCode}
                                                    </div>

                                                    <div
                                                        style={{
                                                            fontSize: 13,
                                                            fontWeight: 700,
                                                            lineHeight: 1.3,
                                                            marginBottom: 6,
                                                            display:
                                                                "-webkit-box",
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient:
                                                                "vertical",
                                                            overflow: "hidden",
                                                        }}
                                                    >
                                                        {item.subjectName}
                                                    </div>

                                                    <div
                                                        style={{
                                                            fontSize: 12,
                                                            opacity: 0.96,
                                                            whiteSpace:
                                                                "nowrap",
                                                            overflow: "hidden",
                                                            textOverflow:
                                                                "ellipsis",
                                                        }}
                                                    >
                                                        <EnvironmentOutlined />{" "}
                                                        {item.roomName ||
                                                            "Chưa có phòng"}
                                                    </div>

                                                    <div
                                                        style={{
                                                            fontSize: 12,
                                                            opacity: 0.96,
                                                            whiteSpace:
                                                                "nowrap",
                                                            overflow: "hidden",
                                                            textOverflow:
                                                                "ellipsis",
                                                        }}
                                                    >
                                                        <TeamOutlined />{" "}
                                                        {item.className ||
                                                            "Lớp học"}
                                                    </div>
                                                </div>

                                                <div
                                                    style={{
                                                        marginTop: 8,
                                                        paddingTop: 7,
                                                        borderTop:
                                                            "1px solid rgba(255,255,255,0.25)",
                                                        fontSize: 12,
                                                        fontWeight: 600,
                                                        opacity: 0.96,
                                                    }}
                                                >
                                                    <ClockCircleOutlined />{" "}
                                                    {getTimeText(item)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </Card>
        );
    };
    const renderMonthView = () => {
        const cells = getMonthCells(currentDate);

        return (
            <Card
                loading={loading}
                style={{ borderRadius: 22 }}
                bodyStyle={{ padding: 12 }}
            >
                <div style={{ width: "100%", overflowX: "auto" }}>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(7, minmax(118px, 1fr))",
                            border: "1px solid #e5e7eb",
                            borderRadius: 16,
                            overflow: "hidden",
                            minWidth: 826,
                        }}
                    >
                        {daysLabel.map((day) => (
                            <div
                                key={day}
                                style={{
                                    padding: "12px 8px",
                                    textAlign: "center",
                                    fontWeight: 900,
                                    fontSize: 13,
                                    background: "#f8fafc",
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
                                    key={date.toString()}
                                    onClick={() => {
                                        setCurrentDate(date);
                                        setMode("day");
                                    }}
                                    style={{
                                        minHeight: 128,
                                        padding: 8,
                                        cursor: "pointer",
                                        background: isToday
                                            ? "#e6f4ff"
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
                                            alignItems: "center",
                                            marginBottom: 8,
                                        }}
                                    >
                                        <Text
                                            strong={isToday}
                                            style={{
                                                fontSize: 13,
                                                color: isToday
                                                    ? "#0958d9"
                                                    : "#0f172a",
                                            }}
                                        >
                                            {date.format("DD")}
                                        </Text>

                                        {items.length > 0 && (
                                            <Tag
                                                color="blue"
                                                style={{
                                                    margin: 0,
                                                    fontSize: 11,
                                                    lineHeight: "18px",
                                                }}
                                            >
                                                {items.length}
                                            </Tag>
                                        )}
                                    </div>

                                    <Space
                                        direction="vertical"
                                        size={5}
                                        style={{ width: "100%" }}
                                    >
                                        {items.slice(0, 2).map((item) => (
                                            <div
                                                key={item.id}
                                                style={{
                                                    padding: "6px 7px",
                                                    borderRadius: 9,
                                                    background: "#eff6ff",
                                                    border: "1px solid #bfdbfe",
                                                    lineHeight: 1.3,
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
        <div style={{ padding: "16px", maxWidth: "100%", overflowX: "hidden" }}>
            <Space direction="vertical" size={18} style={{ width: "100%" }}>
                <Card
                    style={{
                        borderRadius: 24,
                        background:
                            "linear-gradient(135deg, #eef5ff 0%, #ffffff 55%, #f6ffed 100%)",
                    }}
                    bodyStyle={{ padding: 26 }}
                >
                    <Row
                        justify="space-between"
                        align="middle"
                        gutter={[16, 16]}
                    >
                        <Col>
                            <Space direction="vertical" size={4}>
                                <Title level={3} style={{ margin: 0 }}>
                                    <CalendarOutlined /> Thời khóa biểu giáo
                                    viên
                                </Title>

                                <Text type="secondary" style={{ fontSize: 15 }}>
                                    Xem lịch dạy theo ngày, tuần hoặc tháng.
                                </Text>
                            </Space>
                        </Col>

                        <Col>
                            <Space wrap>
                                <Radio.Group
                                    value={mode}
                                    onChange={(e) => setMode(e.target.value)}
                                    optionType="button"
                                    buttonStyle="solid"
                                >
                                    <Radio.Button value="day">
                                        Ngày
                                    </Radio.Button>
                                    <Radio.Button value="week">
                                        Tuần
                                    </Radio.Button>
                                    <Radio.Button value="month">
                                        Tháng
                                    </Radio.Button>
                                </Radio.Group>

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
                            </Space>
                        </Col>
                    </Row>
                </Card>

                <Card style={{ borderRadius: 20 }}>
                    <Row
                        justify="space-between"
                        align="middle"
                        gutter={[16, 16]}
                    >
                        <Col>
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
                                    { label: "Theo ngày", value: "day" },
                                    { label: "Theo tuần", value: "week" },
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
