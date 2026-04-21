import { useEffect, useState } from "react";
import { Alert, Button, Empty, Space, Spin, Typography, message } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import PaymentInfoCard from "../PaymentInfoCard";
import PaymentSummaryCard from "../PaymentSummaryCard";
import PaymentItemsTable from "../PaymentItemsTable";
import { getPaymentDetailAPI } from "@/services/api";

const { Title } = Typography;

const PaymentDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [payment, setPayment] = useState<IPayment | null>(null);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                setLoading(true);
                const res = await getPaymentDetailAPI(Number(id));
                const data = res?.data ?? res;
                setPayment(data ?? null);
            } catch (error: any) {
                message.error(
                    error?.message || "Không thể tải chi tiết phiếu thanh toán",
                );
                setPayment(null);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchDetail();
    }, [id]);

    if (loading) {
        return (
            <div
                style={{
                    minHeight: 400,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Spin size="large" />
            </div>
        );
    }

    if (!payment) {
        return <Empty description="Không tìm thấy phiếu thanh toán" />;
    }

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
                <Space
                    style={{ width: "100%", justifyContent: "space-between" }}
                >
                    <Title level={3} style={{ margin: 0 }}>
                        Chi tiết phiếu thanh toán
                    </Title>
                    <Button onClick={() => navigate("/payment/history")}>
                        Quay lại
                    </Button>
                </Space>
            </div>

            {payment.status === "PAID" && (
                <Alert
                    type="success"
                    showIcon
                    message="Phiếu này đã được thanh toán thành công"
                />
            )}

            <PaymentInfoCard payment={payment} />

            <PaymentSummaryCard
                totalItems={
                    (payment.items ?? []).filter(
                        (item) => item.status === "ACTIVE",
                    ).length
                }
                totalCredits={payment.totalCredits}
                totalAmount={payment.totalAmount}
            />

            <div
                style={{
                    background: "#fff",
                    borderRadius: 16,
                    padding: 20,
                    border: "1px solid #f0f0f0",
                }}
            >
                <Title level={4} style={{ marginTop: 0 }}>
                    Chi tiết các môn học
                </Title>
                <PaymentItemsTable data={payment.items ?? []} />
            </div>
        </Space>
    );
};

export default PaymentDetailPage;
