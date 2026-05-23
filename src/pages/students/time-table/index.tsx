import {
    CalendarOutlined,
    ClockCircleOutlined,
    ReloadOutlined,
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
    Table,
    Tag,
    Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { getMyTimeTableAPI } from "@/services/api";

const { Title, Text } = Typography;

type ViewMode = "week" | "day";

type DayKey =
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";

type LessonCell = {
    subject: string;
    room: string;
    teacher: string;
    dayOfWeek: number;
    lessonStart: number;
    lessonEnd: number;
    time: string;
};

type TimeSlot = {
    key: string;
    time: string;
} & Partial<Record<DayKey, LessonCell>>;

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

const dayMap: Record<number, DayKey> = {
    2: "monday",
    3: "tuesday",
    4: "wednesday",
    5: "thursday",
    6: "friday",
    7: "saturday",
    8: "sunday",
};

const dayLabelMap: Record<number, string> = {
    2: "Thứ 2",
    3: "Thứ 3",
    4: "Thứ 4",
    5: "Thứ 5",
    6: "Thứ 6",
    7: "Thứ 7",
    8: "Chủ nhật",
};

const subjectColors = [
    "blue",
    "cyan",
    "green",
    "purple",
    "magenta",
    "orange",
    "geekblue",
];

const getSubjectColor = (name: string) => {
    let sum = 0;
    for (const char of name) sum += char.charCodeAt(0);
    return subjectColors[sum % subjectColors.length];
};

const getTodayDayOfWeek = () => {
    const jsDay = dayjs().day();

    if (jsDay === 0) return 8;

    return jsDay + 1;
};

const renderLessonCard = (lesson?: LessonCell) => {
    if (!lesson) {
        return <div style={styles.emptyCell}>Trống</div>;
    }

    return (
        <div style={styles.lessonCard}>
            <Tag
                color={getSubjectColor(lesson.subject)}
                style={{
                    marginBottom: 8,
                    borderRadius: 999,
                    whiteSpace: "normal",
                    lineHeight: 1.4,
                }}
            >
                {lesson.subject}
            </Tag>

            <div style={styles.roomText}>
                P. {lesson.room || "Chưa có phòng"}
            </div>
            <div style={styles.teacherText}>
                GV: {lesson.teacher || "Đang cập nhật"}
            </div>
        </div>
    );
};

const TimeTablePage = () => {
    const { message } = App.useApp();

    const [viewMode, setViewMode] = useState<ViewMode>("week");
    const [selectedDay, setSelectedDay] = useState<number>(getTodayDayOfWeek());
    const [weekData, setWeekData] = useState<TimeSlot[]>([]);
    const [allLessons, setAllLessons] = useState<LessonCell[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);

            const res = await getMyTimeTableAPI();
            const rawData =
                res?.data?.result || res?.data?.data || res?.data || [];

            const map = new Map<string, TimeSlot>();
            const lessons: LessonCell[] = [];

            rawData.forEach((item: any) => {
                const start =
                    lessonTimeMap[item.lessonStart] ||
                    `Tiết ${item.lessonStart}`;

                const end =
                    lessonTimeMap[item.lessonEnd + 1] ||
                    lessonTimeMap[item.lessonEnd] ||
                    `Tiết ${item.lessonEnd}`;

                const timeKey = `${start} - ${end}`;
                const dayField = dayMap[item.dayOfWeek];

                if (!dayField) return;

                const lesson: LessonCell = {
                    subject:
                        item.course?.subject ||
                        item.courseOffering?.teacherSubject?.subject?.name ||
                        item.subject?.name ||
                        "Môn học",
                    room: item.room?.name || item.room || "N/A",
                    teacher:
                        item.course?.teacher ||
                        item.courseOffering?.teacherSubject?.teacher?.user
                            ?.name ||
                        item.teacher?.name ||
                        "N/A",
                    dayOfWeek: item.dayOfWeek,
                    lessonStart: item.lessonStart,
                    lessonEnd: item.lessonEnd,
                    time: timeKey,
                };

                lessons.push(lesson);

                if (!map.has(timeKey)) {
                    map.set(timeKey, {
                        key: timeKey,
                        time: timeKey,
                    });
                }

                const slot = map.get(timeKey)!;
                slot[dayField] = lesson;
            });

            setAllLessons(
                lessons.sort((a, b) => {
                    if (a.dayOfWeek !== b.dayOfWeek)
                        return a.dayOfWeek - b.dayOfWeek;
                    return a.lessonStart - b.lessonStart;
                }),
            );

            setWeekData(
                Array.from(map.values()).sort((a, b) => {
                    const aStart = a.time.split(" - ")[0];
                    const bStart = b.time.split(" - ")[0];
                    return aStart.localeCompare(bStart);
                }),
            );
        } catch (error) {
            console.error(error);
            message.error("Không tải được thời khóa biểu");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const dayLessons = useMemo(() => {
        return allLessons.filter((item) => item.dayOfWeek === selectedDay);
    }, [allLessons, selectedDay]);

    const weekColumns: ColumnsType<TimeSlot> = [
        {
            title: "Khung giờ",
            dataIndex: "time",
            key: "time",
            fixed: "left",
            width: 140,
            render: (time: string) => (
                <div style={styles.timeCell}>
                    <ClockCircleOutlined />
                    <span>{time}</span>
                </div>
            ),
        },
        {
            title: "Thứ 2",
            dataIndex: "monday",
            render: renderLessonCard,
            width: 180,
        },
        {
            title: "Thứ 3",
            dataIndex: "tuesday",
            render: renderLessonCard,
            width: 180,
        },
        {
            title: "Thứ 4",
            dataIndex: "wednesday",
            render: renderLessonCard,
            width: 180,
        },
        {
            title: "Thứ 5",
            dataIndex: "thursday",
            render: renderLessonCard,
            width: 180,
        },
        {
            title: "Thứ 6",
            dataIndex: "friday",
            render: renderLessonCard,
            width: 180,
        },
        {
            title: "Thứ 7",
            dataIndex: "saturday",
            render: renderLessonCard,
            width: 180,
        },
        {
            title: "Chủ nhật",
            dataIndex: "sunday",
            render: renderLessonCard,
            width: 180,
        },
    ];

    return (
        <div style={styles.page}>
            <Card style={styles.heroCard} variant="borderless">
                <Row justify="space-between" align="middle" gutter={[16, 16]}>
                    <Col>
                        <Text style={styles.heroLabel}>
                            <CalendarOutlined /> Lịch học cá nhân
                        </Text>

                        <Title level={2} style={styles.heroTitle}>
                            Thời khóa biểu
                        </Title>

                        <Text style={styles.heroDesc}>
                            Hôm nay: {dayjs().format("DD/MM/YYYY")}
                        </Text>
                    </Col>

                    <Col>
                        <Space wrap>
                            <Radio.Group
                                value={viewMode}
                                onChange={(e) => setViewMode(e.target.value)}
                                buttonStyle="solid"
                            >
                                <Radio.Button value="week">
                                    Xem tuần
                                </Radio.Button>
                                <Radio.Button value="day">
                                    Xem ngày
                                </Radio.Button>
                            </Radio.Group>

                            <Button
                                icon={<ReloadOutlined />}
                                onClick={fetchData}
                                loading={loading}
                                style={styles.reloadBtn}
                            >
                                Tải lại
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {viewMode === "day" && (
                <Card style={styles.filterCard} variant="borderless">
                    <Space wrap>
                        {Object.entries(dayLabelMap).map(([value, label]) => (
                            <Button
                                key={value}
                                type={
                                    selectedDay === Number(value)
                                        ? "primary"
                                        : "default"
                                }
                                shape="round"
                                onClick={() => setSelectedDay(Number(value))}
                            >
                                {label}
                            </Button>
                        ))}
                    </Space>
                </Card>
            )}

            <Card style={styles.tableCard} variant="borderless">
                <Spin spinning={loading}>
                    {viewMode === "week" ? (
                        <Table
                            rowKey="key"
                            columns={weekColumns}
                            dataSource={weekData}
                            pagination={false}
                            scroll={{ x: 1300 }}
                            locale={{
                                emptyText: (
                                    <Empty description="Chưa có lịch học trong tuần này" />
                                ),
                            }}
                        />
                    ) : (
                        <div>
                            <Title level={4} style={{ marginBottom: 16 }}>
                                Lịch học {dayLabelMap[selectedDay]}
                            </Title>

                            {dayLessons.length === 0 ? (
                                <Empty description="Không có lịch học trong ngày này" />
                            ) : (
                                <Space
                                    direction="vertical"
                                    size={14}
                                    style={{ width: "100%" }}
                                >
                                    {dayLessons.map((lesson, index) => (
                                        <Card
                                            key={index}
                                            style={styles.dayLessonCard}
                                        >
                                            <Row
                                                align="middle"
                                                gutter={[16, 16]}
                                            >
                                                <Col xs={24} md={5}>
                                                    <div
                                                        style={
                                                            styles.dayTimeBox
                                                        }
                                                    >
                                                        <ClockCircleOutlined />
                                                        <strong>
                                                            {lesson.time}
                                                        </strong>
                                                    </div>
                                                </Col>

                                                <Col xs={24} md={19}>
                                                    <Tag
                                                        color={getSubjectColor(
                                                            lesson.subject,
                                                        )}
                                                        style={{
                                                            borderRadius: 999,
                                                            marginBottom: 8,
                                                        }}
                                                    >
                                                        {lesson.subject}
                                                    </Tag>

                                                    <div
                                                        style={styles.roomText}
                                                    >
                                                        Phòng: {lesson.room}
                                                    </div>

                                                    <div
                                                        style={
                                                            styles.teacherText
                                                        }
                                                    >
                                                        Giảng viên:{" "}
                                                        {lesson.teacher}
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Card>
                                    ))}
                                </Space>
                            )}
                        </div>
                    )}
                </Spin>
            </Card>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    page: {
        padding: 24,
        minHeight: "100vh",
        background: "#f5f7fb",
    },
    heroCard: {
        borderRadius: 24,
        background: "linear-gradient(135deg, #0f4c81 0%, #1677ff 100%)",
        boxShadow: "0 18px 45px rgba(22, 119, 255, 0.22)",
    },
    heroLabel: {
        color: "rgba(255,255,255,0.9)",
        fontWeight: 600,
    },
    heroTitle: {
        margin: "6px 0",
        color: "#fff",
        fontWeight: 800,
    },
    heroDesc: {
        color: "rgba(255,255,255,0.85)",
    },
    reloadBtn: {
        borderRadius: 999,
        fontWeight: 600,
    },
    filterCard: {
        marginTop: 16,
        borderRadius: 18,
    },
    tableCard: {
        marginTop: 16,
        borderRadius: 24,
        overflow: "hidden",
        boxShadow: "0 14px 40px rgba(15, 23, 42, 0.08)",
    },
    timeCell: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontWeight: 700,
        color: "#0f4c81",
    },
    lessonCard: {
        minHeight: 96,
        padding: 12,
        borderRadius: 16,
        background: "#ffffff",
        border: "1px solid #edf1f7",
    },
    emptyCell: {
        minHeight: 96,
        borderRadius: 16,
        border: "1px dashed #d9e2ec",
        color: "#a0aec0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fafcff",
        fontSize: 13,
    },
    dayLessonCard: {
        borderRadius: 18,
        border: "1px solid #edf1f7",
    },
    dayTimeBox: {
        height: 72,
        borderRadius: 16,
        background: "#eef6ff",
        color: "#0f4c81",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    roomText: {
        fontWeight: 700,
        color: "#1f2937",
        marginBottom: 4,
    },
    teacherText: {
        fontSize: 13,
        color: "#6b7280",
    },
};

export default TimeTablePage;
