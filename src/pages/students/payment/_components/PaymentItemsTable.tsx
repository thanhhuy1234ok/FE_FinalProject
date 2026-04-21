import { Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";

const { Text } = Typography;

interface Props {
    data: IPaymentItem[];
}

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(Number(value || 0));

const PaymentItemsTable = ({ data }: Props) => {
    const columns: ColumnsType<IPaymentItem> = [
        {
            title: "STT",
            width: 70,
            align: "center",
            render: (_value, _record, index) => index + 1,
        },
        {
            title: "Mã lớp học phần",
            dataIndex: ["courseOffering", "code"],
            width: 180,
            render: (value) => <Text strong>{value}</Text>,
        },
        {
            title: "Môn học",
            key: "subject",
            render: (_, record) => {
                const subject = record?.courseOffering?.teacherSubject?.subject;

                return (
                    <div>
                        <div style={{ fontWeight: 600 }}>
                            {subject?.name || "--"}
                        </div>
                        <Text type="secondary">{subject?.code || ""}</Text>
                    </div>
                );
            },
        },
        {
            title: "Lớp",
            key: "adminClass",
            width: 180,
            render: (_, record) => {
                const adminClass = record?.courseOffering?.adminClass;

                return (
                    <span>
                        {adminClass
                            ? `${adminClass.code} - ${adminClass.name}`
                            : "--"}
                    </span>
                );
            },
        },
        {
            title: "Số tín chỉ",
            dataIndex: "credits",
            width: 110,
            align: "center",
        },
        {
            title: "Đơn giá",
            dataIndex: "unitPrice",
            width: 140,
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
            dataIndex: "status",
            width: 130,
            align: "center",
            render: (status) =>
                status === "ACTIVE" ? (
                    <Tag color="processing">Đang tính phí</Tag>
                ) : (
                    <Tag>Đã hủy</Tag>
                ),
        },
    ];

    return (
        <Table
            rowKey="id"
            bordered
            columns={columns}
            dataSource={data}
            pagination={false}
            scroll={{ x: 1200 }}
        />
    );
};

export default PaymentItemsTable;
