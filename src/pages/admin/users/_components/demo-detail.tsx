import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Avatar,
    Button,
    Col,
    Descriptions,
    Divider,
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
} from "@ant-design/icons";
import { ProCard } from "@ant-design/pro-components";
import { getDetailUserAPI } from "@/services/api";

const { Title, Text } = Typography;

function formatGender(g?: any) {
    if (!g) return "N/A";
    if (g === "male") return "Nam";
    if (g === "female") return "Nữ";
    return "Khác";
}

function roleTag(role?: any) {
    console.log(role);
    if (!role) return <Tag>UNKNOWN</Tag>;
    if (role === "ADMIN") return <Tag color="red">ADMIN</Tag>;
    if (role === "TEACHER") return <Tag color="gold">GIẢNG VIÊN</Tag>;
    return <Tag color="blue">SINH VIÊN</Tag>;
}

/** TODO: thay bằng service thật của bạn */
async function fetchUserDetail(id: string) {
    // // ví dụ: return (await api.get(`/users/${id}`)).data
    // await new Promise((r) => setTimeout(r, 400));
    // // MOCK: bạn xoá phần này khi nối API
    // return {
    //     id,
    //     name: "Nguyễn Văn A",
    //     email: "demo@gmail.com",
    //     gender: "male",
    //     phone: "0909 000 111",
    //     address: "123 Nguyễn Trãi, Hà Nội",
    //     avatarUrl: "",
    //     isActive: true,
    //     role: { name: "TEACHER" },
    //     student: {
    //         id: 1,
    //         user_id: id,
    //         mssv: "240001",
    //         major: { id: 1, name: "Công nghệ thông tin" },
    //         adminClass: { id: 5, code: "CTK45", name: "Lớp CTK45" },
    //         yearOfAdmission: { id: 1, year: "2024" },
    //     },
    //     teacher: null,
    // };
    const res = await getDetailUserAPI(id);
    if (!res || !res.data) {
        throw new Error("Failed to fetch user detail");
    }
    console.log(res.data);
    return res.data;
}

/** TODO: thay bằng API thật */
async function toggleActiveUser(_id: string | number, _toActive: boolean) {
    await new Promise((r) => setTimeout(r, 300));
}

/** TODO: thay bằng API thật */
async function deleteUser(_id: string | number) {
    await new Promise((r) => setTimeout(r, 300));
}

