import { Tag } from "antd";

interface Props {
    status?: TPaymentStatus;
}

const STATUS_MAP: Record<TPaymentStatus, { color: string; label: string }> = {
    PENDING: {
        color: "gold",
        label: "Chờ thanh toán",
    },
    PAID: {
        color: "green",
        label: "Đã thanh toán",
    },
    OVERDUE: {
        color: "red",
        label: "Quá hạn",
    },
    CANCELLED: {
        color: "default",
        label: "Đã hủy",
    },
};

const PaymentStatusTag = ({ status = "PENDING" }: Props) => {
    const config = STATUS_MAP[status] || STATUS_MAP.PENDING;

    return <Tag color={config.color}>{config.label}</Tag>;
};

export default PaymentStatusTag;
