import { SaveOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import {
    Avatar,
    Button,
    Card,
    Empty,
    InputNumber,
    Space,
    Table,
    Tag,
    Typography,
} from "antd";
import { statusTextMap } from "../_utils/constants";

const { Text } = Typography;

interface IProps {
    students: any[];
    editingGrades: Record<number, any>;
    gradeLoading: boolean;
    onGradeChange: (
        gradeId: number,
        field: "midtermScore" | "finalScore",
        value: number | null,
    ) => void;
    onSaveGrade: (record: any) => void;
}

const StudentGradeTab = ({
    students,
    editingGrades,
    gradeLoading,
    onGradeChange,
    onSaveGrade,
}: IProps) => {
    const columns = [
        {
            title: "STT",
            width: 55,
            align: "center" as const,
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: "Sinh viên",
            width: 230,
            render: (_: any, record: any) => {
                const user = record?.student?.user;

                return (
                    <Space>
                        <Avatar src={user?.avatar} icon={<UserOutlined />}>
                            {user?.name?.charAt(0)}
                        </Avatar>

                        <div style={{ maxWidth: 150 }}>
                            <Text strong ellipsis>
                                {user?.name || "Chưa có tên"}
                            </Text>
                            <br />
                            <Text type="secondary" ellipsis>
                                {user?.email || "Chưa có email"}
                            </Text>
                        </div>
                    </Space>
                );
            },
        },
        {
            title: "MSSV",
            width: 100,
            render: (_: any, record: any) => record?.student?.mssv || "Chưa có",
        },
        {
            title: "Trạng thái",
            width: 110,
            align: "center" as const,
            render: (_: any, record: any) => (
                <Tag color={record?.status === "REGISTERED" ? "green" : "red"}>
                    {statusTextMap[record?.status] || record?.status}
                </Tag>
            ),
        },
        {
            title: "Chuyên cần",
            width: 80,
            align: "center" as const,
            render: (_: any, record: any) => (
                <Tag color="blue">{record?.grade?.attendanceScore ?? 0}/10</Tag>
            ),
        },
        {
            title: "Giữa kỳ",
            width: 100,
            render: (_: any, record: any) => {
                const grade = record?.grade;

                return (
                    <InputNumber
                        min={0}
                        max={10}
                        step={0.1}
                        style={{ width: 90 }}
                        disabled={!grade?.id}
                        placeholder="0-10"
                        value={
                            editingGrades[grade?.id]?.midtermScore ??
                            grade?.midtermScore
                        }
                        onChange={(value) => {
                            if (!grade?.id) return;
                            onGradeChange(grade.id, "midtermScore", value);
                        }}
                    />
                );
            },
        },
        {
            title: "Cuối kỳ",
            width: 100,
            render: (_: any, record: any) => {
                const grade = record?.grade;

                return (
                    <InputNumber
                        min={0}
                        max={10}
                        step={0.1}
                        style={{ width: 90 }}
                        disabled={!grade?.id}
                        placeholder="0-10"
                        value={
                            editingGrades[grade?.id]?.finalScore ??
                            grade?.finalScore
                        }
                        onChange={(value) => {
                            if (!grade?.id) return;
                            onGradeChange(grade.id, "finalScore", value);
                        }}
                    />
                );
            },
        },
        {
            title: "Tổng",
            width: 90,
            align: "center" as const,
            render: (_: any, record: any) => (
                <Text strong>{record?.grade?.totalScore ?? "Chưa có"}</Text>
            ),
        },
        {
            title: "Loại",
            width: 85,
            align: "center" as const,
            render: (_: any, record: any) => {
                const letter = record?.grade?.letterGrade;

                if (!letter) return <Tag>Chưa</Tag>;

                return (
                    <Tag color={letter === "F" ? "red" : "green"}>{letter}</Tag>
                );
            },
        },
        {
            title: "Kết quả",
            width: 85,
            align: "center" as const,
            render: (_: any, record: any) => {
                const grade = record?.grade;

                if (
                    grade?.totalScore === null ||
                    grade?.totalScore === undefined
                ) {
                    return <Tag>Chưa</Tag>;
                }

                return grade.isPassed ? (
                    <Tag color="green">Đạt</Tag>
                ) : (
                    <Tag color="red">Rớt</Tag>
                );
            },
        },
        {
            title: "",
            width: 90,
            align: "center" as const,
            render: (_: any, record: any) => (
                <Button
                    type="primary"
                    size="small"
                    icon={<SaveOutlined />}
                    loading={gradeLoading}
                    disabled={!record?.grade?.id}
                    onClick={() => onSaveGrade(record)}
                >
                    Lưu
                </Button>
            ),
        },
    ];

    return (
        <Card
            title={
                <Space>
                    <TeamOutlined />
                    Danh sách sinh viên & nhập điểm
                </Space>
            }
            extra={
                <Text type="secondary">
                    {students.length} sinh viên • Chuyên cần tự tính từ điểm
                    danh
                </Text>
            }
            style={{ borderRadius: 20 }}
        >
            <Table
                rowKey="id"
                columns={columns}
                dataSource={students}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: false,
                }}
                locale={{
                    emptyText: (
                        <Empty description="Chưa có sinh viên trong lớp" />
                    ),
                }}
            />
        </Card>
    );
};

export default StudentGradeTab;
