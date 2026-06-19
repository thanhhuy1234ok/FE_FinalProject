import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Avatar,
    Button,
    Card,
    Col,
    Descriptions,
    Divider,
    Empty,
    Progress,
    Result,
    Row,
    Space,
    Spin,
    Statistic,
    Table,
    Tabs,
    Tag,
    Typography,
    message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
    ArrowLeftOutlined,
    BarChartOutlined,
    BookOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { ProCard } from "@ant-design/pro-components";
import {
    getDetailUserAPI,
    getStudentLearningOverviewAPI,
    getTeacherTeachingOverviewAPI,
} from "@/services/api";

const { Title, Text } = Typography;

interface IRole {
    id: number;
    name: "ADMIN" | "TEACHER" | "STUDENT" | string;
}

interface IDepartment {
    id: number;
    name: string;
    code?: string;
}

interface IStudent {
    id?: number;
    user_id?: string;
    mssv?: string;
    major?: {
        id: number;
        name: string;
    } | null;
    adminClass?: {
        id: number;
        code: string;
        name?: string;
    } | null;
    yearOfAdmission?: {
        id: number;
        year: string | number;
    } | null;
}

interface ITeacher {
    id: number;
    user_id: string;
    msgv?: string;
    specialization?: string | null;
    degree?: string | null;
    department?: IDepartment | null;
}

interface IUserDetail {
    id: string;
    name: string;
    email: string;
    gender?: string | null;
    phone?: string | null;
    address?: string | null;
    avatar?: string | null;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
    role?: IRole | null;
    teacher?: ITeacher | null;
    student?: IStudent | null;
}

interface ITeacherSubject {
    id: number;
    subjectId: number;
    subjectName: string;
    subjectCode: string;
    credit: number;
}

interface ITeachingCourse {
    id: number;
    code: string;
    subjectName: string;
    subjectCode: string;
    credit: number;
    termName: string;
    year: number;
    status: "OPEN" | "CLOSED" | string;
    totalStudents: number;
}

interface IStudentGrade {
    id: number;
    subjectName: string;
    subjectCode: string;
    credit: number;
    termName: string;
    year: number;
    attendanceScore: number;
    midtermScore: number;
    finalScore: number;
    totalScore: number;
    letterGrade?: string | null;
    isPassed: boolean;
    isPublished: boolean;
}

interface IStudentLearningOverview {
    totalCredits: number;
    passedCredits: number;
    gpa: number;
    progressPercent: number;
    grades: IStudentGrade[];
}

interface ITeacherTeachingOverview {
    teacherSubjects: ITeacherSubject[];
    courses: ITeachingCourse[];
}

function formatGender(g?: string | null) {
    if (!g) return "N/A";
    if (g === "MALE") return "Nam";
    if (g === "FEMALE") return "Nữ";
    return "Khác";
}

function roleTag(role?: string) {
    if (!role) return <Tag>UNKNOWN</Tag>;
    if (role === "ADMIN") return <Tag color="red">ADMIN</Tag>;
    if (role === "TEACHER") return <Tag color="gold">GIẢNG VIÊN</Tag>;
    if (role === "STUDENT") return <Tag color="blue">SINH VIÊN</Tag>;
    return <Tag>{role}</Tag>;
}

