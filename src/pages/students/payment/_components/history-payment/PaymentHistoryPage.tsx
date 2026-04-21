import { Button, Empty, Space, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { usePaymentHistory } from "../../_hooks/usePaymentHistory";
import PaidPaymentsTable from "./PaidPaymentsTable";

const { Title, Text } = Typography;

const PaymentHistoryPage = () => {
    const navigate = useNavigate();
    const { loading, paidPayments } = usePaymentHistory();

    return (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <div
                style={{
                    background: "#fff",
                    borderRadius: 16,
                    padding: 20,
                    border: "1px solid #f0f0f0",
                }}
            >
                <Space direction="vertical" size={4} style={{ width: "100%" }}>
                    <Title level={3} style={{ margin: 0 }}>
                        Lịch sử thanh toán
                    </Title>
                    <Text type="secondary">
                        Danh sách các phiếu học phí đã được thanh toán thành
                        công.
                    </Text>
                </Space>
            </div>

            <div
                style={{
                    background: "#fff",
                    borderRadius: 16,
                    padding: 20,
                    border: "1px solid #f0f0f0",
                }}
            >
                {paidPayments.length === 0 && !loading ? (
                    <Empty description="Chưa có phiếu thanh toán nào đã hoàn tất">
                        <Button
                            type="primary"
                            onClick={() => navigate("/payment")}
                        >
                            Đi đến trang thanh toán
                        </Button>
                    </Empty>
                ) : (
                    <PaidPaymentsTable data={paidPayments} />
                )}
            </div>
        </Space>
    );
};

export default PaymentHistoryPage;
