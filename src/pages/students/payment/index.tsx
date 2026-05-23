import {
    Alert,
    Button,
    Card,
    Col,
    Empty,
    Row,
    Space,
    Spin,
    Statistic,
    Table,
    Tag,
    Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import {
    usePaymentPage,
    type PaymentCourseItem,
} from "./_hooks/usePaymentPage";
import PaymentMethodCard, {
    type PaymentMethod,
} from "./_components/PaymentActionCard";
import { useState } from "react";
import PaymentHeaderCard from "./_components/PaymentHeaderCard";
import PaymentSummaryCard from "./_components/PaymentSummaryCard";
import PaymentCourseTableCard from "./_components/PaymentCourseTableCard";

const { Title, Text } = Typography;

const formatCurrency = (value?: number | string) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(Number(value || 0));

const PaymentPage = () => {
    const navigate = useNavigate();
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("VNPAY");
    const {
        loading,
        paying,
        items,
        totalCredits,
        totalAmount,
        fetchPayment,
        onPay,
        dueDate,
    } = usePaymentPage();

    const columns: ColumnsType<PaymentCourseItem> = [
        {
            title: "STT",
            width: 40,
            align: "center",
            render: (_value, _record, index) => index + 1,
        },
        {
            title: "Mã LHP",
            dataIndex: "courseCode",
            width: 180,
            render: (value) => <Text strong>{value || "--"}</Text>,
        },
        {
            title: "Môn học",
            key: "subject",
            width: 220,
            render: (_, record) => (
                <div>
                    <Text strong>{record.subject?.name || "--"}</Text>
                    <br />
                    <Text type="secondary">{record.subject?.code || "--"}</Text>
                </div>
            ),
        },
        {
            title: "Giảng viên",
            key: "teacher",
            width: 170,
            render: (_, record) => record.teacher?.name || "--",
        },
        {
            title: "Kỳ học",
            key: "term",
            width: 130,
            render: (_, record) =>
                record.term
                    ? `${record.term.semester} - ${record.term.year}`
                    : "--",
        },
        {
            title: "Tín chỉ",
            key: "credit",
            width: 50,
            align: "center",
            render: (_, record) => record.subject?.credit ?? 0,
        },
        {
            title: "Đơn giá",
            dataIndex: "unitPrice",
            width: 130,
            align: "right",
            render: (value) => formatCurrency(value),
        },
        {
            title: "Thành tiền",
            dataIndex: "amount",
            width: 160,
            align: "right",
            render: (value) => <Text strong>{formatCurrency(value)}</Text>,
        },
        {
            title: "Trạng thái",
            key: "status",
            width: 160,
            align: "center",
            render: (_, record) => {
                if (!record.payment) {
                    return <Tag color="default">Chưa thanh toán</Tag>;
                }

                if (record.payment.status === "PENDING") {
                    return <Tag color="gold">Chờ thanh toán</Tag>;
                }

                if (record.payment.status === "FAILED") {
                    return <Tag color="red">Thanh toán lỗi</Tag>;
                }

                return <Tag>{record.payment.status}</Tag>;
            },
        },
    ];

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

    if (!items.length) {
        return (
            <Empty
                description="Không có môn học nào cần thanh toán"
                style={{ marginTop: 80 }}
            >
                <Space>
                    <Button onClick={fetchPayment}>Tải lại</Button>
                    <Button
                        type="primary"
                        onClick={() => navigate("/student/course-registration")}
                    >
                        Quay lại đăng ký môn
                    </Button>
                </Space>
            </Empty>
        );
    }

    return (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <PaymentHeaderCard
                onReload={fetchPayment}
                onBack={() => navigate(-1)}
            />

            <Alert
                type="info"
                showIcon
                message="Danh sách bên dưới gồm các môn đã đăng ký nhưng chưa thanh toán."
                description="Sau khi bấm thanh toán, hệ thống sẽ chuyển sang cổng VNPay."
            />

            <PaymentSummaryCard
                totalItems={items.length}
                totalCredits={totalCredits}
                totalAmount={totalAmount}
                dueDate={dueDate}
            />

            <PaymentCourseTableCard items={items} columns={columns} />

            <PaymentMethodCard
                value={paymentMethod}
                onChange={setPaymentMethod}
                totalAmount={Number(totalAmount || 0)}
                paying={paying}
                onPay={onPay}
                items={items || []}
            />
        </Space>
    );
};

export default PaymentPage;
