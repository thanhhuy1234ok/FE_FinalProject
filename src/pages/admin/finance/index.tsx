import {
    Button,
    Card,
    Col,
    Descriptions,
    Drawer,
    Input,
    message,
    Modal,
    Row,
    Select,
    Space,
    Statistic,
    Table,
    Tag,
    Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
    DollarOutlined,
    EyeOutlined,
    FileTextOutlined,
    ReloadOutlined,
    SearchOutlined,
    WalletOutlined,
} from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
    bulkUpdatePaymentStatusAPI,
    getAdminPaymentsAPI,
    getTermsAPI,
} from "@/services/api";

const { Text } = Typography;

const PAYMENT_STATUS: Record<string, { text: string; color: string }> = {
    PENDING: { text: "Chờ thanh toán", color: "gold" },
    PAID: { text: "Đã thanh toán", color: "green" },
    FAILED: { text: "Thất bại", color: "red" },
    OVERDUE: { text: "Quá hạn", color: "volcano" },
    CANCELLED: { text: "Đã hủy", color: "default" },
};

const formatMoney = (value?: number | string) => {
    return Number(value || 0).toLocaleString("vi-VN") + " đ";
};

const PaymentManagementPage = () => {
    const [payments, setPayments] = useState<any[]>([]);
    const [terms, setTerms] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [bulkLoading, setBulkLoading] = useState(false);

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<string>();
    const [termId, setTermId] = useState<number>(0);

    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedRows, setSelectedRows] = useState<any[]>([]);

    const [selectedPayment, setSelectedPayment] = useState<any>(null);
    const [openDetail, setOpenDetail] = useState(false);

    const fetchTerms = async () => {
        const res = await getTermsAPI("current=1&pageSize=100");
        setTerms(res.data?.result || []);
    };

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const qs = new URLSearchParams();

            if (search.trim()) qs.append("search", search.trim());
            if (status) qs.append("status", status);
            if (termId !== 0) qs.append("termId", String(termId));

            const res = await getAdminPaymentsAPI(qs.toString());

            setPayments(res.data?.result || res.data || []);
            setSelectedRowKeys([]);
            setSelectedRows([]);
        } catch {
            message.error("Không thể tải danh sách thanh toán");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTerms();
    }, []);

    useEffect(() => {
        fetchPayments();
    }, [status, termId]);

    const handleReset = () => {
        setSearch("");
        setStatus(undefined);
        setTermId(0);
    };

    const handleBulkUpdate = () => {
        if (!selectedRowKeys.length) {
            message.warning("Vui lòng chọn hóa đơn");
            return;
        }

        Modal.confirm({
            title: "Xác nhận thanh toán?",
            content: `Bạn đang chọn ${selectedRowKeys.length} hóa đơn để xác nhận đã thanh toán.`,
            okText: "Xác nhận",
            cancelText: "Hủy",
            async onOk() {
                setBulkLoading(true);
                try {
                    await bulkUpdatePaymentStatusAPI(
                        selectedRowKeys.map(Number),
                        "PAID",
                    );

                    message.success("Cập nhật thanh toán thành công");
                    fetchPayments();
                } catch {
                    message.error("Cập nhật thất bại");
                } finally {
                    setBulkLoading(false);
                }
            },
        });
    };

    const stats = useMemo(() => {
        const paid = payments.filter((x) => x.status === "PAID");
        const pending = payments.filter((x) => x.status === "PENDING");

        return {
            total: payments.length,
            paid: paid.length,
            pending: pending.length,
            revenue: paid.reduce(
                (sum, item) => sum + Number(item.totalAmount || 0),
                0,
            ),
        };
    }, [payments]);

    const termOptions = [
        {
            label: "Tất cả học kỳ",
            value: 0,
        },
        ...terms.map((item: any) => ({
            label:
                item.name ||
                `${item.semester || ""} - ${
                    item.academicYear || item.year || ""
                }`,
            value: item.id,
        })),
    ];

    const canSelectPayment = (record: any) => {
        return record.status !== "PAID" && record.status !== "CANCELLED";
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: (keys: React.Key[], rows: any[]) => {
            setSelectedRowKeys(keys);
            setSelectedRows(rows);
        },
        getCheckboxProps: (record: any) => ({
            disabled: !canSelectPayment(record),
        }),
        selections: [
            {
                key: "select-unpaid",
                text: "Chọn hóa đơn chưa thanh toán",
                onSelect: () => {
                    const selectablePayments =
                        payments.filter(canSelectPayment);

                    setSelectedRowKeys(
                        selectablePayments.map((item) => item.id),
                    );
                    setSelectedRows(selectablePayments);
                },
            },
            Table.SELECTION_INVERT,
            Table.SELECTION_NONE,
        ],
    };

    const columns: ColumnsType<any> = [
        {
            title: "Mã hóa đơn",
            dataIndex: "code",
            width: 190,
            render: (code) => <Text strong>{code}</Text>,
        },
        {
            title: "Sinh viên",
            key: "student",
            width: 220,
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong>
                        {record.student?.user?.name || record.student?.name}
                    </Text>
                    <Text type="secondary">
                        {record.student?.studentCode ||
                            record.student?.mssv ||
                            record.student?.code}
                    </Text>
                </Space>
            ),
        },
        {
            title: "Học kỳ",
            key: "term",
            width: 160,
            render: (_, record) =>
                record.term?.name ||
                `${record.term?.semester || ""} - ${
                    record.term?.academicYear || record.term?.year || ""
                }`,
        },
        {
            title: "Tín chỉ",
            dataIndex: "totalCredits",
            align: "center",
            width: 90,
        },
        {
            title: "Tổng tiền",
            dataIndex: "totalAmount",
            align: "right",
            width: 150,
            render: (value) => <Text strong>{formatMoney(value)}</Text>,
        },
        {
            title: "Phương thức",
            dataIndex: "paymentMethod",
            align: "center",
            width: 130,
            render: (value) => <Tag color="blue">{value || "Chưa có"}</Tag>,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            align: "center",
            width: 150,
            render: (value) => {
                const item = PAYMENT_STATUS[value] || {
                    text: value,
                    color: "default",
                };

                return <Tag color={item.color}>{item.text}</Tag>;
            },
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            width: 160,
            render: (value) => dayjs(value).format("DD/MM/YYYY HH:mm"),
        },
        {
            title: "Thao tác",
            align: "center",
            width: 90,
            render: (_, record) => (
                <Button
                    icon={<EyeOutlined />}
                    onClick={() => {
                        setSelectedPayment(record);
                        setOpenDetail(true);
                    }}
                />
            ),
        },
    ];

    const itemColumns: ColumnsType<any> = [
        {
            title: "Môn học",
            key: "subject",
            render: (_, record) => {
                const subject =
                    record.courseOffering?.teacherSubject?.subject ||
                    record.courseOffering?.subject;

                return (
                    <Space direction="vertical" size={0}>
                        <Text strong>{subject?.name}</Text>
                        <Text type="secondary">{subject?.code}</Text>
                    </Space>
                );
            },
        },
        {
            title: "Tín chỉ",
            key: "credit",
            align: "center",
            width: 100,
            render: (_, record) => {
                const subject =
                    record.courseOffering?.teacherSubject?.subject ||
                    record.courseOffering?.subject;

                return subject?.credit || 0;
            },
        },
        {
            title: "Đơn giá",
            dataIndex: "unitPrice",
            align: "right",
            width: 140,
            render: formatMoney,
        },
        {
            title: "Thành tiền",
            dataIndex: "amount",
            align: "right",
            width: 150,
            render: (value) => <Text strong>{formatMoney(value)}</Text>,
        },
    ];

    return (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng hóa đơn"
                            value={stats.total}
                            prefix={<FileTextOutlined />}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Đã thanh toán"
                            value={stats.paid}
                            valueStyle={{ color: "#52c41a" }}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Chờ thanh toán"
                            value={stats.pending}
                            valueStyle={{ color: "#faad14" }}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Doanh thu"
                            value={stats.revenue}
                            formatter={(value) => formatMoney(Number(value))}
                            prefix={<DollarOutlined />}
                            valueStyle={{ color: "#1677ff" }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card
                title="Quản lý thanh toán"
                extra={
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchPayments}
                        loading={loading}
                    >
                        Làm mới
                    </Button>
                }
            >
                <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
                    <Col xs={24} md={8}>
                        <Input
                            allowClear
                            placeholder="Tìm mã hóa đơn, tên sinh viên, MSSV..."
                            prefix={<SearchOutlined />}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onPressEnter={fetchPayments}
                        />
                    </Col>

                    <Col xs={24} md={5}>
                        <Select
                            allowClear
                            style={{ width: "100%" }}
                            placeholder="Trạng thái"
                            value={status}
                            onChange={setStatus}
                            options={[
                                { label: "Chờ thanh toán", value: "PENDING" },
                                { label: "Đã thanh toán", value: "PAID" },
                                { label: "Thất bại", value: "FAILED" },
                                { label: "Quá hạn", value: "OVERDUE" },
                                { label: "Đã hủy", value: "CANCELLED" },
                            ]}
                        />
                    </Col>

                    <Col xs={24} md={5}>
                        <Select
                            style={{ width: "100%" }}
                            placeholder="Học kỳ"
                            value={termId}
                            onChange={(value) => setTermId(value)}
                            options={termOptions}
                        />
                    </Col>

                    <Col xs={24} md={3}>
                        <Button
                            type="primary"
                            block
                            icon={<SearchOutlined />}
                            onClick={fetchPayments}
                        >
                            Tìm
                        </Button>
                    </Col>

                    <Col xs={24} md={3}>
                        <Button block onClick={handleReset}>
                            Reset
                        </Button>
                    </Col>
                </Row>

                <Row
                    justify="space-between"
                    align="middle"
                    gutter={[12, 12]}
                    style={{ marginBottom: 16 }}
                >
                    <Col>
                        <Space>
                            <Text strong>
                                Đã chọn: {selectedRowKeys.length} hóa đơn
                            </Text>

                            <Button
                                disabled={!selectedRowKeys.length}
                                onClick={() => {
                                    setSelectedRowKeys([]);
                                    setSelectedRows([]);
                                }}
                            >
                                Bỏ chọn
                            </Button>
                        </Space>
                    </Col>

                    <Col>
                        <Space>
                            <Button
                                onClick={() => {
                                    const selectablePayments =
                                        payments.filter(canSelectPayment);

                                    setSelectedRowKeys(
                                        selectablePayments.map(
                                            (item) => item.id,
                                        ),
                                    );
                                    setSelectedRows(selectablePayments);
                                }}
                            >
                                Chọn tất cả chưa thanh toán
                            </Button>

                            <Button
                                type="primary"
                                icon={<WalletOutlined />}
                                disabled={!selectedRowKeys.length}
                                loading={bulkLoading}
                                onClick={handleBulkUpdate}
                            >
                                Xác nhận đã thanh toán
                            </Button>
                        </Space>
                    </Col>
                </Row>

                <Table
                    rowKey="id"
                    rowSelection={rowSelection}
                    loading={loading}
                    columns={columns}
                    dataSource={payments}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                    }}
                />
            </Card>

            <Drawer
                title="Chi tiết hóa đơn"
                open={openDetail}
                onClose={() => setOpenDetail(false)}
                width={800}
            >
                {selectedPayment && (
                    <Space
                        direction="vertical"
                        size={16}
                        style={{ width: "100%" }}
                    >
                        <Descriptions bordered column={1} size="small">
                            <Descriptions.Item label="Mã hóa đơn">
                                <Text strong>{selectedPayment.code}</Text>
                            </Descriptions.Item>

                            <Descriptions.Item label="Sinh viên">
                                {selectedPayment.student?.user?.name ||
                                    selectedPayment.student?.name}
                            </Descriptions.Item>

                            <Descriptions.Item label="MSSV">
                                {selectedPayment.student?.studentCode ||
                                    selectedPayment.student?.mssv ||
                                    selectedPayment.student?.code}
                            </Descriptions.Item>

                            <Descriptions.Item label="Học kỳ">
                                {selectedPayment.term?.name ||
                                    `${selectedPayment.term?.semester || ""} - ${
                                        selectedPayment.term?.academicYear ||
                                        selectedPayment.term?.year ||
                                        ""
                                    }`}
                            </Descriptions.Item>

                            <Descriptions.Item label="Tổng tín chỉ">
                                {selectedPayment.totalCredits}
                            </Descriptions.Item>

                            <Descriptions.Item label="Tổng tiền">
                                <Text strong>
                                    {formatMoney(selectedPayment.totalAmount)}
                                </Text>
                            </Descriptions.Item>

                            <Descriptions.Item label="Trạng thái">
                                <Tag
                                    color={
                                        PAYMENT_STATUS[selectedPayment.status]
                                            ?.color || "default"
                                    }
                                >
                                    {PAYMENT_STATUS[selectedPayment.status]
                                        ?.text || selectedPayment.status}
                                </Tag>
                            </Descriptions.Item>

                            <Descriptions.Item label="Phương thức">
                                {selectedPayment.paymentMethod || "Chưa có"}
                            </Descriptions.Item>

                            <Descriptions.Item label="Ngày tạo">
                                {dayjs(selectedPayment.createdAt).format(
                                    "DD/MM/YYYY HH:mm",
                                )}
                            </Descriptions.Item>
                        </Descriptions>

                        <Table
                            rowKey="id"
                            columns={itemColumns}
                            dataSource={selectedPayment.items || []}
                            pagination={false}
                        />
                    </Space>
                )}
            </Drawer>
        </Space>
    );
};

export default PaymentManagementPage;
