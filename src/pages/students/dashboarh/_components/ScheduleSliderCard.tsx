import { CalendarOutlined } from "@ant-design/icons";
import { Card, Empty, Space, Tag, Typography } from "antd";
import { useMemo } from "react";

const { Text, Link } = Typography;

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
    10: "18:00",
};

const getTodayValue = () => {
    const day = new Date().getDay();

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
                borderRadius: 4,
                boxShadow: "0 1px 3px rgba(15,23,42,.12)",
                background: "#dff6ff",
            }}
            bodyStyle={{ padding: 0 }}
        >
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

            <div
                style={{
                    maxHeight: 170,
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
                            const subject = item.course?.subject;
                            const teacher = item.course?.teacher;

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
                                            gap: 10,
                                            alignItems: "flex-start",
                                        }}
                                    >
                                        <div
                                            style={{
                                                minWidth: 52,
                                                color: "#1677ff",
                                                fontWeight: 700,
                                            }}
                                        >
                                            {lessonTimeMap[item.lessonStart] ||
                                                "--"}
                                        </div>

                                        <div style={{ flex: 1 }}>
                                            <div
                                                style={{
                                                    fontWeight: 700,
                                                    color: "#0f172a",
                                                    marginBottom: 2,
                                                }}
                                            >
                                                {subject || "Môn học"}
                                            </div>

                                            <Text type="secondary">
                                                {item.course?.code || "--"}
                                            </Text>

                                            <div style={{ marginTop: 6 }}>
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
                                                    marginTop: 4,
                                                    color: "#64748b",
                                                    fontSize: 12,
                                                }}
                                            >
                                                GV: {teacher || "--"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </Space>
                )}
            </div>

            <div
                style={{
                    padding: "8px 16px",
                    background: "#fff",
                    borderTop: "1px solid #edf2f7",
                }}
            >
                <Link onClick={onViewAll}>Xem chi tiết</Link>
            </div>
        </Card>
    );
};

export default TodayScheduleCard;
