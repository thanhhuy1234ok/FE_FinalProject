import {
    Button,
    Card,
    Empty,
    Input,
    message,
    Space,
    Table,
    Tag,
    Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { SearchOutlined } from "@ant-design/icons";
import type { Key, ReactNode } from "react";
import WeeklySchedulePreview from "../WeeklySchedulePreview";
import type { RegisteredItem } from "./registeredCourse";
import { checkRegisterCourseConflictAPI } from "@/services/api";

const { Text } = Typography;

export type ScheduleItem = {
    id?: number;
    dayOfWeek?: number;
    lessonStart?: number;
    lessonEnd?: number;
    room?: {
        name?: string;
        code?: string;
    };
};

export type AvailableItem = {
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
        id?: number;
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

export type RegistrationTabProps = {
    availableData: AvailableItem[];
    registeredData: RegisteredItem[];
    selectedCourses: AvailableItem[];
    selectedRowKeys: Key[];
    selectedSubjectIds: Set<number>;
    keyword: string;
    loading: boolean;
    submitting: boolean;
    onKeywordChange: (value: string) => void;
    onSearch: () => void;
    onClearSearch: () => void;
    onSelectChange: (keys: Key[]) => void;
    onRemoveSelected: (id: number) => void;
    onClearAllSelected: () => void;
    onRegisterSelected: () => void | Promise<void>;
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

const renderDayOfWeek = (schedules?: ScheduleItem[]): ReactNode => {
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

const renderLesson = (schedules?: ScheduleItem[]): ReactNode => {
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

const buildAvailableColumns = (
    selectedRowKeys: Key[],
    selectedSubjectIds: Set<number>,
): ColumnsType<AvailableItem> => [
    {
        title: "Mã LHP",
        dataIndex: "code",
        key: "code",
        width: 170,
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
        width: 150,
        render: (_, record) => renderDayOfWeek(record?.schedules),
    },
    {
        title: "Tiết",
        key: "lesson",
        width: 150,
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
        width: 170,
        render: (_, record) => {
            const subjectId = record?.teacherSubject?.subject?.id;
            const isChecked = selectedRowKeys.includes(record.id);
            const isSameSubjectAlreadySelected =
                !!subjectId && selectedSubjectIds.has(subjectId) && !isChecked;

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

const buildSelectedColumns = (
    onRemoveSelected: (id: number) => void,
): ColumnsType<AvailableItem> => [
    {
        title: "Mã LHP",
        dataIndex: "code",
        key: "code",
        width: 170,
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
        width: 150,
        render: (_, record) => renderDayOfWeek(record?.schedules),
    },
    {
        title: "Tiết",
        key: "lesson",
        width: 150,
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
                onClick={() => onRemoveSelected(record.id)}
            >
                Xóa
            </Button>
        ),
    },
];

const RegistrationTab = ({
    availableData,
    registeredData,
    selectedCourses,
    selectedRowKeys,
    selectedSubjectIds,
    keyword,
    loading,
    submitting,
    onKeywordChange,
    onSearch,
    onClearSearch,
    onSelectChange,
    onRemoveSelected,
    onClearAllSelected,
    onRegisterSelected,
}: RegistrationTabProps) => {
    return (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Card size="small">
                <Space
                    style={{ width: "100%", justifyContent: "space-between" }}
                    wrap
                >
                    <Input
                        allowClear
                        value={keyword}
                        placeholder="Tìm theo mã lớp học phần, mã môn, tên môn, giảng viên..."
                        prefix={<SearchOutlined />}
                        style={{ width: 420, maxWidth: "100%" }}
                        onChange={(e) => onKeywordChange(e.target.value)}
                        onPressEnter={onSearch}
                    />

                    <Space wrap>
                        <Button onClick={onClearSearch}>Xóa lọc</Button>
                        <Button type="primary" onClick={onSearch}>
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
                        loading={loading}
                        size="middle"
                        scroll={{ x: 1500 }}
                        pagination={{ pageSize: 10 }}
                        dataSource={availableData}
                        columns={buildAvailableColumns(
                            selectedRowKeys,
                            selectedSubjectIds,
                        )}
                        rowSelection={{
                            selectedRowKeys,
                            preserveSelectedRowKeys: true,
                            onSelect: async (record, selected) => {
                                if (!selected) {
                                    onSelectChange(
                                        selectedRowKeys.filter(
                                            (key) => key !== record.id,
                                        ),
                                    );
                                    return;
                                }

                                try {
                                    const res =
                                        await checkRegisterCourseConflictAPI(
                                            record.id,
                                            selectedRowKeys.map((key) =>
                                                Number(key),
                                            ),
                                        );

                                    const data =
                                        res?.data ??
                                        res?.data?.data ??
                                        res?.data ??
                                        res;

                                    const result = data?.data ?? data;

                                    if (!result?.canRegister) {
                                        message.error(
                                            result?.message ||
                                                "Môn học bị trùng lịch",
                                        );
                                        return;
                                    }

                                    onSelectChange([
                                        ...selectedRowKeys,
                                        record.id,
                                    ]);
                                } catch (error: any) {
                                    let msg =
                                        error?.response?.data?.message ||
                                        error?.message ||
                                        "Kiểm tra trùng lịch thất bại";

                                    if (Array.isArray(msg)) msg = msg[0];

                                    message.error(msg);
                                }
                            },
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
                                        (record?.remainingSlots ?? 0) <= 0 ||
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
                            onClick={onClearAllSelected}
                            disabled={!selectedCourses.length || submitting}
                        >
                            Xóa tất cả
                        </Button>
                        <Button
                            type="primary"
                            onClick={onRegisterSelected}
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
                        scroll={{ x: 1350 }}
                        pagination={false}
                        dataSource={selectedCourses}
                        columns={buildSelectedColumns(onRemoveSelected)}
                    />
                ) : (
                    <Empty description="Chưa chọn môn nào" />
                )}
            </Card>

            <WeeklySchedulePreview
                selectedCourses={selectedCourses}
                registeredCourses={registeredData}
            />
        </Space>
    );
};

export default RegistrationTab;
