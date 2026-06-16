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
    Popconfirm,
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
    DeleteOutlined,
    EditOutlined,
    LockOutlined,
    UnlockOutlined,
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

function formatGender(g?: string | null) {
    if (!g) return "N/A";
    if (g === "male") return "Nam";
    if (g === "female") return "Nữ";
    return "Khác";
}

function roleTag(role?: string) {
    if (!role) return <Tag>UNKNOWN</Tag>;
    if (role === "ADMIN") return <Tag color="red">ADMIN</Tag>;
    if (role === "TEACHER") return <Tag color="gold">GIẢNG VIÊN</Tag>;
    if (role === "STUDENT") return <Tag color="blue">SINH VIÊN</Tag>;
    return <Tag>{role}</Tag>;
}

async function toggleActiveUser(_id: string | number, _toActive: boolean) {
    await new Promise((r) => setTimeout(r, 300));
}

async function deleteUser(_id: string | number) {
    await new Promise((r) => setTimeout(r, 300));
}

const UserDetailPageDemo = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [data, setData] = useState<IUserDetail | null>(null);
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
                    setTeachingCourses(teachingRes?.data || []);
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

    const onToggleActive = async () => {
        if (!data) return;

        try {
            setActionLoading(true);
            await toggleActiveUser(data.id, !data.isActive);

            setData((prev) =>
                prev
                    ? {
                          ...prev,
                          isActive: !prev.isActive,
                      }
                    : prev,
            );

            message.success(
                data.isActive ? "Đã khoá tài khoản" : "Đã mở khoá tài khoản",
            );
        } catch (error) {
            message.error("Thao tác thất bại");
        } finally {
            setActionLoading(false);
        }
    };

    const onDelete = async () => {
        if (!data) return;

        try {
            setActionLoading(true);
            await deleteUser(data.id);
            message.success("Đã xoá người dùng");
            navigate(-1);
        } catch (error) {
            message.error("Xoá thất bại");
        } finally {
            setActionLoading(false);
        }
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

        if (!teachingCourses.length) {
            return (
                <Empty
                    description="Giảng viên chưa có môn giảng dạy"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            );
        }

        return (
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                        <ProCard bordered>
                            <Statistic
                                title="Tổng môn"
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

                <ProCard title="Danh sách môn giảng dạy" bordered>
                    <Table
                        rowKey="id"
                        columns={columns}
                        dataSource={teachingCourses}
                        pagination={{ pageSize: 5 }}
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
                                title="Tín chỉ đã học"
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
                    {/* 
                    <Col>
                        <Space wrap>
                            <Button
                                icon={<EditOutlined />}
                                type="primary"
                                onClick={() =>
                                    navigate(`/users/${data.id}/edit`)
                                }
                            >
                                Sửa
                            </Button>

                            <Button
                                loading={actionLoading}
                                icon={
                                    data.isActive ? (
                                        <LockOutlined />
                                    ) : (
                                        <UnlockOutlined />
                                    )
                                }
                                onClick={onToggleActive}
                            >
                                {data.isActive ? "Khoá" : "Mở khoá"}
                            </Button>

                            <Popconfirm
                                title="Xoá người dùng"
                                description="Bạn có chắc chắn muốn xoá người dùng này?"
                                okText="Xoá"
                                cancelText="Huỷ"
                                onConfirm={onDelete}
                            >
                                <Button
                                    danger
                                    loading={actionLoading}
                                    icon={<DeleteOutlined />}
                                >
                                    Xoá
                                </Button>
                            </Popconfirm>
                        </Space>
                    </Col> */}
                </Row>

                <Divider style={{ margin: "16px 0" }} />

                <Tabs items={items} />
            </ProCard>
        </div>
    );
};

export default UserDetailPageDemo;
