import {
    BookOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    DeleteOutlined,
    EyeOutlined,
    HomeOutlined,
    TeamOutlined,
    UploadOutlined,
    UserOutlined,
} from "@ant-design/icons";
import {
    Button,
    Card,
    Col,
    Descriptions,
    Empty,
    Popconfirm,
    Row,
    Space,
    Table,
    Tag,
    Typography,
    message,
} from "antd";
import { dayMap, getFileIcon, statusTextMap } from "../_utils/constants";

const { Text } = Typography;

interface IProps {
    course: any;
    subject: any;
    documents: any[];
    documentLoading: boolean;
    onOpenUpload: () => void;
    onDeleteDocument: (id: number) => void;
}

const CourseInfoTab = ({
    course,
    subject,
    documents,
    documentLoading,
    onOpenUpload,
    onDeleteDocument,
}: IProps) => {
    const getViewUrl = (record: any) => {
        const fileUrl = record?.fileUrl;
        if (!fileUrl) return "";

        const type = record?.fileType?.toLowerCase() || "";
        const name = record?.fileName?.toLowerCase() || "";

        const isPdf = type.includes("pdf") || name.endsWith(".pdf");

        const isOffice =
            type.includes("word") ||
            type.includes("document") ||
            type.includes("presentation") ||
            type.includes("powerpoint") ||
            name.endsWith(".doc") ||
            name.endsWith(".docx") ||
            name.endsWith(".ppt") ||
            name.endsWith(".pptx");

        if (isPdf) return fileUrl;

        if (isOffice) {
            return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
                fileUrl,
            )}`;
        }

        return fileUrl;
    };

    const documentColumns = [
        {
            title: "Tài liệu",
            render: (_: any, record: any) => (
                <Space>
                    {getFileIcon(record.fileType)}
                    <div>
                        <Text strong>{record.title}</Text>
                        <br />
                        <Text type="secondary">{record.fileName}</Text>
                    </div>
                </Space>
            ),
        },
        {
            title: "Dung lượng",
            width: 130,
            render: (_: any, record: any) => {
                const size = Number(record.fileSize || 0);
                if (!size) return "Không rõ";
                return `${(size / 1024 / 1024).toFixed(2)} MB`;
            },
        },
        {
            title: "Ngày upload",
            width: 180,
            render: (_: any, record: any) =>
                record.createdAt
                    ? new Date(record.createdAt).toLocaleString("vi-VN")
                    : "Không rõ",
        },
        {
            title: "Thao tác",
            width: 170,
            align: "center" as const,
            render: (_: any, record: any) => (
                <Space>
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => {
                            const viewUrl = getViewUrl(record);
                            if (!viewUrl) {
                                message.error("Không tìm thấy file");
                                return;
                            }

                            window.open(
                                viewUrl,
                                "_blank",
                                "noopener,noreferrer",
                            );
                        }}
                    >
                        Xem
                    </Button>

                    <Popconfirm
                        title="Xóa tài liệu?"
                        description="Tài liệu sẽ bị xóa khỏi hệ thống."
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                        onConfirm={() => onDeleteDocument(record.id)}
                    >
                        <Button danger type="link" icon={<DeleteOutlined />}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Space direction="vertical" size={20} style={{ width: "100%" }}>
            <Row gutter={[20, 20]}>
                <Col xs={24} lg={16}>
                    <Card
                        title="Thông tin lớp học"
                        style={{ borderRadius: 20 }}
                    >
                        <Descriptions column={1} bordered>
                            <Descriptions.Item
                                label={
                                    <Space>
                                        <BookOutlined />
                                        Môn học
                                    </Space>
                                }
                            >
                                {subject.name} - {subject.code}
                            </Descriptions.Item>

                            <Descriptions.Item
                                label={
                                    <Space>
                                        <TeamOutlined />
                                        Lớp hành chính
                                    </Space>
                                }
                            >
                                {course.adminClass
                                    ? `${course.adminClass.name} (${course.adminClass.code})`
                                    : "Chưa có"}
                            </Descriptions.Item>

                            <Descriptions.Item
                                label={
                                    <Space>
                                        <UserOutlined />
                                        Giáo viên
                                    </Space>
                                }
                            >
                                {course.teacherSubject?.teacher?.user?.name ||
                                    "Chưa có"}
                            </Descriptions.Item>

                            <Descriptions.Item
                                label={
                                    <Space>
                                        <CalendarOutlined />
                                        Học kỳ
                                    </Space>
                                }
                            >
                                {course.term?.semester} - {course.term?.year}
                            </Descriptions.Item>

                            <Descriptions.Item label="Trạng thái">
                                <Tag
                                    color={
                                        course.status === "OPEN"
                                            ? "green"
                                            : "red"
                                    }
                                >
                                    {statusTextMap[course.status] ||
                                        course.status}
                                </Tag>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card title="Lịch học" style={{ borderRadius: 20 }}>
                        <Space
                            direction="vertical"
                            size={12}
                            style={{ width: "100%" }}
                        >
                            {course.schedules?.length ? (
                                course.schedules.map((schedule: any) => (
                                    <Card
                                        key={schedule.id}
                                        size="small"
                                        style={{
                                            borderRadius: 16,
                                            background: "#f5f8ff",
                                        }}
                                    >
                                        <Space direction="vertical" size={4}>
                                            <Text strong>
                                                {dayMap[schedule.dayOfWeek] ||
                                                    "Không rõ ngày"}
                                            </Text>

                                            <Text>
                                                <ClockCircleOutlined /> Tiết{" "}
                                                {schedule.lessonStart} -{" "}
                                                {schedule.lessonEnd}
                                            </Text>

                                            <Text type="secondary">
                                                <HomeOutlined /> Phòng:{" "}
                                                {schedule.room?.name ||
                                                    "Chưa có"}
                                            </Text>
                                        </Space>
                                    </Card>
                                ))
                            ) : (
                                <Empty description="Chưa có lịch học" />
                            )}
                        </Space>
                    </Card>
                </Col>
            </Row>

            <Card
                title={
                    <Space>
                        <UploadOutlined />
                        Tài liệu lớp học
                    </Space>
                }
                extra={
                    <Button
                        type="primary"
                        icon={<UploadOutlined />}
                        onClick={onOpenUpload}
                    >
                        Thêm tài liệu
                    </Button>
                }
                style={{ borderRadius: 20 }}
            >
                <Table
                    rowKey="id"
                    loading={documentLoading}
                    columns={documentColumns}
                    dataSource={documents}
                    pagination={false}
                    scroll={{ x: 800 }}
                    locale={{
                        emptyText: <Empty description="Chưa có tài liệu nào" />,
                    }}
                />
            </Card>
        </Space>
    );
};

export default CourseInfoTab;
