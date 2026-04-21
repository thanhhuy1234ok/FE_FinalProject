import { Card, Col, Row, Statistic } from "antd";

interface Props {
    totalCredits: number;
    totalAmount: number;
    totalItems: number;
}

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(Number(value || 0));

const PaymentSummaryCard = ({
    totalCredits,
    totalAmount,
    totalItems,
}: Props) => {
    return (
        <Card title="Tổng quan thanh toán" style={{ borderRadius: 16 }}>
            <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                    <Statistic
                        title="Số môn cần thanh toán"
                        value={totalItems}
                    />
                </Col>
                <Col xs={24} md={8}>
                    <Statistic title="Tổng số tín chỉ" value={totalCredits} />
                </Col>
                <Col xs={24} md={8}>
                    <Statistic
                        title="Tổng tiền"
                        value={totalAmount}
                        formatter={(value) =>
                            formatCurrency(Number(value || 0))
                        }
                    />
                </Col>
            </Row>
        </Card>
    );
};

export default PaymentSummaryCard;
