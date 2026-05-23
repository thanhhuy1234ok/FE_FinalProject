import { Descriptions, Modal, Table, Typography } from "antd";
import type { PaymentCourseItem } from "../_hooks/usePaymentPage";

const { Text } = Typography;

type Props = {
    open: boolean;
    loading?: boolean;
    items: any[];
    totalAmount: number;
    onCancel: () => void;
    onConfirm: () => void | Promise<void>;
};

const formatCurrency = (value?: number | string) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(Number(value || 0));

const PaymentConfirmModal = ({
    open,
    loading = false,
    items,
    totalAmount,
    onCancel,
    onConfirm,
}: Props) => {
    const totalCredits = items.reduce(
        (sum, item) => sum + Number(item.subject?.credit || 0),
        0,
    );

    return (
        <Modal
            open={open}
            title="Xác nhận thanh toán học phí"
            width={900}
            centered
            okText="Thanh toán qua VNPay"
            cancelText="Hủy"
            confirmLoading={loading}
            onCancel={onCancel}
            onOk={onConfirm}
        >
            <Descriptions
                bordered
                size="small"
                column={2}
                style={{ marginBottom: 16 }}
            >
                <Descriptions.Item label="Số môn">
                    {items.length}
                </Descriptions.Item>

                <Descriptions.Item label="Tổng tín chỉ">
                    {totalCredits}
                </Descriptions.Item>

                <Descriptions.Item label="Tổng tiền">
                    <Text strong type="danger">
                        {formatCurrency(totalAmount)}
                    </Text>
                </Descriptions.Item>
            </Descriptions>

            <Table<PaymentCourseItem>
                rowKey="id"
                size="small"
                pagination={false}
                dataSource={items}
                columns={[
                    {
                        title: "Mã môn",
                        render: (_, record) => record.courseCode ?? "-",
                    },
                    {
                        title: "Tên môn học",
                        render: (_, record) => record.subject.name ?? "-",
                    },
                    {
                        title: "Tín chỉ",
                        dataIndex: ["subject", "credit"],
                        align: "center",
                    },
                    {
                        title: "Đơn giá",
                        align: "right",
                        render: (_, record) => formatCurrency(record.unitPrice),
                    },
                    {
                        title: "Thành tiền",
                        align: "right",
                        render: (_, record) => (
                            <Text strong>{formatCurrency(record.amount)}</Text>
                        ),
                    },
                ]}
            />

            <div style={{ textAlign: "right", marginTop: 16 }}>
                <Text strong style={{ fontSize: 18 }}>
                    Tổng thanh toán: {formatCurrency(totalAmount)}
                </Text>
            </div>
        </Modal>
    );
};

export default PaymentConfirmModal;
