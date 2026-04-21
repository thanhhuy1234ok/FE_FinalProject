import {
    Button,
    Card,
    Empty,
    Popconfirm,
    Segmented,
    Space,
    Table,
    Tag,
    Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { ReactNode } from "react";

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

export type RegisteredItem = {
    id: number;
    status?: string;
    isPaid?: boolean;
    courseOffering?: {
        id?: number;
        code?: string;
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
};

export type RegisteredCoursesTabProps = {
    registeredData: RegisteredItem[];
    filteredRegisteredData: RegisteredItem[];
    registeredTermOptions: { label: string; value: string }[];
    selectedRegisteredTerm: string;
    loading: boolean;
    submitting: boolean;
    onChangeTerm: (value: string) => void;
    onPayAll: () => void | Promise<void>;
    onPayOne: (record: RegisteredItem) => void | Promise<void>;
    onCancel: (id: number) => void | Promise<void>;
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

const getTermLabel = (term?: { semester?: string; year?: number }) => {
    if (!term) return "—";
    return (
        `${term?.semester ?? ""}${term?.year ? ` - ${term.year}` : ""}`.trim() ||
        "—"
    );
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

const buildColumns = (
    submitting: boolean,
    onPayOne: (record: RegisteredItem) => void | Promise<void>,
    onCancel: (id: number) => void | Promise<void>,
): ColumnsType<RegisteredItem> => [
    {
        title: "Mã LHP",
        key: "code",
        width: 170,
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
        width: 150,
        render: (_, record) =>
            renderDayOfWeek(record?.courseOffering?.schedules),
    },
    {
        title: "Tiết",
        key: "lesson",
        width: 150,
        render: (_, record) => renderLesson(record?.courseOffering?.schedules),
    },
    {
        title: "Giảng viên",
        key: "teacherName",
        width: 180,
        render: (_, record) =>
            record?.courseOffering?.teacherSubject?.teacher?.user?.name || "—",
    },
    {
        title: "Kỳ học",
        key: "term",
        width: 130,
        render: (_, record) => getTermLabel(record?.courseOffering?.term),
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
        title: "Thao tác",
        key: "action",
        width: 140,
        fixed: "right",
        render: (_, record) => (
            <Popconfirm
                title="Bạn chắc chắn muốn hủy đăng ký?"
                onConfirm={() => onCancel(record.id)}
            >
                <Button danger size="small" loading={submitting}>
                    Hủy đăng ký
                </Button>
            </Popconfirm>
        ),
    },
];

const RegisteredCoursesTab = ({
    registeredData,
    filteredRegisteredData,
    registeredTermOptions,
    selectedRegisteredTerm,
    loading,
    submitting,
    onChangeTerm,
    onPayAll,
    onPayOne,
    onCancel,
}: RegisteredCoursesTabProps) => {
    return (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Card size="small">
                <Space
                    style={{ width: "100%", justifyContent: "space-between" }}
                    wrap
                >
                    <Segmented
                        options={registeredTermOptions}
                        value={selectedRegisteredTerm}
                        onChange={(value) => onChangeTerm(String(value))}
                    />

                    <Button
                        type="primary"
                        onClick={onPayAll}
                        disabled={!filteredRegisteredData.length}
                    >
                        Thanh toán tất cả
                    </Button>
                </Space>
            </Card>

            <Card
                title={`Danh sách môn đã đăng ký (${filteredRegisteredData.length}/${registeredData.length})`}
                size="small"
            >
                {filteredRegisteredData.length ? (
                    <Table<RegisteredItem>
                        rowKey="id"
                        bordered
                        loading={loading}
                        size="middle"
                        scroll={{ x: 1500 }}
                        pagination={{ pageSize: 10 }}
                        dataSource={filteredRegisteredData}
                        columns={buildColumns(submitting, onPayOne, onCancel)}
                    />
                ) : (
                    <Empty description="Không có môn học đã đăng ký trong học kỳ này" />
                )}
            </Card>
        </Space>
    );
};

export default RegisteredCoursesTab;
