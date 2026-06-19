import { Button, Empty, Select, Space, Table, Tag, Typography } from "antd";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePaymentHistory } from "../../_hooks/usePaymentHistory";

const { Title, Text } = Typography;

const getSemesterOrder = (semester?: string) => {
    if (semester === "HK1") return 1;
    if (semester === "HK2") return 2;
    if (semester === "SUMMER") return 3;
    return 0;
};

const PaymentHistoryPage = () => {
    const navigate = useNavigate();
    const { loading, payments } = usePaymentHistory();
    const [selectedTermId, setSelectedTermId] = useState<string>();

    const termOptions = useMemo(() => {
        const map = new Map<string, any>();

        payments.forEach((payment: any) => {
            const term = payment.term;
            const termId = String(term?.id ?? "unknown");

            if (!map.has(termId)) {
                map.set(termId, {
                    value: termId,
                    label: term
                        ? `${term.year} - ${term.semester}${
                              term.isActive ? " (Đang hoạt động)" : ""
                          }`
                        : "Không xác định học kỳ",
                    year: Number(term?.year || 0),
                    semester: term?.semester,
                    isActive: !!term?.isActive,
                });
            }
        });

        return Array.from(map.values()).sort((a, b) => {
            if (a.isActive !== b.isActive) {
                return Number(b.isActive) - Number(a.isActive);
            }

            if (a.year !== b.year) {
                return b.year - a.year;
            }

            return getSemesterOrder(b.semester) - getSemesterOrder(a.semester);
        });
    }, [payments]);

    const currentTermId = selectedTermId || termOptions[0]?.value;

    const filteredPayments = useMemo(() => {
        return payments.filter((payment: any) => {
            const termId = String(payment.term?.id ?? "unknown");
            return termId === currentTermId;
        });
    }, [payments, currentTermId]);

    const registeredSubjects = useMemo(() => {
        return filteredPayments.flatMap((payment: any) => {
            return (payment.items || []).map((item: any) => {
                const subject = item.subject;
                const courseOffering = item.courseOffering;
                const teacher = item.teacher;

                return {
                    id: item.id,
                    paymentCode: payment.code,
                    paymentStatus: payment.status,
                    paymentMethod: payment.paymentMethod,
                    paidAt: payment.paidAt,

                    subjectCode: subject?.code || "-",
                    subjectName: subject?.name || "-",
                    credits: Number(item.credits || subject?.credit || 0),

                    courseCode: courseOffering?.code || "-",
                    teacherName: teacher?.fullName || "-",

                    amount: Number(item.amount || 0),
                };
            });
        });
    }, [filteredPayments]);

    const totalCredits = registeredSubjects.reduce(
        (sum: number, item: any) => sum + Number(item.credits || 0),
        0,
    );

    const totalAmount = registeredSubjects.reduce(
        (sum: number, item: any) => sum + Number(item.amount || 0),
        0,
    );

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
                <Space direction="vertical" size={8} style={{ width: "100%" }}>
                    <Title level={3} style={{ margin: 0 }}>
                        Lịch sử thanh toán
                    </Title>

                    <Text type="secondary">
                        Chọn học kỳ để xem chi tiết các môn học đã thanh toán.
                    </Text>

                    <Select
                        style={{ width: 320 }}
                        placeholder="Chọn học kỳ"
                        value={currentTermId}
                        options={termOptions}
                        onChange={setSelectedTermId}
                        disabled={termOptions.length === 0}
                    />
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
                {payments.length === 0 && !loading ? (
                    <Empty description="Chưa có phiếu thanh toán nào đã hoàn tất">
                        <Button
                            type="primary"
                            onClick={() => navigate("/payment")}
                        >
                            Đi đến trang thanh toán
                        </Button>
                    </Empty>
                ) : registeredSubjects.length === 0 ? (
                    <Empty description="Không có môn học trong học kỳ này" />
                ) : (
                    <Table
                        rowKey="id"
                        loading={loading}
                        dataSource={registeredSubjects}
                        pagination={false}
                        columns={[
                            {
                                title: "Mã môn",
                                dataIndex: "subjectCode",
                                align: "center",
                            },
                            {
                                title: "Tên môn học",
                                dataIndex: "subjectName",
                            },
                            {
                                title: "Lớp học phần",
                                dataIndex: "courseCode",
                                align: "center",
                            },
                            {
                                title: "Giảng viên",
                                dataIndex: "teacherName",
                            },
                            {
                                title: "Số tín chỉ",
                                dataIndex: "credits",
                                align: "center",
                            },
                            {
                                title: "Số tiền",
                                dataIndex: "amount",
                                align: "right",
                                render: (value: number) =>
                                    `${Number(value || 0).toLocaleString(
                                        "vi-VN",
                                    )} đ`,
                            },
                            {
                                title: "Trạng thái",
                                dataIndex: "paymentStatus",
                                align: "center",
                                render: (status: string) => (
                                    <Tag color="green">{status}</Tag>
                                ),
                            },
                        ]}
                        summary={() => (
                            <Table.Summary.Row>
                                <Table.Summary.Cell index={0} colSpan={4}>
                                    <b>Tổng cộng</b>
                                </Table.Summary.Cell>

                                <Table.Summary.Cell index={4} align="center">
                                    <b>{totalCredits}</b>
                                </Table.Summary.Cell>

                                <Table.Summary.Cell index={5} align="right">
                                    <b>
                                        {totalAmount.toLocaleString("vi-VN")} đ
                                    </b>
                                </Table.Summary.Cell>

                                <Table.Summary.Cell index={6} />
                            </Table.Summary.Row>
                        )}
                    />
                )}
            </div>
        </Space>
    );
};

export default PaymentHistoryPage;
