import {
    BellOutlined,
    CalendarOutlined,
    ScheduleOutlined,
} from "@ant-design/icons";
import { Card, Col, Row, Space, Typography } from "antd";

const { Text, Link } = Typography;

export interface IOverviewReminder {
    count: number;
    title: string;
    description: string;
}

interface Props {
    reminder?: IOverviewReminder;
    weeklyScheduleCount?: number;
    weeklyExamCount?: number;
    onViewReminder?: () => void;
    onViewSchedule?: () => void;
    onViewExam?: () => void;
}

const StatMiniCard = ({
    title,
    value,
    linkText,
    bg,
    titleColor,
    valueColor,
    iconColor,
    borderColor,
    icon,
    onClick,
}: {
    title: string;
    value: number | string;
    linkText: string;
    bg: string;
    titleColor: string;
    valueColor: string;
    iconColor: string;
    borderColor: string;
    icon: React.ReactNode;
    onClick?: () => void;
}) => {
    return (
        <Card
            bordered={false}
            style={{
                borderRadius: 20,
                background: bg,
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.04)",
                height: "100%",
            }}
            bodyStyle={{ padding: 20 }}
        >
            <Row justify="space-between" align="middle">
                <Col>
                    <Space direction="vertical" size={8}>
                        <Text style={{ color: titleColor, fontSize: 16 }}>
                            {title}
                        </Text>

                        <div
                            style={{
                                fontSize: 48,
                                fontWeight: 600,
                                lineHeight: 1,
                                color: valueColor,
                            }}
                        >
                            {value}
                        </div>

                        <Link onClick={onClick}>{linkText}</Link>
                    </Space>
                </Col>

                <Col>
                    <div
                        style={{
                            width: 52,
                            height: 52,
                            borderRadius: "50%",
                            border: `1px solid ${borderColor}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: iconColor,
                            fontSize: 22,
                            background: "#fff",
                        }}
                    >
                        {icon}
                    </div>
                </Col>
            </Row>
        </Card>
    );
};

const OverviewTopStats = ({
    reminder,
    weeklyScheduleCount = 0,
    weeklyExamCount = 0,
    onViewReminder,
    onViewSchedule,
    onViewExam,
}: Props) => {
    return (
        <Row gutter={[20, 20]}>
            <Col xs={24}>
                <Card
                    bordered={false}
                    style={{
                        borderRadius: 20,
                        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
                    }}
                    bodyStyle={{ padding: 22 }}
                >
                    <Row justify="space-between" align="top" gutter={[16, 16]}>
                        <Col flex="auto">
                            <Space direction="vertical" size={8}>
                                <Text
                                    style={{ color: "#73808c", fontSize: 16 }}
                                >
                                    Nhắc nhở mới, chưa xem
                                </Text>

                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: 16,
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 52,
                                            lineHeight: 1,
                                            fontWeight: 500,
                                            color: "#5c7182",
                                            minWidth: 28,
                                        }}
                                    >
                                        {reminder?.count ?? 0}
                                    </div>

                                    <div>
                                        <div
                                            style={{
                                                fontSize: 16,
                                                fontWeight: 600,
                                                color: "#4f6473",
                                                lineHeight: 1.55,
                                            }}
                                        >
                                            {reminder?.title ||
                                                "Chưa có nhắc nhở"}
                                        </div>

                                        <div
                                            style={{
                                                fontSize: 15,
                                                color: "#7a8793",
                                                lineHeight: 1.6,
                                                marginTop: 4,
                                            }}
                                        >
                                            {reminder?.description || ""}
                                        </div>

                                        <div style={{ marginTop: 12 }}>
                                            <Link onClick={onViewReminder}>
                                                Xem chi tiết
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </Space>
                        </Col>

                        <Col>
                            <div
                                style={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: "50%",
                                    border: "1px solid #d5dde5",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#7a8793",
                                    fontSize: 22,
                                    background: "#fff",
                                }}
                            >
                                <BellOutlined />
                            </div>
                        </Col>
                    </Row>
                </Card>
            </Col>

            <Col xs={24} md={12}>
                <StatMiniCard
                    title="Lịch học trong tuần"
                    value={weeklyScheduleCount}
                    linkText="Xem chi tiết"
                    bg="#dff5ff"
                    titleColor="#4f88a8"
                    valueColor="#4da3ff"
                    iconColor="#4da3ff"
                    borderColor="#97ccff"
                    icon={<CalendarOutlined />}
                    onClick={onViewSchedule}
                />
            </Col>

            <Col xs={24} md={12}>
                <StatMiniCard
                    title="Lịch thi trong tuần"
                    value={weeklyExamCount}
                    linkText="Xem chi tiết"
                    bg="#fff2cc"
                    titleColor="#d28b00"
                    valueColor="#ff9800"
                    iconColor="#ff9800"
                    borderColor="#ffc766"
                    icon={<ScheduleOutlined />}
                    onClick={onViewExam}
                />
            </Col>
        </Row>
    );
};

export default OverviewTopStats;
