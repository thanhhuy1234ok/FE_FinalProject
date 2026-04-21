import {
    Alert,
    Button,
    Col,
    Empty,
    Result,
    Row,
    Space,
    Spin,
    Typography,
} from "antd";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { usePaymentPage } from "./_hooks/usePaymentPage";
import PaymentInfoCard from "./_components/PaymentInfoCard";
import PaymentSummaryCard from "./_components/PaymentSummaryCard";
import PaymentItemsTable from "./_components/PaymentItemsTable";
import PaymentActionCard from "./_components/PaymentActionCard";

const { Title, Text } = Typography;

const PaymentPage = () => {
    const navigate = useNavigate();

    const {
        loading,
        paying,
        payment,
        paymentMethod,
        setPaymentMethod,
        note,
        setNote,
        activeItems,
        totalCredits,
        totalAmount,
        fetchPayment,
        onPay,
    } = usePaymentPage();

    if (loading) {
        return (
            <div
                style={{
                    minHeight: 400,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Spin size="large" />
            </div>
        );
    }

    if (!payment) {
        return (
            <Empty
                description="Hiện chưa có phiếu thanh toán"
                style={{ marginTop: 80 }}
            >
                <Button
                    onClick={() => navigate("/student/course-registration")}
                >
                    Quay lại đăng ký môn
                </Button>
            </Empty>
        );
    }

    if (payment.status === "PAID") {
        return (
            <Result
                status="success"
                title="Phiếu thanh toán đã được xử lý thành công"
                subTitle={`Mã phiếu: ${payment.code}`}
                extra={[
                    <Button
                        key="registered"
                        type="primary"
                        onClick={() => navigate("/student/course-registration")}
                    >
                        Quay lại đăng ký môn
                    </Button>,
                ]}
            />
        );
    }

    if (payment.status === "OVERDUE") {
        return (
            <Result
                status="warning"
                title="Phiếu thanh toán đã quá hạn"
                subTitle={`Mã phiếu: ${payment.code}`}
                extra={[
                    <Button key="reload" onClick={fetchPayment}>
                        Tải lại
                    </Button>,
                    <Button
                        key="back"
                        type="primary"
                        onClick={() => navigate("/student/course-registration")}
                    >
                        Quay lại đăng ký môn
                    </Button>,
                ]}
            />
        );
    }

    if (payment.status === "CANCELLED") {
        return (
            <Result
                status="info"
                title="Phiếu thanh toán đã bị hủy"
                subTitle={`Mã phiếu: ${payment.code}`}
                extra={[
                    <Button
                        key="back"
                        type="primary"
                        onClick={() => navigate("/student/course-registration")}
                    >
                        Quay lại đăng ký môn
                    </Button>,
                ]}
            />
        );
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
                <Row justify="space-between" align="middle" gutter={[16, 16]}>
                    <Col>
                        <Title level={3} style={{ margin: 0 }}>
                            Thanh toán học phí
                        </Title>
                        <Text type="secondary">
                            Vui lòng kiểm tra thông tin và hoàn tất thanh toán
                            trước hạn.
                        </Text>
                    </Col>

                    <Col>
                        <Button onClick={() => navigate(-1)}>Quay lại</Button>
                    </Col>
                </Row>
            </div>

            {!!payment.dueDate && (
                <Alert
                    type="warning"
                    showIcon
                    message={`Hạn thanh toán: ${dayjs(payment.dueDate).format(
                        "HH:mm DD/MM/YYYY",
                    )}`}
                    description="Sau thời hạn này, phiếu thanh toán có thể chuyển sang trạng thái quá hạn."
                />
            )}

            <PaymentInfoCard payment={payment} />

            <PaymentSummaryCard
                totalItems={activeItems.length}
                totalCredits={totalCredits}
                totalAmount={totalAmount}
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
                    Danh sách môn cần thanh toán
                </Title>
                <PaymentItemsTable data={payment.items ?? []} />
            </div>

            <PaymentActionCard
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                note={note}
                setNote={setNote}
                onPay={onPay}
                paying={paying}
                status={payment.status}
            />
        </Space>
    );
};

export default PaymentPage;
