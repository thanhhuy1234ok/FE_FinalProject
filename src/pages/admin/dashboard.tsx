import {
    DollarOutlined,
    RiseOutlined,
    TeamOutlined,
    UserOutlined,
    WalletOutlined,
} from "@ant-design/icons";
import { Column } from "@ant-design/plots";
import {
    Avatar,
    Card,
    Col,
    Row,
    Select,
    Skeleton,
    Space,
    Statistic,
    Typography,
} from "antd";
import CountUp from "react-countup";
import { useEffect, useMemo, useState } from "react";
import {
    getPaymentDashboardOverviewAPI,
    getPaymentStatisticsAPI,
    getPaymentStatisticsByTermAPI,
    getPaymentStatisticsByYearAPI,
    getUserStatisticsAPI,
} from "@/services/api";

const { Text, Title } = Typography;

interface IUserStatistics {
    totalUsers: number;
    totalStudents: number;
    totalTeachers: number;
    totalAdmins: number;
}

interface IPaymentStatistics {
    totalPayments: number;
    pendingPayments: number;
    paidPayments: number;
    totalRevenue: number;
}

interface IPaymentOverview {
    activeTerm: string;
    paidRate: number;
    revenueGrowth: number;
    bestTerm: string;
}

interface IPaymentTermStatistic {
    termId: number;
    semester: string;
    year: number;
    totalRevenue: number;
    totalPayments: number;
    paidPayments: number;
    pendingPayments: number;
}

interface IPaymentYearStatistic {
    year: number;
    totalRevenue: number;
    totalPayments: number;
    paidPayments: number;
    pendingPayments: number;
}

