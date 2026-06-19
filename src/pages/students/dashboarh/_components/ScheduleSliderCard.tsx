import { CalendarOutlined } from "@ant-design/icons";
import { Card, Empty, Space, Tag, Typography } from "antd";
import { useMemo } from "react";

const { Text, Link } = Typography;

export const LESSON_TIME_MAP: Record<number, { start: string; end: string }> = {
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
    12: { start: "21:20", end: "22:10" },
};

type ScheduleItem = {
    id: number;
    dayOfWeek: number;
    lessonStart: number;
    lessonEnd: number;
    room: string;
    course?: {
        code: string;
        id: number;
        subject: string;
        teacher: string;
    };
};

interface Props {
    schedules: ScheduleItem[];
    loading?: boolean;
    onViewAll?: () => void;
}

const getTodayValue = () => {
    const day = new Date().getDay();

    // Chủ nhật = 8
    return day === 0 ? 8 : day + 1;
};

const TodayScheduleCard = ({ schedules, loading, onViewAll }: Props) => {
    const todaySchedules = useMemo(() => {
        const today = getTodayValue();

        return schedules
            .filter((item) => item.dayOfWeek === today)
            .sort((a, b) => a.lessonStart - b.lessonStart);
    }, [schedules]);

    return (
        <Card
            bordered={false}
            loading={loading}
            style={{
                borderRadius: 8,
                boxShadow: "0 1px 3px rgba(15,23,42,.12)",
                background: "#dff6ff",
            }}
            bodyStyle={{ padding: 0 }}
        >
            {/* Header */}
            <div
                style={{
                    padding: "14px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid rgba(15,23,42,.08)",
                }}
            >
                <div>
                    <Text style={{ color: "#4f88a8" }}>Lịch học hôm nay</Text>

                    <div
                        style={{
                            fontSize: 26,
                            fontWeight: 700,
                            color: "#1677ff",
                            lineHeight: 1.2,
                        }}
                    >
                        {todaySchedules.length}
                    </div>
                </div>

                <div
                    style={{
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        border: "1px solid #1677ff",
                        color: "#1677ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <CalendarOutlined />
                </div>
            </div>

            {/* Content */}
            <div
                style={{
                    maxHeight: 280,
                    overflowY: "auto",
                    background: "#fff",
                }}
            >
                {todaySchedules.length === 0 ? (
                    <div style={{ padding: 18 }}>
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="Hôm nay không có lịch học"
                        />
                    </div>
                ) : (
                    <Space
                        direction="vertical"
                        size={0}
                        style={{ width: "100%" }}
                    >
                        {todaySchedules.map((item) => {
                            const subject = item.course?.subject || "Môn học";

                            const teacher = item.course?.teacher || "--";

                            const startTime =
                                LESSON_TIME_MAP[item.lessonStart]?.start ||
                                "--";

                            const endTime =
                                LESSON_TIME_MAP[item.lessonEnd]?.end || "--";

                            return (
                                <div
                                    key={item.id}
                                    style={{
                                        padding: "12px 14px",
                                        borderBottom: "1px solid #edf2f7",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: 12,
                                            alignItems: "flex-start",
                                        }}
                                    >
                                        {/* Time */}
                                        <div
                                            style={{
                                                minWidth: 80,
                                                textAlign: "center",
                                                background: "#eff6ff",
                                                borderRadius: 8,
                                                padding: "6px 8px",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    color: "#1677ff",
                                                    fontWeight: 700,
                                                    fontSize: 14,
                                                }}
                                            >
                                                {startTime}
                                            </div>

                                            <div
                                                style={{
                                                    color: "#64748b",
                                                    fontSize: 12,
                                                }}
                                            >
                                                {endTime}
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div
                                            style={{
                                                flex: 1,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontWeight: 700,
                                                    color: "#0f172a",
                                                    marginBottom: 4,
                                                }}
                                            >
                                                {subject}
                                            </div>

                                            <Text type="secondary">
                                                {item.course?.code || "--"}
                                            </Text>

                                            <div
                                                style={{
                                                    marginTop: 8,
                                                }}
                                            >
                                                <Space wrap size={[4, 4]}>
                                                    <Tag color="blue">
                                                        Tiết {item.lessonStart}-
                                                        {item.lessonEnd}
                                                    </Tag>

                                                    <Tag color="green">
                                                        Phòng{" "}
                                                        {item.room || "--"}
                                                    </Tag>
                                                </Space>
                                            </div>

                                            <div
                                                style={{
                                                    marginTop: 6,
                                                    color: "#64748b",
                                                    fontSize: 12,
                                                }}
                                            >
                                                GV: {teacher}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </Space>
                )}
            </div>

            {/* Footer */}
            <div
                style={{
                    padding: "8px 16px",
                    background: "#fff",
                    borderTop: "1px solid #edf2f7",
                }}
            >
                <Link onClick={onViewAll}>Xem chi tiết lịch học</Link>
            </div>
        </Card>
    );
};

export default TodayScheduleCard;
