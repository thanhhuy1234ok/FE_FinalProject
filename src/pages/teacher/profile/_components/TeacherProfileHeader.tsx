import { UserOutlined, MailOutlined } from "@ant-design/icons";
import { Avatar, Card, Col, Row, Tag, Typography } from "antd";

const { Title, Text } = Typography;

const TeacherProfileHeader = ({ teacher }: any) => {
    const user = teacher?.user;

    return (
        <Card>
            <Row gutter={[24, 24]} align="middle">
                <Col>
                    <Avatar
                        size={120}
                        src={user?.avatar}
                        icon={<UserOutlined />}
                    />
                </Col>

                <Col flex={1}>
                    <Title level={3} style={{ marginBottom: 4 }}>
                        {user?.name || teacher?.fullName || "Giáo viên"}
                    </Title>

                    <Text type="secondary">
                        Mã giáo viên: {teacher?.msgv || teacher?.id}
                    </Text>

                    <div style={{ marginTop: 8 }}>
                        <MailOutlined /> {user?.email || "-"}
                    </div>

                    <div style={{ marginTop: 8 }}>
                        <Tag color="blue">Giáo viên</Tag>
                        {teacher?.department && (
                            <Tag color="processing">
                                {teacher.department.name}
                            </Tag>
                        )}
                    </div>
                </Col>
            </Row>
        </Card>
    );
};

export default TeacherProfileHeader;
