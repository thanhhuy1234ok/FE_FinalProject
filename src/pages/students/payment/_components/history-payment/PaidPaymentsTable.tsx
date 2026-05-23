import { Button, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

interface Props {
    data: IPayment[];
}

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(Number(value || 0));

const semesterLabel = (semester?: string) => {
    switch (semester) {
        case "HK1":
            return "Học kỳ 1";
        case "HK2":
            return "Học kỳ 2";
        case "SUMMER":
            return "Học kỳ hè";
        default:
            return semester || "--";
    }
};

const paymentMethodLabel = (method?: string | null) => {
    switch (method) {
        case "BANK_TRANSFER":
            return "Chuyển khoản";
        case "MOMO":
            return "MoMo";
        case "CASH":
            return "Tiền mặt";
        default:
            return "--";
    }
};

const PaidPaymentsTable = ({ data }: Props) => {
    const navigate = useNavigate();

    const columns: ColumnsType<IPayment> = [
        {
            title: "STT",
            width: 70,
            align: "center",
            render: (_value, _record, index) => index + 1,
        },
        {
            title: "Mã phiếu",
            dataIndex: "code",
            width: 180,
            render: (value) => <Text strong>{value}</Text>,
        },
        {
            title: "Học kỳ",
            key: "term",
            width: 180,
            render: (_, record) =>
                `${semesterLabel(record?.term?.semester)} - ${record?.term?.year ?? "--"}`,
        },
        {
            title: "Tổng tín chỉ",
            dataIndex: "totalCredits",
            width: 120,
            align: "center",
        },
        {
            title: "Tổng tiền",
            dataIndex: "totalAmount",
            width: 160,
            align: "right",
            render: (value) => <Text strong>{formatCurrency(value)}</Text>,
        },
        {
            title: "Phương thức",
            dataIndex: "paymentMethod",
            width: 150,
            render: (value) => paymentMethodLabel(value),
        },
        {
            title: "Ngày thanh toán",
            dataIndex: "paidAt",
            width: 170,
            render: (value) =>
                value ? dayjs(value).format("HH:mm DD/MM/YYYY") : "--",
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            width: 130,
            align: "center",
            render: () => <Tag color="green">Đã thanh toán</Tag>,
        },
        {
            title: "Thao tác",
            key: "action",
            width: 140,
            align: "center",
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        onClick={() => navigate(`/payment/${record.id}`)}
                    >
                        Xem chi tiết
                    </Button>
                </Space>
            ),
        },
    ];
    console.log(data);
    return (
        <Table<IPayment>
            rowKey="id"
            bordered
            columns={columns}
            dataSource={data}
            loading={false}
            pagination={{
                pageSize: 10,
                showSizeChanger: false,
            }}
            scroll={{ x: 1200 }}
        />
    );
};

export default PaidPaymentsTable;
