import { useEffect, useMemo, useState } from "react";
import {
    Button,
    Card,
    Empty,
    Input,
    message,
    Popconfirm,
    Space,
    Spin,
    Table,
    Tabs,
    Tag,
    Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { SearchOutlined } from "@ant-design/icons";
import {
    cancelCourseRegistrationAPI,
    getAvailableCourseOfferingsForStudentAPI,
    getMyCourseRegistrationsAPI,
    registerCourseAPI,
} from "@/services/api";

const { Title, Text } = Typography;

type ScheduleItem = {
    id?: number;
    dayOfWeek?: number;
    lessonStart?: number;
    lessonEnd?: number;
    room?: {
        name?: string;
        code?: string;
    };
};

type AvailableItem = {
    id: number;
    code?: string;
    maxStudents?: number;
    registeredCount?: number;
    remainingSlots?: number;
    alreadyRegistered?: boolean;
    canRegister?: boolean;
    status?: string;
    schedules?: ScheduleItem[];
    term?: {
        semester?: string;
        year?: number;
    };
    adminClass?: {
        code?: string;
        name?: string;
    };
    teacherSubject?: {
        subject?: {
            id?: number;
            code?: string;
            name?: string;
            credits?: number;
        };
        teacher?: {
            user?: {
                name?: string;
            };
        };
    };
};

type RegisteredItem = {
    id: number;
    status?: string;
    courseOffering?: {
        id?: number;
        code?: string;
        schedules?: ScheduleItem[];
        term?: {
            semester?: string;
            year?: number;
        };
        adminClass?: {
            code?: string;
            name?: string;
        };
        teacherSubject?: {
            subject?: {
                id?: number;
                code?: string;
                name?: string;
                credits?: number;
            };
            teacher?: {
                user?: {
                    name?: string;
                };
            };
        };
    };
};

const StudentCourseRegistration = () => {
    const [availableData, setAvailableData] = useState<AvailableItem[]>([]);
    const [registeredData, setRegisteredData] = useState<RegisteredItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [keyword, setKeyword] = useState("");

    const getErrorMessage = (error: any, fallback: string) => {
        const msg =
            error?.response?.data?.message ||
            error?.data?.message ||
            error?.message;

        if (Array.isArray(msg)) return msg.join(", ");
        return msg || fallback;
    };

    const getDayLabel = (dayOfWeek?: number) => {
        switch (dayOfWeek) {
            case 2:
                return "Thứ 2";
            case 3:
                return "Thứ 3";
            case 4:
                return "Thứ 4";
            case 5:
                return "Thứ 5";
            case 6:
                return "Thứ 6";
            case 7:
                return "Thứ 7";
            case 8:
                return "CN";
            default:
                return "—";
        }
    };

    const renderDayOfWeek = (schedules?: ScheduleItem[]) => {
        if (!schedules?.length) return "—";

        return (
            <Space wrap>
                {schedules.map((schedule, index) => (
                    <Tag key={`${schedule?.id ?? index}-day`}>
                        {getDayLabel(schedule?.dayOfWeek)}
                    </Tag>
                ))}
            </Space>
        );
    };

    const renderLesson = (schedules?: ScheduleItem[]) => {
        if (!schedules?.length) return "—";

        return (
            <Space direction="vertical" size={4}>
                {schedules.map((schedule, index) => (
                    <Text key={`${schedule?.id ?? index}-lesson`}>
                        Tiết {schedule?.lessonStart ?? "—"}
                        {schedule?.lessonEnd &&
                        schedule?.lessonEnd !== schedule?.lessonStart
                            ? ` - ${schedule.lessonEnd}`
                            : ""}
                    </Text>
                ))}
            </Space>
        );
    };

    const fetchData = async (searchValue?: string) => {
        try {
            setLoading(true);

            const query = new URLSearchParams({
                current: "1",
                pageSize: "100",
                ...(searchValue?.trim() ? { keyword: searchValue.trim() } : {}),
            }).toString();

            const [availableRes, registeredRes] = await Promise.all([
                getAvailableCourseOfferingsForStudentAPI(query),
                getMyCourseRegistrationsAPI("current=1&pageSize=100"),
            ]);

            const availableList = availableRes?.data?.result ?? [];
            const registeredList =
                registeredRes?.data?.result ?? registeredRes?.result ?? [];

            setAvailableData(Array.isArray(availableList) ? availableList : []);
            setRegisteredData(
                Array.isArray(registeredList) ? registeredList : [],
            );
        } catch (error: any) {
            message.error(getErrorMessage(error, "Không tải được dữ liệu"));
            setAvailableData([]);
            setRegisteredData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const selectedCourses = useMemo(() => {
        const keySet = new Set(selectedRowKeys.map(Number));
        return availableData.filter((item) => keySet.has(item.id));
    }, [availableData, selectedRowKeys]);

    const selectedSubjectIds = useMemo(() => {
        return new Set(
            selectedCourses
                .map((item) => item?.teacherSubject?.subject?.id)
                .filter((id): id is number => !!id),
        );
    }, [selectedCourses]);

    useEffect(() => {
        const validIds = new Set(
            availableData
                .filter(
                    (item) =>
                        !item?.alreadyRegistered &&
                        item?.canRegister !== false &&
                        (item?.remainingSlots ?? 0) > 0,
                )
                .map((item) => item.id),
        );

        setSelectedRowKeys((prev) =>
            prev.filter((key) => validIds.has(Number(key))),
        );
    }, [availableData]);

    const handleSearch = async () => {
        await fetchData(keyword);
    };

    const handleClearSearch = async () => {
        setKeyword("");
        await fetchData("");
    };

    const handleRegisterSelected = async () => {
        if (!selectedRowKeys.length) {
            message.warning("Vui lòng chọn ít nhất 1 môn học");
            return;
        }

        try {
            setSubmitting(true);

            const ids = selectedRowKeys.map(Number);
            const results = await Promise.allSettled(
                ids.map((id) => registerCourseAPI(id)),
            );

            const successCount = results.filter(
                (item) => item.status === "fulfilled",
            ).length;
            const failCount = results.length - successCount;

            if (successCount > 0 && failCount === 0) {
                message.success(`Đăng ký thành công ${successCount} môn học`);
            } else if (successCount > 0) {
                message.warning(
                    `Đăng ký thành công ${successCount} môn, thất bại ${failCount} môn`,
                );
            } else {
                message.error("Đăng ký thất bại");
            }

            setSelectedRowKeys([]);
            await fetchData(keyword);
        } catch (error: any) {
            message.error(getErrorMessage(error, "Đăng ký thất bại"));
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = async (id: number) => {
        try {
            setSubmitting(true);
            await cancelCourseRegistrationAPI(id);
            message.success("Hủy đăng ký thành công");
            await fetchData(keyword);
        } catch (error: any) {
            message.error(getErrorMessage(error, "Hủy đăng ký thất bại"));
        } finally {
            setSubmitting(false);
        }
    };

    const availableColumns: ColumnsType<AvailableItem> = [
        {
            title: "Mã LHP",
            dataIndex: "code",
            key: "code",
            width: 150,
            render: (value) => value || "—",
        },
        {
            title: "Mã môn",
            key: "subjectCode",
            width: 120,
            render: (_, record) => record?.teacherSubject?.subject?.code || "—",
        },
        {
            title: "Tên môn",
            key: "subjectName",
            width: 220,
            render: (_, record) => record?.teacherSubject?.subject?.name || "—",
        },
        {
            title: "Thứ",
            key: "dayOfWeek",
            width: 140,
            render: (_, record) => renderDayOfWeek(record?.schedules),
        },
        {
            title: "Tiết",
            key: "lesson",
            width: 140,
            render: (_, record) => renderLesson(record?.schedules),
        },
        {
            title: "Giảng viên",
            key: "teacherName",
            width: 180,
            render: (_, record) =>
                record?.teacherSubject?.teacher?.user?.name || "—",
        },
        {
            title: "Kỳ học",
            key: "term",
            width: 130,
            render: (_, record) =>
                record?.term
                    ? `${record.term?.semester ?? ""}${record.term?.year ? ` - ${record.term.year}` : ""}`
                    : "—",
        },
        {
            title: "Lớp hành chính",
            key: "adminClass",
            width: 220,
            render: (_, record) =>
                record?.adminClass?.name || record?.adminClass?.code || "—",
        },
        {
            title: "Còn trống",
            key: "remainingSlots",
            width: 110,
            align: "center",
            render: (_, record) => record?.remainingSlots ?? 0,
        },
        {
            title: "Trạng thái",
            key: "status",
            width: 160,
            render: (_, record) => {
                const subjectId = record?.teacherSubject?.subject?.id;
                const isChecked = selectedRowKeys.includes(record.id);
                const isSameSubjectAlreadySelected =
                    !!subjectId &&
                    selectedSubjectIds.has(subjectId) &&
                    !isChecked;

                if (record?.alreadyRegistered) {
                    return <Tag color="blue">Đã đăng ký</Tag>;
                }
                if ((record?.remainingSlots ?? 0) <= 0) {
                    return <Tag color="red">Hết chỗ</Tag>;
                }
                if (record?.canRegister === false) {
                    return <Tag color="orange">Không khả dụng</Tag>;
                }
                if (isSameSubjectAlreadySelected) {
                    return <Tag color="gold">Đã chọn lớp khác</Tag>;
                }
                return <Tag color="green">Có thể chọn</Tag>;
            },
        },
    ];

    const selectedColumns: ColumnsType<AvailableItem> = [
        {
            title: "Mã LHP",
            dataIndex: "code",
            key: "code",
            width: 150,
            render: (value) => value || "—",
        },
        {
            title: "Mã môn",
            key: "subjectCode",
            width: 120,
            render: (_, record) => record?.teacherSubject?.subject?.code || "—",
        },
        {
            title: "Tên môn",
            key: "subjectName",
            width: 220,
            render: (_, record) => record?.teacherSubject?.subject?.name || "—",
        },
        {
            title: "Thứ",
            key: "dayOfWeek",
            width: 140,
            render: (_, record) => renderDayOfWeek(record?.schedules),
        },
        {
            title: "Tiết",
            key: "lesson",
            width: 140,
            render: (_, record) => renderLesson(record?.schedules),
        },
        {
            title: "Giảng viên",
            key: "teacherName",
            width: 180,
            render: (_, record) =>
                record?.teacherSubject?.teacher?.user?.name || "—",
        },
        {
            title: "Lớp hành chính",
            key: "adminClass",
            width: 220,
            render: (_, record) =>
                record?.adminClass?.name || record?.adminClass?.code || "—",
        },
        {
            title: "Còn trống",
            key: "remainingSlots",
            width: 110,
            align: "center",
            render: (_, record) => record?.remainingSlots ?? 0,
        },
        {
            title: "Bỏ chọn",
            key: "remove",
            width: 120,
            render: (_, record) => (
                <Button
                    danger
                    size="small"
                    onClick={() =>
                        setSelectedRowKeys((prev) =>
                            prev.filter((key) => Number(key) !== record.id),
                        )
                    }
                >
                    Xóa
                </Button>
            ),
        },
    ];

    const registeredColumns: ColumnsType<RegisteredItem> = [
        {
            title: "Mã LHP",
            key: "code",
            width: 150,
            render: (_, record) => record?.courseOffering?.code || "—",
        },
        {
            title: "Mã môn",
            key: "subjectCode",
            width: 120,
            render: (_, record) =>
                record?.courseOffering?.teacherSubject?.subject?.code || "—",
        },
        {
            title: "Tên môn",
            key: "subjectName",
            width: 220,
            render: (_, record) =>
                record?.courseOffering?.teacherSubject?.subject?.name || "—",
        },
        {
            title: "Thứ",
            key: "dayOfWeek",
            width: 140,
            render: (_, record) =>
                renderDayOfWeek(record?.courseOffering?.schedules),
        },
        {
            title: "Tiết",
            key: "lesson",
            width: 140,
            render: (_, record) =>
                renderLesson(record?.courseOffering?.schedules),
        },
        {
            title: "Giảng viên",
            key: "teacherName",
            width: 180,
            render: (_, record) =>
                record?.courseOffering?.teacherSubject?.teacher?.user?.name ||
                "—",
        },
        {
            title: "Kỳ học",
            key: "term",
            width: 130,
            render: (_, record) =>
                record?.courseOffering?.term
                    ? `${record.courseOffering.term?.semester ?? ""}${record.courseOffering.term?.year ? ` - ${record.courseOffering.term.year}` : ""}`
                    : "—",
        },
        {
            title: "Lớp hành chính",
            key: "adminClass",
            width: 220,
            render: (_, record) =>
                record?.courseOffering?.adminClass?.name ||
                record?.courseOffering?.adminClass?.code ||
                "—",
        },
        {
            title: "Trạng thái",
            key: "status",
            width: 120,
            render: () => <Tag color="blue">Đã đăng ký</Tag>,
        },
        {
            title: "Thao tác",
            key: "action",
            width: 140,
            fixed: "right",
            render: (_, record) => (
                <Popconfirm
                    title="Bạn chắc chắn muốn hủy đăng ký?"
                    onConfirm={() => handleCancel(record.id)}
                >
                    <Button danger size="small" loading={submitting}>
                        Hủy đăng ký
                    </Button>
                </Popconfirm>
            ),
        },
    ];

    const renderAvailable = () => {
        return (
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <Card size="small">
                    <Space
                        style={{
                            width: "100%",
                            justifyContent: "space-between",
                        }}
                        wrap
                    >
                        <Input
                            allowClear
                            value={keyword}
                            placeholder="Tìm theo mã lớp học phần, mã môn, tên môn, giảng viên..."
                            prefix={<SearchOutlined />}
                            style={{ width: 420, maxWidth: "100%" }}
                            onChange={(e) => setKeyword(e.target.value)}
                            onPressEnter={handleSearch}
                        />

                        <Space wrap>
                            <Button onClick={handleClearSearch}>Xóa lọc</Button>
                            <Button type="primary" onClick={handleSearch}>
                                Tìm kiếm
                            </Button>
                        </Space>
                    </Space>
                </Card>

                <Card
                    title={`Danh sách môn có thể đăng ký (${availableData.length})`}
                    size="small"
                >
                    {availableData.length ? (
                        <Table<AvailableItem>
                            rowKey="id"
                            bordered
                            size="middle"
                            scroll={{ x: 1400 }}
                            pagination={{ pageSize: 10 }}
                            dataSource={availableData}
                            columns={availableColumns}
                            rowSelection={{
                                selectedRowKeys,
                                onChange: (keys) => setSelectedRowKeys(keys),
                                getCheckboxProps: (record) => {
                                    const subjectId =
                                        record?.teacherSubject?.subject?.id;
                                    const isChecked = selectedRowKeys.includes(
                                        record.id,
                                    );

                                    const isSameSubjectAlreadySelected =
                                        !!subjectId &&
                                        selectedSubjectIds.has(subjectId) &&
                                        !isChecked;

                                    return {
                                        disabled:
                                            record?.alreadyRegistered ||
                                            record?.canRegister === false ||
                                            (record?.remainingSlots ?? 0) <=
                                                0 ||
                                            isSameSubjectAlreadySelected,
                                    };
                                },
                            }}
                        />
                    ) : (
                        <Empty description="Không có môn học để đăng ký" />
                    )}
                </Card>

                <Card
                    title={`Danh sách môn đã chọn (${selectedCourses.length})`}
                    size="small"
                    extra={
                        <Space>
                            <Button
                                onClick={() => setSelectedRowKeys([])}
                                disabled={!selectedCourses.length || submitting}
                            >
                                Xóa tất cả
                            </Button>
                            <Button
                                type="primary"
                                onClick={handleRegisterSelected}
                                disabled={!selectedCourses.length || submitting}
                                loading={submitting}
                            >
                                Đăng ký
                            </Button>
                        </Space>
                    }
                >
                    {selectedCourses.length ? (
                        <Table<AvailableItem>
                            rowKey="id"
                            bordered
                            size="middle"
                            scroll={{ x: 1300 }}
                            pagination={false}
                            dataSource={selectedCourses}
                            columns={selectedColumns}
                        />
                    ) : (
                        <Empty description="Chưa chọn môn nào" />
                    )}
                </Card>
            </Space>
        );
    };

    const renderRegistered = () => {
        if (!registeredData.length) {
            return <Empty description="Chưa đăng ký môn học nào" />;
        }

        return (
            <Table<RegisteredItem>
                rowKey="id"
                bordered
                size="middle"
                scroll={{ x: 1400 }}
                pagination={{ pageSize: 10 }}
                dataSource={registeredData}
                columns={registeredColumns}
            />
        );
    };

    return (
        <Card>
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <Title level={3} style={{ margin: 0 }}>
                    Đăng ký môn học
                </Title>
                <Text type="secondary">
                    Tích chọn môn ở bảng trên, môn sẽ xuất hiện ở bảng dưới để
                    bạn xác nhận đăng ký. Mỗi môn chỉ được chọn 1 lớp học phần.
                </Text>

                <Spin spinning={loading}>
                    <Tabs
                        defaultActiveKey="1"
                        items={[
                            {
                                key: "1",
                                label: "Chọn môn đăng ký",
                                children: renderAvailable(),
                            },
                            {
                                key: "2",
                                label: `Môn đã đăng ký (${registeredData.length})`,
                                children: renderRegistered(),
                            },
                        ]}
                    />
                </Spin>
            </Space>
        </Card>
    );
};

export default StudentCourseRegistration;