export default function UserDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<IUserDetail | null>(null);

    const role = data?.role?.name;

    const headerName = useMemo(() => {
        if (!data) return "Chi tiết người dùng";
        return data.name?.trim() ? data.name : data.email;
    }, [data]);

    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                setLoading(true);
                const res = await fetchUserDetail(id);
                if (res) {
                    setData(res);
                } else {
                    message.error("Không tải được dữ liệu chi tiết.");
                }
            } catch (e) {
                message.error("Không tải được dữ liệu chi tiết.");
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    const onToggleActive = async () => {
        if (!data) return;
        try {
            setLoading(true);
            await toggleActiveUser(data.id, !data.isActive);
            setData({ ...data, isActive: !data.isActive });
            message.success(
                data.isActive ? "Đã khoá tài khoản" : "Đã mở khoá tài khoản",
            );
        } catch {
            message.error("Thao tác thất bại");
        } finally {
            setLoading(false);
        }
    };

    const onDelete = async () => {
        if (!data) return;
        try {
            setLoading(true);
            await deleteUser(data.id);
            message.success("Đã xoá người dùng");
            navigate(-1);
        } catch {
            message.error("Xoá thất bại");
        } finally {
            setLoading(false);
        }
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
                    title="Người dùng đã bị khóa"
                    extra={
                        <Button
                            type="primary"
                            key="console"
                            onClick={() => navigate(-1)}
                        >
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
                    <Col xs={24} lg={12}>
                        <ProCard title="Thông tin cá nhân" bordered>
                            <Descriptions column={1} size="middle">
                                <Descriptions.Item label="Họ tên">
                                    {data.name || "N/A"}
                                </Descriptions.Item>
                                <Descriptions.Item label="Giới tính">
                                    {formatGender(data.gender)}
                                </Descriptions.Item>
                                <Descriptions.Item label="Số điện thoại">
                                    {data.phone || "N/A"}
                                </Descriptions.Item>
                                <Descriptions.Item label="Địa chỉ">
                                    {data.address || "N/A"}
                                </Descriptions.Item>
                            </Descriptions>
                        </ProCard>
                    </Col>

                    <Col xs={24} lg={12}>
                        <ProCard title="Tài khoản" bordered>
                            <Descriptions
                                column={1}
                                size="middle"
                                colon={false}
                            >
                                <Descriptions.Item label="Email:">
                                    {data.email}
                                </Descriptions.Item>
                                <Descriptions.Item label="Vai trò:">
                                    {roleTag(data.role?.name)}
                                </Descriptions.Item>
                                <Descriptions.Item label="Trạng thái:">
                                    {data.isActive ? (
                                        <Tag color="green">Đang hoạt động</Tag>
                                    ) : (
                                        <Tag>Đã khoá</Tag>
                                    )}
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label=" "
                                    className="no-colon-item"
                                >
                                    <div style={{ height: 22 }} />
                                </Descriptions.Item>
                            </Descriptions>
                        </ProCard>
                    </Col>

                    {role === "TEACHER" ? (
                        <Col span={24}>
                            <ProCard title="Thông tin giảng viên" bordered>
                                <Descriptions column={2} size="middle">
                                    <Descriptions.Item label="MSGV">
                                        {data.teacher?.msgv || "N/A"}
                                    </Descriptions.Item>
                                    {/* <Descriptions.Item label="Khoa / Bộ môn">
                                        {data.teacher?.faculty?.name || "N/A"}
                                    </Descriptions.Item> */}
                                    <Descriptions.Item label="Bộ môn">
                                        {data.teacher?.department?.name ||
                                            "N/A"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Học vị">
                                        {data.teacher?.degree || "N/A"}
                                    </Descriptions.Item>
                                </Descriptions>
                            </ProCard>
                        </Col>
                    ) : role === "STUDENT" ? (
                        <Col span={24}>
                            <ProCard title="Thông tin sinh viên" bordered>
                                <Descriptions column={2} size="middle">
                                    <Descriptions.Item label="MSSV">
                                        {data.student?.mssv || "N/A"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Khóa học">
                                        {data.student?.yearOfAdmission?.year ||
                                            "N/A"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Chuyên Ngành">
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
                                    Vai trò ADMIN không có khối thông tin chuyên
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
            children: <>demo</>,
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
                    <Divider />
                    <Text type="secondary">
                        (Tuỳ chọn) Bạn có thể nhúng bảng lịch sử hoạt động / log
                        / lần đăng nhập…
                    </Text>
                </ProCard>
            ),
        },
    ];

    return (
        <div style={{ padding: 16 }}>
            <ProCard bordered bodyStyle={{ padding: 16 }}>
                {/* Header */}
                <Row align="middle" justify="space-between" gutter={[12, 12]}>
                    <Col>
                        <Space size={12} align="center">
                            <Button
                                icon={<ArrowLeftOutlined />}
                                onClick={() => navigate(-1)}
                            >
                                Quay lại
                            </Button>

                            <Avatar
                                size={52}
                                icon={<UserOutlined />}
                                src={data.avatar || undefined}
                            />

                            <div>
                                <Title level={4} style={{ margin: 0 }}>
                                    {headerName}
                                </Title>
                                <Space size={8} wrap>
                                    {roleTag(role)}
                                    {data.isActive ? (
                                        <Tag color="green">Active</Tag>
                                    ) : (
                                        <Tag>Locked</Tag>
                                    )}
                                </Space>
                            </div>
                        </Space>
                    </Col>

                    {/* Actions */}
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

                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                onClick={onDelete}
                            >
                                Xoá
                            </Button>
                        </Space>
                    </Col>
                </Row>

                <Divider style={{ margin: "16px 0" }} />

                {/* Tabs */}
                <Tabs items={items} />
            </ProCard>
        </div>
    );
}