const UserDetailPageDemo = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<IUserDetail | null>(null);

    const [teacherSubjects, setTeacherSubjects] = useState<ITeacherSubject[]>(
        [],
    );

    const [teachingCourses, setTeachingCourses] = useState<ITeachingCourse[]>(
        [],
    );

    const [learningOverview, setLearningOverview] =
        useState<IStudentLearningOverview | null>(null);

    const role = data?.role?.name;

    const headerName = useMemo(() => {
        if (!data) return "Chi tiết người dùng";
        return data.name?.trim() ? data.name : data.email;
    }, [data]);

    useEffect(() => {
        if (!id) return;

        const init = async () => {
            try {
                setLoading(true);

                setTeacherSubjects([]);
                setTeachingCourses([]);
                setLearningOverview(null);

                const res = await getDetailUserAPI(id);

                if (!res?.data) {
                    throw new Error("Failed to fetch user detail");
                }

                const user = res.data as IUserDetail;
                setData(user);

                if (user.role?.name === "TEACHER") {
                    const teachingRes = await getTeacherTeachingOverviewAPI(
                        user.id,
                    );

                    const overview =
                        teachingRes?.data as ITeacherTeachingOverview;

                    setTeacherSubjects(overview?.teacherSubjects || []);
                    setTeachingCourses(overview?.courses || []);
                }

                if (user.role?.name === "STUDENT") {
                    const learningRes = await getStudentLearningOverviewAPI(
                        user.id,
                    );

                    setLearningOverview(learningRes?.data || null);
                }
            } catch (error) {
                message.error("Không tải được dữ liệu chi tiết.");
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [id]);

    const renderTeacherSubjectsCard = () => {
        return (
            <ProCard title="Môn giảng dạy được phân công" bordered>
                {teacherSubjects.length ? (
                    <Row gutter={[12, 12]}>
                        {teacherSubjects.map((item) => (
                            <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
                                <Card
                                    size="small"
                                    bordered
                                    style={{
                                        height: "100%",
                                        borderRadius: 12,
                                    }}
                                    bodyStyle={{
                                        height: "100%",
                                    }}
                                >
                                    <Space
                                        direction="vertical"
                                        size={6}
                                        style={{ width: "100%" }}
                                    >
                                        <Text strong ellipsis>
                                            {item.subjectName || "N/A"}
                                        </Text>

                                        <Text type="secondary">
                                            Mã môn: {item.subjectCode || "N/A"}
                                        </Text>

                                        <Tag color="blue">
                                            {item.credit || 0} tín chỉ
                                        </Tag>
                                    </Space>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <Empty
                        description="Chưa có môn giảng dạy"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                )}
            </ProCard>
        );
    };

    const renderTeacherTeachingInfo = () => {
        const currentCourses = teachingCourses.filter(
            (item) => item.status === "OPEN",
        );

        const oldCourses = teachingCourses.filter(
            (item) => item.status !== "OPEN",
        );

        const columns: ColumnsType<ITeachingCourse> = [
            {
                title: "Môn học",
                render: (_, record) => (
                    <Space direction="vertical" size={0}>
                        <Text strong>{record.subjectName}</Text>

                        <Text type="secondary">
                            {record.subjectCode} • {record.credit} tín chỉ
                        </Text>
                    </Space>
                ),
            },
            {
                title: "Lớp học phần",
                dataIndex: "code",
            },
            {
                title: "Học kỳ",
                render: (_, record) => `${record.termName} - ${record.year}`,
            },
            {
                title: "Sinh viên",
                dataIndex: "totalStudents",
                align: "center",
            },
            {
                title: "Trạng thái",
                align: "center",
                render: (_, record) =>
                    record.status === "OPEN" ? (
                        <Tag color="green">Đang dạy</Tag>
                    ) : (
                        <Tag>Đã dạy</Tag>
                    ),
            },
        ];

        return (
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
                {renderTeacherSubjectsCard()}

                <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                        <ProCard bordered>
                            <Statistic
                                title="Tổng lớp học phần"
                                value={teachingCourses.length}
                                prefix={<BookOutlined />}
                            />
                        </ProCard>
                    </Col>

                    <Col xs={24} md={8}>
                        <ProCard bordered>
                            <Statistic
                                title="Đang dạy"
                                value={currentCourses.length}
                                prefix={<ClockCircleOutlined />}
                                valueStyle={{ color: "#52c41a" }}
                            />
                        </ProCard>
                    </Col>

                    <Col xs={24} md={8}>
                        <ProCard bordered>
                            <Statistic
                                title="Đã dạy"
                                value={oldCourses.length}
                                prefix={<CheckCircleOutlined />}
                            />
                        </ProCard>
                    </Col>
                </Row>

                <ProCard title="Danh sách lớp học phần đã phụ trách" bordered>
                    <Table
                        rowKey="id"
                        columns={columns}
                        dataSource={teachingCourses}
                        pagination={{ pageSize: 5 }}
                        locale={{
                            emptyText: "Giảng viên chưa phụ trách lớp học phần",
                        }}
                    />
                </ProCard>
            </Space>
        );
    };

    const renderStudentLearningInfo = () => {
        const grades = learningOverview?.grades || [];

        const columns: ColumnsType<IStudentGrade> = [
            {
                title: "Môn học",
                render: (_, record) => (
                    <Space direction="vertical" size={0}>
                        <Text strong>{record.subjectName}</Text>

                        <Text type="secondary">
                            {record.subjectCode} • {record.credit} tín chỉ
                        </Text>
                    </Space>
                ),
            },
            {
                title: "Học kỳ",
                render: (_, record) => `${record.termName} - ${record.year}`,
            },
            {
                title: "Quá trình",
                dataIndex: "attendanceScore",
                align: "center",
            },
            {
                title: "Giữa kỳ",
                dataIndex: "midtermScore",
                align: "center",
            },
            {
                title: "Cuối kỳ",
                dataIndex: "finalScore",
                align: "center",
            },
            {
                title: "Tổng kết",
                align: "center",
                render: (_, record) =>
                    record.isPublished ? (
                        <Text strong>{record.totalScore}</Text>
                    ) : (
                        <Tag>Chưa công bố</Tag>
                    ),
            },
            {
                title: "Kết quả",
                align: "center",
                render: (_, record) =>
                    !record.isPublished ? (
                        <Tag>Chưa có</Tag>
                    ) : record.isPassed ? (
                        <Tag color="green">Đạt</Tag>
                    ) : (
                        <Tag color="red">Không đạt</Tag>
                    ),
            },
        ];

        return (
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={6}>
                        <ProCard bordered>
                            <Statistic
                                title="Tổng tín chỉ"
                                value={learningOverview?.totalCredits || 0}
                            />
                        </ProCard>
                    </Col>

                    <Col xs={24} md={6}>
                        <ProCard bordered>
                            <Statistic
                                title="Tín chỉ đạt"
                                value={learningOverview?.passedCredits || 0}
                                valueStyle={{ color: "#52c41a" }}
                            />
                        </ProCard>
                    </Col>

                    <Col xs={24} md={6}>
                        <ProCard bordered>
                            <Statistic
                                title="GPA"
                                value={learningOverview?.gpa || 0}
                                precision={2}
                                prefix={<BarChartOutlined />}
                            />
                        </ProCard>
                    </Col>

                    <Col xs={24} md={6}>
                        <ProCard bordered>
                            <Statistic
                                title="Tiến trình"
                                value={learningOverview?.progressPercent || 0}
                                suffix="%"
                            />
                        </ProCard>
                    </Col>
                </Row>

                <ProCard title="Tiến trình học tập" bordered>
                    <Progress
                        percent={learningOverview?.progressPercent || 0}
                        status="active"
                    />
                </ProCard>

                <ProCard title="Bảng điểm" bordered>
                    <Table
                        rowKey="id"
                        columns={columns}
                        dataSource={grades}
                        pagination={{ pageSize: 5 }}
                        locale={{
                            emptyText: "Chưa có dữ liệu điểm",
                        }}
                    />
                </ProCard>
            </Space>
        );
    };

    if (loading && !data) {
        return (
            <div style={{ padding: 24 }}>
                <Spin />
            </div>
        );
    }

    if (!data) {
        return (
            <div style={{ padding: 24, textAlign: "center" }}>
                <Result
                    status="warning"
                    title="Không tìm thấy người dùng"
                    extra={
                        <Button type="primary" onClick={() => navigate(-1)}>
                            Quay lại
                        </Button>
                    }
                />
            </div>
        );
    }

    const items = [
        {
            key: "overview",
            label: "Tổng quan",
            children: (
                <Row gutter={[16, 16]}>
                    <Col xs={24} lg={8}>
                        <ProCard bordered>
                            <Space
                                direction="vertical"
                                align="center"
                                style={{ width: "100%" }}
                                size={12}
                            >
                                <Avatar
                                    size={80}
                                    icon={<UserOutlined />}
                                    src={data.avatar || undefined}
                                />

                                <div style={{ textAlign: "center" }}>
                                    <Title level={4} style={{ margin: 0 }}>
                                        {headerName}
                                    </Title>

                                    <Space size={8} wrap>
                                        {roleTag(role)}

                                        {data.isActive ? (
                                            <Tag color="green">
                                                Đang hoạt động
                                            </Tag>
                                        ) : (
                                            <Tag>Đã khoá</Tag>
                                        )}
                                    </Space>
                                </div>
                            </Space>
                        </ProCard>
                    </Col>

                    <Col xs={24} lg={16}>
                        <ProCard title="Thông tin chung" bordered>
                            <Descriptions
                                column={2}
                                size="middle"
                                labelStyle={{ fontWeight: 500 }}
                            >
                                <Descriptions.Item label="Họ tên">
                                    {data.name || "N/A"}
                                </Descriptions.Item>

                                <Descriptions.Item label="Email">
                                    {data.email || "N/A"}
                                </Descriptions.Item>

                                <Descriptions.Item label="Giới tính">
                                    {formatGender(data.gender)}
                                </Descriptions.Item>

                                <Descriptions.Item label="Số điện thoại">
                                    {data.phone || "N/A"}
                                </Descriptions.Item>

                                <Descriptions.Item label="Địa chỉ" span={2}>
                                    {data.address || "N/A"}
                                </Descriptions.Item>
                            </Descriptions>
                        </ProCard>
                    </Col>

                    {role === "TEACHER" ? (
                        <Col span={24}>
                            <ProCard title="Thông tin giảng viên" bordered>
                                <Descriptions
                                    column={2}
                                    size="middle"
                                    labelStyle={{ fontWeight: 500 }}
                                >
                                    <Descriptions.Item label="MSGV">
                                        {data.teacher?.msgv || "N/A"}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Bộ môn">
                                        {data.teacher?.department?.name ||
                                            "N/A"}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Học vị">
                                        {data.teacher?.degree || "N/A"}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Chuyên môn">
                                        {data.teacher?.specialization || "N/A"}
                                    </Descriptions.Item>
                                </Descriptions>
                            </ProCard>
                        </Col>
                    ) : role === "STUDENT" ? (
                        <Col span={24}>
                            <ProCard title="Thông tin sinh viên" bordered>
                                <Descriptions
                                    column={2}
                                    size="middle"
                                    labelStyle={{ fontWeight: 500 }}
                                >
                                    <Descriptions.Item label="MSSV">
                                        {data.student?.mssv || "N/A"}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Khoá học">
                                        {data.student?.yearOfAdmission?.year ||
                                            "N/A"}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Chuyên ngành">
                                        {data.student?.major?.name || "N/A"}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Lớp">
                                        {data.student?.adminClass?.name ||
                                            data.student?.adminClass?.code ||
                                            "N/A"}
                                    </Descriptions.Item>
                                </Descriptions>
                            </ProCard>
                        </Col>
                    ) : (
                        <Col span={24}>
                            <ProCard bordered>
                                <Text>
                                    Vai trò ADMIN không có thông tin chuyên
                                    biệt.
                                </Text>
                            </ProCard>
                        </Col>
                    )}
                </Row>
            ),
        },
        {
            key: "roleInfo",
            label:
                role === "TEACHER"
                    ? "Giảng dạy"
                    : role === "STUDENT"
                      ? "Học tập"
                      : "Theo vai trò",
            children:
                role === "TEACHER" ? (
                    renderTeacherTeachingInfo()
                ) : role === "STUDENT" ? (
                    renderStudentLearningInfo()
                ) : (
                    <ProCard bordered>
                        <Text>ADMIN không có dữ liệu theo vai trò.</Text>
                    </ProCard>
                ),
        },
        {
            key: "audit",
            label: "Nhật ký",
            children: (
                <ProCard title="Thông tin hệ thống" bordered>
                    <Descriptions column={2} size="middle">
                        <Descriptions.Item label="Tạo lúc">
                            {data.createdAt
                                ? new Date(data.createdAt).toLocaleString()
                                : "N/A"}
                        </Descriptions.Item>

                        <Descriptions.Item label="Cập nhật">
                            {data.updatedAt
                                ? new Date(data.updatedAt).toLocaleString()
                                : "N/A"}
                        </Descriptions.Item>
                    </Descriptions>
                </ProCard>
            ),
        },
    ];

    return (
        <div style={{ padding: 16 }}>
            <ProCard bordered bodyStyle={{ padding: 16 }}>
                <Row align="middle" justify="space-between" gutter={[12, 12]}>
                    <Col flex="auto">
                        <Space size={12} align="center" wrap>
                            <Button
                                icon={<ArrowLeftOutlined />}
                                onClick={() => navigate(-1)}
                            >
                                Quay lại
                            </Button>

                            <div>
                                <Title level={4} style={{ margin: 0 }}>
                                    {headerName}
                                </Title>

                                <Text type="secondary">
                                    Chi tiết thông tin người dùng
                                </Text>
                            </div>
                        </Space>
                    </Col>
                </Row>

                <Divider style={{ margin: "16px 0" }} />

                <Tabs items={items} />
            </ProCard>
        </div>
    );
};

export default UserDetailPageDemo;
