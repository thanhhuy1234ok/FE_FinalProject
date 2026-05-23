import { Card, Progress, Space, Table, Tag, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";

const { Text } = Typography;

interface IProps {
    results: IStudyResult[];
}

const formatScore = (score?: number | string | null) => {
    const value = Number(score);

    if (score === null || score === undefined || Number.isNaN(value)) {
        return "--";
    }

    return value.toFixed(1);
};

const getNumberScore = (score?: number | string | null) => {
    const value = Number(score);
    return Number.isNaN(value) ? 0 : value;
};

const getScoreColor = (score: number) => {
    if (score >= 8) return "#52c41a";
    if (score >= 6.5) return "#1677ff";
    if (score >= 5) return "#faad14";
    return "#ff4d4f";
};

const StudyResultTable = ({ results }: IProps) => {
    const columns: ColumnsType<IStudyResult> = [
        {
            title: "Môn học",
            key: "subject",
            fixed: "left",
            width: 280,
            render: (_, record) => (
                <Space direction="vertical" size={2}>
                    <Text strong>{record.subjectName || "--"}</Text>

                    <Text type="secondary">
                        {record.subjectCode || "--"} • {record.credit || 0} tín
                        chỉ
                    </Text>

                    <Text type="secondary">{record.courseCode || "--"}</Text>
                </Space>
            ),
        },
        {
            title: "Học kỳ",
            key: "term",
            width: 150,
            align: "center",
            render: (_, record) => (
                <Tag color="processing">
                    {record.semester} - {record.year}
                </Tag>
            ),
        },
        {
            title: "Chuyên cần",
            dataIndex: "attendanceScore",
            width: 110,
            align: "center",
            render: (score, record) =>
                record.isPublished ? (
                    <Text strong>{formatScore(score)}</Text>
                ) : (
                    <Tag>0.0</Tag>
                ),
        },
        {
            title: "Giữa kỳ",
            dataIndex: "midtermScore",
            width: 110,
            align: "center",
            render: (score, record) =>
                record.isPublished ? (
                    <Text strong>{formatScore(score)}</Text>
                ) : (
                    <Tag>0.0</Tag>
                ),
        },
        {
            title: "Cuối kỳ",
            dataIndex: "finalScore",
            width: 110,
            align: "center",
            render: (score, record) =>
                record.isPublished ? (
                    <Text strong>{formatScore(score)}</Text>
                ) : (
                    <Tag>0.0</Tag>
                ),
        },
        {
            title: "Tổng kết",
            dataIndex: "totalScore",
            width: 160,
            align: "center",
            render: (score, record) => {
                if (!record.isPublished) {
                    return <Tag color="default">Chưa công bố</Tag>;
                }

                const totalScore = getNumberScore(score);
                const percent = Math.min(Math.max(totalScore * 10, 0), 100);

                return (
                    <Tooltip title={`${formatScore(score)} / 10`}>
                        <Progress
                            type="circle"
                            percent={percent}
                            size={54}
                            strokeColor={getScoreColor(totalScore)}
                            format={() => formatScore(score)}
                        />
                    </Tooltip>
                );
            },
        },
        {
            title: "Điểm chữ",
            dataIndex: "letterGrade",
            width: 110,
            align: "center",
            render: (value, record) => {
                if (!record.isPublished) {
                    return <Tag color="default">Chưa có</Tag>;
                }

                return (
                    <Tag color={record.isPassed ? "green" : "red"}>
                        {value || "F"}
                    </Tag>
                );
            },
        },
        {
            title: "Kết quả",
            key: "result",
            width: 130,
            align: "center",
            render: (_, record) => {
                if (!record.isPublished) {
                    return <Tag color="default">Chưa công bố</Tag>;
                }

                return record.isPassed ? (
                    <Tag color="success">Đạt</Tag>
                ) : (
                    <Tag color="error">Không đạt</Tag>
                );
            },
        },
    ];

    return (
        <Card style={{ borderRadius: 16 }}>
            <Table
                rowKey={(record) => String(record.id)}
                columns={columns}
                dataSource={results || []}
                pagination={{
                    pageSize: 8,
                    showSizeChanger: false,
                }}
                scroll={{ x: 1100 }}
            />
        </Card>
    );
};

export default StudyResultTable;
