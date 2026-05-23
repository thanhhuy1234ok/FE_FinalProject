import { Card, Col, Row, Statistic, Tag, Typography } from "antd";
import dayjs from "dayjs";

const { Text } = Typography;

type Props = {
    totalItems: number;
    totalCredits: number;
    totalAmount: number;
    dueDate?: string | Date | null; // 👈 thêm
};

const formatCurrency = (value?: number | string) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(Number(value || 0));

const PaymentSummaryCard = ({
    totalItems,
    totalCredits,
    totalAmount,
    dueDate,
}: Props) => {
    const isOverdue = dueDate && dayjs(dueDate).isBefore(dayjs());

    const remainHours = dueDate ? dayjs(dueDate).diff(dayjs(), "hour") : null;

    return (
        <Card title="Tổng quan thanh toán" style={{ borderRadius: 16 }}>
            <Row gutter={[16, 16]}>
                <Col xs={24} md={6}>
                    <Statistic
                        title="Số môn cần thanh toán"
                        value={totalItems}
                    />
                </Col>

                <Col xs={24} md={6}>
                    <Statistic title="Tổng số tín chỉ" value={totalCredits} />
                </Col>

                <Col xs={24} md={6}>
                    <Statistic
                        title="Tổng tiền"
                        value={totalAmount}
                        formatter={() => formatCurrency(totalAmount)}
                        valueStyle={{
                            color: "#cf1322",
                            fontWeight: 700,
                        }}
                    />
                </Col>

                <Col xs={24} md={6}>
                    <div>
                        <Text type="secondary">Hạn thanh toán</Text>

                        <div style={{ marginTop: 4 }}>
                            {dueDate ? (
                                <>
                                    <div style={{ fontWeight: 600 }}>
                                        {dayjs(dueDate).format(
                                            "DD/MM/YYYY HH:mm",
                                        )}
                                    </div>

                                    {isOverdue ? (
                                        <Tag color="red">Đã quá hạn</Tag>
                                    ) : (
                                        <Tag color="gold">
                                            Còn {remainHours} giờ
                                        </Tag>
                                    )}
                                </>
                            ) : (
                                <Text type="secondary">Không có hạn</Text>
                            )}
                        </div>
                    </div>
                </Col>
            </Row>
        </Card>
    );
};

export default PaymentSummaryCard;
