import { useEffect, useState } from "react";
import {
    Avatar,
    Button,
    Card,
    Col,
    Descriptions,
    Form,
    Input,
    Modal,
    Row,
    Space,
    Spin,
    Tag,
    Typography,
    message,
} from "antd";
import {
    BookOutlined,
    CalendarOutlined,
    EditOutlined,
    HomeOutlined,
    IdcardOutlined,
    MailOutlined,
    PhoneOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { getAccountAPI, getDetailUserAPI } from "@/services/api";
import { useCurrentApp } from "@/context/use.curent";

const { Title, Text } = Typography;

interface IRole {
    id: number;
    name: string;
    description?: string;
    isActive?: boolean;
}

interface IFaculty {
    id: number;
    name: string;
    code?: string;
}

interface IDepartment {
    id: number;
    name: string;
    code?: string;
    faculty?: IFaculty;
}

interface IMajor {
    id: number;
    name: string;
    code?: string;
    department?: IDepartment;
}

interface IAdminClass {
    id: number;
    name: string;
    code?: string;
}

interface IYearOfAdmission {
    id: number;
    year: number;
    code?: string;
}

interface IStudent {
    id: number;
    user_id: string;
    mssv?: string;
    major_id?: number;
    adminClassId?: number;
    yearOfAdmissionId?: number;
    major?: IMajor;
    adminClass?: IAdminClass;
    yearOfAdmission?: IYearOfAdmission;
}

interface IUserProfile {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    gender?: string | null;
    avatar?: string | null;
    isActive?: boolean;
    role?: IRole;
    role_id?: number;
    student?: IStudent | null;
    teacher?: unknown;
    createdAt?: string;
    updatedAt?: string;
}

const StudentProfilePage = () => {
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState<IUserDetail | null>(null);
    const [openEdit, setOpenEdit] = useState(false);
    const [form] = Form.useForm();
    const { user } = useCurrentApp();

    const fetchProfile = async () => {
        try {
            setLoading(true);
            if (!user) {
                return;
            }
            const res = await getDetailUserAPI(user.id);

            if (res.data && res) {
                setProfile(res.data);
            }
        } catch (error) {
            message.error("Không thể tải thông tin cá nhân");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleOpenEdit = () => {
        form.setFieldsValue({
            name: profile?.name ?? "",
            phone: profile?.phone ?? "",
            address: profile?.address ?? "",
        });
        setOpenEdit(true);
    };

    const handleCloseEdit = () => {
        setOpenEdit(false);
        form.resetFields();
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // TODO: gọi API update profile
            console.log("update profile values =", values);

            message.success("Cập nhật thông tin thành công");
            handleCloseEdit();
            fetchProfile();
        } catch {
            //
        }
    };

    const fullName = profile?.name || "Chưa cập nhật";
    const email = profile?.email || "Chưa cập nhật";
    const phone = profile?.phone || "Chưa cập nhật";
    const address = profile?.address || "Chưa cập nhật";
    const gender =
        profile?.gender === "male"
            ? "Nam"
            : profile?.gender === "female"
              ? "Nữ"
              : "Chưa cập nhật";

    const studentCode = profile?.student?.mssv || "Chưa cập nhật";
    const roleName = profile?.role?.name || "STUDENT";

    const majorName = profile?.student?.major?.name || "Chưa cập nhật";
    const majorCode = profile?.student?.major?.code || "Chưa cập nhật";

    const adminClassName =
        profile?.student?.adminClass?.name || "Chưa cập nhật";
    const adminClassCode =
        profile?.student?.adminClass?.code || "Chưa cập nhật";

    const admissionYear =
        profile?.student?.yearOfAdmission?.year || "Chưa cập nhật";
    const admissionCode =
        profile?.student?.yearOfAdmission?.code || "Chưa cập nhật";

    const departmentName =
        profile?.student?.major?.department?.name || "Chưa cập nhật";
    const facultyName =
        profile?.student?.major?.department?.facultyId || "Chưa cập nhật";

    return (
        <Spin spinning={loading}>
            <div style={{ padding: 16 }}>
                <Row gutter={[16, 16]}>
                    <Col xs={24}>
                        <Card
                            bordered={false}
                            style={{
                                borderRadius: 20,
                                boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                            }}
                        >
                            <Row gutter={[24, 24]} align="middle">
                                <Col xs={24} md={16}>
                                    <Space size={16} align="start">
                                        <Avatar
                                            size={88}
                                            src={profile?.avatar || undefined}
                                            icon={
                                                !profile?.avatar ? (
                                                    <UserOutlined />
                                                ) : undefined
                                            }
                                        />
                                        <div>
                                            <Title
                                                level={3}
                                                style={{ margin: 0 }}
                                            >
                                                {fullName}
                                            </Title>

                                            <Space
                                                wrap
                                                size={[8, 8]}
                                                style={{ marginTop: 10 }}
                                            >
                                                <Tag color="blue">
                                                    {roleName}
                                                </Tag>
                                                <Tag
                                                    color={
                                                        profile?.isActive
                                                            ? "green"
                                                            : "red"
                                                    }
                                                >
                                                    {profile?.isActive
                                                        ? "Đang hoạt động"
                                                        : "Ngưng hoạt động"}
                                                </Tag>
                                            </Space>

                                            <Space
                                                direction="vertical"
                                                size={6}
                                                style={{ marginTop: 14 }}
                                            >
                                                <Text>
                                                    <MailOutlined
                                                        style={{
                                                            marginRight: 8,
                                                        }}
                                                    />
                                                    {email}
                                                </Text>
                                                <Text>
                                                    <IdcardOutlined
                                                        style={{
                                                            marginRight: 8,
                                                        }}
                                                    />
                                                    MSSV: {studentCode}
                                                </Text>
                                                <Text>
                                                    <PhoneOutlined
                                                        style={{
                                                            marginRight: 8,
                                                        }}
                                                    />
                                                    {phone}
                                                </Text>
                                            </Space>
                                        </div>
                                    </Space>
                                </Col>

                                <Col xs={24} md={8}>
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "flex-end",
                                            alignItems: "center",
                                            height: "100%",
                                        }}
                                    >
                                        <Button
                                            type="primary"
                                            icon={<EditOutlined />}
                                            onClick={handleOpenEdit}
                                        >
                                            Chỉnh sửa thông tin
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                        </Card>
                    </Col>

                    <Col xs={24} lg={12}>
                        <Card
                            title="Thông tin cá nhân"
                            bordered={false}
                            style={{
                                borderRadius: 20,
                                boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
                                height: "100%",
                            }}
                        >
                            <Descriptions column={1} colon={false}>
                                <Descriptions.Item label="Họ và tên">
                                    {fullName}
                                </Descriptions.Item>
                                <Descriptions.Item label="Email">
                                    {email}
                                </Descriptions.Item>
                                <Descriptions.Item label="Số điện thoại">
                                    {phone}
                                </Descriptions.Item>
                                <Descriptions.Item label="Giới tính">
                                    {gender}
                                </Descriptions.Item>
                                <Descriptions.Item label="Địa chỉ">
                                    {address}
                                </Descriptions.Item>
                                <Descriptions.Item label="Trạng thái">
                                    <Tag
                                        color={
                                            profile?.isActive ? "green" : "red"
                                        }
                                    >
                                        {profile?.isActive
                                            ? "Đang hoạt động"
                                            : "Ngưng hoạt động"}
                                    </Tag>
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </Col>

                    <Col xs={24} lg={12}>
                        <Card
                            title="Thông tin học tập"
                            bordered={false}
                            style={{
                                borderRadius: 20,
                                boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
                                height: "100%",
                            }}
                        >
                            <Descriptions column={1} colon={false}>
                                <Descriptions.Item label="Mã sinh viên">
                                    {studentCode}
                                </Descriptions.Item>
                                <Descriptions.Item label="Chuyên ngành">
                                    {majorName}
                                </Descriptions.Item>
                                <Descriptions.Item label="Mã chuyên ngành">
                                    {majorCode}
                                </Descriptions.Item>
                                <Descriptions.Item label="Lớp hành chính">
                                    {adminClassName}
                                </Descriptions.Item>
                                <Descriptions.Item label="Mã lớp">
                                    {adminClassCode}
                                </Descriptions.Item>
                                <Descriptions.Item label="Năm nhập học">
                                    {admissionYear}
                                </Descriptions.Item>
                                <Descriptions.Item label="Khóa">
                                    {admissionCode}
                                </Descriptions.Item>
                                <Descriptions.Item label="Bộ môn">
                                    {departmentName}
                                </Descriptions.Item>
                                <Descriptions.Item label="Khoa">
                                    {facultyName}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </Col>

                    <Col xs={24}>
                        <Card
                            title="Tóm tắt nhanh"
                            bordered={false}
                            style={{
                                borderRadius: 20,
                                boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
                            }}
                        >
                            <Row gutter={[16, 16]}>
                                <Col xs={24} md={8}>
                                    <Card
                                        size="small"
                                        style={{ borderRadius: 14 }}
                                    >
                                        <Space align="start">
                                            <BookOutlined />
                                            <div>
                                                <Text type="secondary">
                                                    Chuyên ngành
                                                </Text>
                                                <br />
                                                <Text strong>{majorName}</Text>
                                            </div>
                                        </Space>
                                    </Card>
                                </Col>

                                <Col xs={24} md={8}>
                                    <Card
                                        size="small"
                                        style={{ borderRadius: 14 }}
                                    >
                                        <Space align="start">
                                            <HomeOutlined />
                                            <div>
                                                <Text type="secondary">
                                                    Lớp hành chính
                                                </Text>
                                                <br />
                                                <Text strong>
                                                    {adminClassName}
                                                </Text>
                                            </div>
                                        </Space>
                                    </Card>
                                </Col>

                                <Col xs={24} md={8}>
                                    <Card
                                        size="small"
                                        style={{ borderRadius: 14 }}
                                    >
                                        <Space align="start">
                                            <CalendarOutlined />
                                            <div>
                                                <Text type="secondary">
                                                    Năm nhập học
                                                </Text>
                                                <br />
                                                <Text strong>
                                                    {String(admissionYear)}
                                                </Text>
                                            </div>
                                        </Space>
                                    </Card>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>

                <Modal
                    title="Chỉnh sửa thông tin cá nhân"
                    open={openEdit}
                    onCancel={handleCloseEdit}
                    onOk={handleSubmit}
                    okText="Lưu thay đổi"
                    cancelText="Hủy"
                    destroyOnClose
                >
                    <Form form={form} layout="vertical">
                        <Form.Item
                            label="Họ và tên"
                            name="name"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập họ và tên",
                                },
                            ]}
                        >
                            <Input placeholder="Nhập họ và tên" />
                        </Form.Item>

                        <Form.Item label="Số điện thoại" name="phone">
                            <Input placeholder="Nhập số điện thoại" />
                        </Form.Item>

                        <Form.Item label="Địa chỉ" name="address">
                            <Input.TextArea
                                rows={3}
                                placeholder="Nhập địa chỉ hiện tại"
                            />
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </Spin>
    );
};

export default StudentProfilePage;