const Dashboard = () => {
    const [userStats, setUserStats] = useState<IUserStatistics | null>(null);
    const [paymentStats, setPaymentStats] = useState<IPaymentStatistics | null>(
        null,
    );
    const [overview, setOverview] = useState<IPaymentOverview | null>(null);
    const [termStats, setTermStats] = useState<IPaymentTermStatistic[]>([]);
    const [yearStats, setYearStats] = useState<IPaymentYearStatistic[]>([]);
    const [statMode, setStatMode] = useState<"term" | "year">("term");
    const [chartType, setChartType] = useState<"revenue" | "payment">(
        "revenue",
    );
    const [loading, setLoading] = useState(false);

    const formatter = (value: number | string) => (
        <CountUp end={Number(value)} separator="," />
    );

    const formatCurrency = (value?: number) =>
        new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(value || 0);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                setLoading(true);

                const [userRes, paymentRes, overviewRes, termRes, yearRes] =
                    await Promise.all([
                        getUserStatisticsAPI(),
                        getPaymentStatisticsAPI(),
                        getPaymentDashboardOverviewAPI(),
                        getPaymentStatisticsByTermAPI(),
                        getPaymentStatisticsByYearAPI(),
                    ]);

                setUserStats(userRes?.data || null);
                setPaymentStats(paymentRes?.data || null);
                setOverview(overviewRes?.data || null);
                setTermStats(termRes?.data || []);
                setYearStats(yearRes?.data || []);
            } catch (error) {
                console.log("Fetch dashboard statistics error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    const chartData = useMemo(() => {
        if (statMode === "year") {
            return yearStats.map((item) => ({
                label: `${item.year}`,
                revenue: Number(item.totalRevenue || 0),
                payments: Number(item.paidPayments || 0),
                totalPayments: Number(item.totalPayments || 0),
                pendingPayments: Number(item.pendingPayments || 0),
            }));
        }

        return termStats.map((item) => ({
            label: `${item.semester} - ${item.year}`,
            revenue: Number(item.totalRevenue || 0),
            payments: Number(item.paidPayments || 0),
            totalPayments: Number(item.totalPayments || 0),
            pendingPayments: Number(item.pendingPayments || 0),
        }));
    }, [termStats, yearStats, statMode]);

    const chartConfig = {
        data: chartData,
        xField: "label",
        yField: chartType === "revenue" ? "revenue" : "payments",
        height: 360,
        columnWidthRatio: 0.45,
        radiusTopLeft: 10,
        radiusTopRight: 10,
        tooltip: {
            title: (datum: any) =>
                statMode === "year" ? `Năm học ${datum.label}` : datum.label,
            items: [
                {
                    field: "revenue",
                    name: "Tổng tiền",
                    valueFormatter: (value: number) => formatCurrency(value),
                },
                {
                    field: "totalPayments",
                    name: "Tổng hóa đơn",
                    valueFormatter: (value: number) => `${value} hóa đơn`,
                },
                {
                    field: "payments",
                    name: "Đã thanh toán",
                    valueFormatter: (value: number) => `${value} hóa đơn`,
                },
                {
                    field: "pendingPayments",
                    name: "Chờ thanh toán",
                    valueFormatter: (value: number) => `${value} hóa đơn`,
                },
            ],
        },
        axis: {
            y: {
                labelFormatter: (value: number) =>
                    chartType === "revenue" ? `${value / 1_000_000}tr` : value,
            },
        },
    };

    return (
        <div style={{ padding: 4 }}>
            <Space direction="vertical" size={4} style={{ marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>
                    Dashboard Admin
                </Title>

                <Text type="secondary">
                    Tổng quan nhanh hệ thống quản lý trường học
                </Text>
            </Space>

            <Skeleton loading={loading} active>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card bordered={false} style={{ borderRadius: 18 }}>
                            <Statistic
                                title="Người dùng"
                                value={userStats?.totalUsers || 0}
                                formatter={formatter}
                                prefix={
                                    <Avatar
                                        size={48}
                                        style={{
                                            backgroundColor: "#e6f4ff",
                                            color: "#1677ff",
                                        }}
                                        icon={<UserOutlined />}
                                    />
                                }
                            />
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card bordered={false} style={{ borderRadius: 18 }}>
                            <Statistic
                                title="Sinh viên"
                                value={userStats?.totalStudents || 0}
                                formatter={formatter}
                                prefix={
                                    <Avatar
                                        size={48}
                                        style={{
                                            backgroundColor: "#f6ffed",
                                            color: "#52c41a",
                                        }}
                                        icon={<UserOutlined />}
                                    />
                                }
                            />
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card bordered={false} style={{ borderRadius: 18 }}>
                            <Statistic
                                title="Giảng viên"
                                value={userStats?.totalTeachers || 0}
                                formatter={formatter}
                                prefix={
                                    <Avatar
                                        size={48}
                                        style={{
                                            backgroundColor: "#fff7e6",
                                            color: "#fa8c16",
                                        }}
                                        icon={<TeamOutlined />}
                                    />
                                }
                            />
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card bordered={false} style={{ borderRadius: 18 }}>
                            <Statistic
                                title="Doanh thu"
                                value={paymentStats?.totalRevenue || 0}
                                formatter={formatter}
                                suffix="VNĐ"
                                prefix={
                                    <Avatar
                                        size={48}
                                        style={{
                                            backgroundColor: "#f9f0ff",
                                            color: "#722ed1",
                                        }}
                                        icon={<DollarOutlined />}
                                    />
                                }
                            />
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card bordered={false} style={{ borderRadius: 18 }}>
                            <Statistic
                                title="Học kỳ hiện tại"
                                value={overview?.activeTerm || "Chưa có"}
                            />
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card bordered={false} style={{ borderRadius: 18 }}>
                            <Statistic
                                title="Tỷ lệ thanh toán"
                                value={overview?.paidRate || 0}
                                suffix="%"
                                valueStyle={{ color: "#1677ff" }}
                            />
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card bordered={false} style={{ borderRadius: 18 }}>
                            <Statistic
                                title="Tăng trưởng"
                                value={overview?.revenueGrowth || 0}
                                suffix="%"
                                valueStyle={{
                                    color:
                                        Number(overview?.revenueGrowth || 0) >=
                                        0
                                            ? "#52c41a"
                                            : "#ff4d4f",
                                }}
                                prefix={<RiseOutlined />}
                            />
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card bordered={false} style={{ borderRadius: 18 }}>
                            <Statistic
                                title="Kỳ doanh thu cao nhất"
                                value={overview?.bestTerm || "Chưa có"}
                            />
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                    <Col xs={24} lg={7}>
                        <Card
                            bordered={false}
                            style={{
                                borderRadius: 18,
                                height: "100%",
                            }}
                        >
                            <Space
                                direction="vertical"
                                size={28}
                                style={{ width: "100%" }}
                            >
                                <Statistic
                                    title="Tổng hóa đơn"
                                    value={paymentStats?.totalPayments || 0}
                                    formatter={formatter}
                                    prefix={<WalletOutlined />}
                                />

                                <Statistic
                                    title="Đã thanh toán"
                                    value={paymentStats?.paidPayments || 0}
                                    formatter={formatter}
                                    valueStyle={{ color: "#52c41a" }}
                                />

                                <Statistic
                                    title="Chờ thanh toán"
                                    value={paymentStats?.pendingPayments || 0}
                                    formatter={formatter}
                                    valueStyle={{ color: "#fa8c16" }}
                                />
                            </Space>
                        </Card>
                    </Col>

                    <Col xs={24} lg={17}>
                        <Card
                            bordered={false}
                            style={{ borderRadius: 18 }}
                            title={
                                statMode === "year"
                                    ? "Thống kê doanh thu theo năm học"
                                    : "Thống kê thanh toán theo học kỳ"
                            }
                            extra={
                                <Space>
                                    <Select
                                        value={statMode}
                                        style={{ width: 150 }}
                                        onChange={setStatMode}
                                        options={[
                                            {
                                                label: "Theo học kỳ",
                                                value: "term",
                                            },
                                            {
                                                label: "Theo năm",
                                                value: "year",
                                            },
                                        ]}
                                    />

                                    <Select
                                        value={chartType}
                                        style={{ width: 140 }}
                                        onChange={setChartType}
                                        options={[
                                            {
                                                label: "Doanh thu",
                                                value: "revenue",
                                            },
                                            {
                                                label: "Hóa đơn",
                                                value: "payment",
                                            },
                                        ]}
                                    />
                                </Space>
                            }
                        >
                            <Column {...chartConfig} />
                        </Card>
                    </Col>
                </Row>
            </Skeleton>
        </div>
    );
};

export default Dashboard;
