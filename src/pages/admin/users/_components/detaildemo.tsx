import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Avatar,
    Button,
    Card,
    Col,
    Descriptions,
    Divider,
    Empty,
    List,
    Popconfirm,
    Result,
    Row,
    Space,
    Spin,
    Tabs,
    Tag,
    Typography,
    message,
} from "antd";
import {
    ArrowLeftOutlined,
    EditOutlined,
    LockOutlined,
    UnlockOutlined,
    DeleteOutlined,
    UserOutlined,
    BookOutlined,
} from "@ant-design/icons";
import { ProCard } from "@ant-design/pro-components";
import { getDetailUserAPI } from "@/services/api";

const { Title, Text } = Typography;

interface IRole {
    id: number;
    name: "ADMIN" | "TEACHER" | "STUDENT" | string;
    description?: string;
    isActive?: boolean;
}

interface IDepartment {
    id: number;
    name: string;
    code?: string;
    description?: string;
    facultyId?: number;
    isActive?: boolean;
}

interface ISubject {
    id: number;
    name: string;
    code: string;
    credit?: number;
    isActive?: boolean;
    department_id?: number;
}

interface ITeacherSubject {
    id: number;
    teacherId: string;
    subjectId: number;
    createdAt?: string;
    subject?: ISubject;
}

interface ITeacher {
    id: number;
    user_id: string;
    msgv?: string;
    specialization?: string | null;
    degree?: string | null;
    department_id?: number;
    department?: IDepartment | null;
    teacherSubjects?: ITeacherSubject[];
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
    deletedAt?: string | null;
    role?: IRole | null;
    role_id?: number;
    teacher?: ITeacher | null;
    student?: IStudent | null;
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

async function fetchUserDetail(id: string): Promise<IUserDetail> {
    const res = await getDetailUserAPI(id);

    if (!res?.data) {
        throw new Error("Failed to fetch user detail");
    }

    return res.data as IUserDetail;
}

/** TODO: thay bằng API thật */
async function toggleActiveUser(_id: string | number, _toActive: boolean) {
    await new Promise((r) => setTimeout(r, 300));
}

/** TODO: thay bằng API thật */
async function deleteUser(_id: string | number) {
    await new Promise((r) => setTimeout(r, 300));
}

export default function UserDetailPageDemo() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState<boolean>(true);
    const [actionLoading, setActionLoading] = useState<boolean>(false);
    const [data, setData] = useState<IUserDetail | null>(null);

    const role = data?.role?.name;

    const headerName = useMemo(() => {
        if (!data) return "Chi tiết người dùng";
        return data.name?.trim() ? data.name : data.email;
    }, [data]);

    const teacherSubjects = useMemo<ITeacherSubject[]>(() => {
        return data?.teacher?.teacherSubjects ?? [];
    }, [data]);

    useEffect(() => {
        if (!id) return;

        const init = async () => {
            try {
                setLoading(true);
                const res = await fetchUserDetail(id);
                setData(res);
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
        if (!teacherSubjects.length) {
            return (
                <Empty
                    description="Giảng viên chưa được phân công môn học nào"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            );
        }

        return (
            <ProCard title="Môn giảng dạy" bordered>
                <List
                    grid={{
                        gutter: 16,
                        xs: 1,
                        sm: 1,
                        md: 2,
                        lg: 2,
                        xl: 3,
                        xxl: 3,
                    }}
                    dataSource={teacherSubjects}
                    renderItem={(item) => {
                        const subject = item.subject;

                        return (
                            <List.Item>
                                <Card
                                    hoverable
                                    style={{ borderRadius: 12 }}
                                    bodyStyle={{ padding: 16 }}
                                >
                                    <Space
                                        align="start"
                                        size={12}
                                        style={{ width: "100%" }}
                                    >
                                        <Avatar
                                            shape="square"
                                            size={44}
                                            icon={<BookOutlined />}
                                        />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <Text strong ellipsis>
                                                {subject?.name || "N/A"}
                                            </Text>
                                            <br />
                                            <Text type="secondary">
                                                Mã môn: {subject?.code || "N/A"}
                                            </Text>
                                        </div>
                                    </Space>
                                </Card>
                            </List.Item>
                        );
                    }}
                />
            </ProCard>
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
                                        {data.student?.adminClass
                                            ? `${data.student.adminClass.name}`
                                            : "N/A"}
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
                    <ProCard bordered>
                        <Text>Tab học tập của sinh viên sẽ làm sau.</Text>
                    </ProCard>
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
                    </Col>
                </Row>

                <Divider style={{ margin: "16px 0" }} />

                <Tabs items={items} />
            </ProCard>
        </div>
    );
}
