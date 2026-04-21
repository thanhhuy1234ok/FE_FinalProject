import { Avatar, Card, Col, Divider, Row, Space, Tag, Typography } from "antd";
import {
    EnvironmentOutlined,
    IdcardOutlined,
    MailOutlined,
    PhoneOutlined,
    UserOutlined,
} from "@ant-design/icons";

const { Title, Text, Link } = Typography;

interface Props {
    studentInfo?: IUserDetail | null;
    loading?: boolean;
    onViewDetail?: () => void;
}

const InfoRow = ({
    label,
    value,
}: {
    label: string;
    value?: React.ReactNode;
}) => {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "140px 1fr",
                gap: 8,
                alignItems: "start",
            }}
        >
            <Text style={{ color: "#7a8793" }}>{label}</Text>
            <Text strong style={{ color: "#425466" }}>
                {value || "--"}
            </Text>
        </div>
    );
};

const StudentInfoCard = ({ studentInfo, loading, onViewDetail }: Props) => {
    return (
        <Card
            loading={loading}
            bordered={false}
            style={{
                borderRadius: 20,
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
                overflow: "hidden",
            }}
            bodyStyle={{ padding: 0 }}
        >
            <div
                style={{
                    background:
                        "linear-gradient(135deg, #eff6ff 0%, #ffffff 55%, #f8fbff 100%)",
                    padding: 24,
                }}
            >
                <Row justify="space-between" align="middle" gutter={[16, 16]}>
                    <Col>
                        <Space direction="vertical" size={4}>
                            <Title
                                level={2}
                                style={{
                                    margin: 0,
                                    color: "#38556b",
                                }}
                            >
                                Thông tin sinh viên
                            </Title>
                            <Text style={{ color: "#7a8793" }}>
                                Thông tin cá nhân và học tập cơ bản
                            </Text>
                        </Space>
                    </Col>

                    <Col>
                        <Tag
                            color="blue"
                            style={{
                                borderRadius: 999,
                                padding: "6px 12px",
                                fontSize: 13,
                            }}
                        >
                            MSSV: {studentInfo?.student?.mssv || "--"}
                        </Tag>
                    </Col>
                </Row>
            </div>

            <div style={{ padding: 24 }}>
                <Row gutter={[28, 28]} align="middle">
                    <Col xs={24} md={7} lg={6}>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                textAlign: "center",
                                padding: 12,
                            }}
                        >
                            <Avatar
                                size={160}
                                src={studentInfo?.avatar}
                                icon={<UserOutlined />}
                                style={{
                                    boxShadow:
                                        "0 10px 30px rgba(24, 144, 255, 0.18)",
                                    border: "6px solid #fff",
                                }}
                            />

                            <Title
                                level={4}
                                style={{
                                    marginTop: 18,
                                    marginBottom: 4,
                                    color: "#334e68",
                                    textAlign: "center",
                                }}
                            >
                                {studentInfo?.name || "--"}
                            </Title>

                            <Text style={{ color: "#7a8793" }}>
                                {studentInfo?.student?.major?.name ||
                                    "Chưa có ngành học"}
                            </Text>

                            <Link
                                style={{ marginTop: 12, fontWeight: 500 }}
                                onClick={onViewDetail}
                            >
                                Xem chi tiết
                            </Link>
                        </div>
                    </Col>

                    <Col xs={24} md={17} lg={18}>
                        <Row gutter={[24, 20]}>
                            <Col xs={24} lg={12}>
                                <Space
                                    direction="vertical"
                                    size={14}
                                    style={{ width: "100%" }}
                                >
                                    <InfoRow
                                        label="Mã sinh viên"
                                        value={studentInfo?.student?.mssv}
                                    />
                                    <InfoRow
                                        label="Họ và tên"
                                        value={studentInfo?.name}
                                    />
                                    <InfoRow
                                        label="Giới tính"
                                        value={studentInfo?.gender}
                                    />
                                    <InfoRow
                                        label="Ngày sinh"
                                        value={studentInfo?.date_of_birth}
                                    />
                                    {/* <InfoRow
                                        label="Nơi sinh"
                                        value={studentInfo?.birthPlace}
                                    /> */}
                                </Space>
                            </Col>

                            <Col xs={24} lg={12}>
                                <Space
                                    direction="vertical"
                                    size={14}
                                    style={{ width: "100%" }}
                                >
                                    <InfoRow
                                        label="Lớp học"
                                        value={
                                            studentInfo?.student?.adminClass
                                                ?.name
                                        }
                                    />
                                    <InfoRow
                                        label="Khóa học"
                                        value={
                                            studentInfo?.student
                                                ?.yearOfAdmission?.year
                                        }
                                    />
                                    {/* <InfoRow
                                        label="Bậc đào tạo"
                                        value={studentInfo?.student?.educationLevel}
                                    /> */}
                                    {/* <InfoRow
                                        label="Loại hình đào tạo"
                                        value={
                                            studentInfo?.student?.trainingType
                                        }
                                    /> */}
                                    <InfoRow
                                        label="Ngành"
                                        value={
                                            studentInfo?.student?.major?.name
                                        }
                                    />
                                </Space>
                            </Col>
                        </Row>

                        <Divider style={{ margin: "20px 0" }} />

                        <Row gutter={[24, 12]}>
                            <Col xs={24} lg={12}>
                                <Space>
                                    <MailOutlined
                                        style={{ color: "#1890ff" }}
                                    />
                                    <Text style={{ color: "#5b6b79" }}>
                                        {studentInfo?.email || "Chưa có email"}
                                    </Text>
                                </Space>
                            </Col>

                            <Col xs={24} lg={12}>
                                <Space>
                                    <PhoneOutlined
                                        style={{ color: "#1890ff" }}
                                    />
                                    <Text style={{ color: "#5b6b79" }}>
                                        {studentInfo?.phone ||
                                            "Chưa có số điện thoại"}
                                    </Text>
                                </Space>
                            </Col>

                            <Col xs={24}>
                                <Space>
                                    <EnvironmentOutlined
                                        style={{ color: "#1890ff" }}
                                    />
                                    <Text style={{ color: "#5b6b79" }}>
                                        {studentInfo?.address ||
                                            "Chưa có địa chỉ"}
                                    </Text>
                                </Space>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </div>
        </Card>
    );
};

export default StudentInfoCard;
